# Building Blocks Architecture

Immigration Audit OS uses a **modular building blocks architecture**:

```
+---------------------------------------------------------------------+
|                      FIXED LAYER (Immutable)                        |
+---------------------------------------------------------------------+
|  8 Agents (Fixed - do NOT create new agents for new apps)           |
|  +-- Intake       -> Document extraction, case profile              |
|  +-- AuditManager -> Workflow orchestration (state machine)         |
|  +-- Detective    -> Case law search via MCP                        |
|  +-- Strategist   -> Risk assessment, defense strategy              |
|  +-- Gatekeeper   -> Compliance check, refusal triggers             |
|  +-- Verifier     -> Citation validation (Pro+ only)                |
|  +-- Judge        -> Final verdict (Pro+ only)                      |
|  +-- Reporter     -> Report generation                              |
+---------------------------------------------------------------------+
|  6 Workflows (Fixed - do NOT create new workflows for new apps)     |
|  +-- risk-audit         -> 7 stages (full audit)                    |
|  +-- initial-assessment -> 7 stages (quick viability)               |
|  +-- final-review       -> 8 stages (pre-submission QA)             |
|  +-- refusal-analysis   -> 8 stages (post-refusal strategy)         |
|  +-- document-list      -> 3 stages (document checklist)            |
|  +-- client-guidance    -> 3 stages (client preparation)            |
+---------------------------------------------------------------------+
|                      VARIABLE LAYER (Customizable)                  |
+---------------------------------------------------------------------+
|  App Skills (Knowledge Blocks) <- os-app-builder creates these      |
|  +-- {app}-audit-rules          -> Risk rules, eligibility checks   |
|  +-- {app}-doc-analysis         -> Document analysis, evidence      |
|  +-- {app}-immicore-mcp         -> MCP query patterns               |
|  +-- {app}-knowledge-injection  -> Injection configuration          |
|  +-- {app}-workflow             -> Workflow templates               |
|  +-- {app}-client-guidance      -> Client guidance materials        |
|  +-- {app}-reporter             -> Report templates                 |
|  +-- (shared) learned-guardrails                                    |
|  +-- (shared) audit-report-output                                   |
|  +-- (shared) core-reporter                                         |
+---------------------------------------------------------------------+
|                      ASSEMBLY LAYER (Registration)                  |
+---------------------------------------------------------------------+
|  Registration (Connect to system)                                   |
|  +-- src/audit-core/types/case-profile.ts  -> ApplicationType       |
|  +-- src/tools/audit-persistence/tools.ts  -> app_type enum         |
|  +-- supabase/migrations/                  -> DB constraint          |
+---------------------------------------------------------------------+
```

## Core Principles

1. **Agents and Workflows are FIXED** - do NOT create new agents for new apps
2. **Skills are knowledge blocks** - each app has 7 app-specific + 3 shared skills
3. **Registration enables usage** - no agent code changes needed

## Agent-Skill Injection Matrix

| Agent | App Skills | Shared Skills |
|-------|------------|---------------|
| Detective | {app}-immicore-mcp, {app}-audit-rules, {app}-doc-analysis | - |
| Strategist | {app}-audit-rules, {app}-doc-analysis, {app}-workflow | - |
| Gatekeeper | {app}-audit-rules, {app}-workflow, {app}-client-guidance | learned-guardrails |
| Reporter | {app}-reporter | core-reporter, audit-report-output |
| Verifier | - | - (uses MCP directly) |
| Judge | - | - (synthesizes agent outputs) |
| Intake | - | - (pure extraction) |
| AuditManager | - | - (orchestration only) |
