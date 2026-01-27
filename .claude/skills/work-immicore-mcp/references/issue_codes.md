# Work Permit Issue Code Classification

## Issue Code Structure

Format: `WORK_[CATEGORY]_[SPECIFIC_ISSUE]`

Categories:
- LMIA (L) - Labour Market Opinion issues
- EMPLOYER (E) - Employer-related issues
- APPLICANT (A) - Applicant capability/background issues
- INTENT (I) - Intent/ties/settlement issues
- ADMISSIBILITY (AD) - Admissibility grounds

---

## LMIA Issues (WORK_L_*)

### WORK_L_REQUIRED
**Description**: LMIA is required for position
**When Triggered**: Position does not fall under R201 exemptions
**Search Query**: kg_search(issue_code='WORK_L_REQUIRED', court='FC')
**Key Cases**: Cases establishing when LMIA mandatory
**Policy Reference**: R200(1), R201, Operation Manual OP 2

### WORK_L_NOT_OBTAINED
**Description**: LMIA has not been obtained at all
**When Triggered**: Job offer provided, no LMIA document submitted
**Search Query**: kg_search(issue_code='WORK_L_NOT_OBTAINED', court='FC')
**Impact**: Automatic refusal under R200
**Evidence Needed**: Valid LMIA from Service Canada

### WORK_L_NEGATIVE_ASSESSMENT
**Description**: Service Canada issued negative LMIA assessment
**When Triggered**: LMIA shows "negative" decision or "no opinion"
**Search Query**: kg_search(issue_code='WORK_L_NEGATIVE', court='FC')
**Impact**: Application cannot proceed without exemption
**Evidence Needed**: IMP exemption or new positive LMIA

### WORK_L_EXPIRED
**Description**: LMIA validity period has expired
**When Triggered**: Current date is after LMIA expiry date
**Search Query**: kg_search(issue_code='WORK_L_EXPIRED', court='FC')
**Impact**: LMIA no longer valid for work permit
**Evidence Needed**: New LMIA from Service Canada

### WORK_L_EMPLOYER_MISMATCH
**Description**: LMIA issued to different employer than job offer
**When Triggered**: Employer name differs between LMIA and job offer
**Search Query**: kg_search(issue_code='WORK_L_MISMATCH', court='FC')
**Impact**: LMIA authorization invalid for this application
**Evidence Needed**: Employer legal name confirmation

### WORK_L_POSITION_MISMATCH
**Description**: Job position differs between LMIA and job offer
**When Triggered**: Job title or duties differ from LMIA approval
**Search Query**: kg_search(issue_code='WORK_L_POSITION', court='FC')
**Impact**: Position not covered by LMIA assessment
**Evidence Needed**: Updated job offer matching LMIA position

### WORK_L_WAGE_DISCREPANCY
**Description**: Offered wage differs from LMIA-approved wage
**When Triggered**: Salary in job offer lower than LMIA approval
**Search Query**: kg_search(issue_code='WORK_L_WAGE', court='FC')
**Impact**: Job offer no longer matches LMIA conditions
**Evidence Needed**: Wage confirmation letter

### WORK_L_EXEMPTION_ELIGIBILITY
**Description**: Position may be exempt from LMIA under R201
**When Triggered**: Position matches TN, P-1, or other exemption category
**Search Query**: kg_search(issue_code='WORK_L_EXEMPT', court='FC')
**Resolution**: Document exemption category and eligibility
**Evidence Needed**: IMP documentation if applicable

---

## Employer Issues (WORK_E_*)

### WORK_E_LEGITIMACY
**Description**: Employer legitimacy concerns - may be fraudulent
**When Triggered**: Employer cannot be verified or has fraud history
**Search Query**: kg_search(issue_code='WORK_E_LEGIT', court='FC')
**Risk Level**: CRITICAL
**Evidence Needed**: Business registration, financial statements, references

### WORK_E_GENUINE_POSITION
**Description**: Job position may not be genuine
**When Triggered**: Job offer lacks detail or shows fabrication indicators
**Search Query**: kg_search(issue_code='WORK_E_GENUINE', court='FC')
**Risk Level**: HIGH
**Evidence Needed**: Job contract, work site documentation, employer details

### WORK_E_FRAUD_HISTORY
**Description**: Employer has history of work permit/LMIA fraud
**When Triggered**: Database search shows employer fraud record
**Search Query**: kg_search(issue_code='WORK_E_FRAUD', court='FC')
**Risk Level**: CRITICAL
**Resolution**: Applicant cannot proceed with this employer

### WORK_E_INCOMPLETE_VERIFICATION
**Description**: Employer cannot be fully verified
**When Triggered**: Contact information unreachable or records incomplete
**Search Query**: kg_search(issue_code='WORK_E_VERIFY', court='FC')
**Risk Level**: MEDIUM-HIGH
**Evidence Needed**: Third-party confirmation, employer documentation

### WORK_E_SHELL_COMPANY
**Description**: Employer operates as shell company or subsidiary
**When Triggered**: Employer has no real business operations or employees
**Search Query**: kg_search(issue_code='WORK_E_SHELL', court='FC')
**Risk Level**: HIGH
**Resolution**: Actual employer documentation required

### WORK_E_RECENT_REGISTRATION
**Description**: Employer recently registered with no track record
**When Triggered**: Business registered within 6 months of application
**Search Query**: kg_search(issue_code='WORK_E_RECENT', court='FC')
**Risk Level**: MEDIUM
**Evidence Needed**: Business plan, financial commitments, existing contracts

---

## Applicant Issues (WORK_A_*)

### WORK_A_CREDENTIALS_INSUFFICIENT
**Description**: Applicant qualifications below position requirements
**When Triggered**: Education/experience does not match job requirements
**Search Query**: kg_search(issue_code='WORK_A_CRED', court='FC')
**Risk Level**: HIGH
**Evidence Needed**: Education verification, references, capability letters

### WORK_A_CREDENTIALS_UNVERIFIED
**Description**: Applicant credentials cannot be verified
**When Triggered**: Credentials provided but institution cannot confirm
**Search Query**: kg_search(issue_code='WORK_A_UNVERIFIED', court='FC')
**Risk Level**: HIGH
**Evidence Needed**: Verified credentials (WES, EVA, or direct confirmation)

### WORK_A_EXPERIENCE_MISMATCH
**Description**: Work experience does not match job requirements
**When Triggered**: Claimed experience insufficient or not relevant
**Search Query**: kg_search(issue_code='WORK_A_EXP', court='FC')
**Risk Level**: MEDIUM-HIGH
**Evidence Needed**: Reference letters, employment records, skill assessment

### WORK_A_LANGUAGE_BARRIER
**Description**: Language skills insufficient for position
**When Triggered**: Position requires language fluency not demonstrated
**Search Query**: kg_search(issue_code='WORK_A_LANG', court='FC')
**Risk Level**: MEDIUM
**Evidence Needed**: Language test results, references

### WORK_A_CREDENTIAL_FRAUD
**Description**: Credentials appear forged or from unaccredited institution
**When Triggered**: Educational credentials fail authenticity check
**Search Query**: kg_search(issue_code='WORK_A_FRAUD', court='FC')
**Risk Level**: CRITICAL
**Resolution**: Application cannot proceed if fraud confirmed

### WORK_A_ADMISSIBILITY_ISSUE
**Description**: Applicant has admissibility concern (criminal, security, medical)
**When Triggered**: Criminal record, security concerns, or medical issues identified
**Search Query**: kg_search(issue_code='WORK_A_INADMIS', court='FC')
**Risk Level**: CRITICAL
**Resolution**: Clearance, waiver, or medical exam required

---

## Intent/Ties Issues (WORK_I_*)

### WORK_I_INTENT_TO_SETTLE
**Description**: Evidence suggests intent to settle permanently in Canada
**When Triggered**: Multiple indicators of settlement intent detected
**Search Query**: kg_search(issue_code='WORK_I_SETTLE', court='FC')
**Risk Level**: HIGH
**Evidence Needed**: Return plan, family ties abroad, property documentation

### WORK_I_WEAK_TIES
**Description**: Applicant has minimal ties to home country
**When Triggered**: No family, property, or employment at origin
**Search Query**: kg_search(issue_code='WORK_I_TIES', court='FC')
**Risk Level**: MEDIUM-HIGH
**Evidence Needed**: Family documentation, property proof, employment history

### WORK_I_FAMILY_IN_CANADA
**Description**: Spouse or dependent children already in Canada
**When Triggered**: Family members present in Canada
**Search Query**: kg_search(issue_code='WORK_I_FAMILY', court='FC')
**Risk Level**: HIGH
**Impact**: Creates presumption of intent to stay
**Evidence Needed**: Family separation plan, temporary arrangement documentation

### WORK_I_PREVIOUS_FAILED_PR
**Description**: Applicant has previous failed PR applications
**When Triggered**: Express Entry, sponsorship, or other PR app denied
**Search Query**: kg_search(issue_code='WORK_I_PR_FAIL', court='FC')
**Risk Level**: MEDIUM
**Evidence Needed**: Rebuttal showing genuine temporary work intent

### WORK_I_CANADIAN_PROPERTY
**Description**: Applicant owns property or long-term lease in Canada
**When Triggered**: Real estate purchased or 12+ month lease signed
**Search Query**: kg_search(issue_code='WORK_I_PROPERTY', court='FC')
**Risk Level**: HIGH
**Evidence Needed**: Explanation, sale plan, or lease termination

### WORK_I_NO_RETURN_PLAN
**Description**: No clear plan to return after work permit expires
**When Triggered**: Applicant cannot articulate return arrangements
**Search Query**: kg_search(issue_code='WORK_I_RETURN', court='FC')
**Risk Level**: MEDIUM-HIGH
**Evidence Needed**: Explicit return plan statement, job waiting at origin

### WORK_I_MULTIPLE_PERMITS
**Description**: Pattern of multiple consecutive work permits suggesting settlement
**When Triggered**: Applicant on third+ work permit with continuous renewal
**Search Query**: kg_search(issue_code='WORK_I_MULTI', court='FC')
**Risk Level**: MEDIUM
**Evidence Needed**: Specific temporary purpose for each permit

---

## Admissibility Issues (WORK_AD_*)

### WORK_AD_CRIMINAL_RECORD
**Description**: Applicant has criminal conviction
**When Triggered**: Criminal history identified
**Search Query**: kg_search(issue_code='WORK_AD_CRIM', court='FC')
**Risk Level**: CRITICAL
**Resolution**: Police certificate required; waiver if applicable

### WORK_AD_SECURITY_CONCERN
**Description**: Security concerns identified
**When Triggered**: Security agency referral or terrorism/espionage concerns
**Search Query**: kg_search(issue_code='WORK_AD_SEC', court='FC')
**Risk Level**: CRITICAL
**Resolution**: Security clearance required; waiver unlikely

### WORK_AD_MEDICAL_EXAM_REQUIRED
**Description**: Medical examination required but not completed
**When Triggered**: Applicant from certain countries or with medical history
**Search Query**: kg_search(issue_code='WORK_AD_MED', court='FC')
**Impact**: Application incomplete
**Evidence Needed**: IMM 1017 medical examination form

### WORK_AD_POLICE_CERT_REQUIRED
**Description**: Police certificate required but not provided
**When Triggered**: Residency in country requires certificate
**Search Query**: kg_search(issue_code='WORK_AD_POLICE', court='FC')
**Impact**: Application incomplete
**Evidence Needed**: Official police certificate from issuing country

### WORK_AD_MEDICAL_EXAM_FAILED
**Description**: Medical examination results show inadmissibility ground
**When Triggered**: Medical exam shows health condition creating danger
**Search Query**: kg_search(issue_code='WORK_AD_MED_FAIL', court='FC')
**Risk Level**: CRITICAL
**Resolution**: Medical waiver or treatment required

### WORK_AD_MISREPRESENTATION
**Description**: False or misleading statements in application
**When Triggered**: Contradiction between documents or statements
**Search Query**: kg_search(issue_code='WORK_AD_MISREP', court='FC')
**Risk Level**: CRITICAL
**Resolution**: Application cannot proceed if material misrepresentation found

### WORK_AD_HUMAN_TRAFFICKING
**Description**: Indicators of human trafficking or exploitation
**When Triggered**: Workplace abuse, wage theft, isolation, or trafficking indicators
**Search Query**: kg_search(issue_code='WORK_AD_TRAFFIC', court='FC')
**Risk Level**: CRITICAL
**Resolution**: Application refused; possible investigation

---

## Search Usage Examples

### Detective Agent
```
"Identify key issues in case, then search:
kg_top_authorities(issue_code='WORK_L_REQUIRED', court='FC', limit=5)
kg_search(issue_code='WORK_E_LEGIT', court='FC')
kg_search(issue_code='WORK_I_SETTLE', court='FC')
"
```

### Strategist Agent
```
"For each identified risk:
kg_search(issue_code='WORK_A_CRED', court='FC')
kg_top_authorities(issue_code='WORK_I_TIES', court='FC', limit=3)
Find cases where applicant successfully rebutted concern
"
```

### Verifier Agent
```
"Verify all cited case law:
For each case: caselaw_authority(citation='YYYY FC XXXX')
Confirm: is_good_law=true, cited_by_count >= 0
"
```

---

## Issue Code to Policy Mapping

| Issue Code | Policy Reference | Manual Section | Key Case Law |
|------------|------------------|----------------|--------------|
| WORK_L_* | R200(1), R201, R202 | OP 2 | caselaw_LMIA_* |
| WORK_E_* | R200(1), General law | OP 1, OP 3 | caselaw_employer_* |
| WORK_A_* | R200(1), S37-40 | OP 4, OP 5, OP 6 | caselaw_credential_* |
| WORK_I_* | R196-216 | OP 5 | caselaw_intent_* |
| WORK_AD_* | S36-S46, R55 | OP 4 | caselaw_inadmis_* |
