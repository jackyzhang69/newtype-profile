# Skill 系统完美解决方案设计

> **状态**: 设计完成，待实现
> **生成时间**: 2025-01-16
> **关键发现**:
> 1. `depends_on` 字段在 manifest.json 中声明但未被任何代码解析执行
> 2. **官方 Claude Code 不支持 skill 依赖** - Skills 被设计为独立、自包含的单元
> 3. 依赖管理需要在 `audit-core` 层面实现，不应修改 OpenCode 核心

## 官方规范确认

根据 Claude Code 官方仓库研究：

| 字段 | 状态 | 说明 |
|------|------|------|
| `name` | **必需** | Skill 名称 |
| `description` | **必需** | 描述 |
| `model` | 可选 | 使用的模型 |
| `agent` | 可选 | 执行的 agent |
| `version` | 可选 | 版本号 |
| `license` | 可选 | 许可证 |
| `allowed-tools` | 可选 | 工具限制 |
| `mcp` | 可选 | MCP 服务器配置 |
| `depends_on` | **不支持** | 官方不支持 skill 间依赖 |

**设计原则**: Claude Code Skills 被设计为 **模块化、自包含** 的单元，没有 skill 间依赖机制。依赖管理在 plugin/service 层面处理。

## 一、现状分析

### 1.1 两套 Skill 加载机制

当前系统存在**两套独立的 skill 加载机制**，这是问题的根源：

| 机制 | 位置 | 用途 | 加载内容 |
|------|------|------|---------|
| **OpenCode Skill Loader** | `src/features/opencode-skill-loader/` | 通用 skill 工具 (`/skill` command) | SKILL.md 的 body 内容 |
| **Audit Knowledge Loader** | `src/audit-core/knowledge/loader.ts` | Audit agent prompts | `references/manifest.json` 中列出的文件 |

### 1.2 现有依赖声明（未被使用）

`spousal-knowledge-injection/references/manifest.json` 已经声明了 `depends_on`：

```json
{
  "depends_on": [
    "spousal-audit-rules",
    "spousal-doc-analysis",
    "spousal-immicore-mcp",
    "spousal-workflow",
    "spousal-client-guidance"
  ]
}
```

但 `loadSkillReferences()` 函数**完全忽略**了这个字段！

### 1.3 injection_profile.json 设计精良但未执行

`injection_profile.json` 定义了完美的注入映射：

```json
{
  "spousal-client-guidance": {
    "inject_to": ["gatekeeper"],
    "files": ["document_list_guide.md", ...]
  }
}
```

但**没有任何代码读取和执行这个配置**。

---

## 二、设计目标

1. **向后兼容**: 不破坏现有 skill 定义格式
2. **规范一致**: 符合 Claude Code skill 规范（frontmatter + SKILL.md）
3. **依赖解析**: 自动加载 `depends_on` 声明的依赖 skills
4. **Agent 映射**: 根据 `inject_to` 自动确定哪些 skill 应该注入到哪个 agent
5. **单一数据源**: 避免在多处重复配置同一信息

---

## 三、解决方案架构

### 3.1 核心设计：Profile-Driven Injection

将 `injection_profile.json` 作为 "Single Source of Truth"，由代码自动解析和执行。

```
┌─────────────────────────────────────────────────────────────────┐
│                    injection_profile.json                       │
│  (定义 skill → agent 映射关系)                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    buildAuditPrompt()                            │
│  1. 读取 agent name                                              │
│  2. 加载 injection_profile.json                                  │
│  3. 过滤出 inject_to 包含当前 agent 的 skills                     │
│  4. 按 priority 排序                                             │
│  5. 加载每个 skill 的 references                                 │
│  6. 注入到 prompt                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 文件结构（无需修改）

```
.claude/skills/
├── spousal-knowledge-injection/
│   ├── SKILL.md                          # Skill 元数据
│   └── references/
│       ├── manifest.json                 # depends_on 声明
│       ├── injection_profile.json        # Agent 映射配置 ← 关键
│       └── baseline_guides.md
│
├── spousal-client-guidance/
│   ├── SKILL.md
│   └── references/
│       ├── manifest.json                 # references 列表
│       ├── document_list_guide.md        # 清单生成指南
│       ├── checklist_schema.json         # JSON Schema
│       └── ...
│
├── spousal-doc-analysis/
│   ├── SKILL.md
│   └── references/
│       ├── manifest.json
│       ├── imm5533_checklist.md          # IMM 5533 规则
│       └── ...
```

### 3.3 Manifest.json 扩展规范

```typescript
interface SkillManifest {
  name: string
  version: string
  description: string
  
  // 现有字段
  references: string[]              // 要加载的文件列表
  
  // 依赖声明（已存在但未解析）
  depends_on?: string[]             // 依赖的其他 skills
  
  // Agent 注入配置（可选，用于细粒度控制）
  inject_to?: string[]              // 应该注入到哪些 agents
  priority?: number                 // 注入优先级
}
```

### 3.4 InjectionProfile 规范

```typescript
interface InjectionProfile {
  version: string
  description: string
  
  skills: {
    [skillName: string]: {
      description: string
      inject_to: string[]           // ["detective", "strategist", "gatekeeper"]
      priority: number              // 1-5, 数字越小越先注入
      files?: string[]              // 可选：覆盖 manifest.json 的 references
    }
  }
  
  injection_order: string[]         // 明确的注入顺序
  
  tags?: {                          // XML 标签映射
    [key: string]: string
  }
}
```

---

## 四、代码修改方案

### 4.1 修改 `src/audit-core/knowledge/loader.ts`

```typescript
// === 新增类型定义 ===
interface InjectionProfileSkill {
  description: string
  inject_to: string[]
  priority: number
  files?: string[]
}

interface InjectionProfile {
  version: string
  skills: Record<string, InjectionProfileSkill>
  injection_order: string[]
}

// === 新增：加载 injection_profile.json ===
function loadInjectionProfile(appId: string): InjectionProfile | null {
  const skillName = `${appId}-knowledge-injection`
  const skillDir = resolveSkillDir(skillName)
  if (!skillDir) return null
  
  const profilePath = path.join(skillDir, "references", "injection_profile.json")
  return readJsonSafe<InjectionProfile>(profilePath)
}

// === 新增：根据 agent 名称获取应注入的 skills ===
function getSkillsForAgent(profile: InjectionProfile, agentName: string): string[] {
  const matchingSkills: Array<{ name: string; priority: number }> = []
  
  for (const [skillName, config] of Object.entries(profile.skills)) {
    if (config.inject_to.includes(agentName)) {
      matchingSkills.push({ name: skillName, priority: config.priority })
    }
  }
  
  // 按 priority 排序（数字越小越先）
  matchingSkills.sort((a, b) => a.priority - b.priority)
  
  return matchingSkills.map(s => s.name)
}

// === 修改：buildAuditPrompt 支持自动 skill 发现 ===
export function buildAuditPrompt(
  basePrompt: string,
  appId: string,
  agentName: string,
  explicitSkills: string[] = []  // 保持向后兼容
): string {
  // 1. 尝试加载 injection profile
  const profile = loadInjectionProfile(appId)
  
  // 2. 确定要加载的 skills
  let skillNames: string[]
  if (profile) {
    // 使用 profile 自动发现
    const autoSkills = getSkillsForAgent(profile, agentName)
    // 合并显式指定的 skills（去重）
    skillNames = [...new Set([...autoSkills, ...explicitSkills])]
  } else {
    // 回退到显式指定
    skillNames = explicitSkills
  }
  
  // 3. 加载 skill references
  const skillReferences = loadSkillReferencesForSkills(skillNames).trim()
  
  // ... 其余逻辑不变
}
```

### 4.2 修改 Agent 配置（可选简化）

有了自动 skill 发现后，agent 配置可以简化：

```typescript
// 之前（需要手动列出所有 skills）
const skills = [
  "core-audit-rules",
  "core-knowledge-injection",
  "spousal-audit-rules",
  "spousal-knowledge-injection",
  // 需要手动添加 spousal-client-guidance, spousal-doc-analysis...
]

// 之后（自动从 injection_profile.json 发现）
// 只需要指定 core skills，app-specific skills 自动加载
const coreSkills = [
  "core-audit-rules",
  "core-knowledge-injection",
]
// appSkills 由 buildAuditPrompt 根据 injection_profile.json 自动确定
```

### 4.3 更新 manifest.json

将 `checklist_schema.json` 添加到 references：

```json
// .claude/skills/spousal-client-guidance/references/manifest.json
{
  "name": "spousal-client-guidance",
  "references": [
    "love_story_guide.md",
    "interview_guide.md",
    "document_list_guide.md",
    "checklist_schema.json"
  ]
}
```

---

## 五、实现步骤

### Phase 1: 立即修复（不改代码）

1. 更新 `spousal-client-guidance/references/manifest.json`，添加 `checklist_schema.json`
2. 在 gatekeeper agent 中手动添加缺失的 skills

### Phase 2: 实现自动注入（改代码）

1. 修改 `src/audit-core/knowledge/loader.ts`
2. 添加 `loadInjectionProfile()` 和 `getSkillsForAgent()` 函数
3. 修改 `buildAuditPrompt()` 支持自动 skill 发现
4. 添加单元测试

### Phase 3: 简化 Agent 配置

1. 移除 agent 配置中的 app-specific skills
2. 让 injection_profile.json 成为唯一配置源
3. 更新文档

---

## 六、验证清单

- [ ] `document_list_guide.md` 引用的 `imm5533_checklist.md` 能被正确加载
- [ ] `checklist_schema.json` 在 manifest 中注册
- [ ] Gatekeeper agent 能访问 `spousal-client-guidance` 和 `spousal-doc-analysis` 的内容
- [ ] 生成的材料清单使用正确的 JSON 格式和条件逻辑
- [ ] 不破坏现有的其他 agent 功能

---

## 七、完整实现代码

### 7.1 修改 `src/audit-core/knowledge/loader.ts`

```typescript
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildSearchPolicySection } from "../search/policy"
import { getClaudeConfigDir, parseJsoncSafe } from "../../shared"
import { parseFrontmatter } from "../../shared/frontmatter"

const baseAppsPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "apps"
)

// === 类型定义 ===
type SkillReferenceEntry = {
  file?: string
  path?: string
}

type SkillReferencesManifest = {
  references?: Array<string | SkillReferenceEntry>
  depends_on?: string[]  // 新增：依赖声明
}

interface InjectionProfileSkill {
  description: string
  inject_to: string[]
  priority: number
  files?: string[]
}

interface InjectionProfile {
  version: string
  description: string
  skills: Record<string, InjectionProfileSkill>
  injection_order: string[]
}

type SkillFrontmatter = {
  name?: string
}

// === 工具函数 ===
function readJsonSafe<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null
  }
  const content = fs.readFileSync(filePath, "utf-8")
  const { data } = parseJsoncSafe<T>(content)
  return data ?? null
}

function readFileSafe(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return ""
  }
  return fs.readFileSync(filePath, "utf-8")
}

// === Skill 目录解析 ===
function resolveSkillDirByName(skillsRoot: string, skillName: string): string | null {
  if (!fs.existsSync(skillsRoot)) {
    return null
  }

  const entries = fs.readdirSync(skillsRoot, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue

    const entryPath = path.join(skillsRoot, entry.name)
    const skillFile = path.join(entryPath, "SKILL.md")
    if (!fs.existsSync(skillFile)) continue

    const content = fs.readFileSync(skillFile, "utf-8")
    const { data, parseError } = parseFrontmatter<SkillFrontmatter>(content)
    if (parseError) continue

    const resolvedName = data.name || entry.name
    if (resolvedName === skillName) {
      return entryPath
    }
  }

  return null
}

function resolveSkillDir(skillName: string): string | null {
  const projectSkillsRoot = path.join(process.cwd(), ".claude", "skills")
  const userSkillsRoot = path.join(getClaudeConfigDir(), "skills")
  const hasProjectSkills = fs.existsSync(projectSkillsRoot)

  const projectMatch = resolveSkillDirByName(projectSkillsRoot, skillName)
  if (projectMatch) {
    return projectMatch
  }

  if (hasProjectSkills) {
    return null
  }

  return resolveSkillDirByName(userSkillsRoot, skillName)
}

// === 新增：加载 Skill Manifest ===
function loadSkillManifest(skillName: string): SkillReferencesManifest | null {
  const skillDir = resolveSkillDir(skillName)
  if (!skillDir) return null
  
  const manifestPath = path.join(skillDir, "references", "manifest.json")
  return readJsonSafe<SkillReferencesManifest>(manifestPath)
}

// === 新增：依赖解析（拓扑排序） ===
function resolveSkillWithDependencies(
  skillName: string,
  visited: Set<string> = new Set(),
  visiting: Set<string> = new Set()
): string[] {
  // 循环依赖检测
  if (visiting.has(skillName)) {
    console.warn(`[skill-loader] Circular dependency detected: ${skillName}`)
    return []
  }
  
  // 已处理过
  if (visited.has(skillName)) {
    return []
  }
  
  visiting.add(skillName)
  const result: string[] = []
  
  // 加载 manifest 获取依赖
  const manifest = loadSkillManifest(skillName)
  if (manifest?.depends_on) {
    for (const dep of manifest.depends_on) {
      result.push(...resolveSkillWithDependencies(dep, visited, visiting))
    }
  }
  
  visiting.delete(skillName)
  visited.add(skillName)
  result.push(skillName)
  
  return result
}

// === 新增：加载 Injection Profile ===
function loadInjectionProfile(appId: string): InjectionProfile | null {
  const skillName = `${appId}-knowledge-injection`
  const skillDir = resolveSkillDir(skillName)
  if (!skillDir) return null
  
  const profilePath = path.join(skillDir, "references", "injection_profile.json")
  return readJsonSafe<InjectionProfile>(profilePath)
}

// === 新增：根据 Agent 获取应注入的 Skills ===
function getSkillsForAgent(profile: InjectionProfile, agentName: string): string[] {
  const matchingSkills: Array<{ name: string; priority: number }> = []
  
  for (const [skillName, config] of Object.entries(profile.skills)) {
    if (config.inject_to.includes(agentName)) {
      matchingSkills.push({ name: skillName, priority: config.priority })
    }
  }
  
  // 按 priority 排序（数字越小越先）
  matchingSkills.sort((a, b) => a.priority - b.priority)
  
  return matchingSkills.map(s => s.name)
}

// === Reference 文件解析 ===
function resolveReferenceFile(ref: string | SkillReferenceEntry): string | null {
  if (typeof ref === "string") {
    return ref.trim() || null
  }

  if (ref && typeof ref === "object") {
    if (typeof ref.file === "string" && ref.file.trim()) {
      return ref.file.trim()
    }
    if (typeof ref.path === "string" && ref.path.trim()) {
      return ref.path.trim()
    }
  }

  return null
}

// === 加载单个 Skill 的 References ===
function loadSkillReferences(skillName: string): string {
  const skillDir = resolveSkillDir(skillName)
  if (!skillDir) {
    return ""
  }

  const referencesDir = path.join(skillDir, "references")
  const manifestPath = path.join(referencesDir, "manifest.json")
  const manifest = readJsonSafe<SkillReferencesManifest>(manifestPath)
  const references = Array.isArray(manifest?.references)
    ? manifest.references
        .map((ref) => resolveReferenceFile(ref))
        .filter((ref): ref is string => Boolean(ref))
    : []

  if (references.length === 0) {
    return ""
  }

  const contents = references
    .map((ref) => readFileSafe(path.join(referencesDir, ref)))
    .filter((text) => text.trim().length > 0)

  return contents.join("\n\n")
}

// === 新增：加载 Skills 及其依赖的 References ===
function loadSkillReferencesWithDependencies(skillNames: string[]): string {
  const visited = new Set<string>()
  const allSkills: string[] = []
  
  // 解析所有依赖
  for (const skillName of skillNames) {
    const resolved = resolveSkillWithDependencies(skillName, visited)
    allSkills.push(...resolved)
  }
  
  // 去重并保持顺序
  const uniqueSkills = [...new Set(allSkills)]
  
  // 加载所有 references
  const contents = uniqueSkills
    .map((skillName) => loadSkillReferences(skillName))
    .filter((text) => text.trim().length > 0)

  return contents.join("\n\n")
}

// === 公开 API ===
export function getAuditAppId(): string {
  return process.env.AUDIT_APP?.trim() || "spousal"
}

export function loadAuditAgentPrompt(appId: string, agentName: string): string {
  const promptPath = path.join(baseAppsPath, appId, "agents", `${agentName}.md`)
  return readFileSafe(promptPath)
}

export function buildAuditPrompt(
  basePrompt: string,
  appId: string,
  agentName: string,
  explicitSkills: string[] = []
): string {
  // 1. 尝试加载 injection profile 进行自动 skill 发现
  const profile = loadInjectionProfile(appId)
  
  // 2. 确定要加载的 skills
  let skillNames: string[]
  if (profile) {
    // 使用 profile 自动发现 agent 应该注入的 skills
    const autoSkills = getSkillsForAgent(profile, agentName)
    // 合并显式指定的 skills（去重）
    skillNames = [...new Set([...autoSkills, ...explicitSkills])]
  } else {
    // 回退到显式指定
    skillNames = explicitSkills
  }
  
  // 3. 加载 skill references（包含依赖解析）
  const skillReferences = loadSkillReferencesWithDependencies(skillNames).trim()
  
  // 4. 加载 agent-specific prompt
  const agentPrompt = loadAuditAgentPrompt(appId, agentName).trim()
  
  // 5. 构建最终 prompt
  const sections: string[] = []

  if (agentPrompt) {
    sections.push(`<Business_Context>\n${agentPrompt}\n</Business_Context>`)
  }

  if (skillReferences) {
    sections.push(`<Skill_References>\n${skillReferences}\n</Skill_References>`)
  }

  const searchPolicy = buildSearchPolicySection().trim()
  if (searchPolicy) {
    sections.push(searchPolicy)
  }

  if (sections.length === 0) {
    return basePrompt
  }

  return `${basePrompt}\n\n${sections.join("\n\n")}`
}

// === 导出辅助函数（用于测试和调试）===
export {
  loadInjectionProfile,
  getSkillsForAgent,
  resolveSkillWithDependencies,
  loadSkillReferencesWithDependencies,
}
```

### 7.2 更新 manifest.json（立即执行）

**文件**: `.claude/skills/spousal-client-guidance/references/manifest.json`

```json
{
  "name": "spousal-client-guidance",
  "version": "1.1.0",
  "description": "Client guidance templates for spousal sponsorship applications.",
  "categories": ["audit", "guidance", "templates", "spousal", "client"],
  "quality_level": "L4",
  "quickstart_paths": ["../SKILL.md"],
  "references": [
    "love_story_guide.md",
    "interview_guide.md",
    "document_list_guide.md",
    "checklist_schema.json"
  ],
  "depends_on": [
    "spousal-doc-analysis"
  ],
  "guide_types": [
    {
      "type": "relationship_statement",
      "template": "love_story_guide.md",
      "description": "Template for writing relationship narrative",
      "language": "zh-CN"
    },
    {
      "type": "interview_preparation",
      "template": "interview_guide.md",
      "description": "Framework for interview question preparation",
      "language": "zh-CN"
    },
    {
      "type": "document_checklist",
      "template": "document_list_guide.md",
      "description": "Customizable document checklist based on IMM 5533",
      "language": "zh-CN"
    }
  ]
}
```

### 7.3 单元测试

**文件**: `src/audit-core/knowledge/loader.test.ts` (新建或扩展)

```typescript
import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import fs from "node:fs"
import path from "node:path"
import { tmpdir } from "node:os"
import {
  buildAuditPrompt,
  loadInjectionProfile,
  getSkillsForAgent,
  resolveSkillWithDependencies,
} from "./loader"

describe("Skill Dependency Resolution", () => {
  let tempDir: string
  let originalCwd: string

  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = fs.mkdtempSync(path.join(tmpdir(), "skill-deps-"))
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  function createSkill(name: string, dependsOn: string[] = [], references: string[] = []) {
    const skillDir = path.join(tempDir, ".claude", "skills", name)
    const refsDir = path.join(skillDir, "references")
    fs.mkdirSync(refsDir, { recursive: true })

    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      `---\nname: ${name}\n---\nSkill body for ${name}`
    )

    fs.writeFileSync(
      path.join(refsDir, "manifest.json"),
      JSON.stringify({
        name,
        references,
        depends_on: dependsOn.length > 0 ? dependsOn : undefined,
      })
    )

    for (const ref of references) {
      fs.writeFileSync(path.join(refsDir, ref), `Content of ${ref}`)
    }
  }

  it("resolves skill dependencies in topological order", () => {
    // #given: skill A depends on B, B depends on C
    createSkill("skill-c", [], ["c-ref.md"])
    createSkill("skill-b", ["skill-c"], ["b-ref.md"])
    createSkill("skill-a", ["skill-b"], ["a-ref.md"])

    // #when
    process.chdir(tempDir)
    const resolved = resolveSkillWithDependencies("skill-a")

    // #then: order should be C -> B -> A (dependencies first)
    expect(resolved).toEqual(["skill-c", "skill-b", "skill-a"])
  })

  it("handles circular dependencies gracefully", () => {
    // #given: A -> B -> A (circular)
    createSkill("skill-a", ["skill-b"], ["a-ref.md"])
    createSkill("skill-b", ["skill-a"], ["b-ref.md"])

    // #when
    process.chdir(tempDir)
    const resolved = resolveSkillWithDependencies("skill-a")

    // #then: should not infinite loop, returns partial result
    expect(resolved.length).toBeLessThanOrEqual(2)
  })

  it("deduplicates shared dependencies", () => {
    // #given: A -> C, B -> C (C is shared)
    createSkill("skill-c", [], ["c-ref.md"])
    createSkill("skill-a", ["skill-c"], ["a-ref.md"])
    createSkill("skill-b", ["skill-c"], ["b-ref.md"])

    // #when: load both A and B
    process.chdir(tempDir)
    const visited = new Set<string>()
    const result: string[] = []
    result.push(...resolveSkillWithDependencies("skill-a", visited))
    result.push(...resolveSkillWithDependencies("skill-b", visited))

    // #then: C should appear only once
    const cCount = result.filter(s => s === "skill-c").length
    expect(cCount).toBe(1)
  })
})

describe("Injection Profile", () => {
  it("returns skills for specific agent based on inject_to", () => {
    // #given
    const profile = {
      version: "test-v1",
      description: "Test profile",
      skills: {
        "skill-a": { description: "A", inject_to: ["detective", "gatekeeper"], priority: 1 },
        "skill-b": { description: "B", inject_to: ["gatekeeper"], priority: 2 },
        "skill-c": { description: "C", inject_to: ["detective"], priority: 3 },
      },
      injection_order: ["skill-a", "skill-b", "skill-c"],
    }

    // #when
    const gatekeeperSkills = getSkillsForAgent(profile, "gatekeeper")
    const detectiveSkills = getSkillsForAgent(profile, "detective")

    // #then
    expect(gatekeeperSkills).toEqual(["skill-a", "skill-b"])
    expect(detectiveSkills).toEqual(["skill-a", "skill-c"])
  })

  it("sorts skills by priority", () => {
    // #given
    const profile = {
      version: "test-v1",
      description: "Test profile",
      skills: {
        "skill-high": { description: "H", inject_to: ["agent"], priority: 5 },
        "skill-low": { description: "L", inject_to: ["agent"], priority: 1 },
        "skill-mid": { description: "M", inject_to: ["agent"], priority: 3 },
      },
      injection_order: [],
    }

    // #when
    const skills = getSkillsForAgent(profile, "agent")

    // #then: sorted by priority (ascending)
    expect(skills).toEqual(["skill-low", "skill-mid", "skill-high"])
  })
})
```

---

## 八、执行计划

### Phase 1: 立即修复（无代码改动）

1. [ ] 更新 `spousal-client-guidance/references/manifest.json`
   - 添加 `checklist_schema.json` 到 references
   - 添加 `depends_on: ["spousal-doc-analysis"]`

2. [ ] 在 gatekeeper agent 中手动添加 skills:
   - `spousal-client-guidance`
   - `spousal-doc-analysis`

### Phase 2: 实现自动注入（需要代码改动）

3. [ ] 修改 `src/audit-core/knowledge/loader.ts`
   - 添加 `loadInjectionProfile()` 函数
   - 添加 `getSkillsForAgent()` 函数
   - 添加 `resolveSkillWithDependencies()` 函数
   - 修改 `buildAuditPrompt()` 支持自动发现

4. [ ] 添加单元测试
   - 测试依赖解析
   - 测试循环依赖检测
   - 测试 injection profile 解析

5. [ ] 验证端到端
   - 生成材料清单使用正确的 JSON 格式
   - 条件逻辑（ONE_OF 等）正确应用

### Phase 3: 简化配置

6. [ ] 移除 agent 配置中的冗余 skills 列表
7. [ ] 让 injection_profile.json 成为唯一配置源
8. [ ] 更新文档

---

## 九、长期演进

### 9.1 SKILL.md Frontmatter 扩展

考虑将 `depends_on` 和 `inject_to` 移入 SKILL.md frontmatter（更符合 Claude Code 规范）：

```yaml
---
name: spousal-client-guidance
description: Client guidance for spousal applications
depends_on:
  - spousal-doc-analysis
inject_to:
  - gatekeeper
priority: 5
---
```

### 9.2 向 OpenCode 上游提交 PR

如果 Claude Code 官方规范支持 `depends_on`，可以提交 PR 到 `src/features/opencode-skill-loader/` 实现通用的依赖解析。
