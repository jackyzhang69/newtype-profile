---
name: os-app-builder-spec
description: |
  Complete specification for building Immigration Audit Apps.
  Contains skill structure standards, injection profile format, workflow phases,
  validation criteria, registration steps, and anti-patterns.
  
  Use with os-app-builder agent for detailed implementation guidance.
trigger: Used by os-app-builder agent during app creation
---

# OS App Builder Specification

Complete technical specification for creating Immigration Audit Apps.

## Contents

| File | Purpose |
|------|---------|
| `architecture.md` | Building blocks architecture, fixed vs variable layers |
| `skill-structure.md` | Manifest format, reference file organization |
| `injection-profile.md` | Injection profile format, loading mechanism |
| `workflow-phases.md` | Phase 1-5 detailed steps, MCP bootstrap, IRCC extraction |
| `validation-rules.md` | Validation criteria, compliance checks |
| `registration-steps.md` | TypeScript, database, tool schema updates |
| `anti-patterns.md` | Common mistakes and correct approaches |
| `best-practices.md` | Lessons from existing apps (spousal, study, work) |

## Quick Reference

- **7 App Skills**: audit-rules, doc-analysis, immicore-mcp, knowledge-injection, workflow, client-guidance, reporter
- **3 Shared Skills**: learned-guardrails, audit-report-output, core-reporter
- **5 Phases**: Knowledge Acquisition → IRCC Extraction → Knowledge Extraction → Skill Scaffolding → Validation → Registration
