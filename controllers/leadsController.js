const { db } = require('../config/database');

function getLeads(req, res, next) {
  try {
    const { stage, campus, search } = req.query;
    let query = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (stage && stage !== 'All') {
      query += ' AND stage = ?';
      params.push(stage);
    }
    if (campus && campus !== 'All campuses') {
      query += ' AND (campus = ? OR campus = "All campuses")';
      params.push(campus);
    }
    if (search) {
      query += ' AND (name LIKE ? OR parent LIKE ? OR phone LIKE ? OR id LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY created_at DESC';
    const leads = db.prepare(query).all(...params);

    res.json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (err) {
    next(err);
  }
}

function getLeadById(req, res, next) {
  try {
    const { id } = req.params;
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    if (!lead) {
      return res.status(404).json({ success: false, message: `Lead ${id} not found` });
    }
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
}

function createLead(req, res, next) {
  try {
    const { name, grade, parent, phone, source = 'Website', stage = 'New enquiry', owner = 'Neha Patel', next: next_action = 'Today', campus = 'Main Campus' } = req.body;
    if (!name || !parent || !phone) {
      return res.status(400).json({ success: false, message: 'Name, parent, and phone are required' });
    }

    // Generate AD-XXXX ID
    const last = db.prepare("SELECT id FROM leads WHERE id LIKE 'AD-%' ORDER BY id DESC LIMIT 1").get();
    let nextNum = 2408;
    if (last) {
      const parsed = parseInt(last.id.replace('AD-', ''), 10);
      if (!isNaN(parsed)) nextNum = parsed + 1;
    }
    const id = `AD-${nextNum}`;

    db.prepare(`
      INSERT INTO leads (id, name, grade, parent, phone, source, stage, owner, next_action, campus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, grade || 'Grade 1', parent, phone, source, stage, owner, next_action, campus);

    const created = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: created
    });
  } catch (err) {
    next(err);
  }
}

function updateLead(req, res, next) {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Lead ${id} not found` });
    }

    const {
      name = existing.name,
      grade = existing.grade,
      parent = existing.parent,
      phone = existing.phone,
      source = existing.source,
      stage = existing.stage,
      owner = existing.owner,
      next_action = existing.next_action,
      campus = existing.campus
    } = req.body;

    db.prepare(`
      UPDATE leads
      SET name = ?, grade = ?, parent = ?, phone = ?, source = ?, stage = ?, owner = ?, next_action = ?, campus = ?
      WHERE id = ?
    `).run(name, grade, parent, phone, source, stage, owner, next_action, campus, id);

    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

function updateStage(req, res, next) {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const allowed = ['New enquiry', 'Contacted', 'School visit', 'Application', 'Admitted'];
    if (!allowed.includes(stage)) {
      return res.status(400).json({ success: false, message: `Invalid stage. Allowed: ${allowed.join(', ')}` });
    }

    const result = db.prepare('UPDATE leads SET stage = ? WHERE id = ?').run(stage, id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: `Lead ${id} not found` });
    }

    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    res.json({
      success: true,
      message: `Lead advanced to stage '${stage}'`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

function enrolLead(req, res, next) {
  try {
    const { id } = req.params;
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    if (!lead) {
      return res.status(404).json({ success: false, message: `Lead ${id} not found` });
    }

    // Generate ST-XXXX ID
    const lastStudent = db.prepare("SELECT id FROM students WHERE id LIKE 'ST-%' ORDER BY id DESC LIMIT 1").get();
    let nextNum = 1107;
    if (lastStudent) {
      const parsed = parseInt(lastStudent.id.replace('ST-', ''), 10);
      if (!isNaN(parsed)) nextNum = parsed + 1;
    }
    const studentId = `ST-${nextNum}`;

    // Split grade into grade & section
    const gradeParts = (lead.grade || 'Grade 1 A').split(' ');
    const grade = gradeParts[0] + (gradeParts[1] ? ' ' + gradeParts[1] : '');
    const section = gradeParts[2] || 'A';
    const roll = String(Math.floor(Math.random() * 20) + 10).padStart(2, '0');

    // Insert student
    db.prepare(`
      INSERT INTO students (id, name, grade, section, roll, parent, phone, status, campus, attendance, balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', ?, '100%', 18500)
    `).run(studentId, lead.name, grade, section, roll, lead.parent, lead.phone, lead.campus);

    // Create initial tuition invoice with guaranteed unique ID
    let invNum = Math.floor(Math.random() * 9000) + 1000;
    let invId = `INV-2026-${invNum}`;
    while (db.prepare('SELECT id FROM fees WHERE id = ?').get(invId)) {
      invNum = Math.floor(Math.random() * 9000) + 1000;
      invId = `INV-2026-${invNum}`;
    }
    db.prepare(`
      INSERT INTO fees (id, student, grade, type, amount, paid, due, status, campus)
      VALUES (?, ?, ?, 'Term 1 tuition', 18500, 0, date('now', '+15 days'), 'Overdue', ?)
    `).run(invId, lead.name, grade, lead.campus);

    // Update lead
    db.prepare("UPDATE leads SET stage = 'Admitted', next_action = 'Enrolled (" + studentId + ")' WHERE id = ?").run(id);

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);

    res.json({
      success: true,
      message: `Candidate ${lead.name} enrolled as student ${studentId}`,
      student,
      invoiceId: invId
    });
  } catch (err) {
    next(err);
  }
}

function deleteLead(req, res, next) {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM leads WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: `Lead ${id} not found` });
    }
    res.json({ success: true, message: `Lead ${id} deleted` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateStage,
  enrolLead,
  deleteLead
};
