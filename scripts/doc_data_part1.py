# doc_data_part1.py - Screenshots 01 to 23

PART_1_FEATURES = [
    {
        "ref": "REF-01",
        "title": "Admin Master Operational Dashboard",
        "img": "01_overview_admin_dashboard.png",
        "purpose": "Provides school executive leadership with an immediate, high-altitude operational synthesis across all institutional domains, including total active enrollment, admissions velocity, collection efficiency, and daily attendance health.",
        "kv": [
            ("Active Students KPI", "1,248 enrolled students across all campus wings (+3.4% MoM)"),
            ("Admissions Funnel KPI", "42 active leads across pipeline stages with 68% projected conversion"),
            ("Collection Rate KPI", "91.4% fee collection efficiency representing ₹4.2M collected of ₹4.6M billed"),
            ("Attendance Rate KPI", "94.2% daily roll call compliance with chronic absence tracking"),
            ("Admissions Pipeline Bar", "Visual metric bar showing distribution across New, Contacted, Visit, App, and Admitted"),
            ("Operations Feed", "Real-time audit log of fee settlements, newly scheduled tours, and exam schedules"),
            ("Priority Tasks Card", "Administrative to-do list with direct action buttons and deadline indicators"),
            ("Campus Selector", "Global topbar switcher dynamically scoping dashboard metrics to specific campuses")
        ],
        "interaction": "Administrators can click directly on any metric card to drill down into the underlying module (e.g., clicking the Attendance KPI routes directly to the Attendance Roll Call). The quick-action buttons allow immediate task creation and notice broadcasting.",
        "logic": "Metrics aggregate dynamically in real-time from active student rosters, invoice balances in the fee ledger, and daily roll-call records. Role-based security guarantees that only executive users see school-wide fiscal figures.",
        "callout": "Executive leadership should review this dashboard each morning prior to morning assembly to identify attendance anomalies, overdue receivables, and critical facility maintenance tickets."
    },
    {
        "ref": "REF-02",
        "title": "Principal Academic Leadership Focus",
        "img": "02_overview_principal_focus.png",
        "purpose": "Tailors the operational dashboard specifically to academic leadership, highlighting instructional delivery, syllabus progression, upcoming examinations, and faculty classroom coverage.",
        "kv": [
            ("Curriculum Progression", "Real-time monitoring of syllabus coverage across STEM and Humanities disciplines"),
            ("Assessment Schedule", "Upcoming unit tests, mid-term examinations, and laboratory practical schedules"),
            ("Faculty Attendance", "Daily teacher presence, unassigned substitute periods, and on-leave tracking"),
            ("Student At-Risk Alerts", "Flagged students with attendance below 85% or failing marks in recent assessments"),
            ("Academic Events Feed", "Scheduled parent-teacher conferences, science exhibitions, and board reviews")
        ],
        "interaction": "Principals can switch perspectives instantly via the topbar role switcher, immediately isolating academic health from general administrative tasks without logging out.",
        "logic": "Filters out commercial fee metrics and elevates academic indicators, linking directly to teacher gradebooks and examination rubrics.",
        "callout": "Use this view during weekly academic council meetings to evaluate department performance and reallocate teaching resources."
    },
    {
        "ref": "REF-03",
        "title": "Admissions Directorate Focus",
        "img": "03_overview_admissions_focus.png",
        "purpose": "Empowers admissions heads and counselors to focus exclusively on inbound inquiries, lead aging, counseling follow-up SLAs, and conversion velocity.",
        "kv": [
            ("Inquiry Inflow", "42 total inquiries logged across digital and walk-in acquisition channels"),
            ("Counselor Allocations", "Individual lead caseloads divided between Counselors Neha Patel and Arjun Rao"),
            ("Campus Tour Schedule", "Today's scheduled parent visits and student evaluation appointments"),
            ("Documentation Pending", "List of applicants with incomplete identity or previous school transfer certificates"),
            ("Lead Conversion Rate", "68.2% historical conversion rate from inquiry to enrolled admission")
        ],
        "interaction": "Counselors can initiate calls, log prospective parent interactions, and schedule campus tours directly from the priority follow-up queue.",
        "logic": "Prospects are sorted by 'Next Action Date'. Inquiries without activity for more than 48 hours trigger an amber warning indicator.",
        "callout": "Ensure all 'New Enquiry' records are contacted within 4 operating hours to maintain high enrollment conversion rates."
    },
    {
        "ref": "REF-04",
        "title": "Faculty & Class Teacher Focus",
        "img": "04_overview_teacher_focus.png",
        "purpose": "Provides homeroom and subject teachers with an operational cockpit for daily classroom delivery, student roll call, homework assignments, and remedial interventions.",
        "kv": [
            ("Assigned Class Schedule", "Today's period-by-period teaching slots with classroom and laboratory room numbers"),
            ("Roll Call Action", "One-click shortcut to launch the live daily attendance register for assigned homerooms"),
            ("Pending Homework/Tests", "Upcoming unit test dates and assignment submission deadlines for assigned grades"),
            ("Parent Query Feed", "Direct messages and appointment requests from guardians via the Parent Portal"),
            ("Class Notes Board", "Internal reminders for laboratory equipment booking and audio-visual room reservations")
        ],
        "interaction": "Teachers click the roll call button to open the attendance register, or tap on any period card to view lesson plans and student rosters.",
        "logic": "Rosters are automatically filtered to show only students enrolled in classes taught by the active instructor.",
        "callout": "Homeroom teachers must complete attendance submission within the first 15 minutes of Period 1 to sync with automated parent SMS alerts."
    },
    {
        "ref": "REF-05",
        "title": "Bursar & Finance Office Focus",
        "img": "05_overview_finance_focus.png",
        "purpose": "Delivers an accounts-receivable perspective for the finance office, focusing on fee collection milestones, overdue accounts, tuition installments, and cash-flow projections.",
        "kv": [
            ("Gross Billed Dues", "Total academic term billings calculated across tuition, laboratory, and transport heads"),
            ("Net Collections Realized", "Realized funds reconciled against school bank accounts and digital payment gateways"),
            ("Overdue Ledger Aging", "Accounts past 30, 60, and 90-day grace periods with student guardian phone numbers"),
            ("Partial Settlements", "Installment payment commitments and scheduled post-dated collections"),
            ("Daily Cash Reconciliation", "Counter cash receipts and digital bank transaction settlement logs")
        ],
        "interaction": "Accountants can trigger 1-click overdue reminders, generate demand notes, and launch the Quick Pay modal directly from the overdue list.",
        "logic": "Overdue balances automatically update upon partial or full payments, deducting amounts from student ledger accounts with timestamped receipts.",
        "callout": "Generate overdue notices on the 5th of each calendar month to give parents adequate lead time prior to term examinations."
    },
    {
        "ref": "REF-06",
        "title": "Priority Action & Administrative Task Modal",
        "img": "06_overview_add_task_modal.png",
        "purpose": "Enables staff members to quickly record, delegate, and track time-sensitive operational tasks directly from the main interface without switching views.",
        "kv": [
            ("Task Description Field", "Text input for concise operational instructions (e.g., 'Review scholarship applications')"),
            ("Department & Deadline", "Structured string or selector assigning department (Admissions, Finance, HR) and time"),
            ("Priority Level", "Flag indicating Normal, High, or Urgent operational priority"),
            ("Save Action Button", "Validates input and immediately appends the task to the shared executive to-do ledger"),
            ("Cancel Action Button", "Dismisses the modal without committing state changes")
        ],
        "interaction": "Triggered by clicking '+ Add task' on the Overview dashboard. Supports keyboard submission (`Enter`) and `Escape` dismissal.",
        "logic": "Validation enforces that Task Description cannot be empty. Tasks created persist immediately to local storage and update notification counters.",
        "callout": "Use this modal during morning briefings to record action items assigned to administrative personnel."
    },
    {
        "ref": "REF-07",
        "title": "Unified Institutional Notification Center",
        "img": "07_topbar_notifications_drawer.png",
        "purpose": "A centralized sliding notifications drawer aggregating time-critical alerts across all operational modules, including finance, admissions, academic submissions, and facility tickets.",
        "kv": [
            ("Overdue Fee Alerts", "Identifies specific invoices that have breached the payment grace period"),
            ("Admissions Follow-up Alerts", "Reminders for scheduled campus tours, diagnostic evaluations, and parent calls"),
            ("Facilities & IT Helpdesk", "High-priority support tickets logged by faculty requiring urgent resolution"),
            ("Timestamp & Badge", "Relative elapsed time (e.g., '10m ago', '2h ago') and category badge"),
            ("Close Drawer Trigger", "Top-right dismissal icon and backdrop click listener")
        ],
        "interaction": "Clicking the bell icon in the topbar smoothly opens the off-canvas drawer. Clicking any notification item takes the user directly to the affected record.",
        "logic": "Notification items are generated dynamically based on threshold queries across database tables (invoices overdue > 0 days, tickets status == 'Open').",
        "callout": "Staff should clear their action queue daily to prevent overdue admissions leads and delayed facility repairs."
    },
    {
        "ref": "REF-08",
        "title": "Universal Type-Ahead Global Search System",
        "img": "08_topbar_global_search_matches.png",
        "purpose": "Provides lightning-fast, universal keyboard search across students, admission leads, faculty members, fee invoices, and service tickets from a single topbar searchbox.",
        "kv": [
            ("Live Type-Ahead Input", "Instant debounce search executing across 5 relational tables"),
            ("Student Category Hits", "Shows matching enrolled students with grade, roll number, and campus"),
            ("Admissions Category Hits", "Shows prospective applicants with current pipeline stage and parent phone"),
            ("Staff & Faculty Category Hits", "Shows employee name, department, role, and mobile number"),
            ("Invoices & Tickets Hits", "Shows matching invoice numbers and open support requests"),
            ("Keyboard Shortcuts", "Escape key instantly dismisses the dropdown menu; arrow keys navigate items")
        ],
        "interaction": "Typing 2 or more characters immediately renders a structured categorized dropdown. Clicking any match navigates directly to the target record drawer.",
        "logic": "Search algorithm executes multi-field case-insensitive substring matching across `name`, `id`, `phone`, `parent`, `subject`, and `role`.",
        "callout": "Receptionists and counselors can look up prospective parents instantly while on incoming phone calls using phone number or student name."
    },
    {
        "ref": "REF-09",
        "title": "Admissions Pipeline Kanban Board",
        "img": "09_admissions_pipeline_kanban.png",
        "purpose": "Visualizes prospective student admissions as a multi-stage sales and counseling pipeline, enabling counselors to track prospects from first inquiry to accepted enrollment.",
        "kv": [
            ("New Enquiry Column", "Fresh leads captured from website, digital ads, social media, or walk-in inquiries"),
            ("Contacted Column", "Prospective parents who have received initial phone or email counseling"),
            ("School Visit Column", "Families booked for physical campus walkthroughs and principal meetings"),
            ("Application Column", "Families who have submitted completed formal registration packets and documents"),
            ("Admitted Column", "Accepted candidates with formal offer letters awaiting student enrollment"),
            ("Candidate Card", "Displays applicant name, applied grade, parent name, mobile phone, and assigned counselor"),
            ("Stage Counter Badge", "Total candidate count and percentage within each pipeline column")
        ],
        "interaction": "Counselors can click on any card to open the complete lead dossier drawer, update stage, add interaction notes, or convert to student.",
        "logic": "Cards dynamically render based on `lead.stage`. Real-time pipeline indicators update automatically when candidate records progress.",
        "callout": "Hold weekly admissions pipeline reviews using this board to identify bottlenecks in the School Visit and Application stages."
    },
    {
        "ref": "REF-10",
        "title": "Comprehensive Admissions Tabular Directory",
        "img": "10_admissions_list_table.png",
        "purpose": "Provides admissions administrators with a structured, tabular registry of all prospective students, facilitating bulk sorting, searching, status inspection, and CSV export.",
        "kv": [
            ("Lead ID Column", "Unique sequential identifier (e.g., AD-2401) assigned to each prospective applicant"),
            ("Applicant Name & Grade", "Full candidate name paired with target academic grade (e.g., Grade 6)"),
            ("Parent/Guardian Details", "Primary guardian name and direct mobile contact number for rapid dialing"),
            ("Acquisition Source", "Marketing attribution tag (Website, Instagram, Referral, Walk-in)"),
            ("Pipeline Stage Badge", "Color-coded status tag representing current position in the enrollment journey"),
            ("Assigned Counselor", "Staff member accountable for managing the family's application process"),
            ("Next Action Schedule", "Scheduled follow-up date and time (e.g., 'Today, 11:30 AM')"),
            ("Campus Tag", "Designated branch (Main Campus vs West Campus)")
        ],
        "interaction": "Clicking any table row opens the lead drawer. The 'Export' button triggers an instant client-side CSV download formatted for spreadsheet analysis.",
        "logic": "Table supports multi-column client-side filtering, case-insensitive text search, and campus partitioning.",
        "callout": "Use the CSV export at the end of each month to generate enrollment channel ROI reports for the school board."
    },
    {
        "ref": "REF-11",
        "title": "Admissions Stage Filter: New Enquiry",
        "img": "11_admissions_filter_new_enquiry.png",
        "purpose": "Isolates newly received inquiries awaiting initial counselor contact, ensuring no incoming prospective family is overlooked.",
        "kv": [
            ("Uncontacted Queue", "Filtered list of fresh leads with status 'New enquiry'"),
            ("Source Breakdown", "Distribution showing web inquiry forms versus walk-in front-desk registrations"),
            ("Time Elapsed", "Indicator of how long the inquiry has waited for an initial counselor callback"),
            ("Counselor Assignment", "Staff member designated to conduct the discovery consultation")
        ],
        "interaction": "Clicking the 'New enquiry' filter pill instantly refines the table or kanban view without full-page reloads.",
        "logic": "Executes reactive filter `db.leads.filter(x => x.stage === 'New enquiry')` with instant UI re-render.",
        "callout": "Maintain a strict SLA: 100% of 'New enquiry' records should transition to 'Contacted' within 24 hours of receipt."
    },
    {
        "ref": "REF-12",
        "title": "Admissions Stage Filter: Contacted Prospects",
        "img": "12_admissions_filter_contacted.png",
        "purpose": "Focuses on prospective families with whom initial dialogue has been established, tracking follow-up discussions regarding fee structures, curriculum, and transport options.",
        "kv": [
            ("Active Engagement Queue", "Prospects who have answered discovery phone calls or replied to emails"),
            ("Counselor Notes", "Summary of parent questions regarding bus routes, second languages, and lab facilities"),
            ("Next Scheduled Touchpoint", "Specific callback appointments agreed upon with parents")
        ],
        "interaction": "Counselors review interaction history and log outcome notes directly into the lead dossier.",
        "logic": "Leads remain in 'Contacted' until a school visit is scheduled or an application packet is formally purchased.",
        "callout": "If a parent is indecisive after 2 follow-ups, invite them to attend an open house or shadow day to accelerate conversion."
    },
    {
        "ref": "REF-13",
        "title": "Admissions Stage Filter: Scheduled School Visits",
        "img": "13_admissions_filter_school_visit.png",
        "purpose": "Manages prospective families who have booked or completed guided campus walkthroughs, lab tours, and preliminary meetings with the Principal.",
        "kv": [
            ("Visit Roster", "List of prospective parents scheduled for guided campus tours this week"),
            ("Tour Guide / Host", "Assigned admissions executive or senior teacher hosting the walkthrough"),
            ("Feedback & Interest Rating", "Post-tour interest rating and areas of parent interest (Sports, Arts, Robotics)")
        ],
        "interaction": "Admissions staff confirm appointment times via SMS circular and print visitor badges ahead of arrival.",
        "logic": "Automated calendar reminders ensure campus security reception is briefed on visiting family names.",
        "callout": "Prepare personalized welcome brochures and student work portfolios tailored to the specific grade applied for prior to each tour."
    },
    {
        "ref": "REF-14",
        "title": "Admissions Stage Filter: Formal Applications Under Review",
        "img": "14_admissions_filter_application.png",
        "purpose": "Tracks submitted formal admission applications undergoing entrance evaluations, prior report card reviews, and document verification.",
        "kv": [
            ("Application Queue", "Formal application packets submitted with registration fees paid"),
            ("Document Checklist", "Verification status of Birth Certificate, Transfer Certificate, and Grade 10 marksheets"),
            ("Assessment Score", "Results from student diagnostic assessments in English, Math, and Science"),
            ("Review Status", "Pending Principal approval or awaiting special education counseling review")
        ],
        "interaction": "Admissions officers review uploaded credentials and update the lead stage to 'Admitted' upon academic sign-off.",
        "logic": "Applications cannot progress to 'Admitted' without entering diagnostic evaluation remarks.",
        "callout": "Cross-check transfer certificate validity against the regional education board portal before issuing formal admission letters."
    },
    {
        "ref": "REF-15",
        "title": "Admissions Stage Filter: Admitted Students Ready for Enrollment",
        "img": "15_admissions_filter_admitted.png",
        "purpose": "Displays accepted candidates who have received official admission offers, ready for tuition settlement and conversion into active students.",
        "kv": [
            ("Offer Accepted Queue", "Accepted candidates with issued admission offer letters"),
            ("Tuition Deposit Status", "Initial admission fee and term tuition settlement verification"),
            ("Target Class Assignment", "Designated homeroom and section (e.g., Grade 8-A, Grade 5-B)"),
            ("Enrol as Student Trigger", "Direct action button to onboard candidate as a permanent school student")
        ],
        "interaction": "Counselors open the admitted lead's drawer and click 'Enrol as Student' to finalize the enrollment.",
        "logic": "Once enrolled, candidate records remain in the Admissions archive while simultaneously generating active student profiles.",
        "callout": "Send the official welcome kit and parent portal credentials within 2 hours of formal enrollment confirmation."
    },
    {
        "ref": "REF-16",
        "title": "360° Prospective Student Dossier Drawer",
        "img": "16_admissions_lead_detail_drawer.png",
        "purpose": "A sliding dossier drawer presenting complete prospective student information, parent demographics, interaction timeline, and stage progression controls.",
        "kv": [
            ("Applicant Header", "Student name, candidate photo avatar, lead ID, and applied grade"),
            ("Parent/Guardian Details", "Father/Mother name, contact phone number, and residential email"),
            ("Marketing Attribution", "Inquiry channel source (Website, Referral, Social Media) and acquisition date"),
            ("Stage Transition Dropdown", "Immediate selector allowing counselors to move lead to any stage"),
            ("Assigned Counselor", "Staff member managing this lead with one-click reassignment"),
            ("Activity History Timeline", "Timestamped chronological log of phone calls, campus visits, and email dispatches")
        ],
        "interaction": "Admissions counselors update the stage dropdown or click 'Edit' to update parent phone or grade information without leaving the pipeline.",
        "logic": "Stage changes immediately re-render background kanban columns and trigger audit entries in the operations feed.",
        "callout": "Record detailed notes after every parent interaction so that substitute counselors can step in seamlessly during leave periods."
    },
    {
        "ref": "REF-17",
        "title": "Admitted Lead: One-Click 'Enrol as Student' Action",
        "img": "17_admissions_lead_admitted_enrol_ready.png",
        "purpose": "Streamlines the transition from prospective applicant to registered student with a single click, automating student ID generation and roster creation.",
        "kv": [
            ("Admitted Status Indicator", "Green status badge confirming candidate has passed all admissions gates"),
            ("Enrol as Student Button", "High-visibility primary action button triggering automated onboarding"),
            ("Target Class & Section", "Assigned homeroom grade and section ready for roll call insertion"),
            ("Auto-ID Generation Preview", "Calculates next sequential student enrollment ID (e.g., ST-1025)"),
            ("Fee Ledger Synchronization", "Automatically queues the first term fee invoice in the accounts receivable ledger")
        ],
        "interaction": "Clicking 'Enrol as Student' prompts an instant success confirmation, creates the student record, and opens the student profile.",
        "logic": "Prevents duplicate enrollments by checking `db.students` for identical name and parent phone numbers.",
        "callout": "Verify that the guardian's primary email address is correct prior to enrollment to ensure delivery of parent portal access links."
    },
    {
        "ref": "REF-18",
        "title": "New Admission Enquiry Intake Form Drawer",
        "img": "18_admissions_create_enquiry_form.png",
        "purpose": "Standardizes data collection for incoming school inquiries across all channels, capturing student background, parent demographics, and counseling notes.",
        "kv": [
            ("Applicant Full Name", "Required text field for prospective student's legal name"),
            ("Grade Applied Selector", "Dropdown covering Pre-K through Grade 12"),
            ("Parent/Guardian Name", "Required field for primary point of contact"),
            ("Primary Mobile Phone", "10-digit telephone input with formatting validation"),
            ("Lead Acquisition Source", "Attribution dropdown (Website, Instagram, Google Search, Referral, Walk-in)"),
            ("Assigned Counselor", "Dropdown of active admissions staff members"),
            ("Next Action Date/Time", "Calendar and time picker for scheduled follow-up call"),
            ("Target Campus", "Branch selector (Main Campus vs West Campus)"),
            ("Initial Counseling Notes", "Multi-line text area for parent expectations and student interests")
        ],
        "interaction": "Opened by clicking '+ Add enquiry' on any admissions screen. Features real-time field validation and autofocus on the student name field.",
        "logic": "Enforces mandatory fields (*). Prevents submission of incomplete forms and defaults next follow-up to current date + 24 hours.",
        "callout": "Front desk receptionists should always capture the 'Source' accurately to allow management to evaluate marketing campaign efficiency."
    },
    {
        "ref": "REF-19",
        "title": "Master Student Information Directory",
        "img": "19_students_all_directory.png",
        "purpose": "Serves as the institutional database of record for all actively enrolled and archived students, providing instant access to academic, attendance, and financial standing.",
        "kv": [
            ("Student ID Column", "Unique institutional student registration identifier (e.g., ST-1001)"),
            ("Student Name & Photo Avatar", "Student full legal name with visual initials avatar"),
            ("Class & Section", "Current academic placement (e.g., Grade 8 A, Grade 5 B, Grade 10 B)"),
            ("Primary Guardian", "Parent name and primary emergency contact number"),
            ("Attendance Rate %", "Calculated year-to-date roll call percentage with color-coded threshold badges"),
            ("Outstanding Balance", "Live fee balance indicating settled (₹0) or pending dues"),
            ("Enrollment Status", "Active, On Leave, Graduated, or Transferred status indicator"),
            ("Campus Wing", "Assigned school facility (Main Campus vs West Campus)")
        ],
        "interaction": "Clicking any row slides out the comprehensive 360° Student Profile Drawer. Quick-filter pills allow instant grade and status isolation.",
        "logic": "Attendance percentages and fee balances are dynamically computed in real-time from the attendance and fee transaction tables.",
        "callout": "Student ID numbers are permanent and remain linked to academic transcripts and disciplinary records even after graduation."
    },
    {
        "ref": "REF-20",
        "title": "Student Directory: Filtered Active Students",
        "img": "20_students_filter_active.png",
        "purpose": "Filters the master directory to display only currently active, enrolled students attending daily classes, omitting withdrawn or graduated students.",
        "kv": [
            ("Active Enrollment Count", "Total number of currently enrolled students across all grades"),
            ("Classroom Distribution", "Visual listing showing balanced student counts across homeroom sections"),
            ("Attendance Thresholds", "Highlights students with active status but attendance falling below minimum mandates"),
            ("Current Term Financials", "Aggregated active student fee collections and pending balances")
        ],
        "interaction": "Clicking the 'Active' filter pill instantly updates the tabular view and recalibrates summary counters.",
        "logic": "Applies filter `db.students.filter(x => x.status === 'Active')` combined with current campus filter selections.",
        "callout": "Verify this roster against classroom seating charts at the start of each semester to catch unrecorded transfers."
    },
    {
        "ref": "REF-21",
        "title": "Dynamic Real-Time Directory Search Filter",
        "img": "21_students_search_filter.png",
        "purpose": "Allows school administrators to find specific students instantly by typing any substring of student name, enrollment ID, or parent contact number.",
        "kv": [
            ("Live Search Input Box", "Instant keystroke filtering updating the table in less than 50 milliseconds"),
            ("Multi-Column Matching", "Simultaneously matches student name, student ID, parent name, and phone number"),
            ("Filtered Results Counter", "Displays exact count of matching records (e.g., 'Showing 2 of 1,248 students')"),
            ("Clear Filter Button", "One-click action to reset the search string and restore the full master roster")
        ],
        "interaction": "Typing 'Patel' instantly narrows the view to all students with 'Patel' in their surname or parent name.",
        "logic": "Uses debounced substring matching with high-performance regular expression checks across cached client memory.",
        "callout": "Use phone number search when receiving incoming phone calls from parents whose caller ID does not display the student name."
    },
    {
        "ref": "REF-22",
        "title": "360° Comprehensive Student Profile Drawer",
        "img": "22_students_profile_detail_drawer.png",
        "purpose": "Presents a complete, multi-dimensional view of an enrolled student, synthesizing demographic data, parental contacts, academic attendance, fee obligations, and disciplinary records.",
        "kv": [
            ("Student Identity Banner", "Full legal name, high-resolution student avatar, Student ID, and Class/Section"),
            ("Enrollment Details", "Enrollment date, academic year, campus branch, and house affiliation (e.g., Phoenix)"),
            ("Parent/Guardian Dossier", "Father name, Mother name, primary mobile, email, and verified residential address"),
            ("Attendance Statistics", "Cumulative attendance % alongside a breakdown of total Present, Absent, and Late days"),
            ("Financial Balance Ledger", "Live account balance showing paid invoices, pending tuition installments, and receipts"),
            ("Emergency Information", "Blood group, critical allergies/medical notes, and emergency physician contact"),
            ("Direct Action Toolbar", "Print Student ID, Call Guardian, and Edit Student Record triggers")
        ],
        "interaction": "Administrators can click 'Call Guardian' to trigger telephone dialing, or tap 'Edit' to update medical alerts and contact details.",
        "logic": "Drawer pulls relational data across `db.students`, `db.attendance`, and `db.fees`, ensuring zero data fragmentation.",
        "callout": "School nurses and bus coordinators should verify emergency contact numbers in this drawer at the beginning of each academic term."
    },
    {
        "ref": "REF-23",
        "title": "Student Registration & Onboarding Drawer Form",
        "img": "23_students_add_student_form.png",
        "purpose": "A comprehensive onboarding form for registering newly admitted students into the school database with complete academic, parental, and emergency information.",
        "kv": [
            ("Full Legal Name", "Required text field for student's legal name as per government birth certificate"),
            ("Class & Section Selector", "Dropdown mapping to active homerooms (e.g., Grade 8 A, Grade 5 B)"),
            ("Date of Birth & Gender", "Date picker and gender selector for demographic and statistical reporting"),
            ("Parent/Guardian Details", "Father and Mother names, primary mobile contact, and parent email"),
            ("Residential Address", "Full residential postal address for bus route allocation"),
            ("Emergency Contact Phone", "Secondary emergency contact number for crisis management"),
            ("Assigned Campus Branch", "Branch selection (Main Campus vs West Campus)"),
            ("Medical & Dietary Notes", "Special health requirements, allergies, or physical education exemptions")
        ],
        "interaction": "Accessible via the '+ Add student' button on the Students directory. Features field validation and smart defaults.",
        "logic": "Form submission auto-increments the student sequence, computes initial 100% baseline attendance, and assigns initial enrollment status.",
        "callout": "Always double-check date of birth against the government birth certificate to prevent age-eligibility disputes during board registrations."
    }
]

print(f"Loaded Part 1: {len(PART_1_FEATURES)} features.")
