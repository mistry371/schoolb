const { db } = require('../config/database');

function globalSearch(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json({ success: true, query: q, total: 0, results: [] });
    }

    const term = `%${q}%`;
    const results = [];

    // Search students
    const students = db.prepare(`
      SELECT id, name, grade, section, phone, campus
      FROM students
      WHERE name LIKE ? OR id LIKE ? OR parent LIKE ? OR phone LIKE ?
      LIMIT 5
    `).all(term, term, term, term);

    students.forEach(s => {
      results.push({
        type: 'Student',
        id: s.id,
        title: s.name,
        subtitle: `${s.grade} ${s.section} · ${s.campus}`,
        badge: s.id,
        link: `/students/${s.id}`
      });
    });

    // Search leads
    const leads = db.prepare(`
      SELECT id, name, grade, parent, stage, phone, campus
      FROM leads
      WHERE name LIKE ? OR id LIKE ? OR parent LIKE ? OR phone LIKE ?
      LIMIT 5
    `).all(term, term, term, term);

    leads.forEach(l => {
      results.push({
        type: 'Lead',
        id: l.id,
        title: l.name,
        subtitle: `${l.grade} · Parent: ${l.parent}`,
        badge: l.stage,
        link: `/admissions/${l.id}`
      });
    });

    // Search staff
    const staff = db.prepare(`
      SELECT id, name, role, department, phone, campus
      FROM staff
      WHERE name LIKE ? OR id LIKE ? OR role LIKE ? OR department LIKE ? OR phone LIKE ?
      LIMIT 5
    `).all(term, term, term, term, term);

    staff.forEach(st => {
      results.push({
        type: 'Staff',
        id: st.id,
        title: st.name,
        subtitle: `${st.role} · ${st.department}`,
        badge: st.id,
        link: `/staff/${st.id}`
      });
    });

    // Search fees
    const fees = db.prepare(`
      SELECT id, student, type, amount, status
      FROM fees
      WHERE student LIKE ? OR id LIKE ? OR type LIKE ?
      LIMIT 5
    `).all(term, term, term);

    fees.forEach(f => {
      results.push({
        type: 'Invoice',
        id: f.id,
        title: `${f.student} — ₹${f.amount}`,
        subtitle: `${f.type} · Status: ${f.status}`,
        badge: f.status,
        link: `/fees/${f.id}`
      });
    });

    // Search tickets
    const tickets = db.prepare(`
      SELECT id, subject, student, status, priority
      FROM tickets
      WHERE subject LIKE ? OR id LIKE ? OR student LIKE ?
      LIMIT 5
    `).all(term, term, term);

    tickets.forEach(t => {
      results.push({
        type: 'Ticket',
        id: t.id,
        title: t.subject,
        subtitle: `Ref: ${t.student} · Priority: ${t.priority}`,
        badge: t.status,
        link: `/helpdesk/${t.id}`
      });
    });

    res.json({
      success: true,
      query: q,
      total: results.length,
      results
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  globalSearch
};
