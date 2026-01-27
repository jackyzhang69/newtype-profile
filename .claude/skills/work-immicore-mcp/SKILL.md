---
name: work-immicore-mcp
description: MCP access policy for ImmiCore services (caselaw, operation manual, help centre) for work permit audits
category: audit
app_type: work
version: 1.0.0
---

# Work Permit MCP Integration

Access policy and strategies for ImmiCore MCP services used in work permit audits.

## MCP Services Overview

### Service 1: Caselaw Search (Port 3105)
Search Federal Court decisions on work permit cases
- **Query Pattern**: Work permit AND (LMIA OR employer OR credential OR intent)
- **Target**: 20-30 relevant cases per audit
- **Court**: FC (Federal Court) - exclude IAD/IRB
- **Result Field**: Citation, ratio, outcome

### Service 2: Operation Manual Search (Port 3106)
Search IRCC operation manuals for work permit policy
- **Query Pattern**: Work Permit, R200, LMIA requirements
- **Target**: 10-15 policy sections per audit
- **Content**: Processing instructions, assessment guidelines
- **Result Field**: Manual section, directive, requirements

### Service 3: Help Centre Search (Port 3107)
Search IRCC Help Centre for applicant-facing guidance
- **Query Pattern**: Work permit application, LMIA, employer obligations
- **Target**: 5-10 guidance articles per audit
- **Content**: Step-by-step instructions, FAQ answers
- **Result Field**: Article title, guidance, process

### Service 4: NOC Search (Port 3108)
Search National Occupational Classification codes
- **Query Pattern**: Occupation title or NOC code
- **Target**: Verify job classification
- **Content**: NOC 2021 definitions and skill requirements
- **Result Field**: Code, title, definition, examples

### Service 5: Immi-Tools Search (Port 3109)
Search IRCC calculator and forms database
- **Query Pattern**: Work permit, salary, calculation
- **Target**: Tool references and forms (e.g., IMM 5257)
- **Content**: Tool documentation, form requirements
- **Result Field**: Tool name, purpose, link

## Search Strategies by Audit Phase

### Phase 1: LMIA Compliance Review
**Detective Agent Task**: Validate LMIA requirements and outcomes

```
Primary Search (Caselaw):
- Query: "Labour Market Opinion" AND "positive assessment"
- Filter: FC cases only, 2020-2025
- Goal: Understand what validates/invalidates LMIA

Secondary Search (Operation Manual):
- Query: "LMIA", "Service Canada", "labour market opinion"
- Goal: Current policy on LMIA assessment criteria

Tertiary Search (Immi-Tools):
- Query: "LMIA", "calculator"
- Goal: Any IRCC tools for LMIA validation
```

### Phase 2: Employer Legitimacy
**Detective Agent Task**: Assess employer fraud risk

```
Primary Search (Caselaw):
- Query: "employer" AND ("fraud" OR "misrepresentation" OR "shell")
- Filter: FC cases showing employer issues
- Goal: Case precedents on employer fraud

Secondary Search (Operation Manual):
- Query: "employer", "legitimate business", "verification"
- Goal: Verification procedures and assessment

Tertiary Search (Help Centre):
- Query: "employer", "authorized", "verification"
- Goal: Applicant-facing guidance on employer role
```

### Phase 3: Credential Assessment
**Strategist Agent Task**: Evaluate applicant qualifications

```
Primary Search (Caselaw):
- Query: "credential" OR "qualification" OR "education" AND "work permit"
- Filter: FC cases showing credential issues
- Goal: Case law on credential sufficiency assessment

Secondary Search (NOC):
- Query: [Job title or NOC code]
- Goal: Required education level for position

Tertiary Search (Operation Manual):
- Query: "credential assessment", "education", "work permit eligibility"
- Goal: Policy on credential evaluation
```

### Phase 4: Intent and Ties Assessment
**Strategist Agent Task**: Evaluate settlement intent signals

```
Primary Search (Caselaw):
- Query: "intent" AND ("temporary" OR "settlement" OR "ties")
- Filter: FC cases on intent determination
- Goal: Case law on how courts assess intent

Secondary Search (Operation Manual):
- Query: "temporary", "intent to return", "ties to country"
- Goal: Policy guidance on intent assessment

Tertiary Search (Help Centre):
- Query: "ties", "return", "permanent residence"
- Goal: IRCC guidance to applicants on ties
```

## Key Case Law Themes

### Theme 1: Genuine Position Test
**Search Query**: "genuine" AND "position" AND "work permit"
**Court Reasoning**: Job offer must be for real substantive employment
**Relevant Cases**: Cases dismissing applications for fabricated positions
**Defense Strategy**: Comprehensive job description, employer documentation

### Theme 2: LMIA Compliance
**Search Query**: "Labour Market Opinion" AND ("negative" OR "requirement")
**Court Reasoning**: LMIA positive assessment is mandatory (unless exempt)
**Relevant Cases**: Cases rejecting applicants without valid LMIA
**Defense Strategy**: Obtain LMIA before applying; verify details match

### Theme 3: Employer Legitimacy
**Search Query**: "employer" AND ("fraud" OR "misrepresentation" OR "false")
**Court Reasoning**: Officer must assess employer as legitimate entity
**Relevant Cases**: Cases where employers were found fraudulent
**Defense Strategy**: Employer company registration, financial statements

### Theme 4: Credential Sufficiency
**Search Query**: ("credential" OR "qualification") AND ("insufficient" OR "match")
**Court Reasoning**: Officer must assess whether applicant can perform duties
**Relevant Cases**: Cases dismissing for credential insufficiency
**Defense Strategy**: Education verification, experience documentation

### Theme 5: Immigrant Intent
**Search Query**: ("intent" OR "settle") AND ("permanent" OR "temporary")
**Court Reasoning**: Applicant must demonstrate intent to leave Canada
**Relevant Cases**: Cases discussing immigrant intent signals
**Defense Strategy**: Family abroad, property ties, explicit return plan

## Policy Code References

### Critical Policy Documents

**R200 - Work Permit Eligibility**
- Search Query: "R200"
- Manual Section: IRCC Operation Manual - Work Permits
- Key Topics: Basic eligibility, LMIA requirement, assessment criteria

**LMIA Requirements**
- Search Query: "Labour Market Opinion", "LMIA"
- Manual Section: IRCC Operation Manual - Employer Labour Market Opinion
- Key Topics: When required, approval process, wage assessment

**Employer Authorization Program**
- Search Query: "International Mobility Program"
- Manual Section: IRCC Operation Manual - International Mobility Program
- Key Topics: Significant Benefits exemption, reciprocal agreements

**Admissibility**
- Search Query: "inadmissibility", "security", "criminality"
- Manual Section: IRCC Operation Manual - Inadmissibility
- Key Topics: Automatic bars, waivable grounds, assessment

## Issue Code Mapping

| Issue | Description | Search Code |
|-------|-------------|------------|
| LMIA_COMPLIANCE | Labour Market Opinion requirements | LMIA_REQ |
| EMPLOYER_LEGITIMACY | Employer fraud, false position | EMPL_LEGIT |
| CREDENTIAL_MATCH | Education/experience sufficiency | CRED_MATCH |
| INTENT_DETERMINATION | Temporary vs. settlement intent | INTENT_ASSESS |
| WAGE_COMPLIANCE | Prevailing wage requirements | WAGE_PREV |
| ADMISSIBILITY | Inadmissibility grounds | INADMIS |
| DOCUMENT_FRAUD | False documents, misrepresentation | DOC_FRAUD |

## Landmark Cases (FC/FCA Only)

**FC Work Permit Cases** (verified):
- Focus on employer legitimacy, genuine position test
- Address LMIA compliance and wage assessment
- Discuss intent and ties evaluation

**FCA Work Permit Decisions**:
- Appeals on procedural fairness
- Reasonableness of discretionary decisions
- Credential and capability assessment

**Note**: All landmark cases verified as good law (is_good_law: true) via caselaw_authority()

**Dynamic Lookup**: For latest cases, use kg_top_authorities(issue_code='LMIA_REQ', court='FC', limit=5)

## Search Service Configuration

### Environment Variables
```
AUDIT_MCP_TRANSPORT=http     # Use HTTP transport
SEARCH_SERVICE_TOKEN=xxx      # Authentication token
```

### Health Check
```bash
curl -s http://localhost:3105/health
```

### Error Handling
If service unavailable:
1. Continue with available caselaw in memory
2. Fallback to operation manual guidance
3. Use help centre information
4. Document missing research in audit report

## Search Best Practices

### Do
- Start with specific case law searches
- Consult operation manual for policy baseline
- Cross-reference help centre for applicant perspective
- Verify court citations in caselaw results
- Use multiple search angles for comprehensive coverage

### Do Not
- Rely solely on caselaw without operation manual
- Use IAD/IRB decisions (use FC/FCA only)
- Assume policy hasn't changed without operation manual check
- Include search results without verifying citations
- Use help centre guidance as legal authority

## Integration with Audit Workflow

### Detective Agent Phase
- Search caselaw for applicable precedents
- Consult operation manual on procedural requirements
- Build risk assessment framework from cases

### Strategist Agent Phase
- Search for cases addressing specific risk factors
- Identify defense strategies from legal reasoning
- Build evidence plan based on case law

### Verifier Agent Phase
- Verify all cited case law exists
- Check case remains good law
- Validate citation format

## Report Integration

Include MCP research in audit report:
- Key caselaw findings in risk assessment
- Policy baseline from operation manual
- Applicant-facing guidance from help centre
- Landmark cases for each identified risk pattern

## See Also

- [search_strategies.md](references/search_strategies.md) - Detailed search patterns
- [relevant_policy_codes.md](references/relevant_policy_codes.md) - Policy reference
- [issue_codes.md](references/issue_codes.md) - Issue classification
