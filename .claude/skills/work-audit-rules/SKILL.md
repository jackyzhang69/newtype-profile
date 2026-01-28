---
name: work-audit-rules
description: Hard eligibility rules and fraud risk flags for work permit applications
category: audit
app_type: work
version: 1.0.0
---

# Work Permit Audit Rules

Core eligibility rules and fraud risk indicators for Canadian work permit applications (R200).

## Hard Eligibility Criteria (Must-Have)

### R200(1) Basic Requirements
- **Valid job offer**: Signed by authorized employer representative
- **LMIA or exemption**: Positive assessment (or exemption category applies)
- **Admissibility**: No grounds for inadmissibility
- **Temporary intent**: Clear evidence of will to leave at expiration

### LMIA Compliance (if applicable)
- Labour Market Opinion completed by Service Canada
- Wages meet prevailing market rates
- Job duties match LMIA application
- Recruitment efforts documented (minimum 4 weeks)
- No Canadian worker displacement

## Refusal Risk Patterns

### Pattern: LMIA_NOT_OBTAINED
- **Severity**: CRITICAL
- **Indicators**:
  - Job offer but no LMIA provided
  - LMIA shows negative assessment
  - LMIA expired before application
  - LMIA issued to different employer
- **Recovery**: Reapply with valid LMIA

### Pattern: EMPLOYER_FRAUD_RISK
- **Severity**: HIGH
- **Indicators**:
  - Employer previously implicated in fraud
  - Job offer discrepancies with LMIA
  - Employer contact unreachable
  - Inconsistent employer documentation
  - "Straw employer" patterns
- **Recovery**: Employer verification, third-party confirmation

### Pattern: CREDENTIALS_MISMATCH
- **Severity**: HIGH
- **Indicators**:
  - Qualifications below job requirements
  - No relevant work experience
  - Education credentials unverified
  - Language barriers despite language-sensitive role
  - Professional certifications missing
- **Recovery**: Credentials validation, reference letters

### Pattern: IMMIGRANT_INTENT_SIGNAL
- **Severity**: HIGH
- **Indicators**:
  - Spouse/children in Canada
  - Previous unsuccessful PR applications
  - Permanent settlement purchase history
  - No ties to home country
  - Previous work permits with continuous renewal
  - Settlement plan documentation
- **Recovery**: Return plan statement, asset ties, family abroad

### Pattern: WAGE_COMPLIANCE_ISSUE
- **Severity**: MEDIUM
- **Indicators**:
  - Offered wages below provincial minimum
  - Wages below LMIA prevailing rate
  - Wages below occupation median
  - No accommodation/benefits offset documented
- **Recovery**: Wage verification, employment contract amendment

### Pattern: ADMISSIBILITY_CONCERN
- **Severity**: CRITICAL
- **Indicators**:
  - Criminal record
  - Security concerns
  - Misrepresentation history
  - Health examination required but not completed
  - Police certificate required but not provided
- **Recovery**: Court clearance, police certificate, medical exam

### Pattern: TIES_ASSESSMENT_WEAK
- **Severity**: MEDIUM
- **Indicators**:
  - No immediate family abroad
  - Minimal property/assets at home
  - Multiple previous failed visa applications
  - No employment history at origin
  - Extreme youth without responsibilities
- **Recovery**: Family ties documentation, property proof, return plan

## Risk Badge System

| Badge | Meaning | Impact | Remediation |
|-------|---------|--------|-------------|
| LMIA_NOT_OBTAINED | No valid LMIA | Application rejection | Obtain LMIA |
| CREDENTIALS_MISMATCH | Skills insufficient | Interview required | Credential validation |
| EMPLOYER_FRAUD_RISK | Employer legitimacy concerns | Investigation triggered | Employer verification |
| IMMIGRANT_INTENT_SIGNAL | Settlement indicators | Close scrutiny | Stronger ties evidence |
| WAGE_COMPLIANCE_ISSUE | Wage concerns | Additional review | Wage documentation |
| ADMISSIBILITY_CONCERN | Inadmissibility ground | Application rejection | Legal clearance |
| TIES_ASSESSMENT_WEAK | Weak return incentives | Interview likely | Ties strengthening |

## Court Jurisprudence Themes

Common Federal Court reasoning in work permit refusals:

1. **Genuine Position Test**: Is the job offer real and substantive?
2. **Employer Legitimacy**: Is employer authorized and non-fraudulent?
3. **Credential Assessment**: Do qualifications match position requirements?
4. **Intent Determination**: Will applicant actually return home?
5. **LMIA Compliance**: Were labour market conditions properly assessed?

## See Also

- [fraud_risk_flags.md](references/fraud_risk_flags.md) - Detailed fraud indicators
- [refusal_patterns.md](references/refusal_patterns.md) - Historical refusal reasons
- [hard_eligibility.md](references/hard_eligibility.md) - Strict requirements
- [risk_badges.json](references/risk_badges.json) - Risk classification system (v3.0.0)
- [verified_risk_patterns.json](references/verified_risk_patterns.json) - MCP-verified risk patterns (v2.0.0)
- [policy_updates.md](references/policy_updates.md) - Recent policy changes tracking
- [risk_evidence_mapping.json](references/risk_evidence_mapping.json) - Risk badge to evidence mapping
- [provincial_differences.md](references/provincial_differences.md) - Provincial LMIA/PNP differences

### Category-Specific Deep Dives
- [pgwp_deep.md](references/pgwp_deep.md) - Post-Graduation Work Permit details
- [ict_deep.md](references/ict_deep.md) - Intra-Company Transfer details
- [open_spouse_deep.md](references/open_spouse_deep.md) - Spousal Open Work Permit details
- [pnp_deep.md](references/pnp_deep.md) - Provincial Nominee Program details
