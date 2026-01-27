# International Mobility Program (IMP) Work Permits Audit Rules

## Definition & Eligibility

The International Mobility Program (IMP) provides a pathway for foreign workers to obtain work permits WITHOUT requiring a Labour Market Opinion (LMIA). Instead, employers must demonstrate that the employment offers "significant benefits" to Canada or satisfies specific bilateral/multilateral trade agreement criteria.

### Core Eligibility Criteria (Hard Requirements)

1. **Employer Authorization**
   - Employer must be authorized to participate in IMP
   - Employer registered with IRCC or provincial program
   - No previous IMP violations or non-compliance
   - Employer not on ineligible list

2. **Job Offer**
   - Written offer from Canadian employer
   - Specific position clearly defined
   - Job duties align with National Occupational Classification (NOC) code
   - Signed by authorized employer representative
   - Specifies position title, duties, salary, duration, location

3. **IMP Category Qualification**
   - Applicant must qualify under one of eight IMP categories:
     1. **Significant Benefits**: Mutual benefit to Canada demonstrated
     2. **Reciprocal Employment Exchange**: Exchange with bilateral partner
     3. **Intra-company Transfer**: Management/specialized knowledge within multinational
     4. **Religious Worker**: Faith organization exempt positions
     5. **International Agreement Professional**: USMCA, CPTPP, trade agreement
     6. **International Agreement - General**: FTA country nationals
     7. **Mobility Program Pilot**: Specific sector/region pilot (time-limited)
     8. **Labour Mobility Agreements**: Reciprocal provincial/federal agreements

4. **Wage and Conditions**
   - Wages competitive for position and region
   - Working conditions lawful and safe
   - Benefits and terms clearly documented
   - No evidence of labour exploitation

5. **Admissibility**
   - No grounds for inadmissibility
   - Security clearance
   - Criminality assessment
   - Medical examination if required
   - No misrepresentation

### LMIA Waived
- No Labour Market Opinion required
- No Canadian labour market assessment necessary
- Reduced documentation requirements compared to LMIA

## Risk Assessment Framework

### Category-Specific Risk Patterns

#### Pattern: IMP_CATEGORY_MISMATCH
- **Severity**: CRITICAL
- **Definition**: Applicant does not qualify for claimed IMP category
- **Indicators**:
  - Significant Benefits claim but no mutual benefit demonstrated
  - Intra-company transfer claim but not same employer group
  - Trade agreement professional but not from USMCA/CPTPP country
  - Religious worker claim but employer not faith-based
  - No documentation supporting category eligibility
  - Category requirements not objectively met
- **Assessment Method**:
  - Category requirement verification
  - Employer documentation review
  - Applicant nationality/identity verification
  - Organizational relationship verification
- **Recovery**: Application under different category if eligible, or via LMIA

#### Pattern: SIGNIFICANT_BENEFITS_NOT_ESTABLISHED
- **Severity**: HIGH
- **Definition**: Employer fails to demonstrate mutual benefit to Canada
- **Indicators**:
  - Generic job description not showing unique benefit
  - Specialized skills not documented
  - Technology/knowledge transfer not articulated
  - Investment/economic benefit not demonstrated
  - No evidence of job creation for Canadians
  - Position could easily be filled by Canadian
  - Employer provides insufficient justification
- **Assessment Method**:
  - Benefit analysis documentation
  - Employer justification review
  - Comparator analysis (Canadian workers available)
  - Economic impact assessment
- **Recovery**: Strengthen benefit documentation, reapply or switch to LMIA

#### Pattern: INTRA_COMPANY_TRANSFER_INVALID
- **Severity**: CRITICAL
- **Definition**: Transfer does not satisfy intra-company transfer requirements
- **Indicators**:
  - Not same employer (acquired company is separate entity)
  - Not continuous employment prior to transfer
  - Organizational relationship not established
  - Manager/specialized knowledge claim not substantiated
  - No evidence of international employment precondition
  - Canadian operation is new or franchised (not directly owned)
- **Assessment Method**:
  - Corporate structure documentation
  - Organizational chart and ownership
  - Employment history verification
  - Managerial/specialist qualification assessment
  - Canadian entity relationship to parent
- **Recovery**: May apply if organizational structure reformed, or via LMIA

#### Pattern: TRADE_AGREEMENT_PROFESSIONAL_INVALID
- **Severity**: CRITICAL
- **Definition**: Applicant does not qualify as professional under trade agreement
- **Indicators**:
  - Not citizen of USMCA/CPTPP country
  - Occupation not listed in agreement
  - Educational requirements not met
  - Professional credential not from qualifying country
  - License to practice not verifiable
  - Work will not be at professional level
- **Assessment Method**:
  - Nationality verification
  - Occupation code against agreement schedules
  - Educational credential assessment
  - Professional license verification
  - Work description review
- **Recovery**: Apply via LMIA if otherwise eligible, or use different country

#### Pattern: RELIGIOUS_WORKER_FRAUD
- **Severity**: CRITICAL
- **Definition**: Religious worker claim is fraudulent or misrepresented
- **Indicators**:
  - Employer not legitimate faith organization
  - Applicant not actually employed in religious capacity
  - Position not exempt (e.g., janitor, general staff)
  - No evidence of faith-based employer practice
  - Employer previously used category for non-religious work
  - Position is secular with religious employer
- **Assessment Method**:
  - Employer charitable status verification
  - Position function assessment
  - Faith-based requirements documentation
  - Applicant background in faith credentials
  - Referral to faith community verification
- **Recovery**: None if fraud established; may reapply in legitimate capacity

#### Pattern: RECIPROCAL_AGREEMENT_ABSENT
- **Severity**: HIGH
- **Definition**: Claimed reciprocal exchange agreement does not exist or has ended
- **Indicators**:
  - Agreement country not signed reciprocal arrangement with Canada
  - Agreement expired or suspended
  - Employer not authorized under agreement
  - Applicant not from agreement country
  - Agreement requirements not met by applicant
- **Assessment Method**:
  - Agreement list verification
  - Current status confirmation
  - Employer authorization check
  - Country of residence confirmation
- **Recovery**: Apply via alternative category or LMIA if eligible

#### Pattern: EMPLOYER_NOT_AUTHORIZED
- **Severity**: CRITICAL
- **Definition**: Employer not authorized to sponsor IMP workers
- **Indicators**:
  - Employer not registered with IRCC for IMP
  - Registration expired or suspended
  - Previous IMP violations documented
  - Employer on ineligible employer list
  - Provincial authorization not obtained (if required)
  - Employer compliance history poor
- **Assessment Method**:
  - Employer authorization database check
  - Registration status verification
  - Compliance history review
  - Provincial program status check
- **Recovery**: Use authorized employer, or employer must reapply for authorization

#### Pattern: MOBILITY_PILOT_EXPIRED
- **Severity**: HIGH
- **Definition**: Claimed pilot program has ended or applicant no longer eligible
- **Indicators**:
  - Pilot program end date passed
  - Pilot program suspended
  - Position no longer covered by pilot
  - Applicant no longer meets pilot criteria
  - Pilot capacity reached
- **Assessment Method**:
  - Pilot program status verification
  - Eligibility criteria assessment
  - Current enrollment verification
- **Recovery**: Apply for standard IMP category if eligible, or LMIA

#### Pattern: WORK_DUTIES_NOT_SPECIALIZED
- **Severity**: MEDIUM
- **Definition**: Position duties do not justify LMIA exemption
- **Indicators**:
  - Position is generic/routine (e.g., cashier, cleaner)
  - Duties could be performed by any Canadian
  - No specialized skills required
  - Low-skill NOC code (C or D level)
  - Wage not commensurate with specialization
  - Position not temporary but described as such
- **Assessment Method**:
  - NOC code assessment
  - Duty analysis against category requirement
  - Skill level verification
  - Canadian availability assessment
- **Recovery**: Position must be reclassified or reapply via LMIA

## Common Refusal Patterns

### R204 - Refusal Decision Codes

1. **Not eligible for IMP category**
   - Does not meet category-specific requirements
   - Organizational relationship not established
   - Professional credential not recognized
   - Trade agreement does not apply

2. **Employer not authorized for IMP**
   - Employer registration expired
   - Employer previously non-compliant
   - Employer on ineligible list
   - Authorization not obtained

3. **Significant benefits not demonstrated**
   - Insufficient justification provided
   - Position could be filled by Canadian
   - No unique benefit articulated

4. **Intra-company transfer requirements not met**
   - Not continuous international employment
   - Applicant not manager or specialist
   - Corporate relationship not established

5. **Professional requirements not met**
   - Not from designated country
   - Occupation not listed in agreement
   - Professional credential not recognized
   - Work not at professional level

6. **Religious worker requirements not met**
   - Employer not faith-based organization
   - Position not ministerial/religious
   - Exempt status not applicable

## Document Checklist

### Baseline Documents (Required)
- Valid passport
- Job offer letter (original, signed)
- Proof of employer authorization for IMP:
  - Registration certificate from IRCC or provincial program
  - Authorization for specific category
- Medical examination (if required)
- Police certificate (if applicable)
- Proof of applicant qualifications:
  - Educational credentials
  - Professional certifications/license
  - Work experience documentation

### Category-Specific Documents

**Significant Benefits**:
- Employer letter explaining specific benefit to Canada
- Documentation of specialized skills/expertise
- Evidence of technology/knowledge transfer
- Economic impact analysis or job creation plan
- Corporate information showing Canadian operations
- Proof of investment in Canada (if applicable)

**Intra-company Transfer**:
- Corporate documents showing parent-subsidiary or organizational relationship
- Organizational chart with Canadian and foreign entities
- Proof of applicant's international employment (≥1 year)
- Description of managerial or specialized knowledge roles
- Policy documents showing internal transfer procedures

**Trade Agreement Professional**:
- Passport showing citizenship of designated country
- Professional license/credential with verification from issuing body
- Educational credential documentation
- Proof of professional practice history
- Position description showing professional-level work

**Religious Worker**:
- Employer charitable/tax-exempt status documentation
- Religious organization credentials (registration)
- Position description showing ministerial/religious function
- Applicant's religious education/credentials
- Faith community referral letter

### Live Documents (Obtainable)
- Updated passport if close to expiration
- Employment contract (detailed)
- Confirmation of employment
- Updated credentials if required
- Medical exam (if expiring)
- Police certificate (if expiring)

### Strategic Documents
- Detailed letter from employer explaining IMP eligibility
- Proof of Canadian operations (office lease, etc.)
- Industry references validating employer and position
- Proof of wages are competitive for market
- Documentation of workplace standards compliance
- Ties to home country (for temporary intent)
- Previous employment history with employer

## Case Law References

### Key Federal Court Jurisprudence

**Significant Benefits - Discretion Standard (Medium Confidence)**
- Officer has discretion in assessing "significant benefit"
- Not arbitrarily determined but discretion not narrow
- Applicant must provide rational basis for benefit claim
- Officer may consider economic impact, technology transfer, innovation
- Deference given to officer assessment unless unreasonable

**Category Eligibility - Objective Standard (High Confidence)**
- Trade agreement eligibility based on country/occupation lists
- Intra-company transfer requires organizational relationship documentation
- Religious worker status based on employer organization nature
- Officer must verify objective criteria, not infer

**Employer Authorization - Mandatory Gate (High Confidence)**
- Employer must be authorized; applicant cannot waive requirement
- Previous violations or suspension relevant to assessment
- Authorization status checked at time of decision

**Intra-company Manager/Specialist - Fact-Based (High Confidence)**
- Officer assesses whether applicant qualifies as manager or specialist
- Previous international employment requirement substantive
- "Specialized knowledge" defined narrowly (unique to organization)
- Burden on applicant to document qualification

**Professional Licensing - Verification Required (High Confidence)**
- Professional credentials must be verified with licensing body
- Reciprocity not assumed; each country assessed individually
- License must be valid in origin country AND recognizable to Canada
- Applicant responsibility to obtain credential assessment

### Risk Assessment Impact

**High Risk Thresholds**
- Any category eligibility uncertain = request for clarification mandatory
- Significant Benefits claim without employer justification = automatic request
- Employer authorization < 6 months old = verification of continued standing
- Professional credential from non-English country = assessment agency required

**Medium Risk Thresholds**
- Position duties ambiguous = request for detailed job description
- Employer < 2 years in Canada = legitimacy verification
- Intra-company transfer without documentation = organizational proof required
- Wage for specialized position below market = verification of market rate

## Policy Code Mapping

### IRPA/IRPR References
- **R200(1)**: Base work permit eligibility
- **R204(1)**: Exemptions to LMIA (including IMP)
- **R204(2)**: Specific conditions for each IMP category
- **R205**: Conditions on work permit validity

### Operational Manual (IP 16)
- **Chapter 16.4**: International Mobility Program
- **Section 16.4.1**: IMP category eligibility criteria
- **Section 16.4.2**: Significant Benefits assessment
- **Section 16.4.3**: Intra-company transfer requirements
- **Section 16.4.4**: Professional requirements (trade agreements)
- **Section 16.4.5**: Religious worker exemption
- **Section 16.4.6**: Reciprocal exchange agreements

### Bilateral/Multilateral Agreement References
- **USMCA (United States-Mexico-Canada Agreement)**: Professional Appendix
- **CPTPP (Comprehensive and Progressive Agreement)**: Mode 4 provisions
- **France-Canada Reciprocal Agreement**: Young Professional Exchange
- **Australia Skilled Migration Agreement**: Australian nationals
- **Ireland Work Exchange Program**: Reciprocal work permit agreement

### Risk Badge System
- `IMP_CATEGORY_MISMATCH` - Does not qualify for claimed category
- `SIGNIFICANT_BENEFITS_NOT_ESTABLISHED` - Benefit to Canada unclear
- `INTRA_COMPANY_TRANSFER_INVALID` - Organizational relationship missing
- `TRADE_AGREEMENT_PROFESSIONAL_INVALID` - Professional credentials don't qualify
- `RELIGIOUS_WORKER_FRAUD` - Fraudulent religious worker claim
- `EMPLOYER_NOT_AUTHORIZED` - Employer lacks IMP authorization
- `MOBILITY_PILOT_EXPIRED` - Pilot program no longer active
- `WORK_DUTIES_NOT_SPECIALIZED` - Position not sufficiently specialized

## Verification Checklist

**Must Verify Before Approving**:
- [ ] IMP category: Applicant qualifies under one of eight categories
- [ ] Employer authorization: Employer registered and current for IMP/category
- [ ] Significant benefits (if applicable): Documented and plausible
- [ ] Intra-company relationship (if applicable): Organizational structure proven
- [ ] Professional credentials (if applicable): License verified with body
- [ ] Trade agreement (if applicable): Applicant citizen of designated country
- [ ] Wage competitiveness: Market rate documentation provided
- [ ] Admissibility: Security, criminality, health, misrepresentation cleared

**High-Confidence Indicators of Legitimacy**:
- Employer authorization document from IRCC with current dates
- Detailed Significant Benefits letter with economic documentation
- Corporate documents showing genuine organizational relationship
- Professional license verified by regulatory body
- Trade agreement professional from explicitly listed country
- Religious employer verification from faith community
- Wage offers significantly above minimum with benefit package

## See Also

- [hard_eligibility.md](hard_eligibility.md) - General work permit requirements
- [fraud_risk_flags.md](fraud_risk_flags.md) - Employer fraud indicators
- [refusal_patterns.md](refusal_patterns.md) - Historical refusal reasons
- [risk_badges.json](risk_badges.json) - Risk classification system
