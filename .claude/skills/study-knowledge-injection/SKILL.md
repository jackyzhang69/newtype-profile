---
name: study-knowledge-injection
description: |
  Inject study permit audit knowledge and agent prompts into audit workflows.
---

# Knowledge Injection

## Scope
- Read skill references as canonical knowledge
- Inject into agent prompts at runtime

## Inputs
- `audit_app` value
- Agent name

## Outputs
- Merged prompt with business context

## Notes
- Prefer `.claude/skills/<skill>/references` as canonical source
- App guides are deprecated and should not be used
- Do not alter opencode core routing
