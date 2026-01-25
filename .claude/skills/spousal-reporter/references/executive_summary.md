# Executive Summary Template (Spousal)

Template for generating the executive summary section of spousal sponsorship audit reports.

## Structure

```markdown
# Spousal Sponsorship Audit Report

**Case Reference:** {caseSlot}
**Date:** {date}
**Tier:** {tier}

---

## Executive Summary

### Verdict

[VERDICT_BADGE] **{verdict}** | Defensibility Score: **{score}/100**

{one_line_rationale}

### Key Risk Factors

| Risk | Severity | Poison Pill |
|------|----------|-------------|
{risk_table}

### Recommendation

**{recommendation}**: {recommendation_detail}

---
```

## Field Definitions

### Verdict Badge

| Verdict | Badge | Color | Meaning |
|---------|-------|-------|---------|
| GO | [GO] | #047857 | Proceed with confidence |
| CAUTION | [CAUTION] | #B45309 | Proceed with mitigations |
| NO-GO | [NO-GO] | #BE123C | Do not proceed as-is |

### Score Interpretation

| Score Range | Risk Level | Typical Verdict |
|-------------|------------|-----------------|
| 80-100 | Low | GO |
| 60-79 | Medium | CAUTION |
| 40-59 | High | CAUTION / NO-GO |
| 0-39 | Critical | NO-GO |

### One-Line Rationale

Format: "{Primary strength/weakness} with {key consideration}."

Examples:
- "Strong cohabitation evidence with minor timeline gaps."
- "Insufficient financial integration despite lengthy relationship."
- "Genuine relationship indicators overshadowed by credibility concerns."

## Spousal-Specific Risk Categories

### Relationship Genuineness
- Cohabitation evidence quality
- Communication frequency/depth
- Family integration level
- Shared financial obligations
- Timeline consistency

### Admissibility Concerns
- Previous sponsorship history
- Immigration violations
- Criminal inadmissibility
- Misrepresentation history

### Documentation Quality
- IMM 5533 completeness
- Evidence authenticity
- Translation quality
- Notarization compliance

## Example Output

```markdown
## Executive Summary

### Verdict

[CAUTION] **CAUTION** | Defensibility Score: **67/100**

Strong communication evidence but limited cohabitation documentation due to COVID-19 travel restrictions.

### Key Risk Factors

| Risk | Severity | Poison Pill |
|------|----------|-------------|
| Limited cohabitation proof | HIGH | Officer may question: "Why no shared utility bills during 18-month period?" Prepare explanation letter citing border closures. |
| Short in-person time | MEDIUM | Total of 45 days together before marriage may trigger genuineness concerns. |
| Strong digital communication | STRENGTH | 2+ years of daily video calls demonstrates sustained emotional connection. |

### Recommendation

**PROCEED WITH MITIGATIONS**: Address cohabitation gap with detailed explanation letter and additional third-party affidavits.
```
