---
name: spousal-reporter
description: Spousal sponsorship-specific Reporter skill providing executive summary templates, document list generation, and submission letter formatting for spousal audits.
version: 1.0.0
tags:
  - audit
  - reporter
  - spousal
---

# Spousal Reporter Skill

Application-specific content and templates for spousal sponsorship audit reports.

## Inheritance

This skill extends `core-reporter` with spousal-specific:
- Executive summary template
- Document list generation rules
- Submission letter formatting

**Note**: Disclaimer, prohibited language checks, and output length limits are handled by `core-reporter`. This skill only provides **spousal-specific content templates**.

## Output Types

The Reporter generates four types of documents for spousal cases:

| Output | Format | Template |
|--------|--------|----------|
| Audit Report | PDF + MD | `references/executive_summary.md` |
| Document List | JSON + MD | `references/document_list.md` |
| Submission Letter | PDF + DOCX | `references/submission_letter.md` |
| Client Guidance | MD | Via `spousal-client-guidance` skill |

## Skill Dependencies

```yaml
depends_on:
  - core-reporter           # Base synthesis rules
  - audit-report-output     # Theme and structure
  - spousal-client-guidance # For client-facing templates (reference only)
```

## Files

| File | Purpose |
|------|---------|
| `references/executive_summary.md` | Spousal-specific executive summary template |
| `references/document_list.md` | IMM 5533-based document checklist generation |
| `references/submission_letter.md` | RCIC submission letter template |
| `references/manifest.json` | Skill manifest |
