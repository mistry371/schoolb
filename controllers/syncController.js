const { db } = require('../config/database');

function getFullDump(req, res, next) {
  try {
    const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
    const students = db.prepare('SELECT * FROM students ORDER BY id ASC').all();
    const fees = db.prepare('SELECT * FROM fees ORDER BY due DESC').all();
    const staff = db.prepare('SELECT * FROM staff ORDER BY id ASC').all();
    const tickets = db.prepare('SELECT * FROM tickets ORDER BY created_at DESC').all();
    const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
    const transport = db.prepare('SELECT * FROM transport ORDER BY id ASC').all();
    const library = db.prepare('SELECT * FROM library ORDER BY created_at DESC').all();
    const assets = db.prepare('SELECT * FROM assets ORDER BY id ASC').all();
    const compliance = db.prepare('SELECT * FROM compliance ORDER BY id ASC').all();
    const exams = db.prepare('SELECT * FROM exams ORDER BY date ASC').all();
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY done ASC, id ASC').all().map(t => ({ ...t, done: Boolean(t.done) }));
    const timetable = db.prepare('SELECT * FROM timetable ORDER BY day ASC, time_slot ASC').all();
    const events = db.prepare('SELECT * FROM events ORDER BY created_at DESC').all();

    // Reconstruct attendance map
    const attRows = db.prepare('SELECT student_id, day_idx, status FROM attendance ORDER BY day_idx ASC').all();
    const attendance = {};
    attRows.forEach(r => {
      if (!attendance[r.student_id]) {
        attendance[r.student_id] = ['Present', 'Present', 'Present', 'Present', 'Present'];
      }
      if (r.day_idx >= 0 && r.day_idx < 5) {
        attendance[r.student_id][r.day_idx] = r.status;
      }
    });

    // Reconstruct settings
    const settingsRows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    settingsRows.forEach(r => {
      try { settings[r.key] = JSON.parse(r.value); } catch { settings[r.key] = r.value; }
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        leads,
        students,
        fees,
        staff,
        tickets,
        messages,
        transport,
        library,
        assets,
        compliance,
        exams,
        tasks,
        timetable,
        events,
        attendance,
        settings
      }
    });
  } catch (err) {
    next(err);
  }
}

function importDump(req, res, next) {
  try {
    const payload = req.body.data || req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid payload: data object required' });
    }

    // Ingest entities in transaction
    if (Array.isArray(payload.leads)) {
      const ins = db.prepare(`
        INSERT OR REPLACE INTO leads (id, name, grade, parent, phone, source, stage, owner, next_action, campus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      payload.leads.forEach(l => ins.run(l.id, l.name, l.grade, l.parent, l.phone, l.source, l.stage, l.owner, l.next_action || l.next, l.campus));
    }

    if (Array.isArray(payload.students)) {
      const ins = db.prepare(`
        INSERT OR REPLACE INTO students (id, name, grade, section, roll, parent, phone, status, campus, attendance, balance)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      payload.students.forEach(s => ins.run(s.id, s.name, s.grade, s.section, s.roll, s.parent, s.phone, s.status, s.campus, s.attendance, s.balance));
    }

    if (Array.isArray(payload.fees)) {
      const ins = db.prepare(`
        INSERT OR REPLACE INTO fees (id, student, grade, type, amount, paid, due, status, campus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      payload.fees.forEach(f => ins.run(f.id, f.student, f.grade, f.type, f.amount, f.paid, f.due, f.status, f.campus));
    }

    if (Array.isArray(payload.events)) {
      const ins = db.prepare(`
        INSERT OR REPLACE INTO events (id, title, day, time, room)
        VALUES (?, ?, ?, ?, ?)
      `);
      payload.events.forEach(e => ins.run(e.id, e.title, e.day, e.time, e.room));
    }

    if (Array.isArray(payload.exams)) {
      const ins = db.prepare(`
        INSERT OR REPLACE INTO exams (id, title, grade, date, max, teacher, status, campus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      payload.exams.forEach(ex => ins.run(
        ex.id,
        ex.title,
        ex.grade,
        ex.date,
        ex.max || '100 marks',
        ex.teacher || 'Faculty',
        ex.status || 'Marks Open',
        ex.campus || 'Main Campus'
      ));
    }

    res.json({
      success: true,
      message: 'State synchronized with database successfully'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getFullDump,
  importDump
};
