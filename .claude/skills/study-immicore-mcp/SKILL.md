---
name: study-immicore-mcp
description: |
  MCP access policy for ImmiCore services used in study audits (caselaw, operation manual, help-centre, noc, immi-tools).
---

# ImmiCore MCP Access Policy

## Scope
- Query caselaw, operation manuals, help centre
- Optional: NOC and tools

## Rules
- MCP is primary data source
- Web search only on explicit fallback conditions

## Outputs
- Structured citations and confidence rating

## Notes
- Enforce domain whitelist when web fallback is needed

## Inheritance
- **Base Policy**: Inherits from `core-immicore-mcp/references/baseline_mcp_policy.md`
- **Design Principles**: Follows `os-design-principles.md` landmark cases policy
- **Query Patterns**: See `references/caselaw_query_patterns.json` (v3.0)

## Study-Specific Query Patterns

Located in `references/caselaw_query_patterns.json`:

### Verified FC Landmark Cases

| Case | Citation | cited_by | Key Principle |
|------|----------|----------|---------------|
| Gill v Canada | 2008 FC 365 | 1 | Genuine intent standard for study permits |
| Vehniwal v Canada | 2007 FC 279 | 2 | Career relevance assessment |
| Siddique v Canada | 2022 FC 964 | 1 | Study plan reasonableness |
| Vavilov | 2019 SCC 65 | 1+ | Standard of review (reasonableness) |
| Baker v Canada | [1999] 2 SCR 817 | 154 | Procedural fairness |

### Issue Codes for KG Search

| Issue Code | Description | Use Case |
|------------|-------------|----------|
| SUB_STUDY_PLAN | Study plan issues | Genuine intent, career relevance |
| SUB_FUNDS | Financial capacity | Funds sufficiency, source |
| SUB_TIES_HOME | Ties to home country | Family, employment, property |
| SUB_MISREP_S40 | Misrepresentation | False documents, material misrep |
| PF_OPPORTUNITY_RESPOND | Procedural fairness | Right to respond |

### Dynamic Lookup Strategy

For issues without verified FC landmarks in the skill file:
1. Use `kg_top_authorities(issue_code='...', court='FC', limit=5)` for current authorities
2. Verify with `caselaw_authority(citation='...')` before citing
3. IAD/IRB cases should be retrieved dynamically, not hardcoded
