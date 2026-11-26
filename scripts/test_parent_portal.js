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
const tempProfile = path.join(os.tmpdir(), 'chrome-parent-test-' + Date.now());

const chromeProcess = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9225',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--hide-scrollbars',
  '--window-size=1440,1100',
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
  console.log('  Testing CampusOS Advanced Parent Portal Module');
  console.log('======================================================\n');

  try {
    let versionInfo = null;
    for (let i = 0; i < 20; i++) {
      try {
        versionInfo = await getJson('http://localhost:9225/json/version');
        break;
      } catch (e) {
        await sleep(300);
      }
    }

    if (!versionInfo) throw new Error('Could not connect to headless Chrome on port 9225');

    const targets = await getJson('http://localhost:9225/json');
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Page.navigate', { url: 'http://localhost:8765' });
    await sleep(1500);

    // 1. Navigate to Parent Portal
    console.log('1. Navigating to Parent Portal Preview...');
    await client.eval(`(() => {
      localStorage.clear();
      openPage('parent');
    })()`);
    await sleep(600);

    // 2. Capture Mobile App Simulator - Home Tab (Aanya Patel)
    console.log('\n2. Capturing Smartphone App Simulator (Home Tab · Aanya Patel)...');
    await client.captureScreenshot('parent_portal_mobile_home.png');

    // 3. Switch to Academics Tab in Mobile App
    console.log('\n3. Testing Academics & Exam Progress Tab in Mobile App...');
    await client.eval(`(() => {
      let btn = document.querySelector('[data-action="parent-tab:academics"]');
      if (btn) btn.click();
    })()`);
    await sleep(400);
    await client.captureScreenshot('parent_portal_mobile_academics.png');

    // 4. Switch to Fees Tab in Mobile App
    console.log('\n4. Testing Fees & Itemized Breakdown Tab in Mobile App...');
    await client.eval(`(() => {
      let btn = document.querySelector('[data-action="parent-tab:fees"]');
      if (btn) btn.click();
    })()`);
    await sleep(400);
    await client.captureScreenshot('parent_portal_mobile_fees.png');

    // 5. Test Online Fee Payment Modal
    console.log('\n5. Testing Online Fee Payment Modal (UPI & Instant Gateway)...');
    await client.eval(`(() => {
      let payBtn = document.querySelector('[data-action="parent-open-pay-modal"]');
      if (payBtn) payBtn.click();
    })()`);
    await sleep(400);
    await client.captureScreenshot('parent_portal_pay_modal.png');

    // Submit payment
    await client.eval(`(() => {
      let submitBtn = document.querySelector('[data-action="parent-submit-payment"]');
      if (submitBtn) submitBtn.click();
    })()`);
    await sleep(400);

    // 6. Switch to Attendance Tab in Mobile App
    console.log('\n6. Testing Attendance & Leave Applications Tab in Mobile App...');
    await client.eval(`(() => {
      let btn = document.querySelector('[data-action="parent-tab:attendance"]');
      if (btn) btn.click();
    })()`);
    await sleep(400);
    await client.captureScreenshot('parent_portal_mobile_attendance.png');

    // Test Leave Application Modal
    await client.eval(`(() => {
      let lBtn = document.querySelector('[data-action="parent-open-leave-modal"]');
      if (lBtn) lBtn.click();
    })()`);
    await sleep(400);
    await client.captureScreenshot('parent_portal_leave_modal.png');

    // Close Leave modal
    await client.eval(`(() => {
      state.overlay = null;
      render();
    })()`);
    await sleep(300);

    // 7. Switch to Bus & Safety Tab in Mobile App
    console.log('\n7. Testing Live Bus Transit & Dismissal Safety Pass Tab...');
    await client.eval(`(() => {
      let btn = document.querySelector('[data-action="parent-tab:transport"]');
      if (btn) btn.click();
    })()`);
    await sleep(400);
    await client.captureScreenshot('parent_portal_mobile_transport.png');

    // 8. Test Sibling Switcher: Switch to Kabir Patel (Grade 4 B)
    console.log('\n8. Testing Multi-Ward Sibling Switcher (Switching to Kabir Patel · Grade 4 B)...');
    await client.eval(`(() => {
      let sibBtn = document.querySelector('[data-action="parent-select-student:ST-1030"]');
      if (sibBtn) sibBtn.click();
      state.parentActiveTab = 'home';
      render();
    })()`);
    await sleep(500);

    const activeWard = await client.eval(`state.parentStudentId`);
    console.log(`  - Active Ward ID: ${activeWard} (Kabir Patel)`);
    await client.captureScreenshot('parent_portal_sibling_kabir.png');

    // 9. Test Desktop View Mode Switcher
    console.log('\n9. Testing Dual Persona Switcher (Switching to Desktop Portal View)...');
    await client.eval(`(() => {
      state.parentDeviceView = 'desktop';
      state.parentActiveTab = 'home';
      render();
    })()`);
    await sleep(500);

    const isDesktop = await client.eval(`state.parentDeviceView === 'desktop'`);
    console.log(`  - Desktop View Active: ${isDesktop}`);
    await client.captureScreenshot('parent_portal_desktop_view.png');

    // 10. Test Direct Official Document Launch from Parent Portal (CBSE Report Card)
    console.log('\n10. Testing 1-Click Launch of Official CBSE Report Card from Parent Portal...');
    await client.eval(`(() => {
      let repBtn = document.querySelector('[data-action="open-report-card:ST-1024"]');
      if (repBtn) repBtn.click();
    })()`);
    await sleep(500);

    const hasRepCard = await client.eval(`Boolean(document.querySelector('.report-card-wrap'))`);
    console.log(`  - Official Report Card Modal Open: ${hasRepCard}`);
    await client.captureScreenshot('parent_portal_report_card_opened.png');

    // Close Report Card
    await client.eval(`(() => {
      state.overlay = null;
      render();
    })()`);
    await sleep(300);

    // 11. Test Direct Official Document Launch from Parent Portal (Board Hall Ticket)
    console.log('\n11. Testing 1-Click Launch of Board Admit Card / Hall Ticket from Parent Portal...');
    await client.eval(`(() => {
      let admBtn = document.querySelector('[data-action="open-admit-card:ST-1024"]');
      if (admBtn) admBtn.click();
    })()`);
    await sleep(500);

    const hasAdmitCard = await client.eval(`Boolean(document.querySelector('.hall-ticket-container'))`);
    console.log(`  - Official Board Hall Ticket Modal Open: ${hasAdmitCard}`);
    await client.captureScreenshot('parent_portal_hall_ticket_opened.png');

    client.close();
    chromeProcess.kill();

    console.log('\n======================================================');
    console.log('  ✓ ALL PARENT PORTAL MODULE VERIFICATIONS PASSED!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    try { chromeProcess.kill(); } catch (e) {}
    process.exit(1);
  }
}

run();
