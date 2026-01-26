---
name: os-knowledge-extractor
description: |
  Extract domain knowledge from local files or MCP services to build app-specific skills.
  Supports: local directories, individual files, MCP caselaw search, operation manual search.
  Use when: building new app skills, populating knowledge references, bootstrapping from case law.
  Trigger: /os-extract-knowledge <source> --app <app-type> --output <skill-type>
---

# OS Knowledge Extractor

Extract and structure domain knowledge for Immigration Audit Apps.

## Quick Start

```bash
# Extract from local directory
/os-extract-knowledge ./knowledge/work/ --app work --output audit-rules

# Extract from specific files
/os-extract-knowledge ./docs/lmia-guide.pdf --app work --output audit-rules

# Bootstrap from MCP (no local source)
/os-extract-knowledge mcp --app work --output audit-rules

# Extract to multiple skill types
/os-extract-knowledge ./knowledge/work/ --app work --output all
```

## Source Types

### Local Directory

Recursively processes all supported files in the directory.

```bash
/os-extract-knowledge ./knowledge/visitor/ --app visitor
```

Supported file types:
- `.md` - Markdown documents
- `.txt` - Plain text
- `.pdf` - PDF documents (uses file_content_extract)
- `.json` - Structured data
- `.docx` - Word documents (uses file_content_extract)

### Individual Files

Process specific files:

```bash
/os-extract-knowledge ./guides/study-permit-refusals.md --app study
```

### MCP Bootstrap

When no local knowledge source exists, extract from MCP services:

```bash
/os-extract-knowledge mcp --app work
```

This will:
1. Search `caselaw_optimized_search` for 100 relevant cases
2. Search `operation_manual_semantic_search` for 50 policy sections
3. Search `help_centre_search` for 20 Q&A items
4. Extract patterns and structure into skill references

## Output Types

| Output | Target Skill | Generated Files |
|--------|--------------|-----------------|
| `audit-rules` | `{app}-audit-rules` | risk_patterns.json, eligibility_rules.md, baseline_rules.md |
| `doc-analysis` | `{app}-doc-analysis` | baseline_doc_analysis.md, evidence_standards.md |
| `immicore-mcp` | `{app}-immicore-mcp` | caselaw_query_patterns.json, mcp_usage.json |
| `workflow` | `{app}-workflow` | *_template.md files |
| `all` | All app skills | Complete skill set |

## MCP Bootstrap Process

### Step 1: Build Search Queries

Based on app type, generate relevant search queries:

```javascript
const APP_KEYWORDS = {
  "work": ["work permit", "LMIA", "employer compliance", "labour market"],
  "visitor": ["visitor visa", "TRV", "dual intent", "ties to home country"],
  "study": ["study permit", "genuine student", "study plan", "DLI"],
  "pr": ["permanent residence", "express entry", "PNP", "CRS score"]
}
```

### Step 2: Search MCP Services

```typescript
// Caselaw search
const cases = await caselaw_optimized_search({
  query: APP_KEYWORDS[app].join(" OR "),
  court: "fc",
  target_count: 100
})

// Operation manual search
const policies = await operation_manual_semantic_search({
  query: app,
  size: 50
})

// Help centre search
const faqs = await help_centre_search({
  query: app,
  lang: "en",
  top_k: 20
})
```

### Step 3: Extract Patterns

From case law:
- Common refusal reasons
- Officer decision patterns
- Court reasoning themes
- Risk indicators

From operation manual:
- Eligibility requirements
- Processing guidelines
- Assessment criteria

### Step 4: Structure Output

Generate structured skill files:
- `risk_patterns.json` - Extracted risk categories
- `baseline_rules.md` - Core assessment rules
- `caselaw_query_patterns.json` - Effective search patterns

## Extraction Rules

### Risk Pattern Extraction

From case law text, identify:

```json
{
  "pattern_id": "work_lmia_compliance",
  "category": "employer_compliance",
  "description": "LMIA conditions not met",
  "severity": "HIGH",
  "indicators": [
    "wages below median",
    "job duties mismatch",
    "recruitment effort insufficient"
  ],
  "case_references": ["2024 FC 123", "2023 FC 456"],
  "kg_query": {
    "issue_code": "LMIA_COMPLIANCE"
  }
}
```

### Eligibility Rule Extraction

From operation manual, identify:

```markdown
## Eligibility: Work Permit

### R200 Requirements
- Valid job offer (R200(1))
- LMIA or LMIA-exempt category
- Not inadmissible
- Will leave at end of authorized stay

### Exclusions
- Self-employed (unless specific category)
- Business visitors (covered under R187)
```

## Output Location

Generated files are saved to:

```
.claude/skills/{app}-{output}/references/
├── [extracted files]
└── manifest.json (updated)
```

If the skill doesn't exist, it will be created with proper structure.

## Quality Assurance

After extraction, verify:

1. **No hallucinated citations** - All case references exist
2. **Consistent categories** - Risk patterns use standard categories
3. **Complete coverage** - Major refusal reasons captured
4. **Proper formatting** - JSON is valid, Markdown is clean
5. **Landmark cases verified** - All FC cases validated via KG (see below)

Run compliance check after extraction:

```bash
/os-check {app}
```

## Landmark Cases Policy

> **CRITICAL**: 遵循 [os-design-principles.md](../os-design-principles.md) 中的案例引用策略。

### 提取规则

| 案例类型 | 提取到 Skills | 验证方法 |
|----------|---------------|----------|
| **FC/FCA/SCC** | ✅ 经验证后可以 | `caselaw_authority(citation)` 确认 `is_good_law=true` |
| **IAD/IRB** | ❌ 不提取 | 使用 `_dynamic_lookup` 指导 Detective 动态获取 |

### 验证流程

提取 `landmark_cases` 时必须：

```bash
# 1. 验证案例权威性
caselaw_authority(citation='YYYY FC XXXX')

# 2. 确认满足条件
# - is_good_law: true
# - 优先选择 cited_by_count > 0

# 3. 添加验证记录
"_authority_verified": {
  "YYYY FC XXXX": {"cited_by": N, "is_good_law": true}
}
```

### 输出格式

```json
{
  "landmark_cases": [
    "Case Name v Canada, YYYY FC XXXX"
  ],
  "_authority_verified": {
    "YYYY FC XXXX": {"cited_by": 2, "is_good_law": true}
  },
  "_dynamic_lookup": "kg_top_authorities(issue_code='XXX', court='FC', limit=5)",
  "_last_verified": "2026-01-25"
}
```

## References

- [extraction_rules.md](references/extraction_rules.md) - Pattern extraction methodology
- [mcp_bootstrap.md](references/mcp_bootstrap.md) - MCP search strategies
- [output_templates.md](references/output_templates.md) - File format templates
