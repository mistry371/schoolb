const { db } = require('../config/database');

function getOverview(req, res, next) {
  try {
    const campus = req.query.campus || req.user?.campus || 'All campuses';
    const role = req.query.role || req.user?.role || 'Admin';

    const campusFilter = (table) => {
      if (campus === 'All campuses') return '';
      return `WHERE ${table}.campus = '${campus}' OR ${table}.campus = 'All campuses'`;
    };

    // Calculate students metric
    const studentsSql = `SELECT count(*) as total FROM students ${campusFilter('students')}`;
    const totalStudents = db.prepare(studentsSql).get().total;

    // Calculate leads
    const leadsSql = `SELECT count(*) as total, stage FROM leads ${campusFilter('leads')} GROUP BY stage`;
    const leadsRows = db.prepare(leadsSql).all();
    const leadsTotal = leadsRows.reduce((acc, r) => acc + r.total, 0);
    const stageCounts = {
      'New enquiry': 0,
      'Contacted': 0,
      'School visit': 0,
      'Application': 0,
      'Admitted': 0
    };
    leadsRows.forEach(r => { stageCounts[r.stage] = r.total; });

    // Calculate fees collection
    const feesSql = `SELECT sum(amount) as totalAmount, sum(paid) as totalPaid FROM fees ${campusFilter('fees')}`;
    const feeRow = db.prepare(feesSql).get();
    const totalBilled = feeRow.totalAmount || 0;
    const totalCollected = feeRow.totalPaid || 0;
    const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) + '%' : '100%';

    // Calculate attendance
    const attStudents = db.prepare(`SELECT attendance FROM students ${campusFilter('students')}`).all();
    let attAvg = 95.0;
    if (attStudents.length > 0) {
      const sum = attStudents.reduce((acc, s) => acc + (parseFloat(s.attendance) || 95), 0);
      attAvg = (sum / attStudents.length).toFixed(1);
    }

    // Urgent tasks
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY done ASC, id ASC').all();

    // Priority notifications
    const overdueInvoices = db.prepare(`SELECT count(*) as count FROM fees WHERE status = 'Overdue'`).get().count;
    const newLeads = db.prepare(`SELECT count(*) as count FROM leads WHERE stage = 'New enquiry'`).get().count;
    const openTickets = db.prepare(`SELECT count(*) as count FROM tickets WHERE status = 'Open'`).get().count;

    // Activity feed
    const activityFeed = [
      { id: 1, title: 'Term 2 fees collected', desc: 'Dev Shah paid ₹6,000 via UPI', time: '10m ago', type: 'finance' },
      { id: 2, title: 'Campus visit booked', desc: 'Vihaan Desai (Grade 9) booked for tomorrow 10:00 AM', time: '45m ago', type: 'admissions' },
      { id: 3, title: 'Mathematics unit test scheduled', desc: 'Grade 8 A on 27 Nov 2026', time: '2h ago', type: 'academics' },
      { id: 4, title: 'Bus pickup timing request', desc: 'Ticket SUP-118 logged for West Campus route', time: '4h ago', type: 'transport' }
    ];

    res.json({
      success: true,
      context: {
        role,
        campus
      },
      kpi: {
        totalStudents,
        totalLeads: leadsTotal,
        collectionRate,
        attendanceRate: `${attAvg}%`,
        totalBilled,
        totalCollected,
        totalOutstanding: totalBilled - totalCollected
      },
      pipeline: stageCounts,
      notifications: {
        total: overdueInvoices + newLeads + openTickets,
        overdueInvoices,
        newLeads,
        openTickets
      },
      tasks,
      activityFeed
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOverview
};
