const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'campusos.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys
db.exec('PRAGMA foreign_keys = ON;');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      campus TEXT NOT NULL DEFAULT 'All campuses',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      grade TEXT NOT NULL,
      parent TEXT NOT NULL,
      phone TEXT NOT NULL,
      source TEXT NOT NULL,
      stage TEXT NOT NULL DEFAULT 'New enquiry',
      owner TEXT NOT NULL,
      next_action TEXT,
      campus TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      grade TEXT NOT NULL,
      section TEXT NOT NULL,
      roll TEXT NOT NULL,
      parent TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      campus TEXT NOT NULL,
      attendance TEXT NOT NULL DEFAULT '95%',
      balance REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fees (
      id TEXT PRIMARY KEY,
      student TEXT NOT NULL,
      grade TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      paid REAL NOT NULL DEFAULT 0,
      due TEXT NOT NULL,
      status TEXT NOT NULL,
      campus TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      student TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_mode TEXT NOT NULL,
      receipt_no TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES fees (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      campus TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      student TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open',
      due TEXT,
      campus TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      audience TEXT NOT NULL,
      channel TEXT NOT NULL,
      sent TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Sent',
      campus TEXT NOT NULL,
      body TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transport (
      id TEXT PRIMARY KEY,
      route TEXT NOT NULL,
      driver TEXT NOT NULL,
      vehicle TEXT NOT NULL,
      students INTEGER NOT NULL DEFAULT 0,
      capacity INTEGER NOT NULL DEFAULT 40,
      status TEXT NOT NULL DEFAULT 'On time',
      campus TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS library (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      student TEXT NOT NULL,
      issued TEXT NOT NULL,
      due TEXT NOT NULL,
      status TEXT NOT NULL,
      campus TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      item TEXT NOT NULL,
      category TEXT NOT NULL,
      assigned TEXT NOT NULL,
      condition TEXT NOT NULL,
      next TEXT NOT NULL,
      status TEXT NOT NULL,
      campus TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS compliance (
      id TEXT PRIMARY KEY,
      item TEXT NOT NULL,
      owner TEXT NOT NULL,
      due TEXT NOT NULL,
      evidence TEXT NOT NULL,
      status TEXT NOT NULL,
      campus TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      grade TEXT NOT NULL,
      date TEXT NOT NULL,
      max TEXT NOT NULL,
      teacher TEXT NOT NULL,
      status TEXT NOT NULL,
      campus TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      meta TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS timetable (
      id TEXT PRIMARY KEY,
      day TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      subject TEXT NOT NULL,
      class_name TEXT NOT NULL,
      room TEXT NOT NULL,
      teacher TEXT NOT NULL,
      campus TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      day TEXT NOT NULL,
      time TEXT NOT NULL,
      room TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      day_idx INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, day_idx)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDefaultData();
}

function seedDefaultData() {
  const userCheck = db.prepare('SELECT count(*) as count FROM users').get();
  if (userCheck.count === 0) {
    console.log('Seeding initial users and administrative accounts...');
    const salt = bcrypt.genSaltSync(10);
    const pass = bcrypt.hashSync('Admin@123', salt);
    
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, campus)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run('USR-01', 'Priya Nair', 'principal@northstar.demo', pass, 'Principal', 'Main Campus');
    insertUser.run('USR-02', 'System Administrator', 'admin@northstar.demo', pass, 'Admin', 'All campuses');
    insertUser.run('USR-03', 'Neha Patel', 'admissions@northstar.demo', pass, 'Admissions', 'Main Campus');
    insertUser.run('USR-04', 'Kavita Iyer', 'teacher@northstar.demo', pass, 'Teacher', 'Main Campus');
    insertUser.run('USR-05', 'Harsh Soni', 'finance@northstar.demo', pass, 'Finance', 'Main Campus');
  }

  const leadsCheck = db.prepare('SELECT count(*) as count FROM leads').get();
  if (leadsCheck.count === 0) {
    console.log('Seeding initial Northstar School CRM records...');
    
    // Leads
    const insertLead = db.prepare(`
      INSERT INTO leads (id, name, grade, parent, phone, source, stage, owner, next_action, campus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const initialLeads = [
      ['AD-2401', 'Aarav Shah', 'Grade 6', 'Riya Shah', '98250 12340', 'Website', 'New enquiry', 'Neha Patel', 'Today, 11:30 AM', 'Main Campus'],
      ['AD-2402', 'Diya Mehta', 'Grade 3', 'Kunal Mehta', '98790 44221', 'Instagram', 'Contacted', 'Neha Patel', 'Today, 2:00 PM', 'Main Campus'],
      ['AD-2403', 'Vihaan Desai', 'Grade 9', 'Priya Desai', '98980 33011', 'Referral', 'School visit', 'Arjun Rao', 'Tomorrow, 10:00 AM', 'Main Campus'],
      ['AD-2404', 'Myra Patel', 'Grade 1', 'Hiren Patel', '98251 22778', 'Walk-in', 'Application', 'Neha Patel', 'Docs pending', 'West Campus'],
      ['AD-2405', 'Kabir Joshi', 'Grade 8', 'Anita Joshi', '99090 18362', 'Website', 'Admitted', 'Arjun Rao', 'Onboarding', 'Main Campus'],
      ['AD-2406', 'Anaya Vyas', 'Grade 5', 'Dhruv Vyas', '98240 44680', 'Instagram', 'New enquiry', 'Neha Patel', 'Today, 4:30 PM', 'West Campus'],
      ['AD-2407', 'Reyansh Jain', 'Grade 2', 'Meera Jain', '99790 22881', 'Referral', 'School visit', 'Arjun Rao', 'Friday, 11:00 AM', 'West Campus']
    ];
    for (const lead of initialLeads) insertLead.run(...lead);

    // Students
    const insertStudent = db.prepare(`
      INSERT INTO students (id, name, grade, section, roll, parent, phone, status, campus, attendance, balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const initialStudents = [
      ['ST-1024', 'Aanya Patel', 'Grade 8', 'A', '08', 'Kiran Patel', '98251 12345', 'Active', 'Main Campus', '96%', 0],
      ['ST-1025', 'Dev Shah', 'Grade 8', 'A', '12', 'Nisha Shah', '98981 54120', 'Active', 'Main Campus', '89%', 12500],
      ['ST-1026', 'Ishita Mehta', 'Grade 8', 'A', '18', 'Rohan Mehta', '98796 36120', 'Active', 'Main Campus', '98%', 0],
      ['ST-1027', 'Rudra Desai', 'Grade 8', 'A', '24', 'Jinal Desai', '98256 41145', 'Active', 'Main Campus', '92%', 8500],
      ['ST-1028', 'Sara Khan', 'Grade 8', 'A', '27', 'Farah Khan', '98250 84961', 'Active', 'Main Campus', '94%', 0],
      ['ST-1104', 'Mihir Joshi', 'Grade 5', 'B', '09', 'Disha Joshi', '98988 24014', 'Active', 'West Campus', '97%', 4000],
      ['ST-1105', 'Kiara Vyas', 'Grade 3', 'A', '16', 'Jay Vyas', '98254 91927', 'Active', 'West Campus', '95%', 0],
      ['ST-1106', 'Aryan Trivedi', 'Grade 10', 'B', '05', 'Hemal Trivedi', '98794 12680', 'Active', 'Main Campus', '91%', 16500]
    ];
    for (const s of initialStudents) insertStudent.run(...s);

    // Fees
    const insertFee = db.prepare(`
      INSERT INTO fees (id, student, grade, type, amount, paid, due, status, campus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const initialFees = [
      ['INV-2026-301', 'Aanya Patel', 'Grade 8', 'Term 2 tuition', 18500, 18500, '2026-11-15', 'Paid', 'Main Campus'],
      ['INV-2026-302', 'Dev Shah', 'Grade 8', 'Term 2 tuition', 18500, 6000, '2026-11-20', 'Overdue', 'Main Campus'],
      ['INV-2026-303', 'Rudra Desai', 'Grade 8', 'Transport + tuition', 20500, 12000, '2026-11-28', 'Partial', 'Main Campus'],
      ['INV-2026-304', 'Mihir Joshi', 'Grade 5', 'Term 2 tuition', 16000, 12000, '2026-11-30', 'Partial', 'West Campus'],
      ['INV-2026-305', 'Aryan Trivedi', 'Grade 10', 'Term 2 tuition', 22500, 6000, '2026-11-18', 'Overdue', 'Main Campus'],
      ['INV-2026-306', 'Ishita Mehta', 'Grade 8', 'Term 2 tuition', 18500, 18500, '2026-11-15', 'Paid', 'Main Campus']
    ];
    for (const f of initialFees) insertFee.run(...f);

    // Staff
    const insertStaff = db.prepare(`
      INSERT INTO staff (id, name, role, department, phone, email, status, campus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const initialStaff = [
      ['EMP-101', 'Priya Nair', 'Principal', 'Leadership', '98250 77119', 'priya@northstar.demo', 'Active', 'Main Campus'],
      ['EMP-102', 'Neha Patel', 'Admissions Counsellor', 'Admissions', '98250 77120', 'neha@northstar.demo', 'Active', 'Main Campus'],
      ['EMP-103', 'Arjun Rao', 'Admissions Executive', 'Admissions', '98250 77121', 'arjun@northstar.demo', 'Active', 'West Campus'],
      ['EMP-104', 'Kavita Iyer', 'Class Teacher', 'Academics', '98250 77122', 'kavita@northstar.demo', 'Active', 'Main Campus'],
      ['EMP-105', 'Harsh Soni', 'Accountant', 'Finance', '98250 77123', 'harsh@northstar.demo', 'Active', 'Main Campus'],
      ['EMP-106', 'Meera Singh', 'Transport Manager', 'Transport', '98250 77124', 'meera@northstar.demo', 'On leave', 'West Campus']
    ];
    for (const st of initialStaff) insertStaff.run(...st);

    // Tickets
    const insertTicket = db.prepare(`
      INSERT INTO tickets (id, subject, student, category, priority, owner, status, due, campus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const initialTickets = [
      ['SUP-118', 'Bus pickup timing request', 'Mihir Joshi', 'Transport', 'Normal', 'Meera Singh', 'Open', 'Today', 'West Campus'],
      ['SUP-119', 'Fee receipt clarification', 'Dev Shah', 'Finance', 'High', 'Harsh Soni', 'In progress', 'Today', 'Main Campus'],
      ['SUP-120', 'Library card replacement', 'Sara Khan', 'Student services', 'Normal', 'Office', 'Resolved', 'Completed', 'Main Campus'],
      ['SUP-121', 'Classroom projector issue', 'Grade 8 A', 'Facilities', 'High', 'Office', 'Open', 'Tomorrow', 'Main Campus']
    ];
    for (const t of initialTickets) insertTicket.run(...t);

    // Messages / Circulars
    const insertMsg = db.prepare(`
      INSERT INTO messages (id, subject, audience, channel, sent, status, campus, body)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const initialMessages = [
      ['MSG-301', 'Term 2 parent meeting reminder', 'Grade 8 parents', 'Email', '24 Nov 2026', 'Sent', 'Main Campus', 'This is a reminder regarding the upcoming Term 2 Parent-Teacher Conference scheduled for this Saturday at 09:00 AM.'],
      ['MSG-302', 'Annual sports day circular', 'All parents', 'In-app', '22 Nov 2026', 'Sent', 'All campuses', 'We are delighted to announce our Annual Sports Day celebrations taking place on the main sports grounds next month.'],
      ['MSG-303', 'Transport route update', 'Route 3 parents', 'SMS', '21 Nov 2026', 'Sent', 'West Campus', 'Please note that Route 3 morning pickup timings will be shifted 10 minutes earlier starting Monday due to road maintenance.']
    ];
    for (const m of initialMessages) insertMsg.run(...m);

    // Transport
    const insertTransport = db.prepare(`
      INSERT INTO transport (id, route, driver, vehicle, students, capacity, status, campus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const initialTransport = [
      ['RT-01', 'Adajan – Athwa', 'Mahesh Solanki', 'GJ 05 AB 4721', 38, 45, 'On time', 'Main Campus'],
      ['RT-02', 'Vesu – Piplod', 'Rakesh Parmar', 'GJ 05 CD 2826', 42, 45, 'On time', 'Main Campus'],
      ['RT-03', 'Pal – Rander', 'Imran Sheikh', 'GJ 05 EF 7392', 31, 40, 'Delayed', 'West Campus'],
      ['RT-04', 'Althan – Bhimrad', 'Sanjay Chaudhary', 'GJ 05 GH 1834', 26, 35, 'On time', 'West Campus']
    ];
    for (const tr of initialTransport) insertTransport.run(...tr);

    // Library
    const insertLib = db.prepare(`
      INSERT INTO library (id, title, student, issued, due, status, campus)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const initialLibrary = [
      ['LIB-101', 'The Blue Umbrella', 'Aanya Patel', '2026-11-18', '2026-12-02', 'Issued', 'Main Campus'],
      ['LIB-102', 'A Brief History of Time', 'Dev Shah', '2026-11-10', '2026-11-24', 'Due today', 'Main Campus'],
      ['LIB-103', 'Wings of Fire', 'Kiara Vyas', '2026-11-05', '2026-11-19', 'Overdue', 'West Campus']
    ];
    for (const l of initialLibrary) insertLib.run(...l);

    // Assets
    const insertAsset = db.prepare(`
      INSERT INTO assets (id, item, category, assigned, condition, next, status, campus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const initialAssets = [
      ['AST-101', 'Projector · Room 204', 'IT equipment', 'Academics', 'Working', '2026-12-15', 'Active', 'Main Campus'],
      ['AST-102', 'Science lab microscope', 'Lab equipment', 'Science lab', 'Service required', '2026-11-29', 'Maintenance', 'Main Campus'],
      ['AST-103', 'Library tablets · 12 units', 'IT equipment', 'Library', 'Working', '2026-12-10', 'Active', 'West Campus']
    ];
    for (const a of initialAssets) insertAsset.run(...a);

    // Compliance
    const insertGov = db.prepare(`
      INSERT INTO compliance (id, item, owner, due, evidence, status, campus)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const initialGov = [
      ['GOV-101', 'Fire safety certificate renewal', 'Administration', '2026-12-15', 'Certificate file', 'In progress', 'Main Campus'],
      ['GOV-102', 'Transport vehicle fitness review', 'Transport Manager', '2026-11-30', 'Inspection checklist', 'Open', 'West Campus'],
      ['GOV-103', 'Staff document audit', 'HR Office', '2026-11-20', 'Personnel files', 'Completed', 'Main Campus']
    ];
    for (const g of initialGov) insertGov.run(...g);

    // Exams
    const insertExam = db.prepare(`
      INSERT INTO exams (id, title, grade, date, max, teacher, status, campus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const initialExams = [
      ['EX-201', 'Mathematics unit test', 'Grade 8 A', '2026-11-27', '40 marks', 'Kavita Iyer', 'Scheduled', 'Main Campus'],
      ['EX-202', 'Science practical', 'Grade 10 B', '2026-11-29', '30 marks', 'R. Menon', 'Scheduled', 'Main Campus'],
      ['EX-203', 'English reading assessment', 'Grade 5 B', '2026-11-22', '20 marks', 'S. Desai', 'Completed', 'West Campus']
    ];
    for (const ex of initialExams) insertExam.run(...ex);

    // Tasks
    const insertTask = db.prepare(`
      INSERT INTO tasks (id, title, meta, done)
      VALUES (?, ?, ?, ?)
    `);
    const initialTasks = [
      ['T-1', 'Call Diya Mehta’s parent', 'Admissions · Due 2:00 PM', 0],
      ['T-2', 'Review Grade 8 attendance', 'Academics · Due today', 0],
      ['T-3', 'Approve term fee receipts', 'Finance · Due today', 0],
      ['T-4', 'Prepare parent meeting agenda', 'Principal · Tomorrow', 1]
    ];
    for (const tk of initialTasks) insertTask.run(...tk);

    // Timetable
    const insertTT = db.prepare(`
      INSERT INTO timetable (id, day, time_slot, subject, class_name, room, teacher, campus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const initialTT = [
      ['TT-01', 'Monday', '08:30 - 09:30', 'Mathematics', 'Grade 8 A', 'Room 204', 'Kavita Iyer', 'Main Campus'],
      ['TT-02', 'Monday', '09:30 - 10:30', 'English Language', 'Grade 8 A', 'Room 204', 'S. Desai', 'Main Campus'],
      ['TT-03', 'Tuesday', '10:45 - 11:45', 'Physics Lab', 'Grade 10 B', 'Lab 1', 'R. Menon', 'Main Campus'],
      ['TT-04', 'Wednesday', '08:30 - 09:30', 'Science & Environment', 'Grade 5 B', 'Room 102', 'P. Joshi', 'West Campus']
    ];
    for (const tt of initialTT) insertTT.run(...tt);

    // Events
    const insertEvent = db.prepare(`
      INSERT OR REPLACE INTO events (id, title, day, time, room)
      VALUES (?, ?, ?, ?, ?)
    `);
    const initialEvents = [
      ['EV-101', 'Physics Lab Substitution · R. Menon', 'Thursday', '11:30', 'Physics Lab 1'],
      ['EV-102', 'Remedial Math Session · K. Iyer', 'Friday', '14:30', 'Room 204']
    ];
    for (const ev of initialEvents) insertEvent.run(...ev);

    // Attendance
    const insertAtt = db.prepare(`
      INSERT OR REPLACE INTO attendance (student_id, day_idx, status)
      VALUES (?, ?, ?)
    `);
    const defaultAtt = {
      'ST-1024': ['Present', 'Present', 'Present', 'Present', 'Present'],
      'ST-1025': ['Present', 'Absent', 'Present', 'Late', 'Present'],
      'ST-1026': ['Present', 'Present', 'Present', 'Present', 'Present'],
      'ST-1027': ['Present', 'Present', 'Absent', 'Present', 'Present'],
      'ST-1028': ['Present', 'Present', 'Present', 'Present', 'Present']
    };
    for (const [sId, marks] of Object.entries(defaultAtt)) {
      marks.forEach((st, idx) => insertAtt.run(sId, idx, st));
    }

    // Settings
    const insertSetting = db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`);
    insertSetting.run('school', 'Northstar International School');
    insertSetting.run('year', '2026–27');
    insertSetting.run('email', 'hello@northstar.demo');
    insertSetting.run('phone', '+91 261 400 1122');
    insertSetting.run('address', 'Surat, Gujarat');
    insertSetting.run('campuses', JSON.stringify(['Main Campus', 'West Campus']));
    insertSetting.run('theme', 'Indigo');

    console.log('Seeding completed successfully.');
  }
}

// Reset helper
function resetDatabase() {
  db.exec(`
    DROP TABLE IF EXISTS audit_logs;
    DROP TABLE IF EXISTS attendance;
    DROP TABLE IF EXISTS events;
    DROP TABLE IF EXISTS timetable;
    DROP TABLE IF EXISTS tasks;
    DROP TABLE IF EXISTS exams;
    DROP TABLE IF EXISTS compliance;
    DROP TABLE IF EXISTS assets;
    DROP TABLE IF EXISTS library;
    DROP TABLE IF EXISTS transport;
    DROP TABLE IF EXISTS messages;
    DROP TABLE IF EXISTS tickets;
    DROP TABLE IF EXISTS staff;
    DROP TABLE IF EXISTS payments;
    DROP TABLE IF EXISTS fees;
    DROP TABLE IF EXISTS students;
    DROP TABLE IF EXISTS leads;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS settings;
  `);
  initDatabase();
}

module.exports = {
  db,
  initDatabase,
  resetDatabase
};
