---
name: refugee-reporter
description: Refugee-specific Reporter templates for executive summary, evidence list, and report formatting
category: audit
app_type: refugee
version: 1.0.0
---

# Refugee Reporter Templates

Refugee-specific templates for audit report generation.

## Executive Summary Template

```markdown
# REFUGEE PROTECTION CLAIM AUDIT REPORT

## Executive Summary

**Claimant**: [Name] (Country: [Country of Origin])
**Claim Type**: [Convention Refugee / Person in Need of Protection]
**Convention Ground**: [Race / Religion / Nationality / Political Opinion / Particular Social Group]
**Audit Date**: [Date]
**Audit Tier**: [Guest / Pro / Ultra]

### Key Findings

| Element | Assessment | Confidence |
|---------|------------|------------|
| Eligibility | [Eligible / Ineligible / Uncertain] | [High/Med/Low] |
| Identity | [Established / Concerns / Unestablished] | [High/Med/Low] |
| Credibility | [Strong / Moderate / Weak] | [High/Med/Low] |
| Nexus | [Clear / Arguable / Weak] | [High/Med/Low] |
| State Protection | [Rebutted / Not Rebutted / Arguable] | [High/Med/Low] |
| IFA | [None / Available / Arguable] | [High/Med/Low] |

### Risk Badges

[List active badges with severity]

### Defensibility Score: [XX/100]

[One sentence explanation]

### Recommendation: [PROCEED / REVISE / HIGH-RISK]

[2-3 sentence rationale]
```

## Evidence List Template

```markdown
## Evidence Assessment

### Documents Provided

| # | Document | Type | Quality | Weight | Notes |
|---|----------|------|---------|--------|-------|
| 1 | | | | | |
| 2 | | | | | |

### Evidence Gaps

| Gap | Impact | Priority | Recommendation |
|-----|--------|----------|----------------|
| | | | |

### Recommended Additional Evidence

1. **[Document]**: [Why needed, how to obtain]
2. **[Document]**: [Why needed, how to obtain]
```

## Detailed Report Sections

### 1. Applicant Profile

```markdown
## Applicant Profile

**Personal Information**
- Name: [Full name]
- Date of Birth: [DOB]
- Nationality: [Nationality]
- Country of Origin: [Country]

**Immigration History**
- Date of Entry to Canada: [Date]
- Manner of Entry: [POE / Inland / Irregular]
- Current Status: [Refugee Claimant]

**Family Composition**
- [List dependents if any]

**Claimed Protection Ground**
- Primary: [Convention ground]
- Secondary (if any): [PINOP ground]
```

### 2. Claim Summary

```markdown
## Claim Summary

### Narrative Overview

[3-5 paragraph summary of the persecution claim based on BOC]

### Key Events Timeline

| Date | Event | Evidence |
|------|-------|----------|
| | | |

### Agent of Persecution

- Who: [State / Non-state actor / Both]
- Specific: [Name/description of persecutors]
- Motivation: [Why targeting claimant]

### Current Risk

[Summary of risk if returned]
```

### 3. Eligibility Analysis

```markdown
## Eligibility Analysis

### Ineligibility Screening (A101)

| Ground | Status | Notes |
|--------|--------|-------|
| A101(1)(a) - Other country protection | ☐ Clear | |
| A101(1)(b) - Protected in Canada | ☐ Clear | |
| A101(1)(c) - Prior ineligible | ☐ Clear | |
| A101(1)(c.1) - Prior rejected | ☐ Clear | |
| A101(1)(d) - Other country claim | ☐ Clear | |
| A101(1)(e) - STCA | ☐ Clear / ☐ Concern | |
| A101(2) - Inadmissibility | ☐ Clear | |

### Exclusion Screening (Article 1F)

| Ground | Assessment |
|--------|------------|
| 1F(a) - Crimes against humanity | [No concern / Requires review] |
| 1F(b) - Serious non-political crime | [No concern / Requires review] |
| 1F(c) - Acts against UN | [No concern / Requires review] |

### Eligibility Conclusion

[Summary statement]
```

### 4. Risk Analysis

```markdown
## Risk Analysis

### Risk Badge Assessment

| Badge | Status | Severity | Rationale |
|-------|--------|----------|-----------|
| CREDIBILITY_CONCERN | [Active/Clear] | [HIGH] | |
| INSUFFICIENT_PERSECUTION | [Active/Clear] | [HIGH] | |
| IFA_AVAILABLE | [Active/Clear] | [HIGH] | |
| STATE_PROTECTION_AVAILABLE | [Active/Clear] | [MED-HIGH] | |
| EXCLUSION_GROUND | [Active/Clear] | [CRITICAL] | |
| IDENTITY_UNESTABLISHED | [Active/Clear] | [CRITICAL] | |

### Strengths

1. [Strength with supporting evidence]
2. [Strength with supporting evidence]

### Weaknesses

1. [Weakness with risk badge]
   - **Mitigation**: [Strategy]
2. [Weakness with risk badge]
   - **Mitigation**: [Strategy]

### Defensibility Score Breakdown

| Element | Score | Weight | Weighted |
|---------|-------|--------|----------|
| Identity | /100 | 15% | |
| Eligibility | /100 | 15% | |
| Credibility | /100 | 25% | |
| Protection grounds | /100 | 25% | |
| Evidence strength | /100 | 20% | |
| **TOTAL** | | 100% | **/100** |
```

### 5. Legal Research

```markdown
## Legal Research Findings

### Relevant Precedent

| Case | Citation | Holding | Relevance |
|------|----------|---------|-----------|
| | | | |

### Country-Specific Patterns

[Analysis of how similar claims from this country have been treated]

### Key Legal Principles

1. [Principle with case support]
2. [Principle with case support]
```

### 6. Recommendations

```markdown
## Recommendations

### Overall Assessment: [PROCEED / REVISE / HIGH-RISK]

### Immediate Actions

1. [Priority action]
2. [Priority action]

### Evidence to Gather

1. [Document] - [Priority] - [How to obtain]
2. [Document] - [Priority] - [How to obtain]

### Hearing Preparation Notes

- [Key point to prepare]
- [Anticipated question and approach]

### Legal Strategy

- [Strategic recommendation]
```

## Disclaimer (Required)

```markdown
---

## Disclaimer

This report provides a risk assessment based on historical Federal Court jurisprudence and IRB decision patterns. It does NOT predict outcomes or guarantee claim success. IRB members retain full discretion in their determinations. This assessment evaluates judicial defensibility only and should not replace professional legal advice. Claimants should consult with qualified immigration counsel.

---
```
