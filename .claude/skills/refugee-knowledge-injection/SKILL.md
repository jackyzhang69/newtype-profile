---
name: refugee-knowledge-injection
description: Inject refugee audit knowledge and agent prompts into audit workflows
category: audit
app_type: refugee
version: 1.0.0
---

# Refugee Knowledge Injection

Configuration for injecting refugee-specific knowledge into audit workflow agents.

## Skill Mapping Overview

| Skill | Injects To | Priority | Purpose |
|-------|-----------|----------|---------|
| refugee-audit-rules | Detective, Strategist, Gatekeeper | 1 | Risk patterns, eligibility |
| refugee-doc-analysis | Detective, Strategist | 2 | Document analysis rules |
| refugee-immicore-mcp | Detective | 3 | MCP query patterns |
| refugee-workflow | Strategist, Gatekeeper | 4 | Workflow templates |
| refugee-client-guidance | Gatekeeper | 5 | Client guidance |
| learned-guardrails | Gatekeeper | 6 | Semantic verification (shared) |
| audit-report-output | Reporter | 7 | Report format (shared) |
| core-reporter | Reporter | 8 | Cross-app rules (shared) |
| refugee-reporter | Reporter | 9 | Refugee-specific templates |

## Agent Focus Areas

### Detective

**Focus**: Case law search and pattern identification

**Skills injected**:
- refugee-immicore-mcp (MCP query patterns)
- refugee-audit-rules (what to look for)
- refugee-doc-analysis (evidence interpretation)

**Prompt focus**:
- Find relevant Federal Court precedent
- Identify refusal patterns from similar cases
- Search for country-specific jurisprudence

### Strategist

**Focus**: Risk assessment and defense strategy

**Skills injected**:
- refugee-audit-rules (risk patterns)
- refugee-doc-analysis (evidence standards)
- refugee-workflow (assessment templates)

**Prompt focus**:
- Assess claim strength on each element
- Identify weaknesses and mitigation strategies
- Plan evidence gathering approach

### Gatekeeper

**Focus**: Compliance check and quality control

**Skills injected**:
- refugee-audit-rules (eligibility rules)
- refugee-workflow (compliance checklist)
- refugee-client-guidance (preparation needs)
- learned-guardrails (semantic verification)

**Prompt focus**:
- Verify all eligibility requirements
- Check for exclusion grounds
- Identify documentation gaps

### Reporter

**Focus**: Report synthesis and output

**Skills injected**:
- refugee-reporter (refugee-specific templates)
- core-reporter (cross-app rules)
- audit-report-output (format specification)

**Prompt focus**:
- Synthesize agent findings
- Generate professional report
- Apply Judicial Authority theme

## Injection Order

The 9 skills are injected in this order:

1. **refugee-audit-rules** - Foundation rules and risk patterns
2. **refugee-doc-analysis** - Document handling rules
3. **refugee-immicore-mcp** - MCP search guidance
4. **refugee-workflow** - Internal workflow templates
5. **refugee-client-guidance** - Client-facing materials
6. **learned-guardrails** - Semantic verification (shared)
7. **audit-report-output** - Output format (shared)
8. **core-reporter** - Reporter rules (shared)
9. **refugee-reporter** - Refugee-specific reporter templates

## Configuration

See `references/injection_profile.json` for the complete configuration.
