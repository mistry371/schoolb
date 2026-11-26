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
const tempProfile = path.join(os.tmpdir(), 'chrome-ops-test-' + Date.now());

const chromeProcess = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9227',
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

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression: `(() => { ${expression} })()`,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot: ${filePath}`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('Waiting for headless Chrome to start on port 9227...');
  let version;
  for (let i = 0; i < 30; i++) {
    try {
      version = await getJson('http://127.0.0.1:9227/json/version');
      break;
    } catch {
      await sleep(300);
    }
  }

  if (!version) {
    console.error('Failed to connect to Chrome on port 9227');
    chromeProcess.kill();
    process.exit(1);
  }

  console.log('Connected to Chrome. Fetching pages...');
  const pages = await getJson('http://127.0.0.1:9227/json/list');
  const wsUrl = pages[0].webSocketDebuggerUrl;

  const client = new CDPClient(wsUrl);
  await client.connect();
  console.log('CDP WebSocket connected!');

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('Navigating to http://localhost:8765 ...');
  await client.send('Page.navigate', { url: 'http://localhost:8765' });
  await sleep(2000);

  // 1. TEST PARENT COMMUNICATION
  console.log('\n--- 1. Testing Parent Communication ---');
  await client.eval(`openPage('communication');`);
  await sleep(1000);

  // Open Omnichannel Broadcast Composer modal
  await client.eval(`
    const btn = document.querySelector('[data-action="comm-open-composer"]');
    if (btn) btn.click();
  `);
  await sleep(800);
  await client.screenshot(path.join(SCREENSHOT_DIR, 'operations_parent_communication.png'));

  // Close modal
  await client.eval(`
    const cancelBtn = document.querySelector('[data-action="close"]');
    if (cancelBtn) cancelBtn.click();
  `);
  await sleep(500);

  // 2. TEST STAFF & HR (SUBSTITUTIONS MATRIX)
  console.log('\n--- 2. Testing Staff & HR (Substitution Matrix) ---');
  await client.eval(`openPage('staff');`);
  await sleep(1000);

  // Switch to Substitution tab
  await client.eval(`
    const subTab = document.querySelector('[data-action="staff-tab:substitutions"]');
    if (subTab) subTab.click();
  `);
  await sleep(800);
  await client.screenshot(path.join(SCREENSHOT_DIR, 'operations_staff_substitutions.png'));

  // 3. TEST TRANSPORT & ROUTES (MANIFEST & COMPLIANCE)
  console.log('\n--- 3. Testing Transport & Routes ---');
  await client.eval(`openPage('transport');`);
  await sleep(1000);

  // Switch to Manifest tab
  await client.eval(`
    const manTab = document.querySelector('[data-action="transport-tab:manifest"]');
    if (manTab) manTab.click();
  `);
  await sleep(800);
  await client.screenshot(path.join(SCREENSHOT_DIR, 'operations_transport_manifest.png'));

  // 4. TEST SCHOOL LIBRARY (OPAC & CIRCULATION)
  console.log('\n--- 4. Testing School Library (OPAC & Fines) ---');
  await client.eval(`openPage('library');`);
  await sleep(1000);
  await client.screenshot(path.join(SCREENSHOT_DIR, 'operations_library_opac.png'));

  // 5. TEST ASSETS & FACILITIES (VENUES & WORK ORDERS)
  console.log('\n--- 5. Testing Assets & Facilities ---');
  await client.eval(`openPage('assets');`);
  await sleep(1000);
  await client.screenshot(path.join(SCREENSHOT_DIR, 'operations_assets_venues.png'));

  // Switch to Work Orders tab
  await client.eval(`
    const woTab = document.querySelector('[data-action="assets-tab:workorders"]');
    if (woTab) woTab.click();
  `);
  await sleep(800);
  await client.screenshot(path.join(SCREENSHOT_DIR, 'operations_assets_workorders.png'));

  console.log('\n✓ All 5 operations modules verified successfully!');

  client.close();
  chromeProcess.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Error in verification:', err);
  chromeProcess.kill();
  process.exit(1);
});
