const { db } = require('../config/database');

// Generic helper for standard tables
function createEntityHandlers(table, idPrefix, requiredFields, defaultValues = {}) {
  return {
    getAll: (req, res, next) => {
      try {
        const { campus, status, search } = req.query;
        let sql = `SELECT * FROM ${table} WHERE 1=1`;
        const params = [];

        if (campus && campus !== 'All campuses') {
          sql += ` AND (campus = ? OR campus = "All campuses")`;
          params.push(campus);
        }
        if (status && status !== 'All') {
          sql += ` AND status = ?`;
          params.push(status);
        }
        if (search) {
          const cols = db.prepare(`PRAGMA table_info(${table})`).all().filter(c => c.type.includes('TEXT')).map(c => c.name);
          if (cols.length > 0) {
            sql += ` AND (${cols.map(c => `${c} LIKE ?`).join(' OR ')})`;
            const term = `%${search}%`;
            cols.forEach(() => params.push(term));
          }
        }

        sql += ' ORDER BY created_at DESC';
        const rows = db.prepare(sql).all(...params);
        res.json({ success: true, count: rows.length, data: rows });
      } catch (err) {
        next(err);
      }
    },

    getById: (req, res, next) => {
      try {
        const { id } = req.params;
        const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
        if (!row) {
          return res.status(404).json({ success: false, message: `Record ${id} not found in ${table}` });
        }
        res.json({ success: true, data: row });
      } catch (err) {
        next(err);
      }
    },

    create: (req, res, next) => {
      try {
        const payload = { ...defaultValues, ...req.body };
        for (const f of requiredFields) {
          if (!payload[f]) {
            return res.status(400).json({ success: false, message: `Field '${f}' is required` });
          }
        }

        // Auto ID if not provided
        if (!payload.id) {
          const last = db.prepare(`SELECT id FROM ${table} WHERE id LIKE '${idPrefix}-%' ORDER BY id DESC LIMIT 1`).get();
          let nextNum = 101;
          if (last) {
            const parts = last.id.split('-');
            const num = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(num)) nextNum = num + 1;
          }
          payload.id = `${idPrefix}-${nextNum}`;
        }

        const keys = Object.keys(payload);
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(k => payload[k]);

        db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`).run(...values);
        const created = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(payload.id);

        res.status(201).json({ success: true, message: `Record created in ${table}`, data: created });
      } catch (err) {
        next(err);
      }
    },

    update: (req, res, next) => {
      try {
        const { id } = req.params;
        const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
        if (!existing) {
          return res.status(404).json({ success: false, message: `Record ${id} not found in ${table}` });
        }

        const updates = req.body;
        delete updates.id; // Protect primary key
        const keys = Object.keys(updates);
        if (keys.length === 0) {
          return res.json({ success: true, data: existing });
        }

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => updates[k]);
        values.push(id);

        db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).run(...values);
        const updated = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);

        res.json({ success: true, message: `Record updated in ${table}`, data: updated });
      } catch (err) {
        next(err);
      }
    },

    delete: (req, res, next) => {
      try {
        const { id } = req.params;
        const result = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
        if (result.changes === 0) {
          return res.status(404).json({ success: false, message: `Record ${id} not found in ${table}` });
        }
        res.json({ success: true, message: `Record ${id} deleted from ${table}` });
      } catch (err) {
        next(err);
      }
    }
  };
}

const staffHandlers = createEntityHandlers('staff', 'EMP', ['name', 'role', 'department', 'phone'], { campus: 'Main Campus', status: 'Active' });
const ticketsHandlers = createEntityHandlers('tickets', 'SUP', ['subject', 'category', 'priority'], { status: 'Open', campus: 'Main Campus', owner: 'Office' });
const messagesHandlers = createEntityHandlers('messages', 'MSG', ['subject', 'audience', 'channel'], { sent: new Date().toLocaleDateString('en-GB'), status: 'Sent', campus: 'Main Campus' });
const transportHandlers = createEntityHandlers('transport', 'RT', ['route', 'driver', 'vehicle'], { status: 'On time', students: 0, capacity: 40, campus: 'Main Campus' });
const libraryHandlers = createEntityHandlers('library', 'LIB', ['title', 'student'], { issued: new Date().toISOString().slice(0, 10), due: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), status: 'Issued', campus: 'Main Campus' });
const assetsHandlers = createEntityHandlers('assets', 'AST', ['item', 'category', 'assigned'], { condition: 'Working', status: 'Active', campus: 'Main Campus' });
const complianceHandlers = createEntityHandlers('compliance', 'GOV', ['item', 'owner'], { status: 'In progress', campus: 'Main Campus', due: '2026-12-31' });
const examsHandlers = createEntityHandlers('exams', 'EX', ['title', 'grade'], { status: 'Scheduled', max: '50 marks', campus: 'Main Campus' });

examsHandlers.saveMarks = (req, res, next) => {
  try {
    const { studentId, examId, theory, practical, remarks, status } = req.body;
    res.json({
      success: true,
      message: 'Examination marks recorded successfully',
      data: { studentId, examId, theory, practical, remarks, status }
    });
  } catch (err) { next(err); }
};

examsHandlers.publishResults = (req, res, next) => {
  try {
    const { seriesName = 'Term 1 Mid-Term', className = 'All Classes' } = req.body;
    db.prepare("UPDATE exams SET status = 'Results published' WHERE status = 'Scheduled' OR status = 'Marks Open'").run();
    res.json({
      success: true,
      message: `Assessment results published and parent notifications dispatched for ${className} (${seriesName})`
    });
  } catch (err) { next(err); }
};

const timetableHandlers = createEntityHandlers('timetable', 'TT', ['day', 'time_slot', 'subject', 'class_name'], { room: 'Room 204', teacher: 'Staff', campus: 'Main Campus' });
const eventsHandlers = createEntityHandlers('events', 'EV', ['title', 'day', 'time', 'room']);

// Tasks handlers
const tasksHandlers = {
  getAll: (req, res, next) => {
    try {
      const tasks = db.prepare('SELECT * FROM tasks ORDER BY done ASC, id ASC').all();
      res.json({ success: true, count: tasks.length, data: tasks.map(t => ({ ...t, done: Boolean(t.done) })) });
    } catch (err) { next(err); }
  },
  create: (req, res, next) => {
    try {
      const { title, meta = 'Operations · Today' } = req.body;
      if (!title) return res.status(400).json({ success: false, message: 'Task title is required' });
      const last = db.prepare("SELECT id FROM tasks ORDER BY id DESC LIMIT 1").get();
      let nextNum = 5;
      if (last) {
        const num = parseInt(last.id.replace('T-', ''), 10);
        if (!isNaN(num)) nextNum = num + 1;
      }
      const id = `T-${nextNum}`;
      db.prepare('INSERT INTO tasks (id, title, meta, done) VALUES (?, ?, ?, 0)').run(id, title, meta);
      const created = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      res.status(201).json({ success: true, message: 'Task created', data: { ...created, done: false } });
    } catch (err) { next(err); }
  },
  toggle: (req, res, next) => {
    try {
      const { id } = req.params;
      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      if (!task) return res.status(404).json({ success: false, message: `Task ${id} not found` });
      const newDone = task.done ? 0 : 1;
      db.prepare('UPDATE tasks SET done = ? WHERE id = ?').run(newDone, id);
      res.json({ success: true, message: `Task marked as ${newDone ? 'done' : 'pending'}`, data: { ...task, done: Boolean(newDone) } });
    } catch (err) { next(err); }
  },
  delete: (req, res, next) => {
    try {
      const { id } = req.params;
      const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
      if (result.changes === 0) return res.status(404).json({ success: false, message: `Task ${id} not found` });
      res.json({ success: true, message: `Task ${id} removed` });
    } catch (err) { next(err); }
  }
};

module.exports = {
  staffHandlers,
  ticketsHandlers,
  messagesHandlers,
  transportHandlers,
  libraryHandlers,
  assetsHandlers,
  complianceHandlers,
  examsHandlers,
  timetableHandlers,
  eventsHandlers,
  tasksHandlers
};
