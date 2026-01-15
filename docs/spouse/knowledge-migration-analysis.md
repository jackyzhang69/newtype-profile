# 配偶团聚知识库迁移分析

**日期**: 2026-01-14 (修订)
**来源**: ~/workshop/program/sps/guides
**目标**: .claude/skills/spousal-*

---

## 一、迁移目的

将 SPS 项目中积累的配偶团聚实务知识迁移到 immi-os 的 skills 系统，使 audit agents 能够：

1. 基于**抽象风险模式**进行风险评估（具体案例通过 KG 查询）
2. 使用**标准化输出规范**生成审核报告
3. 提供**客户指导**，告诉客户如何准备材料
4. 验证文档完整性和一致性

---

## 二、核心设计原则

### 2.1 知识分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      Audit 完整服务流程                         │
├─────────────────────────────────────────────────────────────────┤
│  1. 收集信息 (Detective)                                        │
│     → 需要知道：该检查哪些方面                                  │
│     → 知识来源：spousal-doc-analysis                            │
│                                                                 │
│  2. 风险评估 (Strategist)                                       │
│     → 需要知道：什么是高风险、如何评估                          │
│     → 知识来源：spousal-audit-rules (抽象模式)                  │
│     → 案例查询：MCP/KG (具体判例)                               │
│                                                                 │
│  3. 最终审核 (Gatekeeper)                                       │
│     → 需要知道：输出什么格式的报告                              │
│     → 知识来源：spousal-workflow (输出规范)                     │
│                                                                 │
│  4. 客户指导 (Post-Audit)                                       │
│     → 需要知道：如何指导客户准备材料                            │
│     → 知识来源：spousal-client-guidance                         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 关键原则：抽象模式 vs 具体案例

**错误方式**（硬编码案例）：
```markdown
## 风险点：关系发展仓促
- Sandhu 2016 - 19年未返回印度团聚
- Basazenew 2022 - 机场首次见面，两周后结婚
```

**正确方式**（抽象模式 + KG 查询）：
```json
{
  "risk_patterns": [
    {
      "id": "rushed_relationship",
      "label": "关系发展仓促",
      "indicators": [
        "相识到结婚 < 3个月",
        "首次见面到结婚 < 1个月",
        "无深入了解过程"
      ],
      "severity": "high",
      "kg_query": "issue:rushed_relationship"
    }
  ]
}
```

具体案例通过 `kg_search(issue_code="rushed_relationship")` 动态查询。

---

## 三、知识类型分类

### 3.1 四种知识类型

| 类型 | 定义 | 示例 | 目标 Skill |
|------|------|------|-----------|
| **风险模式** | 抽象的风险点分类和评估指标 | 关系仓促、证据不足 | spousal-audit-rules |
| **验证规则** | 文档检查和一致性验证逻辑 | IMM5533 清单、证据标准 | spousal-doc-analysis |
| **输出规范** | Agent 生成报告的格式定义 | 初审报告、终审报告 | spousal-workflow |
| **客户指导** | Audit 后指导客户的知识 | 如何写 Love Story | spousal-client-guidance |

### 3.2 SPS Guides 重新分类

| 文件 | 知识类型 | 用途 | 目标 Skill |
|------|---------|------|-----------|
| risk_analysis.md (40KB) | **风险模式** | 提取抽象风险点分类（不含具体案例） | spousal-audit-rules |
| supporting_documents.md (34KB) | **验证规则** | IMM5533 文件清单和验证逻辑 | spousal-doc-analysis |
| primary_assess_guide.md | **输出规范** | 初审报告格式 | spousal-workflow |
| deep_analysis_guide.md | **输出规范** | 深度分析格式 | spousal-workflow |
| final_assess_guide.md | **输出规范** | 终审报告格式 | spousal-workflow |
| submission_letter_guide.md | **输出规范** | 提交信格式 | spousal-workflow |
| love_story_guide.md | **客户指导** | 如何写关系陈述 | spousal-client-guidance |
| interview_guide.md | **客户指导** | 如何准备面试 | spousal-client-guidance |
| document_list_guide.md | **客户指导** | 需要准备什么材料 | spousal-client-guidance |
| caselaws.md (181KB) | **参考数据** | 具体案例（通过 KG 查询） | MCP/KG |

---

## 四、当前 Skills 状态分析

### 4.1 现有 Skills（严重不足）

| Skill | 当前大小 | 内容深度 | 核心缺失 |
|-------|---------|---------|----------|
| spousal-audit-rules | 1.3KB | 4 个风险标签 + 4 个维度 | 无完整风险模式、无评估指标 |
| spousal-doc-analysis | 0.7KB | 字段提取模式 | 无 IMM5533 对照、无质量标准 |
| spousal-knowledge-injection | 1.3KB | 63 行要点 | 无输出规范、无客户指导 |
| spousal-immicore-mcp | 1.3KB | MCP 策略 | 缺少 KG 查询模式 |

### 4.2 缺失的 Skills

- **spousal-workflow**: 输出规范（报告格式）
- **spousal-client-guidance**: 客户指导（材料准备）

---

## 五、目标 Skills 结构

```
.claude/skills/spousal-*
├── spousal-audit-rules/              [风险评估规则]
│   └── references/
│       ├── baseline_rules.md          [保留] 基础规则
│       ├── risk_framework.json        [保留] 风险框架
│       ├── checklist_templates.json   [保留] 检查清单
│       ├── risk_patterns.json         [新增] ← 从 risk_analysis.md 提取抽象模式
│       ├── eligibility_rules.md       [新增] ← 资格检查规则
│       └── kg_query_patterns.json     [新增] ← KG 查询模式（查具体案例）
│
├── spousal-doc-analysis/             [文档验证]
│   └── references/
│       ├── baseline_doc_analysis.md   [保留] 基础分析
│       ├── extraction_schema.json     [保留] 提取模式
│       ├── imm5533_checklist.md       [新增] ← 从 supporting_documents.md
│       ├── evidence_standards.md      [新增] ← 证据质量标准
│       └── consistency_rules.md       [新增] ← 跨文档一致性规则
│
├── spousal-workflow/                 [输出规范] ★ 新 Skill
│   ├── SKILL.md
│   └── references/
│       ├── manifest.json
│       ├── primary_assess_template.md  ← 从 primary_assess_guide.md
│       ├── deep_analysis_template.md   ← 从 deep_analysis_guide.md
│       ├── final_assess_template.md    ← 从 final_assess_guide.md
│       └── submission_letter_template.md ← 从 submission_letter_guide.md
│
├── spousal-client-guidance/          [客户指导] ★ 新 Skill
│   ├── SKILL.md
│   └── references/
│       ├── manifest.json
│       ├── love_story_guide.md         ← 如何写关系陈述
│       ├── interview_guide.md          ← 如何准备面试
│       └── document_list_guide.md      ← 需要准备什么材料
│
├── spousal-knowledge-injection/      [注入协调]
│   └── references/
│       ├── baseline_guides.md         [更新] 扩展内容
│       ├── injection_profile.json     [更新] 添加新 skills
│       └── manifest.json
│
└── spousal-immicore-mcp/             [MCP 策略]
    └── references/
        ├── baseline_mcp_policy.md     [保留]
        ├── mcp_usage.json             [保留]
        └── caselaw_query_patterns.json [新增] ← 判例查询模式
```

---

## 六、风险模式提取示例

### 6.1 从 risk_analysis.md 提取的抽象模式

```json
{
  "version": "spousal-v2",
  "categories": [
    {
      "id": "relationship_genuineness",
      "label": "婚姻/关系真实性",
      "patterns": [
        {
          "id": "rushed_development",
          "label": "关系发展仓促",
          "indicators": [
            "相识到结婚时间过短（< 3个月）",
            "首次见面到结婚时间过短（< 1个月）",
            "婚礼过程不符合当地习俗",
            "家庭成员未参与重要决定"
          ],
          "severity": "high",
          "kg_query": "issue_code:rushed_relationship"
        },
        {
          "id": "lack_cohabitation_evidence",
          "label": "缺乏共同生活证据",
          "indicators": [
            "无共同银行账户",
            "无共同租赁协议",
            "无共同水电费账单",
            "日常生活习惯缺乏真实性"
          ],
          "severity": "high",
          "kg_query": "issue_code:cohabitation_evidence"
        },
        {
          "id": "immigration_motive",
          "label": "移民目的不纯",
          "indicators": [
            "多次担保或被担保历史",
            "之前关系被认定为虚假",
            "申请时机与遣返日期相关",
            "隐瞒与担保人家庭的关系"
          ],
          "severity": "critical",
          "kg_query": "issue_code:immigration_purpose"
        }
      ]
    },
    {
      "id": "misrepresentation",
      "label": "虚假陈述",
      "patterns": [
        {
          "id": "concealed_facts",
          "label": "隐瞒重要事实",
          "indicators": [
            "隐瞒前婚史",
            "隐瞒子女",
            "隐瞒犯罪记录",
            "隐瞒亲属关系"
          ],
          "severity": "critical",
          "kg_query": "issue_code:misrepresentation"
        },
        {
          "id": "false_documents",
          "label": "提供虚假文件",
          "indicators": [
            "伪造结婚证/出生证",
            "虚假银行对账单",
            "虚假雇佣信",
            "虚假共同居住证明"
          ],
          "severity": "critical",
          "kg_query": "issue_code:document_fraud"
        }
      ]
    },
    {
      "id": "credibility",
      "label": "可信度问题",
      "patterns": [
        {
          "id": "testimony_contradiction",
          "label": "证词矛盾",
          "indicators": [
            "双方对关键事实描述不一致",
            "书面材料与口头证词矛盾",
            "时间线存在重大空白"
          ],
          "severity": "high",
          "kg_query": "issue_code:credibility"
        }
      ]
    }
  ]
}
```

---

## 七、文件映射表

| SPS 源文件 | 目标位置 | 处理方式 |
|-----------|---------|---------|
| risk_analysis.md | spousal-audit-rules/risk_patterns.json | 提取抽象模式（去除具体案例引用） |
| supporting_documents.md | spousal-doc-analysis/imm5533_checklist.md | 完整迁移 |
| primary_assess_guide.md | spousal-workflow/primary_assess_template.md | 直接迁移 |
| deep_analysis_guide.md | spousal-workflow/deep_analysis_template.md | 直接迁移 |
| final_assess_guide.md | spousal-workflow/final_assess_template.md | 直接迁移 |
| submission_letter_guide.md | spousal-workflow/submission_letter_template.md | 直接迁移 |
| love_story_guide.md | spousal-client-guidance/love_story_guide.md | 直接迁移 |
| interview_guide.md | spousal-client-guidance/interview_guide.md | 直接迁移 |
| document_list_guide.md | spousal-client-guidance/document_list_guide.md | 直接迁移 |
| caselaws.md | **不迁移** | 通过 MCP/KG 访问 |

---

## 八、实施计划

### Phase 1: 扩展现有 Skills
1. **spousal-audit-rules**: 添加 risk_patterns.json、kg_query_patterns.json
2. **spousal-doc-analysis**: 添加 imm5533_checklist.md、evidence_standards.md
3. **spousal-immicore-mcp**: 添加 caselaw_query_patterns.json

### Phase 2: 创建新 Skills
4. **spousal-workflow**: 创建并添加输出规范模板
5. **spousal-client-guidance**: 创建并添加客户指导模板

### Phase 3: 更新注入配置
6. 更新 **spousal-knowledge-injection** 的 injection_profile.json
7. 更新 validator 支持新 skills

### Phase 4: 集成测试
8. 端到端测试审核流程
9. 验证 KG 查询与抽象模式的配合

---

## 九、待讨论问题

1. **KG 查询模式**: kg_query 字段的具体格式和 KG API 的对接方式
2. **模板本地化**: 当前模板为中文，是否需要英文版本？
3. **版本控制**: SPS guides 更新时如何同步到 skills？
4. **Skill 触发**: 新 skills 的 injection 触发条件如何定义？

---

## 十、变更记录

| 日期 | 变更内容 |
|------|---------|
| 2026-01-14 | 初始版本 |
| 2026-01-14 | 修订：区分抽象模式 vs 具体案例；新增 spousal-client-guidance skill；重新分类知识类型 |
