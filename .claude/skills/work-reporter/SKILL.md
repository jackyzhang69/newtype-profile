---
name: work-reporter
description: Work permit audit reporter skill for executive summary, document generation, and compliance rules
category: audit
app_type: work
version: 1.0.0
---

# Work Permit Reporter Skill

Reporter agent guidance for work permit audits - final synthesis and report generation.

## Reporter Role

The Reporter agent synthesizes findings from all prior audit phases into:
1. Executive summary
2. Defensibility score justification
3. Compliance assessment
4. Strategic recommendations
5. Professional audit report

## Report Components

> **Note**: Disclaimer, prohibited language checks, and output length limits are handled by `core-reporter`. This skill only provides work permit-specific content templates.

### 1. Executive Summary
- Application overview (applicant, position, employer)
- Defensibility score (0-100) with one-sentence justification
- Overall risk assessment (Excellent/Good/Adequate/Weak/Poor)
- Key findings (3-5 bullets)
- Recommended next steps

### 3. Defensibility Assessment
- Detailed score breakdown by category:
  - LMIA compliance (0-20)
  - Employer legitimacy (0-20)
  - Applicant credentials (0-20)
  - Intent/ties assessment (0-20)
  - Documentation quality (0-20)
- Confidence level and rationale
- Comparison to typical cases

### 4. Risk Analysis (5 Sections)
- **Section 1: LMIA Compliance**
  - Status assessment
  - Court principles applied
  - Risk level

- **Section 2: Employer Legitimacy**
  - Verification findings
  - Fraud risk indicators
  - Risk level

- **Section 3: Applicant Credentials**
  - Education and experience assessment
  - Capability determination
  - Risk level

- **Section 4: Intent & Ties**
  - Ties documentation
  - Settlement indicators
  - Risk level

- **Section 5: Admissibility**
  - Medical, police, criminal status
  - Risk level

### 5. Risk Badge Summary
Table showing each applicable risk badge:
- Badge name
- Severity (Low/Medium/High/Critical)
- Present in case (Yes/No)
- Mitigation if applicable

### 6. Evidence Checklist
- Baseline documents (required)
- Supporting documents (conditional)
- Strategic documents (recommended)
- Gaps identified

### 7. Strengths & Weaknesses
- Key strengths (2-4 major factors)
- Weaknesses (2-4 concern areas)
- Critical issues if any

### 8. Strategic Recommendations
- Priority 1: Immediate actions
- Priority 2: Evidence gathering
- Priority 3: Defense strategy

### 9. Conclusion & Next Steps
- Overall assessment and likelihood
- Judicial defensibility if needed
- Timeline for submission

## Reporting Standards

### Tone & Style
- Professional and objective
- Evidence-based (cite case law, policy)
- Balanced (note strengths AND weaknesses)
- Accessible (explain legal concepts)

### Citation Requirements
- All case law cited as: "Name v Canada, YYYY FC XXXX"
- Court decisions only (FC, FCA, SCC - no IAD/IRB)
- Verified as good law (via Verifier in Pro/Ultra tiers)
- Include key holding or principle

## Score Justification Framework

**90-100: Excellent**
- All R200 requirements clearly met
- No significant risk badges present
- Strong documentation and evidence
- Court would likely defend
- Minimal concerns identified

**75-89: Good**
- R200 requirements met
- Few minor risk badges
- Good documentation
- Court would likely defend most aspects
- Some concerns but addressable

**60-74: Adequate**
- R200 requirements met
- Several medium-risk badges present
- Some documentation gaps
- Court could defend application
- Notable concerns requiring mitigation

**40-59: Weak**
- R200 requirements barely met or concerns
- Multiple high-risk badges
- Significant documentation gaps
- Court might defend but with difficulty
- Major concerns requiring substantial evidence

**Below 40: Poor**
- R200 requirements questionable
- Critical risk badges present
- Critical documentation missing
- Court unlikely to defend
- Serious issues unlikely to be resolved

## Report Organization

**Recommended Section Order**:
1. Cover page (applicant name, date, tier)
2. Disclaimer (see core-reporter/references/disclaimer.md)
3. Executive Summary (1 page)
4. Case Profile (1 page)
5. Defensibility Assessment (2-3 pages)
6. Detailed Risk Analysis (5-8 pages)
7. Evidence Checklist (1 page)
8. Strengths & Weaknesses (1 page)
9. Strategic Recommendations (1-2 pages)
10. Conclusion & Next Steps (1 page)

**Total**: 12-20 pages typical

## Quality Checklist Before Submission

- [ ] Disclaimer appears first after cover page (see core-reporter)
- [ ] Defensibility score is clear and justified
- [ ] All risk badges explained
- [ ] All court cases properly cited
- [ ] No promised outcomes
- [ ] Balanced presentation (strengths AND weaknesses)
- [ ] Recommendations are actionable
- [ ] Report is professionally formatted
- [ ] All facts supported by evidence
- [ ] Tone is objective and professional

---

## Initial Assessment Product Output

For Initial Assessment workflow, the report MUST include additional deliverables beyond the standard audit report.

### Additional Deliverables for Initial Assessment

#### 1. Complete Document Checklist

**Format**: Table with status and acquisition guidance

| Category | Document | Status | Acquisition Guidance |
|----------|----------|--------|---------------------|
| **Identity** | Valid Passport | ✅ Provided | - |
| **Identity** | Birth Certificate | ❌ Missing | Obtain from local civil registry office |
| **Religious Credentials** | Ordination Certificate | ❌ Missing | Request from ordaining religious authority (bishop, denomination headquarters) |
| **Religious Credentials** | Theological Degree | ❌ Missing | Request official transcripts from seminary/theological school |
| **Employment** | Job Offer Letter | ✅ Provided | - |
| **Employment** | Employment Contract | ⚠️ Incomplete | Add specific religious duties, compensation details |
| **Employer** | CRA Charity Registration | ✅ Provided | - |
| **Employer** | Organization Bylaws | ❌ Missing | Request from church board/administration |
| **References** | Religious Authority Letter | ❌ Missing | Request from previous religious supervisor (Beijing church) |
| **References** | Character References (2+) | ❌ Missing | Request from colleagues, congregation members |
| **Police** | Police Certificate | ✅ Provided | - |

**Status Legend**:
- ✅ Provided - Document received and acceptable
- ⚠️ Incomplete - Document received but needs enhancement
- ❌ Missing - Document not provided, required for submission

**Priority Levels**:
- 🔴 CRITICAL - Must have before submission
- 🟠 HIGH - Strongly recommended
- 🟡 MEDIUM - Recommended for stronger application
- 🟢 LOW - Optional enhancement

#### 2. Submission Letter Template

Generate a customized submission letter template based on case facts:

```markdown
# Submission Letter Template

[Date]

Immigration, Refugees and Citizenship Canada
[Processing Centre Address]

**Re: Work Permit Application - Religious Worker (C50)**
**Applicant**: [Full Name] (DOB: [Date])
**Passport**: [Number]
**Employer**: [Organization Name]
**Position**: [Job Title]

Dear Immigration Officer,

## Introduction
I am writing to submit this work permit application under the International Mobility Program, specifically the Religious Worker exemption category (R205(d), Code C50). [Applicant Name] has been offered a position as [Position] at [Organization Name], a registered charitable organization in [City, Province].

## Applicant Qualifications
[Customize based on case facts]
- Religious education: [Details]
- Ordination/consecration: [Details]
- Years of religious service: [Details]
- Previous positions: [Details]

## Employer Information
[Organization Name] is a registered charity with the Canada Revenue Agency (Registration #[Number]). The organization:
- Has been operating since [Year]
- Serves a congregation of approximately [Number] members
- Maintains a physical place of worship at [Address]
- Conducts regular religious services and community programs

## Position Details
The position of [Title] involves the following religious duties:
- [Duty 1]
- [Duty 2]
- [Duty 3]

This is a genuine ministerial position requiring religious credentials and training.

## LMIA Exemption Justification
This application qualifies for LMIA exemption under R205(d) because:
1. The position is genuinely ministerial/pastoral in nature
2. The employer is a recognized religious organization
3. The applicant possesses the required religious credentials
4. The position serves the religious needs of the community

## Enclosed Documents
[List all documents being submitted]

## Conclusion
We respectfully request favorable consideration of this application. Should you require any additional information or documentation, please do not hesitate to contact us.

Respectfully submitted,

[Signature]
[Name]
[Title/RCIC#]
[Contact Information]
```

#### 3. Explanation Letter Writing Guide

When case has identified risks or gaps, provide guidance for explanation letters:

**When Explanation Letters Are Needed**:
- Timeline gaps in religious service
- Short courtship/relationship period (if applicable)
- Missing credentials with valid reason
- Previous visa refusals
- Employment gaps
- Any red flags identified in audit

**Explanation Letter Template Structure**:

```markdown
# Explanation Letter Guide

## Purpose
Address: [Specific concern identified in audit]

## Recommended Structure

### Opening (1 paragraph)
- State the purpose clearly
- Acknowledge the concern directly
- Preview the explanation

### Context (1-2 paragraphs)
- Provide relevant background
- Explain circumstances leading to the situation
- Include specific dates and details

### Explanation (2-3 paragraphs)
- Address the concern directly
- Provide logical, verifiable explanation
- Reference supporting documents

### Supporting Evidence (1 paragraph)
- List documents that corroborate explanation
- Reference specific exhibits

### Conclusion (1 paragraph)
- Summarize key points
- Reaffirm genuine intent
- Express willingness to provide additional information

## Writing Tips
- Be honest and direct
- Provide specific details (dates, names, places)
- Keep it concise (1-2 pages maximum)
- Use professional tone
- Avoid emotional appeals
- Reference supporting documents
- Have it reviewed before submission

## Common Explanation Scenarios

### Missing Ordination Certificate
"The ordination ceremony was conducted by [Authority] on [Date] at [Location]. 
Due to [Reason], the formal certificate was not issued at that time. 
We have requested the certificate from [Authority] and expect to receive it by [Date].
In the meantime, we have enclosed [Alternative Evidence] to verify the ordination."

### Gap in Religious Service
"From [Date] to [Date], I was not actively serving in a religious capacity because [Reason].
During this period, I [What you were doing].
I maintained my religious commitment by [Activities].
I resumed active ministry on [Date] at [Organization]."

### Previous Visa Refusal
"My previous application for [Visa Type] was refused on [Date] for [Reason].
Since that time, I have [Changes/Improvements].
The current application differs because [Key Differences].
I have addressed the previous concerns by [Specific Actions]."
```

#### 4. Interview Preparation Guide (If Applicable)

For cases where interview is likely:

**Common Interview Questions for Religious Workers**:

1. **Religious Background**
   - Describe your religious calling
   - When and how were you ordained?
   - What theological training have you completed?

2. **Position Details**
   - What will your daily duties be?
   - How many services will you lead per week?
   - What is your congregation size?

3. **Employer Knowledge**
   - How did you learn about this position?
   - Have you visited the church/organization?
   - Who interviewed you for this position?

4. **Intent Questions**
   - Why do you want to work in Canada?
   - What are your plans after the work permit expires?
   - Do you have family in Canada?

**Preparation Tips**:
- Review all submitted documents
- Be consistent with written statements
- Prepare specific examples
- Know employer details thoroughly
- Practice explaining religious duties clearly

---

## See Also

- [report_structure.md](references/report_structure.md) - Detailed template
- [compliance_rules.md](references/compliance_rules.md) - Output requirements
- [disclaimer.md](references/disclaimer.md) - Standard disclaimers
- [religious-worker-r205d.md](../work-audit-rules/references/religious-worker-r205d.md) - Complete R205(d) knowledge base
