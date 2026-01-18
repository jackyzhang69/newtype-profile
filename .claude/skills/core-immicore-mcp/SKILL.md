---
name: core-immicore-mcp
description: |
  Core MCP access policy shared across apps.
---

# Core ImmiCore MCP Policy

## Scope
- MCP access rules for caselaw/manual/KG.

## Caselaw Search API (v3.0)

### Available Tools
| Tool | Best For |
|------|----------|
| `caselaw_keyword_search` | Specific legal terms (BM25) |
| `caselaw_semantic_search` | Conceptual queries (vector) |
| `caselaw_optimized_search` | **RECOMMENDED** - combines all methods |

### Key Parameters for `caselaw_keyword_search`
| Parameter | Purpose |
|-----------|---------|
| `must_include=["keyword"]` | Require specific terms |
| `must_not=["keyword"]` | Exclude specific terms |
| `court="fc"` | Filter by court (fc/fca/irb) |
| `strategy="balanced"` | Search strategy |

### Validity Check (CRITICAL)
Before citing any case, use `caselaw_validity`:
- Check `validity_status` is "GOOD_LAW"
- If "OVERRULED" or "QUESTIONED", do NOT cite without caveat

## Notes
- L2 trigger only (deep audit or coverage gaps).
- Default to `enhance_with_kg=true` for all searches.
