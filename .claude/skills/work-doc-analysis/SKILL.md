---
name: work-doc-analysis
description: Document extraction and summarization for work permit audit evidence
category: audit
app_type: work
version: 1.0.0
---

# Work Permit Document Analysis

Extraction and assessment rules for work permit application documents.

## Document Classification

### Category 1: Baseline Documents (Must-Have)
Essential documents for any work permit application:
- Valid passport
- Job offer letter (original, signed)
- LMIA (if required)
- Educational credentials documentation
- Work experience letters/references

### Category 2: Supporting Documents
Documents that strengthen the application:
- Medical examination (IMM 1017)
- Police certificate
- Financial documents (bank statements, tax returns)
- Family information forms
- Travel history

### Category 3: Strategic Documents
Documents that address specific risk factors:
- Credential verification letters (WES, EVA)
- Professional reference letters
- Employer company information
- Employment contract
- Workplace safety certification

## Key Document Extraction Rules

### Job Offer Letter
**What to extract:**
- Employer legal name and registration
- Job title and duties description
- Start date and duration
- Salary/wage and payment frequency
- Working hours and location
- Signature date and authorized representative

**Red flags:**
- Undated or unsigned
- Generic duties description
- No specific start date
- Wages below market rate
- Inconsistencies with LMIA

### LMIA Document
**What to extract:**
- Service Canada file number
- Employer name (must match offer)
- Job title and NOC code
- Position duties and requirements
- Salary and benefits
- LMIA decision and validity dates
- Any conditions or limitations

**Red flags:**
- Expired LMIA
- Different employer name
- Negative assessment
- Position title mismatch
- Salary discrepancies

### Educational Credentials
**What to extract:**
- Institution name and country
- Credential type (degree, diploma, certificate)
- Field of study
- Graduation date
- Verification method (original, certified, WES)

**Validation:**
- Confirm institution is accredited
- Verify credential is legitimate
- Match credentials to job requirements
- Note any credential gaps

### Work Experience
**What to extract:**
- Employer name and industry
- Job title and duration
- Key responsibilities
- Reference contact information
- Relevance to current position

**Validation:**
- References must be verifiable
- Experience must match job requirements
- Gaps in employment explained
- Duties must match position requirements

## Evidence Assessment Matrix

| Document | Baseline | Supporting | Impact | Weakness |
|----------|----------|-----------|--------|----------|
| Passport | Required | - | Identity confirmation | Expired/invalid |
| Job Offer | Required | - | Employment verification | Unsigned/generic |
| LMIA | Required* | - | Labour market validation | Missing/negative |
| Education | Required | - | Credential verification | Unverified |
| Work History | Required | - | Experience confirmation | Gaps/vague |
| Medical Exam | - | Conditional | Health clearance | Incomplete |
| Police Cert | - | Conditional | Security clearance | Missing |
| Employer Info | - | Supporting | Company legitimacy | Unverifiable |
| Credentials | - | Strategic | Credential validation | None/weak |
| Reference Letters | - | Strategic | Experience corroboration | Generic |
| Employment Contract | - | Strategic | Terms clarification | Inconsistencies |
| Financial Docs | - | Supporting | Financial capacity | Insufficient funds |

*If required by LMIA or IMP status

## Document Quality Assessment

### Authenticity Verification
- Document language and formatting consistent
- Official seals/signatures present
- Metadata appropriate to date
- Credential verification service confirmation
- Reference contact verification

### Completeness Check
- All required fields completed
- Information consistent across documents
- No material gaps or omissions
- Supporting documentation adequate

### Consistency Analysis
- Information matches across documents
- Dates/timelines consistent
- Job descriptions align
- Salary/wages consistent
- Employer details match

## Red Flag Document Patterns

### Forged/False Documents
- Passport with suspicious alterations
- Job offer using template language
- Credentials from unaccredited institution
- Inconsistent document styles
- Metadata inconsistencies

### Fraud Indicators
- Multiple gaps in documentation
- Discrepancies between documents
- Missing supporting documentation
- Inconsistent applicant information
- Employer information unverifiable

### Intent Manipulation
- No employment contract
- Vague job duties
- Temporary/casual framing despite permanent offer
- No workplace details
- No employer contact information

## Document Strength Rating

### Excellent (5/5)
- Original signed documents
- Verified credentials
- Consistent information
- Complete documentation
- Professional quality

### Good (4/5)
- Clear certified copies
- Mostly verifiable
- Minor inconsistencies resolved
- Complete with minor gaps
- Professional appearance

### Adequate (3/5)
- Legible copies
- Verifiable information
- Some inconsistencies
- Notable gaps
- Acceptable quality

### Weak (2/5)
- Questionable authenticity
- Unverifiable information
- Significant inconsistencies
- Multiple gaps
- Poor quality

### Insufficient (1/5)
- Likely forged
- Unverifiable
- Major discrepancies
- Critical missing documents
- Suspect authenticity

## Strategic Document Gathering

### For Credential Weakness
- Credential verification from WES/EVA
- Professional reference letters
- Work history documentation
- Additional qualifications proof
- Skill assessment letters

### For Intent Concerns
- Family documentation abroad
- Property/asset proof at origin
- Employment history in home country
- Return plan statement
- Travel history analysis

### For Employer Concerns
- Employer business registration
- Financial statements
- LMIA compliance history
- Third-party business verification
- Industry reference letters

### For Wage Concerns
- Employment contract with wage details
- Prevailing wage rate documentation
- Industry wage comparison
- Non-monetary benefit documentation
- Written wage guarantee letter

## See Also

### Core References
- [extraction_schema.json](references/extraction_schema.json) - Document field mapping
- [document_types.md](references/document_types.md) - Detailed document descriptions
- [validation_rules.md](references/validation_rules.md) - Verification procedures
- [document_requirements_base.md](references/document_requirements_base.md) - Base document requirements
- [category_specific_requirements.md](references/category_specific_requirements.md) - Category-specific requirements

### Evidence Standards (Phase 5)
- [evidence_standards.md](references/evidence_standards.md) - A/B/C/D evidence grading system
- [evidence_weight_matrix.json](references/evidence_weight_matrix.json) - Evidence weight by category
- [evidence_sufficiency.md](references/evidence_sufficiency.md) - Evidence sufficiency scoring
