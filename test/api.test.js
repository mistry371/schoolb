/**
 * CampusOS Backend Integration Test Suite
 * Validates all REST API endpoints, business logic, authentication, and database integrity.
 */

process.env.NODE_ENV = 'test';
process.env.PORT = '9876';

const http = require('http');
const app = require('../server');

let server;
const BASE_URL = 'http://localhost:9876';
let authToken = '';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (authToken && !reqHeaders.Authorization) {
      reqHeaders.Authorization = `Bearer ${authToken}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch {
            json = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json
          });
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('  Starting CampusOS Backend Integration Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}`);
      console.error('    Error:', err.message);
      failed++;
    }
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  // 1. Healthcheck
  await test('GET /health - Service Healthcheck', async () => {
    const res = await request('GET', '/health');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.status === 'healthy', 'Expected status to be healthy');
  });

  // 2. Authentication
  await test('POST /api/auth/login - Admin Login & JWT Issuance', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'admin@northstar.demo',
      password: 'Admin@123'
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.token, 'Expected token in response');
    authToken = res.body.token;
  });

  await test('GET /api/auth/me - Verify Authenticated Identity', async () => {
    const res = await request('GET', '/api/auth/me');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.user.role === 'Admin', 'Expected user role to be Admin');
  });

  await test('POST /api/auth/switch-role - Perspective Switcher', async () => {
    const res = await request('POST', '/api/auth/switch-role', { role: 'Principal' });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.user.role === 'Principal', 'Expected switched role to be Principal');
    authToken = res.body.token; // Update token with new role
  });

  // Switch back to Admin for full testing
  const adminLogin = await request('POST', '/api/auth/login', {
    email: 'admin@northstar.demo',
    password: 'Admin@123'
  });
  authToken = adminLogin.body.token;

  // 3. Overview Dashboard
  await test('GET /api/overview - Executive KPI Metrics', async () => {
    const res = await request('GET', '/api/overview');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.kpi.totalStudents > 0, 'Expected positive student count');
    assert(res.body.kpi.collectionRate, 'Expected collection rate string');
    assert(res.body.tasks.length > 0, 'Expected tasks array');
  });

  // 4. Leads & Admissions CRM
  let testLeadId = '';
  await test('POST /api/leads - Create New Admissions Enquiry', async () => {
    const res = await request('POST', '/api/leads', {
      name: 'Rohan Sharma',
      grade: 'Grade 7',
      parent: 'Vikram Sharma',
      phone: '98255 99887',
      source: 'Website',
      campus: 'Main Campus'
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.body.data.id.startsWith('AD-'), 'Expected lead ID starting with AD-');
    testLeadId = res.body.data.id;
  });

  await test('PATCH /api/leads/:id/stage - Advance Pipeline Stage', async () => {
    const res = await request('PATCH', `/api/leads/${testLeadId}/stage`, {
      stage: 'School visit'
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.stage === 'School visit', 'Expected stage to be School visit');
  });

  await test('POST /api/leads/:id/enrol - 1-Click Enrol Lead as Student', async () => {
    // Set to Admitted first
    await request('PATCH', `/api/leads/${testLeadId}/stage`, { stage: 'Admitted' });
    const res = await request('POST', `/api/leads/${testLeadId}/enrol`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.student.id.startsWith('ST-'), 'Expected student ID starting with ST-');
    assert(res.body.invoiceId.startsWith('INV-'), 'Expected invoice ID generated');
  });

  // 5. Students Information System
  await test('GET /api/students - Retrieve All Students with Live Balances', async () => {
    const res = await request('GET', '/api/students');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.count > 0, 'Expected students count > 0');
    assert(res.body.data[0].balance !== undefined, 'Expected student balance calculated');
  });

  await test('GET /api/students/:id - 360° Comprehensive Student Dossier', async () => {
    const res = await request('GET', '/api/students/ST-1025');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.name === 'Dev Shah', 'Expected student Dev Shah');
    assert(Array.isArray(res.body.data.invoices), 'Expected invoices array');
    assert(Array.isArray(res.body.data.attendanceMarks), 'Expected attendance marks array');
  });

  // 6. Attendance Register
  await test('GET /api/attendance - Weekly Class Attendance Matrix', async () => {
    const res = await request('GET', '/api/attendance?className=Grade%208%20A');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.count > 0, 'Expected class students count > 0');
    assert(res.body.attendanceRate, 'Expected attendance rate percentage');
  });

  await test('POST /api/attendance/mark - Single-Click Attendance Cycling', async () => {
    const res = await request('POST', '/api/attendance/mark', {
      studentId: 'ST-1024',
      dayIdx: 1, // Tuesday
      status: 'Late'
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.status === 'Late', 'Expected status Late');
  });

  // 7. Fees & Invoicing Ledger
  let testInvoiceId = '';
  await test('POST /api/fees - Generate Fee Invoice', async () => {
    const res = await request('POST', '/api/fees', {
      student: 'Aanya Patel',
      grade: 'Grade 8',
      type: 'Laboratory & Sports Fee',
      amount: 4500,
      due: '2026-12-10',
      campus: 'Main Campus'
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.body.data.id.startsWith('INV-'), 'Expected invoice ID format');
    testInvoiceId = res.body.data.id;
  });

  await test('POST /api/fees/:id/quick-pay - 1-Click Pay Full & Receipt Box', async () => {
    const res = await request('POST', `/api/fees/${testInvoiceId}/quick-pay`, {
      type: 'full',
      paymentMode: 'UPI'
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.receipt.receiptNo.startsWith('REC-'), 'Expected official receipt number');
    assert(res.body.fee.status === 'Paid', 'Expected invoice status Paid');
  });

  // 8. Operational Modules (Staff, Transport, Library, Assets, Compliance, Tickets)
  await test('GET /api/staff - Faculty & HR Directory', async () => {
    const res = await request('GET', '/api/staff');
    assert(res.status === 200 && res.body.count > 0, 'Expected staff records');
  });

  await test('GET /api/transport - Bus Fleet & Route Operations', async () => {
    const res = await request('GET', '/api/transport');
    assert(res.status === 200 && res.body.count > 0, 'Expected transport routes');
  });

  await test('GET /api/library - Book Loans & Circulation Ledger', async () => {
    const res = await request('GET', '/api/library');
    assert(res.status === 200 && res.body.count > 0, 'Expected library records');
  });

  await test('GET /api/assets - Facilities & Equipment Inventory', async () => {
    const res = await request('GET', '/api/assets');
    assert(res.status === 200 && res.body.count > 0, 'Expected asset records');
  });

  await test('GET /api/compliance - Statutory & Board Obligations', async () => {
    const res = await request('GET', '/api/compliance');
    assert(res.status === 200 && res.body.count > 0, 'Expected compliance obligations');
  });

  await test('GET /api/tickets - Helpdesk & Service Queue', async () => {
    const res = await request('GET', '/api/tickets');
    assert(res.status === 200 && res.body.count > 0, 'Expected ticket queue');
  });

  await test('GET /api/timetable - Master Timetable Slots', async () => {
    const res = await request('GET', '/api/timetable');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('GET /api/events - Timetable Custom Class Events', async () => {
    const res = await request('GET', '/api/events');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body.data), 'Expected array of events');
  });

  await test('POST /api/events - Create Custom Timetable Event', async () => {
    const res = await request('POST', '/api/events', {
      title: 'Robotics Workshop',
      day: 'Wednesday',
      time: '14:00',
      room: 'STEM Lab'
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.body.data.id.startsWith('EV-'), 'Expected EV- id prefix');
  });

  // 9. Universal Global Search
  await test('GET /api/search - Universal Type-Ahead Across 5 Tables', async () => {
    const res = await request('GET', '/api/search?q=Shah');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.total > 0, 'Expected search hits for query "Shah"');
    assert(res.body.results.some(r => r.type === 'Student' || r.type === 'Lead'), 'Expected matching student/lead');
  });

  // 10. Reports & Analytics
  await test('GET /api/reports - Executive Intelligence & Funnel Analytics', async () => {
    const res = await request('GET', '/api/reports');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.admissions.conversionRate, 'Expected admissions conversion rate');
    assert(res.body.finance.recoveryRate, 'Expected financial recovery rate');
  });

  // 11. Full State Sync
  await test('GET /api/sync - Full Client Hydration Dump', async () => {
    const res = await request('GET', '/api/sync');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body.data.students), 'Expected students array in sync dump');
    assert(Array.isArray(res.body.data.leads), 'Expected leads array in sync dump');
  });

  // 12. CSV Export
  await test('GET /api/export/students - CSV Stream Download', async () => {
    const res = await request('GET', '/api/export/students');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(typeof res.body === 'string' && res.body.includes('id,name,grade'), 'Expected valid CSV header');
  });

  console.log('\n------------------------------------------------------');
  console.log(`  Tests Completed: ${passed + failed}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

server = app.listen(9876, async () => {
  try {
    await runTests();
  } catch (e) {
    console.error('Fatal test error:', e);
  } finally {
    server.close();
    process.exit(0);
  }
});
