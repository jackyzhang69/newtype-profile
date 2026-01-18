#!/usr/bin/env python3
"""
Judicial Authority Theme - Immigration Audit Report Generator
Generates professional PDF audit reports with verdict badges and color-coded risk assessment.
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
    PageBreak,
    Image,
    KeepTogether,
    Frame,
    PageTemplate,
)
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
import json
import os

# ============================================================================
# REGISTER CHINESE FONTS (macOS)
# ============================================================================


def register_chinese_fonts():
    """Register system Chinese fonts with ReportLab"""
    font_paths = {
        "PingFang-Regular": "/System/Library/Fonts/PingFang.ttc",
        "STHeiti-Medium": "/System/Library/Fonts/STHeiti Medium.ttc",
        "Songti-Regular": "/System/Library/Fonts/Supplemental/Songti.ttc",
    }

    registered_fonts = []

    for font_name, font_path in font_paths.items():
        if os.path.exists(font_path):
            try:
                # Try to register the font
                pdfmetrics.registerFont(TTFont(font_name, font_path))
                registered_fonts.append(font_name)
                print(f"✓ Registered font: {font_name}")
            except Exception as e:
                print(f"✗ Failed to register {font_name}: {e}")

    # Fallback to Helvetica if no Chinese fonts available
    if not registered_fonts:
        print("⚠ No Chinese fonts registered, using Helvetica fallback")
        return "Helvetica"

    return registered_fonts[0] if registered_fonts else "Helvetica"


# Register fonts at module load time
CHINESE_FONT = register_chinese_fonts()

# ============================================================================
# JUDICIAL AUTHORITY THEME COLORS & TYPOGRAPHY
# ============================================================================

THEME = {
    "primary": "#0A192F",  # Navy - headers, authority
    "accent": "#C5A059",  # Gold - highlights, prestige
    "secondary": "#64748B",  # Slate - supporting elements
    "background": "#FDFBF7",  # Paper - main background
    "backgroundAlt": "#F7F5F0",  # Paper alt - section blocks
    "text": "#1a1a1a",  # Ink - main text
    "textSecondary": "#4B5563",  # Gray - secondary text
    "success": "#047857",  # Go - approval
    "warning": "#B45309",  # Caution - review needed
    "danger": "#BE123C",  # No-Go - critical
    "successLight": "#ECFDF5",  # Light green background
    "warningLight": "#FEF3C7",  # Light amber background
    "dangerLight": "#FFE4E6",  # Light red background
}


# Convert hex to RGB tuples for reportlab
def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) / 255.0 for i in (0, 2, 4))


COLORS = {
    "primary": colors.HexColor(THEME["primary"]),
    "accent": colors.HexColor(THEME["accent"]),
    "secondary": colors.HexColor(THEME["secondary"]),
    "background": colors.HexColor(THEME["background"]),
    "backgroundAlt": colors.HexColor(THEME["backgroundAlt"]),
    "text": colors.HexColor(THEME["text"]),
    "textSecondary": colors.HexColor(THEME["textSecondary"]),
    "success": colors.HexColor(THEME["success"]),
    "warning": colors.HexColor(THEME["warning"]),
    "danger": colors.HexColor(THEME["danger"]),
    "successLight": colors.HexColor(THEME["successLight"]),
    "warningLight": colors.HexColor(THEME["warningLight"]),
    "dangerLight": colors.HexColor(THEME["dangerLight"]),
}

# ============================================================================
# CUSTOM PAGE TEMPLATE WITH HEADERS & FOOTERS
# ============================================================================


class AuditPageTemplate:
    def __init__(self, story, title, case_ref):
        self.title = title
        self.case_ref = case_ref
        self.page_num = 1

    def header_footer(self, canvas, doc):
        """Draw header and footer on each page"""
        canvas.saveState()

        # Page width and height
        page_width, page_height = letter

        # Header (Navy bar with title)
        canvas.setFillColor(COLORS["primary"])
        canvas.rect(
            0, page_height - 0.5 * inch, page_width, 0.5 * inch, fill=1, stroke=0
        )

        # Header text
        canvas.setFont("Helvetica-Bold", 11)
        canvas.setFillColor(colors.white)
        canvas.drawString(0.5 * inch, page_height - 0.35 * inch, self.title)

        # Footer (Slate bar)
        canvas.setFillColor(COLORS["secondary"])
        canvas.rect(0, 0, page_width, 0.45 * inch, fill=1, stroke=0)

        # Footer text
        canvas.setFont("Helvetica", 9)
        canvas.setFillColor(colors.white)

        # Left: Case reference
        canvas.drawString(0.5 * inch, 0.25 * inch, f"Case: {self.case_ref}")

        # Center: Date
        today = datetime.now().strftime("%B %d, %Y")
        canvas.drawCentredString(page_width / 2, 0.25 * inch, today)

        # Right: Page number
        canvas.drawRightString(
            page_width - 0.5 * inch, 0.25 * inch, f"Page {self.page_num}"
        )

        canvas.restoreState()
        self.page_num += 1


# ============================================================================
# VERDICT BADGE GENERATOR
# ============================================================================


def create_verdict_badge(verdict, label, description=""):
    """
    Create a verdict badge with color, icon, and label.
    verdict: "go" | "caution" | "no-go"
    """
    verdicts = {
        "go": {
            "bg": COLORS["successLight"],
            "text": COLORS["success"],
            "icon": "✓",
            "label": "GO",
            "border": COLORS["success"],
        },
        "caution": {
            "bg": COLORS["warningLight"],
            "text": COLORS["warning"],
            "icon": "⚠",
            "label": "CAUTION",
            "border": COLORS["warning"],
        },
        "no-go": {
            "bg": COLORS["dangerLight"],
            "text": COLORS["danger"],
            "icon": "✗",
            "label": "NO-GO",
            "border": COLORS["danger"],
        },
    }

    v = verdicts.get(verdict, verdicts["caution"])

    # Create styled paragraph for badge
    badge_text = f"""
    <font name="Helvetica-Bold" size="12" color="{v["text"]}">{v["icon"]} {v["label"]}</font>
    """

    return {
        "text": badge_text,
        "bg": v["bg"],
        "border": v["border"],
        "label": label,
        "description": description,
    }


# ============================================================================
# STYLE DEFINITIONS
# ============================================================================


def create_styles():
    styles = getSampleStyleSheet()

    styles.add(
        ParagraphStyle(
            name="CustomTitle",
            parent=styles["Heading1"],
            fontName=CHINESE_FONT if CHINESE_FONT != "Helvetica" else "Helvetica-Bold",
            fontSize=36,
            textColor=COLORS["primary"],
            spaceAfter=12,
            alignment=TA_CENTER,
            leading=42,
        )
    )

    styles.add(
        ParagraphStyle(
            name="CustomSubtitle",
            parent=styles["Heading2"],
            fontName=CHINESE_FONT if CHINESE_FONT != "Helvetica" else "Helvetica",
            fontSize=18,
            textColor=COLORS["secondary"],
            spaceAfter=24,
            alignment=TA_CENTER,
            leading=24,
        )
    )

    styles.add(
        ParagraphStyle(
            name="SectionHeading",
            parent=styles["Heading2"],
            fontName=CHINESE_FONT if CHINESE_FONT != "Helvetica" else "Helvetica-Bold",
            fontSize=16,
            textColor=COLORS["primary"],
            spaceAfter=8,
            spaceBefore=12,
            borderColor=COLORS["accent"],
            borderWidth=2,
            borderPadding=8,
            leftIndent=0,
        )
    )

    styles.add(
        ParagraphStyle(
            name="SubsectionHeading",
            parent=styles["Heading3"],
            fontName=CHINESE_FONT if CHINESE_FONT != "Helvetica" else "Helvetica-Bold",
            fontSize=13,
            textColor=COLORS["primary"],
            spaceAfter=6,
            spaceBefore=8,
        )
    )

    styles.add(
        ParagraphStyle(
            name="BodyText",
            parent=styles["Normal"],
            fontName=CHINESE_FONT if CHINESE_FONT != "Helvetica" else "Helvetica",
            fontSize=11,
            textColor=COLORS["text"],
            alignment=TA_JUSTIFY,
            spaceAfter=8,
            leading=14,
        )
    )

    styles.add(
        ParagraphStyle(
            name="VerdictLabel",
            fontName=CHINESE_FONT if CHINESE_FONT != "Helvetica" else "Helvetica-Bold",
            fontSize=10,
            textColor=COLORS["text"],
            spaceAfter=4,
        )
    )

    return styles


# ============================================================================
# DOCUMENT GENERATOR
# ============================================================================


def generate_audit_report(
    output_file,
    case_name="Immigration Case Audit Report",
    case_ref="CASE-2026-001",
    subtitle="Spousal Sponsorship Application Review",
):
    """Generate a professional immigration audit report with Judicial Authority theme"""

    # Create PDF document
    doc = SimpleDocTemplate(
        output_file,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch + 0.5 * inch,  # Account for header
        bottomMargin=0.75 * inch + 0.45 * inch,  # Account for footer
    )

    styles = create_styles()
    story = []

    # ========================================================================
    # COVER PAGE
    # ========================================================================

    story.append(Spacer(1, 1.5 * inch))

    # Main title
    title = Paragraph(case_name, styles["CustomTitle"])
    story.append(title)

    # Subtitle
    subtitle_para = Paragraph(subtitle, styles["CustomSubtitle"])
    story.append(subtitle_para)

    story.append(Spacer(1, 0.5 * inch))

    # Case reference box
    case_info = [
        ["Case Reference:", case_ref],
        ["Date Prepared:", datetime.now().strftime("%B %d, %Y")],
        ["Status:", "FORMAL AUDIT REPORT"],
    ]

    case_table = Table(case_info, colWidths=[2 * inch, 3 * inch])
    case_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), COLORS["primary"]),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.white),
                ("TEXTCOLOR", (1, 0), (1, -1), COLORS["text"]),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 11),
                ("PADDING", (0, 0), (-1, -1), 10),
                ("BACKGROUND", (1, 0), (1, -1), COLORS["background"]),
                ("LINEBELOW", (0, 0), (-1, -1), 2, COLORS["accent"]),
                ("ALIGN", (0, 0), (0, -1), "RIGHT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )

    story.append(case_table)
    story.append(Spacer(1, 1 * inch))

    # Disclaimer
    disclaimer = Paragraph(
        "<font size='9' color='#4B5563'><i>This report contains confidential information and is intended "
        "for authorized personnel only. Unauthorized distribution is prohibited.</i></font>",
        styles["Normal"],
    )
    story.append(disclaimer)

    story.append(PageBreak())

    # ========================================================================
    # EXECUTIVE SUMMARY
    # ========================================================================

    story.append(Paragraph("Executive Summary", styles["SectionHeading"]))
    story.append(Spacer(1, 0.15 * inch))

    exec_summary_text = """
    This audit report provides a comprehensive assessment of the spousal sponsorship application. 
    The evaluation focuses on critical eligibility factors, document authenticity, and compliance with 
    Immigration, Refugees and Citizenship Canada (IRCC) requirements. Three primary risk areas have been 
    identified and evaluated according to the Judicial Authority assessment framework.
    """

    story.append(Paragraph(exec_summary_text, styles["BodyText"]))
    story.append(Spacer(1, 0.2 * inch))

    # Overall verdict
    story.append(Paragraph("Overall Assessment", styles["SubsectionHeading"]))

    overall_verdict = create_verdict_badge(
        "caution",
        "Proceed with Conditional Approval",
        "Application meets most requirements with minor discrepancies requiring clarification.",
    )

    verdict_table = Table(
        [
            [
                Paragraph(
                    f"<font size='14' color='#{THEME['warning'][1:]}'><b>⚠ CAUTION</b></font>",
                    styles["VerdictLabel"],
                ),
                Paragraph(
                    "<font size='11'><b>Conditional Approval Recommended</b><br/>"
                    "Application shows genuine intent with documentation concerns requiring clarification. "
                    "Recommend conditional approval pending additional evidence submission.",
                    styles["BodyText"],
                ),
            ]
        ],
        colWidths=[1.5 * inch, 4 * inch],
    )

    verdict_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), COLORS["warningLight"]),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("BORDER", (0, 0), (-1, -1), 2, COLORS["warning"]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("FONTNAME", (0, 0), (0, 0), "Helvetica-Bold"),
            ]
        )
    )

    story.append(verdict_table)
    story.append(Spacer(1, 0.3 * inch))

    # Summary statistics
    story.append(Paragraph("Assessment Summary", styles["SubsectionHeading"]))

    summary_data = [
        ["Assessment Area", "Status", "Risk Level"],
        ["Relationship Genuineness", "✓ GO", "Low"],
        ["Financial Capacity", "⚠ CAUTION", "Medium"],
        ["Documentation Completeness", "✗ NO-GO", "High"],
    ]

    summary_table = Table(summary_data, colWidths=[2.5 * inch, 1.5 * inch, 1.5 * inch])
    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), COLORS["primary"]),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 11),
                ("GRID", (0, 0), (-1, -1), 1, COLORS["secondary"]),
                ("BACKGROUND", (2, 1), (2, 1), COLORS["successLight"]),
                ("BACKGROUND", (2, 2), (2, 2), COLORS["warningLight"]),
                ("BACKGROUND", (2, 3), (2, 3), COLORS["dangerLight"]),
                ("TEXTCOLOR", (2, 1), (2, 1), COLORS["success"]),
                ("TEXTCOLOR", (2, 2), (2, 2), COLORS["warning"]),
                ("TEXTCOLOR", (2, 3), (2, 3), COLORS["danger"]),
                ("FONTNAME", (2, 1), (2, 3), "Helvetica-Bold"),
                ("PADDING", (0, 0), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ]
        )
    )

    story.append(summary_table)
    story.append(PageBreak())

    # ========================================================================
    # RISK ASSESSMENT SECTIONS
    # ========================================================================

    risk_assessments = [
        {
            "title": "Relationship Genuineness Assessment",
            "verdict": "go",
            "icon": "✓",
            "findings": [
                "Strong evidence of cohabitation (joint lease, utility bills, insurance)",
                "Consistent timeline across all submitted documents",
                "Multiple forms of communication demonstrate ongoing relationship",
                "Photos from various time periods and locations support authenticity",
            ],
            "recommendation": "Proceed - Genuine relationship established with substantial evidence.",
        },
        {
            "title": "Financial Capacity Assessment",
            "verdict": "caution",
            "icon": "⚠",
            "findings": [
                "Sponsor income verified at CAD $65,000 annually",
                "Income exceeds minimum requirement by 15%",
                "Recent job change requires 90-day documentation review",
                "Credit history shows no delinquencies; adequate savings reserves",
                "Dependent count may trigger additional requirements",
            ],
            "recommendation": "Conditional - Verify employment continuity and obtain recent pay stubs (2+ months post-hire).",
        },
        {
            "title": "Documentation Completeness Assessment",
            "verdict": "no-go",
            "icon": "✗",
            "findings": [
                "Missing: Provincial health insurance documentation",
                "Missing: Original certified copies of birth certificates (only notarized copies provided)",
                "Police certificate from one prior residence country not submitted",
                "Medical examination not yet scheduled",
                "Incomplete references from 2 of 3 required personal references",
            ],
            "recommendation": "Critical - Request all missing documents within 30 days. Application cannot proceed to final review without completion.",
        },
    ]

    for idx, assessment in enumerate(risk_assessments):
        story.append(Paragraph(assessment["title"], styles["SectionHeading"]))
        story.append(Spacer(1, 0.1 * inch))

        # Verdict badge
        verdict_color_map = {
            "go": (COLORS["successLight"], COLORS["success"]),
            "caution": (COLORS["warningLight"], COLORS["warning"]),
            "no-go": (COLORS["dangerLight"], COLORS["danger"]),
        }

        bg_color, text_color = verdict_color_map[assessment["verdict"]]

        verdict_label_text = {
            "go": "GO - Approved",
            "caution": "CAUTION - Review Required",
            "no-go": "NO-GO - Critical Issues",
        }

        badge_para = Paragraph(
            f"<font size='12' color='#{verdict_label_text[assessment['verdict']]}'><b>{assessment['icon']} {verdict_label_text[assessment['verdict']]}</b></font>",
            styles["VerdictLabel"],
        )

        story.append(badge_para)
        story.append(Spacer(1, 0.08 * inch))

        # Findings
        story.append(Paragraph("<b>Key Findings:</b>", styles["SubsectionHeading"]))

        for finding in assessment["findings"]:
            finding_para = Paragraph(f"• {finding}", styles["BodyText"])
            story.append(finding_para)

        story.append(Spacer(1, 0.1 * inch))

        # Recommendation
        story.append(Paragraph("<b>Recommendation:</b>", styles["SubsectionHeading"]))
        rec_para = Paragraph(assessment["recommendation"], styles["BodyText"])
        story.append(rec_para)

        story.append(Spacer(1, 0.25 * inch))

        if idx < len(risk_assessments) - 1:
            story.append(PageBreak())

    story.append(PageBreak())

    # ========================================================================
    # COMPLIANCE CHECKLIST
    # ========================================================================

    story.append(Paragraph("Compliance Checklist", styles["SectionHeading"]))
    story.append(Spacer(1, 0.15 * inch))

    checklist_items = [
        ("Relationship documentation", True),
        ("Financial documentation", True),
        ("Police certificates", False),
        ("Medical examination", False),
        ("Proof of identity", True),
        ("Proof of residence", True),
        ("References (3 required)", False),
        ("Statutory declaration", True),
        ("Insurance/health coverage", False),
        ("Background check authorization", True),
    ]

    checklist_data = [["Item", "Status"]]

    for item, status in checklist_items:
        status_text = "✓ Received" if status else "✗ Missing"
        checklist_data.append([item, status_text])

    checklist_table = Table(checklist_data, colWidths=[4 * inch, 1.5 * inch])

    style_list = [
        ("BACKGROUND", (0, 0), (-1, 0), COLORS["primary"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 1, COLORS["secondary"]),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]

    # Color-code status column
    for i in range(1, len(checklist_items) + 1):
        if checklist_items[i - 1][1]:  # Status is True (received)
            style_list.append(("BACKGROUND", (1, i), (1, i), COLORS["successLight"]))
            style_list.append(("TEXTCOLOR", (1, i), (1, i), COLORS["success"]))
        else:  # Status is False (missing)
            style_list.append(("BACKGROUND", (1, i), (1, i), COLORS["dangerLight"]))
            style_list.append(("TEXTCOLOR", (1, i), (1, i), COLORS["danger"]))

        style_list.append(("FONTNAME", (1, i), (1, i), "Helvetica-Bold"))

    checklist_table.setStyle(TableStyle(style_list))
    story.append(checklist_table)

    story.append(Spacer(1, 0.3 * inch))

    # Recommendation summary
    story.append(Paragraph("Final Recommendation", styles["SectionHeading"]))
    story.append(Spacer(1, 0.15 * inch))

    final_rec = Paragraph(
        """
        <b>Status:</b> Conditional Approval Pending Documentation<br/><br/>
        
        <b>Required Actions:</b><br/>
        1. Obtain and submit all missing documents within 30 days<br/>
        2. Schedule and complete medical examination at approved panel physician<br/>
        3. Obtain certified police certificates from all prior residence countries<br/>
        4. Provide employment verification for recent job change (minimum 2 months post-hire)<br/>
        5. Complete missing personal references<br/><br/>
        
        <b>Timeline:</b> Upon receipt of all required documentation and medical results, 
        final decision can typically be rendered within 10-15 business days.<br/><br/>
        
        <b>Contact:</b> Applicant should respond to this notice of deficiency within the specified timeframe. 
        Failure to provide required documentation may result in application rejection.
        """,
        styles["BodyText"],
    )

    story.append(final_rec)

    # ========================================================================
    # BUILD DOCUMENT
    # ========================================================================

    # Create the PDF
    template = AuditPageTemplate(story, "Immigration Audit Report", case_ref)
    doc.build(
        story, onFirstPage=template.header_footer, onLaterPages=template.header_footer
    )

    return output_file


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    import sys

    output_path = (
        sys.argv[1]
        if len(sys.argv) > 1
        else "/Users/jacky/immi-os/sample-audit-report.pdf"
    )

    print(f"Generating Judicial Authority Theme Audit Report...")
    print(f"Output: {output_path}")

    result = generate_audit_report(
        output_path,
        case_name="Immigration Case Audit Report",
        case_ref="CASE-2026-001",
        subtitle="Spousal Sponsorship Application Review",
    )

    print(f"✓ PDF generated successfully: {result}")
    print(f"\nTheme Applied: Judicial Authority")
    print(f"  - Primary Color: Navy (#0A192F)")
    print(f"  - Accent Color: Gold (#C5A059)")
    print(f"  - Success Color: Go (#047857)")
    print(f"  - Warning Color: Caution (#B45309)")
    print(f"  - Error Color: No-Go (#BE123C)")
    print(f"\nDocument Sections:")
    print(f"  1. Cover Page - Professional introduction")
    print(f"  2. Executive Summary - Overall assessment with verdict")
    print(f"  3. Risk Assessments - 3 detailed evaluations with color-coded verdicts")
    print(f"  4. Compliance Checklist - Document status tracking")
    print(f"  5. Final Recommendation - Action items and timeline")
