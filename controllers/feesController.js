const { db } = require('../config/database');

function getFees(req, res, next) {
  try {
    const { status, campus, search } = req.query;
    let query = 'SELECT * FROM fees WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (campus && campus !== 'All campuses') {
      query += ' AND (campus = ? OR campus = "All campuses")';
      params.push(campus);
    }
    if (search) {
      query += ' AND (student LIKE ? OR id LIKE ? OR type LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY due DESC';
    const fees = db.prepare(query).all(...params);

    // Summary cards
    const summaryRow = db.prepare('SELECT sum(amount) as billed, sum(paid) as collected FROM fees').get();
    const billed = summaryRow.billed || 0;
    const collected = summaryRow.collected || 0;

    res.json({
      success: true,
      summary: {
        totalBilled: billed,
        totalCollected: collected,
        totalOutstanding: billed - collected,
        collectionRate: billed > 0 ? ((collected / billed) * 100).toFixed(1) + '%' : '100%'
      },
      count: fees.length,
      data: fees
    });
  } catch (err) {
    next(err);
  }
}

function getFeeById(req, res, next) {
  try {
    const { id } = req.params;
    const fee = db.prepare('SELECT * FROM fees WHERE id = ?').get(id);
    if (!fee) {
      return res.status(404).json({ success: false, message: `Invoice ${id} not found` });
    }

    // Associated payments
    const payments = db.prepare('SELECT * FROM payments WHERE invoice_id = ? ORDER BY created_at DESC').all(id);

    // Student phone & parent
    const student = db.prepare('SELECT phone, parent FROM students WHERE name = ?').get(fee.student);

    res.json({
      success: true,
      data: {
        ...fee,
        balance: fee.amount - fee.paid,
        parent: student ? student.parent : 'Parent/Guardian',
        phone: student ? student.phone : '',
        payments
      }
    });
  } catch (err) {
    next(err);
  }
}

function createFee(req, res, next) {
  try {
    const { student, grade, type = 'Tuition Fee', amount, due, campus = 'Main Campus' } = req.body;
    if (!student || !amount || !due) {
      return res.status(400).json({ success: false, message: 'Student, amount, and due date are required' });
    }

    const year = new Date().getFullYear();
    const last = db.prepare("SELECT id FROM fees WHERE id LIKE 'INV-%' ORDER BY rowid DESC LIMIT 1").get();
    let nextNum = 307;
    if (last) {
      const parts = last.id.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num)) nextNum = num + 1;
    }
    let id = `INV-${year}-${nextNum}`;
    while (db.prepare('SELECT id FROM fees WHERE id = ?').get(id)) {
      nextNum++;
      id = `INV-${year}-${nextNum}`;
    }

    db.prepare(`
      INSERT INTO fees (id, student, grade, type, amount, paid, due, status, campus)
      VALUES (?, ?, ?, ?, ?, 0, ?, 'Overdue', ?)
    `).run(id, student, grade || 'Grade 8', type, parseFloat(amount), due, campus);

    // Update student balance
    updateStudentBalance(student);

    const created = db.prepare('SELECT * FROM fees WHERE id = ?').get(id);
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: created
    });
  } catch (err) {
    next(err);
  }
}

function recordPayment(req, res, next) {
  try {
    const { id } = req.params;
    const { amount, paymentMode = 'UPI', notes = 'Counter fee collection' } = req.body;

    const fee = db.prepare('SELECT * FROM fees WHERE id = ?').get(id);
    if (!fee) {
      return res.status(404).json({ success: false, message: `Invoice ${id} not found` });
    }

    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than 0' });
    }

    const newPaid = Math.min(fee.amount, fee.paid + payAmount);
    const newStatus = newPaid >= fee.amount ? 'Paid' : 'Partial';

    // Insert payment record
    const receiptNo = `REC-${Date.now().toString().slice(-6)}`;
    const paymentId = `PAY-${Date.now()}`;
    db.prepare(`
      INSERT INTO payments (id, invoice_id, student, amount, payment_mode, receipt_no, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(paymentId, id, fee.student, payAmount, paymentMode, receiptNo, notes);

    // Update fee record
    db.prepare('UPDATE fees SET paid = ?, status = ? WHERE id = ?').run(newPaid, newStatus, id);

    // Update student balance
    updateStudentBalance(fee.student);

    const updated = db.prepare('SELECT * FROM fees WHERE id = ?').get(id);

    res.json({
      success: true,
      message: `Payment of ₹${payAmount} recorded successfully`,
      receipt: {
        receiptNo,
        invoiceId: id,
        student: fee.student,
        amount: payAmount,
        paymentMode,
        timestamp: new Date().toISOString(),
        remainingBalance: updated.amount - updated.paid,
        status: newStatus
      },
      fee: updated
    });
  } catch (err) {
    next(err);
  }
}

function quickPay(req, res, next) {
  try {
    const { id } = req.params;
    const { type = 'full', paymentMode = 'UPI' } = req.body;

    const fee = db.prepare('SELECT * FROM fees WHERE id = ?').get(id);
    if (!fee) {
      return res.status(404).json({ success: false, message: `Invoice ${id} not found` });
    }

    const remaining = fee.amount - fee.paid;
    if (remaining <= 0) {
      return res.status(400).json({ success: false, message: 'This invoice is already fully settled' });
    }

    const payAmount = type === 'half' ? Math.round(remaining / 2) : remaining;

    return recordPayment(
      {
        params: { id },
        body: {
          amount: payAmount,
          paymentMode,
          notes: `1-Click Quick Pay (${type === 'half' ? 'Half Balance' : 'Full Settle'})`
        }
      },
      res,
      next
    );
  } catch (err) {
    next(err);
  }
}

function deleteFee(req, res, next) {
  try {
    const { id } = req.params;
    const fee = db.prepare('SELECT student FROM fees WHERE id = ?').get(id);
    const result = db.prepare('DELETE FROM fees WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: `Invoice ${id} not found` });
    }
    if (fee) updateStudentBalance(fee.student);
    res.json({ success: true, message: `Invoice ${id} deleted` });
  } catch (err) {
    next(err);
  }
}

function updateStudentBalance(studentName) {
  const sumRow = db.prepare('SELECT sum(amount - paid) as bal FROM fees WHERE student = ?').get(studentName);
  const bal = sumRow && sumRow.bal != null ? Math.max(0, sumRow.bal) : 0;
  db.prepare('UPDATE students SET balance = ? WHERE name = ?').run(bal, studentName);
}

module.exports = {
  getFees,
  getFeeById,
  createFee,
  recordPayment,
  quickPay,
  deleteFee
};
