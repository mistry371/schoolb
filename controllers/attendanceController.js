const { db } = require('../config/database');

function getClassAttendance(req, res, next) {
  try {
    const { className = 'Grade 8 A', campus = 'All campuses' } = req.query;
    
    // Parse grade and section
    const parts = className.split(' ');
    const grade = parts[0] + (parts[1] ? ' ' + parts[1] : '');
    const section = parts[2] || '';

    let studentSql = 'SELECT * FROM students WHERE grade = ?';
    const params = [grade];
    if (section) {
      studentSql += ' AND section = ?';
      params.push(section);
    }
    if (campus && campus !== 'All campuses') {
      studentSql += ' AND (campus = ? OR campus = "All campuses")';
      params.push(campus);
    }
    studentSql += ' ORDER BY roll ASC, name ASC';

    const students = db.prepare(studentSql).all(...params);

    // Fetch marks for these students
    const marks = {};
    let totalPresent = 0;
    let totalSlots = 0;
    let chronicCount = 0;

    students.forEach(s => {
      const studentMarks = db.prepare('SELECT day_idx, status FROM attendance WHERE student_id = ? ORDER BY day_idx ASC').all(s.id);
      const days = ['Present', 'Present', 'Present', 'Present', 'Present'];
      studentMarks.forEach(m => {
        if (m.day_idx >= 0 && m.day_idx < 5) {
          days[m.day_idx] = m.status;
        }
      });
      marks[s.id] = days;

      days.forEach(st => {
        totalSlots++;
        if (st === 'Present' || st === 'Late' || st === 'Excused') totalPresent++;
      });

      // Check chronic absenteeism rate (<85%)
      const overallNum = parseInt(s.attendance, 10);
      if (!isNaN(overallNum) && overallNum < 85) chronicCount++;
    });

    const attendanceRate = totalSlots > 0 ? ((totalPresent / totalSlots) * 100).toFixed(1) + '%' : '100%';

    // Compute day-by-day stats
    const dayStats = [0, 1, 2, 3, 4].map(d => {
      let pres = 0, abs = 0, late = 0, exc = 0, unm = 0;
      students.forEach(s => {
        const st = (marks[s.id] || [])[d] || 'Unmarked';
        if (st === 'Present') pres++;
        else if (st === 'Absent') abs++;
        else if (st === 'Late') late++;
        else if (st === 'Excused') exc++;
        else unm++;
      });
      return { day: d, present: pres, absent: abs, late: late, excused: exc, unmarked: unm };
    });

    res.json({
      success: true,
      className,
      campus,
      count: students.length,
      attendanceRate,
      chronicCount,
      dayStats,
      students,
      marks
    });
  } catch (err) {
    next(err);
  }
}

function updateStudentMark(req, res, next) {
  try {
    const { studentId, dayIdx, status, reason, remarks, arrivalTime } = req.body;
    if (!studentId || dayIdx === undefined || !status) {
      return res.status(400).json({ success: false, message: 'studentId, dayIdx, and status are required' });
    }

    const allowed = ['Present', 'Absent', 'Late', 'Excused', 'Unmarked'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    db.prepare(`
      INSERT INTO attendance (student_id, day_idx, status)
      VALUES (?, ?, ?)
      ON CONFLICT(student_id, day_idx) DO UPDATE SET status = excluded.status
    `).run(studentId, parseInt(dayIdx, 10), status);

    // Recalculate student attendance percentage
    const allMarks = db.prepare('SELECT status FROM attendance WHERE student_id = ?').all(studentId);
    let presentCount = 0;
    allMarks.forEach(m => {
      if (m.status === 'Present' || m.status === 'Late' || m.status === 'Excused') presentCount++;
    });
    const pct = allMarks.length > 0 ? Math.round((presentCount / allMarks.length) * 100) + '%' : '100%';

    db.prepare('UPDATE students SET attendance = ? WHERE id = ?').run(pct, studentId);

    res.json({
      success: true,
      message: 'Attendance mark updated',
      studentId,
      dayIdx,
      status,
      reason: reason || null,
      arrivalTime: arrivalTime || null,
      remarks: remarks || null,
      studentAttendance: pct
    });
  } catch (err) {
    next(err);
  }
}

function markAll(req, res, next) {
  try {
    const { className = 'Grade 8 A', status = 'Present', dayIdx } = req.body;
    const parts = className.split(' ');
    const grade = parts[0] + (parts[1] ? ' ' + parts[1] : '');
    const section = parts[2] || '';

    let sql = 'SELECT id FROM students WHERE grade = ?';
    const params = [grade];
    if (section) {
      sql += ' AND section = ?';
      params.push(section);
    }

    const students = db.prepare(sql).all(...params);
    const insert = db.prepare(`
      INSERT INTO attendance (student_id, day_idx, status)
      VALUES (?, ?, ?)
      ON CONFLICT(student_id, day_idx) DO UPDATE SET status = excluded.status
    `);

    for (const s of students) {
      if (dayIdx !== undefined && dayIdx !== null && dayIdx >= 0) {
        insert.run(s.id, parseInt(dayIdx, 10), status);
      } else {
        for (let day = 0; day < 5; day++) {
          insert.run(s.id, day, status);
        }
      }
      
      const allMarks = db.prepare('SELECT status FROM attendance WHERE student_id = ?').all(s.id);
      let pCount = allMarks.filter(m => m.status === 'Present' || m.status === 'Late' || m.status === 'Excused').length;
      const pct = allMarks.length > 0 ? Math.round((pCount / allMarks.length) * 100) + '%' : '100%';
      db.prepare('UPDATE students SET attendance = ? WHERE id = ?').run(pct, s.id);
    }

    res.json({
      success: true,
      message: dayIdx !== undefined 
        ? `Day ${dayIdx} marked as ${status} for all students in ${className}`
        : `All students in ${className} marked as ${status}`
    });
  } catch (err) {
    next(err);
  }
}

function notifyAbsentees(req, res, next) {
  try {
    const { className = 'Grade 8 A', dayIdx = 2 } = req.body;
    const parts = className.split(' ');
    const grade = parts[0] + (parts[1] ? ' ' + parts[1] : '');
    const section = parts[2] || '';

    let sql = 'SELECT * FROM students WHERE grade = ?';
    const params = [grade];
    if (section) {
      sql += ' AND section = ?';
      params.push(section);
    }
    const students = db.prepare(sql).all(...params);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayName = days[dayIdx] || 'Today';

    const notified = [];
    const insertMsg = db.prepare(`
      INSERT INTO messages (id, subject, audience, channel, sent, status, campus, body)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    students.forEach(s => {
      const mark = db.prepare('SELECT status FROM attendance WHERE student_id = ? AND day_idx = ?').get(s.id, dayIdx);
      if (mark && (mark.status === 'Absent' || mark.status === 'Late')) {
        const msgId = 'MSG-' + Date.now() + '-' + s.roll;
        const subject = `Attendance Alert: ${s.name} marked ${mark.status} (${dayName})`;
        const body = `Dear ${s.parent}, this is an automated alert from Northstar School. Your ward ${s.name} (${s.grade} ${s.section}, Roll ${s.roll}) was recorded as ${mark.status} on ${dayName}. If this absence was unforeseen, please contact school administration at +91 261 400 1122.`;
        
        insertMsg.run(msgId, subject, `${s.name} parents`, 'SMS & In-App', 'Just now', 'Sent', s.campus, body);
        notified.push({ student: s.name, parent: s.parent, phone: s.phone, status: mark.status, messageId: msgId });
      }
    });

    res.json({
      success: true,
      count: notified.length,
      day: dayName,
      className,
      notified
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getClassAttendance,
  updateStudentMark,
  markAll,
  notifyAbsentees
};
