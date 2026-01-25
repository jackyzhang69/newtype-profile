# Pattern Extraction Methodology

How to identify and structure domain knowledge from source materials.

## Overview

Knowledge extraction follows a three-phase process:

```
Source Material → Pattern Identification → Structured Output
     │                    │                      │
     ▼                    ▼                      ▼
  PDF/MD/TXT         Risk Patterns          risk_patterns.json
  Case Law           Eligibility Rules      baseline_rules.md
  Policy Docs        Query Patterns         caselaw_query_patterns.json
```

## Phase 1: Source Processing

### File Type Handling

| Type | Processing Method | Extracted Elements |
|------|------------------|-------------------|
| `.md` | Direct parse | Headers, lists, code blocks |
| `.txt` | Text analysis | Paragraphs, key phrases |
| `.pdf` | file_content_extract | Text, form fields |
| `.json` | Schema mapping | Structured data |
| Case Law | Semantic analysis | Facts, issues, holdings |

### Case Law Processing

For each case, extract:

```json
{
  "citation": "2024 FC 123",
  "applicant_type": "work_permit",
  "refusal_reasons": ["LMIA non-compliance", "wage discrepancy"],
  "officer_concerns": ["genuineness of job offer"],
  "court_finding": "ALLOWED",
  "key_paragraphs": [45, 67, 89],
  "legal_principles": ["Vavilov standard", "procedural fairness"]
}
```

### Policy Document Processing

For operation manual sections, extract:

```json
{
  "section_id": "IP 10.5",
  "title": "Work Permit Assessment",
  "key_requirements": ["valid job offer", "LMIA or exemption"],
  "decision_criteria": ["genuine employment", "temporary intent"],
  "red_flags": ["wage below median", "unrelated duties"]
}
```

## Phase 2: Pattern Identification

### Risk Pattern Categories

Standard categories for immigration audit:

| Category ID | Category Name | Applies To |
|-------------|---------------|------------|
| `GENUINENESS` | Relationship/Intent Genuineness | spousal, study, work, visitor |
| `ADMISSIBILITY` | Inadmissibility Concerns | all |
| `DOCUMENTATION` | Document Deficiencies | all |
| `FINANCIAL` | Financial Capacity | study, visitor, sponsorship |
| `TIES` | Ties to Home Country | study, visitor, work |
| `COMPLIANCE` | Regulatory Compliance | work (LMIA), study (DLI) |
| `HISTORY` | Immigration History Issues | all |

### Pattern Extraction Rules

**Rule 1: Frequency Analysis**
If a refusal reason appears in 5+ cases → HIGH priority pattern

**Rule 2: Court Treatment**
If court consistently overturns on an issue → Risk flag for that reason

**Rule 3: Officer Language**
Common phrases in refusals become risk indicators:
- "not satisfied that..." → GENUINENESS concern
- "insufficient evidence of..." → DOCUMENTATION concern
- "based on the totality of circumstances..." → Multiple factors

### Risk Severity Mapping

| Severity | Criteria |
|----------|----------|
| `CRITICAL` | Fatal to application, cannot mitigate |
| `HIGH` | Likely refusal without strong mitigation |
| `MEDIUM` | Requires explanation/evidence |
| `LOW` | Minor concern, address if convenient |

## Phase 3: Structured Output

### risk_patterns.json Format

```json
{
  "version": "1.0.0",
  "app_type": "work",
  "patterns": [
    {
      "pattern_id": "work_001",
      "category": "COMPLIANCE",
      "subcategory": "lmia_conditions",
      "name": "LMIA Wage Compliance",
      "description": "Offered wage below LMIA-approved wage",
      "severity": "HIGH",
      "indicators": [
        "wage lower than LMIA",
        "pay structure differs from offer",
        "hours reduced from LMIA"
      ],
      "mitigation": [
        "Amended job offer matching LMIA",
        "Explanation for discrepancy",
        "Evidence of industry standards"
      ],
      "case_references": [
        {"citation": "2024 FC 123", "relevance": "wage compliance requirement"},
        {"citation": "2023 FC 456", "relevance": "minor variance acceptable"}
      ],
      "kg_query": {
        "issue_code": "LMIA_WAGE",
        "keywords": ["wage", "LMIA", "compensation"]
      }
    }
  ]
}
```

### baseline_rules.md Format

```markdown
# {App Type} Baseline Rules

## Eligibility Requirements

### Statutory Requirements
- R200(1): Valid job offer requirement
- R200(3): LMIA or exemption requirement

### Assessment Criteria

#### Genuine Employment
Officer must be satisfied that:
1. Job offer is genuine
2. Applicant will perform stated duties
3. Employer has capacity to pay

## Risk Assessment Framework

### Critical Risks (Fatal)
- [List fatal issues that cannot be mitigated]

### High Risks (Requires Strong Mitigation)
- [List issues requiring significant evidence]

### Medium Risks (Requires Explanation)
- [List issues requiring basic explanation]
```

### caselaw_query_patterns.json Format

```json
{
  "version": "1.0.0",
  "app_type": "work",
  "patterns": [
    {
      "pattern_id": "query_001",
      "name": "LMIA Compliance Cases",
      "description": "Cases involving LMIA condition violations",
      "query_template": {
        "keywords": ["LMIA", "wage", "compliance"],
        "must_include": ["work permit"],
        "issue_code": "LMIA_COMPLIANCE"
      },
      "expected_results": "Cases where LMIA conditions were assessed",
      "use_case": "When client has potential LMIA compliance issues"
    }
  ]
}
```

## Quality Validation

After extraction, validate:

### Citation Verification
```bash
# For each citation in output
caselaw_authority --citation "2024 FC 123"
# Must return valid case
```

### Pattern Coverage
- All major refusal categories covered
- No duplicate patterns
- Severity levels consistently applied

### Cross-Reference Check
- Risk patterns reference valid cases
- Query patterns produce expected results
- Eligibility rules cite correct regulations
