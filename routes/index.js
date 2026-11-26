const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const overviewController = require('../controllers/overviewController');
const leadsController = require('../controllers/leadsController');
const studentsController = require('../controllers/studentsController');
const attendanceController = require('../controllers/attendanceController');
const feesController = require('../controllers/feesController');
const {
  staffHandlers,
  ticketsHandlers,
  messagesHandlers,
  transportHandlers,
  libraryHandlers,
  assetsHandlers,
  complianceHandlers,
  examsHandlers,
  timetableHandlers,
  eventsHandlers,
  tasksHandlers
} = require('../controllers/operationsController');
const settingsController = require('../controllers/settingsController');
const reportsController = require('../controllers/reportsController');
const searchController = require('../controllers/searchController');
const syncController = require('../controllers/syncController');
const exportController = require('../controllers/exportController');

const { authenticate, requireRole } = require('../middleware/auth');

// Public / Auth routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/me', authenticate, authController.getMe);
router.post('/auth/switch-role', authenticate, authController.switchRole);

// Global overview & analytics
router.get('/overview', authenticate, overviewController.getOverview);
router.get('/reports', authenticate, reportsController.getReports);
router.get('/search', authenticate, searchController.globalSearch);

// Admissions & Leads
router.get('/leads', authenticate, leadsController.getLeads);
router.get('/leads/:id', authenticate, leadsController.getLeadById);
router.post('/leads', authenticate, requireRole('Admin', 'Principal', 'Admissions'), leadsController.createLead);
router.put('/leads/:id', authenticate, requireRole('Admin', 'Principal', 'Admissions'), leadsController.updateLead);
router.patch('/leads/:id/stage', authenticate, requireRole('Admin', 'Principal', 'Admissions'), leadsController.updateStage);
router.post('/leads/:id/enrol', authenticate, requireRole('Admin', 'Principal', 'Admissions'), leadsController.enrolLead);
router.delete('/leads/:id', authenticate, requireRole('Admin'), leadsController.deleteLead);

// Students Information System
router.get('/students', authenticate, studentsController.getStudents);
router.get('/students/:id', authenticate, studentsController.getStudentById);
router.post('/students', authenticate, requireRole('Admin', 'Principal', 'Admissions'), studentsController.createStudent);
router.put('/students/:id', authenticate, requireRole('Admin', 'Principal', 'Admissions', 'Teacher'), studentsController.updateStudent);
router.delete('/students/:id', authenticate, requireRole('Admin'), studentsController.deleteStudent);

// Attendance Registers
router.get('/attendance', authenticate, attendanceController.getClassAttendance);
router.post('/attendance/mark', authenticate, requireRole('Admin', 'Principal', 'Teacher'), attendanceController.updateStudentMark);
router.post('/attendance/mark-all', authenticate, requireRole('Admin', 'Principal', 'Teacher'), attendanceController.markAll);
router.post('/attendance/notify-absentees', authenticate, requireRole('Admin', 'Principal', 'Teacher'), attendanceController.notifyAbsentees);

// Fees & Billing
router.get('/fees', authenticate, feesController.getFees);
router.get('/fees/:id', authenticate, feesController.getFeeById);
router.post('/fees', authenticate, requireRole('Admin', 'Finance'), feesController.createFee);
router.post('/fees/:id/payment', authenticate, requireRole('Admin', 'Finance'), feesController.recordPayment);
router.post('/fees/:id/quick-pay', authenticate, requireRole('Admin', 'Finance'), feesController.quickPay);
router.delete('/fees/:id', authenticate, requireRole('Admin', 'Finance'), feesController.deleteFee);

// Operational Modules helper
function bindCrud(prefix, handlers, writeRoles = ['Admin']) {
  router.get(`/${prefix}`, authenticate, handlers.getAll);
  router.get(`/${prefix}/:id`, authenticate, handlers.getById);
  router.post(`/${prefix}`, authenticate, requireRole(...writeRoles), handlers.create);
  router.put(`/${prefix}/:id`, authenticate, requireRole(...writeRoles), handlers.update);
  router.delete(`/${prefix}/:id`, authenticate, requireRole('Admin'), handlers.delete);
}

bindCrud('staff', staffHandlers, ['Admin', 'Principal']);
bindCrud('tickets', ticketsHandlers, ['Admin', 'Principal', 'Teacher', 'Admissions', 'Finance']);
bindCrud('messages', messagesHandlers, ['Admin', 'Principal']);
bindCrud('transport', transportHandlers, ['Admin', 'Principal']);
bindCrud('library', libraryHandlers, ['Admin', 'Principal', 'Teacher']);
bindCrud('assets', assetsHandlers, ['Admin', 'Principal']);
bindCrud('compliance', complianceHandlers, ['Admin', 'Principal']);

// Custom Examination endpoints (must precede /exams/:id)
router.post('/exams/marks', authenticate, requireRole('Admin', 'Principal', 'Teacher'), examsHandlers.saveMarks);
router.post('/exams/publish', authenticate, requireRole('Admin', 'Principal', 'Teacher'), examsHandlers.publishResults);

bindCrud('exams', examsHandlers, ['Admin', 'Principal', 'Teacher']);
bindCrud('timetable', timetableHandlers, ['Admin', 'Principal', 'Teacher']);
bindCrud('events', eventsHandlers, ['Admin', 'Principal', 'Teacher']);

// Tasks
router.get('/tasks', authenticate, tasksHandlers.getAll);
router.post('/tasks', authenticate, tasksHandlers.create);
router.patch('/tasks/:id/toggle', authenticate, tasksHandlers.toggle);
router.delete('/tasks/:id', authenticate, tasksHandlers.delete);

// Settings & Sync
router.get('/settings', authenticate, settingsController.getSettings);
router.put('/settings', authenticate, requireRole('Admin'), settingsController.updateSettings);
router.post('/settings/reset', authenticate, requireRole('Admin'), settingsController.resetData);

router.get('/sync', authenticate, syncController.getFullDump);
router.post('/sync', authenticate, requireRole('Admin'), syncController.importDump);

// CSV Export
router.get('/export/:entity', authenticate, exportController.exportCsv);

module.exports = router;
