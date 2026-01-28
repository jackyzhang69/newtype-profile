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

## 🧱 Building Blocks Architecture

Immigration Audit OS 采用**搭积木式架构**：

```
┌─────────────────────────────────────────────────────────────────┐
│                      FIXED LAYER (不变)                         │
├─────────────────────────────────────────────────────────────────┤
│  8 Agents (固定)                                                │
│  ├── Intake      → 文档提取、案件概况                           │
│  ├── Detective   → 案例法搜索 (MCP)                             │
│  ├── Strategist  → 风险评估、辩护策略                           │
│  ├── Gatekeeper  → 合规检查、拒签风险                           │
│  ├── Verifier    → 引用验证 (Pro+ only)                         │
│  ├── Judge       → 最终判决 (Pro+ only)                         │
│  ├── Reporter    → 报告生成                                     │
│  └── AuditManager → 工作流编排                                  │
├─────────────────────────────────────────────────────────────────┤
│  6 Workflows (固定)                                             │
│  ├── risk-audit         → 7 stages (完整审计)                   │
│  ├── initial-assessment → 7 stages (快速评估)                   │
│  ├── final-review       → 8 stages (提交前审查)                 │
│  ├── refusal-analysis   → 8 stages (拒签分析)                   │
│  ├── document-list      → 3 stages (文档清单)                   │
│  └── client-guidance    → 3 stages (客户指导)                   │
├─────────────────────────────────────────────────────────────────┤
│                      VARIABLE LAYER (可变)                      │
├─────────────────────────────────────────────────────────────────┤
│  App Skills (知识积木) ← 本 Agent 负责创建                      │
│  ├── {app}-audit-rules        → 风险规则、资格检查              │
│  ├── {app}-doc-analysis       → 文档分析、证据标准              │
│  ├── {app}-immicore-mcp       → MCP 查询模式                    │
│  ├── {app}-knowledge-injection → 知识注入配置                   │
│  ├── {app}-workflow           → 工作流模板                      │
│  ├── {app}-client-guidance    → 客户指导材料                    │
│  └── {app}-reporter           → 报告模板                        │
├─────────────────────────────────────────────────────────────────┤
│                      ASSEMBLY LAYER (装配)                      │
├─────────────────────────────────────────────────────────────────┤
│  Registration (注册到系统)                                      │
│  ├── src/audit-core/apps/index.ts    → APP_SKILL_MAP            │
│  ├── src/audit-core/types/           → ApplicationType          │
│  └── src/tools/audit-persistence/    → app_type enum            │
└─────────────────────────────────────────────────────────────────┘
```

**核心原则**：
- **Agents 和 Workflows 是固定的**，不需要为新 app 创建新 agent
- **Skills 是知识积木**，每个 app 有 7 个标准化 skills
- **注册后即可使用**，无需修改 agent 代码

---

## Mission

Create a fully functional Immigration Audit App for a new application type by:

1. Acquiring domain knowledge from local files or MCP services
2. Generating 7 standardized skill directories (知识积木)
3. Validating completeness with os-compliance-checker
4. Registering the app in the system (装配)

**创建完成后**，新 app 自动获得：
- 所有 8 个 agents 的支持
- 所有 6 种 workflows 的能力
- 完整的 tier 功能 (guest/pro/ultra)

---

## Input Parameters

| Parameter   | Required | Default | Description                                                 |
| ----------- | -------- | ------- | ----------------------------------------------------------- |
| `app-type`  | Yes      | -       | Target app type (e.g., `visitor`, `pr`, `refugee`)          |
| `--source`  | No       | `mcp`   | Knowledge source: directory path or `mcp` for MCP bootstrap |
| `--dry-run` | No       | false   | Preview mode - show plan without creating files             |

---

## Skill Structure Standards (从现有 Apps 总结的最佳实践)

### Manifest 标准格式

每个 skill 的 `references/manifest.json` 必须遵循：

```json
{
  "name": "{app-type}-{skill-name}",
  "version": "1.0.0",
  "description": "Clear description of skill purpose",
  "categories": ["audit", "risk", "{app-type}"],
  "quality_level": "L4",
  "quickstart_paths": ["../SKILL.md"],
  "references": [
    "file1.md",
    "file2.json"
  ],
  "depends_on": ["other-skill-if-needed"]
}
```

**必需字段**：
| 字段 | 说明 |
|------|------|
| `name` | 格式: `{app-type}-{skill-name}` |
| `version` | 语义化版本号 (1.0.0 起始) |
| `description` | 清晰描述 skill 用途 |
| `references` | 引用文件列表 (不含 manifest.json) |

**可选字段**：
| 字段 | 说明 |
|------|------|
| `categories` | 分类标签 |
| `quality_level` | 质量等级 (L4 = production) |
| `depends_on` | 依赖的其他 skills |
| `guide_types` | 客户指导类型 (仅 client-guidance) |

### Reference 文件组织规则

**✅ 正确做法**：
- 所有深度内容合并到主文件
- 文件命名: `{topic}.md` 或 `{topic}.json`
- 每个文件职责单一

**❌ 禁止做法**：
- ~~base + deep 分离模式~~ (loader 未实现路由)
- ~~category_files 字段~~ (未实现)
- ~~在 manifest 中引用不存在的文件~~

### Injection Profile 标准格式

`{app-type}-knowledge-injection/references/injection_profile.json`:

```json
{
  "version": "{app-type}-v3",
  "description": "{App Type} knowledge injection profile",
  "skills": {
    "{app-type}-audit-rules": {
      "description": "Risk patterns, eligibility rules",
      "inject_to": ["detective", "strategist", "gatekeeper"],
      "priority": 1,
      "files": ["risk_patterns.json", "eligibility_rules.md"]
    },
    "{app-type}-doc-analysis": {
      "description": "Document analysis rules and evidence standards",
      "inject_to": ["detective", "strategist"],
      "priority": 2,
      "files": ["extraction_schema.json", "evidence_standards.md"]
    },
    "{app-type}-immicore-mcp": {
      "description": "Caselaw and operation manual query patterns",
      "inject_to": ["detective"],
      "priority": 3,
      "files": ["caselaw_query_patterns.json"]
    },
    "{app-type}-workflow": {
      "description": "Internal workflow templates",
      "inject_to": ["strategist", "gatekeeper"],
      "priority": 4,
      "files": ["primary_assess_template.md", "deep_analysis_template.md"]
    },
    "{app-type}-client-guidance": {
      "description": "Client-facing guides",
      "inject_to": ["gatekeeper"],
      "priority": 5,
      "files": ["document_checklist.md", "interview_prep.md"]
    },
    "learned-guardrails": {
      "description": "Semantic verification rules (shared)",
      "inject_to": ["gatekeeper"],
      "priority": 6,
      "files": ["semantic_verification_guide.md"]
    },
    "audit-report-output": {
      "description": "Report format (shared)",
      "inject_to": ["reporter"],
      "priority": 7,
      "files": ["client_report_template.md"]
    },
    "core-reporter": {
      "description": "Cross-app Reporter rules (shared)",
      "inject_to": ["reporter"],
      "priority": 8,
      "files": ["synthesis_rules.md", "output_constraints.md"]
    },
    "{app-type}-reporter": {
      "description": "App-specific Reporter templates",
      "inject_to": ["reporter"],
      "priority": 9,
      "files": ["executive_summary.md", "document_list.md"]
    }
  },
  "injection_order": [
    "{app-type}-audit-rules",
    "{app-type}-doc-analysis",
    "{app-type}-immicore-mcp",
    "{app-type}-workflow",
    "{app-type}-client-guidance",
    "learned-guardrails",
    "audit-report-output",
    "core-reporter",
    "{app-type}-reporter"
  ],
  "tags": {
    "skill": "Skill_References",
    "risk": "Risk_Patterns",
    "doc": "Document_Analysis",
    "caselaw": "Caselaw_Patterns",
    "template": "Output_Templates",
    "guidance": "Client_Guidance"
  },
  "stability": {
    "allow_rename": false,
    "preserve_manifest": true
  }
}
```

**关键要点**：
1. **9 个 skills 映射** (7 个 app-specific + 2 个 shared)
2. **injection_order 必须完整**
3. **priority 决定注入顺序** (数字越小越先)
4. **inject_to 指定目标 agents**

---

## Workflow

### Phase 1: Knowledge Acquisition

**If source is a directory path:**

1. Verify directory exists
2. Scan for knowledge files (\*.md, \*.json, \*.txt)
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

### Phase 3: Skill Scaffolding (7 知识积木)

Generate 7 skill directories under `.claude/skills/{app-type}-*/`:

#### 3.1 {app-type}-audit-rules

```
.claude/skills/{app-type}-audit-rules/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── baseline_rules.md          # 基线规则
    ├── eligibility_rules.md       # 资格检查规则
    ├── risk_patterns.json         # 风险模式定义
    ├── risk_framework.json        # 风险评估框架
    ├── fraud_risk_flags.md        # 欺诈风险标志
    ├── refusal_patterns.md        # 拒签模式
    └── risk_badges.json           # 风险徽章
```

#### 3.2 {app-type}-doc-analysis

```
.claude/skills/{app-type}-doc-analysis/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── baseline_doc_analysis.md   # 基线文档分析
    ├── extraction_schema.json     # 提取字段定义
    ├── document_classification.md # 文档分类
    ├── evidence_standards.md      # 证据标准
    └── validation_rules.md        # 验证规则
```

#### 3.3 {app-type}-immicore-mcp

```
.claude/skills/{app-type}-immicore-mcp/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── mcp_usage.json             # MCP 使用策略
    └── caselaw_query_patterns.json # 案例法查询模式 (含 _authority_verified)
```

#### 3.4 {app-type}-knowledge-injection

```
.claude/skills/{app-type}-knowledge-injection/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── injection_profile.json     # 知识注入配置 (9 skills)
    └── baseline_guides.md         # 基线指南
```

#### 3.5 {app-type}-workflow

```
.claude/skills/{app-type}-workflow/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── primary_assess_template.md # 初审模板
    ├── deep_analysis_template.md  # 深度分析模板
    └── final_assess_template.md   # 终审模板
```

#### 3.6 {app-type}-client-guidance

```
.claude/skills/{app-type}-client-guidance/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── document_checklist.md      # 文档清单
    ├── interview_prep.md          # 面试准备
    └── statement_guide.md         # 陈述指南
```

#### 3.7 {app-type}-reporter

```
.claude/skills/{app-type}-reporter/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── executive_summary.md       # 执行摘要模板
    ├── document_list.md           # 文档清单模板
    └── submission_letter.md       # 提交信模板 (如适用)
```

### Phase 3.5: Landmark Cases Verification

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

**caselaw_query_patterns.json 必需格式**：

```json
{
  "version": "3.0",
  "_landmark_cases_policy": {
    "policy": "仅列出经 KG 验证的 FC/FCA 权威案例",
    "verification_method": "caselaw_authority(citation)",
    "last_verified": "YYYY-MM-DD"
  },
  "{app-type}_specific_queries": {
    "category_name": {
      "queries": [
        {
          "id": "query_id",
          "label": "查询标签",
          "landmark_cases": ["Case v Canada, YYYY FC XXXX"],
          "_authority_verified": {
            "YYYY FC XXXX": {"cited_by": N, "is_good_law": true}
          },
          "_dynamic_lookup": "kg_top_authorities(issue_code='XXX', court='FC')"
        }
      ]
    }
  }
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

**Validation Criteria**:

| 检查项 | 说明 |
|--------|------|
| 7 skill directories | 所有 7 个 skill 目录存在 |
| SKILL.md frontmatter | 每个 skill 有有效的 SKILL.md |
| manifest.json | 每个 skill 有 references/manifest.json |
| injection_profile.json | 包含 9 个 skills 映射 |
| injection_order | 包含完整的注入顺序 |
| No base+deep split | 无 base + deep 分离模式 |
| Landmark cases verified | 所有 FC 案例有 `_authority_verified` |
| No hardcoded case data | 无硬编码的案例特定数据 |

### Phase 5: Registration (装配到系统)

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
  | "{app-type}"  // NEW
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
  'work',
  '{app-type}',  // NEW
] as const;

// Add to APP_SKILL_MAP
export const APP_SKILL_MAP: Record<AppType, string[]> = {
  spousal: ['spousal-audit-rules', ...],
  study: ['study-audit-rules', ...],
  work: ['work-audit-rules', ...],
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
| 7    | 运行 `bun run build`                   | 重新生成 audit-manifest.json    |
| 8    | 执行 SQL migration                     | 应用到 Supabase                 |

> **设计原则**: App Type 是有限且稳定的（移民申请类型），硬编码确保类型安全。新增 app 是重大功能，需要配套的 skills，不是简单加个字符串。

---

## Output Format

On successful completion:

```
=== os-app-builder Complete ===

🧱 Building Blocks Architecture
   Fixed Layer:  8 Agents + 6 Workflows (unchanged)
   Variable Layer: 7 Skills created for {app-type}
   Assembly Layer: Registered to system

App Type: {app-type}
Knowledge Source: {source}

Created Skills (知识积木):
  [x] .claude/skills/{app-type}-audit-rules/
  [x] .claude/skills/{app-type}-doc-analysis/
  [x] .claude/skills/{app-type}-immicore-mcp/
  [x] .claude/skills/{app-type}-knowledge-injection/
  [x] .claude/skills/{app-type}-workflow/
  [x] .claude/skills/{app-type}-client-guidance/
  [x] .claude/skills/{app-type}-reporter/

Validation: PASSED (7/7 skills valid)

Registration (装配):
  [x] src/audit-core/types/case-profile.ts
  [x] src/audit-core/apps/index.ts
  [x] src/tools/audit-persistence/tools.ts
  [x] supabase/migrations/YYYYMMDD_add_{app-type}.sql

Next Steps:
1. Review generated skills in .claude/skills/{app-type}-*/
2. Customize risk patterns in {app-type}-audit-rules
3. Update document checklist in {app-type}-client-guidance
4. Run: bun run build && bun test
5. Test with: AUDIT_APP={app-type} /audit ./test-case/
```

---

## Error Handling

| Error                           | Recovery                                     |
| ------------------------------- | -------------------------------------------- |
| Source directory not found      | Fallback to MCP bootstrap                    |
| MCP service unavailable         | Abort with clear error message               |
| Extraction yields < 10 patterns | Warn user, suggest manual knowledge addition |
| Validation fails                | Show specific failures, don't register app   |
| App type already exists         | Ask user: overwrite / merge / abort          |

---

## Anti-Patterns (从现有 Apps 总结的教训)

### ❌ 结构反模式

| 反模式 | 正确做法 |
|--------|----------|
| base + deep 文件分离 | 合并到单一文件 (loader 未实现路由) |
| category_files 字段 | 删除 (未实现) |
| manifest 缺少版本号 | 必须有 `version` 字段 |
| injection_profile 不完整 | 必须有 9 个 skills + injection_order |

### ❌ 案例引用反模式

| 反模式 | 正确做法 |
|--------|----------|
| 在 Skills 中写死 IAD 案例 | 使用 `_dynamic_lookup` 指导 Detective |
| 引用未经 KG 验证的案例 | 先 `caselaw_authority()` 验证 |
| 复制其他 app 的 landmark_cases | 针对当前 app 用 KG 搜索验证 |
| 假设案例仍然有效 | 检查 `is_good_law` 字段 |

### ❌ 内容反模式

| 反模式 | 正确做法 |
|--------|----------|
| 在 Skills 中包含完整案例文本 | 使用 MCP 动态获取 |
| 包含案例具体事实详情 | 只保留抽象规则和法律原则 |
| 使用过时的案例列表 | 定期用 KG 验证更新 |
| 从其他 app 复制内容 | 针对当前 app 重新生成 |

### ❌ 架构反模式

| 反模式 | 正确做法 |
|--------|----------|
| 为新 app 创建新 agent | 使用固定的 8 agents |
| 为新 app 创建新 workflow | 使用固定的 6 workflows |
| 修改 agent 代码适配新 app | 只创建 skills (知识积木) |
| 跳过注册步骤 | 必须完成 Phase 5 装配 |

---

## Best Practices (从现有 Apps 总结的优点)

### ✅ 从 Spousal 学到的

- injection_profile 结构清晰，9 skills 完整
- caselaw_query_patterns 有 `_authority_verified`
- kg_query_patterns 完整

### ✅ 从 Study 学到的

- 结构简洁，无冗余文件
- client-guidance 内容丰富

### ✅ 从 Work 学到的

- 深度内容合并到主文件 (PGWP.md, ICT.md 等)
- evidence_weight_matrix.json 证据权重矩阵
- risk_evidence_mapping.json 风险证据映射
- 可选的 category_detection 机制 (当 app 有子类型时)

---

## Dependencies

This agent uses the following os-\* skills:

- `os-knowledge-extractor` - Phase 2 extraction
- `os-compliance-checker` - Phase 4 validation
- `os-design-principles` - Design guidelines

---

## Design Principles Reference

See [os-design-principles.md](../.claude/skills/os-design-principles.md) for:

- Landmark Cases Policy
- Skills Content Strategy
- MCP Tool Usage Strategy
- Validation Checklist

---

## Appendix: Fixed Layer Reference

### 8 Agents (固定，不需要为新 app 修改)

| Agent | Role | Tier |
|-------|------|------|
| Intake | 文档提取、案件概况 | All |
| Detective | 案例法搜索 (MCP) | All |
| Strategist | 风险评估、辩护策略 | All |
| Gatekeeper | 合规检查、拒签风险 | All |
| Verifier | 引用验证 | Pro+ |
| Judge | 最终判决 | Pro+ |
| Reporter | 报告生成 | All |
| AuditManager | 工作流编排 | All |

### 6 Workflows (固定，不需要为新 app 创建)

| Workflow | Stages | 用途 |
|----------|--------|------|
| risk-audit | 7 | 完整风险审计 |
| initial-assessment | 7 | 快速可行性评估 |
| final-review | 8 | 提交前质量审查 |
| refusal-analysis | 8 | 拒签后分析 |
| document-list | 3 | 文档清单生成 |
| client-guidance | 3 | 客户指导材料 |

**Workflow 定义位置**: `src/audit-core/workflow/defs/*.json`

**注意**: 这些 workflow 定义是**通用的**，适用于所有 app types。新 app 不需要创建新的 workflow JSON 文件。
