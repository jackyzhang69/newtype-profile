# Building Blocks Checklist

Complete validation checklist for Immigration Audit Apps.

## Layer 1: Agent Blocks (7 Required)

### Agent Existence Check

| ID | Agent | File Path | Validation |
|----|-------|-----------|------------|
| A1 | intake | `src/audit-core/agents/intake.ts` | File exists, exports `createIntakeAgent` |
| A2 | audit-manager | `src/audit-core/agents/audit-manager.ts` | File exists, exports `createAuditManagerAgent` |
| A3 | detective | `src/audit-core/agents/detective.ts` | File exists, exports `createDetectiveAgent` |
| A4 | strategist | `src/audit-core/agents/strategist.ts` | File exists, exports `createStrategistAgent` |
| A5 | gatekeeper | `src/audit-core/agents/gatekeeper.ts` | File exists, exports `createGatekeeperAgent` |
| A6 | verifier | `src/audit-core/agents/verifier.ts` | File exists, exports `createVerifierAgent` |
| A7 | reporter | `src/audit-core/agents/reporter.ts` | File exists, exports `createReporterAgent` |

### Agent Registration Check

Verify all agents are registered in `src/audit-core/agents/index.ts`.

## Layer 2: Skill Blocks (Per App)

### Required Skills Pattern: `{app}-*`

| ID | Skill | Required Files | Purpose |
|----|-------|---------------|---------|
| S1 | `{app}-audit-rules` | SKILL.md, manifest.json, baseline_rules.md, risk_patterns.json | Risk assessment |
| S2 | `{app}-doc-analysis` | SKILL.md, manifest.json, baseline_doc_analysis.md | Document extraction |
| S3 | `{app}-immicore-mcp` | SKILL.md, manifest.json, mcp_usage.json | MCP query patterns |
| S4 | `{app}-knowledge-injection` | SKILL.md, manifest.json, injection_profile.json | Injection config |
| S5 | `{app}-workflow` | SKILL.md, manifest.json, *_template.md (4+) | Output templates |
| S6 | `{app}-client-guidance` | SKILL.md, manifest.json, *_guide.md (3+) | Client materials |
| S7 | `{app}-reporter` | SKILL.md, manifest.json, templates | Report generation |

### Skill Directory Structure

```
.claude/skills/{app}-{type}/
├── SKILL.md                  # < 500 lines, has YAML frontmatter
└── references/
    ├── manifest.json         # Required index
    └── *.md | *.json         # Domain content
```

### SKILL.md Validation

```yaml
# Required frontmatter
---
name: {app}-{type}           # Must match directory name
description: |               # Must include trigger scenarios
  Description with use cases.
---
```

## Layer 3: Core Skills (Shared)

### Required Core Skills

| ID | Skill | Validation |
|----|-------|------------|
| C1 | `core-audit-rules` | Directory exists with SKILL.md |
| C2 | `core-doc-analysis` | Directory exists with SKILL.md |
| C3 | `core-immicore-mcp` | Directory exists with SKILL.md |
| C4 | `core-knowledge-injection` | Directory exists with SKILL.md |
| C5 | `core-reporter` | Directory exists with SKILL.md |
| C6 | `learned-guardrails` | Directory exists with SKILL.md |
| C7 | `audit-report-output` | Directory exists with SKILL.md |

## Layer 4: Tier Configuration

### Tier Config Validation

File: `src/audit-core/tiers/config.ts`

| ID | Tier | Required Keys |
|----|------|---------------|
| T1 | guest | `models`, `features`, `limits` |
| T2 | pro | `models`, `features`, `limits` |
| T3 | ultra | `models`, `features`, `limits` |

### Model Assignment Check

Each tier must define models for all agents:
- intake, auditManager, detective, strategist, gatekeeper, verifier, reporter

## Layer 5: Injection Profile

### injection_profile.json Validation

File: `.claude/skills/{app}-knowledge-injection/references/injection_profile.json`

```json
{
  "version": "{app}-v{n}",           // Required
  "description": "...",              // Required
  "skills": {                        // Required
    "{app}-audit-rules": {
      "inject_to": ["agent1", ...],  // Must be valid agent names
      "priority": 1,                 // 1-10
      "files": ["file1.md", ...]     // Must exist in skill
    }
  },
  "injection_order": [...]           // Must list all skills
}
```

### Injection Rules

| Rule | Validation |
|------|------------|
| I1 | All `{app}-*` skills must be in `skills` object |
| I2 | All skills must be in `injection_order` |
| I3 | `inject_to` must use valid agent names |
| I4 | Referenced `files` must exist in skill's `references/` |
| I5 | `priority` must be unique integers 1-10 |

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| CRITICAL | App cannot function | Must fix before use |
| WARNING | Partial functionality | Should fix |
| INFO | Best practice | Optional |

### Critical Issues
- Missing agent file
- Missing required skill
- Invalid injection_profile.json
- Missing tier configuration

### Warning Issues
- Missing optional skill files
- Skill not in injection_order
- Inconsistent priority values

### Info Issues
- SKILL.md > 500 lines
- Missing manifest.json description
- Outdated version string
