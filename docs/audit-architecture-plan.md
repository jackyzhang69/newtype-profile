# 审计系统架构与产品规划

## 目标与约束
- 保持 immi-os 原有框架与插件机制不变
- 仅新增业务内容与业务配置，不改动核心架构
- immicore 作为基础设施层，audit 作为业务应用层
- 先覆盖配偶团聚与学签，支持搭积木式扩展

## 系统架构
### 分层
- 基础设施层：immicore
  - MCP 服务：caselaw、operation-manual 等
  - 统一搜索、知识库与工具服务
- 智能核心层：immi-os
  - Agent 编排与规则注入
  - 业务 Agent 作为扩展模块存在
- 业务应用层：audit
  - 业务输入、输出与权限控制
  - 审计报告交付

### 关键组件
- AuditManager：总控编排、流程分解、最终输出
- Detective：判例/政策检索与证据映射
- Strategist：风险评估与论证结构
- Gatekeeper：合规校验与风险复核

### 数据流
1. audit 提交案例数据
2. AuditManager 解析并拆解任务
3. Detective 调用 immicore MCP 获取判例与政策
4. Strategist 输出风险分析与证据计划
5. Gatekeeper 复核一致性与合规性
6. AuditManager 汇总输出审计报告

### 扩展方式
- 新增签证类型：新增业务规则、Prompt 与知识库文件
- 新增工具：以 MCP 扩展方式接入
- 新增 Agent：保持内置 Agent 编排结构

## 产品规划
### MVP
- 范围：配偶团聚、学签
- 输出：Defensibility Score + 风险点 + 证据清单
- 依赖：caselaw、operation-manual MCP
- 交付：文本报告与结构化结果

### V1
- 固化审计流程模板
- 加入业务规则库（知识文件）
- 标准化审计输出结构

### V2
- 扩展更多签证类型
- 加入历史案例对比
- 增加证据优先级与行动建议

## 落地原则
- 业务内容与基础架构严格隔离
- 所有扩展通过新模块与配置完成
- 用户配置优先级高于系统默认值
