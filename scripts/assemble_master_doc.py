"""
CampusOS Master Document Assembler
Generates the complete, publication-grade Microsoft Word (.docx) document
incorporating all 71 screenshots, functional specifications, data dictionaries,
and architectural guides.
"""

import os
import sys
import time
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
from PIL import Image

sys.path.append(os.path.dirname(__file__))
from doc_data_part1 import PART_1_FEATURES
from doc_data_part2 import PART_2_FEATURES
from doc_data_part3 import PART_3_FEATURES

SCREENSHOTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'screenshots'))
OUTPUT_DOCX = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'CampusOS_School_CRM_Platform_Documentation.docx'))

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_heading_1(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(22)
    h.paragraph_format.space_after = Pt(8)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(17)
    run.bold = True
    run.font.color.rgb = RGBColor(15, 23, 42) # 0F172A
    return h

def add_heading_2(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(15)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(13)
    run.bold = True
    run.font.color.rgb = RGBColor(37, 99, 235) # 2563EB
    return h

def add_heading_3(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(10)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(11)
    run.bold = True
    run.font.color.rgb = RGBColor(51, 65, 85) # 334155
    return h

def add_paragraph(doc, text, bold_prefix=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix + " ")
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(10)
        r_pre.bold = True
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(10)
    r.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_callout(doc, text, title="OPERATIONAL BEST PRACTICE"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(7.0)
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F8FAFC")
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="2563EB"/>'
        f'<w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    set_cell_margins(cell, top=100, bottom=100, left=180, right=140)
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    r1 = p.add_run(f"■ {title}: ")
    r1.bold = True
    r1.font.color.rgb = RGBColor(37, 99, 235)
    r1.font.size = Pt(9.5)
    r1.font.name = "Calibri"
    r2 = p.add_run(text)
    r2.font.size = Pt(9.5)
    r2.font.color.rgb = RGBColor(51, 65, 85)
    r2.font.name = "Calibri"
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_key_value_table(doc, kv_pairs):
    tbl = doc.add_table(rows=len(kv_pairs), cols=2)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(2.2)
    tbl.columns[1].width = Inches(4.8)
    set_table_borders(tbl, color="CBD5E1")
    for idx, (k, v) in enumerate(kv_pairs):
        c0 = tbl.cell(idx, 0)
        c1 = tbl.cell(idx, 1)
        bg = "F1F5F9" if idx % 2 == 0 else "FFFFFF"
        set_cell_background(c0, bg)
        set_cell_background(c1, bg)
        set_cell_margins(c0, top=70, bottom=70, left=100, right=100)
        set_cell_margins(c1, top=70, bottom=70, left=100, right=100)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(k)
        r0.bold = True
        r0.font.size = Pt(9.0)
        r0.font.name = "Calibri"
        r0.font.color.rgb = RGBColor(15, 23, 42)
        
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        p1.paragraph_format.line_spacing = 1.15
        r1 = p1.add_run(v)
        r1.font.size = Pt(9.0)
        r1.font.name = "Calibri"
        r1.font.color.rgb = RGBColor(51, 65, 85)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_screenshot_image(doc, filename, caption):
    filepath = os.path.join(SCREENSHOTS_DIR, filename)
    if not os.path.exists(filepath):
        p = doc.add_paragraph(f"[Image Missing: {filename}]")
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        return

    with Image.open(filepath) as img:
        w, h = img.size
        is_mobile = h > w

    img_p = doc.add_paragraph()
    img_p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    img_p.paragraph_format.space_before = Pt(6)
    img_p.paragraph_format.space_after = Pt(3)
    img_p.paragraph_format.keep_with_next = True

    target_width = Inches(2.9) if is_mobile else Inches(5.8)
    run = img_p.add_run()
    run.add_picture(filepath, width=target_width)

    cap_p = doc.add_paragraph()
    cap_p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap_p.paragraph_format.space_before = Pt(1)
    cap_p.paragraph_format.space_after = Pt(8)
    c_run = cap_p.add_run(f"Figure: {caption}")
    c_run.font.name = "Calibri"
    c_run.font.size = Pt(8.5)
    c_run.font.italic = True
    c_run.font.color.rgb = RGBColor(100, 116, 139)

def render_feature(doc, item):
    add_heading_2(doc, f"{item['ref']}: {item['title']}")
    add_paragraph(doc, item['purpose'], bold_prefix="Operational Purpose:")
    add_screenshot_image(doc, item['img'], f"{item['ref']} — {item['title']}")
    add_heading_3(doc, "Key User Interface Components & Fields")
    add_key_value_table(doc, item['kv'])
    add_paragraph(doc, item['interaction'], bold_prefix="User Interaction & Workflows:")
    add_paragraph(doc, item['logic'], bold_prefix="Data Logic & Validation Rules:")
    if item.get('callout'):
        add_callout(doc, item['callout'], title=f"BEST PRACTICE · {item['ref']}")

def build_cover_page(doc):
    for _ in range(3):
        doc.add_paragraph()
    
    p_tag = doc.add_paragraph()
    p_tag.paragraph_format.space_after = Pt(6)
    r_tag = p_tag.add_run("ENTERPRISE PLATFORM SPECIFICATION & OPERATIONAL MANUAL")
    r_tag.font.name = "Calibri"
    r_tag.font.size = Pt(11)
    r_tag.bold = True
    r_tag.font.color.rgb = RGBColor(37, 99, 235)
    
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_after = Pt(8)
    r_title = p_title.add_run("CampusOS School CRM & Operations Platform")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(28)
    r_title.bold = True
    r_title.font.color.rgb = RGBColor(15, 23, 42)
    
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(24)
    r_sub = p_sub.add_run("Comprehensive End-to-End System Documentation Across All 71 Functional Capabilities")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(14)
    r_sub.font.color.rgb = RGBColor(71, 85, 105)
    
    # Metadata Block Table
    tbl = doc.add_table(rows=6, cols=2)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(2.2)
    tbl.columns[1].width = Inches(4.8)
    set_table_borders(tbl, color="CBD5E1")
    
    meta = [
        ("Deploying Institution", "Northstar International School (Multi-Campus Infrastructure)"),
        ("System Release", "CampusOS Version 4.2 (Production Build with Cache Busting)"),
        ("Documentation Scope", "71 Complete Functional Features, Drawers, Modals, Filters, & Views"),
        ("Author / Engineering", "Enterprise Systems Architecture & Client Engineering Directorate"),
        ("Date of Publication", "Academic Session 2026–2027 · Official Production Reference"),
        ("Security Classification", "Confidential / Authorized Institutional Operational Reference")
    ]
    for idx, (k, v) in enumerate(meta):
        c0 = tbl.cell(idx, 0)
        c1 = tbl.cell(idx, 1)
        set_cell_background(c0, "F1F5F9")
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c0, top=80, bottom=80, left=120, right=120)
        set_cell_margins(c1, top=80, bottom=80, left=120, right=120)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.bold = True
        r0.font.size = Pt(9.5)
        r0.font.name = "Calibri"
        r0.font.color.rgb = RGBColor(15, 23, 42)
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.size = Pt(9.5)
        r1.font.name = "Calibri"
        r1.font.color.rgb = RGBColor(51, 65, 85)
        
    doc.add_page_break()

def main():
    print("Building Document Structure...")
    doc = Document()
    
    # 0.75 in margins
    for sec in doc.sections:
        sec.top_margin = Inches(0.75)
        sec.bottom_margin = Inches(0.75)
        sec.left_margin = Inches(0.75)
        sec.right_margin = Inches(0.75)
        
        # Header
        hp = sec.header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("CampusOS · Comprehensive School Operations & CRM Documentation")
        hrun.font.name = "Calibri"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(148, 163, 184)
        
        # Footer
        fp = sec.footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Northstar International School · Production System Reference · Confidential")
        frun.font.name = "Calibri"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(148, 163, 184)

    # 1. Cover Page
    build_cover_page(doc)
    
    # 2. Executive Summary
    add_heading_1(doc, "Chapter 1: Executive Summary & Enterprise Architecture")
    add_paragraph(doc, "CampusOS is an enterprise-grade School Operations and Customer Relationship Management (CRM) platform engineered specifically for modern, multi-campus K-12 academic institutions. Built as a high-performance Single Page Application (SPA), CampusOS consolidates administrative, academic, financial, parental, and logistical operations into a single reactive interface. The platform eliminates data silos, minimizes paper-based records, ensures statutory compliance, and accelerates student enrollment velocity.")
    
    add_heading_2(doc, "1.1 Core Value Propositions")
    add_paragraph(doc, "1. Multi-Perspective Role-Based Delivery: Dynamic operational views tailored specifically for Executive Administrators, Principals, Admissions Counselors, Homeroom Teachers, and Bursars/Finance Officers.")
    add_paragraph(doc, "2. High-Velocity Admissions Funnel: Full prospective student journey tracking from initial digital inquiry to campus tour, diagnostic testing, admission offer, and one-click student ID enrollment.")
    add_paragraph(doc, "3. Real-Time Accounts Receivable & Quick-Pay: Instant fee collection with 1-click Pay Full / Pay Half settlements, dynamic balance deduction, and instant printable official receipts.")
    add_paragraph(doc, "4. Multi-Tenant Branch Partitioning: Complete data scoping for multi-campus networks (e.g., Main Campus vs West Campus) with global consolidated leadership analytics.")
    add_paragraph(doc, "5. Responsive Multi-Device Parity: Seamless transition from desktop dual-monitor workstations to 390px mobile smartphone screens with touch-optimized attendance roll calls and kanban pipelines.")

    add_heading_2(doc, "1.2 Platform Technology Architecture")
    add_paragraph(doc, "CampusOS employs a zero-dependency, ultra-lightweight client-side reactive rendering architecture. The complete application runs as a modular single-page engine utilizing semantic HTML5, modern CSS3 flexbox/grid layout systems, and an asynchronous JavaScript state engine with reactive event delegation. State changes immediately update local browser persistence storage, guaranteeing zero data loss across page reloads and providing offline resilience.")

    add_heading_1(doc, "Chapter 2: Global Navigation, Unified Search & UX Framework")
    add_paragraph(doc, "CampusOS incorporates a unified, ergonomic user experience framework designed for minimal friction, rapid keyboard navigation, and immediate situational awareness across all operational modules.")
    
    add_heading_2(doc, "2.1 Topbar Navigation Anatomy")
    add_paragraph(doc, "The top navigation bar is permanently docked at the top of the viewport across all views. It features:")
    add_paragraph(doc, "• Universal Global Search Box: A 260px wide search field with constrained icons and live type-ahead across all 5 primary entity databases.")
    add_paragraph(doc, "• Multi-Campus Switcher: A dropdown selector allowing instant filtering between 'All campuses', 'Main Campus', and 'West Campus'.")
    add_paragraph(doc, "• Live Notifications Center: A bell trigger displaying active unread alerts for overdue invoices, admissions follow-ups, and service tickets.")
    add_paragraph(doc, "• Role-Based Perspective Switcher: Allows authorized administrators to toggle between Admin, Principal, Admissions, Teacher, and Finance views on the fly.")

    add_heading_2(doc, "2.2 Sidebar Navigation & Interactive Drawer Architecture")
    add_paragraph(doc, "The left-hand sidebar organizes the platform into logical operational clusters: Management (Overview, Admissions, Students, Attendance), Academics (Exams, Timetable, Parent Portal), and Operations (Communication, Staff, Transport, Library, Assets, Compliance, Helpdesk, Reports, Settings). Entity creation and detailed inspections take place in sliding off-canvas drawers that preserve context without navigating away from active working lists.")

    # Loop over all 71 features
    all_features = PART_1_FEATURES + PART_2_FEATURES + PART_3_FEATURES
    print(f"Total features to assemble: {len(all_features)}")

    # Groupings:
    # 01-08: Chapter 3: Executive Overview & Multi-Role Perspectives
    add_heading_1(doc, "Chapter 3: Executive Overview & Multi-Role Perspectives (Screenshots 01–08)")
    for f in all_features[0:8]:
        render_feature(doc, f)

    # 09-18: Chapter 4: Admissions CRM & Student Enrollment Lifecycle
    add_heading_1(doc, "Chapter 4: Admissions CRM & Enrollment Lifecycle (Screenshots 09–18)")
    for f in all_features[8:18]:
        render_feature(doc, f)

    # 19-23: Chapter 5: Student Information System & 360° Profiles
    add_heading_1(doc, "Chapter 5: Student Information System & 360° Profiles (Screenshots 19–23)")
    for f in all_features[18:23]:
        render_feature(doc, f)

    # 24-26: Chapter 6: Daily Attendance & Roll Call Registers
    add_heading_1(doc, "Chapter 6: Daily Attendance & Roll Call Registers (Screenshots 24–26)")
    for f in all_features[23:26]:
        render_feature(doc, f)

    # 27-31: Chapter 7: Academic Curriculum, Assessments & Grading
    add_heading_1(doc, "Chapter 7: Academic Curriculum, Assessments & Grading (Screenshots 27–31)")
    for f in all_features[26:31]:
        render_feature(doc, f)

    # 32-37: Chapter 8: Financial Management, Invoicing & Fee Collection
    add_heading_1(doc, "Chapter 8: Financial Management, Invoicing & Fee Collection (Screenshots 32–37)")
    for f in all_features[31:37]:
        render_feature(doc, f)

    # 38-40: Chapter 9: Timetable & Academic Scheduling
    add_heading_1(doc, "Chapter 9: Timetable & Academic Scheduling (Screenshots 38–40)")
    for f in all_features[37:40]:
        render_feature(doc, f)

    # 41: Chapter 10: Parent Portal & Family Engagement
    add_heading_1(doc, "Chapter 10: Parent Portal & Family Engagement (Screenshot 41)")
    render_feature(doc, all_features[40])

    # 42-44: Chapter 11: Institutional Communication & Circulars
    add_heading_1(doc, "Chapter 11: Institutional Communication & Circulars (Screenshots 42–44)")
    for f in all_features[41:44]:
        render_feature(doc, f)

    # 45-47: Chapter 12: Human Resources & Faculty Directory
    add_heading_1(doc, "Chapter 12: Human Resources & Faculty Directory (Screenshots 45–47)")
    for f in all_features[44:47]:
        render_feature(doc, f)

    # 48-50: Chapter 13: Fleet & Transportation Logistics
    add_heading_1(doc, "Chapter 13: Fleet & Transportation Logistics (Screenshots 48–50)")
    for f in all_features[47:50]:
        render_feature(doc, f)

    # 51-53: Chapter 14: Library & Knowledge Resources
    add_heading_1(doc, "Chapter 14: Library & Knowledge Resources (Screenshots 51–53)")
    for f in all_features[50:53]:
        render_feature(doc, f)

    # 54-56: Chapter 15: Campus Assets & Facilities Inventory
    add_heading_1(doc, "Chapter 15: Campus Assets & Facilities Inventory (Screenshots 54–56)")
    for f in all_features[53:56]:
        render_feature(doc, f)

    # 57-59: Chapter 16: Governance & Statutory Compliance
    add_heading_1(doc, "Chapter 16: Governance & Statutory Compliance (Screenshots 57–59)")
    for f in all_features[56:59]:
        render_feature(doc, f)

    # 60-62: Chapter 17: Service Helpdesk & Ticketing
    add_heading_1(doc, "Chapter 17: Service Helpdesk & Ticketing (Screenshots 60–62)")
    for f in all_features[59:62]:
        render_feature(doc, f)

    # 63-67: Chapter 18: Institutional Reporting & System Configuration
    add_heading_1(doc, "Chapter 18: Institutional Reporting & System Configuration (Screenshots 63–67)")
    for f in all_features[62:67]:
        render_feature(doc, f)

    # 68-71: Chapter 19: Mobile Responsive Experience & Touch UI
    add_heading_1(doc, "Chapter 19: Mobile Responsive Experience & Touch UI (Screenshots 68–71)")
    for f in all_features[67:71]:
        render_feature(doc, f)

    # Chapter 20: Unified Data Dictionary
    add_heading_1(doc, "Chapter 20: Unified Data Dictionary & Entity Specifications")
    add_paragraph(doc, "The CampusOS relational schema comprises 14 primary operational entities managed in a client-side reactive store with persistent JSON caching. All identifiers follow standardized institutional sequence naming conventions.")

    schema_table = [
        ("Entity: db.students", "Fields: id (ST-XXXX), name, grade, parent, phone, att (attendance %), balance (₹), status (Active/On leave), campus"),
        ("Entity: db.leads", "Fields: id (AD-XXXX), name, grade, parent, phone, source, stage, owner, next (followup), campus"),
        ("Entity: db.attendance", "Fields: classKey (e.g., 'Grade 8 A'), marks (map of studentId_dayIdx -> 'P'|'A'|'L'|'E')"),
        ("Entity: db.exams", "Fields: id (EX-XXX), title, subject, grade, date, duration, maxMarks, status, evaluator"),
        ("Entity: db.fees", "Fields: id (INV-YYYY-XXX), student, grade, type, amount, paid, due, status (Paid/Partial/Overdue)"),
        ("Entity: db.timetable", "Fields: id (TT-XXX), day, time, subject, class, room, teacher"),
        ("Entity: db.messages", "Fields: id (MSG-XXX), title, audience, channel, date, status"),
        ("Entity: db.staff", "Fields: id (EMP-XXX), name, role, department, phone, email, status, campus"),
        ("Entity: db.transport", "Fields: id (RT-XX), route, busNo, driver, phone, capacity, students, status, campus"),
        ("Entity: db.library", "Fields: id (LIB-XXX), book, student, issueDate, dueDate, status, fine"),
        ("Entity: db.assets", "Fields: id (AST-XXX), name, category, room, condition, lastService"),
        ("Entity: db.compliance", "Fields: id (GOV-XXX), title, authority, cycle, expires, status, owner"),
        ("Entity: db.tickets", "Fields: id (SUP-XXX), subject, requester, category, priority, status, date"),
        ("Entity: db.settings", "Fields: school, year, email, phone, campuses (array of branch strings)")
    ]
    add_key_value_table(doc, schema_table)

    # Chapter 21: Role-Based Access Control
    add_heading_1(doc, "Chapter 21: Role-Based Access Control (RBAC) & Permission Matrix")
    add_paragraph(doc, "CampusOS enforces fine-grained role-based security to ensure staff members access only data relevant to their operational authority.")

    rbac_table = [
        ("Executive Administrator", "Full read, write, update, delete, and configuration authority across all modules and campuses."),
        ("School Principal", "Full access to Academics, Attendance, Faculty, and Reports. Read-only access to commercial fees."),
        ("Admissions Counselor", "Full read/write access to Admissions pipeline, lead dossiers, and student onboarding. Restricted from HR and Finance."),
        ("Class & Subject Teacher", "Read/write access to daily attendance registers, gradebook entry, assignments, and class timetable."),
        ("Bursar & Finance Office", "Full read/write authority over Invoices, Fee ledger, Quick Pay counter processing, and receipt generation.")
    ]
    add_key_value_table(doc, rbac_table)

    # Chapter 22: Quality Assurance & Production Maintenance
    add_heading_1(doc, "Chapter 22: Quality Assurance, Security & Operational Maintenance")
    add_paragraph(doc, "1. Client Cache Management: The application persists data in browser `localStorage` under the key `campusos_demo_db_v4`. Versioned query strings (`styles.css?v=5` and `app.js?v=5`) guarantee immediate asset cache invalidation.")
    add_paragraph(doc, "2. Data Portability: Every primary table includes a client-side CSV export trigger, generating RFC-4180 compliant CSV files with ISO timestamps for external backup and business intelligence ingestion.")
    add_paragraph(doc, "3. Responsive Browser Compatibility: Validated across Google Chrome, Mozilla Firefox, Microsoft Edge, and Apple Safari across Windows, macOS, iOS, and Android platforms.")

    print(f"Saving compiled document to: {OUTPUT_DOCX}")
    doc.save(OUTPUT_DOCX)
    print("Document successfully created and saved!")

if __name__ == '__main__':
    main()
