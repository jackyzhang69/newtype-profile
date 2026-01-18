---
name: audit-report-output
description: Generate professional immigration audit reports using the Judicial Authority theme
model: claude-haiku-4-5-latest
backup_model: claude-sonnet-4
color: '#0A192F'
category: output
---

# Audit Report Output Skill

Generate professional immigration audit reports with the **Judicial Authority** theme. This skill produces publication-ready PDF documents for spousal sponsorship and study permit audits.

## Theme Overview

The **Judicial Authority** theme combines:
- **Authority**: Navy + Gold palette inspired by legal institutions
- **Clarity**: Verdict badges (Go/Caution/No-Go) for instant risk comprehension
- **Accessibility**: WCAG AA compliant typography and contrast ratios
- **Professionalism**: Serif headers + sans-serif body text for modern legal documents

**Design Philosophy**: "Inner Hawk, Outer Dove" - calm professionalism externally, rigorous analytics internally.

## Core Capabilities

### Document Types
- Spousal Sponsorship Audit Reports (5-20 pages)
- Study Permit Assessment Reports
- Risk Evaluation Presentations
- Government Recommendation Briefs
- Compliance Audit Reports

### Output Formats
- **PDF** (primary): Print-ready, full theme support
- **DOCX** (future): Editable templates with theme styles
- **PPTX** (future): Interactive verdict dashboards

## Color Palette

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| **Primary** | Navy | `#0A192F` | Headers, key elements |
| **Accent** | Gold | `#C5A059` | Emphasis, authority markers |
| **Secondary** | Slate | `#64748B` | Supporting elements |
| **Background** | Paper | `#FDFBF7` | Main background |
| **Background Alt** | Paper Dark | `#F7F5F0` | Section backgrounds |
| **Text** | Ink | `#1a1a1a` | Body text |
| **Go** | Emerald | `#047857` | Approved outcomes |
| **Caution** | Amber | `#B45309` | Items needing review |
| **No-Go** | Crimson | `#BE123C` | Critical issues |

## Typography

- **Headers**: Georgia or Merriweather Bold (serif) - conveys tradition and authority
- **Body**: Arial or Inter (sans-serif) - ensures accessibility and readability
- **Section Labels**: Arial Bold, 11px, uppercase, 0.15em letter-spacing
- **Citations**: Georgia Italic, 14px

## Document Structure

Every audit report follows this proven structure:

```
[COVER PAGE]
  - Title (centered, navy, 24pt)
  - Subtitle (10pt slate)
  - Application Type, Date, Case Reference

[EXECUTIVE SUMMARY]
  - Risk Overview (with verdict badges)
  - Key Findings (1-3 bullets)
  - Recommendation (Go/Caution/No-Go)

[DETAILED ANALYSIS]
  - Section 1: Identity & Admissibility
  - Section 2: Relationship Genuineness
  - Section 3: Financial/Support Analysis
  - [Additional sections per audit type]

[RECOMMENDATIONS]
  - Action Items (color-coded by priority)
  - Next Steps

[APPENDIX]
  - Supporting Evidence Summary
  - Source References
```

## Verdict Badge System

Instantly communicates outcome using visual + text:

- **✓ GO** (Green #047857): Requirement met, no risk
- **⚠ CAUTION** (Amber #B45309): Partially met, review needed
- **✗ NO-GO** (Red #BE123C): Not met, critical risk

## Usage Script

### Basic Report Generation

```javascript
const report = generateAuditReport({
  applicationData: applicantData,
  auditFindings: detailedAnalysis,
  theme: 'judicial-authority',
  format: 'pdf',
  verdicts: {
    identity: 'GO',
    relationship: 'CAUTION',
    financial: 'GO'
  },
  language: 'en' // or 'fr', 'zh'
});

await report.savePDF('/path/to/output/report.pdf');
```

### Custom Sections

```javascript
const section = new AuditSection({
  title: 'Spousal Relationship Assessment',
  findings: [
    { item: 'Cohabitation evidence', verdict: 'GO' },
    { item: 'Communication records', verdict: 'CAUTION' },
  ],
  theme: 'judicial-authority'
});
```

## Quality Standards

All audit reports must meet:

- **WCAG AA Accessibility**: Minimum 7:1 contrast, sans-serif body text
- **Consistency**: All verdict badges match semantic color palette
- **Branding**: Navy headers with gold accents on all pages
- **Clarity**: Key findings visible within 5-second scan
- **Compliance**: References to IRCC Policy and case law included
- **Language**: Professional legal terminology, no AI artifacts

## File References

- **Theme Spec**: `./references/theme.md`
- **Design Philosophy**: `./references/judicial-authority-philosophy.md`
- **Script Templates**: `~/.claude/skills/document-generator/scripts/`

## Agent Integration

Use the `audit-report-builder` agent to:
1. Accept raw audit findings from AuditManager
2. Transform to report structure
3. Apply Judicial Authority theme
4. Generate publication-ready PDF
5. Validate against WCAG AA standards

## Dependencies

- Document generation engine supporting PDF/DOCX/PPTX
- Font libraries: Georgia, Merriweather, Arial, Inter
- Accessibility validator (WCAG AA)
- Multi-language support (Chinese, French, English)
