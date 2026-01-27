# Work Permit Document Requirements - Base Documents

所有工签申请都需要的通用文件。这些是必需的补充文件，**不管是哪种工签类别**。

## Category-Agnostic Base Documents

### 1. Identity & Travel Documents

#### Passport
**Extraction Fields**:
- Full name (must match all other documents)
- Passport number
- Issue date and expiration date
- Issuing country
- Biometric data page presence
- Signature page

**Validation Rules**:
- Must be valid for entire intended stay in Canada (6 months minimum)
- Must not be damaged or heavily marked
- Biographical page must be clear and legible
- Name must be consistent with other documents

#### Travel Documents
**Extraction Fields**:
- Document type (passport, travel permit, national ID)
- Validity period
- Authorization for international travel
- Any travel restrictions

**Validation Rules**:
- Must authorize travel to Canada
- Must be valid during entire application processing

---

### 2. Medical & Security Clearance

#### Medical Examination Report
**Extraction Fields**:
- Medical exam date
- Physician name and clinic
- Approved panel physician confirmation
- Health condition assessment
- Lab results (if any)
- Exam result (Pass/Fail/Refer)

**Validation Rules**:
- Must be from approved panel physician
- Must be current (typically < 1 year old)
- Must show "Pass" result
- No communicable diseases

#### Police Certificate
**Extraction Fields**:
- Issuing country/jurisdiction
- Certificate issue date
- Applicant name
- Requested purpose (work permit)
- Coverage period
- Certificate result
- Authentication details

**Validation Rules**:
- Must cover all countries of residence for 6+ months in last 10 years
- Must be certified true copy
- Expiry date must be within 3 months of application
- No serious criminal convictions

---

### 3. Financial Documents

#### Proof of Funds
**Extraction Fields**:
- Bank account statements (3 months)
- Account holder name
- Current balance
- Account type and number (partially masked)
- Supporting letters (if applicable)

**Validation Rules**:
- Must show sufficient funds to support stay
- Funds should appear stable/legitimate
- Account should be in applicant or sponsor name
- Recent activity should show reasonable deposits

#### Bank Letter
**Extraction Fields**:
- Bank letterhead and contact info
- Account holder name and number (masked)
- Account opening date
- Current balance
- Account status (active)
- Bank authorization signature

**Validation Rules**:
- Should be on official bank letterhead
- Should be addressed to IRCC
- Signature and date must be present
- Should be recent (within 30 days of application)

---

### 4. Biographical Documents

#### Curriculum Vitae / Resume
**Extraction Fields**:
- Full legal name
- Date of birth
- Nationality
- Contact information
- Employment history (chronological, 5-10 years)
- Education history
- Language proficiency
- Key skills and certifications
- References (optional)

**Validation Rules**:
- Must cover all periods for last 10 years (gaps explained)
- Dates must be consecutive with no major gaps
- Education must support job qualification
- Must be consistent with other documents

#### Personal Statement / Letter of Intent
**Extraction Fields**:
- Applicant name and signature
- Purpose of application
- Duration of intended stay
- Post-graduation/post-employment plans
- Ties to home country (economic, family, social)
- Why Canada for this work
- Commitment to comply with conditions

**Validation Rules**:
- Must be in English or French
- Must clearly state intention to return home
- Must address ties to country of origin
- Must not show dual intent (for temporary permits)
- Should be personalized (not generic template)

---

### 5. Relationship & Dependent Documents

#### Dependents Declaration
**Extraction Fields**:
- Dependent name, age, and relationship
- Dependent location
- Dependency status
- Dependent's immigration status

**Validation Rules**:
- All dependents must be declared
- Must specify if accompanying or not
- Non-accompanying dependents need medical clearance
- Must include dependent medical exams if required

---

### 6. Supporting Evidence

#### Employment/Education Verification
**Extraction Fields**:
- Employer/institution letterhead
- Verification of employment/study period
- Job title / program name
- Relevant dates
- Contact person and phone
- Official seal/signature

**Validation Rules**:
- Must be on official letterhead
- Must be directly from employer/institution
- Must confirm applicant's role and dates
- Should include contact verification

#### Reference Letters
**Extraction Fields**:
- Referee name and title
- Organization and position
- Relationship to applicant
- Specific examples of competence
- Duration of relationship
- Contact information

**Validation Rules**:
- Should be on official letterhead (if from institution)
- Must be dated and signed
- Referee should be in position of authority
- Should provide specific examples (not generic)
- Should be recent (< 1 year old)

---

### 7. Language Proficiency

#### Language Test Results
**Extraction Fields**:
- Test type (IELTS, TOEFL, NCLC, TEF, etc.)
- Test date
- Test report form number
- Listening/Reading/Writing/Speaking scores
- Overall band or score
- Report validity date

**Validation Rules**:
- Test must be from approved agency
- Test date must be recent (typically < 2 years)
- Must meet minimum score requirements
- Report must be authentic (verified through test provider)

---

## Quality Assessment Framework

| Rating | Criteria |
|--------|----------|
| **5 - Excellent** | Original, certified, recent, complete information |
| **4 - Good** | Authentic copies, mostly complete, minor gaps acceptable |
| **3 - Acceptable** | Certified true copies, core info present, some gaps |
| **2 - Problematic** | Unclear copies, missing sections, credibility concerns |
| **1 - Unacceptable** | Forged, heavily redacted, incomplete, unreliable |

---

## Document Gathering Strategy

### Baseline (Must Have)
- Passport
- Police certificate
- Medical exam
- Curriculum vitae
- Personal statement

### Live (Obtainable)
- Employment verification letter
- Bank letter
- Language test results

### Strategic (Recommended)
- Reference letters
- Detailed work contract
- Employer company profile
- Financial documents (3-month statements)

---

## Red Flags During Document Review

⚠️ Forged or altered documents
⚠️ Multiple name variations without explanation
⚠️ Gaps in employment/education history
⚠️ Police certificate > 3 months old
⚠️ Medical exam failing result
⚠️ Inconsistent information across documents
⚠️ Documents in unsupported languages without translation
⚠️ Criminal record not disclosed
