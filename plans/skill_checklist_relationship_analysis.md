# Skill 配置与材料清单改进的关系分析

## 一、当前文件分布

### 1. 我之前的改进创建/修改的文件

| 文件 | 位置 | 内容 |
|------|------|------|
| `document_list_guide.md` | `spousal-client-guidance/references/` | **已更新** - 新版 JSON 输出格式指南 |
| `checklist_schema.json` | `spousal-client-guidance/references/` | **新建** - JSON Schema 定义 |
| `wang_zhang_checklist.json` | `plans/` | **新建** - 测试案例的正确清单 |

### 2. 原有的规则文件

| 文件 | 位置 | 内容 |
|------|------|------|
| `imm5533_checklist.md` | `spousal-doc-analysis/references/` | IMM 5533 完整规则（条件逻辑、ONE_OF 等） |
| `evidence_standards.md` | `spousal-doc-analysis/references/` | 证据标准 |
| `consistency_rules.md` | `spousal-doc-analysis/references/` | 一致性检查规则 |

---

## 二、关键关系分析

### 问题：`document_list_guide.md` 引用了 `imm5533_checklist.md`，但它们在不同的 Skill 中！

```
spousal-client-guidance/references/document_list_guide.md
  第3行: "请依据 `imm5533_checklist.md` 规则文件..."
  第7行: "必须先读取规则文件: imm5533_checklist.md"
                    ↓
                    引用
                    ↓
spousal-doc-analysis/references/imm5533_checklist.md
```

### 当前 manifest.json 配置

**spousal-client-guidance/references/manifest.json**:
```json
{
  "references": [
    "love_story_guide.md",
    "interview_guide.md",
    "document_list_guide.md"  // ✓ 会被加载
  ]
}
// 注意：checklist_schema.json 不在 references 列表中！
```

**spousal-doc-analysis/references/manifest.json**:
```json
{
  "references": [
    "baseline_doc_analysis.md",
    "extraction_schema.json",
    "imm5533_checklist.md",     // ✓ 规则文件
    "evidence_standards.md",
    "consistency_rules.md"
  ]
}
```

---

## 三、冲突分析

### 冲突 1：跨 Skill 引用无法解析

**问题**：
- `document_list_guide.md` 说 "必须先读取 `imm5533_checklist.md`"
- 但如果只注入 `spousal-client-guidance` skill，LLM 拿不到 `imm5533_checklist.md` 的内容
- 因为 `imm5533_checklist.md` 在另一个 skill (`spousal-doc-analysis`) 中

**影响**：
- 即使修复了 skill 注入，如果只注入 `spousal-client-guidance`，LLM 仍然无法正确生成清单
- 必须同时注入两个 skills

### 冲突 2：`checklist_schema.json` 未被注册

**问题**：
- 我创建了 `checklist_schema.json` 定义 JSON 输出格式
- 但它没有被添加到 `manifest.json` 的 `references` 数组中
- 因此即使 skill 被注入，schema 文件也不会被加载

**需要修复**：
```json
{
  "references": [
    "love_story_guide.md",
    "interview_guide.md",
    "document_list_guide.md",
    "checklist_schema.json"  // 需要添加
  ]
}
```

### 冲突 3：依赖关系未在设计中体现

**问题**：
- `document_list_guide.md` 依赖 `imm5533_checklist.md`
- 但 `spousal-client-guidance` skill 没有声明对 `spousal-doc-analysis` 的依赖
- Skill 系统不支持自动加载依赖 skill

---

## 四、解决方案对比

### 方案 A：同时注入两个 Skills（推荐）

在需要生成材料清单的 agent 中配置两个 skills：

```typescript
const skills = [
  `${skillPrefix}-client-guidance`,  // 包含 document_list_guide.md
  `${skillPrefix}-doc-analysis`,     // 包含 imm5533_checklist.md
]
```

**优点**：
- 不改变现有 skill 结构
- 两个 skill 的职责清晰分离

**缺点**：
- 需要记住同时配置两个 skills
- 如果遗漏一个，会导致部分规则缺失

### 方案 B：移动 `imm5533_checklist.md` 到 `spousal-client-guidance`

将 `imm5533_checklist.md` 复制或移动到 `spousal-client-guidance/references/`，并更新 manifest：

```json
{
  "references": [
    "love_story_guide.md",
    "interview_guide.md",
    "document_list_guide.md",
    "checklist_schema.json",
    "imm5533_checklist.md"  // 移动过来
  ]
}
```

**优点**：
- 单一 skill 包含所有必需文件
- 不需要跨 skill 依赖

**缺点**：
- 文件重复（`imm5533_checklist.md` 在两处）
- 违反 DRY 原则
- 更新时需要同步两份

### 方案 C：创建符号链接

在 `spousal-client-guidance/references/` 中创建符号链接指向 `imm5533_checklist.md`：

```bash
cd .claude/skills/spousal-client-guidance/references/
ln -s ../../spousal-doc-analysis/references/imm5533_checklist.md .
```

**优点**：
- 单一源文件
- skill 可以独立工作

**缺点**：
- 符号链接可能在某些环境下有问题
- 增加了隐式依赖

### 方案 D：修改 `document_list_guide.md` 使其自包含

将 `imm5533_checklist.md` 的关键规则内嵌到 `document_list_guide.md` 中，而不是引用外部文件。

**优点**：
- 单一文件完全自包含
- 不依赖任何外部 skill

**缺点**：
- 文件变得很长
- 规则重复，维护成本高

---

## 五、推荐方案

### 立即执行（短期）：方案 A + 修复 manifest

1. **更新 `spousal-client-guidance/references/manifest.json`**：
   ```json
   {
     "references": [
       "love_story_guide.md",
       "interview_guide.md",
       "document_list_guide.md",
       "checklist_schema.json"
     ]
   }
   ```

2. **在 gatekeeper agent 中同时配置两个 skills**：
   ```typescript
   const appSkills = [
     `${skillPrefix}-audit-rules`,
     `${skillPrefix}-knowledge-injection`,
     `${skillPrefix}-client-guidance`,  // 添加
     `${skillPrefix}-doc-analysis`,     // 添加
   ]
   ```

### 长期优化

考虑实现 skill 依赖系统，在 `SKILL.md` frontmatter 中声明依赖：

```yaml
---
name: spousal-client-guidance
depends_on:
  - spousal-doc-analysis
---
```

然后在 skill 加载时自动解析依赖链。

---

## 六、验证清单

修复后需要验证：

- [ ] `checklist_schema.json` 在 manifest 中注册
- [ ] Gatekeeper agent 配置了 `spousal-client-guidance` skill
- [ ] Gatekeeper agent 配置了 `spousal-doc-analysis` skill
- [ ] 两个 skill 的 reference 文件都被正确加载
- [ ] LLM 可以访问 `document_list_guide.md` 和 `imm5533_checklist.md`
- [ ] 生成的清单使用 JSON 格式和正确的条件逻辑
