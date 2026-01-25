# Audit Manager 架构设计

> 搭积木式多智能体审计系统的设计理念与实现

---

## 设计哲学

### 核心理念：搭积木 (Building Blocks)

Immi-OS 采用**模块化积木式架构**，将复杂的移民审计流程分解为可组合的独立模块：

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户请求                                  │
│            "审计这个配偶担保案件"                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    积木组装器 (Assembler)                        │
│                                                                 │
│   1. 识别应用类型 → spousal                                      │
│   2. 选择对应积木 → spousal-* skills                             │
│   3. 注入到对应 Agent → Detective, Strategist, Gatekeeper        │
│   4. 启动工作流 → Stage 0 → 1 → 2 → 3 → 4 → 5                   │
└─────────────────────────────────────────────────────────────────┘
```

### 为什么选择积木式架构？

| 传统方式 | 积木式架构 |
|---------|-----------|
| 单一巨型 Agent 处理所有逻辑 | 6 个专业 Agent 各司其职 |
| 硬编码规则，难以维护 | Skills 模块化，易于更新 |
| 添加新应用类型需要大量改动 | 只需创建新的 *-skills 积木 |
| 调试困难，黑盒运行 | 每个 Stage 输出可追溯 |
| 全有或全无 | 按需组合，分层服务 (Guest/Pro/Ultra) |

---

## 积木清单

### Layer 1: Agent 积木 (7块)

每个 Agent 是一个独立的处理单元，有明确的输入输出边界：

| Agent | 职责边界 | 输入 | 输出 |
|-------|---------|------|------|
| **Intake** | 事实提取，不做判断 | 原始文档目录 | 结构化 CaseProfile |
| **AuditManager** | 编排控制 + 最终判断 | CaseProfile + Agent 报告 | AuditJudgment (分数/判定) |
| **Detective** | 法律检索，不做评估 | 检索指令 | 判例 + 政策引用 |
| **Strategist** | 风险评估，不做验证 | 事实 + 法律研究 | 抗辩分数 + 证据计划 |
| **Gatekeeper** | 合规校验，不做修改 | 策略报告 | 合规问题 + 修复建议 |
| **Verifier** | 引用验证，不做其他 | 引用列表 | PASS/FAIL + 问题详情 |
| **Reporter** | 报告呈现，不做判断 | AuditJudgment | Markdown + PDF 报告 |

**设计原则**：

- **单一职责**：每个 Agent 只做一件事
- **判断归编排者，呈现归专家**：AuditManager 做判断，Reporter 做呈现
- **无状态**：Agent 不保存会话状态，每次调用独立
- **可替换**：可以用不同模型/配置替换任意 Agent
- **可组合**：可以跳过或重复某些 Agent

### Layer 2: Skill 积木 (16块)

Skills 是领域知识的载体，按应用类型和功能分类：

```
Skills 积木库
├── 基础积木 (Core) ─────────────────────────────────────────────
│   ├── core-audit-rules      # 通用审计规则框架
│   ├── core-doc-analysis     # 文档分析基线
│   ├── core-immicore-mcp     # MCP 服务访问策略
│   └── core-knowledge-injection  # 知识注入机制
│
├── 配偶担保积木 (Spousal) ──────────────────────────────────────
│   ├── spousal-audit-rules   # 配偶特定风险模式 (17种)
│   ├── spousal-doc-analysis  # IMM5533 检查清单
│   ├── spousal-immicore-mcp  # 配偶判例查询模式
│   ├── spousal-knowledge-injection  # Agent 注入配置
│   ├── spousal-workflow      # 输出模板 (初审/深度/终审/提交信)
│   └── spousal-client-guidance  # 客户指导 (love story/面试/清单)
│
├── 学签积木 (Study) ────────────────────────────────────────────
│   ├── study-audit-rules     # 学签特定风险模式
│   ├── study-doc-analysis    # 学签文档检查
│   ├── study-immicore-mcp    # 学签判例查询
│   └── study-knowledge-injection  # Agent 注入配置
│
└── 横切积木 (Cross-cutting) ────────────────────────────────────
    ├── learned-guardrails    # 语义验证规则 (从错误中学习)
    └── audit-report-output   # 输出主题 (Judicial Authority)
```

### Layer 3: Tier 积木 (3块)

Tier 决定每个 Agent 使用的模型和功能限制：

```typescript
// Guest 积木：快速、低成本
guest: {
  models: { all: "gemini-3-flash" },
  features: { kgSearch: false, deepAnalysis: false },
  limits: { maxCitations: 3, verifyIterations: 1 }
}

// Pro 积木：平衡性能和成本
pro: {
  models: { auditManager: "claude-sonnet-4-5", verifier: "gemini-3-flash" },
  features: { kgSearch: true, deepAnalysis: false },
  limits: { maxCitations: 10, verifyIterations: 2 }
}

// Ultra 积木：最高质量
ultra: {
  models: { auditManager: "claude-opus-4-5", verifier: "claude-haiku-4-5" },
  features: { kgSearch: true, deepAnalysis: true, multiRound: true },
  limits: { maxCitations: 20, verifyIterations: 3 }
}
```

---

## 积木组装流程

### Step 1: 识别应用类型

```
用户输入 → Intake Agent → 识别 audit_app = "spousal"
```

### Step 2: 加载对应 Skills

```typescript
// knowledge/loader.ts
const skills = loadSkillsForApp("spousal")
// → [spousal-audit-rules, spousal-doc-analysis, spousal-immicore-mcp, ...]
```

### Step 3: 注入到 Agent

```typescript
// 根据 injection_profile.json 配置
Detective  ← spousal-immicore-mcp, spousal-doc-analysis
Strategist ← spousal-audit-rules
Gatekeeper ← spousal-workflow, learned-guardrails
```

### Step 4: 选择 Tier 配置

```typescript
// 根据 AUDIT_TIER 环境变量
const config = TIER_CONFIGS[process.env.AUDIT_TIER || "guest"]
Detective.model = config.models.detective  // "claude-sonnet-4-5"
```

### Step 5: 执行工作流

```
Stage 0 → Stage 1 → Stage 2 → Stage 3 → Stage 4 → Stage 5
Intake   AuditMgr  Detective  Strategist Gatekeeper AuditMgr
                                         + Verifier
```

---

## 工作流详解

### Stage 0: Intake (事实提取)

```
输入: /path/to/case/directory
      ├── IMM0008.pdf
      ├── IMM5532.pdf
      ├── passport.pdf
      └── photos/

处理:
1. 扫描目录，识别所有文档
2. 调用 file_content_extract 批量提取
3. 解析 XFA 表单字段
4. 生成结构化 CaseProfile

输出: {
  "case_id": "tian-2025-01",
  "application_type": "spousal",
  "sponsor": { ... },
  "applicant": { ... },
  "relationship": { ... },
  "documents": [ ... ]
}
```

**关键约束**：
- Intake **只提取事实**，不做风险判断
- 缺失信息标记为 `missing`，不标记为 "red flag"
- 输出必须符合 CaseProfile schema

### Stage 1-5: 审计流程

```
┌──────────────────────────────────────────────────────────────┐
│ Stage 1: AuditManager 接收 CaseProfile                        │
│ → 分解任务: 身份检查、关系检查、准入性检查                      │
│ → 分发给 Detective                                            │
├──────────────────────────────────────────────────────────────┤
│ Stage 2: Detective 执行检索                                   │
│ → MCP: caselaw_search("spousal genuineness")                 │
│ → MCP: operation_manual_search("R4")                         │
│ → 返回: 相关判例 + 政策引用                                   │
├──────────────────────────────────────────────────────────────┤
│ Stage 3: Strategist 风险评估                                  │
│ → 输入: 事实 + Detective 的法律研究                           │
│ → 计算 Defensibility Score                                   │
│ → 制定 Poison Pill 防御话术                                  │
│ → 规划证据清单 (Baseline/Live/Strategic)                     │
├──────────────────────────────────────────────────────────────┤
│ Stage 4: Gatekeeper 合规审查                                  │
│ → 检查是否有拒签触发点                                        │
│ → 验证输出格式合规                                            │
│ → 触发 Verifier 检查引用                                     │
├──────────────────────────────────────────────────────────────┤
│ Stage 4.5: Verification Loop-back (如果引用验证失败)           │
│ → Verifier 报告 CRITICAL 问题                                │
│ → Detective 重新检索                                         │
│ → Strategist 更新论证                                        │
│ → 重复直到 PASS 或达到 tier 限制                              │
├──────────────────────────────────────────────────────────────┤
│ Stage 5: AuditManager 最终判断                                │
│ → 整合所有 Agent 报告                                        │
│ → 计算 Defensibility Score                                   │
│ → 做出判定: GO / CAUTION / NO-GO                             │
│ → 如果验证失败: 标记 INCOMPLETE                               │
│ → 输出 AuditJudgment 结构体                                  │
├──────────────────────────────────────────────────────────────┤
│ Stage 5.5: Reporter 报告生成                                  │
│ → 接收 AuditJudgment 结构体                                  │
│ → 选择 tier 对应模板 (Guest/Pro/Ultra)                        │
│ → 综合所有 Agent 输出生成叙事                                 │
│ → 应用 Judicial Authority 主题                               │
│ → 输出 Markdown + PDF 到案件目录                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 添加新应用类型

假设要支持 **工签 (Work Permit)** 审计：

### Step 1: 创建 Skill 积木

```
.claude/skills/
├── work-audit-rules/
│   ├── SKILL.md
│   └── references/
│       ├── manifest.json
│       ├── lmia_rules.md
│       └── risk_patterns.json
├── work-doc-analysis/
├── work-immicore-mcp/
└── work-knowledge-injection/
```

### Step 2: 定义注入配置

```json
// work-knowledge-injection/references/injection_profile.json
{
  "skills": {
    "work-audit-rules": {
      "inject_to": ["strategist", "gatekeeper"],
      "priority": 1
    },
    "work-doc-analysis": {
      "inject_to": ["detective"],
      "priority": 2
    }
  }
}
```

### Step 3: 注册应用类型

```typescript
// src/audit-core/apps/index.ts
export const SUPPORTED_APPS = ["spousal", "study", "work"] as const
```

### Step 4: 完成！

现在可以运行：
```bash
/audit /path/to/work/case --app work --tier pro
```

---

## 设计决策记录

### 为什么 Intake 独立于 AuditManager？

**问题**：最初 AuditManager 同时负责文档提取和审计编排，导致：
- 提示词过长 (>3000 行)
- 职责混乱，难以调试
- 无法独立测试文档提取

**解决**：将文档提取分离为 Stage 0 的 Intake Agent
- Intake 专注事实提取，0 判断
- AuditManager 专注编排，0 提取
- 可以独立运行 Intake 只做文档提取

### 为什么 Skills 不直接硬编码到 Agent？

**问题**：硬编码规则导致：
- 更新规则需要改代码
- 不同应用类型需要 if/else 分支
- 规则散落各处，难以审计

**解决**：Skills 作为外部配置
- 规则存储在 `.claude/skills/`
- 运行时动态注入
- 可以热更新（修改 skill 文件后重启生效）
- 非技术人员也可以审查/修改规则

### 为什么需要 Verifier Loop-back？

**问题**：LLM 会"幻觉"判例引用
- 生成不存在的 case citation
- 引用已被推翻的旧判例
- 混淆类似案件的细节

**解决**：强制验证 + 循环修复
- 所有引用必须通过 Verifier 验证
- 验证失败触发 loop-back
- 最多重试 N 次（按 tier 配置）
- 超过限制标记 INCOMPLETE，不输出未验证内容

---

## 最佳实践

### 添加新 Agent

1. 创建 `src/audit-core/agents/new-agent.ts`
2. 定义明确的输入/输出 schema
3. 限制工具权限（只给必要的）
4. 编写测试用例
5. 在 `agents/index.ts` 注册

### 添加新 Skill

1. 创建 `.claude/skills/your-skill/` 目录
2. 编写 `SKILL.md` (< 500 行)
3. 创建 `references/manifest.json`
4. 在对应的 `*-knowledge-injection` 配置注入规则

### 调试建议

```bash
# 只运行 Intake，检查文档提取
/audit /path/to/case --stage intake

# 查看 Agent 收到的 prompt
export AUDIT_DEBUG=true

# 查看 MCP 调用日志
export MCP_LOG=verbose
```

---

## 相关文档

- [Workflow 详解](./workflow.md) - 工作流细节
- [Tier 系统](./tiers.md) - 分层配置
- [MCP 集成](./mcp-integration.md) - 外部服务
- [构建 Agentic Workflows](../framework/building-agentic-workflows.md) - 通用指南
