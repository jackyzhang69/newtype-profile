# Audit Agents 集成指南

## ⚠️ 重要：代码修改后必须重新编译

**每次修改 TypeScript/JavaScript 代码后，必须运行编译：**

```bash
bun run build
```

**原因**：
- 修改代码后，dist/ 目录不会自动更新
- OpenCode 插件系统加载的是编译后的 dist/ 目录
- 不重新编译，修改的代码不会生效

---

## Judge Agent 集成状态

### 问题（已解决）

Judge Agent 已实现但未完全集成到 AuditManager 框架（2026-01-27）

**缺失的 3 处集成点：**
1. `AUDIT_AGENTS` 常量 - 使 Judge 可通过 audit_task 派遣
2. `agentSources` 和 `agentMetadata` - OpenCode 框架要求
3. `AuditManager` prompt - 告诉 AuditManager 何时调用 Judge

### 解决方案（已实现）

**修改的文件：**
- `src/tools/audit-task/constants.ts` - 添加 judge 到白名单
- `src/agents/utils.ts` - 注册 Judge 到 agentSources/metadata
- `src/agents/types.ts` - 添加 judge 到 BuiltinAgentName type
- `src/audit-core/agents/audit-manager.ts` - 更新 prompt
- `src/tools/audit-task/constants.test.ts` - 更新测试

**验证：**
✅ 1341 测试通过
✅ 代码已编译 (bun run build)
✅ Judge 可通过 audit_task 派遣

### Judge 的本质

**Judge 是"Terminal Agent"（终端决策者）**

- 不做原创分析，只综合现有发现
- 只在需要 verdict 的 workflows 中出现
- 使用最强 LLM（Sonnet 4.5 for Guest, Opus 4.5 for Pro/Ultra）

---

## 自动能力更新系统（2026-01-27）

### 问题背景

AuditManager 是协调者，需要知道自己有哪些子 agents 和可用的 workflows。之前的方案：
- ❌ 每次需要手动更新 AuditManager prompt 中的 agents/workflows 列表
- ❌ 添加新 agent 时容易遗漏更新
- ❌ 自动化程度低

### 解决方案：Build-Time Manifest Generation

**工作流程：**

```
用户添加新 agent 文件
          ↓
运行 bun run build
          ↓
script/generate-audit-manifest.ts 自动扫描：
  - src/audit-core/agents/*.ts (agent 文件)
  - src/audit-core/workflow/defs/*.json (workflow 定义)
          ↓
生成 dist/audit-manifest.json
          ↓
buildAuditPrompt() 读取 manifest
          ↓
AuditManager 的 System_Identity 自动注入
  - 8 agents 列表
  - 6 workflows 列表
  - 生成时间戳
```

**文件说明：**

| 文件 | 用途 |
|------|------|
| `script/generate-audit-manifest.ts` | 扫描并生成 manifest 的脚本 |
| `dist/audit-manifest.json` | 自动生成（不要手动编辑）|
| `src/audit-core/knowledge/loader.ts` | `buildSystemIdentitySection()` 读取 manifest |
| `src/audit-core/agents/audit-manager.ts` | `<System_Identity>` placeholder 被自动填充 |

### 测试方法

**验证 System_Identity 自动注入：**

```bash
# 1. 修改任何 agent 文件或 workflow 定义
# 2. 运行编译
bun run build

# 3. 检查 manifest 是否更新
cat dist/audit-manifest.json | jq '.summary'

# 4. 验证 AuditManager prompt 是否包含最新 agents/workflows
# (通过创建 AuditManager 实例并检查 prompt 内容)
```

**自动化原理：**

1. 每次 `bun run build` 时，自动运行 `bun run build:manifest`
2. Script 扫描 agents 和 workflows 目录
3. 生成 JSON manifest（包含 name/description/stages 等）
4. `buildAuditPrompt()` 在编译时读取 manifest
5. 替换 basePrompt 中的 `<System_Identity>` 占位符
6. AuditManager 永远拥有最新的自我认知

### 验证状态

✅ 2026-01-27：系统实现和测试完成
- manifest 生成：8 agents, 6 workflows
- System_Identity 自动注入成功
- Judge agent 正确显示
- 所有相关测试通过 (20/20)

---

## 沟通规则

见 CLAUDE.md 的 "沟通规则" 章节
