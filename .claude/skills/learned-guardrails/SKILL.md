---
name: learned-guardrails
description: |
  经验知识防御层 - 从人工发现的错误中学习的规则库。
  用于 Verifier 验证阶段，检测语义混淆、时间线错误、文档不一致等问题。
  触发场景：Ultra 层审核验证阶段、Gatekeeper 最终检查、人工标记的高风险结论。
---

# Learned Guardrails

> **核心理念：让系统从错误中学习，而不是重复错误。**

## 概述

Learned Guardrails 是一个经验知识库，将人工发现的审核错误转化为可学习的规则。
它作为 Verifier 的知识来源，在 Detective/Strategist 分析后进行独立验证。

## 架构

```
[阶段1：分析]
案件文档 → Detective → Strategist → 初步结论

[阶段2：验证]
初步结论 → Verifier (使用 Learned Guardrails) → 验证后结论

[阶段3：合规]
验证后结论 → Gatekeeper → 最终报告
```

## 规则结构

```
rules/
├── core/                   # 通用规则（所有案件类型继承）
│   ├── semantic/           # 语义混淆
│   ├── timeline/           # 时间线问题
│   └── document/           # 文档不一致
├── spousal/                # Spousal 特定规则
└── study/                  # Study 特定规则
```

**继承逻辑：**
- Spousal 案件 = `core/*` + `spousal/*`
- Study 案件 = `core/*` + `study/*`

## 规则格式

每条规则使用 **YAML frontmatter + Markdown body**：

```markdown
---
id: RULE-001
category: semantic_confusion
severity: high
triggers:
  - "no ceremony"
  - "没有婚礼"
learned_from: "Tian-Huang 2026-01-18"
app_types: ["spousal"]
---

# 规则标题

## 错误模式
[描述常见的错误理解]

## 正确理解
[描述正确的理解方式]

## 验证步骤
[列出具体的验证步骤]

## 相关案例
[引用相关判例法或案例]
```

## 匹配机制

**两阶段匹配：**

1. **Stage 1 - 关键词快速匹配**
   - 检查文本是否包含规则的 `triggers`
   - O(n) 复杂度，快速筛选

2. **Stage 2 - 语义兜底匹配**
   - 如果 Stage 1 没有匹配，使用 LLM 判断
   - 比较结论与规则的 `semantic_description`

## 使用方式

### 1. 加载规则

```python
from scripts.match_rules import load_manifest, match_rules

manifest = load_manifest()
matched = match_rules(
    text="no formal wedding ceremony",
    conclusion="婚姻状态矛盾，misrep 风险",
    app_type="spousal",
    manifest=manifest
)
```

### 2. 应用规则

```python
for rule in matched:
    # 加载规则详情
    rule_content = load_rule(rule['path'])
    # 执行验证步骤
    verify_result = apply_verification_steps(rule_content)
```

## 规则索引

详见 [manifest.json](./manifest.json)

## 当前规则列表

| ID | 类别 | 描述 | 来源 |
|----|------|------|------|
| RULE-001 | semantic_confusion | ceremony vs marriage | Tian-Huang 2026-01-18 |

## 添加新规则

1. 在对应目录创建 `RULE-XXX-name.md`
2. 更新 `manifest.json`
3. 运行 `python scripts/sync_rules.py --check` 验证

## 相关文档

- [Verifier Solution Proposal](/.chief/plans/Verifier_Solution_Proposal_2026-01-18.md)
- [Knowledge Manager Skill](~/.claude/skills/knowledge-manager/SKILL.md)
