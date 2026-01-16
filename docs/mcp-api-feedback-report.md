# MCP/KG API 问题反馈报告

**日期**: 2026-01-15
**报告人**: AI Agent (Sisyphus)
**使用场景**: 查询 visa/study permit/work permit 三类签证的 top 3 被引用最多且胜诉的案例

---

## 一、遇到的问题

### 1. 引用格式不一致

**问题描述**：
- KG Search API (`/kg/search`) 返回的 citation 是**短格式**：`"2020 FC 517"`
- Authority API (`/case/{citation}/authority`) 需要**完整格式**才能返回正确数据：`"Patel v Canada (Citizenship and Immigration), 2020 FC 517"`

**实际表现**：
```bash
# 短格式查询 - 返回 cited_by_count: 0
GET /case/2020%20FC%20517/authority
# 返回: {"cited_by_count": 0, ...}

# 完整格式查询 - 返回正确数据
GET /case/Patel%20v%20Canada%20(Citizenship%20and%20Immigration)%2C%202020%20FC%20517/authority
# 返回: {"cited_by_count": 15, ...}
```

**期望**：
- API 应支持两种格式查询，或在响应中同时返回短格式和完整格式
- KG Search 返回的 citation 应能直接用于 Authority API 查询

---

### 2. `/top-authorities` 端点返回空数组

**问题描述**：
```bash
GET /top-authorities?limit=10
# 返回: []

GET /top-authorities?issue_code=SUB_STUDY_PLAN&limit=10
# 返回: []
```

**实际数据存在**：
- Vavilov 案例有 176 次被引用
- Patel 案例有 15 次被引用
- 但 top-authorities 端点无法返回这些数据

**期望**：
- 该端点应返回按 `cited_by_count` 或 `authority_score` 排序的案例列表
- 如果需要特定条件才能使用，应在 API 文档中说明

---

### 3. KG Search 的 `issue_code` 过滤不生效

**问题描述**：
```bash
# 带 issue_code 过滤 - 返回空
POST /kg/search
{"issue_code": "SUB_STUDY_PLAN", "outcome": "ALLOWED", "limit": 10}
# 返回: []

# 不带过滤 - 返回数据，手动筛选发现有 SUB_STUDY_PLAN 案例
POST /kg/search
{"limit": 100}
# 返回 100 条数据，其中包含 SUB_STUDY_PLAN 案例
```

**期望**：
- `issue_code` 过滤应正常工作
- 或返回错误信息说明为什么过滤失败

---

### 4. 缺少 Issue Code 元数据端点

**问题描述**：
- 不知道有哪些有效的 `issue_code` 值
- 只能通过获取全量数据后手动分析得知
- 尝试访问 `/kg/metadata/issue-codes` 返回 404

**期望**：
提供以下元数据端点：
```
GET /kg/metadata/issue-codes     # 所有可用的 issue_code 列表
GET /kg/metadata/courts          # 所有法院代码
GET /kg/metadata/outcomes        # 所有结果类型
GET /kg/metadata/judge-ids       # 所有法官 ID
```

---

### 5. 缺少按引用数排序的搜索能力

**问题描述**：
- 无法直接查询"被引用最多的 study permit 胜诉案例"
- 只能先搜索案例，再逐个查询 authority，非常低效

**期望**：
KG Search 支持按 `cited_by_count` 排序：
```json
POST /kg/search
{
  "issue_code": "SUB_STUDY_PLAN",
  "outcome": "ALLOWED",
  "sort_by": "cited_by_count",
  "sort_order": "desc",
  "limit": 10
}
```

或提供专门的端点：
```
GET /kg/top-cited-cases?issue_code=SUB_STUDY_PLAN&outcome=ALLOWED&limit=10
```

---

### 6. Authority Score 全为 0

**问题描述**：
所有案例的 `authority_score` 都是 0.0，PageRank 似乎未计算。

```json
{
  "citation": "Patel v Canada...",
  "authority_score": 0.0,
  "cited_by_count": 15
}
```

**期望**：
- 如果 PageRank 未计算，应在 API 文档中说明
- 或提供触发计算的端点/说明

---

## 二、当前 API 使用的"摸索"过程

### 尝试 1：使用 MCP 工具 `kg_search`
```
mcp_kg_search(issue_code="visa", outcome="allowed", limit=10)
# 结果: 返回空或不相关数据
```

### 尝试 2：直接调用 API 发现过滤不生效
```bash
curl -X POST /kg/search -d '{"issue_code": "SUB_STUDY_PLAN"}'
# 结果: []
```

### 尝试 3：获取全量数据手动分析
```bash
curl -X POST /kg/search -d '{"limit": 100}'
# 结果: 100 条数据
# 手动分析发现有 SUB_STUDY_PLAN 案例
```

### 尝试 4：查询单个案例的 authority
```bash
curl /case/2020%20FC%20517/authority
# 结果: cited_by_count: 0 (格式问题)
```

### 尝试 5：使用完整引用格式
```bash
curl /case/Patel%20v%20Canada...%2C%202020%20FC%20517/authority
# 结果: cited_by_count: 15 (成功！)
```

---

## 三、期望的 API 改进

### 1. 统一引用格式
```json
// KG Search 响应增加完整引用
{
  "citation": "2020 FC 517",
  "citation_full": "Patel v Canada (Citizenship and Immigration), 2020 FC 517",
  "style_of_cause": "Patel v. Canada (Citizenship and Immigration)",
  ...
}
```

### 2. 修复 `/top-authorities` 端点
```bash
GET /top-authorities?limit=10
# 期望返回:
[
  {"citation": "...", "cited_by_count": 176, "authority_score": 0.85},
  {"citation": "...", "cited_by_count": 45, "authority_score": 0.72},
  ...
]
```

### 3. 增加元数据端点
```bash
GET /kg/metadata
# 返回:
{
  "issue_codes": ["SUB_STUDY_PLAN", "SUB_TIES_HOME", ...],
  "courts": ["fc", "fca", "irb"],
  "outcomes": ["ALLOWED", "DISMISSED", "REMITTED"],
  "total_cases": 12500,
  "cases_with_citations": 8000
}
```

### 4. 增强搜索功能
```json
POST /kg/search
{
  "filters": {
    "issue_codes": ["SUB_STUDY_PLAN", "SUB_TIES_HOME"],
    "outcome": "ALLOWED",
    "min_cited_by": 5
  },
  "sort": {
    "field": "cited_by_count",
    "order": "desc"
  },
  "limit": 10
}
```

### 5. 提供 API 文档 / Schema
```bash
GET /openapi.json  # 已有，但描述不够详细
```

期望在 OpenAPI schema 中增加：
- 每个参数的有效值枚举
- 示例请求和响应
- 错误码说明
- 字段之间的依赖关系

---

## 四、最新发现（2026-01-15 更新）

### `/top-authorities?issue_code=XXX` JOIN 问题

**问题确认**：

| 端点 | 结果 |
|------|------|
| `/top-authorities` (无过滤) | ✅ 返回高被引案例 (Vavilov 2714, Dunsmuir 512...) |
| `/top-authorities?issue_code=SUB_STUDY_PLAN` | ❌ 只返回 2025 年新案例，cited_by_count 全为 0 |
| `/case/2020%20FC%20517/authority` | ✅ Patel 有 15 次被引用 |
| `/kg/case/2020%20FC%20517` | ✅ Patel 有 SUB_STUDY_PLAN issue |

**根因分析**：
- 无过滤的 `/top-authorities` 查询的是完整的 citation network（包括所有被引用过的案例）
- 有 `issue_code` 过滤的查询只从 KG-parsed 案例（8012 条，主要是 2024-2025 新案例）中筛选
- **JOIN 逻辑错误**：过滤版本没有正确 JOIN 到 citation authority 数据

**验证数据**：
```bash
# Patel 案例明确存在于 KG 并有正确的 issue
GET /kg/case/2020%20FC%20517
{
  "issues": [{"issue_code": "SUB_STUDY_PLAN", ...}],
  ...
}

# Patel 案例有 15 次被引用
GET /case/2020%20FC%20517/authority  
{"cited_by_count": 15, "is_good_law": true, ...}

# 但过滤查询不返回 Patel
GET /top-authorities?issue_code=SUB_STUDY_PLAN&limit=10
# 返回 5 个 2025 年案例，全部 cited_by_count: 0
```

**需要的修复**：
服务端 Cypher 查询应该：
1. 从 KG 节点中筛选有指定 `issue_code` 的案例
2. **JOIN** 到 citation authority 数据获取 `cited_by_count`
3. 按 `cited_by_count` DESC 排序
4. 返回结果

---

## 五、总结

| 问题 | 严重程度 | 状态 | 建议优先级 |
|------|----------|------|------------|
| 引用格式不一致 | 高 | ✅ 已修复 | - |
| top-authorities 返回空 | 高 | ✅ 已修复 | - |
| **issue_code 过滤 JOIN 错误** | 高 | ❌ 待修复 | **P0** |
| issue_code 过滤不生效 (kg/search) | 高 | ✅ 已修复 | - |
| 缺少元数据端点 | 中 | ✅ 已修复 | - |
| 缺少按引用数排序 | 中 | 待验证 | P2 |
| authority_score 全为 0 | 低 | 待验证 | P3 |

---

## 附录：成功查询示例

```bash
# 查询高被引案例（完整格式）
curl "https://es_search.jackyzhang.app/api/v1/case/Patel%20v%20Canada%20(Citizenship%20and%20Immigration)%2C%202020%20FC%20517/authority"

# 返回:
{
  "citation": "Patel v Canada (Citizenship and Immigration), 2020 FC 517",
  "cited_by_count": 15,
  "cites_count": 5,
  "is_good_law": true,
  "top_citing_cases": ["2021 FC 123", ...]
}
```
