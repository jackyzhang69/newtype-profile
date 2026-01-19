# CaseAnalyzer Quick Reference

## TL;DR

**CaseAnalyzer** is Stage 0 of every audit workflow. It transforms raw case directories into structured JSON profiles.

---

## Quick Start

### 1. Basic Usage

```
@case-analyzer analyze /Users/jacky/Desktop/tian
```

### 2. With Tier Specification

```
Analyze this case at /Users/jacky/Desktop/tian using ultra mode
```

### 3. With Specific Concerns

```
Audit this case at /path/to/case. I'm worried about the age gap and no wedding ceremony.
```

---

## Supported Document Formats

| Category | Formats |
|----------|---------|
| **Documents** | PDF, DOCX, DOC |
| **Images** | JPG, JPEG, PNG |

**Example Directory:**
```
/Users/jacky/Desktop/tian/
├── IMM0008.pdf
├── IMM1344.pdf
├── IMM5532.pdf
├── passport-sponsor.pdf
├── passport-applicant.pdf
├── marriage-certificate.pdf
├── explanation-letter.docx
├── photo1.jpg
├── photo2.jpg
└── bank-statement.pdf
```

**All files extracted in ONE call** - tool handles batching automatically.

---

## What It Does

### 7-Step Workflow

1. **Intent Recognition** → Detects task type (RISK_AUDIT, DOCUMENT_LIST, etc.)
2. **Document Discovery** → Finds all document files
3. **Document Extraction** → Batch extracts using `file_content_extract`
4. **Form Parsing** → Extracts XFA fields from IRCC forms
5. **Case Background** → Builds sponsor/applicant/relationship profiles
6. **Red Flag Detection** → Pre-identifies potential issues
7. **Profile Generation** → Creates structured JSON

### Output

```json
{
  "case_id": "tian-2025-01",
  "application_type": "spousal",
  "intent": {
    "task_type": "RISK_AUDIT",
    "tier": "ultra",
    "urgency": "medium"
  },
  "sponsor": {
    "name": "Zhuang Tian",
    "status": "citizen",
    "dob": "1989-06-28"
  },
  "applicant": {
    "name": "Zhun Huang",
    "nationality": "China",
    "dob": "1994-02-03"
  },
  "relationship": {
    "type": "marriage",
    "timeline": {
      "first_met": "2020-02-03",
      "marriage_date": "2023-06-06"
    }
  },
  "red_flags": [
    {
      "category": "relationship",
      "severity": "medium",
      "description": "No wedding ceremony held"
    }
  ]
}
```

---

## Task Types

| Task Type | Trigger Keywords | Output |
|-----------|------------------|--------|
| **RISK_AUDIT** | "audit", "assess", "analyze" | Full audit report |
| **DOCUMENT_LIST** | "checklist", "文件清单" | Document checklist |
| **INTERVIEW_PREP** | "interview", "面试准备" | Interview guide |
| **LOVE_STORY** | "relationship statement", "陈述" | Love story template |
| **CUSTOM** | Other requests | Custom output |

---

## Tier Levels

| Tier | Keywords | Features |
|------|----------|----------|
| **guest** | "basic", "quick" | Basic analysis |
| **pro** | "standard", "pro" | Standard analysis + KG |
| **ultra** | "ultra", "deep", "comprehensive" | Full analysis + verification |

**Default**: `pro` if not specified

---

## Red Flag Categories

| Category | Examples |
|----------|----------|
| **relationship** | Rushed timeline, no ceremony, age gap |
| **documentation** | Missing forms, incomplete signatures |
| **immigration** | Previous refusals, overstay history |
| **financial** | Insufficient income, unexplained transfers |
| **background** | Criminal history, misrepresentation |
| **procedural** | Missing translations, expired documents |

**Severity Levels**: `critical` > `high` > `medium` > `low`

---

## Common IRCC Forms Parsed

| Form | Fields Extracted |
|------|------------------|
| **IMM 1344** | Sponsor name, DOB, UCI, status, address |
| **IMM 0008** | Applicant name, DOB, UCI, nationality, passport |
| **IMM 5532** | Relationship timeline, ceremony details, separations |
| **IMM 5406** | Family members, dependents |
| **IMM 5669** | Background, addresses, travel history |

---

## Completeness Check

### Critical Fields

- ✅ Sponsor name, status, DOB
- ✅ Applicant name, nationality, DOB
- ✅ Relationship type, timeline
- ✅ All required forms submitted

### Warnings

- ⚠️ Missing translations
- ⚠️ Expired documents
- ⚠️ Incomplete forms

---

## Example Output

```
## Case Analysis Report

### Intent Recognition
- Task Type: RISK_AUDIT
- Tier: ULTRA
- Urgency: Medium

### Document Extraction
- Total Files: 25
- Extracted: 25 ✅
- Failed: 0

### Case Summary

**Application Type**: Spousal Sponsorship (In-Canada)

**Sponsor**: Zhuang Tian
- Status: Canadian Citizen
- DOB: 1989-06-28
- UCI: 91269977

**Applicant**: Zhun Huang
- Nationality: China
- DOB: 1994-02-03
- UCI: 89243176

**Relationship Timeline**:
- First Met: 2020-02-03
- Marriage: 2023-06-06

**Red Flags Detected**:
1. [MEDIUM] No wedding ceremony - COVID-19 restrictions

### Recommendation
✅ Case analysis complete. Ready to proceed to audit.

**Proceed to Stage 1 (AuditManager)? [Y/n]**
```

---

## Integration with Audit Workflow

```
User Request
    │
    ▼
┌─────────────────────────┐
│ Stage 0: CaseAnalyzer   │
│ - Extract documents     │
│ - Parse forms           │
│ - Build profile         │
│ - Detect red flags      │
└─────────────────────────┘
    │
    ▼ [User confirms]
    │
┌─────────────────────────┐
│ Stage 1: AuditManager   │
│ - Receives profile      │
│ - Validates schema      │
│ - Dispatches agents     │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│ Stage 2: Detective      │
│ - Searches case law     │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│ Stage 3: Strategist     │
│ - Calculates score      │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│ Stage 4: Gatekeeper     │
│ - Validates compliance  │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│ Stage 4.5: Verifier     │
│ - Checks citations      │
└─────────────────────────┘
```

---

## Troubleshooting

### Issue: "Service unavailable"

**Cause**: `file_content_extract` service not running

**Solution**:
```bash
# Check service health
ssh jacky@192.168.1.98 "curl -s http://localhost:3104/health"

# If unhealthy, check logs
ssh jacky@192.168.1.98 "docker logs immicore-search-service-1 --tail 50"
```

### Issue: "Failed to extract some files"

**Cause**: Corrupted files or unsupported format

**Solution**:
- Check `failed_files` array in response
- Verify file integrity
- Ensure file format is supported (PDF, DOCX, DOC, JPG, PNG)

### Issue: "Missing critical fields"

**Cause**: Forms incomplete or not submitted

**Solution**:
- Check `completeness.missing_documents` in profile
- Verify all required forms are in case directory
- Ensure forms are properly filled and signed

---

## Advanced Usage

### Custom Model

```typescript
import { createCaseAnalyzerAgent } from "./audit-core/agents/case-analyzer"

const agent = createCaseAnalyzerAgent("openai/gpt-4", 0.2)
```

### Profile Validation

```typescript
import { validateCaseProfile } from "./audit-core/types/case-profile"

const result = validateCaseProfile(profile)
if (!result.valid) {
  console.log("Missing fields:", result.missing)
}
```

---

## See Also

- **Design Spec**: `docs/case-analyzer-design.md`
- **Implementation**: `CASE-ANALYZER-IMPLEMENTATION.md`
- **Extraction Policy**: `.claude/rules/audit-document-extraction.md`
- **TypeScript Schema**: `src/audit-core/types/case-profile.ts`

---

**Last Updated**: 2025-01-18
**Version**: 1.0.0
