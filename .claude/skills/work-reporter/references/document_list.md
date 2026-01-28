# Document List Generation (Work Permit)

Rules for generating work permit document checklists based on application category.

## Reference

This template is derived from `work-client-guidance/document_checklist.md` and tailored for Reporter output.

## Output Format

### JSON Schema

```json
{
  "meta": {
    "generated_at": "ISO8601 timestamp",
    "case_id": "case identifier",
    "app_type": "work",
    "work_category": "lmia|pgwp|ict|imp|owp|pnp",
    "applicant": { "name": "...", "nationality": "..." },
    "employer": { "name": "...", "location": "..." }
  },
  "forms": [
    {
      "group_id": "required_forms",
      "title": "Required Forms",
      "logic": "ALL_REQUIRED",
      "items": [
        {
          "doc_id": "imm5710",
          "name": "Application to Change Conditions, Extend Stay or Remain in Canada as a Worker",
          "form_number": "IMM 5710",
          "priority": "mandatory",
          "status": "pending|complete|missing"
        }
      ]
    }
  ],
  "evidence": [
    {
      "group_id": "employer_documents",
      "title": "Employer Documentation",
      "logic": "ALL_REQUIRED",
      "items": [...]
    }
  ]
}
```

## Logic Types

| Logic | Meaning | Example |
|-------|---------|---------|
| `ALL_REQUIRED` | Every item must be provided | IMM forms |
| `ONE_OF` | Exactly one item from group | Identity proof |
| `AT_LEAST_N` | Minimum N items required | Supporting evidence |
| `CONDITIONAL` | Required only if condition met | LMIA copy |

## Forms by Work Permit Category

### LMIA-Based Work Permits

**Required Forms:**
- IMM 5710 - Application to Change Conditions (inside Canada)
- IMM 1295 - Application for Work Permit (outside Canada)
- IMM 5645 - Family Information Form
- IMM 5476 - Use of Representative (if applicable)

**Required Documents:**
- Valid LMIA (positive decision letter)
- Job offer letter matching LMIA
- Employer compliance letter
- Proof of qualifications

### PGWP (Post-Graduation Work Permit)

**Required Forms:**
- IMM 5710 - Application to Change Conditions
- IMM 5645 - Family Information Form

**Required Documents:**
- Official letter from DLI confirming graduation
- Final transcript
- Study permit (copy)
- Proof of full-time study

### ICT (Intra-Company Transfer)

**Required Forms:**
- IMM 5710/IMM 1295
- IMM 5645 - Family Information Form
- IMM 5802 - Offer of Employment (C62)

**Required Documents:**
- Corporate relationship proof
- 12-month employment verification
- Specialized knowledge documentation
- Organizational charts

### Open Work Permit (Spouse of Worker/Student)

**Required Forms:**
- IMM 5710 - Application to Change Conditions
- IMM 5645 - Family Information Form
- IMM 5409 - Statutory Declaration of Common-Law Union (if applicable)

**Required Documents:**
- Principal applicant's valid permit
- Relationship proof
- Marriage certificate/common-law declaration

### PNP (Provincial Nominee Program)

**Required Forms:**
- IMM 5710/IMM 1295
- IMM 5645 - Family Information Form
- Provincial nomination certificate

**Required Documents:**
- Valid provincial nomination
- Job offer letter
- Proof of meeting provincial criteria

## Evidence Categories

### Identity Documents (ONE_OF per person)
- Valid passport (recommended)
- Travel document
- National ID card

### Employer Documentation (ALL_REQUIRED for LMIA)
- LMIA approval letter
- Job offer letter
- Business license/registration
- Employer compliance attestation

### Applicant Credentials (CONDITIONAL)
- Educational credentials (with ECA if required)
- Professional certifications
- Work experience letters
- Language test results (if required)

### Financial Evidence (CONDITIONAL)
- Proof of funds (for some categories)
- Bank statements
- Employment income proof

## Markdown Output Format

```markdown
## Document Checklist - Work Permit ({category})

### Required Forms
- [ ] IMM 5710 - Application to Change Conditions
- [ ] IMM 5645 - Family Information Form
- [x] IMM 5476 - Use of Representative (completed)

### Employer Documents
- [x] LMIA approval letter (dated 2025-01-15)
- [x] Job offer letter matching LMIA
- [ ] Employer compliance attestation - NEEDED

### Applicant Credentials
- [x] Educational credentials with ECA
- [x] Professional certification (if applicable)
- [ ] Work experience letters - NEEDED: Obtain from previous employers

### Missing/Action Required
1. **Employer compliance attestation** - Request from employer
2. **Work experience letters** - Contact previous employers
3. **Language test** - Schedule IELTS if required for NOC category
```

## Category-Specific Checklists

### LMIA Checklist Additions
- LMIA number verification
- Wage compliance check
- Job duties alignment
- Employer legitimacy documents

### PGWP Checklist Additions
- DLI number verification
- Program completion date
- Full-time study confirmation
- 180-day application window check

### ICT Checklist Additions
- Corporate structure documentation
- Qualifying relationship proof
- Specialized knowledge evidence
- 12-month employment confirmation

## Integration with Gatekeeper

Document list status is validated by Gatekeeper agent:
- PASS: All mandatory documents present
- FAIL: Missing mandatory documents
- PARTIAL: Optional evidence gaps

Reporter includes Gatekeeper's document validation status in the Action Items section.

## Policy Update Notes

### 2024-2025 Changes
- PGWP field of study restrictions (Nov 2024)
- Open work permit eligibility changes (Jan 2025)
- LMIA validity period changes
- New employer compliance requirements

Always verify current requirements via MCP operation_manual_search before finalizing checklist.
