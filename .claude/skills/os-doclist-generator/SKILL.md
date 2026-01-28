---
name: os-doclist-generator
description: |
  Generate customized IRCC document checklists based on client variables.
  Supports automatic extraction from IRCC website when no user content provided.
  Produces JSON or Markdown document lists with conditional logic (ONE_OF, ALL_REQUIRED, AT_LEAST_N).
  Use when: creating client-specific document requirements, building new app doc-analysis skills.
  Trigger: /os-generate-doclist <app> [--client <profile.json>] [--checklist <content>]
---

# OS Document List Generator

Generates customized IRCC document checklists with **smart source selection**:
- If user provides checklist content → use user's content
- If no content provided → automatically fetch from IRCC website

## Quick Start

```bash
# Generate from user-provided checklist content
/os-generate-doclist spousal --checklist "Part A: Forms Required..."

# Generate from client profile (uses cached/existing checklist)
/os-generate-doclist spousal --client ./case/client_profile.json

# Auto-fetch from IRCC website (no user content)
/os-generate-doclist study

# Interactive mode with questions
/os-generate-doclist work --interactive

# Force refresh from IRCC (ignore cache)
/os-generate-doclist study --refresh
```

## Smart Source Selection

The skill automatically determines the checklist source:

```
┌─────────────────────────────────────────────────────────────┐
│  User Request                                               │
│  /os-generate-doclist <app> [options]                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │ --checklist provided? │
              └───────────┬───────────┘
                    │           │
                   YES          NO
                    │           │
                    ▼           ▼
         ┌──────────────┐  ┌──────────────────┐
         │ Parse user   │  │ Check app skill  │
         │ content      │  │ for cached list  │
         └──────────────┘  └────────┬─────────┘
                                    │
                          ┌─────────┴─────────┐
                          │ Cached available? │
                          └─────────┬─────────┘
                               │         │
                              YES        NO
                               │         │
                               ▼         ▼
                    ┌──────────────┐  ┌──────────────────┐
                    │ Use cached   │  │ Fetch from IRCC  │
                    │ checklist    │  │ (Playwright)     │
                    └──────────────┘  └──────────────────┘
                               │         │
                               └────┬────┘
                                    ▼
                    ┌──────────────────────────────┐
                    │ Apply client profile         │
                    │ (conditional logic)          │
                    └──────────────────────────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │ Add country-specific docs    │
                    └──────────────────────────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │ Output JSON/Markdown         │
                    └──────────────────────────────┘
```

## Commands

### Primary Command

```bash
/os-generate-doclist <app> [options]
```

| Option | Description |
|--------|-------------|
| `--checklist <content>` | User-provided checklist content (text or file path) |
| `--client <profile.json>` | Client profile for conditional logic |
| `--format <json\|markdown>` | Output format (default: json) |
| `--interactive` | Ask questions to build client profile |
| `--refresh` | Force fetch from IRCC, ignore cache |
| `--save-to-skill` | Save result to app's doc-analysis skill |

### Discovery Commands

```bash
# Search IRCC forms by keyword
/os-discover-ircc-forms "study permit"

# Extract specific IRCC checklist
/os-extract-ircc-checklist IMM5483
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
    "source": "IRCC | user_provided",
    "form_number": "IMM 5533",
    "extracted_at": "ISO8601",
    "app_type": "spousal",
    "simplified_requirements": boolean
  },
  "forms": [...],
  "supporting_documents": {...},
  "country_specific": {...},
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

### Country-Specific: China
- [ ] Household Register (Hukou) - 户口本
- [ ] Marriage Certificate (notarized) - 结婚证公证
```

## IRCC Auto-Extraction

When no user content is provided, the skill automatically:

1. **Discovers** the relevant IRCC form using Playwright
2. **Downloads** the PDF checklist
3. **Parses** the PDF structure into JSON
4. **Caches** the result for 7 days

### Supported App Types

| App Type | IRCC Form | Auto-Extract |
|----------|-----------|--------------|
| `spousal` | IMM 5533 | ✓ |
| `study` | IMM 5483 | ✓ |
| `work` | varies | ✓ |
| `parents` | IMM 5771 | ✓ |
| `visitor` | IMM 5257 | ✓ |

### Extraction Process

See [ircc_extraction_guide.md](references/ircc_extraction_guide.md) for details.

## Country-Specific Requirements

The skill automatically adds country-specific documents based on `applicant.nationality`:

| Country | Additional Documents |
|---------|---------------------|
| China | Hukou, Education verification |
| India | Aadhaar, PAN Card |
| Philippines | PSA Birth Certificate, CENOMAR |
| Pakistan | NADRA CNIC, Nikah Nama |

See [country_specific_requirements.md](references/country_specific_requirements.md) for full list.

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

6. **Country-Specific**
   - Based on `applicant.nationality`

See [conditional_logic.md](references/conditional_logic.md) for full rules.

## IRCC Forms Reference

Only use official IRCC form numbers:

| Form | Name | When Required |
|------|------|---------------|
| IMM 5533 | Document Checklist | Always (spousal) |
| IMM 1344 | Application to Sponsor | Always (spousal) |
| IMM 0008 | Generic Application Form | Always |
| IMM 5406 | Additional Family Information | Always |
| IMM 5669 | Schedule A (Background) | Always |
| IMM 5532 | Relationship Information | Spousal only |
| IMM 5476 | Use of Representative | If using RCIC |
| IMM 5604 | Non-Accompanying Parent | Minor children with other parent |
| IMM 1283 | Financial Evaluation | Sponsor has children from other relationship |
| IMM 5483 | Document Checklist | Study permit |
| IMM 1294 | Application for Study Permit | Study permit |
| IMM 5645 | Family Information Form | Study/Work permits |

See [ircc_forms_catalog.md](references/ircc_forms_catalog.md) for complete list.

## Integration with App Skills

Generated document lists can be saved to app skills:

```bash
# Generate and save to {app}-doc-analysis skill
/os-generate-doclist work --save-to-skill

# This creates:
# .claude/skills/work-doc-analysis/references/document_checklist.json
# .claude/skills/work-doc-analysis/references/form_catalog.md
```

## Examples

### Example 1: User Provides Checklist

```bash
/os-generate-doclist study --checklist "
Part A: Required Forms
- IMM 1294 Application for Study Permit
- IMM 5645 Family Information Form

Part B: Identity Documents
- Valid passport
- Two passport photos
"
```

### Example 2: Auto-Fetch from IRCC

```bash
/os-generate-doclist study --client ./client.json
# No --checklist provided, so skill will:
# 1. Check cache for IMM 5483
# 2. If not cached, fetch from IRCC website
# 3. Apply client profile conditions
# 4. Add China-specific docs (if nationality=China)
```

### Example 3: Force Refresh

```bash
/os-generate-doclist spousal --refresh
# Ignores cache, fetches latest from IRCC
```

## References

- [checklist_schema.json](references/checklist_schema.json) - Output schema
- [ircc_forms_catalog.md](references/ircc_forms_catalog.md) - Official forms reference
- [conditional_logic.md](references/conditional_logic.md) - Rule engine documentation
- [client_variables.md](references/client_variables.md) - Client profile field definitions
- [ircc_extraction_guide.md](references/ircc_extraction_guide.md) - IRCC website scraping guide
- [pdf_parsing_rules.md](references/pdf_parsing_rules.md) - PDF parsing rules
- [country_specific_requirements.md](references/country_specific_requirements.md) - Country-specific documents
