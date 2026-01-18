---
name: spousal-immicore-mcp
description: |
  MCP access policy for ImmiCore services used in spousal audits (caselaw, operation manual, help-centre, noc, immi-tools).
---

# ImmiCore MCP Access Policy

## Scope
- Query caselaw, operation manuals, help centre
- Optional: NOC and tools

## Caselaw Search (v3.0 API)

### Recommended Usage for Spousal Cases
```
caselaw_optimized_search(
  query="spousal sponsorship genuineness IRPR 4(1)",
  court="fc",
  issue_code="SUB_GENUINENESS"
)
```

Or with keyword search:
```
caselaw_keyword_search(
  query="spousal sponsorship genuineness",
  court="fc",
  must_include=["genuineness", "bona fide"],
  start_date="2020-01-01"
)
```

### Spousal-Specific Search Patterns
| Risk Type | Recommended Query |
|-----------|-------------------|
| Rushed Relationship | `query="short courtship quick marriage"`, `must_include=["genuineness"]` |
| Immigration Purpose | `query="primarily for immigration IRPR 4(1)(a)"`, `must_include=["immigration purpose"]` |
| Credibility | `query="contradictory testimony credibility"`, `must_include=["credibility"]` |

### Validity Check
ALWAYS use `caselaw_validity` to verify case is still good law before citing.

## Rules
- MCP is primary data source
- Web search only on explicit fallback conditions
- Always check case validity before citing

## Outputs
- Structured citations with validity status
- Authority scores for defense strategies
- Confidence rating

## Notes
- Enforce domain whitelist when web fallback is needed
- See `references/caselaw_query_patterns.json` for detailed query patterns
