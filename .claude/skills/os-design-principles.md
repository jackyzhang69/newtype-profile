---
name: os-design-principles
description: |
  Immigration Audit OS 统一设计原则文档。
  定义 Skills、Agents、Knowledge 的设计规范和约束。
  所有 os-* 系统技能和 app-* 应用技能必须遵循这些原则。
---

# OS Design Principles

> Immigration Audit OS 设计原则 v1.0

## 1. 案例引用策略 (Landmark Cases Policy)

### 1.1 核心原则

**Skills 层只包含经 KG 验证的 FC/FCA 权威案例，IAD/IRB 案例由 Detective 动态获取。**

| 层级 | 内容 | 案例类型 |
|------|------|----------|
| **Skills** | 抽象规则 + 典型案例 | 仅 FC/FCA 权威案例 |
| **Detective MCP** | 动态获取具体案例 | FC + IAD/IRB |
| **KG 验证** | 确认案例有效性 | 所有引用案例 |

### 1.2 案例验证要求

在 Skills 中写入 `landmark_cases` 前，**必须**使用 MCP 工具验证：

```bash
# 验证单个案例
caselaw_authority(citation='YYYY FC XXXX')

# 确认返回结果满足：
# - is_good_law: true
# - cited_by_count: > 0 (优先)
```

**不合格案例的处理**：
- `is_good_law: false` → 不得引用
- `cited_by_count: 0` → 仅当 FC 案例且法律原则明确时可引用
- `KG 返回 404` → 不得在 Skills 中写死，改用 `_dynamic_lookup`

### 1.3 landmark_cases 字段规范

```json
{
  "landmark_cases": [
    "Case Name v Canada (Citizenship and Immigration), YYYY FC XXXX"
  ],
  "_authority_verified": {
    "YYYY FC XXXX": {
      "cited_by": 2,
      "is_good_law": true,
      "note": "法律原则说明"
    }
  },
  "_dynamic_lookup": "kg_top_authorities(issue_code='XXX', court='FC', limit=5)",
  "_last_verified": "YYYY-MM-DD"
}
```

### 1.4 不同案例类型的处理

| 案例类型 | 可写入 Skills | 验证方法 | 说明 |
|----------|---------------|----------|------|
| **FC (Federal Court)** | ✅ 经验证后可以 | `caselaw_authority()` | 建立法律原则 |
| **FCA (Federal Court of Appeal)** | ✅ 经验证后可以 | `caselaw_authority()` | 更高权威性 |
| **SCC (Supreme Court)** | ✅ 经验证后可以 | `caselaw_authority()` | 最高权威性 |
| **IAD/IRB** | ❌ 不写入 Skills | Detective 动态获取 | 事实裁定，非法律原则 |

### 1.5 更新频率

- **季度检查**：使用 `kg_top_authorities()` 检查是否有新权威案例
- **更新记录**：修改 `_last_verified` 日期
- **替换原则**：新案例 cited_by 更高时，考虑替换旧案例

---

## 2. Skills 内容策略

### 2.1 Skills 应包含

| 内容类型 | 示例 | 说明 |
|----------|------|------|
| **抽象规则** | risk_patterns.json | 风险模式定义，不含具体案例事实 |
| **评估标准** | eligibility_rules.md | R 条款要求，评估因素 |
| **查询模式** | caselaw_query_patterns.json | MCP 查询模板 + 验证过的 FC 案例 |
| **模板** | *_template.md | 输出格式模板 |

### 2.2 Skills 不应包含

| 内容类型 | 正确处理方式 |
|----------|-------------|
| 具体案例事实详情 | Detective 使用 MCP 动态获取 |
| 未验证的 IAD 案例引用 | 使用 `_dynamic_lookup` 指导动态获取 |
| 完整判例文本 | 使用 `caselaw_get_fulltext_by_url()` |
| 过时的案例列表 | 定期用 KG 验证更新 |

### 2.3 risk_patterns.json 结构

```json
{
  "categories": [
    {
      "id": "genuineness",
      "label": "关系真实性",
      "legal_basis": "IRPR 4(1)(b)",
      "patterns": [
        {
          "id": "rushed_relationship",
          "label": "关系发展仓促",
          "indicators": ["相识到结婚时间过短", "..."],
          "severity": "high",
          "kg_query": "issue_code:SUB_FAMILY_GENUINENESS"
        }
      ]
    }
  ],
  "judicial_principles": [
    {
      "id": "section_4_test",
      "label": "IRPR 第4条双重测试",
      "description": "即使婚姻真实，如果主要目的是移民，申请仍可能被拒",
      "source": "Kaur Gill v Canada, 2012 FC 1522",
      "_authority_verified": {"cited_by": 1, "is_good_law": true}
    }
  ]
}
```

---

## 3. MCP 工具使用策略

### 3.1 Detective 阶段工具选择

| 任务 | 推荐工具 | 说明 |
|------|----------|------|
| 获取权威案例 | `kg_top_authorities(issue_code, court='FC')` | 返回按引用次数排序的案例 |
| 验证案例有效性 | `caselaw_authority(citation)` | 检查 is_good_law |
| 搜索相关案例 | `caselaw_optimized_search(query, court='fc')` | RRF 融合搜索 |
| 按国家查找案例 | `kg_similar_cases(country, issue_codes)` | 相似案例匹配 |
| 查询政策手册 | `operation_manual_semantic_search(query)` | 语义搜索 |

### 3.2 案例引用验证流程

```
1. Detective 从 MCP 获取案例
   ↓
2. 调用 caselaw_authority(citation) 验证
   ↓
3. 检查 is_good_law == true
   ↓
4. 如果 false → 标记为 "[VALIDITY WARNING]"
   ↓
5. Verifier 复核所有引用的有效性
```

---

## 4. os-* 系统技能职责

| 技能 | 职责 | 遵循原则 |
|------|------|----------|
| **os-app-builder** | 创建新 app | Phase 3 必须验证 landmark_cases |
| **os-knowledge-extractor** | 提取知识 | 仅提取 FC 权威案例作为 landmark |
| **os-compliance-checker** | 验证完整性 | 检查 landmark_cases 的 `_authority_verified` |
| **os-knowledge-updater** | 更新知识 | 季度更新时验证案例有效性 |

---

## 5. 反模式 (Anti-Patterns)

### 5.1 案例引用反模式

| 反模式 | 正确做法 |
|--------|----------|
| ❌ 在 Skills 中写死 IAD 案例列表 | ✅ 使用 `_dynamic_lookup` 指导 Detective |
| ❌ 引用未经 KG 验证的案例 | ✅ 先 `caselaw_authority()` 验证 |
| ❌ 复制其他 app 的 landmark_cases | ✅ 针对当前 app 用 KG 搜索验证 |
| ❌ 假设案例仍然有效 | ✅ 检查 `is_good_law` 字段 |

### 5.2 Skills 内容反模式

| 反模式 | 正确做法 |
|--------|----------|
| ❌ 在 Skills 中包含完整案例文本 | ✅ 使用 MCP 动态获取 |
| ❌ 包含案例具体事实详情 | ✅ 只保留抽象规则和法律原则 |
| ❌ 使用过时的案例列表 | ✅ 定期用 KG 验证更新 |

---

## 6. 验证清单

### 创建/更新 app 时检查

- [ ] 所有 `landmark_cases` 都有对应的 `_authority_verified`
- [ ] 所有案例 `is_good_law: true`
- [ ] 无 IAD/IRB 案例写死在 Skills 中
- [ ] 有 `_dynamic_lookup` 指导 Detective 动态获取
- [ ] `_last_verified` 日期在 90 天内

### 季度维护检查

- [ ] 运行 `kg_top_authorities()` 检查新权威案例
- [ ] 验证现有 landmark_cases 仍然有效
- [ ] 更新 `_last_verified` 日期

---

## 7. 参考实现

参见 `spousal-immicore-mcp/references/caselaw_query_patterns.json` (v3.0) 作为标准实现。

```json
{
  "version": "3.0",
  "_landmark_cases_policy": {
    "policy": "仅列出经 KG 验证的 FC/FCA 权威案例",
    "verification_method": "caselaw_authority(citation)",
    "last_verified": "2026-01-25"
  },
  "spousal_specific_queries": {
    "genuineness_cases": {
      "queries": [
        {
          "landmark_cases": ["Kaur Gill v Canada, 2012 FC 1522"],
          "_authority_verified": {"2012 FC 1522": {"cited_by": 1, "is_good_law": true}},
          "_dynamic_lookup": "kg_top_authorities(issue_code='SUB_FAMILY_GENUINENESS')"
        }
      ]
    }
  }
}
```
