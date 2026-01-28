# PDF Parsing Rules

Rules for extracting structured checklist data from IRCC PDF documents.

## PDF Types

### XFA Forms (Most Common)

IRCC checklists are typically XFA (XML Forms Architecture) PDFs with:
- Fillable checkboxes
- Structured sections (Part A, Part B, etc.)
- Conditional fields

**Extraction**: Use `extract_xfa: true` in file_content_extract

### Text-Based PDFs

Some older checklists are simple text PDFs.

**Extraction**: Standard markdown output

### Scanned PDFs (Rare)

Some country-specific documents may be scanned.

**Extraction**: Use `detect_scanned: true` for OCR

## Checklist Structure Patterns

### Section Headers

```markdown
## Part A: Forms Required
## Part B: Supporting Documents
### B.1 Sponsor's Identity Documents
### B.2 Sponsor's Marital Status Documents
```

**Regex Pattern**:
```javascript
const sectionPattern = /^(Part [A-Z]|[A-Z]\.\d+):?\s*(.+)$/gm
```

### Checkbox Items

```markdown
☐ IMM 5533 - Document Checklist
☐ IMM 1344 - Application to Sponsor, Sponsorship Agreement and Undertaking
☐ IMM 0008 - Generic Application Form for Canada
```

**Regex Pattern**:
```javascript
const checkboxPattern = /^[☐☑□■]\s*(IMM\s*\d{4})?\s*[-–]\s*(.+)$/gm
```

### Conditional Statements

```markdown
If you are a Canadian citizen:
  ☐ Citizenship certificate or card
  ☐ Canadian passport
  ☐ Birth certificate issued in Canada

If you are a permanent resident:
  ☐ Permanent Resident Card (front and back)
  ☐ Confirmation of Permanent Residence (CoPR)
```

**Regex Pattern**:
```javascript
const conditionalPattern = /^If\s+(.+?):\s*$/gm
```

### Quantity Requirements

```markdown
Provide at least 2 of the following:
Choose ONE of the following:
All of the following are required:
```

**Mapping**:
| Text Pattern | Logic Type |
|--------------|------------|
| "at least N" | `AT_LEAST_N` |
| "ONE of" / "choose one" | `ONE_OF` |
| "All of" / "required" | `ALL_REQUIRED` |
| "If..." | `CONDITIONAL` |

## Variable Extraction

### Condition to Variable Mapping

| PDF Condition Text | Variable Path | Value |
|--------------------|---------------|-------|
| "If you are a Canadian citizen" | `sponsor.status` | `citizen` |
| "If you are a permanent resident" | `sponsor.status` | `permanent_resident` |
| "If divorced" | `sponsor.marital_history` | `divorced` |
| "If widowed" | `sponsor.marital_history` | `widowed` |
| "If you have dependent children" | `applicant.has_dependent_children` | `true` |
| "If applying from outside Canada" | `applicant.current_status_in_canada` | `none` |
| "If common-law partner" | `relationship.type` | `common_law` |
| "If currently living together" | `relationship.cohabiting` | `true` |
| "If child is under 18" | `dependent.age` | `< 18` |
| "If child is 22 or older" | `dependent.age` | `>= 22` |

### Country-Specific Detection

```javascript
const countryPatterns = [
  /country[- ]specific requirements for (.+)/i,
  /if applying from (.+)/i,
  /applicants from (.+) must/i,
  /for (.+) nationals/i
]
```

## Parsing Algorithm

### Step 1: Section Extraction

```javascript
function extractSections(markdown) {
  const sections = []
  let currentSection = null
  
  for (const line of markdown.split('\n')) {
    const sectionMatch = line.match(/^(#{1,3})\s*(Part [A-Z]|[A-Z]\.\d+)?:?\s*(.+)$/)
    
    if (sectionMatch) {
      if (currentSection) sections.push(currentSection)
      currentSection = {
        level: sectionMatch[1].length,
        id: sectionMatch[2] || null,
        title: sectionMatch[3],
        items: [],
        conditions: []
      }
    } else if (currentSection) {
      currentSection.items.push(line)
    }
  }
  
  if (currentSection) sections.push(currentSection)
  return sections
}
```

### Step 2: Item Extraction

```javascript
function extractItems(section) {
  const items = []
  let currentCondition = null
  let currentLogic = 'ALL_REQUIRED'
  
  for (const line of section.items) {
    // Check for logic type
    if (/at least (\d+)/i.test(line)) {
      currentLogic = 'AT_LEAST_N'
      // Extract N
    } else if (/one of|choose one/i.test(line)) {
      currentLogic = 'ONE_OF'
    } else if (/^if\s+/i.test(line)) {
      currentCondition = parseCondition(line)
    } else if (/^[☐☑□■]/.test(line)) {
      items.push({
        text: line.replace(/^[☐☑□■]\s*/, ''),
        condition: currentCondition,
        logic: currentLogic
      })
    }
  }
  
  return items
}
```

### Step 3: Form Number Extraction

```javascript
function extractFormNumber(text) {
  const match = text.match(/IMM\s*(\d{4})/i)
  if (match) {
    return `IMM ${match[1]}`
  }
  return null
}
```

### Step 4: Build Checklist JSON

```javascript
function buildChecklistJson(sections) {
  return {
    meta: {
      source: "IRCC",
      extracted_at: new Date().toISOString()
    },
    forms: sections
      .filter(s => s.id?.startsWith('Part A') || s.title.includes('Forms'))
      .flatMap(s => extractItems(s))
      .map(item => ({
        form_number: extractFormNumber(item.text),
        name: item.text,
        priority: "mandatory"
      })),
    supporting_documents: buildSupportingDocs(sections)
  }
}
```

## IMM 5533 Specific Parsing

### Part A: Forms Required

```javascript
const partA = {
  group_id: "required_forms",
  title: "Forms Required (Part A)",
  logic: "ALL_REQUIRED",
  items: [
    { doc_id: "imm5533", form_number: "IMM 5533", name: "Document Checklist" },
    { doc_id: "imm1344", form_number: "IMM 1344", name: "Application to Sponsor" },
    // ... etc
  ]
}
```

### Part B.1: Sponsor Identity

```javascript
const partB1 = {
  group_id: "sponsor_identity",
  title: "Sponsor's Identity Documents (B.1)",
  logic: "ONE_OF",
  condition: "sponsor.status == 'citizen'",
  items: [
    { doc_id: "citizenship_cert", name: "Citizenship Certificate/Card" },
    { doc_id: "passport", name: "Canadian Passport" },
    { doc_id: "birth_certificate", name: "Birth Certificate (issued in Canada)" }
  ]
}
```

### Part B.8: Relationship Evidence

```javascript
const partB8_cohabiting = {
  group_id: "cohabitation_proof",
  title: "Proof of Cohabitation (B.8)",
  logic: "AT_LEAST_N",
  minimum_required: 2,
  condition: "relationship.cohabiting == true",
  items: [
    { doc_id: "joint_lease", name: "Joint Lease/Mortgage" },
    { doc_id: "joint_bank", name: "Joint Bank Account Statements" },
    { doc_id: "joint_utilities", name: "Joint Utility Bills" },
    { doc_id: "govt_same_address", name: "Government Documents (same address)" }
  ]
}
```

## IMM 5483 Specific Parsing (Study Permit)

### Key Sections

| Section | Content |
|---------|---------|
| Part A | Required Forms (IMM 1294, IMM 5645, etc.) |
| Part B | Identity Documents |
| Part C | Financial Documents |
| Part D | Letter of Acceptance |
| Part E | Study Plan |
| Part F | Country-Specific Requirements |

### Study-Specific Variables

```javascript
const studyVariables = {
  program: {
    type: "university | college | language | k12",
    duration_months: "number",
    dli_number: "string"
  },
  financial: {
    source: "self | parents | scholarship | loan | gic",
    amount_cad: "number"
  },
  applicant: {
    age: "number",
    has_previous_study_in_canada: "boolean"
  }
}
```

## Validation Rules

### Form Number Validation

```javascript
function isValidFormNumber(formNumber) {
  // Must match pattern: IMM followed by space and 4 digits
  return /^IMM \d{4}$/.test(formNumber)
}

// Invalid patterns to reject
const invalidPatterns = [
  /IMM \d{4}[A-Z]/,  // IMM 5533A - doesn't exist
  /IMM\d{4}/,        // IMM5533 - missing space
  /IMM \d{5}/        // IMM 55331 - too many digits
]
```

### Section Completeness

```javascript
function validateChecklist(checklist) {
  const errors = []
  
  // Must have forms section
  if (!checklist.forms || checklist.forms.length === 0) {
    errors.push("Missing required forms section")
  }
  
  // Each form must have valid number
  for (const form of checklist.forms) {
    if (form.form_number && !isValidFormNumber(form.form_number)) {
      errors.push(`Invalid form number: ${form.form_number}`)
    }
  }
  
  // Logic types must be valid
  const validLogics = ['ALL_REQUIRED', 'ONE_OF', 'AT_LEAST_N', 'CONDITIONAL']
  for (const group of Object.values(checklist.supporting_documents)) {
    if (!validLogics.includes(group.logic)) {
      errors.push(`Invalid logic type: ${group.logic}`)
    }
  }
  
  return errors
}
```

## Output Format

Final parsed checklist follows `checklist_schema.json`:

```json
{
  "meta": {
    "source": "IRCC",
    "form_number": "IMM 5533",
    "form_title": "Document Checklist: Spouse (Including Dependent Children)",
    "extracted_at": "2026-01-28T10:00:00Z",
    "pdf_url": "/content/dam/ircc/.../imm5533e.pdf",
    "last_modified": "2022-09"
  },
  "variables": {
    "sponsor": { ... },
    "applicant": { ... },
    "relationship": { ... },
    "dependents": [ ... ]
  },
  "forms": [ ... ],
  "supporting_documents": { ... },
  "country_specific": { ... }
}
```
