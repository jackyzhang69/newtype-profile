# 配偶团聚知识库概览

本文档为配偶团聚审核系统的基线指南，详细知识分布于以下 Skills 中。

## Skills 架构

| Skill | 描述 | 注入对象 |
|-------|------|----------|
| `spousal-audit-rules` | 风险模式、资格规则、KG查询模式 | Detective, Strategist, Gatekeeper |
| `spousal-doc-analysis` | 文件分析规则、证据标准 | Detective, Strategist |
| `spousal-immicore-mcp` | 判例法查询模式 | Detective |
| `spousal-workflow` | 输出报告模板 | Strategist, Gatekeeper |
| `spousal-client-guidance` | 客户指导材料 | Gatekeeper |

## 知识注入顺序

1. **风险模式** (spousal-audit-rules/risk_patterns.json)
   - 7大类风险模式，18个子模式
   - 每个模式包含 KG 查询参数

2. **资格规则** (spousal-audit-rules/eligibility_rules.md)
   - 担保人资格检查
   - 申请人资格检查
   - 法定排除条件

3. **文件分析** (spousal-doc-analysis/)
   - IMM 5533 完整验证规则
   - 证据质量分级标准 (A/B/C/D)
   - 跨文档一致性检查

4. **判例查询** (spousal-immicore-mcp/caselaw_query_patterns.json)
   - 关系真实性判例
   - 便利婚姻判例
   - 证据权重判例

5. **输出模板** (spousal-workflow/)
   - 初审报告格式
   - 深度分析格式
   - 终审报告格式
   - 提交信格式

6. **客户指导** (spousal-client-guidance/)
   - 关系陈述写作指南
   - 面试准备指南
   - 材料清单指南

## Agent 知识映射

### Detective Agent
- 加载: risk_patterns, eligibility_rules, kg_query_patterns
- 加载: imm5533_checklist, evidence_standards, consistency_rules
- 加载: caselaw_query_patterns
- 职责: 搜索风险、收集证据、查询判例

### Strategist Agent
- 加载: risk_patterns, eligibility_rules
- 加载: evidence_standards
- 加载: primary_assess_template, deep_analysis_template
- 职责: 分析风险、制定策略、生成报告

### Gatekeeper Agent
- 加载: risk_patterns
- 加载: final_assess_template, submission_letter_template
- 加载: client guidance (love_story, interview, document_list)
- 职责: 最终审核、生成提交材料、客户指导

## 注入规则

1. 按 injection_profile.json 中定义的顺序注入
2. 使用 `<Skill_References>` 标签包装注入内容
3. 根据 agent 类型选择性注入相关 skills
4. 优先注入高优先级 skills（priority 值越小越优先）

## 版本信息

- **Profile Version**: spousal-v2
- **最后更新**: 2026-01-14
- **知识来源**: SPS guides 迁移 + 增强
