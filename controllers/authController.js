const bcrypt = require('bcryptjs');
const { db } = require('../config/database');
const { generateToken } = require('../middleware/auth');

function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        campus: user.campus
      }
    });
  } catch (err) {
    next(err);
  }
}

function register(req, res, next) {
  try {
    const { name, email, password, role = 'Teacher', campus = 'Main Campus' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const id = `USR-${Date.now().toString().slice(-4)}`;
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, campus)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, email.toLowerCase().trim(), password_hash, role, campus);

    const user = { id, name, email, role, campus };
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
}

function getMe(req, res) {
  res.json({
    success: true,
    user: req.user
  });
}

function switchRole(req, res, next) {
  try {
    const { role } = req.body;
    const allowed = ['Admin', 'Principal', 'Admissions', 'Teacher', 'Finance'];
    if (!allowed.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Allowed: ${allowed.join(', ')}` });
    }

    const updatedUser = {
      ...req.user,
      role
    };
    const token = generateToken(updatedUser);

    res.json({
      success: true,
      message: `Perspective switched to ${role}`,
      token,
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  register,
  getMe,
  switchRole
};
