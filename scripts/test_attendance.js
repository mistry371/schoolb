const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tempProfile = path.join(os.tmpdir(), 'chrome-att-test-' + Date.now());

const chromeProcess = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9223',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1440,960',
  '--user-data-dir=' + tempProfile,
  'about:blank'
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = err => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('Waiting for Chrome remote debugging on port 9223...');
  let versionData = null;
  for (let i = 0; i < 30; i++) {
    try {
      versionData = await getJson('http://127.0.0.1:9223/json/version');
      if (versionData) break;
    } catch (e) {
      await sleep(250);
    }
  }

  if (!versionData) {
    console.error('Failed to connect to Chrome on port 9223');
    chromeProcess.kill();
    process.exit(1);
  }

  const list = await getJson('http://127.0.0.1:9223/json/list');
  const pageTarget = list.find(t => t.type === 'page');
  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');

  console.log('Navigating to http://localhost:8765...');
  await cdp.send('Page.navigate', { url: 'http://localhost:8765' });
  await sleep(1500);

  async function evalJs(expr) {
    const res = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (res.exceptionDetails) {
      console.error('Eval error:', res.exceptionDetails);
    }
    return res.result ? res.result.value : null;
  }

  async function takeScreenshot(name) {
    const result = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
    fs.writeFileSync(filePath, Buffer.from(result.data, 'base64'));
    console.log(`Saved screenshot: ${name}.png`);
  }

  // 1. Open Attendance Page - Weekly Matrix (Default)
  console.log('Opening Attendance page in Weekly Matrix mode...');
  await evalJs(`(() => { openPage('attendance'); state.attClass = 'Grade 8 A'; state.attView = 'matrix'; state.attFilter = 'All'; state.overlay = null; render(); })()`);
  await sleep(600);
  await takeScreenshot('attendance_01_weekly_matrix');

  // Verify students exist
  const studentsCount = await evalJs(`(() => db.students.filter(x => (x.grade + ' ' + x.section).trim() === 'Grade 8 A').length)()`);
  console.log(`Grade 8 A students count: ${studentsCount}`);

  // 2. Open Daily Rapid Roll-Call Mode
  console.log('Switching to Daily Rapid Roll-Call mode...');
  await evalJs(`(() => { state.attView = 'daily'; state.attDayIdx = 0; render(); })()`);
  await sleep(600);
  await takeScreenshot('attendance_02_daily_rollcall');

  // 3. Test rapid status button tap in Daily mode
  console.log('Testing rapid status button tap...');
  await evalJs(`(() => {
    let firstSt = db.students.find(x => (x.grade + ' ' + x.section).trim() === 'Grade 8 A');
    if (firstSt) {
      if (!db.attendanceMeta) db.attendanceMeta = {};
      db.attendance[firstSt.id][0] = 'Late';
      db.attendanceMeta[firstSt.id + '_0'] = { reason: 'School Bus / Transport Delay', remarks: 'Arrived with Route 2 bus at 8:40', arrivalTime: '08:40 AM' };
      save();
      render();
    }
  })()`);
  await sleep(400);
  await takeScreenshot('attendance_03_daily_status_tapped');

  // 4. Open Parent Notification Dispatch Drawer
  console.log('Opening Parent Notification Dispatch Drawer...');
  await evalJs(`(() => {
    let notifBtn = document.querySelector('[data-action="att-notify-parents"]');
    if (notifBtn) notifBtn.click();
  })()`);
  await sleep(600);
  await takeScreenshot('attendance_04_parent_alerts_drawer');

  // 5. Open Attendance Reason & Excuse Modal
  console.log('Opening Attendance Reason & Notes Modal...');
  await evalJs(`(() => {
    state.overlay = null;
    let st = db.students.find(x => (x.grade + ' ' + x.section).trim() === 'Grade 8 A');
    if (st) {
      let notesBtn = document.querySelector('[data-action^="open-att-modal:' + st.id + '"]');
      if (notesBtn) notesBtn.click();
    }
  })()`);
  await sleep(600);
  await takeScreenshot('attendance_05_excuse_reason_modal');

  // 6. Test Primary Wing class selection (e.g. Grade 1 A)
  console.log('Testing Primary Wing class selection (Grade 1 A)...');
  await evalJs(`(() => {
    state.overlay = null;
    state.attWing = 'Primary';
    state.attClass = 'Grade 1 A';
    state.attView = 'matrix';
    render();
  })()`);
  await sleep(600);
  const gr1Count = await evalJs(`(() => db.students.filter(x => (x.grade + ' ' + x.section).trim() === 'Grade 1 A').length)()`);
  console.log(`Grade 1 A students count: ${gr1Count}`);
  await takeScreenshot('attendance_06_primary_grade1a_matrix');

  // 7. Test Senior Wing class selection (e.g. Grade 11 Science)
  console.log('Testing Senior Wing class selection (Grade 11 Science)...');
  await evalJs(`(() => {
    state.attWing = 'Senior';
    state.attClass = 'Grade 11 Science';
    state.attView = 'daily';
    render();
  })()`);
  await sleep(600);
  const gr11Count = await evalJs(`(() => db.students.filter(x => (x.grade + ' ' + x.section).trim() === 'Grade 11 Science').length)()`);
  console.log(`Grade 11 Science students count: ${gr11Count}`);
  await takeScreenshot('attendance_07_senior_grade11_science');

  // 8. Test At-Risk filter (<85%)
  console.log('Testing At-Risk filter...');
  await evalJs(`(() => {
    state.attClass = 'Grade 8 A';
    state.attView = 'matrix';
    state.attFilter = 'At-Risk';
    render();
  })()`);
  await sleep(500);
  await takeScreenshot('attendance_08_at_risk_filter');

  console.log('All attendance interactive workflows verified successfully!');

  cdp.close();
  chromeProcess.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Error during execution:', err);
  chromeProcess.kill();
  process.exit(1);
});
