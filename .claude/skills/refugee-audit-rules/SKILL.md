---
name: refugee-audit-rules
description: Hard eligibility rules, risk patterns, and fraud risk badges for refugee protection claims
category: audit
app_type: refugee
version: 1.0.0
---

# Refugee Protection Audit Rules

Core eligibility rules and risk indicators for Canadian refugee protection claims under IRPA sections A95-A98.

## Hard Eligibility Criteria (Must-Have)

### Step 1: Eligibility to Make a Claim (IRCC Determination)

**Ineligible Conditions (A101)**:
- Already recognized as Convention refugee by another country you can return to
- Already have protected person status in Canada
- Subject to a removal order
- Already made a refugee claim in another country
- Inadmissible on security grounds (A34), criminality (A36), or human rights violations (A35)
- Made a previous refugee claim in Canada that was ineligible
- Made a previous refugee claim in Canada that was rejected, abandoned, or withdrawn
- Entered Canada from the U.S. along the land border (Safe Third Country Agreement)

### Step 2: Definition of Refugee (IRB Determination)

**Convention Refugee (A96)**:
Must have well-founded fear of persecution based on:
- Race
- Religion
- Political opinion
- Nationality
- Membership in a particular social group (e.g., women, LGBTQ+)

**Person in Need of Protection (A97)**:
Must face one of:
- Danger of torture (A97(1)(a))
- Risk to life (A97(1)(b))
- Risk of cruel and unusual treatment or punishment (A97(1)(b))

### Exclusion Grounds (Article 1F)

Person excluded from protection if serious reasons for considering:
- **(a)** Crime against peace, war crime, or crime against humanity
- **(b)** Serious non-political crime outside Canada prior to admission
- **(c)** Acts contrary to purposes and principles of United Nations

## Refusal Risk Patterns

### Pattern: CREDIBILITY_CONCERN
- **Severity**: HIGH
- **Indicators**:
  - Inconsistent testimony vs. BOC narrative
  - Timeline discrepancies
  - Implausible explanations
  - Documentary evidence contradicts oral testimony
  - Failure to mention significant events in BOC
- **Legal Basis**: See Magonza v. Canada, 2019 FC 14

### Pattern: INSUFFICIENT_PERSECUTION
- **Severity**: HIGH
- **Indicators**:
  - Claimed harm does not rise to persecution level
  - Discriminatory treatment vs. persecution confusion
  - General country conditions without personal nexus
  - Harm not linked to Convention ground
- **Recovery**: Detailed evidence of personal persecution

### Pattern: IFA_AVAILABLE
- **Severity**: HIGH
- **Indicators**:
  - Viable Internal Flight Alternative exists
  - Agent of persecution is non-state actor with limited reach
  - Claimant previously lived safely in other region
  - No evidence state cannot protect in IFA region
- **Legal Basis**: R212 standard - IFA must be reasonable

### Pattern: STATE_PROTECTION_AVAILABLE
- **Severity**: MEDIUM-HIGH
- **Indicators**:
  - Claimant did not seek police protection
  - Adequate state protection mechanisms exist
  - Previous protection obtained was effective
  - No evidence of systemic state failure
- **Legal Basis**: Presumption of state protection rebuttable

### Pattern: STCA_BAR
- **Severity**: CRITICAL
- **Indicators**:
  - Entry from U.S. at official land border
  - Entry along border within 14 days of claim
  - No applicable STCA exception
- **Recovery**: Document exception (family in Canada, unaccompanied minor, etc.)

### Pattern: EXCLUSION_GROUND
- **Severity**: CRITICAL
- **Indicators**:
  - Military or paramilitary involvement in conflict zone
  - Prior convictions for serious crimes
  - Government official in persecuting regime
  - Membership in designated terrorist organization
- **Legal Basis**: Article 1F - no balancing once applies

### Pattern: IDENTITY_UNESTABLISHED
- **Severity**: CRITICAL
- **Indicators**:
  - No passport or identification documents
  - Documents appear fraudulent or altered
  - Inconsistent identity information
  - Country of origin cannot be confirmed
- **Recovery**: Alternative identity evidence (witnesses, birth certificates, etc.)

### Pattern: CESSATION_RISK
- **Severity**: HIGH
- **Indicators**:
  - Traveled back to country of persecution
  - Voluntarily re-acquired nationality
  - Country conditions fundamentally changed
  - Re-established in country of origin
- **Legal Basis**: A108(1) cessation grounds

## Risk Badge System

| Badge | Meaning | Impact | Remediation |
|-------|---------|--------|-------------|
| CREDIBILITY_CONCERN | Testimony inconsistencies | Detailed questioning at hearing | Consistent narrative, corroborating evidence |
| INSUFFICIENT_PERSECUTION | Harm below threshold | Claim likely dismissed | Document severity of persecution |
| IFA_AVAILABLE | Internal Flight Alternative | Must rebut reasonableness | Evidence IFA not reasonable |
| STATE_PROTECTION_AVAILABLE | Failed to seek protection | Must explain failure | Evidence of ineffective protection |
| STCA_BAR | Safe Third Country bar | Ineligible unless exception | Document applicable exception |
| EXCLUSION_GROUND | Article 1F applies | Excluded from protection | Complex legal arguments |
| IDENTITY_UNESTABLISHED | Cannot verify identity | Claim may be dismissed | Alternative identity evidence |
| CESSATION_RISK | Grounds for cessation exist | Status may be revoked | Explain circumstances |

## Court Jurisprudence Themes

Common Federal Court reasoning in refugee claim refusals:

1. **Credibility Assessment**: Central to RPD decisions; must explain findings
2. **Persecution vs. Discrimination**: Must rise to level of persecution
3. **State Protection Analysis**: Presumption unless rebutted
4. **IFA Reasonableness**: Two-prong test - safety AND reasonableness
5. **Nexus Requirement**: Harm must connect to Convention ground
6. **Exclusion Analysis**: No balancing once Article 1F applies

## See Also

- [eligibility_rules.md](references/eligibility_rules.md) - Detailed eligibility analysis
- [risk_patterns.json](references/risk_patterns.json) - Risk pattern definitions
- [fraud_risk_flags.md](references/fraud_risk_flags.md) - Fraud indicators
- [refusal_patterns.md](references/refusal_patterns.md) - Historical refusal reasons
- [risk_badges.json](references/risk_badges.json) - Risk classification system
