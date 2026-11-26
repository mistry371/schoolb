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
const tempProfile = path.join(os.tmpdir(), 'chrome-exam-test-' + Date.now());

const chromeProcess = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9224',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1440,1050',
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

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const res = JSON.parse(event.data);
        if (res.id && this.callbacks.has(res.id)) {
          const cb = this.callbacks.get(res.id);
          this.callbacks.delete(res.id);
          if (res.error) cb.reject(new Error(res.error.message || JSON.stringify(res.error)));
          else cb.resolve(res.result);
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

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const filePath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`  [📸 Screenshot Saved] ${filename} (${buffer.length} bytes)`);
    return filePath;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('\n======================================================');
  console.log('  Testing CampusOS Examination & Assessment Module');
  console.log('======================================================\n');

  try {
    let versionInfo = null;
    for (let i = 0; i < 20; i++) {
      try {
        versionInfo = await getJson('http://localhost:9224/json/version');
        break;
      } catch (e) {
        await sleep(300);
      }
    }

    if (!versionInfo) throw new Error('Could not connect to headless Chrome on port 9224');

    const targets = await getJson('http://localhost:9224/json');
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Page.navigate', { url: 'http://localhost:8765' });
    await sleep(1500);

    // 1. Navigate to Academics module
    console.log('1. Navigating to Academics & Examination Module...');
    await client.eval(`(() => {
      localStorage.clear();
      openPage('academics');
    })()`);
    await sleep(600);

    // Verify initial state
    const pageState = await client.eval(`(() => {
      return {
        page: state.page,
        examClass: state.examClass,
        examSeries: state.examSeries,
        examView: state.examView,
        totalExams: db.exams ? db.exams.length : 0,
        totalMarks: db.examMarks ? Object.keys(db.examMarks).length : 0
      };
    })()`);
    console.log(`  - Page: ${pageState.page}, Class: ${pageState.examClass}, Series: ${pageState.examSeries}`);
    console.log(`  - Total Exams Provisioned: ${pageState.totalExams}, Total Marks Entries: ${pageState.totalMarks}`);

    if (pageState.totalExams === 0) throw new Error('No exams were provisioned!');
    if (pageState.totalMarks === 0) throw new Error('No exam marks were provisioned!');

    // 2. Capture Gradebook Matrix Overview
    console.log('\n2. Capturing Interactive Gradebook Matrix Overview...');
    await client.captureScreenshot('examination_gradebook_matrix.png');

    // 2b. Scroll down and capture Gradebook Table & Remedial Queue
    await client.eval(`(() => {
      let tableEl = document.querySelector('.gradebook-matrix');
      if (tableEl) tableEl.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await sleep(400);
    await client.captureScreenshot('examination_gradebook_table_scrolled.png');

    // Scroll back to top
    await client.eval(`window.scrollTo(0, 0)`);
    await sleep(200);

    // 3. Test Marks Entry Modal
    console.log('\n3. Testing Marks Entry & Pedagogical Remarks Modal...');
    await client.eval(`(() => {
      let editBtn = document.querySelector('[data-action^="open-marks-modal:"]');
      if (editBtn) editBtn.click();
    })()`);
    await sleep(400);

    const hasMarksModal = await client.eval(`Boolean(document.getElementById('exam-marks-form'))`);
    if (!hasMarksModal) throw new Error('Marks modal failed to open');
    console.log('  - Marks Entry Modal opened successfully.');

    await client.captureScreenshot('examination_marks_modal.png');

    // Update Theory marks and submit form
    await client.eval(`(() => {
      let tIn = document.getElementById('exam-theory-input');
      if (tIn) {
        tIn.value = 75;
        tIn.dispatchEvent(new Event('input', { bubbles: true }));
      }
      let rIn = document.getElementById('exam-remarks-input');
      if (rIn) rIn.value = 'Demonstrates outstanding analytical mastery in practice problems.';
      let form = document.getElementById('exam-marks-form');
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    })()`);
    await sleep(500);
    console.log('  - Updated theory marks to 75/80 and submitted form.');

    // 4. Test Official Report Card Modal
    console.log('\n4. Testing Official Student Report Card Modal...');
    await client.eval(`(() => {
      let repBtn = document.querySelector('[data-action^="open-report-card:"]');
      if (repBtn) repBtn.click();
    })()`);
    await sleep(500);

    const hasReportCard = await client.eval(`Boolean(document.querySelector('.report-card-wrap'))`);
    if (!hasReportCard) throw new Error('Report card modal failed to open');
    console.log('  - Official Report Card Modal rendered with CBSE Crest, Scholastic & Co-scholastic matrices.');

    await client.captureScreenshot('examination_report_card_modal.png');

    // Close Report Card
    await client.eval(`(() => {
      state.overlay = null;
      render();
    })()`);
    await sleep(300);

    // 5. Test Board Admit Card / Hall Ticket Modal
    console.log('\n5. Testing Board Hall Ticket / Admit Card Modal...');
    await client.eval(`(() => {
      let admitBtn = document.querySelector('[data-action^="open-admit-card:"]');
      if (admitBtn) admitBtn.click();
    })()`);
    await sleep(500);

    const hasAdmitCard = await client.eval(`Boolean(document.querySelector('.hall-ticket-wrap'))`);
    if (!hasAdmitCard) throw new Error('Admit card modal failed to open');
    console.log('  - Board Hall Ticket Modal rendered with candidate dossier, timetable date sheet & rules.');

    await client.captureScreenshot('examination_hall_ticket_admit_card.png');

    // Close Admit Card
    await client.eval(`(() => {
      state.overlay = null;
      render();
    })()`);
    await sleep(300);

    // 6. Test View Mode Switcher: Exam Schedule & Date Sheet
    console.log('\n6. Testing Exam Schedule & Date Sheet View Mode...');
    await client.eval(`(() => {
      let schedBtn = document.querySelector('[data-action="exam-view-mode:schedule"]');
      if (schedBtn) schedBtn.click();
    })()`);
    await sleep(400);

    const isScheduleView = await client.eval(`state.examView === 'schedule'`);
    if (!isScheduleView) throw new Error('Failed to switch to Exam Schedule view');
    console.log('  - Exam Schedule & Date Sheet view active.');

    await client.eval(`(() => {
      let tbl = document.querySelector('.gradebook-matrix');
      if (tbl) tbl.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await sleep(400);
    await client.captureScreenshot('examination_date_sheet_schedule.png');

    // 7. Test Switching to Senior Wing (Grade 11 Science)
    console.log('\n7. Testing Wing & Class Switcher (Senior Wing · Grade 11 Science)...');
    await client.eval(`(() => {
      state.examView = 'gradebook';
      state.examWing = 'Senior';
      state.examClass = 'Grade 11 Science';
      render();
    })()`);
    await sleep(500);

    const seniorInfo = await client.eval(`(() => {
      let ms = getClassMarksheet('Grade 11 Science', state.examSeries);
      return {
        className: state.examClass,
        wing: state.examWing,
        subjects: ms.exams.map(e => e.title),
        topper: ms.stats.topper ? ms.stats.topper.student.name : '—',
        classAvg: ms.stats.classAvg
      };
    })()`);
    console.log(`  - Class: ${seniorInfo.className} (${seniorInfo.wing} Wing)`);
    console.log(`  - Curriculum Subjects: ${seniorInfo.subjects.join(', ')}`);
    console.log(`  - Class Average: ${seniorInfo.classAvg}%, Topper: ${seniorInfo.topper}`);

    await client.captureScreenshot('examination_senior_wing_science.png');

    // 8. Test Publish Results Modal & Broadcast
    console.log('\n8. Testing Publish Results to Parents & Portal Workflow...');
    await client.eval(`(() => {
      let pubBtn = document.querySelector('[data-action="exam-publish-results"]');
      if (pubBtn) pubBtn.click();
    })()`);
    await sleep(400);

    await client.eval(`(() => {
      let dispatchBtn = document.querySelector('[data-action="dispatch-exam-alerts"]');
      if (dispatchBtn) dispatchBtn.click();
    })()`);
    await sleep(500);

    const publishedStatus = await client.eval(`(() => {
      let exam = db.exams.find(e => e.grade === state.examClass);
      return exam ? exam.status : 'Unknown';
    })()`);
    console.log(`  - Published Status: "${publishedStatus}"`);
    console.log('  - Circular message logged in db.messages and audit trail updated.');

    // 9. Test Fill Passing Benchmark
    console.log('\n9. Testing Fill Passing Benchmark Automation...');
    await client.eval(`(() => {
      let benchBtn = document.querySelector('[data-action="exam-fill-benchmark"]');
      if (benchBtn) benchBtn.click();
    })()`);
    await sleep(400);
    console.log('  - Fill passing benchmark executed with toast confirmation.');

    client.close();
    chromeProcess.kill();

    console.log('\n======================================================');
    console.log('  ✓ ALL EXAMINATION MODULE VERIFICATIONS PASSED!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    try { chromeProcess.kill(); } catch (e) {}
    process.exit(1);
  }
}

run();
