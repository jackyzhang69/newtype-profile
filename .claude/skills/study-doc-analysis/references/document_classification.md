# Study Permit Document Classification and Extraction Strategy

## Overview

This guide defines how to classify and extract information from study permit application documents based on their nature.

## Document Classification

### 1. Narrative Documents (叙述性文档)

**Characteristics**: Contains applicant's subjective statements, explanations, arguments

**Types**:
- Submission Letter / Cover Letter
- Study Plan / Statement of Purpose
- Explanation Letter (for gaps, refusals, previous studies, etc.)
- Refusal Letter / GCMS Notes / Officer Decision Notes
- Personal Statement
- Letter of Intent

**Extraction Strategy**:
- Preserve complete original text (store in extracted_docs.json)
- Generate 3-5 key points summary (max 200 words)
- Mark `document_nature = "narrative"`
- Include `full_text_ref` pointing to storage

**Summary Example**:
```json
{
  "summary": "1. Applicant plans to pursue Master of Rehabilitation Science at UBC (2 years)\n2. Long-term goal: immigrate to Canada, but commits to comply with study permit regulations\n3. Exit strategy: Will return to China if unable to extend status or obtain PR\n4. Funding source: Parents' support + personal savings (¥500,000)\n5. Ties to home: Aging parents need care, career opportunities in China"
}
```

**CRITICAL for Dual Intent**:
If study plan mentions immigration intent, MUST extract:
- The immigration statement itself
- Exit strategy / compliance commitment
- Ties to home country
- Complete context (not just the first sentence)

### 2. Structured Documents (结构化证明文件)

**Characteristics**: Contains quantifiable facts, data, dates

**Types**:
- Bank Statements
- Employment Letters / Income Proof
- Tax Returns / NOA (Notice of Assessment)
- Transcripts / Diplomas / Degree Certificates
- Pay Stubs / Salary Slips
- Property Ownership Documents
- Investment Statements

**Extraction Strategy**:
- Extract key fields (JSON format)
- Store in `Evidence.summary`
- Mark `document_nature = "structured"`
- Include `full_text_ref` for verification

**Summary Examples**:

**Bank Statement**:
```json
{
  "summary": "Account: *****3448611 | Institution: Pingan Bank | Balance: ¥500,000 | Period: 2025-01 | Currency: CNY"
}
```

**Employment Letter**:
```json
{
  "summary": "Employer: ABC Tech Ltd | Position: Software Engineer | Salary: ¥25,000/month | Start Date: 2020-06 | Status: Current"
}
```

**Transcript**:
```json
{
  "summary": "Institution: Tsinghua University | Degree: Bachelor of Computer Science | GPA: 3.8/4.0 | Graduation: 2023-06"
}
```

### 3. Simple Documents (简单身份文件)

**Characteristics**: Standardized format, information already captured in IRCC forms

**Types**:
- Passport
- Photos
- Birth Certificate
- Marriage Certificate (if applicable)
- Police Clearance Certificate
- Medical Exam Results

**Extraction Strategy**:
- Metadata only (filename, path, category)
- No summary needed
- Mark `document_nature = "simple"`
- No `full_text_ref` needed

## Classification Algorithm

```typescript
function classifyDocumentNature(filename: string): DocumentNature {
  const narrativeDocs = [
    /submission.*letter/i,
    /cover.*letter/i,
    /explanation.*letter/i,
    /study.*plan/i,
    /statement.*of.*purpose/i,
    /personal.*statement/i,
    /letter.*of.*intent/i,
    /refusal.*letter/i,
    /gcms/i,
    /officer.*decision/i,
    /odn/i
  ]
  
  const structuredDocs = [
    /bank.*statement/i,
    /employment.*letter/i,
    /income.*proof/i,
    /tax.*return/i,
    /noa/i,
    /notice.*of.*assessment/i,
    /transcript/i,
    /diploma/i,
    /degree.*certificate/i,
    /pay.*stub/i,
    /salary.*slip/i,
    /property.*ownership/i,
    /investment.*statement/i
  ]
  
  if (narrativeDocs.some(pattern => pattern.test(filename))) {
    return "narrative"
  }
  if (structuredDocs.some(pattern => pattern.test(filename))) {
    return "structured"
  }
  return "simple"
}
```

## Summary Generation Guidelines

### For Narrative Documents

**Format**: Numbered list (3-5 points, max 200 words)

**Focus Areas**:
- Study program details (institution, program, duration)
- Academic/career goals
- Funding sources
- Ties to home country
- Exit strategy (if dual intent mentioned)
- Previous study/work experience relevance

**Example - Study Plan**:
```
1. Applicant plans to pursue Master of Rehabilitation Science at UBC (2 years, start Sep 2026)
2. Academic background: Bachelor of Rehabilitation Therapy from Tsinghua University (GPA 3.8)
3. Career goal: Return to China to work in rehabilitation field, high demand in aging society
4. Funding: Parents' savings (¥500,000) + part-time work allowance
5. Dual intent: Honest about future PR interest, but commits to comply with study permit rules and return if unable to extend
```

### For Structured Documents

**Format**: Key-value pairs separated by ` | `

**Bank Statement Fields**:
- Account (last 4 digits)
- Institution
- Balance
- Period (YYYY-MM)
- Currency

**Employment Letter Fields**:
- Employer
- Position
- Salary (with frequency)
- Start Date
- Status (Current/Former)

**Transcript Fields**:
- Institution
- Degree/Program
- GPA (with scale)
- Graduation Date

## Special Cases

### Dual Intent in Study Plan

**CRITICAL**: If study plan mentions immigration intent, extract COMPLETE context:

❌ **Wrong** (incomplete):
```json
{
  "summary": "Applicant states intention to immigrate to Canada"
}
```

✅ **Correct** (complete context):
```json
{
  "summary": "1. Long-term goal: immigrate to Canada after gaining work experience\n2. Primary intent: Complete Master's degree and comply with study permit regulations\n3. Exit strategy: Will return to China if unable to extend status or obtain PR\n4. Commitment: Will not overstay, values ability to visit parents and travel\n5. Ties to home: Aging parents, career opportunities in rehabilitation field"
}
```

### Refusal Letters with Officer Decision Notes

If refusal letter contains Officer Decision Notes (ODN):
- Extract each officer concern as separate point
- Preserve exact wording of concerns
- Note refusal date and form version

**Example**:
```json
{
  "summary": "Refusal Date: 2025-12-22 | Form: IMM 0276 (10-2025)\nOfficer Concerns:\n1. Study program not a reasonable progression from previous education\n2. Financial capacity not adequately demonstrated\n3. Purpose of visit - not satisfied applicant will leave Canada\n4. Lack of ties to home country"
}
```

## Integration with CaseProfile

All extracted information flows into `CaseProfile.documents.evidence[]`:

```typescript
{
  "documents": {
    "storage": {
      "extracted_docs_path": "./tmp/case-123/extracted_docs.json"
    },
    "evidence": [
      {
        "category": "relationship",
        "filename": "Study Plan.pdf",
        "path": "/path/to/Study Plan.pdf",
        "file_type": "pdf",
        "document_nature": "narrative",
        "summary": "1. Master of Rehabilitation Science at UBC...",
        "full_text_ref": "./tmp/case-123/extracted_docs.json#Study Plan.pdf"
      },
      {
        "category": "financial",
        "filename": "Bank Statement Jan 2025.pdf",
        "path": "/path/to/Bank Statement Jan 2025.pdf",
        "file_type": "pdf",
        "document_nature": "structured",
        "summary": "Account: *****3448611 | Institution: Pingan Bank | Balance: ¥500,000...",
        "full_text_ref": "./tmp/case-123/extracted_docs.json#Bank Statement Jan 2025.pdf"
      },
      {
        "category": "identity",
        "filename": "Passport.pdf",
        "path": "/path/to/Passport.pdf",
        "file_type": "pdf",
        "document_nature": "simple"
      }
    ]
  }
}
```

## Verification

After extraction, verify:
- [ ] All narrative documents have `summary` field
- [ ] All structured documents have `summary` field
- [ ] Simple documents have NO `summary` field
- [ ] All non-simple documents have `full_text_ref`
- [ ] Storage path exists and is accessible
- [ ] Dual intent statements include complete context
