# Skill 注入机制诊断报告

## 问题根本原因分析

### 1. Skills 不会自动触发

根据代码分析 (`src/features/opencode-skill-loader/loader.ts` 和 `src/tools/chief-task/tools.ts`)：

**Skills 必须被显式请求，不会基于用户输入自动激活。**

```typescript
// chief_task 中的 skill 注入逻辑
const { resolved, notFound } = resolveMultipleSkills(args.skills)
skillContent = Array.from(resolved.values()).join("\n\n")
```

这意味着：
- ❌ 用户说 "生成材料清单" 时，系统**不会**自动加载 `spousal-client-guidance` skill
- ✅ 只有当代码显式传入 `skills: ["spousal-client-guidance"]` 时才会注入

### 2. 当前 Audit Workflow 的 Skill 配置

检查 `src/audit-core/agents/` 中的 agent 配置：

| Agent | 配置的 Skills | 缺失的 Skills |
|-------|--------------|--------------|
| audit-manager | core-knowledge-injection, core-immicore-mcp, core-audit-rules, spousal-knowledge-injection, spousal-audit-rules | **spousal-client-guidance** |
| detective | core-*, spousal-knowledge-injection, spousal-doc-analysis, spousal-immicore-mcp | spousal-client-guidance |
| strategist | core-*, spousal-knowledge-injection, spousal-audit-rules, spousal-workflow | spousal-client-guidance |
| gatekeeper | core-*, spousal-knowledge-injection, spousal-audit-rules | **spousal-client-guidance (配置了但未验证)** |

### 3. `injection_profile.json` 的设计 vs 实际执行

`.claude/skills/spousal-knowledge-injection/references/injection_profile.json` 定义了：

```json
{
  "spousal-client-guidance": {
    "inject_to": ["gatekeeper"],
    "files": ["document_list_guide.md", "love_story_guide.md", "interview_guide.md"]
  }
}
```

**问题**: 这个 `injection_profile.json` 只是一个**文档/元数据文件**，没有被任何代码读取和执行！

### 4. Skill References 加载机制

`src/audit-core/knowledge/loader.ts` 中的 `loadSkillReferences()` 函数：

```typescript
function loadSkillReferences(skillName: string): string {
  const skillDir = resolveSkillDir(skillName)  // 找到 .claude/skills/{skillName}
  const referencesDir = path.join(skillDir, "references")
  const manifestPath = path.join(referencesDir, "manifest.json")
  const manifest = readJsonSafe(manifestPath)  // 读取 manifest.json
  const references = manifest.references       // 获取 references 数组
  // ... 读取并返回所有 reference 文件内容
}
```

**这意味着**: 如果 agent 配置了 `skills: ["spousal-client-guidance"]`，系统会：
1. 找到 `.claude/skills/spousal-client-guidance/`
2. 读取 `references/manifest.json`
3. 加载所有 reference 文件：`love_story_guide.md`, `interview_guide.md`, `document_list_guide.md`
4. 将内容注入到 `<Skill_References>` 标签中

---

## 问题总结

### 材料清单生成幻觉的根本原因

1. **没有任何 agent 配置了 `spousal-client-guidance` skill**
   - `injection_profile.json` 说 gatekeeper 应该注入，但实际 gatekeeper agent 的 skills 数组没有包含它

2. **Skill 触发是显式的，不是自动的**
   - 即使 `spousal-client-guidance` 的 SKILL.md 描述说 "Generate document checklist"
   - 系统不会因为用户说 "生成清单" 就自动加载这个 skill

3. **Reference 文件存在但未被注入**
   - `imm5533_checklist.md` 在 `spousal-doc-analysis` skill 中
   - `document_list_guide.md` 在 `spousal-client-guidance` skill 中
   - 但这些文件的内容没有被注入到生成清单的 agent prompt 中

---

## 修复方案

### 方案 A: 修改 Audit Agents 的 Skills 配置 (推荐)

在 `src/audit-core/agents/` 中，为需要生成材料清单的 agent 添加 skill：

```typescript
// src/audit-core/agents/gatekeeper.ts (或其他负责清单的 agent)
const skills = [
  ...coreSkills,
  `${skillPrefix}-knowledge-injection`,
  `${skillPrefix}-audit-rules`,
  `${skillPrefix}-client-guidance`,  // 添加这行
  `${skillPrefix}-doc-analysis`,     // 添加这行 (包含 imm5533_checklist.md)
]
```

### 方案 B: 创建专用的 Checklist Generator Agent

创建一个专门用于生成材料清单的 agent，配置正确的 skills：

```typescript
// src/audit-core/agents/checklist-generator.ts
export function createChecklistGeneratorAgent(): AgentConfig {
  const skills = [
    "spousal-client-guidance",  // document_list_guide.md
    "spousal-doc-analysis",     // imm5533_checklist.md
  ]
  return {
    description: "Generates customized document checklists based on IMM 5533",
    skills,
    prompt: buildAuditPrompt(basePrompt, appId, "checklist-generator", skills),
  }
}
```

### 方案 C: 实现 `injection_profile.json` 的自动解析

让 `buildAuditPrompt()` 读取 `injection_profile.json` 并自动注入相关 skills：

```typescript
// 伪代码
function buildAuditPrompt(basePrompt, appId, agentName, explicitSkills) {
  const profile = loadInjectionProfile(appId)
  const autoSkills = profile.skills
    .filter(s => s.inject_to.includes(agentName))
    .map(s => s.name)
  
  const allSkills = [...new Set([...explicitSkills, ...autoSkills])]
  // ... 加载所有 skill references
}
```

---

## 立即可执行的验证步骤

1. **检查 gatekeeper agent 的 skill 配置**:
   ```bash
   grep -A 20 "const skills" src/audit-core/agents/gatekeeper.ts
   ```

2. **测试手动注入 skill**:
   在调用 agent 时显式传入 skills 参数，验证 reference 文件是否被正确加载

3. **添加 debug 日志**:
   在 `loadSkillReferences()` 中添加日志，确认哪些 skill 被加载了
