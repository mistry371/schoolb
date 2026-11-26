const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tempProfile = path.join(os.tmpdir(), 'chrome-refresh-test-' + Date.now());

const chromeProcess = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9228',
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

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('Connecting to Chrome on port 9228...');
  let version;
  for (let i = 0; i < 30; i++) {
    try {
      version = await getJson('http://127.0.0.1:9228/json/version');
      break;
    } catch {
      await sleep(300);
    }
  }

  if (!version) {
    console.error('Failed to connect to Chrome on port 9228');
    chromeProcess.kill();
    process.exit(1);
  }

  const pages = await getJson('http://127.0.0.1:9228/json/list');
  const client = new CDPClient(pages[0].webSocketDebuggerUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('Runtime.enable');

  console.log('1. Loading http://localhost:8765 initial load...');
  await client.send('Page.navigate', { url: 'http://localhost:8765' });
  await sleep(1500);

  // 1. Check initial page (should be overview)
  let initialPage = await client.eval('return state.page;');
  console.log('Initial page:', initialPage);
  if (initialPage !== 'overview') throw new Error(`Expected overview, got ${initialPage}`);

  // 2. Navigate to Timetable
  console.log('\n2. Navigating to Timetable...');
  await client.eval("openPage('timetable');");
  await sleep(500);
  let hash1 = await client.eval('return window.location.hash;');
  let page1 = await client.eval('return state.page;');
  console.log('Current page:', page1, '| URL Hash:', hash1);
  if (page1 !== 'timetable' || hash1 !== '#/timetable') {
    throw new Error(`Failed to navigate to timetable: page=${page1}, hash=${hash1}`);
  }

  // 3. REFRESH / RELOAD PAGE
  console.log('\n3. Reloading page (F5 / Refresh simulation)...');
  await client.send('Page.reload');
  await sleep(1500);

  let pageAfterReload1 = await client.eval('return state.page;');
  let hashAfterReload1 = await client.eval('return window.location.hash;');
  console.log('After reload -> Page:', pageAfterReload1, '| Hash:', hashAfterReload1);
  if (pageAfterReload1 !== 'timetable' || hashAfterReload1 !== '#/timetable') {
    throw new Error(`REFRESH FAILED: Expected timetable, got ${pageAfterReload1}`);
  }
  console.log('✓ SUCCESS: User stayed on Timetable after page refresh!');

  // 4. Navigate to Transport & switch tab to manifest
  console.log('\n4. Navigating to Transport and selecting Passenger Manifest & RT-03...');
  await client.eval("openPage('transport');");
  await sleep(300);
  await client.eval("const tab = document.querySelector('[data-action=\"transport-tab:manifest\"]'); if (tab) tab.click();");
  await sleep(300);
  await client.eval("const rBtn = document.querySelector('[data-action=\"transport-select-route:RT-03\"]'); if (rBtn) rBtn.click();");
  await sleep(300);

  let tPage = await client.eval('return state.page;');
  let tView = await client.eval('return state.transportView;');
  let tRoute = await client.eval('return state.transportSelectedRoute;');
  console.log(`Transport State -> Page: ${tPage}, View: ${tView}, Route: ${tRoute}`);

  // 5. REFRESH / RELOAD TRANSPORT PAGE
  console.log('\n5. Reloading Transport page...');
  await client.send('Page.reload');
  await sleep(1500);

  let tPageReload = await client.eval('return state.page;');
  let tViewReload = await client.eval('return state.transportView;');
  let tRouteReload = await client.eval('return state.transportSelectedRoute;');
  console.log(`After reload -> Page: ${tPageReload}, View: ${tViewReload}, Route: ${tRouteReload}`);
  if (tPageReload !== 'transport' || tViewReload !== 'manifest' || tRouteReload !== 'RT-03') {
    throw new Error(`REFRESH FAILED: Expected transport manifest RT-03, got page=${tPageReload}, view=${tViewReload}, route=${tRouteReload}`);
  }
  console.log('✓ SUCCESS: User stayed on Transport Manifest (RT-03) after page refresh!');

  // 6. Navigate to Staff & HR -> Substitutions tab
  console.log('\n6. Navigating to Staff & HR -> Substitutions tab...');
  await client.eval("openPage('staff');");
  await sleep(300);
  await client.eval("const subTab = document.querySelector('[data-action=\"staff-tab:substitutions\"]'); if (subTab) subTab.click();");
  await sleep(300);

  // 7. REFRESH / RELOAD STAFF PAGE
  console.log('\n7. Reloading Staff & HR page...');
  await client.send('Page.reload');
  await sleep(1500);

  let sPageReload = await client.eval('return state.page;');
  let sViewReload = await client.eval('return state.staffView;');
  console.log(`After reload -> Page: ${sPageReload}, View: ${sViewReload}`);
  if (sPageReload !== 'staff' || sViewReload !== 'substitutions') {
    throw new Error(`REFRESH FAILED: Expected staff substitutions, got page=${sPageReload}, view=${sViewReload}`);
  }
  console.log('✓ SUCCESS: User stayed on Staff Daily Substitutions after page refresh!');

  // 8. Test Direct Deep Link in URL hash
  console.log('\n8. Testing direct deep link URL: http://localhost:8765/#/parent ...');
  await client.send('Page.navigate', { url: 'http://localhost:8765/#/parent' });
  await sleep(1500);

  let pPageDirect = await client.eval('return state.page;');
  console.log(`Direct deep link page: ${pPageDirect}`);
  if (pPageDirect !== 'parent') {
    throw new Error(`DEEP LINK FAILED: Expected parent, got ${pPageDirect}`);
  }
  console.log('✓ SUCCESS: Deep link directly opened Parent Portal!');

  // 9. Reload Parent Portal
  console.log('\n9. Reloading Parent Portal page...');
  await client.send('Page.reload');
  await sleep(1500);

  let pPageReload = await client.eval('return state.page;');
  console.log(`After reload -> Page: ${pPageReload}`);
  if (pPageReload !== 'parent') {
    throw new Error(`REFRESH FAILED: Expected parent, got ${pPageReload}`);
  }
  console.log('✓ SUCCESS: User stayed on Parent Portal after page refresh!');

  console.log('\n======================================================');
  console.log('🎉 ALL PAGE REFRESH & PERSISTENCE TESTS PASSED!');
  console.log('======================================================\n');

  client.close();
  chromeProcess.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Test error:', err);
  chromeProcess.kill();
  process.exit(1);
});
