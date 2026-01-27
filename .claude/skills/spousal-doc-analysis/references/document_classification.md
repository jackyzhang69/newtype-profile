# Spousal Sponsorship Document Classification and Extraction Strategy

## Overview

This guide defines how to classify and extract information from spousal sponsorship application documents based on their nature.

## Document Classification

### 1. Narrative Documents (叙述性文档)

**Characteristics**: Contains sponsor/applicant's subjective statements, relationship explanations

**Types**:
- Submission Letter / Cover Letter / Representative Letter
- Relationship Statement / Love Story
- Explanation Letter (for gaps, previous relationships, etc.)
- Refusal Letter / GCMS Notes
- Statutory Declaration
- Affidavit

**Extraction Strategy**:
- Preserve complete original text (store in extracted_docs.json)
- Generate 3-5 key points summary (max 200 words)
- Mark `document_nature = "narrative"`
- Include `full_text_ref` pointing to storage

**Summary Example**:
```json
{
  "summary": "1. Sponsor met applicant at Algonquin College in Feb 2020\n2. Started dating immediately, moved in together Mar 2020\n3. Married Jun 2023 via civil registration (no ceremony due to COVID-19)\n4. Currently cohabiting at [address], both employed\n5. Plan to have children after applicant receives PR"
}
```

**CRITICAL for Relationship Genuineness**:
If submission letter explains unusual circumstances, MUST extract:
- The circumstance itself (e.g., no ceremony, age gap, quick marriage)
- Complete explanation and context
- Supporting evidence mentioned
- Future plans

### 2. Structured Documents (结构化证明文件)

**Characteristics**: Contains quantifiable facts, data, dates

**Types**:
- Bank Statements / Joint Account Statements
- Employment Letters / Income Proof
- Tax Returns / NOA (Notice of Assessment)
- Lease Agreements / Mortgage Documents
- Utility Bills (hydro, gas, internet, phone)
- Insurance Policies (joint or beneficiary designation)
- Property Tax Statements

**Extraction Strategy**:
- Extract key fields (JSON format)
- Store in `Evidence.summary`
- Mark `document_nature = "structured"`
- Include `full_text_ref` for verification

**Summary Examples**:

**Joint Bank Statement**:
```json
{
  "summary": "Account: Joint Checking *****1234 | Institution: TD Bank | Balance: $15,000 | Period: 2025-01 | Account Holders: [Sponsor Name] & [Applicant Name]"
}
```

**Lease Agreement**:
```json
{
  "summary": "Address: 123 Main St, Toronto ON | Tenants: [Sponsor] & [Applicant] | Start Date: 2020-03-01 | Monthly Rent: $2,000 | Status: Active"
}
```

**Employment Letter (Sponsor)**:
```json
{
  "summary": "Employer: ABC Corp | Position: Software Engineer | Salary: $85,000/year | Start Date: 2018-06 | Status: Current"
}
```

### 3. Simple Documents (简单身份文件)

**Characteristics**: Standardized format, information already captured in IRCC forms

**Types**:
- Passport
- Photos (wedding, daily life, with family)
- Birth Certificate
- Marriage Certificate
- Divorce Certificate (if applicable)
- Death Certificate (if applicable)
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
    /representative.*letter/i,
    /explanation.*letter/i,
    /relationship.*statement/i,
    /love.*story/i,
    /statutory.*declaration/i,
    /affidavit/i,
    /refusal.*letter/i,
    /gcms/i
  ]
  
  const structuredDocs = [
    /bank.*statement/i,
    /joint.*account/i,
    /employment.*letter/i,
    /income.*proof/i,
    /tax.*return/i,
    /noa/i,
    /notice.*of.*assessment/i,
    /lease.*agreement/i,
    /rental.*agreement/i,
    /mortgage/i,
    /utility.*bill/i,
    /hydro.*bill/i,
    /gas.*bill/i,
    /internet.*bill/i,
    /phone.*bill/i,
    /insurance.*policy/i,
    /property.*tax/i
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
- How couple met (date, location, circumstances)
- Relationship development timeline
- Cohabitation details
- Marriage/ceremony details (or explanation if no ceremony)
- Current living situation
- Future plans
- Explanation for any unusual circumstances

**Example - Submission Letter**:
```
1. Sponsor met applicant at Algonquin College in Feb 2020 (both students)
2. Started dating immediately, moved in together Mar 2020 at [address]
3. Married Jun 2023 via civil registration only (no ceremony due to COVID-19 restrictions and family unable to travel from China)
4. Currently cohabiting at same address, sponsor works as software engineer, applicant studying
5. Plan to have wedding ceremony in summer 2026 when travel restrictions ease
```

### For Structured Documents

**Format**: Key-value pairs separated by ` | `

**Joint Bank Statement Fields**:
- Account Type (Joint Checking/Savings)
- Account Number (last 4 digits)
- Institution
- Balance
- Period (YYYY-MM)
- Account Holders (both names)

**Lease Agreement Fields**:
- Address
- Tenants (both names)
- Start Date
- Monthly Rent
- Status (Active/Expired)

**Utility Bill Fields**:
- Service Type (Hydro/Gas/Internet/Phone)
- Account Holders (both names or one name)
- Address
- Period (YYYY-MM)
- Amount

## Special Cases

### No Wedding Ceremony

**CRITICAL**: If submission letter explains no ceremony, extract COMPLETE context:

❌ **Wrong** (incomplete):
```json
{
  "summary": "Couple married but no ceremony held"
}
```

✅ **Correct** (complete context):
```json
{
  "summary": "1. Couple married Jun 2023 via civil registration at Toronto City Hall\n2. No ceremony held due to COVID-19 travel restrictions\n3. Applicant's family in China unable to travel\n4. Plan to hold ceremony in summer 2026 when restrictions ease\n5. Have wedding photos from civil registration, no banquet photos"
}
```

### Age Gap / Cultural Differences

If submission letter addresses age gap or cultural differences:
- Extract the explanation
- Note how couple overcomes differences
- Mention family acceptance

**Example**:
```json
{
  "summary": "1. 15-year age gap between sponsor (45) and applicant (30)\n2. Met through mutual friends who introduced them\n3. Share common interests in hiking and cooking\n4. Both families supportive, attended civil registration\n5. Age difference not a concern, both mature and financially stable"
}
```

### Previous Relationships

If explanation letter addresses previous marriages/relationships:
- Extract divorce/separation details
- Note timeline between relationships
- Explain how current relationship is different

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
        "filename": "Submission Letter.pdf",
        "path": "/path/to/Submission Letter.pdf",
        "file_type": "pdf",
        "document_nature": "narrative",
        "summary": "1. Sponsor met applicant at Algonquin College...",
        "full_text_ref": "./tmp/case-123/extracted_docs.json#Submission Letter.pdf"
      },
      {
        "category": "financial",
        "filename": "Joint Bank Statement Jan 2025.pdf",
        "path": "/path/to/Joint Bank Statement Jan 2025.pdf",
        "file_type": "pdf",
        "document_nature": "structured",
        "summary": "Account: Joint Checking *****1234 | Institution: TD Bank...",
        "full_text_ref": "./tmp/case-123/extracted_docs.json#Joint Bank Statement Jan 2025.pdf"
      },
      {
        "category": "identity",
        "filename": "Marriage Certificate.pdf",
        "path": "/path/to/Marriage Certificate.pdf",
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
- [ ] Unusual circumstances (no ceremony, age gap, etc.) have complete explanations
- [ ] Joint documents clearly indicate both parties' names
