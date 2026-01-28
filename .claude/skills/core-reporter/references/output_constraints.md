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

---

## WORKFLOW-SPECIFIC TEMPLATES

Different workflows produce different outputs. Each workflow has a **mandatory JSON template file** that Reporter MUST follow exactly.

### Template Files by Workflow

| Workflow | Template File | Verdict Options |
|----------|---------------|-----------------|
| initial_assessment | `initial_assessment_pro_template.json` | GO / CAUTION / NO-GO |
| risk_audit | `initial_assessment_pro_template.json` | GO / CAUTION / NO-GO |
| final_review | `final_review_pro_template.json` | APPROVE / REVISE |
| refusal_analysis | `refusal_analysis_pro_template.json` | APPEAL / REAPPLY / ABANDON |

**CRITICAL RULES (ALL WORKFLOWS):**
- Disclaimer appears ONCE at the beginning only (NOT at the end)
- Case info appears ONCE as "CASE SNAPSHOT" (NOT as separate "Case Information")
- NO emojis - use [CRITICAL], [HIGH], [MEDIUM], [LOW]
- NO internal system info (session ID, tier name)
- Status values: MISSING, INCOMPLETE, PROVIDED

---

## Initial Assessment / Risk Audit Templates

**Purpose**: Comprehensive paid product for new client intake. Provides actionable guidance with complete material requirements.

**Key Difference from Risk Audit**: Initial Assessment focuses on **what to do next** rather than deep legal analysis. It's a practical roadmap for case preparation.

### INITIAL ASSESSMENT - GUEST TIER (Max 400 lines)

**File:** `report.pdf`

**IMPORTANT - Professional Formatting Rules:**
- NO emojis in client-facing reports (use text indicators instead)
- NO internal system info (session ID, tier name, line counts)
- Use professional status indicators: [CRITICAL], [HIGH], [MEDIUM], [LOW]
- Use professional document status: [MISSING], [INCOMPLETE], [PROVIDED]

```
┌─────────────────────────────────────────────────────────────────┐
│ INITIAL ASSESSMENT REPORT                                       │
│ [Application Type] - [Applicant Name]                           │
│ Date: [Date]                                                    │
├─────────────────────────────────────────────────────────────────┤
│ DISCLAIMER (MANDATORY - 3 lines)                                │
├─────────────────────────────────────────────────────────────────┤
│ 1. VERDICT & SCORE (max 10 lines)                               │
│    ┌─────────────────────────────────────────┐                  │
│    │ Verdict: CAUTION                        │                  │
│    │ Score: 35/100 -> 72/100 (with fixes)    │                  │
│    │ Success: 5-10% -> 70-75%                │                  │
│    └─────────────────────────────────────────┘                  │
├─────────────────────────────────────────────────────────────────┤
│ 2. BLOCKING ISSUES (max 15 lines)                               │
│    [CRITICAL] Issue 1: [Description] -> [Fix]                   │
│    [CRITICAL] Issue 2: [Description] -> [Fix]                   │
│    [CRITICAL] Issue 3: [Description] -> [Fix]                   │
├─────────────────────────────────────────────────────────────────┤
│ 3. DOCUMENT CHECKLIST - CRITICAL ONLY (max 20 lines)            │
│    | Document | Status | How to Get |                           │
│    |----------|--------|------------|                           │
│    | Doc 1    | MISSING | [Guide]   |                           │
│    | Doc 2    | INCOMPLETE | [Guide]|                           │
├─────────────────────────────────────────────────────────────────┤
│ 4. NEXT STEPS (max 10 lines)                                    │
│    Week 1: [Actions]                                            │
│    Week 2-4: [Actions]                                          │
└─────────────────────────────────────────────────────────────────┘
```

**Total: ~60 lines core content + tables**

### INITIAL ASSESSMENT - PRO TIER (Max 500 lines)

**File:** `report.pdf`

**MANDATORY: Use JSON Template File**

For stable, consistent output, Reporter MUST:
1. Read template: `.claude/skills/core-reporter/references/initial_assessment_pro_template.json`
2. Follow the EXACT section order in the template
3. Replace placeholder values with actual case data
4. Do NOT add sections not in the template
5. Do NOT duplicate sections

**CRITICAL RULES:**
- Disclaimer appears ONCE at the beginning only (NOT at the end)
- Case info appears ONCE as "CASE SNAPSHOT" (NOT as separate "Case Information")
- NO emojis - use [CRITICAL], [HIGH], [MEDIUM], [LOW]
- NO internal system info (session ID, tier name)
- Status values: MISSING, INCOMPLETE, PROVIDED

**Section Order (from template file):**

| # | Section | Required | Max Lines |
|---|---------|----------|-----------|
| 1 | DISCLAIMER | YES | 5 |
| 2 | VERDICT & SCORE | YES | 15 |
| 3 | CASE SNAPSHOT | YES | 15 |
| 4 | BLOCKING ISSUES | YES | 30 |
| 5 | HIGH-RISK FACTORS | YES | 20 |
| 6 | STRENGTHS | YES | 10 |
| 7 | DOCUMENT CHECKLIST | YES | 60 |
| 8 | ACTION PLAN | YES | 30 |
| 9 | REPORT INFO | YES | 10 |

**Total: ~195 lines (well under 500 limit)**

### INITIAL ASSESSMENT - ULTRA TIER (Max 600 lines)

**Main File:** `report.pdf` (same as Pro, with expanded sections)

**Additional File:** `client_package.pdf`

Contains:
1. Full Submission Letter (ready to customize and send)
2. Explanation Letter Templates (for each identified risk)
3. Interview Preparation Guide (if applicable)
4. Complete Document Checklist with detailed acquisition guidance

---

## Initial Assessment vs Risk Audit Comparison

| Aspect | Initial Assessment | Risk Audit |
|--------|-------------------|------------|
| **Purpose** | New client intake, case viability | Deep legal analysis |
| **Focus** | What to do next | Legal defensibility |
| **Verdict** | GO/CAUTION/NO-GO | GO/CAUTION/NO-GO |
| **Key Output** | Document checklist + Action plan | Risk analysis + Defense strategy |
| **Submission Letter** | ✅ Included | ❌ Not included |
| **Explanation Guide** | ✅ Included | ❌ Not included |
| **Case Law Depth** | Summary only | Full analysis |
| **Target User** | RCIC preparing case | Lawyer reviewing case |

---

## Final Review Templates

**Purpose**: Pre-submission quality gate. Ensures application package is complete, consistent, and compliant before submission.

**Template File:** `final_review_pro_template.json`
**Verdict Options:** APPROVE | REVISE

### FINAL REVIEW - PRO TIER (Max 500 lines)

**MANDATORY: Use JSON Template File**

Reporter MUST:
1. Read template: `.claude/skills/core-reporter/references/final_review_pro_template.json`
2. Follow the EXACT section order in the template
3. Replace placeholder values with actual case data

**Section Order (from template file):**

| # | Section | Required | Max Lines |
|---|---------|----------|-----------|
| 1 | DISCLAIMER | YES | 5 |
| 2 | VERDICT & SCORE | YES | 15 |
| 3 | CASE SNAPSHOT | YES | 15 |
| 4 | QUALITY CHECK RESULTS | YES | 40 |
| 5 | REMAINING ISSUES | YES | 25 |
| 6 | STRENGTHS CONFIRMED | YES | 15 |
| 7 | SUBMISSION CHECKLIST | YES | 30 |
| 8 | IMPROVEMENT RECOMMENDATIONS | YES | 25 |
| 9 | REPORT INFO | YES | 10 |

**Verdict Criteria:**
- **APPROVE**: Application ready for submission (may have minor optional improvements)
- **REVISE**: Issues must be addressed before submission

---

## Refusal Analysis Templates

**Purpose**: Post-refusal strategy analysis. Analyzes refusal reasons and recommends appeal, reapplication, or abandonment.

**Template File:** `refusal_analysis_pro_template.json`
**Verdict Options:** APPEAL | REAPPLY | ABANDON

### REFUSAL ANALYSIS - PRO TIER (Max 500 lines)

**MANDATORY: Use JSON Template File**

Reporter MUST:
1. Read template: `.claude/skills/core-reporter/references/refusal_analysis_pro_template.json`
2. Follow the EXACT section order in the template
3. Replace placeholder values with actual case data

**Section Order (from template file):**

| # | Section | Required | Max Lines |
|---|---------|----------|-----------|
| 1 | DISCLAIMER | YES | 5 |
| 2 | VERDICT & RECOMMENDATION | YES | 20 |
| 3 | CASE SNAPSHOT | YES | 15 |
| 4 | REFUSAL REASONS ANALYSIS | YES | 50 |
| 5 | GAP ANALYSIS | YES | 40 |
| 6 | OVERTURN PRECEDENTS | YES | 35 |
| 7 | REVISED STRATEGY | YES | 45 |
| 8 | ACTION PLAN | YES | 40 |
| 9 | REPORT INFO | YES | 10 |

**Verdict Criteria:**
- **APPEAL**: Strong procedural/legal grounds for judicial review (>60% success probability)
- **REAPPLY**: Addressable deficiencies, new application recommended (>50% improvement possible)
- **ABANDON**: Fundamental eligibility issues, neither path viable

---

## Workflow Comparison

| Aspect | Initial Assessment | Final Review | Refusal Analysis |
|--------|-------------------|--------------|------------------|
| **Purpose** | New client intake | Pre-submission QA | Post-refusal strategy |
| **Verdict** | GO/CAUTION/NO-GO | APPROVE/REVISE | APPEAL/REAPPLY/ABANDON |
| **Key Output** | Document checklist + Action plan | Quality check + Submission checklist | Gap analysis + Revised strategy |
| **Case Law** | Summary only | Minimal | Overturn precedents |
| **Target User** | RCIC preparing case | RCIC finalizing case | RCIC/Lawyer post-refusal |

---

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
