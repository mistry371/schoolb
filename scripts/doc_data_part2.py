# doc_data_part2.py - Screenshots 24 to 47

PART_2_FEATURES = [
    {
        "ref": "REF-24",
        "title": "Middle School (Grade 8-A) Weekly Roll Call Register",
        "img": "24_attendance_grade_8_a_register.png",
        "purpose": "Provides homeroom teachers with a high-efficiency weekly roll-call matrix allowing one-click cycling of student attendance statuses and real-time computation of class attendance percentages.",
        "kv": [
            ("Classroom Header", "Grade 8 A roll call register showing total enrolled students (28) and assigned room (Room 204)"),
            ("Weekly Calendar Matrix", "5-day operational roll call columns spanning Monday through Friday"),
            ("Click-to-Cycle Status Pills", "Interactive status pill cycling: Present (Green 'P'), Absent (Red 'A'), Late (Amber 'L'), Excused (Blue 'E')"),
            ("Dynamic Counters", "Real-time daily counters tracking total Present, Absent, and Late students"),
            ("Class Attendance Percentage", "Real-time percentage recalculation (e.g., 95.8%) dynamically reacting to each mark toggle"),
            ("Student Roll Roster", "Alphabetical list of students with roll numbers and guardian contact shortcuts")
        ],
        "interaction": "Teachers click directly on any day's status pill next to a student's name to instantly cycle their attendance status. The class percentage updates instantaneously without page reload.",
        "logic": "Marks are keyed by `studentId_dayIndex`. Total class attendance percentage is derived as `(Present + Late) / Total Enrolled * 100`, accurately reflecting true physical presence.",
        "callout": "Taking attendance digitally eliminates paper registers and immediately flags unexcused absences for automated parent SMS dispatch by 09:00 AM."
    },
    {
        "ref": "REF-25",
        "title": "Primary School (Grade 5-B) Weekly Roll Call Register",
        "img": "25_attendance_grade_5_b_register.png",
        "purpose": "A dedicated attendance register tailored for primary education homerooms, supporting young learner attendance tracking, medical leaves, and early pickups.",
        "kv": [
            ("Primary Classroom Header", "Grade 5 B homeroom register under Class Teacher Neha Patel"),
            ("Status Visuals", "High-contrast color badges designed for quick scanning on tablets and touchscreens"),
            ("Consecutive Absence Flags", "Visual indicator alerting teachers when a primary student is absent for 2 or more consecutive days"),
            ("Medical Note Indicator", "Flags students with verified parent medical notes or authorized leaves")
        ],
        "interaction": "Primary teachers mark roll call during morning circle time. Single-tap status switching supports rapid roll call on interactive smartboards or tablets.",
        "logic": "State updates immediately commit to local storage and sync with the student's 360° profile attendance history.",
        "callout": "For primary school students, any unexcused absence of more than 1 day triggers an automatic phone follow-up by the school counselor."
    },
    {
        "ref": "REF-26",
        "title": "High School (Grade 10-B) Register & Multi-Campus Fallback",
        "img": "26_attendance_grade_10_b_register.png",
        "purpose": "Demonstrates multi-campus tenant isolation and intelligent empty-state handling when a user views a classroom assigned to an alternate campus branch.",
        "kv": [
            ("Multi-Campus Partitioning", "Grade 10 B class associated with West Campus branch"),
            ("Intelligent Empty State", "User-friendly notification explaining that no Grade 10-B students are enrolled under Main Campus"),
            ("Show All Campuses Button", "One-click override button allowing cross-campus attendance inspection without changing global settings"),
            ("Cross-Campus Roll Call Roster", "Restores full student roster across both branches upon user request")
        ],
        "interaction": "If the active topbar campus filter does not match the class's campus, an empty state appears with a 'Show All Campuses' button. Clicking it instantly renders all students.",
        "logic": "Prevents administrative confusion by explicitly explaining zero-student results rather than displaying a blank broken table.",
        "callout": "Use the global topbar campus switcher to lock your session to your assigned campus to ensure only your local students appear in daily registers."
    },
    {
        "ref": "REF-27",
        "title": "Academic Assessment Schedules Master Ledger",
        "img": "27_academics_assessments_table.png",
        "purpose": "Maintains an institutional schedule of all summative, formative, and practical examinations across departments, detailing dates, maximum marks, evaluating teachers, and grading progress.",
        "kv": [
            ("Assessment ID Column", "Unique evaluation code (e.g., EX-201, EX-202)"),
            ("Assessment Title & Subject", "Subject name and specific assessment topic (e.g., Mathematics · Quadratic Equations)"),
            ("Target Class/Grade", "Class cohort evaluated (e.g., Grade 8 A, Grade 10 B)"),
            ("Examination Date & Time", "Scheduled date, start time, and duration (e.g., 2026-04-12 · 09:00 AM)"),
            ("Maximum Marks & Weightage", "Total possible marks (e.g., 50 Marks, 100 Marks) and term GPA weightage percentage"),
            ("Evaluating Faculty", "Assigned subject teacher responsible for grading and mark entry"),
            ("Status Badge", "Scheduled (Blue), In Progress (Amber), or Completed (Green)")
        ],
        "interaction": "Clicking any assessment row opens the detailed syllabus and rubric drawer. Clicking '+ Schedule assessment' launches the exam creation form.",
        "logic": "Calculates upcoming exam countdowns and flags schedule overlaps where the same class has more than two assessments on the same day.",
        "callout": "Assessment schedules should be published at least 14 days in advance to allow adequate student revision and laboratory prep."
    },
    {
        "ref": "REF-28",
        "title": "Filtered Queue: Scheduled Upcoming Examinations",
        "img": "28_academics_filter_scheduled.png",
        "purpose": "Isolates future examinations requiring classroom seating plans, question paper printing, and teacher invigilation rosters.",
        "kv": [
            ("Upcoming Assessments Queue", "Filtered list of assessments with status 'Scheduled'"),
            ("Date Ordering", "Chronological ordering placing the nearest upcoming tests at the top of the queue"),
            ("Invigilation Assignments", "Teachers assigned to supervise physical exam halls"),
            ("Venue Room Allocations", "Designated examination halls and science laboratories")
        ],
        "interaction": "Academic coordinators filter for scheduled exams to print master seating charts and dispatch exam guidelines to parents.",
        "logic": "Applies filter `db.exams.filter(x => x.status === 'Scheduled')` with real-time UI refresh.",
        "callout": "Verify that all question papers are stored in the secure examination vault 48 hours prior to scheduled test dates."
    },
    {
        "ref": "REF-29",
        "title": "Filtered Queue: Completed & Evaluated Examinations",
        "img": "29_academics_filter_completed.png",
        "purpose": "Displays finalized examinations with recorded student scores, grade distributions, and finalized report card comments.",
        "kv": [
            ("Completed Assessments Queue", "Filtered list of assessments with status 'Completed'"),
            ("Class Average Scores", "Summary metric displaying class average percentage and standard deviation"),
            ("Evaluation Timeline", "Date evaluated and signed off by the Head of Department"),
            ("Report Card Publication Status", "Indicator showing whether marks have been released to the Parent Portal")
        ],
        "interaction": "Teachers and HODs review score distributions to identify topics requiring remedial teaching sessions.",
        "logic": "Applies filter `db.exams.filter(x => x.status === 'Completed')`.",
        "callout": "Teachers must finalize mark entry within 5 business days of exam completion to maintain prompt report card delivery."
    },
    {
        "ref": "REF-30",
        "title": "Assessment Specification & Syllabus Breakdown Drawer",
        "img": "30_academics_assessment_detail_drawer.png",
        "purpose": "A sliding drawer detailing the curricular syllabus, question paper blueprint, passing criteria, and teacher instructions for a specific assessment.",
        "kv": [
            ("Assessment Header", "Exam title, code, subject, and assigned class cohort"),
            ("Curricular Units Tested", "List of textbook chapters and practical modules evaluated"),
            ("Examination Blueprint", "Breakdown of objective, short-answer, and descriptive problem allocations"),
            ("Grading Scale Rubric", "Performance thresholds for A+, A, B, C, and Remedial (F) tiers"),
            ("Assigned Invigilators", "Staff members scheduled for test proctoring"),
            ("Action Buttons", "Edit Schedule, Record Student Marks, and Print Exam Roster")
        ],
        "interaction": "Teachers can click 'Record Marks' to launch the gradebook entry grid for enrolled students.",
        "logic": "Maintains an immutable audit trail of mark modifications to ensure grading integrity.",
        "callout": "Include the grading rubric in advance on circulars so parents understand the evaluation criteria."
    },
    {
        "ref": "REF-31",
        "title": "Schedule New Assessment & Examination Form",
        "img": "31_academics_schedule_assessment_form.png",
        "purpose": "Standardizes the entry of new examinations into the institutional calendar with automatic conflict detection across classes and teachers.",
        "kv": [
            ("Assessment Title", "Descriptive name (e.g., 'Unit Test 2 — Calculus & Vectors')"),
            ("Subject Selector", "Dropdown covering Mathematics, Physics, Chemistry, English, History, etc."),
            ("Target Class/Grade", "Class cohort (e.g., Grade 8 A, Grade 10 B)"),
            ("Examination Date", "Date picker enforcing future scheduling"),
            ("Duration & Start Time", "Time selector and duration in minutes (e.g., 90 minutes)"),
            ("Maximum Marks", "Total score capacity (e.g., 50, 80, 100)"),
            ("Evaluating Teacher", "Dropdown selecting subject faculty member responsible for grading"),
            ("Examination Room", "Room assignment ensuring no double-booking of halls")
        ],
        "interaction": "Accessible via '+ Schedule assessment'. Features validation checks and instant calendar integration.",
        "logic": "Validates that Maximum Marks is a positive integer and that start time does not clash with another scheduled exam for the same grade.",
        "callout": "Ensure assessment durations respect age-appropriate attention spans: 45 minutes for primary, 90 minutes for middle, and 180 minutes for high school."
    },
    {
        "ref": "REF-32",
        "title": "Accounts Receivable & Fee Invoicing Ledger",
        "img": "32_fees_invoices_table.png",
        "purpose": "Serves as the central financial ledger for the school, tracking all student fee billings, collected tuition, outstanding receivables, and payment reconciliation.",
        "kv": [
            ("Total Invoiced Metric Card", "₹4.6M total fees billed across tuition, transport, and term fees"),
            ("Total Collected Metric Card", "₹4.2M total realized funds collected through bank and cash receipts"),
            ("Total Outstanding Metric Card", "₹400K total outstanding receivables across overdue and partial accounts"),
            ("Invoice # Column", "Unique fiscal tracking number (e.g., INV-2026-301)"),
            ("Student & Grade Column", "Student recipient, enrollment ID, and homeroom section"),
            ("Fee Head Type", "Term 1 Tuition, Annual Composite Fee, Transport Surcharge, Laboratory Fee"),
            ("Amount & Balance Columns", "Total billed amount, amount paid to date, and net outstanding balance"),
            ("Payment Status Badge", "Paid (Green), Partial (Amber), or Overdue (Red)"),
            ("Due Date & Actions", "Payment deadline date and one-click Quick Pay trigger button")
        ],
        "interaction": "Accountants can filter invoices by status, search by student name or invoice number, or click any row to launch the payment drawer.",
        "logic": "Summary metric cards calculate totals dynamically from `db.fees`. Net balance equals `amount - paid`.",
        "callout": "Review the Total Outstanding metric on Monday mornings to prioritize collection calls for accounts in 30+ day arrears."
    },
    {
        "ref": "REF-33",
        "title": "Priority Collections: Overdue Invoices Filter",
        "img": "33_fees_filter_overdue.png",
        "purpose": "Filters the financial ledger to display only delinquent accounts past their payment deadline, providing contact numbers for immediate follow-up.",
        "kv": [
            ("Overdue Accounts Queue", "Filtered list of invoices with status 'Overdue'"),
            ("Delinquency Aging", "Days elapsed past the payment due date"),
            ("Guardian Direct Dial", "One-click phone call trigger to parent mobile number"),
            ("Outstanding Debt Total", "Aggregated delinquent total across all overdue students")
        ],
        "interaction": "Clicking the 'Overdue' filter pill isolates high-risk accounts. Accounts staff can trigger batch SMS reminders to all overdue guardians.",
        "logic": "Applies filter `db.fees.filter(x => x.status === 'Overdue')`.",
        "callout": "Send a friendly SMS reminder 3 days before marking an invoice overdue to maintain positive parent relationships."
    },
    {
        "ref": "REF-34",
        "title": "Installment Accounts: Partial Fee Payments Filter",
        "img": "34_fees_filter_partial.png",
        "purpose": "Tracks students on approved split-installment payment plans, monitoring partial payments and upcoming installment due dates.",
        "kv": [
            ("Partial Payments Queue", "Filtered list of accounts with status 'Partial'"),
            ("Installment Progress", "Shows paid amount versus remaining balance (e.g., ₹25,000 paid of ₹45,000)"),
            ("Next Installment Date", "Agreed deadline for the secondary installment deposit"),
            ("Guardian Installment Note", "Approved financial aid or sibling concession memorandum")
        ],
        "interaction": "Finance staff record incoming second installment payments directly against the existing invoice record.",
        "logic": "Invoices remain in 'Partial' status until `paid == amount`, at which point the system automatically switches status to 'Paid'.",
        "callout": "Verify post-dated cheques for partial payment accounts at least 3 business days prior to bank presentation."
    },
    {
        "ref": "REF-35",
        "title": "Reconciled Ledger: Fully Paid Invoices Filter",
        "img": "35_fees_filter_paid.png",
        "purpose": "Provides a clean, reconciled audit trail of all fully settled fee transactions, supporting daily bank reconciliation and end-of-term auditing.",
        "kv": [
            ("Settled Accounts Queue", "Filtered list of invoices with status 'Paid' and ₹0 outstanding balance"),
            ("Receipt Number Cross-Reference", "Official school receipt number attached to each settled invoice"),
            ("Payment Mode Distribution", "Breakdown of settlements via UPI, Net Banking, Credit Card, and Cash"),
            ("Settlement Timestamp", "Exact date and time of final fund clearance")
        ],
        "interaction": "Auditors and parents can view, re-download, or reprint official stamped receipts for any past paid invoice.",
        "logic": "Applies filter `db.fees.filter(x => x.status === 'Paid')`.",
        "callout": "Export the settled invoices table weekly and reconcile against the school bank account statement."
    },
    {
        "ref": "REF-36",
        "title": "Invoice Detail, 1-Click Quick Pay & Printable Receipt Box",
        "img": "36_fees_invoice_detail_and_quickpay.png",
        "purpose": "A comprehensive fee payment drawer featuring invoice details, 1-click 'Pay Full' and 'Pay Half' buttons, custom payment recording, and an immediate printable receipt preview.",
        "kv": [
            ("Invoice Identity Header", "Invoice number, date of issue, payment due date, and current status badge"),
            ("Student & Family Dossier", "Student name, ID, class, parent name, and contact telephone"),
            ("Financial Breakdown", "Gross billed amount, already paid amount, and net outstanding balance"),
            ("1-Click Quick Pay Buttons", "Fast action buttons: 'Pay Full (₹X)' and 'Pay Half (₹Y)' for rapid counter processing"),
            ("Custom Payment Amount Input", "Manual numeric input for custom installment payments"),
            ("Payment Mode Selector", "Dropdown for Bank Transfer, UPI, Credit/Debit Card, Cheque, or Cash"),
            ("Official Receipt Preview Box", "Instant visual preview box displaying receipt number, timestamp, and amount"),
            ("Print Receipt Action", "One-click trigger generating a clean, printable PDF receipt format")
        ],
        "interaction": "Cashiers can click 'Pay Full' to immediately settle an invoice in 1 click. The receipt preview updates instantly with the new payment confirmation.",
        "logic": "Payment automatically deducts from the student's outstanding balance, updates invoice status to 'Paid' or 'Partial', logs a timestamped receipt, and recalibrates the dashboard.",
        "callout": "Always provide the parent with the instant digital receipt or printed receipt copy as proof of counter settlement."
    },
    {
        "ref": "REF-37",
        "title": "Generate Fee Invoice Drawer Form",
        "img": "37_fees_create_invoice_form.png",
        "purpose": "Standardizes the generation of new fee demand invoices for tuition, transportation, examination fees, or annual sports fees.",
        "kv": [
            ("Student Search Selector", "Dropdown with autocomplete matching enrolled students"),
            ("Fee Head Category", "Tuition Fee, Transportation Surcharge, Laboratory Fee, Annual Charges, Uniforms"),
            ("Billed Amount", "Numeric input for total payable amount in Indian Rupees (₹)"),
            ("Payment Due Date", "Calendar picker establishing the deadline before overdue penalties apply"),
            ("Concession / Scholarship", "Optional deduction field for staff wards, merit scholars, or sibling discounts"),
            ("Invoice Notes & Remarks", "Freeform text area for term details or bank wire transfer instructions")
        ],
        "interaction": "Accessible via '+ Create invoice' on the Fees ledger. Submitting immediately appends the invoice to the ledger and updates student dues.",
        "logic": "Enforces that Amount is greater than 0 and Due Date is on or after the invoice creation date.",
        "callout": "Attach explicit invoice notes indicating accepted digital payment methods and bank account IFSC codes to facilitate online transfers."
    },
    {
        "ref": "REF-38",
        "title": "Master Weekly Timetable Schedule Matrix",
        "img": "38_timetable_weekly_schedule.png",
        "purpose": "Visualizes the school's master instructional timetable across daily periods (08:30 to 15:30) and days of the week, tracking room utilization and teacher allocations.",
        "kv": [
            ("Period Time Slots", "Consecutive teaching periods spanning Period 1 through Period 7 with break intervals"),
            ("Day Columns", "Operational schedule columns for Monday through Friday"),
            ("Class & Section Filter", "Dropdown allowing administrators to view schedules for specific grades or faculty"),
            ("Subject Schedule Blocks", "Color-coded course blocks displaying Subject Name, Classroom Room Number, and Faculty"),
            ("Substitution Indicator", "Visual badge highlighting periods where a substitute instructor is covering a class")
        ],
        "interaction": "Clicking any timetable block opens the Class Slot Details modal. Clicking '+ Add event' allows scheduling special lectures or exam periods.",
        "logic": "Conflict detection logic prevents assigning the same teacher or classroom to two overlapping periods.",
        "callout": "Keep at least one free period per day in each teacher's schedule to allow time for grading, parent calls, and lesson planning."
    },
    {
        "ref": "REF-39",
        "title": "Class Period & Room Assignment Detail Modal",
        "img": "39_timetable_class_slot_modal.png",
        "purpose": "A focused modal dialog displaying granular information for an individual timetable period, including lesson topics, assigned room, teacher, and attendance links.",
        "kv": [
            ("Subject & Grade Banner", "Subject title (e.g., Mathematics) and class cohort (Grade 8 A)"),
            ("Time & Day Details", "Scheduled day (Monday) and precise period duration (08:30 - 09:30)"),
            ("Physical Room Allocation", "Assigned location (e.g., Room 204 / Physics Lab 1)"),
            ("Assigned Instructor", "Lead faculty member (e.g., Kavita Iyer) with direct profile link"),
            ("Lesson Plan Summary", "Curriculum unit covered during this scheduled session")
        ],
        "interaction": "Teachers can click from this modal directly into the live roll call register for the scheduled class.",
        "logic": "Provides a read-only or editable inspection layer depending on the authenticated user's administrative privileges.",
        "callout": "Use this modal during classroom walkthroughs to verify that instructional delivery aligns with the published syllabus."
    },
    {
        "ref": "REF-40",
        "title": "Add Class Event, Exam or Substitution Modal",
        "img": "40_timetable_add_class_event_modal.png",
        "purpose": "Allows administrators to schedule special school events, examination slots, guest lectures, or substitute teacher assignments into the weekly schedule.",
        "kv": [
            ("Event Title", "Descriptive name (e.g., 'Physics Practical Substitution · R. Menon')"),
            ("Day of Week Selector", "Dropdown choosing target day (Monday through Friday)"),
            ("Event Start Time", "Time input establishing period start"),
            ("Room & Teacher Field", "Combined text input or selectors specifying location and instructor"),
            ("Target Class Cohort", "Classroom cohort receiving the scheduled event")
        ],
        "interaction": "Accessible via '+ Add event' on the Timetable view. Submitting updates the weekly schedule grid immediately.",
        "logic": "Validates inputs and pushes the event into `db.timetable`, instantly refreshing the visual grid.",
        "callout": "Log teacher substitutions at least 30 minutes before school assembly to ensure class coverage without disruptions."
    },
    {
        "ref": "REF-41",
        "title": "Parent Portal Family Command Center",
        "img": "41_parent_portal_family_preview.png",
        "purpose": "Provides parents and guardians with a unified, transparent view of their child's academic attendance, due fees, assessment results, and official school circulars.",
        "kv": [
            ("Student Identity Card", "Student photo, full name, enrollment ID, class, and homeroom teacher name"),
            ("Attendance Health Gauge", "Visual attendance progress bar and percentage (e.g., 96.4%)"),
            ("Fee Balance & Pay Now CTA", "Outstanding fee invoices with immediate online payment action button"),
            ("Recent Academic Grades", "Latest scores from unit tests, mid-term evaluations, and teacher remarks"),
            ("Active School Circulars", "Direct feed of official announcements, holiday notices, and field trip permissions"),
            ("Direct Teacher Contact", "Secure messaging channel to communicate with homeroom and subject teachers")
        ],
        "interaction": "Parents can review academic progress, view attendance history, settle outstanding fees online, and download circular attachments.",
        "logic": "Secured to show only data belonging to the logged-in parent's verified student wards, ensuring strict FERPA/GDPR compliance.",
        "callout": "Promote adoption of the Parent Portal during orientation to reduce inbound front-desk inquiries by up to 70%."
    },
    {
        "ref": "REF-42",
        "title": "Official Broadcast Circulars & Bulletins Feed",
        "img": "42_communication_circulars.png",
        "purpose": "A centralized communications hub for drafting, approving, and dispatching official school notices, administrative bulletins, and emergency alerts.",
        "kv": [
            ("Circular ID & Title", "Official serial number (e.g., MSG-301) and notice title"),
            ("Target Audience Column", "Designated recipient group: All School, Parents, Faculty, or Specific Grades"),
            ("Dispatch Channels Badge", "Multi-channel broadcast tags: In-app Notification, SMS, and Email"),
            ("Publication Date", "Timestamp of official publication and delivery"),
            ("Delivery Status", "Sent, Draft, or Scheduled indicator"),
            ("Read Acknowledgment Rate", "Percentage of target parents who have opened and acknowledged the notice")
        ],
        "interaction": "Clicking any circular row opens the full message drawer with recipient audit logs. Clicking '+ Compose' launches the announcement composer.",
        "logic": "Circulars dispatched across In-app and SMS immediately trigger updates in the Parent Portal feed.",
        "callout": "Use multi-channel dispatch (In-App + SMS) for urgent weather closures or transportation delays to guarantee immediate visibility."
    },
    {
        "ref": "REF-43",
        "title": "Compose Circular Broadcast Drawer Form",
        "img": "43_communication_compose_form.png",
        "purpose": "Provides school leadership and administrative heads with a structured composition drawer for drafting school-wide announcements with channel and audience targeting.",
        "kv": [
            ("Circular Subject Line", "Clear, concise title for the announcement"),
            ("Target Audience Selector", "Dropdown choosing All School, Parents Only, Faculty Only, or Specific Grade Cohorts"),
            ("Delivery Channels Multi-Select", "Checkboxes for In-app Notification, SMS Alert, and Email Broadcast"),
            ("Message Body Text Area", "Formatted text editor for notice content, instructions, and dates"),
            ("Priority Flag", "Normal or Urgent alert level toggle"),
            ("Attachment Upload", "Optional PDF/image attachment for permission slips or event schedules")
        ],
        "interaction": "Accessible via '+ Compose'. Features character counters for SMS dispatches and live preview.",
        "logic": "Validates that subject and body are non-empty and at least one delivery channel is selected.",
        "callout": "Keep SMS notices under 160 characters to avoid multi-part messaging costs while directing parents to the Parent Portal for full details."
    },
    {
        "ref": "REF-44",
        "title": "Circular Delivery Audit & Dispatch Dossier",
        "img": "44_communication_message_detail.png",
        "purpose": "A sliding drawer displaying the full content of a published circular alongside delivery verification metrics, dispatch timestamps, and sender credentials.",
        "kv": [
            ("Circular Header", "Official notice title, circular ID, and publication timestamp"),
            ("Sender Authorization", "Name and designation of issuing authority (e.g., Principal Office)"),
            ("Target Audience Breakdown", "Detailed recipient list with grade and parent distribution counts"),
            ("Full Message Body", "Complete formatted announcement text and instructions"),
            ("Delivery Audit Log", "Transmission confirmation timestamps across In-app, SMS, and Email channels")
        ],
        "interaction": "Administrators inspect delivery health and can re-send notices to parents who have not yet acknowledged receipt.",
        "logic": "Provides an immutable compliance record of official school dispatches for legal and administrative audits.",
        "callout": "Maintain circular archives for at least 3 years to support statutory audit compliance and accreditation reviews."
    },
    {
        "ref": "REF-45",
        "title": "Faculty & Staff Master Directory",
        "img": "45_staff_hr_directory.png",
        "purpose": "Maintains an institutional human resources directory of all academic faculty, administrative personnel, and support staff across departments.",
        "kv": [
            ("Employee ID Column", "Unique staff identification number (e.g., EMP-101)"),
            ("Staff Full Name & Avatar", "Legal employee name with department color avatar"),
            ("Designation & Role", "Principal, Admissions Counsellor, Class Teacher, Accountant, Transport Manager"),
            ("Department Column", "Leadership, Admissions, Academics, Finance, Transport, Facilities"),
            ("Contact Phone & Email", "Direct employee telephone number and official institutional email"),
            ("Employment Status Badge", "Active (Green), On Leave (Amber), or Terminated (Red)"),
            ("Assigned Campus Branch", "Main Campus versus West Campus placement")
        ],
        "interaction": "Clicking any row opens the complete Staff Profile Drawer. Clicking '+ Add staff' launches the onboarding drawer form.",
        "logic": "Staff directory links relationally to classroom timetable allocations, course invigilations, and lead ownership.",
        "callout": "Update employee status immediately when leaves are approved to ensure substitute teachers can be automatically scheduled."
    },
    {
        "ref": "REF-46",
        "title": "Faculty Onboarding & Staff Registration Form",
        "img": "46_staff_add_member_form.png",
        "purpose": "A structured HR intake form for onboarding new teachers and administrative staff with complete credential, department, and contact information.",
        "kv": [
            ("Employee Legal Name", "Required text input for full name as per identity documents"),
            ("Designation / Role", "Dropdown covering Principal, Head of Department, Teacher, Counselor, Accountant, Coordinator"),
            ("Department Selector", "Leadership, Academics, Admissions, Finance, Transport, IT & Facilities"),
            ("Contact Phone Number", "10-digit mobile number for institutional communication"),
            ("Official Email Address", "Institutional email format (e.g., name@northstar.demo)"),
            ("Employment Status", "Active, Probationary, Contract, or Part-Time"),
            ("Assigned Campus Branch", "Main Campus or West Campus selection")
        ],
        "interaction": "Accessible via '+ Add staff' on the Staff directory. Features field validation and automatic Employee ID generation.",
        "logic": "Enforces mandatory fields and validates unique email addresses to prevent duplicate accounts.",
        "callout": "Verify background checks and degree certificates before finalizing teacher onboarding in accordance with board mandates."
    },
    {
        "ref": "REF-47",
        "title": "Staff Member Profile Dossier & Allocation Drawer",
        "img": "47_staff_member_detail_drawer.png",
        "purpose": "A comprehensive staff dossier drawer detailing employee contact info, department, assigned teaching classes, weekly timetable load, and emergency contacts.",
        "kv": [
            ("Staff Identity Banner", "Full legal name, employee ID, role badge, and department indicator"),
            ("Contact Details", "Direct telephone number, verified institutional email, and residential address"),
            ("Teaching Allocations", "Assigned classes (e.g., Grade 8 A, Grade 10 B) and subject responsibilities"),
            ("Weekly Timetable Workload", "Total teaching periods per week and scheduled preparation slots"),
            ("Assigned Campus Branch", "Primary operating campus facility"),
            ("Action Buttons", "Edit Staff Details, Reassign Classes, and View Timetable")
        ],
        "interaction": "HR managers update contact details, record leave requests, or adjust teaching loads directly from this drawer.",
        "logic": "Pulls real-time timetable allocations from `db.timetable` to display current weekly teaching hours.",
        "callout": "Ensure emergency contact information is verified annually during performance review cycles."
    }
]

print(f"Loaded Part 2: {len(PART_2_FEATURES)} features.")
