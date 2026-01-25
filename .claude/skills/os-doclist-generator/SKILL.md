---
name: os-doclist-generator
description: |
  Generate customized IRCC document checklists based on client variables.
  Produces JSON or Markdown document lists with conditional logic (ONE_OF, ALL_REQUIRED, AT_LEAST_N).
  Use when: creating client-specific document requirements, building new app doc-analysis skills.
  Trigger: /os-generate-doclist <app> --client <profile.json>
---

# OS Document List Generator

Generates customized IRCC document checklists based on client-specific variables.

## Quick Start

```bash
# Generate document list for a spousal case
/os-generate-doclist spousal --client ./case/client_profile.json

# Generate from interactive questions
/os-generate-doclist spousal --interactive

# Generate template for new app type
/os-generate-doclist work --template
```

## Client Profile Schema

Input client variables to customize the document list:

```json
{
  "sponsor": {
    "name": "string",
    "status": "citizen | permanent_resident | indian_status",
    "is_overseas": false,
    "marital_history": "never_married | divorced | widowed | annulled",
    "province": "BC | ON | QC | AB | MB | SK | NS | NB | PE | NL | YT | NT | NU"
  },
  "applicant": {
    "name": "string",
    "nationality": "string (ISO country code or name)",
    "current_status_in_canada": "visitor | worker | student | none",
    "marital_history": "never_married | divorced | widowed | annulled",
    "has_dependent_children": boolean
  },
  "relationship": {
    "type": "marriage | common_law | conjugal",
    "cohabiting": boolean,
    "has_shared_children": boolean,
    "both_first_marriage": boolean,
    "married_over_2_years": boolean
  },
  "dependents": [
    {
      "name": "string",
      "age": number,
      "accompanying": boolean,
      "biological_parent_is_sponsor": boolean
    }
  ]
}
```

## Document Logic Types

| Logic | Meaning | Example |
|-------|---------|---------|
| `ALL_REQUIRED` | Every item must be provided | IMM forms (5533, 1344, 0008) |
| `ONE_OF` | Exactly one item from group | Citizenship proof (passport OR cert OR birth cert) |
| `AT_LEAST_N` | Minimum N items required | Relationship evidence (2+ of joint lease/bank/bills) |
| `CONDITIONAL` | Required only if condition met | Divorce cert if marital_history == 'divorced' |

## Output Format

### JSON Output (default)

See [checklist_schema.json](references/checklist_schema.json) for complete schema.

```json
{
  "meta": {
    "generated_at": "ISO8601",
    "case_id": "string",
    "app_type": "spousal",
    "simplified_requirements": boolean
  },
  "forms": [...],
  "supporting_documents": {...},
  "notes": {...}
}
```

### Markdown Output (--format markdown)

```markdown
## Document Checklist: Spousal Sponsorship

### Required Forms (ALL_REQUIRED)
- [ ] IMM 5533 - Document Checklist
- [ ] IMM 1344 - Application to Sponsor
- [ ] IMM 0008 - Generic Application Form

### Sponsor Identity (ONE_OF - choose 1)
- [ ] Citizenship Certificate/Card
- [ ] Canadian Passport
- [ ] Birth Certificate (issued in Canada)
```

## Conditional Rules Engine

The generator evaluates conditions in this order:

1. **Simplified Requirements Check** (Spousal only)
   - Cohabiting AND shared children AND both first marriage AND married 2+ years
   - If all true: reduced photo/evidence requirements

2. **Identity Documents**
   - Based on `sponsor.status` and `applicant.nationality`

3. **Marital History**
   - Triggers divorce/annulment/death certificates

4. **Dependent Children**
   - Triggers IMM 5604, custody agreements

5. **Relationship Evidence**
   - Cohabiting vs non-cohabiting path
   - Different minimum evidence requirements

## IRCC Forms Reference

Only use official IRCC form numbers:

| Form | Name | When Required |
|------|------|---------------|
| IMM 5533 | Document Checklist | Always |
| IMM 1344 | Application to Sponsor | Always (spousal) |
| IMM 0008 | Generic Application Form | Always |
| IMM 5406 | Additional Family Information | Always |
| IMM 5669 | Schedule A (Background) | Always |
| IMM 5532 | Relationship Information | Spousal only |
| IMM 5476 | Use of Representative | If using RCIC |
| IMM 5604 | Non-Accompanying Parent | Minor children with other parent |
| IMM 1283 | Financial Evaluation | Sponsor has children from other relationship |

## Integration with App Skills

Generated document lists can be saved to app skills:

```bash
# Generate and save to {app}-doc-analysis skill
/os-generate-doclist work --save-to-skill

# This creates:
# .claude/skills/work-doc-analysis/references/document_checklist.json
# .claude/skills/work-doc-analysis/references/form_catalog.md
```

## References

- [checklist_schema.json](references/checklist_schema.json) - Output schema
- [ircc_forms_catalog.md](references/ircc_forms_catalog.md) - Official forms reference
- [conditional_logic.md](references/conditional_logic.md) - Rule engine documentation
- [client_variables.md](references/client_variables.md) - Client profile field definitions
