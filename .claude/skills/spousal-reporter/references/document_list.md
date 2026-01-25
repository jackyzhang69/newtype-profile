# Document List Generation (Spousal)

Rules for generating IMM 5533-based document checklists for spousal sponsorship applications.

## Reference

This template is derived from `spousal-client-guidance/document_list_guide.md` and tailored for Reporter output.

## Output Format

### JSON Schema

```json
{
  "meta": {
    "generated_at": "ISO8601 timestamp",
    "case_id": "case identifier",
    "app_type": "spousal",
    "sponsor": { "name": "...", "status": "citizen|pr" },
    "applicant": { "name": "...", "nationality": "..." }
  },
  "forms": [
    {
      "group_id": "required_forms",
      "title": "Required Forms (Part A)",
      "logic": "ALL_REQUIRED",
      "items": [
        {
          "doc_id": "imm5533",
          "name": "Document Checklist",
          "form_number": "IMM 5533",
          "priority": "mandatory",
          "status": "pending|complete|missing"
        }
      ]
    }
  ],
  "evidence": [
    {
      "group_id": "relationship_evidence",
      "title": "Relationship Evidence (Part B)",
      "logic": "AT_LEAST_N",
      "min_required": 3,
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
| `AT_LEAST_N` | Minimum N items required | Relationship evidence |
| `CONDITIONAL` | Required only if condition met | Divorce certificate |

## Required Forms (Part A)

Always include:
- IMM 5533 - Document Checklist
- IMM 5532 - Relationship Questionnaire
- IMM 0008 - Generic Application Form
- IMM 5406 - Additional Family Information
- IMM 5669 - Schedule A (Background/Declaration)

## Conditional Forms

| Form | Condition |
|------|-----------|
| IMM 5604 | Applicant has children under 18 |
| IMM 5476 | Using a representative |
| IMM 5409 | Common-law relationship |

## Evidence Categories (Part B)

### Identity Documents (ONE_OF per person)
- Passport (recommended)
- Birth certificate
- Citizenship certificate
- PR card

### Relationship Evidence (AT_LEAST_N: 3)
- Joint lease/mortgage
- Joint bank accounts
- Joint utility bills
- Insurance beneficiary designations
- Photos together (chronological)
- Communication records

### Financial Evidence
- Employment letters
- Tax returns (3 years)
- Bank statements (6 months)

## Markdown Output Format

```markdown
## Document Checklist

### Required Forms
- [ ] IMM 5533 - Document Checklist
- [ ] IMM 5532 - Relationship Questionnaire
- [x] IMM 0008 - Generic Application Form (completed)

### Relationship Evidence (minimum 3 required)
- [x] Joint bank account statements (Jan-Jun 2025)
- [x] Shared lease agreement (2024-present)
- [ ] Photos together - NEEDED: Add more photos from different time periods
- [x] Communication logs (WhatsApp export)

### Missing/Action Required
1. **IMM 5532** - Complete Section 4 (relationship history)
2. **Photos** - Add photos from 2023 (gap in timeline)
3. **Utility bills** - Obtain joint utility bill for stronger cohabitation proof
```

## Integration with Gatekeeper

Document list status is validated by Gatekeeper agent:
- PASS: All mandatory documents present
- FAIL: Missing mandatory documents
- PARTIAL: Optional evidence gaps

Reporter includes Gatekeeper's document validation status in the Action Items section.
