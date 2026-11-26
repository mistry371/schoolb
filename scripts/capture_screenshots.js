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
const tempProfile = path.join(os.tmpdir(), 'chrome-ss-' + Date.now());

const chromeProcess = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
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

const scenes = [
  // 1. Overview & Perspectives
  { name: '01_overview_admin_dashboard', setup: `openPage('overview'); state.role='Admin'; state.campus='All campuses'; render();` },
  { name: '02_overview_principal_focus', setup: `state.role='Principal'; render();` },
  { name: '03_overview_admissions_focus', setup: `state.role='Admissions'; render();` },
  { name: '04_overview_teacher_focus', setup: `state.role='Teacher'; render();` },
  { name: '05_overview_finance_focus', setup: `state.role='Finance'; render();` },
  { name: '06_overview_add_task_modal', setup: `state.overlay={type:'custom',title:'Add a priority task',body:'<form id=\"task-form\"><div class=\"form-field\"><label>Task description *</label><input id=\"task-title\" value=\"Review scholarship applications\"></div><div class=\"form-field mt16\"><label>Department & deadline</label><input id=\"task-meta\" value=\"Admissions · Tomorrow 11:00 AM\"></div></form>',action:'save-task',actionLabel:'Add task'}; render();` },
  { name: '07_topbar_notifications_drawer', setup: `state.overlay=null; let a=document.querySelector('[data-action=\"notifications\"]'); if(a) a.click(); render();` },
  { name: '08_topbar_global_search_matches', setup: `state.overlay=null; state.globalQuery='Shah'; state.showGlobalSearch=true; render();` },

  // 2. Admissions
  { name: '09_admissions_pipeline_kanban', setup: `state.showGlobalSearch=false; openPage('admissions'); state.view='pipeline'; state.filter='All'; render();` },
  { name: '10_admissions_list_table', setup: `state.view='list'; render();` },
  { name: '11_admissions_filter_new_enquiry', setup: `state.filter='New enquiry'; render();` },
  { name: '12_admissions_filter_contacted', setup: `state.filter='Contacted'; render();` },
  { name: '13_admissions_filter_school_visit', setup: `state.filter='School visit'; render();` },
  { name: '14_admissions_filter_application', setup: `state.filter='Application'; render();` },
  { name: '15_admissions_filter_admitted', setup: `state.filter='Admitted'; render();` },
  { name: '16_admissions_lead_detail_drawer', setup: `state.filter='All'; state.overlay={type:'detail',key:'leads',id:'AD-2401'}; render();` },
  { name: '17_admissions_lead_admitted_enrol_ready', setup: `state.overlay={type:'detail',key:'leads',id:'AD-2405'}; render();` },
  { name: '18_admissions_create_enquiry_form', setup: `state.overlay={type:'form',key:'leads'}; render();` },

  // 3. Students & Families
  { name: '19_students_all_directory', setup: `state.overlay=null; openPage('students'); state.filter='All'; render();` },
  { name: '20_students_filter_active', setup: `state.filter='Active'; render();` },
  { name: '21_students_search_filter', setup: `state.query='Patel'; render();` },
  { name: '22_students_profile_detail_drawer', setup: `state.query=''; state.overlay={type:'detail',key:'students',id:'ST-1025'}; render();` },
  { name: '23_students_add_student_form', setup: `state.overlay={type:'form',key:'students'}; render();` },

  // 4. Attendance
  { name: '24_attendance_grade_8_a_register', setup: `state.overlay=null; openPage('attendance'); state.attClass='Grade 8 A'; render();` },
  { name: '25_attendance_grade_5_b_register', setup: `state.attClass='Grade 5 B'; render();` },
  { name: '26_attendance_grade_10_b_register', setup: `state.attClass='Grade 10 B'; render();` },

  // 5. Academics & Assessments
  { name: '27_academics_assessments_table', setup: `openPage('academics'); state.filter='All'; render();` },
  { name: '28_academics_filter_scheduled', setup: `state.filter='Scheduled'; render();` },
  { name: '29_academics_filter_completed', setup: `state.filter='Completed'; render();` },
  { name: '30_academics_assessment_detail_drawer', setup: `state.overlay={type:'detail',key:'exams',id:'EX-201'}; render();` },
  { name: '31_academics_schedule_assessment_form', setup: `state.overlay={type:'form',key:'exams'}; render();` },

  // 6. Fees & Invoicing
  { name: '32_fees_invoices_table', setup: `state.overlay=null; openPage('fees'); state.filter='All'; render();` },
  { name: '33_fees_filter_overdue', setup: `state.filter='Overdue'; render();` },
  { name: '34_fees_filter_partial', setup: `state.filter='Partial'; render();` },
  { name: '35_fees_filter_paid', setup: `state.filter='Paid'; render();` },
  { name: '36_fees_invoice_detail_and_quickpay', setup: `state.filter='All'; state.overlay={type:'detail',key:'fees',id:'INV-2026-302'}; render();` },
  { name: '37_fees_create_invoice_form', setup: `state.overlay={type:'form',key:'fees'}; render();` },

  // 7. Timetable
  { name: '38_timetable_weekly_schedule', setup: `state.overlay=null; openPage('timetable'); render();` },
  { name: '39_timetable_class_slot_modal', setup: `state.overlay={type:'custom',title:'Mathematics',body:'<div class=\"detail-row\"><span>Day</span><b>Monday</b></div><div class=\"detail-row\"><span>Time</span><b>08:30 - 09:30</b></div><div class=\"detail-row\"><span>Class</span><b>Grade 8 A</b></div><div class=\"detail-row\"><span>Room</span><b>Room 204</b></div><div class=\"detail-row\"><span>Teacher</span><b>Kavita Iyer</b></div>'}; render();` },
  { name: '40_timetable_add_class_event_modal', setup: `state.overlay={type:'custom',title:'Add class event',body:'<form id=\"event-form\"><div class=\"form-grid\"><div class=\"form-field full\"><label>Event title</label><input value=\"Physics Practical Substitution\"></div><div class=\"form-field\"><label>Day</label><select><option>Thursday</option></select></div><div class=\"form-field\"><label>Time</label><input type=\"time\" value=\"11:30\"></div><div class=\"form-field full\"><label>Room & teacher</label><input value=\"Physics Lab 1 · R. Menon\"></div></div></form>',action:'save-event',actionLabel:'Save event'}; render();` },

  // 8. Parent Portal Preview
  { name: '41_parent_portal_family_preview', setup: `state.overlay=null; openPage('parent'); render();` },

  // 9. Operations Modules
  { name: '42_communication_circulars', setup: `openPage('communication'); state.filter='All'; render();` },
  { name: '43_communication_compose_form', setup: `state.overlay={type:'form',key:'messages'}; render();` },
  { name: '44_communication_message_detail', setup: `state.overlay={type:'detail',key:'messages',id:'MSG-301'}; render();` },

  { name: '45_staff_hr_directory', setup: `state.overlay=null; openPage('staff'); state.filter='All'; render();` },
  { name: '46_staff_add_member_form', setup: `state.overlay={type:'form',key:'staff'}; render();` },
  { name: '47_staff_member_detail_drawer', setup: `state.overlay={type:'detail',key:'staff',id:'EMP-102'}; render();` },

  { name: '48_transport_routes_table', setup: `state.overlay=null; openPage('transport'); state.filter='All'; render();` },
  { name: '49_transport_add_route_form', setup: `state.overlay={type:'form',key:'transport'}; render();` },
  { name: '50_transport_route_detail_drawer', setup: `state.overlay={type:'detail',key:'transport',id:'RT-01'}; render();` },

  { name: '51_library_loans_table', setup: `state.overlay=null; openPage('library'); state.filter='All'; render();` },
  { name: '52_library_issue_book_form', setup: `state.overlay={type:'form',key:'library'}; render();` },
  { name: '53_library_loan_detail_drawer', setup: `state.overlay={type:'detail',key:'library',id:'LIB-102'}; render();` },

  { name: '54_assets_facilities_table', setup: `state.overlay=null; openPage('assets'); state.filter='All'; render();` },
  { name: '55_assets_add_asset_form', setup: `state.overlay={type:'form',key:'assets'}; render();` },
  { name: '56_assets_asset_detail_drawer', setup: `state.overlay={type:'detail',key:'assets',id:'AST-101'}; render();` },

  { name: '57_compliance_tracker_table', setup: `state.overlay=null; openPage('compliance'); state.filter='All'; render();` },
  { name: '58_compliance_add_obligation_form', setup: `state.overlay={type:'form',key:'compliance'}; render();` },
  { name: '59_compliance_obligation_detail_drawer', setup: `state.overlay={type:'detail',key:'compliance',id:'GOV-101'}; render();` },

  { name: '60_helpdesk_service_tickets', setup: `state.overlay=null; openPage('helpdesk'); state.filter='All'; render();` },
  { name: '61_helpdesk_create_ticket_form', setup: `state.overlay={type:'form',key:'tickets'}; render();` },
  { name: '62_helpdesk_ticket_detail_drawer', setup: `state.overlay={type:'detail',key:'tickets',id:'SUP-119'}; render();` },

  // 10. Reports & Settings
  { name: '63_reports_leadership_insights', setup: `state.overlay=null; openPage('reports'); render();` },
  { name: '64_settings_school_profile', setup: `openPage('settings'); render();` },
  { name: '65_settings_reset_confirm_modal', setup: `let a=document.querySelector('[data-action=\"reset\"]'); if(a) a.click(); render();` },

  // 11. Campus Filtering
  { name: '66_campus_main_campus_filtered', setup: `state.overlay=null; openPage('overview'); state.campus='Main Campus'; render();` },
  { name: '67_campus_west_campus_filtered', setup: `state.campus='West Campus'; render();` },

  // 12. Mobile Responsive (390px viewport)
  { name: '68_mobile_overview_dashboard', mobile: true, setup: `state.campus='All campuses'; state.mobile=false; openPage('overview'); render();` },
  { name: '69_mobile_sidebar_navigation', mobile: true, setup: `state.mobile=true; render();` },
  { name: '70_mobile_admissions_pipeline', mobile: true, setup: `state.mobile=false; openPage('admissions'); state.view='pipeline'; render();` },
  { name: '71_mobile_attendance_register', mobile: true, setup: `openPage('attendance'); state.attClass='Grade 8 A'; render();` }
];

async function run() {
  console.log('Connecting to Chrome...');
  let pages = [];
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      pages = await getJson('http://127.0.0.1:9222/json');
      if (pages.length) break;
    } catch (e) {}
    await sleep(300);
  }

  const page = pages.find(p => p.type === 'page');
  if (!page) {
    console.error('No page found on CDP');
    chromeProcess.kill();
    process.exit(1);
  }

  console.log('Attaching WebSocket to page:', page.webSocketDebuggerUrl);
  const client = new CDPClient(page.webSocketDebuggerUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('Runtime.enable');

  console.log('Navigating to http://localhost:8765 ...');
  await client.send('Page.navigate', { url: 'http://localhost:8765' });
  await sleep(1500);

  let currentMode = 'desktop';
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  });

  console.log(`Starting capture of ${scenes.length} functionality screenshots...`);

  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    const isMobile = !!s.mobile;

    if (isMobile && currentMode !== 'mobile') {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });
      currentMode = 'mobile';
      await sleep(300);
    } else if (!isMobile && currentMode !== 'desktop') {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 900,
        deviceScaleFactor: 2,
        mobile: false
      });
      currentMode = 'desktop';
      await sleep(300);
    }

    // Execute state setup
    await client.send('Runtime.evaluate', { expression: s.setup });
    await sleep(250);

    // Capture screenshot
    const shot = await client.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.data, 'base64');
    const outPath = path.join(SCREENSHOT_DIR, `${s.name}.png`);
    fs.writeFileSync(outPath, buffer);

    console.log(`[${i + 1}/${scenes.length}] Captured: ${s.name}.png`);
  }

  console.log(`\nSuccessfully captured all ${scenes.length} screenshots into: ${SCREENSHOT_DIR}`);

  client.close();
  chromeProcess.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error during capture:', err);
  chromeProcess.kill();
  process.exit(1);
});
