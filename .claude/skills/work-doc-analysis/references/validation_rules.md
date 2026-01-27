# Work Permit Document Validation Rules

## Baseline Document Validation

### Job Offer Letter Validation

**Check 1: Authenticity**
- [ ] Original signed document (not photocopy)
- [ ] On official employer letterhead
- [ ] Signature of authorized representative
- [ ] Date of signature is recent (within 6 months)
- [ ] No visible alterations or white-out

**Check 2: Completeness**
- [ ] Employer legal name provided
- [ ] Employer address provided
- [ ] Job title specific and clear
- [ ] Job duties detailed and substantive
- [ ] Start date specified
- [ ] Employment duration or end date
- [ ] Salary/wage amount and frequency
- [ ] Working location specified

**Check 3: Consistency**
- [ ] Job title matches LMIA position
- [ ] Duties match LMIA description
- [ ] Salary aligns with LMIA rate
- [ ] Employer name matches LMIA
- [ ] Location matches LMIA jurisdiction

**Check 4: Reasonableness**
- [ ] Salary meets provincial minimum wage
- [ ] Salary meets LMIA prevailing rate
- [ ] Salary reasonable for industry/region
- [ ] Duties realistic for stated position
- [ ] Start date is reasonable (within 3-6 months)

**Validation Outcome**:
- PASS: All checks met
- PASS_WITH_CONDITION: Minor issues (e.g., start date 9 months away)
- FAIL: Critical issues (unsigned, missing LMIA match)

### LMIA Validation

**Check 1: Authenticity**
- [ ] Official Service Canada document format
- [ ] Contains Service Canada file number
- [ ] Contains official signatures/seals
- [ ] No alterations or tampering visible
- [ ] Verifiable through Service Canada

**Check 2: Current Status**
- [ ] Decision is POSITIVE (not negative/withdrawn)
- [ ] Validity period has not expired
- [ ] Date of validity is clear
- [ ] LMIA issued within last 2 years

**Check 3: Match to Application**
- [ ] Employer name on LMIA matches offer letter
- [ ] Position title on LMIA matches offer letter
- [ ] Number of positions includes applicant position
- [ ] Province/location matches work location
- [ ] Applicant name matches job offer

**Check 4: Completeness**
- [ ] Service Canada file number present
- [ ] Decision and decision date clear
- [ ] Validity start and end dates clear
- [ ] Employer and position information complete
- [ ] Any conditions or restrictions noted

**Validation Outcome**:
- PASS: All checks met, strong LMIA
- PASS_WITH_CONDITION: Minor inconsistencies (resolved in offer)
- FAIL: LMIA missing, negative, or expired

### Educational Credentials Validation

**Check 1: Authenticity**
- [ ] Official document from institution
- [ ] Not from diploma mill or unaccredited school
- [ ] Date appears legitimate
- [ ] Consistent with institutional style
- [ ] Signature/seal present if required
- [ ] Can be independently verified

**Check 2: Relevance**
- [ ] Credential level appropriate for position
- [ ] Field of study matches job requirements
- [ ] Graduation date is in past
- [ ] Education appears to prepare for role
- [ ] No unexplained time gaps after graduation

**Check 3: Verification**
- [ ] Institution exists and is accredited
- [ ] Credential type is legitimate
- [ ] Field of study is recognized
- [ ] If needed: credential verification letter obtained
- [ ] Equivalency determined if foreign credential

**Check 4: Sufficiency**
- [ ] Education meets job requirements
- [ ] Combined with experience, adequately qualified
- [ ] Certification current (if applicable)
- [ ] Language qualifications demonstrated

**Validation Outcome**:
- PASS: Strong credentials for position
- PASS_WITH_CONDITION: Meets minimum, but lacks specialized training
- FAIL: Below requirements, false credential, unverifiable

### Work Experience Validation

**Check 1: Completeness**
- [ ] Previous employer name provided
- [ ] Job title provided
- [ ] Employment dates provided (start and end)
- [ ] Key duties described
- [ ] Reference contact provided
- [ ] Reference contact information correct

**Check 2: Relevance**
- [ ] Experience matches new job requirements
- [ ] Duties demonstrate capability
- [ ] Experience level appropriate for position
- [ ] Career progression logical
- [ ] No major gaps unexplained

**Check 3: Verification**
- [ ] Reference person can be contacted
- [ ] Reference person confirms employment
- [ ] Dates verified
- [ ] Duties confirmed
- [ ] Performance assessment positive

**Check 4: Documentation**
- [ ] Written reference letter provided
- [ ] If possible: employment contract/letter
- [ ] If available: performance evaluations
- [ ] LinkedIn profile confirms employment
- [ ] Tax documents confirm employment

**Validation Outcome**:
- PASS: Verified experience, strong credentials
- PASS_WITH_CONDITION: Experience relevant but difficult to verify
- FAIL: No verification possible, experience insufficient

### Passport Validation

**Check 1: Validity**
- [ ] Passport valid on application date
- [ ] Passport valid for duration of work permit
- [ ] Expiry date is future date
- [ ] Minimum 6 months validity remaining

**Check 2: Authenticity**
- [ ] Document appears genuine
- [ ] No visible alterations
- [ ] All pages present and legible
- [ ] Security features present
- [ ] Biometric information consistent

**Check 3: Identity Consistency**
- [ ] Name matches other documents
- [ ] Date of birth matches other documents
- [ ] Signature consistent with application
- [ ] Photo is recent and recognizable

**Check 4: History Review**
- [ ] Previous visas showing travel pattern
- [ ] No visa refusals noted
- [ ] Multiple entries/exits to Canada logical
- [ ] Country residence history clear

**Validation Outcome**:
- PASS: Valid, authentic passport
- PASS_WITH_CONDITION: Minor inconsistencies explained
- FAIL: Expired, altered, or inconsistent

## Conditional Document Validation

### Medical Examination Validation
- [ ] Examination within 12 months
- [ ] Conducted by panel physician
- [ ] Form IMM 1017 (or equivalent) completed
- [ ] All sections filled out
- [ ] Result is Approved or acceptable
- [ ] Vaccination records current
- [ ] No unreported medical conditions

### Police Certificate Validation
- [ ] Certificate for each country of residence (6+ months)
- [ ] Issued by official government body
- [ ] Recent (within 3-6 months preferred)
- [ ] Result is Clear or acceptable
- [ ] Any noted issues explained
- [ ] Applicant name clearly identified

## Cross-Document Consistency Checks

### Information Consistency
```
✓ All documents show consistent:
  - Applicant legal name
  - Date of birth
  - Contact information (address, phone, email)
  - Employment history dates
  - Education/credential information
```

### Timeline Consistency
```
✓ Dates make sense:
  - Education completed before work history
  - Work history aligns with stated experience
  - Current employment is recent
  - No employment gaps unexplained
  - Passport stamps show travel pattern
```

### Story Consistency
```
✓ Application narrative makes sense:
  - Education prepares for job
  - Experience demonstrates capability
  - Current position is natural next step
  - Tie to Canada through job is primary
  - Plans to return are credible
```

## Red Flag Assessment

### Critical Red Flags (Fail)
- Document appears forged
- Material information is false
- Required document missing
- LMIA negative or missing (if required)
- Passport expired or invalid
- Criminal record undisclosed
- Medical/police clearance not obtained

### High Red Flags (Conditional)
- Significant inconsistencies between documents
- Unverifiable credentials
- Employment history gaps
- Multiple document authentication concerns
- Recent document creation
- Weakness in employer legitimacy

### Medium Red Flags (Address)
- Minor document inconsistencies
- Some documents difficult to verify
- Credential from non-English institution
- Recent job offer (short notice)
- First-time work permit applicant
- Minimal work experience

## Validation Workflow

### Phase 1: Document Receipt
1. Verify all required documents received
2. Check document count and naming
3. Identify missing documents
4. Schedule supplementary requests if needed

### Phase 2: Individual Document Validation
1. Check each document authenticity
2. Verify completeness of information
3. Extract key data fields
4. Flag individual red flags

### Phase 3: Cross-Document Consistency
1. Compare information across documents
2. Check timeline for logic
3. Verify identity consistency
4. Assess narrative coherence

### Phase 4: Risk Assessment
1. Rate overall document package strength
2. Identify high-risk areas
3. Recommend supplementary documentation
4. Assess fraud risk

### Phase 5: Report Generation
1. Summarize validation findings
2. List any document deficiencies
3. Recommend document improvements
4. Provide overall assessment

## Validation Output Format

```
DOCUMENT VALIDATION REPORT

Required Documents:
[✓] Passport - Valid, expires 2028
[✓] Job Offer - Signed, complete, matches LMIA
[✓] LMIA - Positive, expires 2026
[✓] Education - Bachelor's, verified by WES
[✓] Work Reference - Verified, strong recommendation

Consistency Check:
[✓] Names consistent across documents
[✓] Employment dates align
[✓] Education matches job requirements

Overall Assessment: STRONG
- All required documents present and valid
- No material inconsistencies
- Credentials appropriate for position
- No fraud indicators detected
- Ready for processing

Recommendations:
- None - package is complete and strong
```
