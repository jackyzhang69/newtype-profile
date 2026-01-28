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

### 1. Agent Layer (8 blocks)

Every audit app requires these agents to be properly configured:

| Agent | Required | Location |
|-------|----------|----------|
| intake | Yes | `src/audit-core/agents/intake.ts` |
| audit-manager | Yes | `src/audit-core/agents/audit-manager.ts` |
| detective | Yes | `src/audit-core/agents/detective.ts` |
| strategist | Yes | `src/audit-core/agents/strategist.ts` |
| gatekeeper | Yes | `src/audit-core/agents/gatekeeper.ts` |
| verifier | Yes | `src/audit-core/agents/verifier.ts` |
| judge | Yes | `src/audit-core/agents/judge.ts` |
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

### 6. Landmark Cases Validation

> **NEW**: 遵循 [os-design-principles.md](../os-design-principles.md) 中的案例引用策略。

The `{app}-immicore-mcp/references/caselaw_query_patterns.json` must:

| 检查项 | 要求 | 验证方法 |
|--------|------|----------|
| **案例类型** | 仅 FC/FCA/SCC 权威案例 | 检查引用格式 |
| **权威性验证** | 每个案例有 `_authority_verified` | 检查字段存在 |
| **有效性确认** | 所有案例 `is_good_law: true` | 检查验证记录 |
| **动态获取指导** | 有 `_dynamic_lookup` 字段 | 检查字段存在 |
| **验证时效** | `_last_verified` 在 90 天内 | 检查日期 |

**验证命令**：
```bash
caselaw_authority(citation='YYYY FC XXXX')
# 确认 is_good_law=true
```

**不合规情况**：
- ❌ 包含 IAD/IRB (CanLII) 案例在 `landmark_cases` 中
- ❌ 缺少 `_authority_verified` 验证记录
- ❌ 案例 `is_good_law: false`
- ❌ `_last_verified` 超过 90 天未更新

## Output Format

```markdown
## App Compliance Report: {app}

### Summary
- Status: PASS | PARTIAL | FAIL
- Score: {completed}/{total} ({percentage}%)
- Critical Issues: {count}

### Agent Layer (8/8)
- [x] intake
- [x] audit-manager
- [x] judge
...

### Skill Layer ({n}/{m})
- [x] {app}-audit-rules (5 files)
- [ ] {app}-workflow - MISSING: submission_letter_template.md
...

### Injection Profile
- [x] All skills referenced
- [ ] ISSUE: {app}-workflow not in injection_order

### Landmark Cases Validation
- [x] All cases are FC/FCA/SCC (no IAD/IRB)
- [x] All cases have _authority_verified
- [x] All cases is_good_law=true
- [x] _last_verified within 90 days
- [ ] ISSUE: Case "XXXX CanLII YYYY" is IAD, should use _dynamic_lookup

### Recommendations
1. Add missing file: {app}-workflow/references/submission_letter_template.md
2. Update injection_profile.json to include {skill}
3. Remove IAD cases from landmark_cases, add _dynamic_lookup instead
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
