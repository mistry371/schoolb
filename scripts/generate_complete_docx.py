"""
CampusOS Enterprise Master Documentation Generator
Generates CampusOS_School_CRM_Platform_Documentation.docx
Exhaustively covering all 71 screenshots and every functionality of the CRM.
"""

import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
from PIL import Image

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
    h.paragraph_format.space_before = Pt(20)
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
    h.paragraph_format.space_before = Pt(14)
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

def render_feature_block(doc, ref_id, title, img_name, purpose, kv_data, interaction_text, business_rules, callout_text):
    add_heading_2(doc, f"{ref_id}: {title}")
    add_paragraph(doc, purpose, bold_prefix="Operational Purpose:")
    add_screenshot_image(doc, img_name, f"{ref_id} — {title}")
    add_heading_3(doc, "Key User Interface Components & Fields")
    add_key_value_table(doc, kv_data)
    add_paragraph(doc, interaction_text, bold_prefix="User Interaction & Workflows:")
    add_paragraph(doc, business_rules, bold_prefix="Data Logic & Validation Rules:")
    if callout_text:
        add_callout(doc, callout_text, title=f"BEST PRACTICE · {ref_id}")

print("Helper core compiled successfully.")
