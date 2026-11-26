const { db } = require('../config/database');

function getStudents(req, res, next) {
  try {
    const { status, campus, grade, search } = req.query;
    let query = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (campus && campus !== 'All campuses') {
      query += ' AND (campus = ? OR campus = "All campuses")';
      params.push(campus);
    }
    if (grade && grade !== 'All') {
      query += ' AND grade = ?';
      params.push(grade);
    }
    if (search) {
      query += ' AND (name LIKE ? OR parent LIKE ? OR phone LIKE ? OR id LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY id ASC';
    const students = db.prepare(query).all(...params);

    // Compute live balance for each student dynamically
    const enriched = students.map(s => {
      const feeRow = db.prepare('SELECT sum(amount - paid) as bal FROM fees WHERE student = ?').get(s.name);
      const balance = feeRow && feeRow.bal != null ? feeRow.bal : s.balance;
      return {
        ...s,
        balance
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (err) {
    next(err);
  }
}

function getStudentById(req, res, next) {
  try {
    const { id } = req.params;
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!student) {
      return res.status(404).json({ success: false, message: `Student ${id} not found` });
    }

    // Invoices
    const invoices = db.prepare('SELECT * FROM fees WHERE student = ? ORDER BY due DESC').all(student.name);
    const balance = invoices.reduce((acc, inv) => acc + (inv.amount - inv.paid), 0);

    // Attendance marks
    const marks = db.prepare('SELECT day_idx, status FROM attendance WHERE student_id = ? ORDER BY day_idx ASC').all(id);

    // Library loans
    const libraryLoans = db.prepare('SELECT * FROM library WHERE student = ?').all(student.name);

    res.json({
      success: true,
      data: {
        ...student,
        balance,
        invoices,
        attendanceMarks: marks,
        libraryLoans
      }
    });
  } catch (err) {
    next(err);
  }
}

function createStudent(req, res, next) {
  try {
    const { name, grade, section = 'A', roll = '01', parent, phone, status = 'Active', campus = 'Main Campus', balance = 0 } = req.body;
    if (!name || !parent || !phone) {
      return res.status(400).json({ success: false, message: 'Name, parent, and phone are required' });
    }

    const last = db.prepare("SELECT id FROM students WHERE id LIKE 'ST-%' ORDER BY id DESC LIMIT 1").get();
    let nextNum = 1107;
    if (last) {
      const parsed = parseInt(last.id.replace('ST-', ''), 10);
      if (!isNaN(parsed)) nextNum = parsed + 1;
    }
    const id = `ST-${nextNum}`;

    db.prepare(`
      INSERT INTO students (id, name, grade, section, roll, parent, phone, status, campus, attendance, balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '100%', ?)
    `).run(id, name, grade || 'Grade 1', section, roll, parent, phone, status, campus, balance);

    // Seed 5 days initial attendance
    const insertAtt = db.prepare('INSERT OR REPLACE INTO attendance (student_id, day_idx, status) VALUES (?, ?, ?)');
    for (let i = 0; i < 5; i++) {
      insertAtt.run(id, i, 'Present');
    }

    const created = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: created
    });
  } catch (err) {
    next(err);
  }
}

function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Student ${id} not found` });
    }

    const {
      name = existing.name,
      grade = existing.grade,
      section = existing.section,
      roll = existing.roll,
      parent = existing.parent,
      phone = existing.phone,
      status = existing.status,
      campus = existing.campus,
      attendance = existing.attendance,
      balance = existing.balance
    } = req.body;

    db.prepare(`
      UPDATE students
      SET name = ?, grade = ?, section = ?, roll = ?, parent = ?, phone = ?, status = ?, campus = ?, attendance = ?, balance = ?
      WHERE id = ?
    `).run(name, grade, section, roll, parent, phone, status, campus, attendance, balance, id);

    const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM students WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: `Student ${id} not found` });
    }
    db.prepare('DELETE FROM attendance WHERE student_id = ?').run(id);
    res.json({ success: true, message: `Student ${id} removed` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
