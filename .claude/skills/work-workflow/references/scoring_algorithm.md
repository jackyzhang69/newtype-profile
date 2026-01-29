# Work Permit Defensibility Scoring Algorithm

## Scoring Dimensions (5 Total)

| Dimension | Weight | Description |
|-----------|--------|-------------|
| LMIA/Exempt Status (工作许可基础) | 30% | LMIA validity, exempt category eligibility |
| Employer Legitimacy (雇主合规) | 25% | Business legitimacy, compliance history |
| Credential Match (资质匹配) | 20% | Job requirements vs applicant qualifications |
| Intent & Ties (意图与纽带) | 15% | Genuine temporary intent, home ties |
| Immigration History (移民历史) | 10% | Previous applications, compliance |

## Dimension Scoring (0-100 each)

### LMIA/Exempt Status (30%)

| Score | Criteria |
|-------|----------|
| 90-100 | Valid LMIA with 6+ months remaining OR clear exempt category |
| 70-89 | Valid LMIA with 3-6 months remaining, documentation complete |
| 50-69 | LMIA pending or exempt category needs clarification |
| 30-49 | LMIA issues (corrections needed, employer changes) |
| 0-29 | Invalid/expired LMIA, ineligible category |

### Employer Legitimacy (25%)

| Score | Criteria |
|-------|----------|
| 90-100 | Established business, clean compliance, verifiable operations |
| 70-89 | Good standing, minor documentation gaps |
| 50-69 | New business or limited verification available |
| 30-49 | Compliance concerns, requires explanation |
| 0-29 | Red flags (shell company, non-compliance list, fraud indicators) |

### Credential Match (20%)

| Score | Criteria |
|-------|----------|
| 90-100 | Exceeds job requirements, verified credentials, relevant experience |
| 70-89 | Meets job requirements, credentials verified |
| 50-69 | Meets minimum requirements, some gaps |
| 30-49 | Significant credential gaps, need bridging explanation |
| 0-29 | Does not meet job requirements |

### Intent & Ties (15%)

| Score | Criteria |
|-------|----------|
| 90-100 | Clear temporary intent, strong home ties, return plan |
| 70-89 | Reasonable temporary intent, adequate ties |
| 50-69 | Dual intent indicators, manageable concerns |
| 30-49 | Weak ties, immigration intent concerns |
| 0-29 | Clear immigration intent, no meaningful ties |

### Immigration History (10%)

| Score | Criteria |
|-------|----------|
| 90-100 | Clean history, previous successful work permits |
| 70-89 | Clean history, first work permit application |
| 50-69 | Minor issues, explained and addressed |
| 30-49 | Previous refusal, concerns addressed |
| 0-29 | Multiple refusals, compliance violations |

## Aggregation Formula

```
Final Score = (LMIA × 0.30) + (Employer × 0.25) + (Credentials × 0.20) + (Intent × 0.15) + (History × 0.10)
```

## Example Calculation

| Dimension | Raw Score | Weight | Weighted |
|-----------|-----------|--------|----------|
| LMIA Status | 90 | 0.30 | 27.0 |
| Employer | 85 | 0.25 | 21.25 |
| Credentials | 75 | 0.20 | 15.0 |
| Intent & Ties | 70 | 0.15 | 10.5 |
| History | 80 | 0.10 | 8.0 |
| **Total** | - | - | **81.75** |

**Result**: Score 82 → APPROVE verdict (Pro+ tier)

## Category-Specific Adjustments

### PGWP

Replace LMIA dimension with:
- **Program Completion (30%)**: DLI status, program length, full-time study verification

### ICT

Add weight to:
- **Specialized Knowledge**: +10% to Credentials if demonstrated
- **Corporate Relationship**: Verify parent-subsidiary relationship

### Open Work Permit (Spousal)

Inherit principal's work permit validity as base requirement, then apply spousal relationship scoring.

## Confidence Bounds

For borderline scores (within 5 points of threshold):
- Report as range: "Score: 76 ± 5"
- Recommend additional evidence to clear threshold
- Note specific dimension(s) causing uncertainty
