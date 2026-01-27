# Intra-Company Transfer (ICT) Work Permits Audit Rules

## Definition & Eligibility

Intra-Company Transfer is a subcategory of the International Mobility Program for foreign employees of multinational corporations being transferred to a Canadian office. Applicants must be employees of the same corporation group working in managerial or specialized knowledge positions. No LMIA is required, but the transfer must be genuine and the applicant must meet specific role requirements.

### Core Eligibility Criteria (Hard Requirements)

1. **Continuous International Employment**
   - Applicant employed by same corporate group (parent, subsidiary, affiliate)
   - Minimum 12 months continuous employment prior to transfer
   - Employment must be full-time (not casual/part-time)
   - Employment at same skill level as proposed Canadian position
   - No employment breaks exceeding 3 months

2. **Organizational Relationship**
   - Corporate group structure clearly defined:
     - Parent company relationship (subsidiary)
     - Sibling subsidiary relationship (common ownership)
     - Affiliate relationship (>50% ownership/control)
   - Canadian entity must be owned/controlled by same group
   - Ownership documentation must be current
   - No recent corporate restructuring suspicious patterns

3. **Managerial or Specialized Knowledge Position**

   **Managerial Position**:
   - Supervises other employees
   - Hires/fires or recommends hiring/firing
   - Controls budget or financial allocation
   - Makes binding corporate decisions
   - Senior level within organization hierarchy

   **Specialized Knowledge Position**:
   - Technical expertise specific to employer
   - Exclusive/unique knowledge not readily available
   - Critical to company operations in Canada
   - Knowledge cannot easily be transferred to Canadian employee
   - Proprietary processes, systems, or client relationships
   - Experience of 3+ years in comparable role internationally

4. **Job Offer and Position Details**
   - Written job offer from Canadian employer entity
   - Signed by authorized Canadian company representative
   - Position title, duties, location, salary clearly specified
   - Duties must correspond to managerial/specialized role
   - Wages competitive for position and region
   - Duration of transfer specified

5. **Admissibility**
   - No grounds for inadmissibility
   - Security clearance
   - Criminality assessment
   - Medical examination if required
   - No misrepresentation

## Risk Assessment Framework

### Category-Specific Risk Patterns

#### Pattern: CORPORATE_RELATIONSHIP_NOT_ESTABLISHED
- **Severity**: CRITICAL
- **Definition**: Applicant's current employer is not in same corporate group as Canadian employer
- **Indicators**:
  - Different corporate entities with no ownership link
  - Organizational chart does not show relationship
  - Corporate records do not confirm relationship
  - Canadian entity recently acquired but relationship unclear
  - Parent/subsidiary distinction not documented
  - Affiliate ownership stake < 50%
  - No stock certificates or ownership proof
  - Sole proprietor claiming corporate group
- **Assessment Method**:
  - Corporate registry search (both countries)
  - Organizational chart verification
  - Share certificate/ownership documentation
  - Director/shareholder registry checks
  - Tax filings confirming group relationship
- **Recovery**: Cannot be recovered (distinct corporations)

#### Pattern: EMPLOYMENT_NOT_CONTINUOUS
- **Severity**: CRITICAL
- **Definition**: Applicant's employment was interrupted or does not meet 12-month minimum
- **Indicators**:
  - Total employment < 12 months
  - Employment contract shows end date before transfer date
  - Employment break > 3 months (leave, contract gap)
  - Multiple contract positions with gaps
  - Self-employment or contractor period intervenes
  - Changed employers within corporate group (not direct transfer)
  - Lay-off or termination before rehire
- **Assessment Method**:
  - Employment contract documentation
  - Pay stubs showing continuous salary
  - Tax records (T4/foreign equivalent) confirmation
  - Employment verification letter
  - Timeline analysis of employment history
- **Recovery**: Wait until 12-month continuous employment met, reapply

#### Pattern: POSITION_NOT_MANAGERIAL_OR_SPECIALIST
- **Severity**: HIGH
- **Definition**: Position does not meet managerial or specialized knowledge threshold
- **Indicators**:
  - Position is routine/generic (e.g., general accountant, clerk)
  - No supervisory responsibility claimed
  - Duties not managerial level
  - Specialized knowledge claim but knowledge readily available
  - Experience not in comparable role (e.g., shift supervisor but claiming manager)
  - Applicant "specialist" knowledge but could be trained on job
  - Technical role but not exclusive to employer
  - Self-taught skills without formal background
- **Assessment Method**:
  - Position description analysis
  - NOC code assessment
  - Organizational hierarchy verification
  - International position duties comparison
  - Specialized knowledge justification review
  - Industry standards for role assessment
- **Recovery**: Position must be recharacterized or reapply via LMIA

#### Pattern: TEMPORARY_ASSIGNMENT_FRAUD
- **Severity**: HIGH
- **Definition**: Transfer is genuine business assignment but duration/terms indicate permanent placement intent
- **Indicators**:
  - International employment terminated before transfer
  - Assignment "permanent" or open-ended
  - No return plan to international office
  - Family relocated to Canada with children in school
  - Property purchase in Canada
  - Visa sponsorship for spouse/children
  - Assignment described as stepping stone to PR
- **Assessment Method**:
  - Assignment terms and conditions review
  - International employment status verification
  - Return plan documentation
  - Ties to home country assessment
- **Recovery**: Clarify assignment as genuinely temporary, strengthen return plan

#### Pattern: KNOWLEDGE_NOT_SPECIALIZED
- **Severity**: MEDIUM
- **Definition**: Claimed specialized knowledge is not genuinely specialized to employer
- **Indicators**:
  - Knowledge is industry-standard (not proprietary)
  - Training could be provided to Canadian employee
  - Knowledge not exclusive or unique to employer
  - Applicant training/credentials available elsewhere
  - Documentation does not support specialization claim
  - Role could be filled by Canadian with same expertise
  - "Specialized" knowledge is basic technical skill
- **Assessment Method**:
  - Specialized knowledge documentation
  - Industry practice comparison
  - Transferability assessment
  - Competitive advantage analysis
  - Training burden evaluation
- **Recovery**: Reclassify position as generic (not ICT eligible), apply via LMIA

#### Pattern: CANADIAN_ENTITY_LEGITIMACY_DOUBT
- **Severity**: HIGH
- **Definition**: Canadian operating entity legitimacy cannot be verified
- **Indicators**:
  - Canadian entity not registered or registration expired
  - No actual operations at claimed location
  - Office address is mail-drop or virtual office
  - No employees in Canada besides applicant
  - Company phone/email unresponsive
  - Financial records not accessible
  - Business license suspended or revoked
  - Recent incorporation with no history
- **Assessment Method**:
  - Canadian business registry search
  - Worksite verification (Street View, physical visit)
  - Financial documentation review
  - Employee roster verification
  - Contact verification
  - Credit/background checks
- **Recovery**: Use established legitimate Canadian entity, restructure operations

#### Pattern: INTERNATIONAL_POSITION_INTEGRITY_DOUBT
- **Severity**: MEDIUM
- **Definition**: International position claimed in application but cannot be verified
- **Indicators**:
  - International employer no longer responsive
  - International position details inconsistent with documentation
  - Applicant not on current payroll
  - Leave of absence exceeds 3 months
  - Terminated from international position before transfer
  - Contractor/consultant role (not employment)
  - Position level inconsistent with claims
- **Assessment Method**:
  - International employer contact/verification
  - Payroll record review
  - Employment letter confirmation
  - International position documentation
  - Tax records verification
- **Recovery**: Obtain verified employment documentation from international employer

#### Pattern: COMPENSATION_NOT_COMPETITIVE
- **Severity**: MEDIUM
- **Definition**: Canadian position wage is not competitive for managerial/specialized role
- **Indicators**:
  - Wage below market for position/region
  - Wage decrease from international position without justification
  - Benefits significantly reduced
  - Compensation package inconsistent with managerial role
  - Wage below Canadian industry standard for specialization
- **Assessment Method**:
  - Market wage data research (Statistics Canada, industry surveys)
  - International wage comparison
  - Benefits analysis
  - Justification for reduction (if any)
- **Recovery**: Increase wage offer to competitive level, provide justification for any reduction

## Common Refusal Patterns

### R204(c) - ICT Refusal Decision Codes

1. **Not same employer group**
   - Corporate relationship not established
   - No common ownership documented
   - Unrelated corporations

2. **Employment not continuous or sufficient**
   - Less than 12 months continuous employment
   - Employment terminated before transfer
   - No full-time employment status

3. **Position not managerial or specialist**
   - Routine position (not managerial level)
   - No supervisory responsibility
   - Specialized knowledge not established
   - Not equivalent to international position

4. **Canadian entity not legitimate**
   - Entity not registered
   - No actual operations
   - Business not active

5. **Applicant does not meet specialized knowledge criteria**
   - Knowledge not proprietary to employer
   - Experience not sufficient (< 3 years comparable)
   - Knowledge readily available elsewhere

6. **Temporary intent concerns**
   - Assignment terms do not indicate genuine temporary transfer
   - Evidence of permanent settlement intent
   - No return plan to international office

## Document Checklist

### Baseline Documents (Required)
- Valid passport
- Job offer letter (original, signed by Canadian company authorized representative)
- Corporate structure documentation:
  - Organizational chart showing ownership structure
  - Share certificates or ownership documentation
  - Articles of incorporation
  - Corporate bylaws
  - Director/shareholder registry excerpts
- Proof of continuous employment:
  - Employment contract (international)
  - Recent pay stubs (3+ months)
  - Tax documents (T4 or foreign equivalent)
  - Employment verification letter from international employer
- International position documentation:
  - Job description of international role
  - Proof of managerial/specialized role status
  - Organizational chart showing international structure
- Canadian position documentation:
  - Job offer letter
  - Job description for Canadian position
  - Organizational chart (Canadian)
- Medical examination (if required)
- Police certificate (if applicable)

### Live Documents (Obtainable)
- Updated passport if close to expiration
- Current employment contract confirmation
- Canadian employment contract
- Updated pay stubs from international employer
- Canadian business registration certificates
- Any updated corporate structure documentation
- Medical exam (if expiring)
- Police certificate (if expiring)

### Strategic Documents
- Letter from international employer confirming:
  - Continuous employment details
  - Position title and level
  - Specialized knowledge description (if applicable)
  - Company operations in Canada plan
  - Applicant's unique expertise/value
  - Temporary assignment nature
  - Expected return plan
- Letter from Canadian employer confirming:
  - Need for applicant's expertise
  - Why specialized knowledge cannot be trained locally
  - Competitive compensation offer
  - Company operations scope in Canada
  - Long-term growth plans (demonstrating legitimacy)
- Canadian business documentation:
  - Business registration certificates
  - Proof of Canadian office/location (lease, ownership)
  - Organizational structure documentation
  - Business plan or operations outline
- International organizational documentation:
  - Corporate structure charts
  - Financial statements showing consolidated group
  - Corporate compliance certificates
  - Board resolutions authorizing transfer
- Applicant's international career documentation:
  - Promotion history showing advancement
  - Performance evaluations
  - Industry recognition/awards
  - Training certificates showing specialized expertise
  - Professional credentials
- Ties to home country:
  - Property ownership
  - Family residence proof
  - Employment timeline showing future return date
  - Recruitment/business plan showing Canadian assignment temporary nature

## Case Law References

### Key Federal Court Jurisprudence

**Corporate Relationship - Objective Verification Required (High Confidence)**
- Applicant must prove same corporate group relationship
- Ownership documentation required; not presumed
- Parent-subsidiary and affiliate relationships clearly defined
- Officer may request corporate records from both entities
- Fraud in corporate structure is refusal ground

**12-Month Continuous Employment - Strict Requirement (High Confidence)**
- Minimum 12 months is mandatory, not discretionary
- Continuous employment requirement strictly enforced
- Breaks > 3 months exceed tolerance
- Employment must be with same corporate group entity
- Applicant cannot waive requirement

**Managerial/Specialized Knowledge - Substantive Assessment (High Confidence)**
- Officer assesses whether position meets criteria
- Burden on applicant to document and substantiate
- Generalist positions not covered
- Specialization must be exclusive to employer, not industry-wide
- Comparable international position demonstrates capability

**Temporary Assignment - Intent Assessment (Medium Confidence)**
- Officer assesses whether assignment is genuinely temporary
- Termination of international employment may indicate permanent intent
- Family establishment in Canada is relevant factor
- No return plan is risk indicator
- But officer cannot impose unreasonable duration limit

**Economic Benefit Assessment (Medium Confidence)**
- ICT is exemption; benefit to Canada not formally required
- But officer may consider whether position creates Canadian employment
- Knowledge transfer benefit relevant to discretionary assessment
- Not same stringent requirement as "Significant Benefits" category

### Risk Assessment Impact

**High Risk Thresholds**
- Any corporate relationship documentation missing = document request mandatory
- Any employment gap > 3 months = verification required
- International position details inconsistent = clarification required
- No return plan articulated = intent assessment triggered

**Medium Risk Thresholds**
- Position description ambiguous = detailed job duties required
- Specialized knowledge claim unclear = substantiation required
- Canadian entity < 1 year old = legitimacy verification required
- International office not responsive = employment verification letter required

## Policy Code Mapping

### IRPA/IRPR References
- **R200(1)**: Base work permit eligibility
- **R204(1)(c)**: ICT exemption from LMIA
- **R204(2)(c)**: ICT specific requirements
- **R205**: Conditions on work permit validity

### Operational Manual (IP 16)
- **Chapter 16.4.3**: Intra-company transfer requirements
- **Section 16.4.3.1**: Corporate group relationship requirements
- **Section 16.4.3.2**: Continuous employment requirements
- **Section 16.4.3.3**: Managerial position criteria
- **Section 16.4.3.4**: Specialized knowledge criteria
- **Section 16.4.3.5**: Documentation requirements
- **Section 16.4.3.6**: Assessment procedures

### Corporate Structure Reference
- **Ownership Structure Types**: Parent-subsidiary, sibling subsidiaries, affiliates
- **Minimum Ownership**: ≥50% for affiliate status
- **Documentation Types**: Share certificates, articles, bylaws, tax returns

### Risk Badge System
- `ICT_CORPORATE_RELATIONSHIP_MISSING` - Corporate group relationship not proven
- `ICT_EMPLOYMENT_NOT_CONTINUOUS` - < 12 months or interrupted employment
- `ICT_POSITION_NOT_MANAGERIAL_SPECIALIST` - Position does not qualify
- `ICT_KNOWLEDGE_NOT_SPECIALIZED` - Specialized knowledge claim unsupported
- `ICT_CANADIAN_ENTITY_SUSPECT` - Canadian operating entity legitimacy questioned
- `ICT_INTERNATIONAL_POSITION_UNVERIFIED` - International position cannot be verified
- `ICT_TEMPORARY_INTENT_DOUBT` - Evidence of permanent settlement intent

## Verification Checklist

**Must Verify Before Approving**:
- [ ] Corporate relationship: Same corporate group with documentation
- [ ] Employment continuity: Minimum 12 months with same entity, no breaks > 3 months
- [ ] Managerial/specialist: Position meets one of two criteria with documentation
- [ ] International position: Current/recent employment status verified
- [ ] Canadian entity: Legitimate operating entity with active status
- [ ] Applicant qualifications: Background matches position requirements
- [ ] Temporary assignment: Return plan documented and credible
- [ ] Admissibility: Security, criminality, health, misrepresentation cleared

**High-Confidence Indicators of Legitimacy**:
- Current share certificates showing ownership structure
- Recent tax filings showing consolidated group
- Organizational charts from both international and Canadian entities
- Recent employment letter from international employer with company letterhead
- Recent pay stubs showing continuous salary
- Canadian business registration with active status and current address
- Canadian entity operating agreement showing parent company authorization
- Board resolutions from both entities approving transfer
- Detailed specialized knowledge documentation with examples
- Return plan letter from international employer confirming assignment timeline

## Subtypes

### Manager/Executive Transfer
- Supervises Canadian operations
- Decision-making authority in Canada
- Enhanced documentation of managerial role
- Likely longer-term but with explicit return plan

### Specialist/Technical Transfer
- Proprietary knowledge or unique expertise
- Implementation/training of systems/processes
- Knowledge transfer to Canadian staff
- Typically shorter-term assignment

## See Also

- [hard_eligibility.md](hard_eligibility.md) - General work permit requirements
- [IMP.md](IMP.md) - International Mobility Program overview
- [fraud_risk_flags.md](fraud_risk_flags.md) - Organizational fraud indicators
- [refusal_patterns.md](refusal_patterns.md) - Historical refusal reasons
- [risk_badges.json](risk_badges.json) - Risk classification system
