# CampusOS School CRM & Operations Platform
## Full Backend Architecture & REST API Specification

### 1. Executive Summary & Technology Stack

The CampusOS backend is an enterprise-grade RESTful API service engineered for modern multi-campus school operations. It powers both real-time web clients and external administrative tools, featuring secure authentication, dynamic role-based access control (RBAC), multi-campus tenant partitioning, automated ID sequencing, and high-performance relational storage.

- **Runtime Environment:** Node.js v24+ (ECMAScript 2024)
- **Web Application Framework:** Express.js 5
- **Database Engine:** SQLite (Native `node:sqlite` DatabaseSync)
- **Security & Cryptography:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password hashing
- **Middleware:** `cors`, `morgan`, `multer`, `dotenv`
- **Data Storage File:** `data/campusos.db`
- **Default Port:** `8765` (Configurable via `PORT` in `.env`)

---

### 2. Getting Started & Running the Server

#### Installation & Startup
```bash
# 1. Install dependencies
npm install

# 2. Run backend test suite
npm test

# 3. Start backend production server
npm start
```

Once running, access:
- **Application Frontend & API:** `http://localhost:8765`
- **API Base URL:** `http://localhost:8765/api`
- **Healthcheck Endpoint:** `http://localhost:8765/health`

---

### 3. Authentication & Security (RBAC)

All endpoints (except public authentication and health checks) support standard HTTP Bearer token authentication:
```http
Authorization: Bearer <JWT_TOKEN>
```

#### Pre-Configured Administrative Accounts
| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@northstar.demo` | `Admin@123` | Full unrestricted global read/write across all modules and campuses |
| **Principal** | `principal@northstar.demo` | `Admin@123` | Academics, Faculty, Attendance, Reports, Operations |
| **Admissions** | `admissions@northstar.demo` | `Admin@123` | Admissions CRM, Lead Funnel, Student Onboarding |
| **Teacher** | `teacher@northstar.demo` | `Admin@123` | Class Attendance, Assessments, Gradebook, Timetables |
| **Finance** | `finance@northstar.demo` | `Admin@123` | Fee Invoicing, Quick Pay, Payment Collections, Receipts |

---

### 4. Comprehensive REST API Endpoints

#### 4.1 Authentication & Profile
- `POST /api/auth/login`: Authenticate user and receive signed JWT.
  ```json
  { "email": "admin@northstar.demo", "password": "Admin@123" }
  ```
- `POST /api/auth/register`: Register a new user account.
- `GET /api/auth/me`: Get authenticated user profile.
- `POST /api/auth/switch-role`: Instant role perspective switching (Admin, Principal, Admissions, Teacher, Finance).

#### 4.2 Executive Overview & Reporting
- `GET /api/overview`: Returns consolidated KPI metrics, admissions pipeline distribution, fee collection rates, attendance compliance, priority tasks, and live operational activity feeds.
  - Query parameters: `?campus=Main Campus&role=Admin`
- `GET /api/reports`: Returns business intelligence analytics including admissions conversion funnels (68% conversion), grade-wise student distributions, financial recovery trends, and transport capacity utilization.
- `GET /api/search?q=Shah`: Universal multi-entity type-ahead search matching across students, leads, staff, fees, and helpdesk tickets.

#### 4.3 Admissions CRM & Student Enrollment
- `GET /api/leads`: Query prospective students with stage, campus, and text search filters.
- `GET /api/leads/:id`: Fetch complete prospective student dossier.
- `POST /api/leads`: Create new inquiry with auto-generated ID (`AD-XXXX`).
- `PUT /api/leads/:id`: Update inquiry details.
- `PATCH /api/leads/:id/stage`: Advance stage (`New enquiry`, `Contacted`, `School visit`, `Application`, `Admitted`).
- `POST /api/leads/:id/enrol`: **1-Click Student Enrollment** — Automatically converts admitted lead into permanent student (`ST-XXXX`), sets up 100% baseline attendance, generates initial tuition invoice (`INV-YYYY-XXX`), and updates enrollment archive.
- `DELETE /api/leads/:id`: Remove prospective inquiry.

#### 4.4 Student Information System (SIS)
- `GET /api/students`: Retrieve student directory with live balance computation, attendance percentages, and campus filters.
- `GET /api/students/:id`: Fetch 360° student profile including guardian details, invoice ledger, attendance marks, and library checkouts.
- `POST /api/students`: Register new student with automatic sequential ID generation (`ST-XXXX`).
- `PUT /api/students/:id`: Update student record.
- `DELETE /api/students/:id`: Remove student and associated attendance marks.

#### 4.5 Daily Attendance Register
- `GET /api/attendance?className=Grade 8 A`: Get 5-day weekday roll call matrix (Monday through Friday) with real-time class attendance percentage.
- `POST /api/attendance/mark`: Single-click cycling of student attendance (`Present`, `Absent`, `Late`, `Excused`) with automatic student percentage recalculation.
- `POST /api/attendance/mark-all`: Batch mark entire class cohort.

#### 4.6 Fees, Invoicing & Accounts Receivable
- `GET /api/fees`: Query invoice ledger with status filtering (`Paid`, `Partial`, `Overdue`), collection metrics, and balance tracking.
- `GET /api/fees/:id`: Fetch invoice details, guardian contact, and payment history.
- `POST /api/fees`: Generate new fee demand invoice with auto-generated ID (`INV-YYYY-XXX`).
- `POST /api/fees/:id/payment`: Record payment, update invoice paid amount, update invoice status, recalculate student balance, and issue official receipt (`REC-XXXXXX`).
- `POST /api/fees/:id/quick-pay`: **1-Click Quick Pay** counter action (`type: 'full'` or `type: 'half'`) with instant receipt preview.
- `DELETE /api/fees/:id`: Cancel invoice and recalibrate student dues.

#### 4.7 Operational Modules
| Module | Base Route | Key Operations |
| :--- | :--- | :--- |
| **Faculty & HR** | `/api/staff` | Faculty directory, roles, departments, teaching allocations |
| **IT & Operations Helpdesk** | `/api/tickets` | Support queue, categories, priority escalations, resolution notes |
| **Broadcast Circulars** | `/api/messages` | Multi-channel announcements (In-app, SMS, Email) with delivery audits |
| **Transport & Fleet** | `/api/transport` | Bus routes, vehicle registration, drivers, capacity, delay status |
| **Library Circulation** | `/api/library` | Book loans, accession barcodes, borrower tracking, return check-in |
| **Campus Facilities & Assets** | `/api/assets` | Capital equipment, serial numbers, servicing schedule, condition |
| **Statutory Compliance** | `/api/compliance` | Fire safety NOC, building stability, board affiliation, renewals |
| **Academics & Exams** | `/api/exams` | Assessment schedules, syllabus topics, max marks, grading rubrics |
| **Master Timetable** | `/api/timetable` | Weekly schedule matrix, room allocations, instructor substitutions |
| **Priority Tasks** | `/api/tasks` | Administrative to-do items, deadlines, completion toggle |

#### 4.8 System Settings, Synchronization & Data Export
- `GET /api/settings`: Retrieve institutional settings (school name, academic year, campuses).
- `PUT /api/settings`: Update institutional profile.
- `POST /api/settings/reset`: Restore pristine client demonstration records.
- `GET /api/sync`: Export complete relational database dump in JSON.
- `POST /api/sync`: Import and synchronize state.
- `GET /api/export/:entity`: Download RFC-4180 compliant CSV export for any primary table (`students`, `leads`, `fees`, `staff`, `transport`, `library`, `assets`, `compliance`, `exams`, `tickets`).

---

### 5. Database Schema & Relational Integrity

The SQLite database (`data/campusos.db`) consists of 18 tables:
- `users`: Administrative user credentials and RBAC roles.
- `leads`: Prospective student pipeline.
- `students`: Enrolled students information.
- `fees`: Accounts receivable and fee demand invoices.
- `payments`: Transaction ledger and official receipt generation.
- `attendance`: Day-by-day student roll call marks.
- `staff`: Faculty and administrative personnel.
- `tickets`: Service requests and maintenance logs.
- `messages`: Official school circulars and announcements.
- `transport`: Bus routes, vehicle fleet, and capacity tracking.
- `library`: Book circulation and lending registry.
- `assets`: Campus facilities and equipment inventory.
- `compliance`: Statutory licenses, NOCs, and renewal schedules.
- `exams`: Curricular evaluations and examination timetables.
- `timetable`: Weekly instructional schedule grid.
- `tasks`: Administrative priority tasks.
- `settings`: Global institutional configuration key-value store.
- `audit_logs`: Timestamped system operational log.

---

### 6. Production Deployment Recommendations

For production high-availability deployment:
1. **Process Management:** Use **PM2** (`pm2 start server.js --name campusos-backend -i max`).
2. **Reverse Proxy:** Configure **Nginx** as reverse proxy terminating SSL/TLS certificates and forwarding port `8765`.
3. **Database Backups:** Set up daily cron backup copying `data/campusos.db` to an off-site S3 bucket or cold storage.
