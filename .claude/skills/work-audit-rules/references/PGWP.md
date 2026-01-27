# Post-Graduation Work Permit (PGWP) Audit Rules

**Source Data**: pgwp-official-policy-2026.md, DETECTIVE_FINDINGS_SUMMARY.md
**Last Updated**: January 2026
**Refusal Rate**: 25-35% (中高风险 per Detective investigation)
**Fraud Risk Level**: Medium (假学位、DLI伪造)

## Definition & Eligibility

Post-Graduation Work Permit is a temporary work permit issued to international students who have graduated from a Designated Learning Institution (DLI) in Canada.

### ALL Four Mandatory Criteria (Source: IRCC Official Policy)

ALL of the following must be satisfied - applicant fails if ANY criteria not met:

#### 1. Education Credential Requirement (Source: pgwp-official-policy-2026.md)

**Eligible Programs** (from PGWP-eligible DLI):
- ✅ Bachelor's degree
- ✅ Master's degree
- ✅ Doctoral degree
- ✅ Other university programs (diploma, certificate)
- ✅ College programs (polytechnic)
- ✅ Non-university programs (if 8+ months)
- ✅ Flight school (+ Canadian pilot license or instructor rating + job offer)

**Program Duration Requirements**:
- Minimum: 8 months (minimum 24 weeks of actual instruction)
- Quebec exception: 900 hours minimum
- Cannot be entirely online (COVID-19 exceptions ended)

**Ineligible Programs** (AUTOMATIC REFUSAL):
- ❌ English/French language courses only
- ❌ General interest courses
- ❌ ESL/Language proficiency programs
- ❌ Non-degree programs from non-DLI schools
- ❌ Programs at non-Canadian institutions
- ❌ Programs >50% completed via distance learning

**Language & Field of Study Requirements** (Effective Nov 1, 2024):
- Bachelor's/Master's/Doctoral: CLB 7 (if app on/after Nov 1, 2024)
- College/Polytechnic: CLB 5 (if app on/after Nov 1, 2024)
- Flight school: NO language requirement
- Exemption: NO requirement if study permit applied before Nov 1, 2024

#### 2. Study Status Requirement

- **Full-time student status**: Must maintain throughout each semester
- **Exception**: Part-time study acceptable in final semester only
- **Verification**: Through official student records from institution

#### 3. Application Timing Requirement (180-Day Window - CRITICAL)

**NOT 18 months - this is a common refusal cause**
- **Deadline**: Apply within 180 days of program completion confirmation
- **Start Date**: When school confirms graduation (official date)
- **End Date**: 180 days later (approximately 6 months)
- **Grace Period**: Additional 90 days if study permit expires before 180 days (restore status + apply)
- **Absolute Rule**: Missing this deadline = automatic ineligibility
- **Port of Entry**: Cannot apply at ports of entry (as of June 21, 2024)

#### 4. Study Permit Validity Requirement

- **Requirement**: Must have held valid study permit at some point during 180-day post-graduation window
- **Does Not Need**: Study permit to be held at time of PGWP application
- **Exception**: Can restore status if expired, then apply for PGWP

### Validity Period & Passport Rule

- **PGWP Validity** (per program length):
  - 8 months to <2 years: Up to program length
  - 2 years or longer: Up to 3 years
  - Master's degree: Up to 3 years (as of Feb 15, 2024)
  - Multiple programs: Combined length (if each eligible)

- **Passport Expiry Rule** (CRITICAL):
  - Permit expires with passport, whichever comes first
  - Can extend on paper after obtaining new passport

### DLI Verification (Source: pgwp-official-policy-2026.md)

**What is DLI?**
- Definition: School approved by provincial/territorial government to host international students

**Critical Point**:
- NOT all programs at a DLI are PGWP-eligible
- Must verify: (1) DLI status, (2) Program PGWP eligibility

**How to Verify**:
1. Visit: DLI list on canada.ca
2. Select province/territory
3. Search by institution name
4. Verify "Offers PGWP-eligible programs" = Yes
5. Cross-reference specific program eligibility

**2026 Update** (Effective Jan 1, 2026):
- Graduate degree students at public institutions: PALs/TALs NO LONGER required
- Still required: Letters of acceptance, standard documentation

### One-Time Only Rule

**Ineligibility Factor**: Cannot get PGWP if already had one from earlier program
- Each graduate receives only one PGWP per lifetime
- Subsequent eligible programs: Cannot apply for second PGWP

### Core Eligibility Criteria (Hard Requirements)

1. **Valid Study Permit During Graduation**
   - Maintained status as international student
   - DLI enrollment confirmed by institution
   - No work permit while studying (unless authorized)

2. **Admissibility**
   - No grounds for inadmissibility
   - Security and criminality clearance
   - Medical examination if required
   - No misrepresentation in application

3. **Temporary Intent**
   - Clear commitment to leave Canada upon permit expiration
   - PGWP work not to settle permanently

### Duration Calculation
- PGWP validity = equal to program length (minimum 8 months, maximum 3 years)
- Programs 2 years or longer: Up to 3 years
- Master's degree: Up to 3 years (as of Feb 15, 2024)
- Multiple eligible programs: Combined length (if each meets eligibility)
- Passport expiry rule: Permit expires with passport, whichever comes first

### 180-Day Application Window (CRITICAL)
**NOT 18 months - this is a common misunderstanding**
- Window starts: Date graduation is confirmed by school
- Window ends: 180 days later (approximately 6 months)
- Deadline is absolute: Apply within this window or lose eligibility
- Grace period: Additional 90 days if study permit expires before 180 days (by restoring status)
- Note: Cannot apply at ports of entry (as of June 21, 2024)

## Risk Assessment Framework

### Category-Specific Risk Patterns

#### Pattern: FAKE_GRADUATION
- **Severity**: CRITICAL
- **Definition**: Applicant claims graduation but institution has no record
- **Indicators**:
  - Institution denies enrollment
  - Graduation date inconsistent with enrollment records
  - Fake diploma or forged documents
  - Institution not in IRCC DLI database
  - Program duration claims inconsistent
- **Assessment Method**:
  - DLI registry verification (mandatory)
  - Direct institutional contact
  - Diploma authentication
  - Transcript verification through registrar
- **Recovery**: None (automatic refusal)

#### Pattern: INELIGIBLE_PROGRAM
- **Severity**: HIGH
- **Definition**: Study program does not meet PGWP eligibility requirements
- **Indicators**:
  - ESL/language training only
  - Part-time study (< 10 hrs/week)
  - Non-credential program
  - Continuing education only
  - Online/distance learning (if distance learning exemption period expired)
  - Program < 8 months duration
- **Assessment Method**:
  - Program code verification
  - DLI database cross-reference
  - Curriculum documentation review
  - Ministry of Education equivalency check
- **Recovery**: Reapply if took eligible subsequent program after eligible graduation

#### Pattern: DLI_STATUS_EXPIRED
- **Severity**: CRITICAL
- **Definition**: Institution was DLI at time of study, but status revoked before graduation
- **Indicators**:
  - DLI delisted by IRCC
  - Institution lost accreditation
  - Credentials issued by non-DLI
  - Extended leave of absence before graduation
- **Assessment Method**:
  - DLI database status check for period of study
  - Timeline verification
  - Institutional status change history
- **Recovery**: None if revocation occurred before graduation

#### Pattern: GRADUATION_TIMING_VIOLATION (180-Day Window Exceeded)
- **Severity**: HIGH (8-12% refusal rate per pgwp-risk-analysis-2026)
- **Definition**: Application submitted outside 180-day eligibility window
- **Indicators**:
  - Application > 180 days post-graduation confirmation
  - Study permit expired before application filed
  - Extended travel or study delay
  - Calculation error on application deadline
- **Assessment Method**:
  - Date comparison (graduation confirmation vs. PGWP receipt)
  - Study permit expiry date verification
  - Timeline explanation letter
  - Grace period verification (if study permit expired < 180 days)
- **Recovery**: Grace period if study permit expired within 180 days
  - Can restore study status
  - Then apply for PGWP within extended window
  - Requires explanation letter

#### Pattern: WORK_HISTORY_INCONSISTENCY
- **Severity**: MEDIUM
- **Definition**: Work undertaken during study with insufficient work permit authorization
- **Indicators**:
  - On-campus employment without authorization
  - Off-campus work during restricted periods
  - Self-employment during study
  - Employer-specific work permit overlap
  - Work exceeding authorized hours
- **Assessment Method**:
  - Study permit work authorization review
  - Employment timeline cross-reference
  - Employer verification
- **Recovery**: Explanation letter, employer confirmation

#### Pattern: PROGRAM_COMPLETION_FRAUD
- **Severity**: CRITICAL
- **Definition**: Applicant did not actually complete program requirements
- **Indicators**:
  - Failed courses claimed as passed
  - Incomplete thesis/capstone
  - Required practicum not completed
  - Insufficient credits toward degree
  - Diploma issued in error or recalled
- **Assessment Method**:
  - Transcript verification (official)
  - Registrar confirmation
  - Academic record audit
- **Recovery**: None (requires actual graduation)

#### Pattern: TEMPORARY_RESIDENT_STATUS_LAPSE
- **Severity**: CRITICAL
- **Definition**: Study permit expired or was cancelled before graduation/application
- **Indicators**:
  - Study permit expired before graduation
  - Permit cancelled due to non-compliance
  - Out-of-status period before PGWP application
  - No valid status maintained
- **Assessment Method**:
  - Timeline comparison
  - Status history verification
  - Explicit continuity confirmation
- **Recovery**: None (requires in-status graduation)

## Common Refusal Patterns

### R205(1) - Refusal Decision Codes

1. **Not a designated learning institution**
   - Institution not DLI at time of application
   - Prior delisting occurred
   - Institution revoked status
   - Applicant studied at non-DLI

2. **Program duration insufficient**
   - Completed program < 8 months
   - Part-time did not meet full-time threshold
   - Insufficient course load
   - Credits below minimum

3. **Ineligible program type**
   - Language/ESL program only
   - Preparatory program not eligible
   - Continuing education without credential
   - Online-only without prior exemption

4. **Graduation not established**
   - Institutional records show non-completion
   - Diploma revoked or never issued
   - Academic standing insufficient
   - Conditions of graduation not met

5. **Application timing**
   - Submitted > 180 days post-graduation
   - Study permit expired before application
   - Continuity of status broken

6. **Program start date misalignment**
   - Post-secondary study began after international student status
   - Study permit issued after program commencement
   - No valid study permit overlap

## Document Checklist

### Baseline Documents (Required)
- Valid passport (must be valid for duration of PGWP)
- Original study permit (if still held)
- Proof of graduation:
  - Official diploma or degree certificate
  - Official transcript showing completion
  - Letter from institution confirming graduation
- Medical examination (if required by IRCC)
- Police certificate (if applicable)
- Proof of compliance with study permit conditions during studies

### Live Documents (Obtainable)
- Official credentials assessment (WES, EVA, if applicable)
- Work history documentation (if worked during study)
- Proof of maintenance of status (if study permit expired)
- Updated passport if close to expiration
- Employment offer letter (optional but helpful)

### Strategic Documents
- Letter from institution confirming:
  - Program eligibility for PGWP
  - Graduation date
  - Full-time status maintained
  - DLI status during period of study
- Official program outline showing duration and structure
- Proof of financial support during studies
- Employment timeline showing post-graduation job search

## Case Law References

### Key Federal Court Jurisprudence

**Genuine Program Completion (High Confidence)**
- Courts defer to institution graduation records
- Diploma is prima facie evidence of completion
- Institutional verification is determinative
- Fraud claims require compelling evidence

**DLI Status Verification (High Confidence)**
- Officer must verify institution was DLI at time of study
- Not current DLI status alone
- Historical database records are authoritative
- Burden on IRCC to demonstrate status loss

**Program Duration Calculation (High Confidence)**
- Days count: from first day of study to graduation
- Part-time study: officer must calculate equivalent full-time weeks
- Online study: pre-2023 exemption applied, post-2023 case-by-case
- Overlapping programs: only one program counts toward maximum

**Application Timing (High Confidence)**
- "Following graduation" interpreted as 180 days post-graduation
- Permissive interpretation for administrative delays
- But interpretation becomes strict for > 180 days
- Study permit expiry breaks timing chain

**Ineligibility Irreversibility (Medium Confidence)**
- Once deemed ineligible (e.g., ineligible program), may reapply
- But only if new eligible graduation obtained
- Cannot appeal ineligibility if facts accurate
- Officer discretion not engaged once objective criteria fail

### Risk Assessment Impact

**High Risk Thresholds**
- > 6 months post-graduation before application = document request likely
- Missing institutional confirmation letter = near-automatic delay
- Any DLI status ambiguity = verification delay (1-2 months typical)

**Medium Risk Thresholds**
- Program exactly 8-10 months duration = officer manual calculation required
- Part-time study period during DLI enrollment = requires breakdown
- Overseas completion of online final courses = assessment discretion engaged

## Policy Code Mapping

### IRPA/IRPR References
- **R200(3)(c)**: Work permit eligibility (base)
- **R205(1)**: PGWP eligibility conditions (specific)
- **R205(1)(a)**: Graduation from DLI requirement
- **R205(1)(b)**: Program duration requirement
- **R205(1)(c)**: Application timing requirement
- **R205(1)(d)**: Admissibility requirement

### Operational Manual (IP 16)
- **Chapter 16.2**: PGWP eligibility and assessment
- **Section 16.2.1**: DLI definition and verification
- **Section 16.2.2**: Program type eligibility matrix
- **Section 16.2.3**: Duration calculation methodology
- **Section 16.2.4**: Application processing steps
- **Section 16.2.5**: Document verification procedures

### Risk Badge System
- `PGWP_FAKE_GRADUATION` - Institutional verification fails
- `PGWP_INELIGIBLE_PROGRAM` - Program type does not qualify
- `PGWP_DLI_STATUS_UNKNOWN` - Institution status ambiguous
- `PGWP_GRADUATION_TIMING_VIOLATION` - Outside 180-day window
- `PGWP_WORK_AUTH_VIOLATION` - Unauthorized work during study
- `PGWP_PROGRAM_FRAUD` - Program completion claimed but unverified

## Verification Checklist

**Must Verify Before Approving**:
- [ ] DLI registry: Institution was DLI at graduation date
- [ ] Institutional confirmation: Program completion verified
- [ ] Program eligibility: Duration, credential level, field of study
- [ ] Application timing: Within 180 days (or justified exception)
- [ ] Admissibility: Security, criminality, health, misrepresentation
- [ ] Status maintenance: Study permit maintained until graduation
- [ ] Work authorization: No work violations during study period

**High-Confidence Indicators of Legitimacy**:
- Official transcript from registrar showing degree completion
- Diploma issued on institution letterhead with registrar signature
- DLI registry confirmation document
- Study permit documentation spanning full program duration
- Employment history post-graduation showing actual job entry

## See Also

- [hard_eligibility.md](hard_eligibility.md) - General work permit requirements
- [fraud_risk_flags.md](fraud_risk_flags.md) - Document fraud indicators
- [refusal_patterns.md](refusal_patterns.md) - Historical refusal reasons
- [risk_badges.json](risk_badges.json) - Risk classification system
