# Submission Letter Template (Work Permit)

Template for generating RCIC cover letters for work permit submissions.

## Reference

This template is derived from `work-workflow/submission_letter_template.md` and adapted for automated generation.

## Purpose

The submission letter accompanies the work permit application package submitted to IRCC. It provides:
- Professional cover from RCIC perspective
- Application overview and category
- Document index
- Proactive addressing of potential concerns

## Letter Structure

### Header

```
[Date]

Immigration, Refugees and Citizenship Canada
[Appropriate Processing Centre based on application type]

Re: Work Permit Application - [Category: LMIA/PGWP/ICT/IMP/OWP/PNP]

Applicant: {applicant_full_name} (DOB: {applicant_dob}) - Citizen of {nationality}
Employer: {employer_name} - {city}, {province}
Position: {job_title} - NOC {noc_code}
LMIA Number: {lmia_number} (if applicable)
```

### Section 1: Introduction

```
As the authorized Regulated Canadian Immigration Consultant (RCIC #{rcic_number}) 
representing {applicant_name}, I am submitting this work permit application under 
the {category_full_name}.

This submission includes all required forms and supporting documentation as outlined 
in the enclosed document checklist.
```

### Section 2: Application Overview

Include based on category:

**For LMIA Applications:**
- LMIA details (number, date, validity)
- Job offer summary
- Employer information
- Wage and working conditions

**For PGWP Applications:**
- DLI and program details
- Graduation date
- Study permit history
- Application timing

**For ICT Applications:**
- Corporate relationship
- Qualifying employment period
- Specialized knowledge summary
- Position details

**For Open Work Permit (Spouse):**
- Principal applicant status
- Relationship summary
- Eligibility basis

### Section 3: Applicant Qualifications

```
{applicant_name} possesses the following qualifications relevant to this position:

Education:
- {degree} from {institution} ({year})
- Educational Credential Assessment: {eca_details} (if applicable)

Professional Experience:
- {years} years of experience in {field}
- Previous positions: {relevant_positions}

Certifications/Licenses:
- {relevant_certifications}
```

### Section 4: Evidence Summary

```
The enclosed documentation demonstrates:
- [x] Valid LMIA/exemption basis
- [x] Employer legitimacy and compliance
- [x] Applicant qualifications matching job requirements
- [x] {Additional category-specific evidence}
```

### Section 5: Proactive Addressing (Optional)

If audit identified concerns, address them:

```
The application addresses the following considerations:
- {concern_1}: {explanation}
- {concern_2}: {explanation}
```

### Section 6: Document Index

```
Enclosed Documentation:

1. Application Forms (Tab A)
   - IMM 5710/IMM 1295
   - IMM 5645
   - IMM 5476 (if applicable)

2. Identity Documents (Tab B)
   - Passport copies
   - Current immigration status documents

3. Employer Documents (Tab C)
   - LMIA approval letter
   - Job offer letter
   - Business registration

4. Applicant Credentials (Tab D)
   - Educational documents with ECA
   - Work experience letters
   - Professional certifications

5. Supporting Evidence (Tab E)
   - [Category-specific documents]
```

### Section 7: Conclusion

```
Based on the enclosed documentation, I respectfully submit that {applicant_name} 
meets all requirements for a work permit under {category}. The application 
demonstrates compliance with IRPA and IRPR requirements.

Should additional information be required, please contact me directly at the 
details below.

Respectfully submitted,

{RCIC Name}
RCIC #{number}
{Company Name}
{Address}
{Phone}
{Email}
```

## Generation Rules

### From Audit Data

| Section | Source |
|---------|--------|
| Header info | ApplicantProfile, EmployerProfile |
| Application overview | Intake extracted data |
| Qualifications | Document analysis |
| Evidence summary | Gatekeeper document validation |
| Proactive addressing | Strategist vulnerabilities |
| Document index | Generated document list |

### Category-Specific Customization

| Category | Key Sections to Emphasize |
|----------|--------------------------|
| LMIA | LMIA validity, wage compliance, employer legitimacy |
| PGWP | DLI status, graduation timing, study history |
| ICT | Corporate relationship, specialized knowledge, 12-month employment |
| OWP | Principal applicant status, relationship genuineness |
| PNP | Provincial nomination validity, job offer alignment |

### Tone Guidelines

- Professional and objective
- Factual, not emotional
- Confident but not aggressive
- Addresses concerns proactively
- Emphasizes compliance

### Length Guidelines

- 2-3 pages maximum
- Focus on key points
- Avoid repetition from forms
- Category-specific emphasis

## Output Formats

### PDF
- Letterhead with RCIC branding
- Professional fonts (Times New Roman/Arial)
- Proper margins for printing

### DOCX
- Editable for RCIC review/modification
- Track changes enabled
- Comments for customization points

## Processing Centre Addresses

### Inside Canada Applications
```
Case Processing Centre - Edmonton
Suite 400, Canada Place
9700 Jasper Avenue NW
Edmonton, AB T5J 4C3
```

### Outside Canada Applications
Varies by visa office - use appropriate VAC/visa office address.

### PGWP Applications
```
Case Processing Centre - Edmonton
(Same as above for online applications)
```

## Compliance Notes

- Never guarantee approval
- Use "respectfully submit" language
- Reference specific IRPA/IRPR sections when appropriate
- Include RCIC credentials prominently
- Maintain professional tone throughout
