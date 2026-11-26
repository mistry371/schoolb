# doc_data_part3.py - Screenshots 48 to 71

PART_3_FEATURES = [
    {
        "ref": "REF-48",
        "title": "Bus Routes & Fleet Management Ledger",
        "img": "48_transport_routes_table.png",
        "purpose": "Tracks the school's bus fleet, designated transportation routes, assigned drivers, student passenger capacities, and operational delay statuses.",
        "kv": [
            ("Route ID & Name", "Unique route code (e.g., RT-01) and geographical coverage description (e.g., North Ring Route)"),
            ("Vehicle Number", "Official government vehicle registration plate (e.g., GJ-01-AB-1234)"),
            ("Driver Name & Phone", "Assigned bus driver name and direct mobile contact number for rapid dispatch"),
            ("Student Capacity & Load", "Total seated student capacity versus actively registered student riders (e.g., 32/36)"),
            ("Stoppages & Timings", "Morning pickup commencement and afternoon drop-off completion times"),
            ("Operational Status", "On Time (Green) or Delayed (Amber) with live delay minutes"),
            ("Assigned Campus Branch", "Facility served (Main Campus vs West Campus)")
        ],
        "interaction": "Clicking any route row opens the Route Dossier with stoppage itinerary and passenger manifest. Clicking '+ Add route' opens the route creation form.",
        "logic": "Capacity tracker alerts administrators when a bus route exceeds 90% seating capacity to trigger route split evaluations.",
        "callout": "Conduct daily pre-trip vehicle safety inspections and breathalyzer checks for all drivers prior to morning departures."
    },
    {
        "ref": "REF-49",
        "title": "Add Transport Route Configuration Form",
        "img": "49_transport_add_route_form.png",
        "purpose": "A configuration drawer form for setting up new bus routes, vehicle assignments, driver pairings, and scheduled neighborhood stops.",
        "kv": [
            ("Route Name", "Geographical corridor description (e.g., 'West Ring — Satellite Road Corridor')"),
            ("Vehicle Number Plate", "Official bus registration number matching transport department records"),
            ("Assigned Driver Name", "Driver full name with verified commercial heavy vehicle license"),
            ("Driver Mobile Phone", "10-digit emergency telephone number"),
            ("Total Seating Capacity", "Maximum legal passenger count for the bus chassis"),
            ("Key Stoppages Itinerary", "Comma-separated list of designated residential pickup locations"),
            ("Morning Pickup Start Time", "Time input for first neighborhood pickup stop")
        ],
        "interaction": "Accessible via '+ Add route' on the Transport ledger. Submitting immediately appends the route to the active fleet roster.",
        "logic": "Enforces that vehicle number follows standard registration formatting and capacity is greater than 0.",
        "callout": "Design routes to keep total student transit times below 45 minutes each way to minimize student fatigue."
    },
    {
        "ref": "REF-50",
        "title": "Transport Route Stoppages & Driver Dossier Drawer",
        "img": "50_transport_route_detail_drawer.png",
        "purpose": "A detailed sliding drawer displaying the step-by-step stoppage itinerary, student passenger roster, driver licensing credentials, and emergency protocols.",
        "kv": [
            ("Route Banner", "Route code, corridor title, assigned vehicle number, and current live status"),
            ("Driver Credentials", "Driver legal name, license number, validity date, and primary contact phone"),
            ("Pickup Stoppages Schedule", "Sequential list of stops with exact arrival and departure timestamps"),
            ("Enrolled Student Passengers", "List of students assigned to this route with grade and parent emergency phone numbers"),
            ("Bus Attendant / Monitor", "Name and contact of female bus attendant assisting young learners"),
            ("Action Buttons", "Update Route Stoppages, Broadcast Delay Notice to Parents, and Print Route Manifest")
        ],
        "interaction": "Transport managers can click 'Broadcast Delay Notice' to send instant automated SMS alerts to parents of students on this specific route.",
        "logic": "Provides an instant passenger manifest linking students directly to their designated pickup and drop-off points.",
        "callout": "Keep a printed, laminated copy of the student manifest with emergency parent phone numbers aboard each vehicle at all times."
    },
    {
        "ref": "REF-51",
        "title": "Library Circulation & Active Book Loans Table",
        "img": "51_library_loans_table.png",
        "purpose": "Manages book lending across school libraries, tracking accession codes, borrowing students, checkout dates, return deadlines, and overdue fines.",
        "kv": [
            ("Loan ID Column", "Unique circulation loan reference (e.g., LIB-101)"),
            ("Book Title & ISBN", "Title of publication, author name, and accession catalogue barcode"),
            ("Borrowing Student", "Student borrower name, enrollment ID, and homeroom section"),
            ("Issue Date Column", "Date book was checked out from the circulation desk"),
            ("Return Due Date", "Standard 14-day checkout deadline"),
            ("Circulation Status Badge", "Active (Green), Returned (Blue), or Overdue (Red)"),
            ("Overdue Fine Amount", "Accrued late return penalty calculated at standard daily rates")
        ],
        "interaction": "Clicking any loan row opens the loan detail drawer. Clicking '+ Issue book' opens the checkout drawer form.",
        "logic": "Loans past their due date automatically update status to 'Overdue' and calculate daily late fees at ₹5 per day.",
        "callout": "Run the overdue loans report on Fridays and dispatch automated return reminders to homeroom teachers."
    },
    {
        "ref": "REF-52",
        "title": "Issue Book & Library Checkout Form",
        "img": "52_library_issue_book_form.png",
        "purpose": "A streamlined checkout drawer form for issuing library volumes to students and faculty with accession number verification and automatic due-date calculation.",
        "kv": [
            ("Book Title & Accession", "Text input for book title or barcode accession scanner input"),
            ("Borrowing Student Selector", "Autocomplete search dropdown matching registered students"),
            ("Issue Date", "Defaults to current date"),
            ("Return Due Date", "Auto-calculates standard 14-day lending period with date picker override"),
            ("Book Physical Condition", "New, Good, Fair, or Worn condition assessment at checkout")
        ],
        "interaction": "Accessible via '+ Issue book' on the Library ledger. Features fast keyboard navigation for high-volume circulation desks.",
        "logic": "Checks student record for existing overdue books and limits total concurrent checkouts to 3 volumes per student.",
        "callout": "Inspect book spine and pages during checkout to note pre-existing wear and prevent unfair damage assessments on return."
    },
    {
        "ref": "REF-53",
        "title": "Book Loan Status & Check-In Processing Drawer",
        "img": "53_library_loan_detail_drawer.png",
        "purpose": "A sliding drawer for processing returned books, calculating overdue penalties, recording physical condition changes, and issuing return receipts.",
        "kv": [
            ("Loan Header", "Loan ID, book title, author, and borrower identity banner"),
            ("Circulation Timeline", "Issue date, due date, days elapsed, and return status"),
            ("Overdue Fine Calculation", "Real-time breakdown of late return fees, if applicable"),
            ("Check-In Action Button", "Primary action button marking the book returned and restoring inventory availability"),
            ("Renew Loan Action", "Extends loan period by an additional 7 days if no reservation holds exist")
        ],
        "interaction": "Librarians click 'Check-In' to immediately clear the loan from the student's active borrowing account.",
        "logic": "Checking in a book updates inventory quantity in `db.library` and clears the borrow flag from the student's 360° profile.",
        "callout": "Ensure all overdue fines are collected or waived with appropriate authorization before approving new loan requests."
    },
    {
        "ref": "REF-54",
        "title": "Physical Assets & Campus Facilities Inventory",
        "img": "54_assets_facilities_table.png",
        "purpose": "Catalogs the institution's capital equipment, IT hardware, science laboratory instruments, sports infrastructure, and maintenance servicing schedules.",
        "kv": [
            ("Asset ID & Name", "Unique equipment tracking number (e.g., AST-101) and asset description"),
            ("Category Column", "IT Infrastructure, Science Laboratory, Furniture, HVAC & Electrical, Sports"),
            ("Campus Location & Room", "Specific room number, laboratory wing, or administrative office location"),
            ("Physical Condition Badge", "Good (Green), Needs Repair (Amber), or Critical (Red)"),
            ("Last Service Date", "Date of previous preventive maintenance inspection"),
            ("Next Scheduled Inspection", "Upcoming maintenance date to prevent equipment downtime")
        ],
        "interaction": "Clicking any asset opens the detailed maintenance history drawer. Clicking '+ Add asset' launches the asset registration form.",
        "logic": "Flags assets whose next inspection date has passed with an amber maintenance reminder on the Operations dashboard.",
        "callout": "Tag all school assets with durable metallic QR code asset tags matching their system Asset ID."
    },
    {
        "ref": "REF-55",
        "title": "Register Physical Asset & Equipment Form",
        "img": "55_assets_add_asset_form.png",
        "purpose": "Standardizes the onboarding of newly acquired school assets, recording serial numbers, procurement costs, vendor warranties, and physical placement.",
        "kv": [
            ("Asset Name & Description", "Specific model description (e.g., 'Interactive Smart Display 75\"')"),
            ("Equipment Category", "Dropdown selector (IT, Science Lab, Furniture, Electrical, Transport)"),
            ("Physical Location / Room", "Designated room number or laboratory (e.g., 'Science Lab 2')"),
            ("Equipment Condition", "New, Good, or Refurbished selection"),
            ("Acquisition Cost (₹)", "Financial capital expense recorded for balance sheet depreciation"),
            ("Warranty Expiry Date", "Vendor warranty deadline for free servicing and parts replacement")
        ],
        "interaction": "Accessible via '+ Add asset' on the Assets inventory. Submitting appends the asset and calculates scheduled maintenance dates.",
        "logic": "Validates mandatory fields and establishes initial 'Good' condition rating upon registration.",
        "callout": "Attach digital copies of purchase invoices and vendor warranty certificates to the asset record for insurance claim audits."
    },
    {
        "ref": "REF-56",
        "title": "Asset Maintenance History & Inspection Drawer",
        "img": "56_assets_asset_detail_drawer.png",
        "purpose": "A sliding drawer detailing equipment specifications, complete servicing log, vendor contact details, replacement parts history, and write-off assessments.",
        "kv": [
            ("Asset Header", "Asset code, equipment name, category badge, and current condition"),
            ("Physical Placement", "Exact campus wing, floor level, and room allocation"),
            ("Vendor & Warranty Details", "Supplying vendor name, support telephone, and warranty expiration"),
            ("Service History Log", "Chronological audit trail of preventive maintenance, repairs, and filter replacements"),
            ("Action Buttons", "Log Maintenance Service, Report Equipment Damage, and Decommission Asset")
        ],
        "interaction": "Facilities staff log routine maintenance visits or escalate malfunctioning hardware into IT helpdesk tickets.",
        "logic": "Provides an audit-compliant maintenance ledger required for annual financial asset depreciation and insurance policies.",
        "callout": "Log quarterly calibration records for all science laboratory equipment to satisfy board affiliation accreditation inspections."
    },
    {
        "ref": "REF-57",
        "title": "Statutory Compliance & Safety Obligations Tracker",
        "img": "57_compliance_tracker_table.png",
        "purpose": "Monitors institutional regulatory compliance, fire safety certificates, building stability NOCs, board affiliations, and environmental health licenses.",
        "kv": [
            ("Obligation ID & Title", "Statutory code (e.g., GOV-101) and regulatory title (e.g., Fire Safety NOC)"),
            ("Regulatory Authority", "Municipal Fire Department, Education Board (CBSE/ICSE), State Health Department"),
            ("Renewal Frequency", "Annual, Biennial, or 5-Year mandatory renewal cycle"),
            ("Expiration Date", "Statutory expiration date past which legal operation is compromised"),
            ("Compliance Status Badge", "Compliant (Green), Expiring Soon (Amber), or Non-Compliant (Red)"),
            ("Responsible Officer", "Designated administrative staff member accountable for filing and renewal")
        ],
        "interaction": "Clicking any obligation row opens the certification audit drawer. Clicking '+ Add obligation' opens the compliance filing form.",
        "logic": "Automated status rules: obligations expiring within 60 days transition to 'Expiring Soon' and trigger high-priority alerts.",
        "callout": "Initiate fire safety and building stability NOC renewals at least 90 days prior to expiry to accommodate municipal inspection delays."
    },
    {
        "ref": "REF-58",
        "title": "Add Statutory Compliance Obligation Form",
        "img": "58_compliance_add_obligation_form.png",
        "purpose": "Standardizes the tracking of new legal licenses, safety permits, health certifications, and institutional board affiliations.",
        "kv": [
            ("Obligation Title", "Formal statutory title (e.g., 'Drinking Water & Sanitation Certificate')"),
            ("Regulatory Board / Authority", "Issuing government agency or municipal corporation"),
            ("Statutory Expiration Date", "Date picker establishing official certificate expiration"),
            ("Responsible Administrative Staff", "Dropdown selecting senior staff member accountable for renewals"),
            ("Inspection Frequency", "Dropdown selecting mandatory inspection intervals (Annual, Semi-annual)"),
            ("Mandatory Documents Required", "Checklist of lab test reports and municipal inspection forms")
        ],
        "interaction": "Accessible via '+ Add obligation' on the Compliance tracker. Submitting immediately activates automated renewal countdowns.",
        "logic": "Enforces that Expiration Date is in the future and assigns initial 'Compliant' status.",
        "callout": "Always store the physical original certificate in the school legal safe and upload a high-resolution scan to the compliance record."
    },
    {
        "ref": "REF-59",
        "title": "Compliance Certification & Audit Dossier Drawer",
        "img": "59_compliance_obligation_detail_drawer.png",
        "purpose": "A sliding drawer displaying statutory certificate details, government inspection records, renewal application checklists, and official filings.",
        "kv": [
            ("Obligation Banner", "Statutory title, compliance ID, governing body, and live status badge"),
            ("Certification Timeline", "Original issue date, last renewal date, and next mandatory audit deadline"),
            ("Responsible Officer Dossier", "Staff lead name, designation, and direct contact details"),
            ("Statutory Requirements Checklist", "Step-by-step verification checklist required for municipal sign-off"),
            ("Audit Trail & Inspection Notes", "Inspector remarks, laboratory water purity test results, and safety clearances"),
            ("Action Buttons", "Record Renewal Filing, Upload Official Certificate Scan, and Print Compliance Dossier")
        ],
        "interaction": "Compliance officers record government inspection dates and upload certified renewal letters directly from this drawer.",
        "logic": "Maintains an immutable legal audit record protecting school trustees and administrators from statutory non-compliance penalties.",
        "callout": "Review this compliance drawer monthly with the school management committee to prevent license lapses."
    },
    {
        "ref": "REF-60",
        "title": "IT & Operational Support Service Queue",
        "img": "60_helpdesk_service_tickets.png",
        "purpose": "A centralized ticketing queue for logging, assigning, and resolving technical, facility, and administrative support requests from teachers, parents, and staff.",
        "kv": [
            ("Ticket ID Column", "Unique service tracking code (e.g., SUP-119)"),
            ("Subject & Summary", "Brief issue description (e.g., 'Smartboard display HDMI connection faulty in Room 204')"),
            ("Requester Name & Role", "Staff or parent submitting the ticket (e.g., Kavita Iyer · Teacher)"),
            ("Service Category Badge", "IT Hardware, Software / Portal, Facilities Maintenance, Fee Billing Query"),
            ("Priority Level Badge", "Normal (Blue), High (Amber), or Urgent (Red)"),
            ("Resolution Status Badge", "Open (Amber), In Progress (Blue), or Resolved (Green)"),
            ("Date Logged", "Timestamp of initial ticket submission")
        ],
        "interaction": "Clicking any ticket row opens the resolution drawer. Clicking '+ Create ticket' launches the support intake form.",
        "logic": "Open tickets display a live notification badge count in the left navigation sidebar next to 'Helpdesk'.",
        "callout": "Urgent tickets affecting active classroom instruction (e.g., smartboard failure during class) carry a mandatory 30-minute resolution SLA."
    },
    {
        "ref": "REF-61",
        "title": "Create Service Ticket Submission Form",
        "img": "61_helpdesk_create_ticket_form.png",
        "purpose": "Provides teachers, parents, and administrative staff with an intuitive form for reporting equipment breakdowns, facility repairs, or system issues.",
        "kv": [
            ("Ticket Subject Line", "Concise summary of the breakdown or request"),
            ("Requester Full Name", "Name of person reporting the issue"),
            ("Requester Role", "Teacher, Staff, Parent, or Student Council"),
            ("Issue Category Selector", "IT Hardware, Software, Electrical, Plumbing, Furniture, Billing"),
            ("Urgency Priority Selector", "Normal (Routine request), High (Affects multiple users), Urgent (Classroom stopped)"),
            ("Detailed Description", "Multi-line text area detailing location, room number, and symptoms")
        ],
        "interaction": "Accessible via '+ Create ticket'. Features automatic form validation and immediate queue dispatch.",
        "logic": "Submitting increments the open ticket sequence and increments the sidebar notification counter.",
        "callout": "Encourage teachers to include the specific classroom room number in the subject line to speed up technician dispatch."
    },
    {
        "ref": "REF-62",
        "title": "Service Ticket Resolution & Escalation Drawer",
        "img": "62_helpdesk_ticket_detail_drawer.png",
        "purpose": "A sliding drawer enabling IT technicians and facilities managers to update ticket statuses, log troubleshooting notes, and close resolved issues.",
        "kv": [
            ("Ticket Banner", "Ticket ID, subject title, priority level, and current workflow status"),
            ("Requester Information", "Staff name, role, contact phone, and submission timestamp"),
            ("Detailed Problem Statement", "Full description of reported breakdown and physical location"),
            ("Status Updater Selector", "Workflow dropdown allowing status transitions: Open → In Progress → Resolved"),
            ("Technician Resolution Notes", "Text area for documenting corrective actions taken and parts replaced"),
            ("Close Ticket Action Button", "Finalizes the ticket, records resolution timestamp, and clears sidebar badge")
        ],
        "interaction": "Technicians select 'Resolved', enter completion notes, and click 'Save changes'. The ticket immediately moves to resolved status.",
        "logic": "Resolving a ticket decrements the sidebar badge counter and sends an automated completion notice to the requester.",
        "callout": "Always document the root cause of hardware failures in the resolution notes to identify recurring equipment defects."
    },
    {
        "ref": "REF-63",
        "title": "Executive Analytics & Institutional Performance Reports",
        "img": "63_reports_leadership_insights.png",
        "purpose": "Synthesizes institutional data into executive visual analytics, charts, conversion funnels, grade-wise student distributions, and financial collection projections.",
        "kv": [
            ("Admissions Funnel Analytics", "Visual funnel chart: 42 Inquiries → 28 Contacted → 18 Visits → 12 Applications → 8 Admitted (68% Conversion)"),
            ("Grade-Wise Student Distribution", "Bar chart displaying enrollment capacity across Pre-K, Primary, Middle, and High School wings"),
            ("Monthly Collection Velocity", "Trending line chart tracking cash-flow collections versus billed targets across academic terms"),
            ("Daily Attendance Health", "Comparative attendance trends across grades with chronic absence flags"),
            ("Export Analytics Report", "Generates consolidated executive PDF and CSV summaries for board governance meetings")
        ],
        "interaction": "School leaders toggle between academic and financial reporting tabs, adjust date ranges, and export executive decks.",
        "logic": "Analytics recalculate reactively from all transactional tables, providing zero-latency business intelligence.",
        "callout": "Present these charts during quarterly school board meetings to justify capital expenditures and faculty expansion plans."
    },
    {
        "ref": "REF-64",
        "title": "School Profile & Academic Year Configuration",
        "img": "64_settings_school_profile.png",
        "purpose": "Allows system administrators to manage institutional identity, official school name, board affiliation codes, academic calendar year, and campus configurations.",
        "kv": [
            ("School Legal Name", "Text input for official institution title (e.g., 'Northstar International School')"),
            ("Academic Session Year", "Active academic calendar year (e.g., '2026-2027')"),
            ("Institutional Contact Email", "Primary administrative email (e.g., 'hello@northstar.demo')"),
            ("Primary Campus Locations", "Listing of configured campus facilities (Main Campus, West Campus)"),
            ("Curriculum Board Affiliation", "Affiliated board codes (CBSE Affiliation #, Cambridge Center ID)"),
            ("Save Settings Action", "Applies institutional updates globally across all headers, parent portals, and receipts")
        ],
        "interaction": "Updating the school name or academic year and clicking 'Save settings' immediately propagates changes across the entire application.",
        "logic": "Settings are saved to `db.settings` in local storage and reactively re-render sidebar footers and official receipt headers.",
        "callout": "Lock settings modifications to Super Administrator accounts to prevent accidental changes to the active academic year."
    },
    {
        "ref": "REF-65",
        "title": "Factory Reset Demo Data Confirmation Modal",
        "img": "65_settings_reset_confirm_modal.png",
        "purpose": "A safety confirmation modal dialog preventing accidental erasure while allowing administrators to restore pristine client demonstration records with a single click.",
        "kv": [
            ("Warning Dialog Header", "High-visibility warning indicating that all local changes will be cleared"),
            ("Restoration Scope", "Resets students, admission leads, fee payments, attendance marks, and settings to factory demo state"),
            ("Confirm Reset Button", "Red destructive action button that purges local modifications and reloads sample database"),
            ("Cancel Action Button", "Dismisses the modal safely without altering current session records")
        ],
        "interaction": "Triggered by clicking 'Reset demo data' in Settings. Clicking 'Confirm reset' reloads the factory demo dataset instantly.",
        "logic": "Clears `localStorage` key `campusos_demo_db_v4` and re-seeds the application from the default database definition.",
        "callout": "Use this function prior to conducting client demonstrations to ensure all numbers, charts, and pipelines start in a clean state."
    },
    {
        "ref": "REF-66",
        "title": "Multi-Campus Tenancy: Main Campus Partition",
        "img": "66_campus_main_campus_filtered.png",
        "purpose": "Demonstrates multi-branch isolation by filtering all dashboards, rosters, pipelines, and financial reports strictly for the institution's primary campus facility.",
        "kv": [
            ("Campus Switcher State", "Global topbar dropdown set explicitly to 'Main Campus'"),
            ("Isolated KPI Figures", "Student counts, admissions inquiries, and fee figures recalculated strictly for Main Campus students"),
            ("Roster Scoping", "Admissions, student, and staff tables display only personnel and students stationed at Main Campus"),
            ("Independent Operations", "Attendance roll calls and timetables reflect only Main Campus facilities and classrooms")
        ],
        "interaction": "Selecting 'Main Campus' in the topbar instantly filters every table, metric card, and register throughout the application.",
        "logic": "Global state `state.campus = 'Main Campus'` applies automatic filtering `item.campus === state.campus` across all view queries.",
        "callout": "Campus principals should lock their browser view to their specific campus to avoid reviewing metrics from sister branches."
    },
    {
        "ref": "REF-67",
        "title": "Multi-Campus Tenancy: West Campus Partition",
        "img": "67_campus_west_campus_filtered.png",
        "purpose": "Demonstrates seamless branch switching by isolating data for the West Campus branch, proving true multi-tenant operations within a single unified platform.",
        "kv": [
            ("Campus Switcher State", "Global topbar dropdown set explicitly to 'West Campus'"),
            ("Localized Operational Metrics", "Shows West Campus admissions leads (e.g., Myra Patel, Anaya Vyas) and assigned staff (Arjun Rao, Meera Singh)"),
            ("Branch Timetables", "Timetables and classroom allocations scoped strictly to West Campus physical buildings"),
            ("Decentralized Accounting", "Fee collection tracking isolated to West Campus bank accounts and counter cashiers")
        ],
        "interaction": "Selecting 'West Campus' executes a seamless, zero-reload transition of all active views to West Campus data.",
        "logic": "Validates that multi-campus schools can operate multiple geographic sites with complete operational independence yet unified reporting.",
        "callout": "The Central Executive Directorate can switch to 'All campuses' to see unified group figures, while local branch managers view their branch."
    },
    {
        "ref": "REF-68",
        "title": "Mobile Responsive: Executive Dashboard View",
        "img": "68_mobile_overview_dashboard.png",
        "purpose": "Optimizes the executive management dashboard for mobile smartphones (390×844 viewport), allowing principals and administrators to run school operations on the move.",
        "kv": [
            ("Single-Column Touch Layout", "KPI cards adapt from a 4-column desktop grid into touch-friendly vertical summary cards"),
            ("Touch Topbar Header", "Streamlined mobile header featuring a hamburger menu toggle, compact title, and notifications trigger"),
            ("Mobile Quick Action Pills", "Prominent tap targets for rapid task creation and urgent parent broadcasts"),
            ("Collapsible Operational Feed", "Touch-friendly activity feed formatted for thumb scrolling on smartphones"),
            ("Responsive Typography", "Scaled font sizes and touch-friendly padding preventing horizontal layout overflows")
        ],
        "interaction": "Administrators swipe vertically to inspect school health and tap any card to drill down into mobile-optimized tables.",
        "logic": "CSS media queries (`@media (max-width: 900px)`) activate responsive single-column layouts and fluid flexbox wrapping.",
        "callout": "Principals can inspect daily morning roll-call completion on their smartphone while conducting campus walkthroughs."
    },
    {
        "ref": "REF-69",
        "title": "Mobile Responsive: Off-Canvas Sliding Navigation Drawer",
        "img": "69_mobile_sidebar_navigation.png",
        "purpose": "A sliding off-canvas mobile menu providing smartphone users with rapid, thumb-accessible navigation across all 12 operational modules.",
        "kv": [
            ("Sliding Off-Canvas Sidebar", "Smoothly slides in from the left upon tapping the topbar hamburger icon"),
            ("Dark Translucent Backdrop", "Dimmed backdrop overlay focusing user attention on navigation choices"),
            ("Categorized Module Links", "Clearly grouped navigation links for Academics, Administration, Finance, Operations, and Settings"),
            ("Notification Badges", "Displays active ticket counts and pending reminders directly on mobile menu items"),
            ("One-Tap Close Gesture", "Tapping anywhere on the darkened backdrop or selecting a link smoothly dismisses the menu")
        ],
        "interaction": "Tapping the hamburger menu slides out the menu. Tapping 'Admissions' navigates to the admissions view and auto-dismisses the drawer.",
        "logic": "Managed by `state.mobile = true/false` with CSS hardware-accelerated transform transitions for 60fps mobile smoothness.",
        "callout": "Provides mobile users with exact feature parity with the desktop application without sacrificing screen real estate."
    },
    {
        "ref": "REF-70",
        "title": "Mobile Responsive: Admissions Kanban Touch Pipeline",
        "img": "70_mobile_admissions_pipeline.png",
        "purpose": "Adapts the admissions pipeline kanban board for handheld mobile screens, supporting horizontal touch-swiping across enrollment stages.",
        "kv": [
            ("Horizontal Touch Scroll", "Smooth touch scrolling across pipeline columns: New Enquiry, Contacted, Visit, Application, Admitted"),
            ("Compact Touch Cards", "Candidate cards displaying applicant name, applied grade, and counselor with thumb-friendly tap targets"),
            ("One-Tap Detail Inspection", "Tapping any candidate card smoothly slides up the mobile-optimized lead dossier"),
            ("Quick Call Action", "Direct tap-to-call button allowing counselors to dial prospective parents directly from their smartphone")
        ],
        "interaction": "Counselors swipe horizontally between stages and tap cards to update lead statuses during weekend open house events.",
        "logic": "Maintains stage groupings in a flexible touch-scrolling container (`overflow-x: auto; -webkit-overflow-scrolling: touch`).",
        "callout": "Admissions counselors can use their smartphones during education fairs to log and progress leads in real-time."
    },
    {
        "ref": "REF-71",
        "title": "Mobile Responsive: Attendance Roll-Call Register",
        "img": "71_mobile_attendance_register.png",
        "purpose": "Enables teachers to take daily classroom attendance directly on a smartphone or mobile tablet while moving around the classroom or playground.",
        "kv": [
            ("Touch-Optimized Student List", "Vertical student roster with large, thumb-friendly touch zones for roll call"),
            ("Rapid Status Toggle Buttons", "Large status pills (P, A, L, E) designed for accurate single-tap cycling on mobile touchscreens"),
            ("Sticky Class Header", "Maintains class name (Grade 8 A) and live attendance percentage visible at the top of the screen during scrolling"),
            ("Quick Save & Submit", "One-tap action to commit daily attendance marks directly to the institutional cloud database")
        ],
        "interaction": "Teachers tap the status badge next to each student's name to cycle statuses in seconds while conducting physical roll call.",
        "logic": "Touch events immediately trigger local state updates and live percentage recalculations without keyboard popups or screen jumping.",
        "callout": "Physical education teachers and field trip chaperones can take accurate attendance outdoors on mobile devices without relying on paper rosters."
    }
]

print(f"Loaded Part 3: {len(PART_3_FEATURES)} features.")
