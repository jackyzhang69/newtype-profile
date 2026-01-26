---
name: study-doc-analysis
description: |
  Document extraction and summarization for study permit audit evidence.
  Covers IMM 5483 (outside Canada) and IMM 5555 (inside Canada) checklists.
---

# Study Permit Document Analysis

## Scope
- Extract structured data from uploaded documents
- Validate document completeness against IRCC checklists
- Identify gaps and inconsistencies
- Generate evidence summaries for audit

## Document Categories

### 1. Identity Documents
| Document | Required | Key Fields |
|----------|----------|------------|
| Passport | Yes | Name, DOB, expiry, visa pages |
| National ID | Recommended | For Chinese applicants |
| Birth Certificate | Minors | Parent information |

### 2. Admission Documents
| Document | Required | Key Fields |
|----------|----------|------------|
| Letter of Acceptance | Yes | DLI#, program, dates, tuition |
| PAL | Conditional | Province, validity, student info |
| CAQ | Quebec only | Validity dates |

### 3. Financial Documents
| Document | Required | Key Fields |
|----------|----------|------------|
| Bank Statements | Yes | Balance, 4-6 month history |
| Bank Certificate | Yes | Frozen amount, date |
| GIC Certificate | Recommended | $20,635, bank name (~~SDS closed 2024-11-08~~) |
| Tuition Payment | Recommended | Amount, receipt (~~SDS closed 2024-11-08~~) |
| Income Proof | Sponsor | Salary, employer |
| Tax Returns | Sponsor | Annual income |

### 4. Education Documents
| Document | Required | Key Fields |
|----------|----------|------------|
| Diploma/Degree | Yes | Institution, major, date |
| Transcripts | Yes | Grades, GPA |
| Language Score | Recommended | IELTS/TOEFL/etc, date |

### 5. Application Forms
| Form | Purpose |
|------|---------|
| IMM 1294 | Study Permit Application |
| IMM 5645/5707 | Family Information |
| IMM 5257 | TRV (if needed) |
| IMM 5646 | Custody Declaration (minors) |

## Extraction Schema

```json
{
  "applicant": {
    "name": "string",
    "dob": "date",
    "nationality": "string",
    "passport_expiry": "date"
  },
  "program": {
    "institution": "string",
    "dli_number": "string",
    "program_name": "string",
    "level": "certificate|diploma|bachelor|master|phd",
    "start_date": "date",
    "end_date": "date",
    "tuition_annual": "number"
  },
  "finances": {
    "total_available": "number",
    "source": "self|parent|sponsor|scholarship",
    "gic_purchased": "boolean",
    "tuition_paid": "boolean"
  },
  "education": {
    "highest_level": "string",
    "major": "string",
    "graduation_year": "number",
    "language_score": {
      "type": "string",
      "overall": "number",
      "date": "date"
    }
  }
}
```

## Validation Rules

### Completeness Checks
- [ ] All required documents present
- [ ] Documents within validity period
- [ ] Translations provided for non-English/French

### Consistency Checks
- [ ] Name spelling matches across documents
- [ ] Dates are consistent
- [ ] Financial amounts match declarations
- [ ] Program info matches LOA

### Red Flag Detection
- [ ] Passport expiry before program end
- [ ] PAL expired or expiring soon
- [ ] Financial gap (< required amount)
- [ ] Missing language scores (recommended, not mandatory since SDS closed 2024-11-08)
- [ ] Incomplete family information

## Outputs
- Document inventory with status
- Extracted data summary
- Gap analysis with recommendations
- Evidence strength assessment

## Integration
- Uses ImmiCore file-content service when available
- Supports PDF, DOCX, images
- OCR for scanned documents

## Reference Files
- `references/extraction_schema.json` - Data extraction schema
- `references/baseline_doc_analysis.md` - Analysis guidelines
- `references/manifest.json` - Skill metadata
