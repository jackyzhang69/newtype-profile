# 审核系统知识防御层解决方案

## Verifier + Learned Guardrails 架构提案

**日期:** 2026年1月18日  
**版本:** v1.1  
**状态:** 设计决策已确定，待实施  
**最后更新:** 2026年1月18日

---

## 1. 问题背景

### 1.1 发现的错误案例

在 Tian-Huang 配偶担保案件的 ULTRA 级别审核中，系统产生了一个关键性的分析错误：

| 项目 | 详情 |
|------|------|
| **原文描述** | "no formal wedding ceremony"（没有婚礼仪式） |
| **系统理解** | "no formal marriage yet"（尚未正式结婚） |
| **实际情况** | 已于2023年6月6日合法结婚，只是没有举办婚礼宴席 |
| **错误影响** | 错误地将案件标记为 CRITICAL misrepresentation 风险 |

### 1.2 错误的本质

这是一个**语义边界错误**——系统混淆了两个相关但不同的概念：

- `ceremony`（仪式）不等于 `marriage`（婚姻）
- 民事登记 不等于 婚礼仪式

### 1.3 当前架构的盲点

```
案件文档 -> Detective -> Strategist -> Gatekeeper -> 最终报告
              |            |            |
          判例法研究    风险评估    合规检查
```

**问题：没有一层专门做"语义一致性验证"和"常识推理"**

- Detective：专注找判例法，不质疑输入的事实假设
- Strategist：基于 Detective 的输出，继承了错误假设
- Gatekeeper：检查文档完整性，但不做语义校验

---

## 2. 解决方案

### 2.1 核心架构：Verifier + Learned Guardrails

我们提议采用**双层防御机制**：

```
[阶段1：分析]
案件文档 -> Detective -> Strategist -> 初步结论

[阶段2：验证] <-- 新增
初步结论 -> Verifier Agent -> 验证后结论
              |
         Learned Guardrails
         (经验知识库)

[阶段3：合规]
验证后结论 -> Gatekeeper -> 最终报告
```

### 2.2 组件1：Verifier Agent

**定位：** 独立的事实核查 Agent，在 Gatekeeper 之前增加验证层

**核心原则：**

1. **不继承任何前序 Agent 的假设**
2. **独立阅读原始文档**
3. **交叉验证关键事实**
4. **检测语义混淆和逻辑不一致**

**工作流程：**

```
Verifier 接收：
  - Detective/Strategist 的结论
  - 原始文档访问权限

Verifier 执行：
  1. 独立阅读原始文档
  2. 提取关键事实（婚姻日期、关系状态、时间线）
  3. 参考 Learned Guardrails 规则库
  4. 交叉验证初步结论
  5. 标记任何不一致

Verifier 输出：
  - 验证通过 -> 继续到 Gatekeeper
  - 发现问题 -> 标记并修正结论
```

**应用到本案例：**

```
Verifier 收到：
  Detective 结论："婚姻状态矛盾，misrep 风险"

Verifier 执行：
  1. 读取 IMM 0008 -> 结婚日期 2023-06-06 [v]
  2. 读取结婚证 -> 确认 2023-06-06 [v]
  3. 读取爱情故事 -> "no ceremony" 
  4. 触发规则 RULE-001："ceremony 不等于 marriage"
  5. 校验：有结婚证 = 已合法结婚，只是没有仪式

Verifier 结论：
  Detective 假设错误，不存在 misrepresentation
  风险降级：CRITICAL -> LOW
```

### 2.3 组件2：Learned Guardrails 知识库

**定位：** 将人工发现的错误转化为可学习的规则，形成不断增长的"经验知识库"

**存储格式：** YAML 配置文件

**规则结构示例：**

```yaml
# learned-rules.yaml

rules:
  - id: "RULE-001"
    category: "semantic_confusion"
    learned_from: "Tian-Huang case 2026-01-18"
    
    trigger_pattern: 
      - "no ceremony"
      - "没有婚礼"
      - "no formal wedding"
      - "没有举办仪式"
    
    error_type: "混淆 ceremony 与 marriage"
    
    correct_interpretation: |
      "No ceremony" = 没有举办婚礼仪式/宴席
      "No marriage" = 没有合法结婚
      这两个是不同的概念
      应检查 marriage certificate 来判断婚姻状态
    
    verification_steps:
      - "检查 IMM 0008 的 marriage date 字段"
      - "检查是否提交了 marriage certificate"
      - "如果有有效的结婚证，则已合法结婚"
    
    severity_adjustment:
      from: "CRITICAL - misrepresentation risk"
      to: "LOW - normal explanation for no ceremony"
    
    case_law_note: |
      根据判例法，缺少婚礼仪式不等于便利婚姻
      需要其他证据证明关系的公开性
```

**规则分类体系：**

| 类别 | 描述 | 示例 |
|------|------|------|
| `semantic_confusion` | 语义混淆 | ceremony vs marriage |
| `timeline_interpretation` | 时间线解读 | 同居日期 vs 关系开始日期 |
| `document_cross_check` | 跨文档校验 | IMM 0008 vs 结婚证日期 |
| `cultural_context` | 文化背景 | 中国婚俗 vs 加拿大要求 |
| `legal_terminology` | 法律术语 | common-law vs married |

---

## 3. 实施方案

### 3.1 Verifier Agent 设计

**Agent 配置：**

```yaml
name: verifier
model: claude-sonnet-4-5
temperature: 0.1
description: |
  独立的事实核查 Agent
  专注于交叉验证关键事实和检测语义混淆
  不继承前序 Agent 的假设

tools:
  include:
    - mcp_read
    - mcp_look_at
    - mcp_grep
    - mcp_skill  # 访问 learned-guardrails

system_prompt: |
  你是 Verifier，一个独立的事实核查专家。
  
  核心原则：
  1. 不信任任何前序分析的假设
  2. 独立阅读原始文档
  3. 交叉验证所有关键事实
  4. 检测语义混淆和逻辑不一致
  
  工作流程：
  1. 加载 learned-guardrails skill
  2. 接收初步结论
  3. 独立阅读原始文档
  4. 提取关键事实
  5. 检查是否触发任何规则
  6. 交叉验证结论
  7. 输出验证报告
```

### 3.2 Learned Guardrails Skill 设计（更新）

借鉴 **Knowledge Manager** 和 **Context7** 的设计模式：

**Skill 结构：**

```
learned-guardrails/
├── SKILL.md                    # 入口（< 500 行）
├── manifest.json               # Single Source of Truth（索引 + 元数据）
├── scripts/
│   ├── match_rules.py          # 两阶段匹配逻辑
│   └── sync_rules.py           # 规则同步工具
├── rules/
│   ├── core/                   # 通用规则（所有案件类型继承）
│   │   ├── semantic/
│   │   │   ├── _category.md    # 类别规则（语义描述）
│   │   │   ├── RULE-001-ceremony-vs-marriage.md
│   │   │   └── RULE-002-cohabitation-vs-relationship.md
│   │   ├── timeline/
│   │   │   ├── _category.md
│   │   │   └── RULE-010-gap-verification.md
│   │   └── document/
│   │       ├── _category.md
│   │       └── RULE-020-cross-document-dates.md
│   ├── spousal/                # Spousal 特定规则
│   │   ├── genuineness/
│   │   │   └── RULE-S001-relationship-progression.md
│   │   └── cultural/
│   │       └── RULE-S010-chinese-wedding-customs.md
│   └── study/                  # Study 特定规则
│       └── intent/
│           └── RULE-T001-study-plan-logic.md
```

**manifest.json 设计：**

```json
{
  "version": "1.0",
  "base_path": "rules",
  "categories": {
    "semantic_confusion": "语义混淆 - 概念边界错误",
    "timeline_issues": "时间线问题 - 日期解读错误",
    "document_inconsistency": "文档不一致 - 跨文档校验",
    "cultural_context": "文化背景 - 文化差异理解"
  },
  "rules": [
    {
      "id": "RULE-001",
      "path": "core/semantic/RULE-001-ceremony-vs-marriage.md",
      "category": "semantic_confusion",
      "triggers": ["no ceremony", "没有婚礼", "no formal wedding"],
      "semantic_description": "混淆婚礼仪式(ceremony)与合法婚姻(marriage)的概念",
      "severity": "high",
      "learned_from": "Tian-Huang 2026-01-18",
      "app_types": ["spousal"]
    }
  ]
}
```

**两阶段匹配逻辑：**

```python
# scripts/match_rules.py

def match_rules(text: str, conclusion: str, app_type: str, manifest: dict) -> list:
    """
    两阶段规则匹配
    Stage 1: 关键词快速匹配（O(n)）
    Stage 2: 语义匹配兜底（LLM 判断）
    """
    matched = []
    
    # Stage 1: 快速匹配（关键词）
    for rule in manifest['rules']:
        # 检查 app_type 是否匹配
        if app_type not in rule.get('app_types', ['all']):
            continue
        # 检查触发词
        for trigger in rule['triggers']:
            if trigger.lower() in text.lower():
                matched.append(rule)
                break
    
    # Stage 2: 语义匹配（如果 Stage 1 没有匹配）
    if not matched:
        for rule in manifest['rules']:
            if app_type not in rule.get('app_types', ['all']):
                continue
            # 使用 LLM 判断语义相关性
            if llm_judge_relevance(conclusion, rule['semantic_description']):
                matched.append(rule)
    
    return matched
```

**继承逻辑：**

```
Spousal 案件加载 = core/* + spousal/*
Study 案件加载 = core/* + study/*
```

### 3.3 规则维护流程

```
[发现错误] -> [分析根源] -> [提炼规则] -> [加入知识库] -> [验证生效]
     |            |            |             |             |
  人工复核    确定类别    编写YAML    PR审核      测试案例
```

**规则添加模板：**

```yaml
- id: "RULE-XXX"
  category: "[类别]"
  learned_from: "[案件名称] [日期]"
  trigger_pattern: 
    - "[触发词1]"
    - "[触发词2]"
  error_type: "[错误类型描述]"
  correct_interpretation: |
    [正确的理解方式]
  verification_steps:
    - "[验证步骤1]"
    - "[验证步骤2]"
  severity_adjustment:
    from: "[原风险级别]"
    to: "[调整后级别]"
```

---

## 4. 优势分析

### 4.1 为什么这个方案更好

| 优势 | 说明 |
|------|------|
| **独立验证** | Verifier 不受前序错误污染 |
| **经验积累** | 错误不会重复，系统越用越聪明 |
| **可扩展** | 规则库可以不断增长 |
| **可追溯** | 每个规则都有来源记录 |
| **成本可控** | 只增加一个 Agent，不是完全重构 |
| **人工智慧传承** | 专家知识可以固化为规则 |

### 4.2 与其他方案的比较

| 方案 | 优点 | 缺点 |
|------|------|------|
| **仅增加规则** | 简单直接 | 可能遗漏新类型错误 |
| **仅增加 Verifier** | 灵活 | 无法积累经验 |
| **对抗性审核** | 全面 | 成本高，可能过度质疑 |
| **Verifier + Guardrails** | 平衡 | 需要持续维护 |

---

## 5. 设计决策（已确定）

### 5.1 架构决策

| 问题 | 决策 | 理由 |
|------|------|------|
| **问题1：Verifier 定位** | ✅ **选项C：作为 Skill 注入** | 更灵活，可动态注入，与现有 Skill 系统一致 |
| **问题2：触发时机** | ✅ **选项C：按层级决定** | Guest 层不需要，Pro 层简化版，Ultra 层完整版 |

### 5.2 知识库决策

| 问题 | 决策 | 理由 |
|------|------|------|
| **问题3：规则格式** | ✅ **YAML frontmatter + Markdown body** | 与现有 Skill 系统一致，机器可解析 + 人类可读 |
| **问题4：规则粒度** | ✅ **两层结构（Category + Pattern）** | 平衡通用性和精确性，避免规则爆炸 |
| **问题5：规则组织** | ✅ **manifest.json 索引 + core/spousal 继承** | 借鉴 Knowledge Manager，复用通用规则 |

### 5.3 匹配机制决策（新增）

借鉴 **Context7** 和 **Knowledge Manager** 的设计：

| 决策 | 说明 |
|------|------|
| **两阶段匹配** | Stage 1: 关键词快速匹配 → Stage 2: 语义兜底匹配 |
| **manifest.json 索引** | 包含 triggers（关键词）+ semantic_description（语义描述） |
| **继承机制** | Spousal 案件 = core/* + spousal/*，Study 案件 = core/* + study/* |

### 5.4 待定运维问题

以下问题待后续实施时确定：

6. **规则冲突处理** - 待定
7. **人工参与时机** - 初步：Verifier 标记"不确定"时介入
8. **规则有效性验证** - 待定

---

## 6. 下一步行动

### 6.1 短期（1-2周）

- [x] 确定架构方案 ✅ 2026-01-18
- [x] 确定 Verifier 定位：Skill 注入 ✅ 2026-01-18
- [x] 确定规则格式：YAML frontmatter + Markdown ✅ 2026-01-18
- [x] 确定规则组织：manifest.json + 继承结构 ✅ 2026-01-18
- [x] 确定匹配机制：两阶段（关键词 + 语义） ✅ 2026-01-18
- [x] 创建 learned-guardrails skill 目录结构 ✅ 2026-01-18
- [x] 创建 manifest.json 模板 ✅ 2026-01-18
- [x] 添加第一条规则（RULE-001: ceremony vs marriage） ✅ 2026-01-18
- [x] 实现 match_rules.py 两阶段匹配 ✅ 2026-01-18
- [x] 实现 sync_rules.py 规则管理工具 ✅ 2026-01-18
- [ ] 设计 Verifier Skill prompt

### 6.2 中期（1个月）

- [x] 实现 match_rules.py 两阶段匹配 ✅ 2026-01-18 (moved from short-term)
- [x] 创建 learned-guardrails references 结构 ✅ 2026-01-18
- [x] 集成到 Gatekeeper 流程（通过 spousal-knowledge-injection profile） ✅ 2026-01-18
- [x] 更新 Gatekeeper prompt 添加 Semantic Verification MODE C ✅ 2026-01-18
- [x] 测试案例验证（单元测试 + 集成测试） ✅ 2026-01-18
- [ ] 收集更多规则

### 6.3 长期（持续）

- [ ] 持续积累规则
- [ ] 定期审查规则有效性
- [ ] 优化匹配性能
- [ ] 扩展到 Study 案件类型
- [ ] 考虑向量检索（如规则库增长到 100+ 条）

---

## 7. 总结

本方案提议在现有审核架构中增加**Verifier Skill + Learned Guardrails**双层防御机制：

1. **Verifier Skill**：作为 Skill 注入到 Gatekeeper，独立验证关键事实，检测语义混淆
2. **Learned Guardrails**：经验知识库，借鉴 Knowledge Manager 的 manifest.json 索引 + Context7 的语义检索

**核心设计决策：**

| 决策项 | 选择 |
|--------|------|
| Verifier 定位 | Skill 注入（灵活、可动态加载） |
| 触发时机 | 按层级（Ultra 完整版，Pro 简化版） |
| 规则格式 | YAML frontmatter + Markdown body |
| 规则粒度 | 两层（Category + Pattern） |
| 规则组织 | manifest.json 索引 + core/app 继承 |
| 匹配机制 | 两阶段（关键词快速 + 语义兜底） |

这个方案可以：

- 捕获类似"ceremony vs marriage"的语义混淆错误
- 积累专家知识，系统越用越聪明
- 在可控成本内显著提升审核准确性
- 与现有 Skill 系统无缝集成

**核心理念：让系统从错误中学习，而不是重复错误。**

---

## 更新日志

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2026-01-18 | 初始提案 |
| v1.1 | 2026-01-18 | 确定所有设计决策，更新 Skill 结构设计，添加两阶段匹配机制 |
| v1.2 | 2026-01-18 | 完成 learned-guardrails skill 实现：目录结构、manifest.json、RULE-001、match_rules.py、sync_rules.py |
| v1.3 | 2026-01-18 | 集成到 Gatekeeper：更新 injection_profile.json、Gatekeeper prompt 添加 MODE C Semantic Verification |
| v1.4 | 2026-01-18 | 完成集成测试：match_rules.py 测试通过、skill injection 验证通过、Gatekeeper prompt 构建验证通过 |

---

**文档结束**

准备人：Sisyphus 审核系统  
日期：2026年1月18日
