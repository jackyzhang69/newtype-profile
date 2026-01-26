# Skill 增强计划

**优先级**: P1 (高)
**来源**: docs/skill-knowledge-analysis.md
**状态**: 待开发

---

## 背景

当前 Skills 仅有 `SKILL.md`，缺少真实 `references/` 与 `scripts/`。需要完善 Skill 包结构。

## 待完成任务

### P1 - 高优先级

1. **项目级 Skills 覆盖机制**
   - [ ] 建立项目级 `./.claude/skills/` 目录
   - [ ] 确保项目级覆盖用户级

2. **Skill 包结构完善**
   - [ ] 为每个 Skill 创建 `references/` + `manifest.json`
   - [ ] 为每个 Skill 创建 `scripts/`，提供上下文注入脚本

### P2 - 中优先级

3. **Skill knowledge 注入优化**
   - [ ] 优先 `references/`，必要时回退 `apps/knowledge/`
   - [ ] 校验器增加 `references/` 非空检查

4. **MCP 配置统一**
   - [ ] 将 MCP 配置统一写入 `SKILL.md` frontmatter

### P3 - 低优先级

5. **能力分层 (L1/L2)**
   - [ ] L1: core-* + <app>-* Skill references + scripts
   - [ ] L2: ImmiCore MCP (仅在深度分析时启用)

---

## 相关文档

- 原始分析: `docs/skill-knowledge-analysis.md`
- Skill 目录: `.claude/skills/`

---

**创建日期**: 2026-01-25
