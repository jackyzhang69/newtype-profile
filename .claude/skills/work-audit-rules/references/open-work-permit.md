# Open Work Permits Audit Rules

## Definition & Eligibility

Open Work Permits allow foreign nationals to work for ANY employer in Canada (not employer-specific). Applicants do not need to identify a specific job or employer. Open work permits are issued to specific family members of skilled workers/students and to refugees/protected persons. No LMIA required.

### Core Eligibility Criteria - By Category

#### Category A: Spouse/Common-Law Partner of Skilled Worker

**Base Eligibility**:
- Applicant is spouse/common-law partner of principal applicant
- Principal applicant is:
  - Holder of valid work permit (skilled level)
  - Skilled level = NOC A or B (professional/technical)
  - Work permit not expired or employer-specific only
- Genuine marital/common-law relationship
- Both parties 18+ years old
- Not in marriage of convenience

**Duration**:
- Work permit duration matches spouse's work permit
- If spouse's permit expires, open work permit expires

#### Category B: Spouse/Common-Law Partner of International Student

**Base Eligibility**:
- Applicant is spouse/common-law partner of international student
- Student in valid study permit holder
- Student program minimum 6 months duration
- Genuine marital/common-law relationship
- Both parties 18+ years old
- Not in marriage of convenience

**Duration**:
- Work permit duration matches student's study permit
- If student finishes program, open work permit may convert to PGWP pathway

#### Category C: Refugees and Protected Persons

**Base Eligibility**:
- Applicant recognized as refugee by Canada or UNHCR
- Applicant granted protected person status in Canada
- Approved Refugee and Protected Person claim
- In Canada and applied for permanent residence
- Admissibility assessment completed

**Duration**:
- Open work permit until permanent residence granted
- No employer restrictions
- Full work authorization

#### Category D: Caregivers (Spousal-Equivalent Arrangement)

**Base Eligibility**:
- Applicant engaged in authorized caregiver work
- Following specific caregiver work program (e.g., Live-in Caregiver Program)
- Employed by Canadian resident requiring care
- Employment not exploitative

**Duration**:
- Aligned with caregiver program terms
- May transition to permanent residence pathway

### Admissibility Requirements (All Categories)
- No grounds for inadmissibility
- Security clearance
- Criminality assessment
- Medical examination if required
- No misrepresentation

## Risk Assessment Framework

### Category A/B: Spouse/Partner Specific Risk Patterns

#### Pattern: MARRIAGE_OF_CONVENIENCE
- **Severity**: CRITICAL
- **Definition**: Marriage/common-law relationship is fraudulent; entered solely for immigration purposes
- **Indicators**:
  - Recent marriage (< 2 years)
  - Marriage shortly before visa application
  - Age gap (significant difference suggesting transactional)
  - No cohabitation history
  - No joint financial accounts or assets
  - No joint tenancy/property
  - Minimal communication during separation
  - Limited shared interests or family knowledge
  - Prior visa-to-spouse pattern with other partners
  - Online dating followed by rapid marriage
  - Financial transaction from visa holder to spouse
  - Third parties facilitate relationship
  - Conflicting statements about relationship timeline
- **Assessment Method**:
  - Marriage certificate and date analysis
  - Joint account documentation
  - Property/lease documentation
  - Communications evidence (emails, chat history)
  - Witness statements from family
  - Immigration/relationship history review
  - Joint photos/travel documentation
  - Interviews with both parties
- **Recovery**: Very difficult; typically automatic refusal if established

#### Pattern: PRINCIPAL_APPLICANT_INELIGIBLE
- **Severity**: CRITICAL
- **Definition**: Spouse's principal applicant is ineligible for work permit or no longer holds valid work permit
- **Indicators**:
  - Principal work permit expired
  - Principal work permit cancelled
  - Principal work permit employer-specific only (spouse ineligible)
  - Principal applicant NOC level C or D (not skilled)
  - Principal applicant in PGWP category (different rules may apply)
  - Principal applicant not actually in Canada
- **Assessment Method**:
  - Work permit database verification
  - Status verification at time of spouse application
  - NOC code assessment of principal's position
  - Validity date cross-reference
- **Recovery**: Wait for principal applicant to obtain valid skilled work permit

#### Pattern: RELATIONSHIP_GENUINENESS_DOUBT
- **Severity**: HIGH
- **Definition**: Marital/common-law relationship legitimacy cannot be established
- **Indicators**:
  - Limited cohabitation (separate residences)
  - No joint financial accounts despite years together
  - No joint property ownership
  - Minimal financial interdependence
  - Conflicting statements about living arrangements
  - No spouse on principal applicant's work permit dependents
  - No joint leases or utilities
  - Children from relationship but no co-parenting evidence
  - Separate employment without coordination
  - Limited communication between parties
  - Significant time apart with limited explanation
- **Assessment Method**:
  - Cohabitation documentation
  - Financial interdependence proof
  - Joint account/lease/property documentation
  - Photographs of couple together
  - Witness statements
  - Social media presence as couple
  - Interview evidence
- **Recovery**: Enhanced documentation of relationship (joint accounts, property, photos, witnesses)

#### Pattern: COMMON_LAW_REQUIREMENTS_UNMET
- **Severity**: HIGH
- **Definition**: Common-law relationship does not meet definition (not married but claiming spouse status)
- **Indicators**:
  - Cohabitation < 12 months continuous
  - Presenting as spouse but not legally married
  - No intent to cohabitate permanently
  - Insufficient evidence of conjugal relationship
  - Not presented to society as married couple
  - Third-party relationship not documented
- **Assessment Method**:
  - Cohabitation timeline verification
  - Lease/property documentation showing common residence
  - Witness attestation of conjugal relationship
  - Financial interdependence evidence
- **Recovery**: If 12-month cohabitation met, provide additional documentation; if not, wait or marry

#### Pattern: PRINCIPAL_APPLICANT_TEMPORARY_INTENT_DOUBT
- **Severity**: MEDIUM
- **Definition**: Principal applicant has permanent settlement indicators that undermine spouse's claim to "follow"
- **Indicators**:
  - Principal applicant obtained permanent residence
  - Family already in Canada (children, extended family)
  - Property purchased in Canada
  - Work history in Canada extended (5+ years)
  - Principal applicant naturalizing/citizenship application
  - Spouse's open work permit claimed after principal settled
  - Pattern suggests family reunification via work permits, not primary employment
- **Assessment Method**:
  - Principal's immigration history review
  - Timeline of family establishment in Canada
  - Property/asset documentation
  - Citizenship/naturalization status
  - Relationship timeline vs. principal's Canadian presence
- **Recovery**: If principal legitimately on skilled work permit, spouse eligible despite principal's intent

### Category C: Refugee/Protected Person Specific Risk Patterns

#### Pattern: FRAUDULENT_REFUGEE_CLAIM
- **Severity**: CRITICAL
- **Definition**: Refugee status granted based on false information or misrepresentation
- **Indicators**:
  - Travel history inconsistent with persecution narrative
  - Safe country residence prior to refugee claim
  - False documentation in claim
  - Background checks show false persecution claims
  - Medical evidence fabricated
  - Police certificates false
  - Identity misrepresented
  - Country of origin visit after claiming persecution there
- **Assessment Method**:
  - Refugee determination review
  - IRB (Immigration and Refugee Board) decision analysis
  - Background/criminal history check
  - Travel documentation review
  - Country conditions verification
  - Safety verification
- **Recovery**: None if fraud established; potential deportation; work permit cancelled

#### Pattern: PROTECTED_PERSON_STATUS_LAPSED
- **Severity**: CRITICAL
- **Definition**: Refugee/protected person status no longer valid at work permit application time
- **Indicators**:
  - Status revoked by IRCC
  - Status terminated due to criminal activity
  - Status ceased (voluntary return to country)
  - Status expires without renewal
  - Permanent residence granted (status no longer needed)
- **Assessment Method**:
  - Status verification with IRCC
  - Current record check
  - Cessation/revocation documentation
- **Recovery**: May reapply if status reactivated or permanent residence granted

#### Pattern: CRIMINAL_ACTIVITY_POST_RECOGNITION
- **Severity**: HIGH
- **Definition**: Criminal activity discovered after refugee status granted but before work permit issuance
- **Indicators**:
  - Criminal charges laid after refugee status
  - Fraud or misrepresentation discovered
  - Involvement in trafficking or exploitation
  - Connection to organized crime
  - Security concerns identified post-status
- **Assessment Method**:
  - Criminal background verification
  - Police database checks
  - Security intelligence
  - Interpol records
- **Recovery**: Work permit refused; status potentially revoked; deportation considered

### Category D: Caregiver Specific Risk Patterns

#### Pattern: EMPLOYMENT_NOT_AUTHORIZED_CAREGIVER
- **Severity**: CRITICAL
- **Definition**: Employment is not actually in authorized caregiver program or role
- **Indicators**:
  - Not registered in Live-in Caregiver Program
  - Employment as general housekeeper (not eligible)
  - Wages below program minimums
  - Working conditions exploitative
  - Employer not authorized
  - Position doesn't match caregiver criteria
  - Employment termination before residency requirement
- **Assessment Method**:
  - Program registration verification
  - Employment contract review
  - Employer authorization check
  - Wage verification
  - Working conditions assessment
- **Recovery**: Must obtain legitimate caregiver employment authorization

#### Pattern: CAREGIVER_EXPLOITATION_RISK
- **Severity**: HIGH
- **Definition**: Caregiver employment involves exploitation or unsafe working conditions
- **Indicators**:
  - Excessive working hours (14+ daily)
  - Wage below program minimum
  - Passport held by employer
  - Movement restricted
  - Isolation from other workers
  - Inadequate accommodation
  - Sexual harassment/abuse
  - Threats or coercion
- **Assessment Method**:
  - Employment contract terms review
  - Applicant interview
  - Workplace conditions assessment
  - Reference contact with previous employers
  - NGO/advocacy group reports
- **Recovery**: Requires employer accountability, enhanced monitoring, or job change

## Common Refusal Patterns

### R205 - Open Work Permit Refusal Decision Codes

**Spouse/Partner Category**:
1. **Not in valid marital/common-law relationship**
   - Marriage of convenience determined
   - Relationship not genuine
   - Not validly married
   - Common-law criteria not met (< 12 months, non-conjugal)

2. **Principal applicant ineligible or non-status**
   - Principal work permit expired
   - Principal not on skilled work permit (NOC A/B required)
   - Principal ineligible for work permit
   - Principal not in Canada

3. **Applicant inadmissible**
   - Security concerns
   - Criminality issues
   - Health dangers
   - Misrepresentation in spouse application

**Refugee/Protected Person Category**:
1. **Refugee status fraudulent**
   - False persecution claims
   - Fraudulent documentation
   - Ineligible for refugee status in reality

2. **Status no longer valid**
   - Status revoked
   - Status terminated/ceased
   - Permanent residence already granted

3. **Inadmissibility post-recognition**
   - Criminal activity
   - Security concerns
   - Misrepresentation

**Caregiver Category**:
1. **Employment not authorized caregiver program**
   - Not registered in program
   - Position does not meet program criteria
   - Employer not authorized

2. **Caregiver program violations**
   - Workplace conditions exploitative
   - Wages below program minimum
   - Working hours excessive

## Document Checklist

### Baseline Documents (All Categories)
- Valid passport
- Medical examination (if required)
- Police certificate (if applicable)
- Admissibility documents

### Spouse/Partner Specific
- Marriage certificate (or common-law relationship proof):
  - Official marriage certificate (certified)
  - Cohabitation documentation (lease, property deed)
  - Common-law proof (12+ months cohabitation, joint accounts)
- Principal applicant's valid work permit copy
- Relationship documents:
  - Joint photos (couple together)
  - Joint bank account statements
  - Joint lease or property ownership
  - Joint utility bills
  - Employer confirmation of spouse/partner status
- Family information documentation:
  - Children's birth certificates (if applicable)
  - Family structure proof

### Refugee/Protected Person Specific
- Refugee status documentation:
  - IRB determination letter
  - Proof of acceptance as protected person
  - IRCC confirmation of refugee status
- Identification documentation
- Permanent residence application (if applicable)

### Caregiver Specific
- Caregiver program registration/authorization
- Employment contract (signed)
- Employer information
- Workplace certification
- Wage documentation

### Live Documents (Obtainable)
- Updated passport if close to expiration
- Recent correspondence from principal applicant (for spouses)
- Updated family information
- Medical exam (if expiring)
- Police certificate (if expiring)

### Strategic Documents (Spouse/Partner)
- Detailed relationship narrative:
  - How couple met
  - Relationship timeline
  - Decision to marry/cohabitate
  - Living arrangements
  - Future plans
- Letters of support from family/friends attesting to relationship
- Evidence of financial interdependence:
  - Joint bank accounts
  - Mortgage/lease in both names
  - Spouse beneficiary on life insurance
  - Tax returns filed jointly (if applicable)
- Photographs of couple together at various time periods
- Travel documentation showing couple travel
- Children's birth certificates
- Employment letters confirming spouse as dependent

## Case Law References

### Key Federal Court Jurisprudence

**Marriage of Convenience - Substantive Assessment (High Confidence)**
- Officer assesses genuineness of marriage
- Burden on applicant to prove genuine relationship
- Recent marriage and rapid visa application create suspicion
- Financial transaction between parties may indicate arrangement
- Courts defer to officer credibility assessment

**Principal Applicant Eligibility - Verification Mandatory (High Confidence)**
- Officer must verify principal applicant's work permit status
- Spouse application fails if principal ineligible
- NOC level requirement for spouse (must be A/B) strictly enforced
- Timing verification required (principal must have valid permit at spouse application time)

**Common-Law Recognition - Strict 12-Month Rule (High Confidence)**
- 12-month cohabitation requirement is mandatory
- Cannot be waived or reduced
- Must be continuous cohabitation
- Absence for employment reasons may be acceptable if family home maintained

**Refugee Status - Presumed Valid (High Confidence)**
- Once refugee status granted by IRB, presumed valid for work permit purposes
- Officer cannot second-guess IRB determination
- But work permit may still be refused on separate admissibility grounds
- Fraud or cessation of status changes analysis

**Admissibility - Always Required (High Confidence)**
- Even if relationship/status genuine, admissibility independently required
- Criminal background separately disqualifying
- Security concerns independently disqualifying
- Cannot be waived based on relationship

### Risk Assessment Impact

**High Risk Thresholds**
- Recent marriage (< 2 years) before visa application = enhanced documentation required
- No joint financial accounts despite years together = verification required
- Principal applicant work permit expires soon = status confirmation required
- Relationship established online = interview likely

**Medium Risk Thresholds**
- Principal applicant newly hired/recent employment = background verification
- Couple has limited joint assets = cohabitation documentation required
- Spouse not on principal's family information = clarification required
- Age gap > 15 years = enhanced scrutiny (not automatic refusal)

## Policy Code Mapping

### IRPA/IRPR References
- **R200(1)**: Base work permit eligibility
- **R200(2)(c)**: Open work permit issuance
- **R205(1)(d)**: Open work permit specific conditions
- **R205(1)(e)**: Duration tied to spouse/student permit

### Operational Manual (IP 16)
- **Chapter 16.5**: Open work permits
- **Section 16.5.1**: Spouse/partner of skilled worker
- **Section 16.5.2**: Spouse/partner of international student
- **Section 16.5.3**: Refugees and protected persons
- **Section 16.5.4**: Caregivers
- **Section 16.5.5**: Relationship genuineness assessment

### Risk Badge System
- `OPEN_MARRIAGE_OF_CONVENIENCE` - Fraudulent marriage detected
- `OPEN_PRINCIPAL_INELIGIBLE` - Principal applicant ineligible
- `OPEN_RELATIONSHIP_FRAUD` - Relationship not genuine
- `OPEN_REFUGEE_STATUS_FRAUDULENT` - False refugee claim
- `OPEN_REFUGEE_STATUS_LAPSED` - Refugee status no longer valid
- `OPEN_EXPLOITATION_RISK` - Caregiver work exploitation concerns
- `OPEN_ADMISSIBILITY_CONCERN` - Separate admissibility grounds

## Verification Checklist

**Spouse/Partner (All Sub-Categories)**:
- [ ] Marriage/common-law relationship: Validly established and documented
- [ ] Cohabitation: Minimum 12 months continuous (if common-law)
- [ ] Genuineness: Relationship not marriage of convenience
- [ ] Principal applicant: Holds valid work permit and meets requirements
- [ ] Financial interdependence: Joint accounts/assets documented
- [ ] Admissibility: Security, criminality, health, misrepresentation cleared

**Refugee/Protected Person**:
- [ ] Status: Refugee status or protected person status confirmed valid
- [ ] Status not fraudulent: IRB determination appears sound
- [ ] Status not ceased: Not revoked or terminated
- [ ] Admissibility: No post-recognition criminal activity or security concerns
- [ ] Application status: In Canada and permanent residence application filed/pending

**Caregiver**:
- [ ] Program authorization: Registered in authorized caregiver program
- [ ] Employment: Actual caregiver employment with authorized employer
- [ ] Wages: Minimum wages met
- [ ] Conditions: Working conditions comply with program standards
- [ ] No exploitation: No evidence of abuse or exploitation

**High-Confidence Indicators of Legitimacy**:
- Official marriage certificate with government seal
- Joint bank account statements showing years of activity
- Property deed or mortgage in both spouses' names
- Lease agreement in both names
- Photographs of couple together spanning multiple years
- Family/friend letters attesting to relationship
- Principal applicant's work permit showing current valid status
- IRB determination letter with valid refugee/protected person status
- Employment contract from authorized caregiver employer

## Subtypes

### Spouse/Partner of Skilled Worker - Extended Categories
- Skilled NOC A/B work permit required
- PGWP for skilled stream graduates
- High-wage international mobility program positions

### Spouse/Partner of International Student - Study Permit Requirement
- Study permit minimum 6 months duration
- Full-time enrollment requirement
- Designated learning institution

### Refugee - IRB Determination
- Convention refugee status
- Person in need of protection (domestic/gang violence)
- Foreign national (non-citizen)

### Protected Person - Protection Granted
- Domestic/gang violence protection
- Torture/cruel treatment
- Death penalty risk

## See Also

- [hard_eligibility.md](hard_eligibility.md) - General work permit requirements
- [fraud_risk_flags.md](fraud_risk_flags.md) - Relationship and document fraud indicators
- [refusal_patterns.md](refusal_patterns.md) - Historical refusal reasons
- [risk_badges.json](risk_badges.json) - Risk classification system
