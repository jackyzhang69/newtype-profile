# ImmiCore 能力与审计可用性说明

本文档总结 ImmiCore 对移民审计最有价值的能力、调用方式与接入优先级，供审计系统集成使用。

## 1. 核心能力清单（按审计价值排序）

### 1) Caselaw（判例）
- 入口：直接 HTTP API（推荐）或 MCP `caselaw`
- 工具：
  - `immicore_caselaw_search`（v3.0 统一端点 - 推荐）
  - `caselaw_keyword_search`（旧）
  - `caselaw_semantic_search`（旧）
  - `caselaw_get_fulltext_by_url`
- v3.0 API 特性：
  - RRF 融合搜索（BM25 + Semantic）
  - 案例有效性检查（is_good_law, overruled 检测）
  - 权威性排序（authority_score, cited_by_count）
  - 三层缓存（Embedding 24h, Search 1h, Detail 7d）
- 用途：类似案例检索、理由链构建、引用支持

### 2) Operation Manual（IRCC 操作手册）
- 入口：MCP `operation-manual`
- 工具：
  - `operation_manual_keyword_search`
  - `operation_manual_semantic_search`
- 用途：政策合规性验证、审计引用来源

### 3) Help Centre（IRCC 官方问答）
- 入口：MCP `help-centre`
- 工具：
  - `help_centre_search`
  - `help_centre_detail`
- 用途：官方口径补充、英文/中文问答

### 4) Knowledge Graph（案例知识图谱）
- 入口：HTTP API（Neo4j KG）
- 路由：
  - `POST /kg/search`
  - `GET /kg/case/{citation}`
  - `POST /kg/similar-cases`
  - `GET /kg/judge/{judge_id}/stats`
- 用途：
  - 类似案例匹配（相似申请画像）
  - 法官倾向统计（审理倾向风险）
  - 案例网络关联查询

### 5) NOC（职业匹配）
- 入口：MCP `noc`
- 工具：
  - `noc_keyword_search`
  - `noc_semantic_search`
- 用途：职业匹配与合规性分析

### 6) Immi Tools（工具）
- 入口：MCP `immi-tools`
- 工具：
  - `clb_convert`
  - `noc_wages`
- 用途：CLB 等级换算、工资标准参照

### 7) Email-KG（内部知识检索）
- 入口：MCP `email-kg`
- 工具：
  - `email_kg_keyword_search`
  - `email_kg_semantic_search`
- 用途：内部经验知识补充（若启用）

---

## 2. 调用方式（入口与配置）

### MCP 配置
- 文档：`/Users/jacky/immicore/docs/mcp-config.md`
- 示例配置：`/Users/jacky/immicore/.mcp.json`

MCP 支持三种模式：
- `stdio`（本地进程）
- `http`
- `sse`

### Knowledge Graph API
- 路由定义：`/Users/jacky/immicore/services/src/services/api/caselaw_graph_routes.py`

### Python SDK
- 文档：`/Users/jacky/immicore/sdks/python/README.md`

---

## 3. 审计流程推荐使用顺序

1. **Operation Manual** → 规则与政策底线
2. **Caselaw (v3.0)** → 判例支撑（使用 `immicore_caselaw_search` + `enhance_with_kg=true`）
3. **Help Centre** → 官方问答补充
4. **Knowledge Graph** → 相似案例/法官倾向
5. **NOC + Immi Tools** → 职业与语言合规
6. **Email-KG** → 内部经验补充

### Caselaw 搜索最佳实践 (v3.0)
```
immicore_caselaw_search(
  query="your search query",
  enhance_with_kg=true,        # 必须：获取有效性/权威性
  rerank_by_authority=false,   # 可选：按权威性排序
  must_include=["keyword"],    # 可选：必须包含
  court="fc"                   # 可选：法院过滤
)
```

**关键检查**：引用案例前必须验证 `validity.is_good_law == true`

---

## 4. 可落地的集成方向

- **Detective**
  - 使用 `immicore_caselaw_search` + `enhance_with_kg=true` 搜索判例
  - 验证案例有效性（检查 `validity.is_good_law`）
  - 并行调用 KG `/kg/similar-cases` 进行相似案例参考
- **Strategist**
  - 使用 `rerank_by_authority=true` 获取权威案例构建辩护策略
  - 增加"相似案例对比"分析段落（KG 数据）
- **AuditManager**
  - 增加"法官倾向风险项"（KG `/kg/judge/{judge_id}/stats`）
- **Gatekeeper**
  - 最终验证所有引用案例的有效性状态

---

## 5. 约束
- 优先使用 `immicore_caselaw_search` (v3.0) 进行判例搜索
- MCP 作为次选入口
- KG 为补充层，主要用于相似案例与统计分析
- 所有外部来源必须满足审计合规策略（政府/律师行白名单）
