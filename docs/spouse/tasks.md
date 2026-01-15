# 配偶团聚知识库迁移任务清单

**创建日期**: 2026-01-14
**状态**: 进行中

---

## Phase 1: 扩展现有 Skills

### 1.1 spousal-audit-rules
- [x] 从 risk_analysis.md 提取抽象风险模式
- [x] 创建 `risk_patterns.json`（风险模式定义）
- [x] 创建 `eligibility_rules.md`（资格检查规则）
- [x] 创建 `kg_query_patterns.json`（KG 查询模式）
- [x] 更新 `manifest.json`

### 1.2 spousal-doc-analysis
- [x] 从 supporting_documents.md 提取 IMM5533 验证规则
- [x] 创建 `imm5533_checklist.md`（文件清单验证）
- [x] 创建 `evidence_standards.md`（证据质量标准）
- [x] 创建 `consistency_rules.md`（跨文档一致性规则）
- [x] 更新 `manifest.json`

### 1.3 spousal-immicore-mcp
- [x] 创建 `caselaw_query_patterns.json`（判例查询模式）
- [x] 更新 `manifest.json`

**Phase 1 完成**: [x] _(日期: 2026-01-14)_

---

## Phase 2: 创建新 Skills

### 2.1 spousal-workflow（输出规范）
- [x] 创建 `SKILL.md`
- [x] 创建 `references/manifest.json`
- [x] 迁移 `primary_assess_template.md`（初审报告格式）
- [x] 迁移 `deep_analysis_template.md`（深度分析格式）
- [x] 迁移 `final_assess_template.md`（终审报告格式）
- [x] 迁移 `submission_letter_template.md`（提交信格式）

### 2.2 spousal-client-guidance（客户指导）
- [x] 创建 `SKILL.md`
- [x] 创建 `references/manifest.json`
- [x] 迁移 `love_story_guide.md`（如何写关系陈述）
- [x] 迁移 `interview_guide.md`（如何准备面试）
- [x] 迁移 `document_list_guide.md`（需要准备什么材料）

**Phase 2 完成**: [x] _(日期: 2026-01-14)_

---

## Phase 3: 更新注入配置

### 3.1 spousal-knowledge-injection
- [x] 更新 `injection_profile.json`（添加新 skills）
- [x] 更新 `baseline_guides.md`（扩展内容）
- [x] 更新 `manifest.json`

### 3.2 Validator 更新
- [x] 更新 `src/audit-core/skills/validator.ts` 支持新 skills
- [x] 更新 `src/audit-core/skills/validator.test.ts` 添加测试

**Phase 3 完成**: [x] _(日期: 2026-01-14)_

---

## Phase 4: 集成测试

### 4.1 功能测试
- [ ] 测试 risk_patterns.json 加载
- [ ] 测试 KG 查询模式与抽象模式配合
- [ ] 测试输出规范模板渲染
- [ ] 测试客户指导内容注入

### 4.2 端到端测试
- [ ] 完整审核流程测试（Detective → Strategist → Gatekeeper）
- [ ] 客户指导输出测试

### 4.3 文档更新
- [ ] 更新 AGENTS.md（如需要）
- [ ] 更新 knowledge-migration-analysis.md 状态

**Phase 4 完成**: [ ] _(日期: __________)_

---

## 迁移完成

- [ ] **所有 Phase 完成**
- [ ] **代码已 commit 并 push**
- [ ] **文档已更新**

**迁移完成日期**: __________

---

## 文件来源映射

| 源文件 (SPS) | 目标文件 | 状态 |
|-------------|---------|------|
| risk_analysis.md | spousal-audit-rules/risk_patterns.json | [x] |
| supporting_documents.md | spousal-doc-analysis/imm5533_checklist.md | [x] |
| primary_assess_guide.md | spousal-workflow/primary_assess_template.md | [x] |
| deep_analysis_guide.md | spousal-workflow/deep_analysis_template.md | [x] |
| final_assess_guide.md | spousal-workflow/final_assess_template.md | [x] |
| submission_letter_guide.md | spousal-workflow/submission_letter_template.md | [x] |
| love_story_guide.md | spousal-client-guidance/love_story_guide.md | [x] |
| interview_guide.md | spousal-client-guidance/interview_guide.md | [x] |
| document_list_guide.md | spousal-client-guidance/document_list_guide.md | [x] |

---

## 备注

- 每完成一个任务，标记 `[x]`
- 每完成一个 Phase，填写完成日期
- 遇到问题记录在下方

### 问题记录

_(记录实施过程中遇到的问题和解决方案)_
