const { db, resetDatabase } = require('../config/database');

function getSettings(req, res, next) {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    rows.forEach(r => {
      try {
        settings[r.key] = JSON.parse(r.value);
      } catch {
        settings[r.key] = r.value;
      }
    });
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

function updateSettings(req, res, next) {
  try {
    const updates = req.body;
    const upsert = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    for (const [k, v] of Object.entries(updates)) {
      const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
      upsert.run(k, valStr);
    }

    return getSettings(req, res, next);
  } catch (err) {
    next(err);
  }
}

function resetData(req, res, next) {
  try {
    resetDatabase();
    res.json({
      success: true,
      message: 'Database successfully restored to clean factory client demo state.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSettings,
  updateSettings,
  resetData
};
