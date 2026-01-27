---
name: work-workflow
description: Output templates and report formats for work permit audit workflow stages
category: audit
app_type: work
version: 1.0.0
---

# Work Permit Audit Workflow

Templates and report formats for work permit application audits.

## Workflow Stages

### Stage 1: Intake Assessment
**Output**: Case profile summary with document inventory
**Template**: primary_assessment.md

### Stage 2: Detective Research
**Output**: Case law findings and policy baseline
**Template**: deep_analysis.md

### Stage 3: Strategist Analysis
**Output**: Risk assessment and defense strategy
**Template**: deep_analysis.md

### Stage 4: Gatekeeper Review
**Output**: Compliance validation and issue flagging
**Template**: deep_analysis.md

### Stage 5: Verifier Validation
**Output**: Citation verification report (if pro/ultra tier)
**Template**: deep_analysis.md

### Stage 6: Final Report
**Output**: Complete audit report with recommendations
**Template**: final_review.md

## Report Structure

### Primary Assessment Format
Used in intake phase:
- Case identification
- Document inventory
- Initial risk profile
- Next steps

### Deep Analysis Format
Used in detective, strategist, gatekeeper phases:
- Findings summary
- Risk factors identified
- Evidence strengths/weaknesses
- Court precedents
- Policy baseline

### Final Review Format
Used in reporter phase:
- Executive summary
- Defensibility assessment
- Risk analysis
- Strategic recommendations
- Evidence checklist
- Submission letter template

## Output Requirements

All reports must include:
1. **Disclaimer**: Riskassessment based on case law, not guaranteed outcome
2. **Case Summary**: Applicant type, key facts, primary concerns
3. **Defensibility Score**: 0-100 with rationale
4. **Strategic Analysis**: Strengths, weaknesses, evidence gaps
5. **Compliance Assessment**: R200 requirements met/not met
6. **Risk Badges**: Applicable risk categories identified
7. **Evidence Plan**: Baseline, live, and strategic documents
8. **Recommendations**: Next steps for applicant

## See Also

- [primary_assessment.md](references/primary_assessment.md) - Intake template
- [deep_analysis.md](references/deep_analysis.md) - Analysis template
- [final_review.md](references/final_review.md) - Report template
- [submission_letter.md](references/submission_letter.md) - Client letter format
