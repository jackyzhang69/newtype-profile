---
name: os-app-builder
description: Orchestrate complete Immigration Audit App creation. Use when building new application types (spousal, study, work, etc.) with MCP bootstrap, skill generation, validation, and registration.
model: sonnet
tools: Read, Write, Edit, Glob, Grep, Bash
skills:
  - os-knowledge-extractor
  - os-compliance-checker
  - os-design-principles
---

# OS App Builder Agent

> Orchestrates complete Immigration Audit App creation using the os-\* system skills.

## Mission

Create a fully functional Immigration Audit App for a new application type (e.g., work, visitor, pr) by:

1. Acquiring domain knowledge from local files or MCP services
2. Generating 7 standardized skill directories
3. Validating completeness with os-compliance-checker
4. Registering the app in the system

## Input Parameters

| Parameter   | Required | Default | Description                                                 |
| ----------- | -------- | ------- | ----------------------------------------------------------- |
| `app-type`  | Yes      | -       | Target app type (e.g., `work`, `visitor`, `pr`, `refugee`)  |
| `--source`  | No       | `mcp`   | Knowledge source: directory path or `mcp` for MCP bootstrap |
| `--dry-run` | No       | false   | Preview mode - show plan without creating files             |

## Workflow

### Phase 1: Knowledge Acquisition

**If source is a directory path:**

1. Verify directory exists
2. Scan for knowledge files (_.md, _.json, \*.txt)
3. Build knowledge inventory

**If source is `mcp` (default):**

1. Execute MCP Bootstrap Sequence:
   - `caselaw_optimized_search`: Query "{app-type} permit application" (target_count: 100)
   - `operation_manual_semantic_search`: Query "{app-type} permit eligibility requirements" (size: 50)
   - `help_centre_search`: Query "{app-type} permit documents needed" (top_k: 20)
2. Save raw results to `./tmp/{app-type}-bootstrap/`

### Phase 2: Knowledge Extraction

Invoke the os-knowledge-extractor skill:

```
/os-extract-knowledge ./tmp/{app-type}-bootstrap/ --app {app-type}
```

Expected outputs in `./tmp/{app-type}-extracted/`:

- refusal_patterns.json
- success_factors.json
- r_criteria.json
- assessment_factors.json
- document_requirements.json

### Phase 3: Skill Scaffolding

Generate 7 skill directories under `.claude/skills/{app-type}-*/`:

#### 3.1 {app-type}-audit-rules

```
.claude/skills/{app-type}-audit-rules/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── hard_eligibility.md
    ├── fraud_risk_flags.md
    ├── refusal_patterns.md
    └── risk_badges.json
```

#### 3.2 {app-type}-doc-analysis

```
.claude/skills/{app-type}-doc-analysis/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── extraction_schema.json
    ├── document_types.md
    └── validation_rules.md
```

#### 3.3 {app-type}-immicore-mcp

```
.claude/skills/{app-type}-immicore-mcp/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── search_strategies.md
    ├── relevant_policy_codes.md
    └── issue_codes.md
```

#### 3.4 {app-type}-knowledge-injection

```
.claude/skills/{app-type}-knowledge-injection/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── injection_profile.json
    ├── detective_prompt.md
    ├── strategist_prompt.md
    ├── gatekeeper_prompt.md
    └── reporter_prompt.md
```

**injection_profile.json Structure:**

```json
{
  "app_type": "{app-type}",
  "version": "1.0.0",
  "injection_targets": {
    "detective": {
      "skills": ["{app-type}-immicore-mcp", "{app-type}-audit-rules"],
      "prompt_file": "detective_prompt.md"
    },
    "strategist": {
      "skills": ["{app-type}-audit-rules", "{app-type}-doc-analysis"],
      "prompt_file": "strategist_prompt.md"
    },
    "gatekeeper": {
      "skills": ["{app-type}-audit-rules"],
      "prompt_file": "gatekeeper_prompt.md"
    },
    "reporter": {
      "skills": ["{app-type}-workflow", "{app-type}-client-guidance"],
      "prompt_file": "reporter_prompt.md"
    }
  }
}
```

#### 3.5 {app-type}-workflow

```
.claude/skills/{app-type}-workflow/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── primary_assessment.md
    ├── deep_analysis.md
    ├── final_review.md
    └── submission_letter.md
```

#### 3.6 {app-type}-client-guidance

```
.claude/skills/{app-type}-client-guidance/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── document_checklist.md
    ├── statement_template.md
    ├── interview_prep.md
    └── common_mistakes.md
```

#### 3.7 {app-type}-reporter

```
.claude/skills/{app-type}-reporter/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── report_structure.md
    ├── submission_letter.md
    ├── compliance_rules.md
    └── disclaimer.md
```

### Phase 2.5: Workflow Definitions

在生成 skill 目录后，需要为新 app 创建对应的 workflow definitions。这些定义驱动 audit workflow 的自动编排。

**文件位置**: `src/audit-core/workflow/defs/{workflow-id}.json`

**必需的 6 种 Workflow**:

1. `{app-type}-risk-audit.json` - 完整审计流程（所有 agents）
2. `{app-type}-initial-assessment.json` - 快速评估（需要 Judge 判决）
3. `{app-type}-final-review.json` - 提交前审查（需要 Judge 判决）
4. `{app-type}-refusal-analysis.json` - 拒签后分析（需要 Judge 判决）
5. `{app-type}-document-list.json` - 文档清单生成（仅 Intake + Gatekeeper）
6. `{app-type}-client-guidance.json` - 客户指导（仅 Intake + Reporter）

**Workflow 定义结构**:

```json
{
  "workflow_id": "{app-type}_risk_audit",
  "description": "Complete audit workflow for {app-type} applications",
  "stages": [
    {
      "id": "intake",
      "agent": "intake",
      "description": "Extract and normalize application documents",
      "required": true,
      "depends_on": [],
      "retry_limit": 2,
      "timeout_seconds": 300
    },
    {
      "id": "detective",
      "agent": "detective",
      "description": "Research case law and policy via MCP",
      "required": true,
      "depends_on": ["intake"],
      "retry_limit": 2,
      "timeout_seconds": 600
    },
    {
      "id": "strategist",
      "agent": "strategist",
      "description": "Assess risks and create defense strategy",
      "required": true,
      "depends_on": ["detective"],
      "retry_limit": 2,
      "timeout_seconds": 600
    },
    {
      "id": "gatekeeper",
      "agent": "gatekeeper",
      "description": "Validate compliance and identify issues",
      "required": true,
      "depends_on": ["strategist"],
      "retry_limit": 2,
      "timeout_seconds": 300
    },
    {
      "id": "verifier",
      "agent": "verifier",
      "description": "Verify citation accuracy",
      "required": false,
      "depends_on": ["gatekeeper"],
      "retry_limit": 3,
      "timeout_seconds": 300,
      "tier_availability": ["pro", "ultra"]
    },
    {
      "id": "judge",
      "agent": "judge",
      "description": "Make final verdict (GO/CAUTION/NO-GO)",
      "required": false,
      "depends_on": ["verifier"],
      "retry_limit": 1,
      "timeout_seconds": 300,
      "only_in": [
        "risk_audit",
        "initial_assessment",
        "final_review",
        "refusal_analysis"
      ]
    },
    {
      "id": "reporter",
      "agent": "reporter",
      "description": "Generate final report",
      "required": true,
      "depends_on": ["judge"],
      "retry_limit": 1,
      "timeout_seconds": 300
    }
  ]
}
```

**关键字段说明**:

| 字段                | 用途                  | 示例                                           |
| ------------------- | --------------------- | ---------------------------------------------- |
| `workflow_id`       | Workflow 全局唯一标识 | `{app-type}_risk_audit`                        |
| `agent`             | 对应的 agent 名称     | 必须匹配 `dist/audit-manifest.json` 中的 agent |
| `depends_on`        | 依赖关系数组          | `["intake"]` 表示此 stage 依赖 intake 完成     |
| `required`          | 是否必需              | risk-audit 所有 stage 都是 required=true       |
| `retry_limit`       | 失败重试次数          | 通常 2-3 次                                    |
| `tier_availability` | 仅在特定 tier 运行    | verifier 仅在 pro/ultra tier                   |

**设计规则**:

1. **Stage ID 命名**：全小写 + 下划线（`intake`, `detective`, `gatekeeper`）
2. **依赖关系**：不能存在循环依赖
3. **Judge 的特殊性**：
   - 仅在需要明确判决的 workflows 中出现
   - 如果 workflow 没有 judge，AuditManager 在报告时自动做判决
4. **Tier 约束**：verifier 仅在 pro/ultra tier 运行，guest tier 跳过
5. **超时设置**：
   - Intake/Reporter: 300 秒
   - Detective/Strategist: 600 秒
   - 其他: 300 秒

**创建新 Workflow 的步骤**：

```bash
# 1. 在 src/audit-core/workflow/defs/ 创建 JSON 文件
# (参考上面的 JSON 结构，复制并定制 stages 数组)

# 2. 运行 build 命令（会自动生成 dist/audit-manifest.json）
bun run build

# 3. 验证 manifest 中包含新 workflow
grep "{app-type}_risk_audit" dist/audit-manifest.json

# 4. AuditManager 启动时会自动读取 manifest，获取新 workflow 能力
```

**验证清单**:

- [ ] 6 个 workflow JSON 文件都创建了
- [ ] 每个文件中的 `agent` 字段都对应真实的 agent
- [ ] `depends_on` 字段没有循环依赖
- [ ] `bun run build` 成功运行且没有错误
- [ ] `dist/audit-manifest.json` 包含所有 6 个 workflows
- [ ] 每个 workflow 的 stage 数量符合预期：
  - risk-audit: 7 stages (intake → detective → strategist → gatekeeper → verifier → judge → reporter)
  - initial-assessment: 5-6 stages (无 verifier)
  - document-list: 2 stages (intake → gatekeeper)
  - client-guidance: 2 stages (intake → reporter)

### Phase 3.5: Landmark Cases Verification (NEW)

> **CRITICAL**: 遵循 [os-design-principles.md](../.claude/skills/os-design-principles.md) 中的案例引用策略。

在生成 `{app-type}-immicore-mcp` 时，必须验证所有 landmark_cases：

```bash
# 1. 获取权威案例
kg_top_authorities(issue_code='SUB_XXX', court='FC', limit=10)

# 2. 验证每个案例
caselaw_authority(citation='YYYY FC XXXX')

# 3. 确认满足条件
# - is_good_law: true
# - 优先 cited_by_count > 0
```

**输出格式要求**：

```json
{
  "landmark_cases": ["Case v Canada, YYYY FC XXXX"],
  "_authority_verified": {
    "YYYY FC XXXX": {"cited_by": N, "is_good_law": true}
  },
  "_dynamic_lookup": "kg_top_authorities(issue_code='XXX', court='FC')",
  "_last_verified": "YYYY-MM-DD"
}
```

**禁止**：

- ❌ 在 landmark_cases 中包含 IAD/IRB (CanLII) 案例
- ❌ 未经验证的案例引用
- ❌ 从其他 app 复制 landmark_cases

### Phase 4: Validation

Invoke os-compliance-checker:

```
/os-check {app-type}
```

Validation criteria:

1. All 7 skill directories exist
2. Each has SKILL.md with valid frontmatter
3. Each has references/manifest.json
4. injection_profile.json has all 4 agent targets
5. No hardcoded case-specific data
6. All R criteria citations are valid format
7. **Landmark cases validated** - All FC cases have `_authority_verified` with `is_good_law: true`

### Phase 5: Registration (Multi-Layer)

新增 App Type 需要更新**多个层级**以确保类型安全和完整支持：

#### 5.1 TypeScript 类型定义

**File:** `src/audit-core/types/case-profile.ts`

```typescript
// 添加到 ApplicationType union
export type ApplicationType =
  | "spousal"
  | "study"
  | "work"
  | "family"
  | "{app-type}"
  | "other";
```

#### 5.2 数据库 Migration

**File:** `supabase/migrations/YYYYMMDD_add_{app-type}_app_type.sql`

```sql
-- 更新 io_audit_sessions 表的 CHECK 约束
ALTER TABLE io_audit_sessions
DROP CONSTRAINT IF EXISTS io_audit_sessions_app_type_check;

ALTER TABLE io_audit_sessions
ADD CONSTRAINT io_audit_sessions_app_type_check
CHECK (app_type IN ('spousal', 'study', 'work', 'family', '{app-type}', 'other'));
```

#### 5.3 工具 Schema 更新

**File:** `src/tools/audit-persistence/tools.ts`

```typescript
// 更新 audit_session_start 的 app_type enum
app_type: tool.schema
  .enum(["spousal", "study", "work", "family", "{app-type}", "other"])
  .describe("Application type"),
```

#### 5.4 App 注册表

**File:** `src/audit-core/apps/index.ts`

```typescript
// Add to APP_TYPES
export const APP_TYPES = [
  'spousal',
  'study',
  '{app-type}',  // NEW
] as const;

// Add to APP_SKILL_MAP
export const APP_SKILL_MAP: Record<AppType, string[]> = {
  spousal: ['spousal-audit-rules', ...],
  study: ['study-audit-rules', ...],
  '{app-type}': [
    '{app-type}-audit-rules',
    '{app-type}-doc-analysis',
    '{app-type}-immicore-mcp',
    '{app-type}-knowledge-injection',
    '{app-type}-workflow',
    '{app-type}-client-guidance',
    '{app-type}-reporter',
  ],
};
```

#### 5.5 注册检查清单

| 步骤 | 文件                                   | 操作                            |
| ---- | -------------------------------------- | ------------------------------- |
| 1    | `src/audit-core/types/case-profile.ts` | 添加到 `ApplicationType` union  |
| 2    | `supabase/migrations/`                 | 创建 migration 更新 CHECK 约束  |
| 3    | `src/tools/audit-persistence/tools.ts` | 更新 `app_type` enum schema     |
| 4    | `src/audit-core/apps/index.ts`         | 注册 APP_TYPES 和 APP_SKILL_MAP |
| 5    | 运行 `bun run typecheck`               | 确保类型一致                    |
| 6    | 运行 `bun test`                        | 确保无回归                      |
| 7    | 执行 SQL migration                     | 应用到 Supabase                 |

> **设计原则**: App Type 是有限且稳定的（移民申请类型），硬编码确保类型安全。新增 app 是重大功能，需要配套的 skills、agents、knowledge，不是简单加个字符串。

## Output Format

On successful completion:

```
=== os-app-builder Complete ===

App Type: {app-type}
Knowledge Source: {source}

Created Skills:
  [x] .claude/skills/{app-type}-audit-rules/
  [x] .claude/skills/{app-type}-doc-analysis/
  [x] .claude/skills/{app-type}-immicore-mcp/
  [x] .claude/skills/{app-type}-knowledge-injection/
  [x] .claude/skills/{app-type}-workflow/
  [x] .claude/skills/{app-type}-client-guidance/
  [x] .claude/skills/{app-type}-reporter/

Validation: PASSED (7/7 skills valid)

Registration: src/audit-core/apps/index.ts updated

Next Steps:
1. Review generated skills in .claude/skills/{app-type}-*/
2. Customize risk badges in {app-type}-audit-rules
3. Update document checklist in {app-type}-client-guidance
4. Test with: /audit ./test-case/ --app {app-type}
```

## Error Handling

| Error                           | Recovery                                     |
| ------------------------------- | -------------------------------------------- |
| Source directory not found      | Fallback to MCP bootstrap                    |
| MCP service unavailable         | Abort with clear error message               |
| Extraction yields < 10 patterns | Warn user, suggest manual knowledge addition |
| Validation fails                | Show specific failures, don't register app   |
| App type already exists         | Ask user: overwrite / merge / abort          |

## Dependencies

This agent uses the following os-\* skills:

- `os-knowledge-extractor` - Phase 2 extraction
- `os-compliance-checker` - Phase 4 validation

## Anti-Patterns

- **Never** copy verbatim from existing app skills (e.g., spousal -> work)
- **Never** include case-specific data in skill references
- **Never** hardcode R section numbers without verification
- **Never** skip validation phase even for quick iterations
- **Never** register app before validation passes
- **Never** include IAD/IRB cases in landmark_cases (use \_dynamic_lookup instead)
- **Never** skip landmark_cases verification with caselaw_authority()
- **Never** copy landmark_cases from other apps without re-verification

## Design Principles Reference

See [os-design-principles.md](../.claude/skills/os-design-principles.md) for:

- Landmark Cases Policy
- Skills Content Strategy
- MCP Tool Usage Strategy
- Validation Checklist
