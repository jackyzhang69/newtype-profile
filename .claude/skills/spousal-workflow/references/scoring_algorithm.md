# Spousal Sponsorship Defensibility Scoring Algorithm

## Scoring Dimensions (4 Total)

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Authenticity (真实性) | 30% | Relationship genuineness indicators |
| Consistency (一致性) | 25% | Timeline, statements, evidence alignment |
| Evidence Coverage (证据覆盖) | 25% | Completeness of documentation |
| Risk Mitigation (风险缓解) | 20% | Addressed concerns, explanations provided |

## Dimension Scoring (0-100 each)

### Authenticity (30%)

| Score | Criteria |
|-------|----------|
| 90-100 | Multiple A-level evidence (joint property, joint accounts, children) |
| 70-89 | Strong B-level evidence (cohabitation proof, shared expenses, family integration) |
| 50-69 | Moderate C-level evidence (communication logs, photos, friend/family letters) |
| 30-49 | Weak D-level evidence (self-made documents only) |
| 0-29 | Contradictory evidence or fraud indicators |

### Consistency (25%)

| Score | Criteria |
|-------|----------|
| 90-100 | Perfect alignment across all documents and statements |
| 70-89 | Minor inconsistencies with reasonable explanations |
| 50-69 | Some inconsistencies requiring explanation letters |
| 30-49 | Significant inconsistencies undermining credibility |
| 0-29 | Major contradictions suggesting misrepresentation |

### Evidence Coverage (25%)

| Score | Criteria |
|-------|----------|
| 90-100 | All baseline + most live + some strategic documents |
| 70-89 | All baseline + some live documents |
| 50-69 | Most baseline documents, gaps in live evidence |
| 30-49 | Significant baseline gaps |
| 0-29 | Critical documents missing |

### Risk Mitigation (20%)

| Score | Criteria |
|-------|----------|
| 90-100 | All identified risks addressed with strong evidence |
| 70-89 | Most risks addressed, minor gaps acceptable |
| 50-69 | Some risks addressed, others need attention |
| 30-49 | Few risks addressed, significant concerns remain |
| 0-29 | No mitigation efforts, risks unaddressed |

## Aggregation Formula

```
Final Score = (Authenticity × 0.30) + (Consistency × 0.25) + (Evidence × 0.25) + (Mitigation × 0.20)
```

## Example Calculation

| Dimension | Raw Score | Weight | Weighted |
|-----------|-----------|--------|----------|
| Authenticity | 75 | 0.30 | 22.5 |
| Consistency | 80 | 0.25 | 20.0 |
| Evidence | 65 | 0.25 | 16.25 |
| Mitigation | 60 | 0.20 | 12.0 |
| **Total** | - | - | **70.75** |

**Result**: Score 71 → CAUTION verdict

## Confidence Bounds

For borderline scores (within 5 points of threshold):
- Report as range: "Score: 67 ± 5"
- Recommend additional evidence to clear threshold
- Note specific dimension(s) causing uncertainty
