# LMIA-Based Work Permits Audit Rules

## Definition & Eligibility

LMIA-based work permits are issued to foreign workers whose employer has obtained a positive Labour Market Opinion (LMO) from Employment and Social Development Canada (ESDC), formerly Service Canada. LMIA is the primary gatekeeping mechanism for employer-specific work permits.

### Core Eligibility Criteria (Hard Requirements)

1. **Valid Job Offer**
   - Written offer from registered Canadian employer
   - Specific position clearly defined
   - Job duties align with National Occupational Classification (NOC) code
   - Signed by authorized employer representative
   - Specifies:
     - Position title and classification
     - Duties and responsibilities
     - Salary/wages and benefits
     - Duration of employment
     - Work location
     - Employment conditions

2. **Positive Labour Market Opinion**
   - ESDC Labour Market Opinion assessment completed
   - Positive determination issued
   - LMIA valid on date of work permit application
   - Job description in LMIA matches offer letter
   - Employer same as in LMIA application
   - LMIA not revoked or suspended
   - Labour Market Impact deemed positive

3. **Employer Legitimacy**
   - Registered business in Canada
   - Current business registration (provincial/federal)
   - Actual operations at claimed location
   - No fraud history
   - Contact information verifiable
   - Previous LMIA compliance record

4. **Labour Market Compliance**
   - Wages meet or exceed prevailing market rate
   - No Canadian worker displacement demonstrated
   - Recruitment efforts documented (minimum 4 weeks, national media)
   - Position requires specialized skills
   - No high-risk industry (unless special conditions)

5. **Admissibility**
   - No grounds for inadmissibility
   - Security clearance
   - Criminality assessment
   - Medical examination if required
   - No misrepresentation

## Risk Assessment Framework

### Category-Specific Risk Patterns

#### Pattern: LMIA_NOT_OBTAINED
- **Severity**: CRITICAL
- **Definition**: Job offer without valid LMIA
- **Indicators**:
  - Job offer provided but no LMIA document
  - LMIA negative assessment issued
  - LMIA issued to different employer
  - LMIA expired before application
  - LMIA cancelled by ESDC
  - Exemption category applied incorrectly
- **Assessment Method**:
  - ESDC record verification
  - Document date comparison
  - Employer name cross-reference
  - Status verification with ESDC
- **Recovery**: Employer must obtain new positive LMIA, reapply

#### Pattern: LMIA_JOB_DUTY_MISMATCH
- **Severity**: HIGH
- **Definition**: Position duties differ materially from LMIA application
- **Indicators**:
  - Job offer duties broader than LMIA scope
  - Actual duties narrower or different NOC classification
  - Responsibility level differs from LMIA description
  - Work location different from LMIA
  - Position partially self-employment (prohibited)
  - Travel requirements not in LMIA
- **Assessment Method**:
  - Duty-by-duty comparison
  - NOC code verification
  - Location verification (worksite inspection possible)
  - Employer statement on intended duties
- **Recovery**: New LMIA with corrected job description, reapply

#### Pattern: WAGE_BELOW_PREVAILING
- **Severity**: HIGH
- **Definition**: Offered wage does not meet prevailing market rate
- **Indicators**:
  - Wages below provincial minimum wage (absolute floor)
  - Wages below ESDC prevailing wage determination
  - Wages below occupation median (national or regional)
  - Significant underpayment compared to LMIA wage
  - No equivalent benefits offset
  - Hidden deductions reducing effective wage
- **Assessment Method**:
  - Statistics Canada wage data comparison
  - ESDC prevailing rate verification
  - Total compensation analysis
  - Industry wage surveys
  - Benefits conversion to monetary value
- **Recovery**: Employer revises wage to meet prevailing rate, new LMIA

#### Pattern: EMPLOYER_NOT_LEGITIMATE
- **Severity**: CRITICAL
- **Definition**: Employer registration or legitimacy cannot be verified
- **Indicators**:
  - Business registration invalid or expired
  - No actual operations at claimed location
  - Phone/email unresponsive
  - Address is mail-drop or virtual office only
  - Previous LMIA denials for fraud
  - Shell company patterns
  - Employer previously implicated in worker exploitation
  - Multiple LMIA applications under different corporate structures
  - No industry verifiable presence
- **Assessment Method**:
  - Provincial/federal business registry verification
  - Worksite visit or Street View verification
  - Credit bureau/industry database checks
  - Reference contact from industry
  - Financial records review
  - IRCC fraud database check
- **Recovery**: Use different employer with verified legitimacy

#### Pattern: RECRUITMENT_NOT_DOCUMENTED
- **Severity**: HIGH
- **Definition**: Insufficient evidence of Canadian worker recruitment
- **Indicators**:
  - Recruitment period < 4 weeks
  - No national media advertising
  - Exclusively international recruitment
  - Job posting minimal/vague
  - No documented applicant responses
  - Rejection rationale for Canadian candidates unclear
  - Job posting dates inconsistent
- **Assessment Method**:
  - Recruitment plan review
  - Job posting documentation
  - Media placement verification
  - Applicant response tracking
  - Rejection documentation review
  - Timeline verification
- **Recovery**: Conduct valid recruitment period, new LMIA

#### Pattern: CANADIAN_WORKER_DISPLACEMENT_RISK
- **Severity**: MEDIUM-HIGH
- **Definition**: Evidence suggests hiring foreign worker displaces Canadian employment
- **Indicators**:
  - Recent Canadian worker terminations in same role
  - Canadian applicants rejected without clear rationale
  - Position historically filled by Canadian workers
  - Identical position filled by temporary foreign worker previously
  - Job posting designed to discourage Canadian applications
  - Wages significantly lower than industry norm
  - Industry experiencing high Canadian unemployment
- **Assessment Method**:
  - Historical hiring records
  - Comparable position analysis
  - Industry labour market assessment
  - Justification for foreign-worker need
- **Recovery**: Strengthen justification, demonstrate genuine skills gap

#### Pattern: NOC_MISCLASSIFICATION
- **Severity**: MEDIUM
- **Definition**: Job duties do not align with claimed NOC code
- **Indicators**:
  - Duties suggest different skill level
  - Claimed B-level (technical) but duties are C-level (intermediate)
  - Self-employment components in employed position
  - Supervisory duties inconsistent with NOC code
  - Educational requirements mismatched
- **Assessment Method**:
  - National Occupational Classification manual review
  - Duty-by-duty NOC matching
  - Skill level assessment
  - Education requirement verification
- **Recovery**: Correct NOC code, new LMIA if threshold changed

#### Pattern: WORK_PERMIT_STACKING
- **Severity**: MEDIUM
- **Definition**: Applicant obtaining multiple consecutive work permits with same employer, suggesting conversion to permanent residence intent
- **Indicators**:
  - 3+ consecutive LMIA renewals
  - Same employer and role for 5+ years
  - Work permit duration extending continuously
  - Spouse obtained work permit concurrently
  - Children added to family as dependents
  - No ties to home country demonstrated
  - Property purchase or family establishment in Canada
- **Assessment Method**:
  - Work permit history analysis
  - Timeline pattern review
  - Settlement intent assessment
  - Family establishment evidence
- **Recovery**: Establish clear return plan, limit permit duration

#### Pattern: INDUSTRY_HIGH_RISK
- **Severity**: MEDIUM
- **Definition**: Industry sector known for worker exploitation or fraud
- **Indicators**:
  - Agricultural/construction/hospitality sector
  - Known for underpayment or unsafe conditions
  - Employer has previous complaints to Labour Board
  - Employer previously sanctioned for labour violations
  - Precarious employment arrangements
  - Occupational health/safety violations documented
- **Assessment Method**:
  - Labour Board complaint history
  - Media reports on employer
  - Industry-specific fraud patterns
  - Applicant interviews on working conditions
- **Recovery**: Enhanced documentation, third-party labour compliance verification

## Common Refusal Patterns

### R203 - Refusal Decision Codes

1. **No valid positive LMIA obtained**
   - LMIA requirement not met
   - Negative assessment issued
   - Exemption did not apply
   - LMIA expired or revoked

2. **Employer not legitimate**
   - Business registration invalid
   - Employer not authorized to hire
   - Fraudulent employer documentation
   - Employer known for violations

3. **Job duty mismatch**
   - Position duties differ from LMIA
   - Applicant cannot perform claimed duties
   - Duties constitute self-employment
   - Position reclassified after LMIA

4. **Wage non-compliance**
   - Below minimum wage
   - Below prevailing rate
   - Below median for occupation
   - Compensatory benefits inadequate

5. **Canadian worker displacement**
   - Recent terminations in same role
   - Recruitment insufficient
   - Canadian applicants unfairly rejected
   - Position traditionally held by Canadian workers

6. **Recruitment inadequacy**
   - Recruitment period insufficient
   - National media not used
   - Job posting inadequate
   - No documented applicant responses

## Document Checklist

### Baseline Documents (Required)
- Valid passport
- Job offer letter (original, signed by authorized representative)
- Positive Labour Market Opinion (ESDC document, original)
- Medical examination (if required)
- Police certificate (if applicable)
- Proof of applicant's qualifications:
  - Educational credentials (diploma/degree)
  - Professional certifications
  - Work experience letters
  - Skills documentation
- Employer's business registration certificate
- Proof of employer legitimacy:
  - Business registration (current)
  - Tax compliance documents
  - Business address verification

### Live Documents (Obtainable)
- Updated passport if close to expiration
- Confirmation of employment (from employer)
- Additional credentials if available
- Updated financial documents
- Medical exam (if expiring soon)
- Police certificate (if expiring soon)

### Strategic Documents
- Detailed letter from employer explaining:
  - Why foreign worker needed
  - Specific qualifications required
  - How Canadian recruitment was conducted
  - Why Canadian candidates not suitable
  - Commitment to workplace standards
  - Workplace safety documentation
- Reference letters from previous employers validating qualifications
- Professional credentials assessment (if credentials from non-English country)
- Proof of wages match prevailing rate:
  - Statistics Canada wage data
  - Industry wage surveys
  - Employer compensation structure
- Proof of ties to home country (for temporary intent assessment)
- Employment contract with detailed terms and conditions
- Workplace certification:
  - Labour compliance
  - Health & safety records
  - Positive labour relations history

## Case Law References

### Key Federal Court Jurisprudence

**LMIA Requirement - Non-Discretionary (High Confidence)**
- LMIA is mandatory gate for most employer-specific permits
- Officer cannot waive LMIA requirement without exemption
- Applicant must prove eligibility to exemption
- Exemption not inferred from facts

**Employer Legitimacy - Officer Discretion (High Confidence)**
- Officer may refuse if not satisfied employer is legitimate
- Officer may conduct verification beyond documents
- Fraud indicators trigger investigation obligation
- Deference not given to employer word alone

**Wage Compliance - Objective Standard (High Confidence)**
- Prevailing wage is determinable by reference to labour data
- Officer must use current wage statistics
- Benefits may offset, but must be documented
- Significant underpayment presumptively invalid

**Job Duty Mismatch - Material Change (High Confidence)**
- Any material change in duties requires new LMIA
- Immaterial variations within same NOC may be acceptable
- Burden on applicant to show duties within LMIA scope
- Officer discretion engaged if ambiguity exists

**Canadian Worker Displacement - Labour Market Assessment (Medium Confidence)**
- Officer assesses labour market context
- Some deference to LMIA assessment (already done by ESDC)
- Can still refuse on displacement grounds independent of LMIA
- Requires evidence, not mere suspicion

**Temporary Intent - Enhanced Scrutiny (Medium Confidence)**
- LMIA applicant may receive enhanced questioning
- Multiple renewals may trigger intent examination
- Family establishment is relevant but not determinative
- Burden on applicant to demonstrate ties to home country

### Risk Assessment Impact

**High Risk Thresholds**
- Any LMIA document not original = document request mandatory
- Wage offered within 10% of prevailing rate = verification required
- Employer < 1 year in business = legitimacy investigation required
- Industry flagged as high-risk = enhanced documentation required

**Medium Risk Thresholds**
- LMIA > 6 months old = confirmation of continued validity required
- Job duties ambiguously described = request for clarification
- Employer changed location since LMIA = verification of new location
- Multiple previous LMIA applications = pattern analysis required

## Policy Code Mapping

### IRPA/IRPR References
- **R200(1)**: Base work permit eligibility
- **R200(2)**: Work permit issuance requirement
- **R203**: LMIA requirement for employer-specific permits
- **R204**: Exemptions to LMIA requirement
- **R205**: Conditions on work permit validity

### Operational Manual (IP 16)
- **Chapter 16.3**: Labour Market Opinion requirement
- **Section 16.3.1**: LMIA assessment criteria
- **Section 16.3.2**: Employer legitimacy verification
- **Section 16.3.3**: Job duty assessment
- **Section 16.3.4**: Wage compliance verification
- **Section 16.3.5**: Canadian worker recruitment assessment
- **Section 16.3.6**: Appeals and reconsideration

### Employment Standards Reference
- **ESDC LMO Assessment Criteria**
- **National Occupational Classification (NOC) Manual**
- **Statistics Canada Labour Force Survey (wage data)**
- **Provincial/Territorial Labour Standards**

### Risk Badge System
- `LMIA_NOT_OBTAINED` - No valid LMIA
- `LMIA_JOB_DUTY_MISMATCH` - Duties differ from LMIA
- `WAGE_BELOW_PREVAILING` - Wage inadequate
- `EMPLOYER_NOT_LEGITIMATE` - Employer cannot be verified
- `RECRUITMENT_NOT_DOCUMENTED` - Canadian recruitment inadequate
- `CANADIAN_WORKER_DISPLACEMENT` - Displacement risk identified
- `NOC_MISCLASSIFICATION` - Skill level mismatch
- `WORK_PERMIT_STACKING` - Multiple consecutive renewals
- `INDUSTRY_HIGH_RISK` - Sector known for exploitation

## Verification Checklist

**Must Verify Before Approving**:
- [ ] ESDC records: Positive LMIA exists and is valid
- [ ] LMIA match: Job offer aligns with LMIA description
- [ ] Employer legitimacy: Business registration current and verifiable
- [ ] Employer contact: Phone/email responsive and worksite confirmed
- [ ] Wage compliance: Offered wage meets prevailing rate
- [ ] Applicant qualifications: Education/experience documented
- [ ] Canadian recruitment: LMIA recruitment requirement met
- [ ] Admissibility: Security, criminality, health, misrepresentation cleared

**High-Confidence Indicators of Legitimacy**:
- Official LMIA document with ESDC signature
- Employer registered with provincial/federal business registry
- Worksite verification shows actual operations
- Job offer from company email with executive signature
- Wage significantly above minimum (comfort margin)
- Applicant credentials verified by professional body
- Industry references provide positive employer feedback

## Subtypes

### Regular LMIA (Stream A)
- Standard labour market assessment
- Wages at prevailing rate
- Recruitment conducted 4 weeks minimum
- Typical processing: 4-6 weeks

### High-Wage LMIA (Stream B)
- Salary ≥ provincial median
- Expedited processing (2 weeks)
- Reduced recruitment burden
- Higher wage creates lower fraud risk

## See Also

- [hard_eligibility.md](hard_eligibility.md) - General work permit requirements
- [fraud_risk_flags.md](fraud_risk_flags.md) - Employer and applicant fraud indicators
- [refusal_patterns.md](refusal_patterns.md) - Historical refusal reasons
- [risk_badges.json](risk_badges.json) - Risk classification system
