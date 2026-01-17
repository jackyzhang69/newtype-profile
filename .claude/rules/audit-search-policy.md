---
globs: ["src/audit-core/**", "**/detective*", "**/strategist*"]
alwaysApply: false
---

# Audit Search Policy

## CRITICAL: MCP First

When working on audit-related code or acting as Detective/Strategist:

### Search Priority (MANDATORY)
1. **MCP Services FIRST** - caselaw, operation-manual, help-centre
2. **Knowledge Graph** - kg_search, kg_similar_cases (parallel, not fallback)
3. **Web Search** - ONLY if MCP unavailable, with domain restrictions

### Domain Whitelist
| Category | Domains | Confidence |
|----------|---------|------------|
| Government | ircc.gc.ca, canada.ca, esdc.gc.ca | High |
| Professional | gands.com, fragomen.com | Medium |
| Public | x.com, reddit.com | Low |

### Tool Restrictions for Audit Agents
- **Detective**: NO webfetch - use MCP tools only
- **Strategist**: NO webfetch - use MCP tools only
- **Verifier**: MCP only for citation validation

### NEVER
- Hallucinate case citations
- Use web search before trying MCP
- Cite sources without confidence level
- Fetch from unwhitelisted domains
