# Submission Letter Template (Spousal)

Template for generating RCIC cover letters for spousal sponsorship submissions.

## Reference

This template is derived from `spousal-workflow/submission_letter_template.md` and adapted for automated generation.

## Purpose

The submission letter accompanies the spousal sponsorship application package submitted to IRCC. It provides:
- Professional cover from RCIC perspective
- Relationship overview
- Document index
- Proactive addressing of potential concerns

## Letter Structure

### Header

```
[Date]

Immigration, Refugees and Citizenship Canada
Case Processing Centre - Mississauga
PO Box 6100, Station A
Mississauga, ON L5A 4K2

Re: Spousal Sponsorship Application - Spouse or Common-law Partner in Canada Class

Sponsor: {sponsor_full_name} (DOB: {sponsor_dob}) - Canadian {citizen/PR}
Principal Applicant: {applicant_full_name} (DOB: {applicant_dob}) - UCI: {uci_if_exists}
```

### Section 1: Introduction

```
As the authorized Regulated Canadian Immigration Consultant (RCIC #{rcic_number}) 
representing {sponsor_name} and {applicant_name}, I am submitting this spousal 
sponsorship application under the Spouse or Common-law Partner in Canada Class.

This submission includes all required forms and supporting documentation as outlined 
in the enclosed IMM 5533 Document Checklist.
```

### Section 2: Relationship Overview

Include:
- How couple met
- Relationship timeline (key dates)
- Current living situation
- Marriage/common-law details

### Section 3: Evidence Summary

```
The enclosed documentation demonstrates:
- [x] Cohabitation since {date} at {address}
- [x] Financial integration through joint accounts
- [x] Family recognition from both sides
- [x] {N} photos spanning {date_range}
- [x] Communication records totaling {volume}
```

### Section 4: Proactive Addressing (Optional)

If audit identified concerns, address them:

```
The application addresses the following considerations:
- {concern_1}: {explanation}
- {concern_2}: {explanation}
```

### Section 5: Document Index

```
Enclosed Documentation:
1. Forms (Tab A)
   - IMM 5533, IMM 5532, IMM 0008...
2. Identity Documents (Tab B)
   - Passport copies, birth certificates...
3. Relationship Evidence (Tab C)
   - Joint accounts, photos, communications...
4. Financial Documents (Tab D)
   - Employment letters, tax returns...
```

### Section 6: Conclusion

```
Based on the enclosed documentation, I respectfully submit that {sponsor_name} and 
{applicant_name} have provided evidence demonstrating a genuine spousal relationship 
as defined under IRPA and IRPR.

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
| Header info | ApplicantProfile |
| Relationship overview | Intake extracted data |
| Evidence summary | Gatekeeper document validation |
| Proactive addressing | Strategist vulnerabilities |
| Document index | Generated document list |

### Tone Guidelines

- Professional and objective
- Factual, not emotional
- Confident but not aggressive
- Addresses concerns proactively

### Length Guidelines

- 2-3 pages maximum
- Focus on key points
- Avoid repetition from forms

## Output Formats

### PDF
- Letterhead with RCIC branding
- Professional fonts (Times New Roman/Arial)
- Proper margins for printing

### DOCX
- Editable for RCIC review/modification
- Track changes enabled
- Comments for customization points
