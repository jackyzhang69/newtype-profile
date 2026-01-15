---
name: core-immicore-mcp
description: |
  Core MCP access policy shared across apps.
---

# Core ImmiCore MCP Policy

## Scope
- MCP access rules for caselaw/manual/KG.

## Caselaw Search API (v3.0)

### Primary Tool
Use `immicore_caselaw_search` for all caselaw queries:
- RRF fusion: BM25 + Semantic dual-path search
- Validity checking: Detect overruled cases
- Authority ranking: Prioritize authoritative precedents

### Key Parameters
| Parameter | Purpose |
|-----------|---------|
| `enhance_with_kg=true` | Get validity/authority info |
| `rerank_by_authority=true` | Sort by case authority |
| `must_include=["keyword"]` | Require specific terms |
| `must_not=["keyword"]` | Exclude specific terms |

### Validity Check (CRITICAL)
Before citing any case, verify:
- `validity.is_good_law == true`
- `validity.validity_status != "OVERRULED"`

## Notes
- L2 trigger only (deep audit or coverage gaps).
- Default to `enhance_with_kg=true` for all searches.
