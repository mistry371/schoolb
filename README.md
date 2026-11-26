# 🏫 Northstar CampusOS — School Operations & CRM Backend Engine

The robust Node.js and Express REST API backend engine powering the Northstar CampusOS School Management Platform. Features an embedded SQLite database engine, JWT authentication, role-based access control, comprehensive school operations controllers, and a full automated integration test suite (27 passing tests).

---

## 🛠️ Architecture & Tech Stack

* **Runtime**: Node.js (v18+)
* **Framework**: Express.js
* **Database**: SQLite3 (`better-sqlite3` / embedded SQLite driver)
* **Security & Auth**: JSON Web Tokens (`jsonwebtoken`), password hashing (`bcryptjs`)
* **Logging & Middleware**: Morgan HTTP logger, CORS, Error Handler, Request Validators
* **Testing**: Comprehensive custom integration test suite (`test/api.test.js`)

---

## 🔌 Complete REST API Endpoints (27 Passing Tests)

### Authentication & Roles
* `POST /api/auth/login` — Administrator authentication & JWT token issuance
* `GET /api/auth/me` — Verify authenticated session and user permissions
* `POST /api/auth/switch-role` — Instant role perspective switching (Admin, Teacher, Accountant, Parent)

### Executive Dashboard & Core
* `GET /health` — Service healthcheck, uptime, and system metadata
* `GET /api/overview` — Executive KPIs, admissions funnel, and pending priorities
* `GET /api/search?q=:query` — Universal type-ahead search across 5 relational tables
* `GET /api/reports` — Advanced analytics, enrollment projections, and fee collections
* `GET /api/sync` — Client hydration state dump
* `POST /api/sync` — Client state synchronization

### Admissions & CRM
* `POST /api/leads` — Create new prospective student enquiry
* `PATCH /api/leads/:id/stage` — Advance lead through pipeline stages
* `POST /api/leads/:id/enrol` — 1-Click lead conversion to active student

### Students & Academics
* `GET /api/students` — Retrieve student directory with live balance calculations
* `GET /api/students/:id` — 360° Comprehensive Student Dossier
* `GET /api/export/students` — Streamed CSV export of student directory
* `GET /api/attendance` — Class attendance matrix by wing and date
* `POST /api/attendance/mark` — Single-click attendance status cycling
* `GET /api/timetable` — Master schedule grid by class and wing
* `GET /api/events` — Custom timetable events and activity periods
* `POST /api/events` — Create timetable event
* `POST /api/exams/marks` — Record student exam scores and grading

### Fees & Accounting
* `POST /api/fees` — Generate new fee invoice with sequential collision-free ID
* `POST /api/fees/:id/quick-pay` — 1-Click invoice full payment & receipt generation

### Operations & Facilities
* `GET /api/staff` — Faculty directory, qualifications, and workload
* `GET /api/transport` — Fleet telematics, routes, and passenger rosters
* `GET /api/library` — Book catalog, active loans, and overdue fines
* `GET /api/assets` — Capital assets, venue reservations, and work orders
* `GET /api/compliance` — Statutory school board obligations
* `GET /api/tickets` — Helpdesk and service tickets

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Default configuration:
```env
PORT=8765
NODE_ENV=development
JWT_SECRET=northstar-campusos-secure-token-secret-2026
```

### 3. Start the Server
```bash
# Production / Standard start
npm start

# Development with reload
npm run dev
```
The server will boot at `http://localhost:8765` and automatically serve the embedded client demo from the `dist/` directory!

### 4. Run Integration Test Suite
```bash
npm test
```
Runs all 27 backend integration tests verifying every API endpoint and controller.
