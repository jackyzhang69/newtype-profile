# Refugee Protection Defensibility Scoring Algorithm

## Scoring Dimensions (5 Total)

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Identity (身份认定) | 15% | Identity documentation, credibility of identity |
| Eligibility (资格审查) | 15% | A101 ineligibility, A1F exclusion cleared |
| Credibility (可信度) | 25% | Testimony consistency, corroboration |
| Protection Grounds (保护理由) | 25% | Nexus to Convention ground, persecution severity |
| Evidence Strength (证据强度) | 20% | Documentary evidence, country conditions |

## Dimension Scoring (0-100 each)

### Identity (15%)

| Score | Criteria |
|-------|----------|
| 90-100 | Valid passport + secondary ID + birth certificate |
| 70-89 | Valid passport or 2+ secondary IDs |
| 50-69 | Single secondary ID with explanation for missing passport |
| 30-49 | Affidavit only, credible explanation |
| 0-29 | No identity documents, weak explanation |

### Eligibility (15%)

| Score | Criteria |
|-------|----------|
| 90-100 | All A101 grounds cleared, no 1F concerns |
| 70-89 | Clear eligibility, minor clarifications needed |
| 50-69 | Potential A101 issue but exception applies |
| 30-49 | A101 issue requires strong argument |
| 0-29 | A101 bar likely, 1F exclusion possible |

### Credibility (25%)

| Score | Criteria |
|-------|----------|
| 90-100 | Consistent testimony, strong corroboration, no contradictions |
| 70-89 | Mostly consistent, minor gaps explained |
| 50-69 | Some inconsistencies, reasonable explanations available |
| 30-49 | Significant inconsistencies, credibility concerns |
| 0-29 | Major contradictions, fabrication indicators |

### Protection Grounds (25%)

| Score | Criteria |
|-------|----------|
| 90-100 | Clear nexus to Convention ground, well-documented persecution |
| 70-89 | Strong nexus, adequate persecution evidence |
| 50-69 | Nexus established, persecution evidence needs strengthening |
| 30-49 | Weak nexus, general discrimination vs persecution |
| 0-29 | No nexus to Convention ground, no persecution evidence |

### Evidence Strength (20%)

| Score | Criteria |
|-------|----------|
| 90-100 | Strong documentary evidence + current country conditions + expert reports |
| 70-89 | Good documentary evidence, adequate country conditions |
| 50-69 | Limited documents, country conditions support claim |
| 30-49 | Minimal documents, generic country conditions |
| 0-29 | No supporting documents, country conditions don't support |

## Aggregation Formula

```
Final Score = (Identity × 0.15) + (Eligibility × 0.15) + (Credibility × 0.25) + (Protection × 0.25) + (Evidence × 0.20)
```

## Example Calculation

| Dimension | Raw Score | Weight | Weighted |
|-----------|-----------|--------|----------|
| Identity | 70 | 0.15 | 10.5 |
| Eligibility | 90 | 0.15 | 13.5 |
| Credibility | 65 | 0.25 | 16.25 |
| Protection | 75 | 0.25 | 18.75 |
| Evidence | 60 | 0.20 | 12.0 |
| **Total** | - | - | **71.0** |

**Result**: Score 71 → CAUTION verdict

## Risk Pattern Modifiers

| Risk Pattern | Weight | Score Impact |
|--------------|--------|--------------|
| CREDIBILITY_CONCERN | 0.9 | -15 to Credibility dimension |
| INSUFFICIENT_PERSECUTION | 0.85 | -15 to Protection dimension |
| IFA_AVAILABLE | 0.85 | -20 to Protection dimension |
| STATE_PROTECTION_AVAILABLE | 0.75 | -15 to Protection dimension |
| STCA_BAR | 1.0 | Poison Pill (NO-GO) |
| EXCLUSION_GROUND | 1.0 | Poison Pill (NO-GO) |
| IDENTITY_UNESTABLISHED | 1.0 | Poison Pill (NO-GO) |
| CESSATION_RISK | 0.85 | -20 overall |
| SUR_PLACE_WEAK | 0.6 | -10 to Protection dimension |
| DELAY_CONCERN | 0.5 | -5 to Credibility dimension |

## IFA (Internal Flight Alternative) Impact

If IFA identified:
1. Assess reasonableness of relocation
2. Check for personalized risk in IFA location
3. Apply Protection dimension modifier (-10 to -30 based on strength of IFA argument)

## State Protection Assessment

| Factor | Score Impact |
|--------|--------------|
| Failed state / no functioning government | +10 to Protection |
| Corruption documented | +5 to Protection |
| Previous failed state protection attempts | +10 to Protection |
| Functioning democracy with rule of law | -10 to Protection |

## Confidence Bounds

For borderline scores (within 5 points of threshold):
- Report as range: "Score: 62 ± 5"
- Recommend additional evidence to clear threshold
- Note specific dimension(s) causing uncertainty
