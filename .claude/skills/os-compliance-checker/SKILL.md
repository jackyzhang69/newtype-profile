---
name: os-compliance-checker
description: |
  Immigration Audit App completeness and compliance checker.
  Validates that an app (spousal, study, work, etc.) has all required building blocks:
  agents, skills, tier configs, and injection profiles.
  Use when: verifying app integrity, before deployment, after app modifications.
  Trigger: /os-check <app-name>
---

# OS Compliance Checker

Validates Immigration Audit App completeness against the building blocks architecture.

## Quick Start

```bash
# Check spousal app completeness
/os-check spousal

# Check study app completeness  
/os-check study

# Check with verbose output
/os-check spousal --verbose
```

## What Gets Checked

### 1. Agent Layer (7 blocks)

Every audit app requires these agents to be properly configured:

| Agent | Required | Location |
|-------|----------|----------|
| intake | Yes | `src/audit-core/agents/intake.ts` |
| audit-manager | Yes | `src/audit-core/agents/audit-manager.ts` |
| detective | Yes | `src/audit-core/agents/detective.ts` |
| strategist | Yes | `src/audit-core/agents/strategist.ts` |
| gatekeeper | Yes | `src/audit-core/agents/gatekeeper.ts` |
| verifier | Yes | `src/audit-core/agents/verifier.ts` |
| reporter | Yes | `src/audit-core/agents/reporter.ts` |

### 2. Skill Layer (Required per App)

Each app must have these skill directories with proper structure:

| Skill Pattern | Purpose | Required Files |
|---------------|---------|----------------|
| `{app}-audit-rules` | Risk patterns, eligibility | SKILL.md, manifest.json, risk_patterns.json |
| `{app}-doc-analysis` | Document extraction rules | SKILL.md, manifest.json, baseline_doc_analysis.md |
| `{app}-immicore-mcp` | MCP query patterns | SKILL.md, manifest.json, mcp_usage.json |
| `{app}-knowledge-injection` | Injection profile | SKILL.md, manifest.json, injection_profile.json |
| `{app}-workflow` | Output templates | SKILL.md, manifest.json, templates |
| `{app}-client-guidance` | Client materials | SKILL.md, manifest.json, guides |
| `{app}-reporter` | Report templates | SKILL.md, manifest.json, templates |

### 3. Core Skills (Shared)

These must exist and be referenced:

- `core-audit-rules`
- `core-doc-analysis`
- `core-immicore-mcp`
- `core-knowledge-injection`
- `core-reporter`
- `learned-guardrails`
- `audit-report-output`

### 4. Tier Configuration

Verify tier config exists in `src/audit-core/tiers/config.ts`:

- Guest tier: model assignments
- Pro tier: model assignments  
- Ultra tier: model assignments

### 5. Injection Profile Validation

The `{app}-knowledge-injection/references/injection_profile.json` must:

- Reference all app-specific skills
- Define proper `inject_to` targets per skill
- Maintain correct `injection_order`
- Use valid `priority` values (1-10)

## Output Format

```markdown
## App Compliance Report: {app}

### Summary
- Status: PASS | PARTIAL | FAIL
- Score: {completed}/{total} ({percentage}%)
- Critical Issues: {count}

### Agent Layer (7/7)
- [x] intake
- [x] audit-manager
...

### Skill Layer ({n}/{m})
- [x] {app}-audit-rules (5 files)
- [ ] {app}-workflow - MISSING: submission_letter_template.md
...

### Injection Profile
- [x] All skills referenced
- [ ] ISSUE: {app}-workflow not in injection_order

### Recommendations
1. Add missing file: {app}-workflow/references/submission_letter_template.md
2. Update injection_profile.json to include {skill}
```

## What Is NOT Checked (Out of Scope)

The following are **not** validated by os-compliance-checker because they belong to other layers:

| Item | Responsible Layer | Why |
|------|-------------------|-----|
| **Disclaimer text** | `core-reporter` skill + Reporter agent | Disclaimer is a report output concern, not an app structure concern. The `core-reporter` skill enforces disclaimer in all tier templates. |
| **Prohibited language** | Reporter agent prompt | Language compliance (no "Guaranteed", "100%", etc.) is enforced at generation time by the Reporter agent, not at skill level. |
| **Report format/length** | `core-reporter` + tier config | Output constraints are tier-specific and enforced by the Reporter agent using `core-reporter` rules. |
| **Citation accuracy** | Verifier agent | Citation validation happens at runtime, not during app compliance check. |

**Principle**: App compliance checks validate *structure* (skills, files, injection profiles). Content *quality* is enforced by agents at runtime.

## Validation Rules

See [building_blocks_checklist.md](references/building_blocks_checklist.md) for complete rules.
