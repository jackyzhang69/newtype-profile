---
name: study-reporter
description: |
  Study permit-specific Reporter skill providing executive summary templates, document list generation, and report formatting for study permit audits.
---

# Study Permit Reporter

> **Note**: Disclaimer, prohibited language checks, and output length limits are handled by `core-reporter`. This skill only provides study permit-specific content templates.

## Scope
- Executive summary templates
- Document list generation
- Risk summary formatting
- Recommendation templates

## Outputs
- Client-facing audit reports
- Document preparation guides
- Risk assessment summaries

## Report Sections

### 1. Executive Summary
- Applicant overview
- Program and institution
- Overall risk assessment
- Key recommendations

### 2. Eligibility Assessment
- R216 requirements check
- R220 genuine student evaluation
- PAL status
- Financial capacity

### 3. Risk Analysis
- Study plan risks
- Financial risks
- Ties to home risks
- Immigration history risks

### 4. Document Review
- Completeness assessment
- Gap identification
- Quality evaluation

### 5. Recommendations
- Mitigation strategies
- Document improvements
- Submission timing advice

## Integration

### With Core Reporter
Inherits from `core-reporter`:
- Synthesis rules
- Output constraints
- Document generation

### With Audit Report Output
Uses templates from `audit-report-output`:
- Judicial Authority theme
- Report format
- Tier-based constraints

## Reference Files
- `references/executive_summary.md` - Summary template
- `references/document_list.md` - Document templates
- `references/manifest.json` - Skill metadata
