---
name: refugee-immicore-mcp
description: MCP access policy for ImmiCore services used in refugee audits
category: audit
app_type: refugee
version: 1.0.0
---

# Refugee ImmiCore MCP Policy

MCP query patterns and access policy for refugee protection claim audits.

## Available MCP Services

| Service | Port | Purpose |
|---------|------|---------|
| caselaw | 3105 | Federal Court refugee case law |
| operation-manual | 3106 | ENF/OP/IP policy manuals |
| help-centre | 3107 | IRCC Help Centre Q&A |
| noc | 3108 | NOC codes (limited use for refugee) |
| immi-tools | 3109 | Immigration calculators |

## Refugee-Specific Issue Codes

From KG metadata, available refugee issue codes:

| Issue Code | Description | Use Case |
|------------|-------------|----------|
| SUB_REFUGEE_CREDIBILITY | Credibility assessment | Primary refusal ground |
| SUB_REFUGEE_PERSECUTION | Persecution threshold | Defining persecution |
| SUB_REFUGEE_IFA | Internal Flight Alternative | IFA reasonableness |
| SUB_REFUGEE_STATE_PROTECTION | State protection | Rebutting presumption |
| SUB_REFUGEE_IDENTITY | Identity establishment | Identity issues |
| SUB_REFUGEE_EXCLUSION | Article 1F exclusion | Exclusion analysis |
| SUB_REFUGEE_CESSATION | Cessation grounds | Status termination |
| SUB_REFUGEE_SUR_PLACE | Sur place claims | Activities in Canada |
| SUB_REFUGEE_VACATION | Vacation of status | Misrepresentation |
| SUB_PRRA_RISK_ASSESSMENT | PRRA assessment | Pre-removal risk |
| PF_CREDIBILITY | Procedural fairness - credibility | Credibility issues |

## Query Strategy

### Primary Search Approach

**ALWAYS use Federal Court (FC) cases for legal principles**

```
caselaw_optimized_search(
  query="refugee credibility assessment tribunal",
  court="fc",
  target_count=20
)
```

**IRB cases are NOT binding precedent** - use only for factual patterns

### Issue-Specific Queries

#### Credibility Issues

```
kg_top_authorities(issue_code="SUB_REFUGEE_CREDIBILITY", court="FC", limit=10)
caselaw_keyword_search(query="refugee credibility inconsistency", court="fc", top_k=15)
```

#### Persecution Threshold

```
kg_top_authorities(issue_code="SUB_REFUGEE_PERSECUTION", court="FC", limit=10)
caselaw_keyword_search(query="persecution threshold discrimination", court="fc", top_k=15)
```

#### Internal Flight Alternative

```
kg_top_authorities(issue_code="SUB_REFUGEE_IFA", court="FC", limit=10)
caselaw_keyword_search(query="internal flight alternative reasonable", court="fc", top_k=15)
```

#### State Protection

```
kg_top_authorities(issue_code="SUB_REFUGEE_STATE_PROTECTION", court="FC", limit=10)
caselaw_keyword_search(query="state protection presumption rebut", court="fc", top_k=15)
```

#### Exclusion (Article 1F)

```
kg_top_authorities(issue_code="SUB_REFUGEE_EXCLUSION", court="FC", limit=10)
caselaw_keyword_search(query="article 1F exclusion complicity", court="fc", top_k=15)
```

### Operation Manual Queries

Key policies for refugee claims:

```
operation_manual_semantic_search(query="refugee eligibility requirements", size=10)
operation_manual_semantic_search(query="article 1F exclusion grounds", policy_code="enf24-eng", size=10)
operation_manual_semantic_search(query="cessation protected person status", policy_code="enf24-eng", size=10)
operation_manual_semantic_search(query="refugee security screening FESS", size=10)
```

### Help Centre Queries

```
help_centre_search(query="refugee claim documents", lang="en", top_k=10)
help_centre_search(query="basis of claim form", lang="en", top_k=10)
help_centre_search(query="refugee hearing IRB", lang="en", top_k=10)
```

## Authority Verification

### MUST verify all landmark cases

Before citing any case as authority:

```
caselaw_authority(citation="YYYY FC XXXX")
```

**Required criteria**:
- `is_good_law: true`
- Prefer `cited_by_count > 5` for landmark status
- Check `top_citing_cases` for treatment

### Verified Landmark Cases (Refugee)

| Citation | Style | Cited By | Topic |
|----------|-------|----------|-------|
| 2019 FC 14 | Magonza v. Canada | 76 | Credibility, State Protection |

> **CRITICAL**: This list must be refreshed via MCP on each build. Do NOT hardcode cases without verification.

## MCP Tool Selection Guide

| Need | Primary Tool | Fallback |
|------|-------------|----------|
| Legal principles | caselaw_optimized_search | caselaw_keyword_search |
| Top authorities | kg_top_authorities | caselaw_authority |
| Policy guidance | operation_manual_semantic_search | operation_manual_keyword_search |
| Client-facing info | help_centre_search | - |
| Case verification | caselaw_authority | caselaw_validity |

## Query Patterns by Scenario

### Initial Assessment Query Set

```javascript
// 1. Get key authorities for claim type
kg_top_authorities({issue_code: "SUB_REFUGEE_CREDIBILITY", court: "FC", limit: 10})

// 2. Search for similar claims from same country
caselaw_optimized_search({
  query: "refugee [COUNTRY] [PERSECUTION TYPE]",
  court: "fc",
  target_count: 20
})

// 3. Get policy guidance
operation_manual_semantic_search({
  query: "refugee eligibility determination",
  size: 10
})
```

### Specific Issue Research

```javascript
// For IFA issue
caselaw_keyword_search({
  query: "internal flight alternative [COUNTRY] reasonable",
  court: "fc",
  must_include: ["IFA", "reasonable"],
  top_k: 20
})

// For exclusion issue
caselaw_keyword_search({
  query: "article 1F exclusion [ORGANIZATION/CRIME TYPE]",
  court: "fc",
  must_include: ["exclusion", "1F"],
  top_k: 20
})
```

## Anti-Patterns

### DO NOT

- Cite IRB cases as binding precedent
- Include unverified landmark cases
- Hardcode case law without MCP verification
- Use web search before exhausting MCP
- Hallucinate case citations

### ALWAYS

- Verify cases with caselaw_authority()
- Prefer FC/FCA over IRB for legal principles
- Update landmark cases via KG on each run
- Document _authority_verified for all citations
