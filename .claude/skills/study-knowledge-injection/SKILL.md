---
name: study-knowledge-injection
description: |
  Inject study permit audit knowledge and agent prompts into audit workflows.
  Defines which skills inject to which agents and in what order.
---

# Study Knowledge Injection

## Scope
- Read skill references as canonical knowledge
- Inject into agent prompts at runtime
- Define skill-to-agent mapping

## Injection Mapping

| Skill | Injects To | Priority | Purpose |
|-------|------------|----------|---------|
| study-audit-rules | Detective, Strategist, Gatekeeper | 1 | Risk patterns, eligibility rules |
| study-doc-analysis | Detective, Strategist | 2 | Document analysis, extraction |
| study-immicore-mcp | Detective | 3 | Caselaw query patterns |
| study-workflow | Strategist, Gatekeeper | 4 | Workflow templates |
| study-client-guidance | Gatekeeper | 5 | Client-facing guides |
| learned-guardrails | Gatekeeper | 6 | Semantic verification |
| audit-report-output | Reporter | 7 | Report format templates |
| core-reporter | Reporter | 8 | Cross-app synthesis rules |
| study-reporter | Reporter | 9 | Study-specific templates |

## Agent-Skill Matrix

```
Detective:
  - study-audit-rules (risk patterns)
  - study-doc-analysis (document types)
  - study-immicore-mcp (caselaw patterns)

Strategist:
  - study-audit-rules (eligibility rules)
  - study-doc-analysis (evidence standards)
  - study-workflow (analysis templates)

Gatekeeper:
  - study-audit-rules (risk framework)
  - study-workflow (review templates)
  - study-client-guidance (client docs)
  - learned-guardrails (verification)

Reporter:
  - audit-report-output (format)
  - core-reporter (synthesis)
  - study-reporter (templates)
```

## Inputs
- `audit_app` value (must be "study")
- Agent name (detective, strategist, gatekeeper, reporter)

## Outputs
- Merged prompt with study permit business context

## Notes
- Prefer `.claude/skills/<skill>/references` as canonical source
- Skills are injected in priority order
- Do not alter opencode core routing

## Reference Files
- `references/injection_profile.json` - Full injection configuration
- `references/manifest.json` - Skill metadata
