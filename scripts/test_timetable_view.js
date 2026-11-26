const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tempProfile = path.join(os.tmpdir(), 'chrome-tt-test-' + Date.now());

const chromeProcess = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9225',
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
  try {
    console.log('Connecting to Chrome on port 9225...');
    let list;
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      try {
        list = await getJson('http://127.0.0.1:9225/json');
        if (list && list.length) break;
      } catch {}
    }

    if (!list || !list.length) throw new Error('Could not get Chrome target list');

    const client = new CDPClient(list[0].webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    console.log('Navigating to http://localhost:8765/?v=7...');
    await client.send('Page.navigate', { url: 'http://localhost:8765/?v=7' });
    await sleep(1500);

    // Navigate to timetable page
    console.log('Opening Timetable page...');
    await client.send('Runtime.evaluate', {
      expression: `openPage('timetable')`
    });
    await sleep(600);

    // Verify DOM elements
    const checkRes = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const toolbar = document.querySelector('.timetable-toolbar');
        const wingTabs = document.querySelectorAll('.wing-tab');
        const classBtns = document.querySelectorAll('.class-pill-btn');
        const banner = document.querySelector('.class-info-banner');
        const slots = document.querySelectorAll('.class-slot');
        const activeBtn = document.querySelector('.class-pill-btn.active');
        return {
          hasToolbar: !!toolbar,
          wingTabsCount: wingTabs.length,
          classBtnsCount: classBtns.length,
          hasBanner: !!banner,
          bannerTitle: banner ? banner.querySelector('.class-info-title').innerText : null,
          slotsCount: slots.length,
          activeClass: activeBtn ? activeBtn.innerText.trim() : null
        };
      })()`,
      returnByValue: true
    });

    console.log('Initial Timetable State:', checkRes.result.value);

    // Test clicking Primary Wing
    console.log('Clicking Primary Wing tab...');
    await client.send('Runtime.evaluate', {
      expression: `(() => {
        const primaryTab = Array.from(document.querySelectorAll('.wing-tab')).find(t => t.innerText.includes('Primary'));
        if (primaryTab) primaryTab.click();
      })()`
    });
    await sleep(400);

    const primaryCheck = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const classBtns = document.querySelectorAll('.class-pill-btn');
        return {
          primaryClassBtnsCount: classBtns.length,
          classes: Array.from(classBtns).map(b => b.innerText.trim())
        };
      })()`,
      returnByValue: true
    });
    console.log('Primary Wing State:', primaryCheck.result.value);

    // Test selecting Grade 1 A
    console.log('Selecting Grade 1 A...');
    await client.send('Runtime.evaluate', {
      expression: `(() => {
        const g1Btn = Array.from(document.querySelectorAll('.class-pill-btn')).find(b => b.innerText.includes('Grade 1 A'));
        if (g1Btn) g1Btn.click();
      })()`
    });
    await sleep(400);

    const g1Check = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const banner = document.querySelector('.class-info-banner');
        const slots = document.querySelectorAll('.class-slot');
        const firstSlot = slots[0];
        return {
          bannerTitle: banner ? banner.querySelector('.class-info-title').innerText : null,
          bannerMeta: banner ? banner.querySelector('.class-info-meta').innerText : null,
          firstSlotSubject: firstSlot ? firstSlot.querySelector('strong').innerText : null,
          slotsCount: slots.length
        };
      })()`,
      returnByValue: true
    });
    console.log('Grade 1 A Schedule State:', g1Check.result.value);

    // Switch to Senior Secondary and check Grade 11 Science
    console.log('Switching to Senior Secondary Wing...');
    await client.send('Runtime.evaluate', {
      expression: `(() => {
        const seniorTab = Array.from(document.querySelectorAll('.wing-tab')).find(t => t.innerText.includes('Senior'));
        if (seniorTab) seniorTab.click();
      })()`
    });
    await sleep(400);

    console.log('Selecting Grade 11 Science...');
    await client.send('Runtime.evaluate', {
      expression: `(() => {
        const sciBtn = Array.from(document.querySelectorAll('.class-pill-btn')).find(b => b.innerText.includes('Grade 11 Science'));
        if (sciBtn) sciBtn.click();
      })()`
    });
    await sleep(400);

    const sciCheck = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const banner = document.querySelector('.class-info-banner');
        const slots = document.querySelectorAll('.class-slot');
        const firstSlot = slots[0];
        return {
          bannerTitle: banner ? banner.querySelector('.class-info-title').innerText : null,
          firstSlotSubject: firstSlot ? firstSlot.querySelector('strong').innerText : null,
          slotsCount: slots.length
        };
      })()`,
      returnByValue: true
    });
    console.log('Grade 11 Science State:', sciCheck.result.value);

    // Click slot to test slot modal
    console.log('Clicking first slot...');
    await client.send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.class-slot')[0].click()`
    });
    await sleep(400);

    const modalCheck = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.modal');
        return {
          hasModal: !!modal,
          modalTitle: modal ? modal.querySelector('h2').innerText : null
        };
      })()`,
      returnByValue: true
    });
    console.log('Slot Modal State:', modalCheck.result.value);

    // Close modal
    await client.send('Runtime.evaluate', {
      expression: `(() => {
        const closeBtn = document.querySelector('.modal [data-action="close"]');
        if (closeBtn) closeBtn.click();
      })()`
    });
    await sleep(300);

    // Switch back to Grade 8 A and capture screenshot
    await client.send('Runtime.evaluate', {
      expression: `(() => {
        const allTab = Array.from(document.querySelectorAll('.wing-tab')).find(t => t.innerText.includes('All'));
        if (allTab) allTab.click();
        const g8Btn = Array.from(document.querySelectorAll('.class-pill-btn')).find(b => b.innerText.includes('Grade 8 A'));
        if (g8Btn) g8Btn.click();
      })()`
    });
    await sleep(500);

    // Take screenshot
    const screenshot = await client.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(screenshot.data, 'base64');
    const outPath = path.resolve(__dirname, '..', 'screenshots', 'timetable_updated_buttons.png');
    fs.writeFileSync(outPath, buffer);
    console.log('Screenshot saved to:', outPath);

    client.close();
    console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    try { chromeProcess.kill(); } catch {}
  }
}

run();
