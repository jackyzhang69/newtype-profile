# Skill 与 Knowledge Source 规范 (Specification)

## 0. 当前问题（简要）
- Skills 仅有 `SKILL.md`，缺少真实 `references/` 与 `scripts/`
- 业务知识仍在 `apps/knowledge/`，未进入 Skill knowledge
- MCP 配置未统一进 `SKILL.md` frontmatter
- 项目级隔离尚未落实，需求差异难以表达

## 0.1 改造任务（精简版）
- 建立项目级 `./.claude/skills/` 目录，并确保项目级覆盖用户级
- 为每个 Skill 创建 `references/` + `manifest.json`，填充 baseline 数据
- 为每个 Skill 创建 `scripts/`，提供基础处理与上下文注入脚本
- 实现 Skill knowledge 注入（优先 `references/`，必要时回退 `apps/knowledge/`）
- 将 MCP 配置统一写入 `SKILL.md` frontmatter
- 校验器增加 `references/` 非空检查

## 1. 发现机制与目录约束
- **项目级路径**: `./.claude/skills/` (最高优先级)
- **用户级路径**: `~/.claude/skills/`
- **发现规则**: Skill 仅能从上述指定的 `.claude/skills/` 目录中被发现和加载。

## 2. Skill 包结构规范
每个 Skill 目录必须包含以下核心组件：
- **`SKILL.md`**: 
    - 包含 YAML Frontmatter 配置。
    - 定义核心行为指导模板。
- **`references/`**: 
    - 业务知识库目录。
    - 必须包含 `manifest.json` 知识文件索引。
- **`scripts/`**: 
    - 包含可执行脚本（如 `.ts`, `.py`）。
    - 用于处理文档、计算风险或注入动态上下文。

## 3. 知识源角色定义
- **Skills**: 作为“智能中间件”，编排内置业务知识（静态）与执行逻辑。
- **Knowledge Sources**: 作为“数据源 API”，提供动态法律数据库、政策和判例访问（通过 MCP 或 KG）。

## 4. 基线数据策略 (Baseline Data Policy)
- **初始化**: 初始阶段使用简单数据填充 `references/` 作为运行基线。
- **演进**: 后续按阶段替换为真实业务数据，但必须保持 `manifest.json` 索引结构稳定，以确保 Skill 加载逻辑的一致性。

## 5. MCP 配置规范
- **配置位置**: 必须嵌入在 `SKILL.md` 的 YAML Frontmatter 中。
- **核心字段**: 包含 MCP 服务器 URL、认证方式、健康检查路径及 Fallback 策略（如 `mcp_first`, `web_whitelist`）。

## 6. 项目级隔离
- **隔离原则**: Skill 必须支持项目级隔离。
- **覆盖规则**: 项目存在`./.claude/skills/`时，仅使用项目级定义，不回退用户级定义。
- **命名空间**: 建议采用 `<project>-<skill>` 格式以避免全局命名冲突。
