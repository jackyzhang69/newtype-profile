# Output Constraints

Tier-based length limits, file structure, and content priority rules for report generation.

## File Output Structure by Tier

| Tier | Files Generated | Purpose |
|------|-----------------|---------|
| **Guest** | `report.pdf` | Single comprehensive report (max 400 lines) |
| **Pro** | `report.pdf` | Main report with executive summary integrated (max 500 lines) |
| **Ultra** | `report.pdf` + `technical_appendix.pdf` | Main report (max 600 lines) + detailed technical appendix |

### File Naming Rules

- ✅ **All lowercase** - `report.pdf`, `technical_appendix.pdf`
- ✅ **Anonymized version** - `report_demo.pdf` (only when `--anonymize` flag specified)
- ❌ **No Markdown files for users** - Internal only
- ❌ **No JSON files for users** - Internal only

### Directory Structure

```
cases/20260127-zhang-lei/
├── documents/                      # Original application materials
│   ├── 01-representative-letter.pdf
│   └── ...
└── audit_reports/                  # Audit reports
    ├── report.pdf                  # Main report (all tiers)
    ├── technical_appendix.pdf      # Ultra only
    └── report_demo.pdf             # Only with --anonymize flag
```

## Length Limits by Tier

| Tier | Max Lines | Target Audience | Depth |
|------|-----------|-----------------|-------|
| **Guest** | 400 | DIY applicants | Actionable guidance |
| **Pro** | 500 | RCICs | Technical details |
| **Ultra** | 600 | Lawyers | Full legal analysis |

## Executive Summary Integration

**All Tiers:**
- Executive summary is **integrated into main report** (max 1/3 page)
- **NOT a separate file**
- Appears at the beginning of `report.pdf`
- Format: Score, verdict, top 3 risks, top 3 strengths

## Technical Appendix Content (Ultra Tier Only)

**File:** `technical_appendix.pdf`

**Sections:**
1. **Legal Framework**
   - Case law precedents table (full citations)
   - Legislation sections referenced
   - Policy manual references
   - Judicial principles applied

2. **Verification & QA**
   - Citation validation results (from Verifier)
   - Source confidence levels
   - Authority scores
   - Validity status

3. **Evidence Analysis**
   - Document inventory with quality matrix
   - Evidence gaps identified
   - Document authenticity assessment
   - Cross-document consistency check

4. **Methodology**
   - Audit process flowchart
   - Risk scoring methodology
   - Tier capabilities comparison
   - Agent workflow diagram

## Length Enforcement Process

**BEFORE outputting final report:**

1. Count total lines
2. Compare against tier budget
3. If over budget: Compress by removing redundancy
4. If still over: Move details to "Full analysis available on request" (or technical appendix for Ultra)

## Section Priority (What to Cut First)

When over budget, cut in this order:

1. Legal Framework details (keep summary only, move to appendix for Ultra)
2. Detailed evidence lists (keep summary only, move to appendix for Ultra)
3. Risk matrix prose (keep table only)
4. Verification details (keep status only, move to appendix for Ultra)
5. Extended recommendations (keep top 3)

## NEVER CUT

These sections must always be included regardless of length:

- Verdict + Score
- Poison Pills (the core value proposition)
- Top 3 Action Items
- Disclaimer

## Tier-Specific Templates

### GUEST TIER (Max 400 lines)

**File:** `report.pdf`

```
1. EXECUTIVE SUMMARY (integrated, max 1/3 page)
   - Score + verdict
   - Top 3 risks
   - Top 3 strengths
2. TOP RISKS (max 3, with Poison Pills for CRITICAL only)
3. ACTION ITEMS (Urgent + Before Decision)
4. DISCLAIMER
```

### PRO TIER (Max 500 lines)

**File:** `report.pdf`

```
1. EXECUTIVE SUMMARY (integrated, max 1/3 page)
   - Score + risk level
   - Top 3 risks
   - Top 3 strengths
2. CASE SNAPSHOT (key facts table, max 8 rows)
3. VULNERABILITIES (with Poison Pills for CRITICAL + HIGH)
4. STRENGTHS (max 6 bullets)
5. COMPLIANCE STATUS (from Gatekeeper)
6. ACTION ITEMS BY PRIORITY
7. DISCLAIMER
```

### ULTRA TIER (Max 600 lines)

**Main File:** `report.pdf`

```
1. EXECUTIVE SUMMARY (integrated, max 1/3 page)
   - Score current -> with mitigation
   - Top 3 risks
   - Top 3 strengths
2. CASE PROFILE (detailed facts)
3. VULNERABILITIES WITH DEFENSE STRATEGY (all Poison Pills)
4. STRENGTHS
5. LEGAL FRAMEWORK (summary only, full details in appendix)
6. VERIFICATION STATUS (summary only, full details in appendix)
7. COMPLIANCE REVIEW (from Gatekeeper)
8. RECOMMENDATIONS
9. DISCLAIMER
```

**Technical Appendix:** `technical_appendix.pdf`

```
1. LEGAL FRAMEWORK (full details)
   - Case law precedents table
   - Legislation sections
   - Policy references
   - Judicial principles
2. VERIFICATION & QA (full details)
   - Citation validation results
   - Source confidence levels
   - Authority scores
3. EVIDENCE ANALYSIS (full details)
   - Document inventory
   - Quality matrix
   - Authenticity assessment
4. METHODOLOGY
   - Audit process
   - Risk scoring
   - Tier capabilities
```

## Line Counting Rules

- Headings count as 2 lines (including spacing)
- Tables: header + rows + 2 (spacing)
- Bullet lists: 1 line per item
- Paragraphs: actual line count when wrapped at 80 chars
- Code blocks: actual lines + 2 (delimiters)

## Anonymization Rules

When `--anonymize` flag is specified:

1. Generate `report_demo.pdf` alongside `report.pdf`
2. Apply anonymization level (minimal/conservative/aggressive)
3. Replace PII with placeholders:
   - Names → [Sponsor], [Applicant]
   - Dates → [YYYY-MM-DD]
   - Locations → [City, Country]
   - Document numbers → [XXX-XXXX-XXXX]
4. Preserve structure and analysis
5. Store in same directory as main report
