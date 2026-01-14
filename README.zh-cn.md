# Immi-OS (移民审计系统)

> 原项目名称: `newtype-profile`

**Immi-OS** 是一套专为 **移民申请审计** 设计的 AI Agent 协作系统。基于 `oh-my-opencode` 框架构建，它通过编排多个专业 Agent 来模拟移民律师和签证官的工作流程。

## 核心功能

- **自动化审计流程**: 编排多个 Agent (`AuditManager`, `Detective`, `Strategist`, `Gatekeeper`) 对申请进行全面审查。
- **抗辩评分 (Defensibility Score)**: 基于联邦法院的历史判例计算风险评分。
- **动态知识库注入**: 根据申请类型（如配偶担保、学签）动态加载业务规则和指南。
- **MCP & KG 集成**: 通过模型上下文协议 (MCP) 和知识图谱 (KG) 连接外部法律数据库（判例库、操作手册）。

## 架构体系

本系统继承了 `oh-my-opencode` 的 "计划与执行分离" 哲学：

- **Prometheus (Planner)**: 分析需求并制定详细的审计计划。
- **Sisyphus (Executor)**: 编排计划的执行，将任务分发给专业 Agent。
- **Audit Core**: 位于 `src/audit-core`，包含移民审计的核心业务逻辑。

## 快速开始

### 环境要求

- Node.js 20+
- Bun (推荐) 或 npm
- OpenCode CLI

### 安装

```bash
git clone https://github.com/jackyzhang69/immi-os.git
cd immi-os
bun install
```

### 配置

确保你的 `.opencode/opencode.json` 指向本项目路径：

```json
{
  "plugin": ["/path/to/immi-os"]
}
```

在 `.opencode/oh-my-opencode.json` 中配置审计参数：

```json
{
  "audit_app": "spousal",
  "search_policy": "mcp_first"
}
```

### 运行审计

启动 OpenCode 会话并输入：

> "审计这份申请人 [Name] 的配偶担保申请..."

系统将自动：

1.  识别意图。
2.  激活 `AuditManager`。
3.  将任务分解为具体的检查项（身份、关系、准入性等）。
4.  调度 `Detective` 搜索潜在风险。
5.  调度 `Strategist` 制定抗辩策略。
6.  调度 `Gatekeeper` 审查最终报告。

## 文档资源

- [审计指南](docs/immigration-audit-guide.md)
- [架构计划](docs/audit-architecture-plan.md)
- [CLI 指南](docs/cli-guide.md)

## 许可证

SUL-1.0
