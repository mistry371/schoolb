require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { initDatabase } = require('./config/database');
const apiRouter = require('./routes/index');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8765;

// Initialize SQLite database
initDatabase();

// Global Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('short'));
}

// Serve Frontend Static Files
const DIST_DIR = path.resolve(__dirname, 'dist');
app.use(express.static(DIST_DIR));

// Screenshots Static Files
const SCREENSHOTS_DIR = path.resolve(__dirname, 'screenshots');
app.use('/screenshots', express.static(SCREENSHOTS_DIR));

// Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'CampusOS School Operations & CRM Backend',
    institution: 'Northstar International School',
    version: '4.2.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Main API Router
app.use('/api', apiRouter);

// Fallback to SPA for any unmatched non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return notFoundHandler(req, res);
  }
  if (req.method === 'GET') {
    return res.sendFile(path.join(DIST_DIR, 'index.html'));
  }
  next();
});

// Error handling
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  CampusOS School CRM Enterprise Backend`);
    console.log(`  Northstar International School · Production Engine`);
    console.log(`======================================================`);
    console.log(`  - Local App URL:  http://localhost:${PORT}`);
    console.log(`  - API Endpoint:   http://localhost:${PORT}/api`);
    console.log(`  - Health Check:   http://localhost:${PORT}/health`);
    console.log(`  - Database File:  data/campusos.db (SQLite)`);
    console.log(`======================================================\n`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\nGracefully terminating CampusOS backend...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = app;
