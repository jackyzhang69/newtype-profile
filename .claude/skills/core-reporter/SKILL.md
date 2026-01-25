---
name: core-reporter
description: Core Reporter skill providing cross-app rules for synthesizing agent outputs into professional reports. Defines extraction rules, length constraints, and integration with Anthropic document skills.
version: 1.0.0
tags:
  - audit
  - reporter
  - core
---

# Core Reporter Skill

Cross-application rules for the Reporter agent. Defines how to extract content from each agent's output, enforce tier-based constraints, and generate final documents.

## Inheritance

This skill provides the **baseline** for all Reporter operations. App-specific skills (e.g., `spousal-reporter`, `study-reporter`) extend this with application-specific templates and content.

## Synthesis Rules

See `references/synthesis_rules.md` for detailed extraction logic per agent.

## Output Constraints

See `references/output_constraints.md` for tier-based length limits and priority rules.

## Document Generation

See `references/document_generation.md` for integration with Anthropic pdf skill and theme application.

## Skill Dependencies

```yaml
depends_on:
  - audit-report-output  # Theme and report structure
```

## Files

| File | Purpose |
|------|---------|
| `references/synthesis_rules.md` | How to extract content from each agent |
| `references/output_constraints.md` | Tier-based length limits |
| `references/document_generation.md` | PDF/DOCX generation integration |
| `references/manifest.json` | Skill manifest |
