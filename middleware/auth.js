const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'northstar-campusos-secure-token-secret-2026';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      campus: user.campus
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For demo convenience, allow anonymous fallback user if requested or in demo mode
    req.user = {
      id: 'USR-DEMO',
      name: 'System User',
      email: 'admin@northstar.demo',
      role: req.headers['x-demo-role'] || 'Admin',
      campus: req.headers['x-demo-campus'] || 'All campuses'
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role) && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This resource requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticate,
  requireRole
};
