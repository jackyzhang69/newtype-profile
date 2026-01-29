# Study Permit Defensibility Scoring Algorithm

## Scoring Dimensions (5 Total)

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Study Plan (学习计划) | 30% | Genuine intent, academic progression, career path |
| Financial Capacity (财务能力) | 25% | Funds adequacy, source legitimacy |
| Ties to Home (归国纽带) | 25% | Family, property, employment, social connections |
| Background (背景资历) | 10% | Academic history, English proficiency, prior immigration |
| Immigration History (移民历史) | 10% | Previous applications, refusals, compliance |

## Dimension Scoring (0-100 each)

### Study Plan (30%)

| Score | Criteria |
|-------|----------|
| 90-100 | Clear career advancement, logical progression, specific job prospects |
| 70-89 | Reasonable study plan, good fit with background |
| 50-69 | Generic study plan, some gaps in logic |
| 30-49 | Weak rationale, questionable program choice |
| 0-29 | No genuine intent evident, immigration motive clear |

### Financial Capacity (25%)

| Score | Criteria |
|-------|----------|
| 90-100 | Funds ≥ 150%, clear legitimate source, strong sponsor |
| 70-89 | Funds 100-149%, documented source |
| 50-69 | Funds adequate but source needs clarification |
| 30-49 | Funds borderline, source questionable |
| 0-29 | Insufficient funds or fraudulent indicators |

### Ties to Home (25%)

| Score | Criteria |
|-------|----------|
| 90-100 | Strong family ties + property + confirmed return employment |
| 70-89 | Good family ties + some property/employment |
| 50-69 | Family ties only, limited other connections |
| 30-49 | Weak ties, most family abroad |
| 0-29 | No meaningful ties, clear immigration intent |

### Background (10%)

| Score | Criteria |
|-------|----------|
| 90-100 | Strong academic record, high English (IELTS 7+), relevant experience |
| 70-89 | Good academics, adequate English (IELTS 6-6.5) |
| 50-69 | Average academics, minimum English requirements |
| 30-49 | Academic gaps, English concerns |
| 0-29 | Poor academic history, insufficient English |

### Immigration History (10%)

| Score | Criteria |
|-------|----------|
| 90-100 | No prior issues, successful visa history |
| 70-89 | Clean history, first application |
| 50-69 | Minor issues (overstay < 30 days, explained) |
| 30-49 | Previous refusal, addressed concerns |
| 0-29 | Multiple refusals, compliance issues |

## Aggregation Formula

```
Final Score = (StudyPlan × 0.30) + (Financial × 0.25) + (Ties × 0.25) + (Background × 0.10) + (History × 0.10)
```

## Example Calculation

| Dimension | Raw Score | Weight | Weighted |
|-----------|-----------|--------|----------|
| Study Plan | 75 | 0.30 | 22.5 |
| Financial | 85 | 0.25 | 21.25 |
| Ties | 60 | 0.25 | 15.0 |
| Background | 70 | 0.10 | 7.0 |
| History | 90 | 0.10 | 9.0 |
| **Total** | - | - | **74.75** |

**Result**: Score 75 → CAUTION verdict

## R215 Classification Impact

| Classification | Score Modifier |
|----------------|----------------|
| Standard (non-SDS) | 0 |
| High-risk country | -10 to Ties dimension |
| Previous Canadian study | +10 to Background |
| Post-graduate work permit eligible | +5 to Study Plan |

## Confidence Bounds

For borderline scores (within 5 points of threshold):
- Report as range: "Score: 62 ± 5"
- Recommend additional evidence to clear threshold
- Note specific dimension(s) causing uncertainty
