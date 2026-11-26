const { db } = require('../config/database');

function exportCsv(req, res, next) {
  try {
    const { entity } = req.params;
    const allowed = ['students', 'leads', 'fees', 'staff', 'transport', 'library', 'assets', 'compliance', 'exams', 'tickets'];
    if (!allowed.includes(entity)) {
      return res.status(400).json({ success: false, message: `Entity '${entity}' not exportable. Allowed: ${allowed.join(', ')}` });
    }

    const rows = db.prepare(`SELECT * FROM ${entity}`).all();
    if (rows.length === 0) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="northstar-${entity}.csv"`);
      return res.send('');
    }

    const headers = Object.keys(rows[0]);
    const escapeCsv = (val) => {
      if (val == null) return '';
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
    };

    const csvLines = [];
    csvLines.push(headers.map(escapeCsv).join(','));
    rows.forEach(r => {
      csvLines.push(headers.map(h => escapeCsv(r[h])).join(','));
    });

    const output = csvLines.join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="northstar-${entity}-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(output);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  exportCsv
};
