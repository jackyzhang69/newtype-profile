---
name: spousal-immicore-mcp
description: |
  MCP access policy for ImmiCore services used in spousal audits (caselaw, operation manual, help-centre, noc, immi-tools).
---

# ImmiCore MCP Access Policy

## Scope
- Query caselaw, operation manuals, help centre
- Optional: NOC and tools

## Rules
- MCP is primary data source
- Web search only on explicit fallback conditions

## Outputs
- Structured citations and confidence rating

## Notes
- Enforce domain whitelist when web fallback is needed
