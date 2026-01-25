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

## Core Responsibilities

This skill is the **single source of truth** for:

| Responsibility | Implementation | Notes |
|----------------|----------------|-------|
| **Disclaimer** | Required in all tier templates | See `output_constraints.md` - NEVER CUT |
| **Prohibited language** | Enforced at generation | No "Guaranteed", "100%", "Promise", etc. |
| **Length limits** | Per-tier constraints | Guest: 400, Pro: 500, Ultra: 600 lines |
| **Section priorities** | What to cut vs. preserve | Verdict + Poison Pills + Disclaimer = NEVER CUT |

**Important**: App-specific skills (`{app}-reporter`) do NOT need to define disclaimer or compliance rules. These are inherited from `core-reporter`.

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
