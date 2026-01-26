---
name: study-audit-rules
description: |
  Study permit audit rules and risk badges. Use for hard eligibility checks and fraud risk flags in study permit applications.
---

# Study Permit Audit Rules

## Scope
- Hard eligibility checks (fatal blocks) based on IRPR 216, 220
- Genuine student test assessment
- Financial capacity verification
- Ties to home country evaluation
- Risk badges with severity and mitigation strategies

## Inputs
- Applicant profile (age, education, work history)
- Study plan and program details
- Financial documentation
- Immigration history

## Outputs
- Eligibility blocks (fatal conditions)
- Risk badges with severity levels (fatal/high/medium/low)
- Mitigation recommendations

## Key Legal References

### IRPR 220 (Genuine Student Test)
> Officer shall not issue study permit unless satisfied that:
> (a) applicant will leave Canada at end of authorized stay
> (b) applicant is a genuine student who will actively pursue studies

### IRPA 22(2) (Dual Intent)
> Seeking temporary resident status does not contradict simultaneously seeking permanent residence.

## Risk Assessment Categories

| Category | Key Indicators | Severity Range |
|----------|----------------|----------------|
| Study Plan | Downgrade, mismatch, vague goals | Medium-High |
| Financial | Insufficient, short history, unclear source | Medium-High |
| Ties to Home | Weak family/property ties, transferable family | High |
| Immigration History | Refusals, overstays, misrepresentation | High-Fatal |
| Dual Intent | Explicit intent, pathway focus | Medium-High |

## Verified FC Landmark Cases

| Case | Citation | Key Principle |
|------|----------|---------------|
| Luk v Canada | 2024 FC 623 | Dual intent expression matters |
| Ji v Canada | 2022 FC 1210 | Misrepresentation consequences |
| Wang v Canada | 2020 FC 262 | Third-party misrep liability |
| Gill v Canada | 2008 FC 365 | Genuine intent standard |
| Vavilov | 2019 SCC 65 | Reasonableness standard |

## Reference Files

- `references/eligibility_rules.md` - Detailed eligibility checks
- `references/risk_patterns.json` - Risk assessment patterns
- `references/risk_framework.json` - Scoring thresholds
- `references/checklist_templates.json` - Document checklists

## Notes
- Use with `audit_app=study` to apply study-specific rules
- PAL requirements apply since January 22, 2024
- Financial threshold increased to $20,635/year in 2024
- SDS pathway available for eligible countries
