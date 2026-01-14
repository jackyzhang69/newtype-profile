---
name: immigration-knowledge-injection
description: |
  Inject audit_app-specific knowledge and agent prompts into audit workflows.
---

# Knowledge Injection

## Scope
- Read app-specific knowledge from audit-core
- Inject into agent prompts at runtime

## Inputs
- `audit_app` value
- Agent name

## Outputs
- Merged prompt with business context

## Notes
- Use `src/audit-core/apps/<app>` as canonical source
- Do not alter opencode core routing
