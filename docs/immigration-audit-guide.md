# 移民审计系统开发与使用指南

本文档详细说明了移民审计（Immigration Audit）系统的架构设计、配置方法及扩展指南。该系统通过重构已实现业务逻辑与核心框架的解耦，专注于提供高精度的移民合规性审计能力。

## 1. 概览

移民审计系统是基于 `newtype-profile` 框架的专业扩展，旨在通过 AI 代理协作模拟真实的移民律师审计流程。系统通过动态注入业务知识库（Knowledge Base）和接入外部法律服务（MCP Bridge），对移民申请案件进行全方位的风险评估和抗辩得分（Defensibility Score）分析。

## 2. 系统架构

系统采用模块化设计，核心逻辑位于 `src/audit-core` 目录下：

- **Audit Agents**: 专门定义的审计团队，包含 `AuditManager`（总控）、`Detective`（判例搜索）、`Strategist`（抗辩策略）和 `Gatekeeper`（风控闸口）。
- **Knowledge Loader**: 负责从特定业务应用（App）中加载 Prompt 模板和参考指南（Guides）。
- **MCP Bridge**: 建立与 `immicore` 外部服务的连接，提供 `caselaw`（判例）和 `operation-manual`（操作手册）的实时查询。
- **Knowledge Graph**: 用于相似案例与法官倾向的并行分析（非 MCP 失败后回退）。
- **KG Tools**: `kg_search`, `kg_case`, `kg_similar_cases`, `kg_judge_stats`。
- **Configuration Layer**: 支持通过配置文件和环境变量进行多场景（如配偶担保、留学签证）的无缝切换。

## 3. 目录结构

```text
src/audit-core/
├── agents/           # 审计代理基础逻辑实现
├── apps/             # 业务场景定义 (App-specific)
│   ├── spousal/      # 配偶担保审计应用
│   │   ├── agents/   # 场景特定的 Agent 提示词
│   │   └── knowledge/# 业务知识库与参考指南
│   ├── study/        # 留学签证审计应用
│   └── template.json # 新应用创建模板
├── knowledge/        # 知识加载器与注册中心
├── mcp-bridge.ts     # MCP 服务桥接配置
└── types.ts          # 审计专用类型与常量定义
```

## 4. 配置说明 (audit_app)

系统通过 `audit_app` 字段标识当前的业务场景。

### 配置文件
在 `oh-my-opencode.json` (用户级或项目级) 中添加：
```json
{
  "audit_app": "spousal",
  "search_policy": "mcp_first",
  "web_whitelist": {
    "government": ["ircc.gc.ca", "canada.ca", "esdc.gc.ca"],
    "professional": ["gands.com", "fragomen.com"],
    "public": ["x.com", "reddit.com"]
  },
  "audit_validate_knowledge": true,
  "audit_kg_base_url": "http://localhost:3104/api/v1",
  "audit_mcp_transport": "http",
  "audit_mcp_host": "http://localhost"
}
```

### 环境变量
也可以通过环境变量强制指定：
```bash
export AUDIT_APP=study
export AUDIT_SEARCH_POLICY=mcp_first
export AUDIT_WEB_WHITELIST='{"government":["ircc.gc.ca"],"professional":["gands.com"],"public":["x.com","reddit.com"]}'
export AUDIT_VALIDATE_KNOWLEDGE=true
export AUDIT_KG_BASE_URL=http://localhost:3104/api/v1
export AUDIT_MCP_TRANSPORT=http
export AUDIT_MCP_HOST=http://localhost
export SEARCH_SERVICE_TOKEN=your_token
```
*优先级：环境变量 > 配置文件 > 默认值 (spousal)*

**新增认证说明**：
- `SEARCH_SERVICE_TOKEN`: ImmiCore 服务统一认证令牌，用于 KG API 和 MCP 服务器的 Bearer token 认证
- 在 HTTP 模式下（`AUDIT_MCP_TRANSPORT=http`），建议配置此令牌以访问受限的 API 端点

## 5. 模型选择

为了确保法律逻辑推理的严密性，所有审计核心代理均强制使用以下模型：

- **Model**: `openai/gpt-5.2`
- **特性**: 高上下文窗口、深度逻辑推理、法律文本理解优化。

## 6. 构建与运行

### 构建项目
在修改 `src/audit-core` 或配置后，需重新构建以确保类型安全和 Schema 更新：
```bash
bun run build
bun run build:schema
```

### 运行
本地启动前可先启动 MCP 服务：`./script/start-immicore-mcp-dev.sh`

直接启动 `opencode` 即可进入审计模式。系统会自动检测 `audit_app` 并注入对应的业务上下文。

## 7. MCP Bridge 使用

系统默认尝试接入位于 `~/immicore` 目录下的 MCP 服务，并与 KG 并行使用。

- **caselaw**: 提供 IRCC 相关司法复核判例检索。
- **operation-manual**: 提供移民局内部操作手册同步查询。
- **KG 并行分析**: 相似案例与法官倾向（不作为 MCP 回退）。
- **服务器环境要求**: MCP 进程需可启动（依赖已安装），并保证 `mcp-servers/*` 可执行。
- **HTTP 模式（服务器）**: 使用 `audit_mcp_transport: "http"`，并确保 3105/3106/3107/3108/3109/3009 端口可访问。
- **STDIO 模式（本地/开发）**: 需要提供 `HOST_URL` 与 `SEARCH_SERVICE_TOKEN` 给 MCP 进程。

如果 `~/immicore` 路径不符合预期，可通过环境变量修改：
```bash
export IMMICORE_PATH=/path/to/your/immicore
export HOST_URL=http://localhost:3104/api/v1
export SEARCH_SERVICE_TOKEN=***
```

## 8. Agent → Skill → Knowledge（关系与结构）

本系统使用 opencode 的 Skill 机制，不采用 LangGraph。Agent 与 Skill 的关系是“调用与编排”，Skill 负责调用工具与注入知识，Knowledge 负责业务内容维护。

### 8.1 关系说明
- **Agent**：负责审计流程编排与决策（`AuditManager`, `Detective`, `Strategist`, `Gatekeeper`）
- **Skill**：为 Agent 提供“工具使用 + 业务规则 + 动态知识注入”能力
- **Knowledge**：业务内容与参考指南，按 `audit_app` 组织

### 8.2 数据分布
- **Agent 逻辑**：`src/audit-core/agents/`
- **Skill 定义**：`/Users/jacky/immi-os/.claude/skills/<skill-name>/SKILL.md`
- **业务知识库**：`src/audit-core/apps/<app>/knowledge/`
- **Agent 专用提示词**：`src/audit-core/apps/<app>/agents/`

### 8.3 维护结构（分工）
- **调整业务规则** → 更新 Skill 内容或业务知识文件
- **调整审计流程** → 更新 Agent Prompt 与编排
- **新增业务场景** → 在 `apps/<app>/` 新增 agents + knowledge

### 8.4 动态注入机制
- 运行时读取 `audit_app`（配置或环境变量）
- 由 `src/audit-core/knowledge/loader.ts` 拼接业务知识与 Agent Prompt
- Skill 负责将上下文注入给 Agent，但不修改 opencode 核心调度逻辑

### 8.5 建议的审计 Skill（最小集合）
- `immigration-audit-rules`: 资格硬性规则与风险徽章
- `immigration-doc-analysis`: 文档抽取与结构化摘要
- `immigration-immicore-mcp`: caselaw / operation-manual / help-centre 查询策略
- `immigration-knowledge-injection`: `audit_app` 维度的业务知识注入

### 8.6 Skill 规范与质量要求（精简版）
- 每个 Skill 必须包含：`SKILL.md` + `references/manifest.json`
- `SKILL.md` 控制在 500 行以内，长内容放入 `references/`
- 超过 100 行的文档必须提供 TOC
- 采用 L1–L4 质量等级，目标达到 L4（生产级）
- 严格保持与 opencode 结构一致，不引入 SaaS OS 技术栈约束

## 9. 知识模块扩展

若需添加新的审计类别（如“雇主担保”）：

1. 在 `src/audit-core/apps/` 下创建新目录 `employer-driven`。
2. 参照 `spousal` 结构，在 `agents/` 下编写各代理的业务指令。
3. 在 `knowledge/guides/` 下放入对应的政策说明 Markdown 文件。
4. 在 `src/audit-core/knowledge/registry.ts` 中完成新应用的注册。

## 10. 评估与回归

- 评估样例位于：
  - `src/audit-core/apps/spousal/eval/`
  - `src/audit-core/apps/study/eval/`
- 每个样例必须包含：`case_id`, `profile`, `expected`
- 回归目标：输出必须包含免责声明、来源置信等级、证据清单（Baseline/Live/Strategic）
- 运行评估检查：`bun run src/audit-core/eval/runner.ts`
- 运行健康检查：`bun run src/audit-core/eval/health-check.ts`
- 服务器环境执行健康检查；本地未启动 KG/MCP 时可能失败

## 11. 输出一致性检查清单

- Disclaimer 必须出现在报告开头
- Defensibility Score 必须输出
- Strategist Report 与 Gatekeeper Review 必须存在
- Evidence Checklist 必须包含 Baseline/Live/Strategic 三类
- Web 来源必须标注域名与置信等级

## 12. 合规与报告要求

- 报告必须强调“司法可辩护性评估”，不得承诺通过或预测结果
- 报告首页必须包含免责声明：
  - This report provides a risk assessment based on historical Federal Court jurisprudence. It does NOT predict outcomes or guarantee visa issuance. Officers retain discretion. We assess judicial defensibility only.
- 严禁“保证成功”或“可确保通过”等表述
- 引用必须基于 MCP/KG 或已检索上下文，不得虚构判例

## 13. 故障排除

### ProviderModelNotFoundError
- **现象**: 提示找不到 `openai/gpt-5.2`。
- **原因**: 未登录 OpenAI 渠道或 Token 过期。
- **解决**: 执行 `opencode auth login`，在 Provider 列表中选择 `openai` 进行身份验证。

### 知识库未生效
- **现象**: Agent 回复内容不包含特定的业务指南。
- **解决**: 检查 `oh-my-opencode.json` 中的 `audit_app` 拼写是否与 `apps/` 目录名一致。

## 14. 下一步建议（按顺序）

1. 实现搜索路由与白名单/置信评分
2. 绑定 Agent → Skill
3. 增加知识一致性校验机制

## 15. 开发约束

- **业务优先**: 所有修改应集中在 `src/audit-core/apps` 和提示词层面，严禁改动系统核心调度逻辑。
- **内容纯净**: 指南文件仅包含业务逻辑说明，不得引入非审计相关的通用功能代码。
- **禁止核心变更**: 不得修改 `src/index.ts` 中的插件初始化逻辑，确保审计模块的独立性。
