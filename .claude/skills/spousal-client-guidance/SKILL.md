---
name: spousal-client-guidance
description: |
  Client guidance templates for spousal sponsorship applications.
  Helps clients prepare relationship statements, interview preparation, and document checklists.
---

# Spousal Client Guidance

## Scope

- Guide clients on preparing application materials
- Provide templates for relationship statements (Love Story)
- Help clients prepare for potential interviews
- Generate customized document checklists

## Use Cases

1. **Post-Audit Guidance** - After audit identifies what materials are needed
2. **Client Consultation** - Initial meeting to explain requirements
3. **Document Preparation** - Help clients gather and organize evidence
4. **Interview Prep** - Prepare clients for potential IRCC interviews

## Available Guides

| Guide | Purpose | Language |
|-------|---------|----------|
| `love_story_guide.md` | How to write relationship statement | Chinese |
| `interview_guide.md` | Interview preparation framework | Chinese |
| `document_list_guide.md` | Document checklist generation | Chinese |

## Inputs

- Client profile (sponsor and applicant)
- Relationship timeline and key events
- Identified risk areas from audit

## Outputs

- Customized relationship statement template
- Interview question preparation guide
- Personalized document checklist with priorities

## Usage Notes

- **love_story_guide.md**: Template for clients to write their relationship narrative
  - Covers: meeting, development, decision to marry, future plans
  - Includes: evidence checklist, writing tips, format requirements
  
- **interview_guide.md**: Framework for generating interview preparation outlines
  - Covers: basic info, relationship history, genuineness indicators, risk areas
  - Includes: question types, design principles, legal references

- **document_list_guide.md**: Based on IMM 5533 Part B requirements
  - Generates customized checklists based on client situation
  - Includes: priority levels, specifications, alternative documents

## Integration with Audit Workflow

```
Audit Complete
     │
     ▼
Risk Identified ──→ Generate targeted guidance
     │
     ▼
Document Gaps ──→ Generate document checklist
     │
     ▼
Client Meeting ──→ Use interview guide
     │
     ▼
Material Prep ──→ Use love story template
```
