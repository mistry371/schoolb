const { db } = require('../config/database');

function getReports(req, res, next) {
  try {
    const campus = req.query.campus || 'All campuses';
    const campusFilter = (tbl) => {
      if (campus === 'All campuses') return '';
      return `WHERE ${tbl}.campus = '${campus}' OR ${tbl}.campus = 'All campuses'`;
    };

    // Admissions funnel
    const leadsRows = db.prepare(`SELECT stage, count(*) as count FROM leads ${campusFilter('leads')} GROUP BY stage`).all();
    const funnel = {
      'New enquiry': 0,
      'Contacted': 0,
      'School visit': 0,
      'Application': 0,
      'Admitted': 0
    };
    leadsRows.forEach(r => { funnel[r.stage] = r.count; });
    const totalLeads = Object.values(funnel).reduce((a, b) => a + b, 0);
    const conversionRate = totalLeads > 0 ? ((funnel['Admitted'] / totalLeads) * 100).toFixed(1) + '%' : '0%';

    // Grade distribution
    const grades = db.prepare(`SELECT grade, count(*) as count FROM students ${campusFilter('students')} GROUP BY grade`).all();

    // Financial recovery
    const feeRow = db.prepare(`SELECT sum(amount) as billed, sum(paid) as collected FROM fees ${campusFilter('fees')}`).get();
    const billed = feeRow.billed || 0;
    const collected = feeRow.collected || 0;
    const outstanding = billed - collected;

    // Transport utilization
    const transRows = db.prepare(`SELECT sum(students) as students, sum(capacity) as capacity FROM transport ${campusFilter('transport')}`).get();
    const transUtilization = transRows.capacity > 0 ? ((transRows.students / transRows.capacity) * 100).toFixed(1) + '%' : '0%';

    res.json({
      success: true,
      campus,
      admissions: {
        totalLeads,
        conversionRate,
        funnel
      },
      academics: {
        gradeDistribution: grades
      },
      finance: {
        totalBilled: billed,
        totalCollected: collected,
        totalOutstanding: outstanding,
        recoveryRate: billed > 0 ? ((collected / billed) * 100).toFixed(1) + '%' : '100%'
      },
      operations: {
        transportCapacity: transRows.capacity || 0,
        transportRiders: transRows.students || 0,
        transportUtilization: transUtilization
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReports
};
