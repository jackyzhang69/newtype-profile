# MCP Integration Reference

> Detailed documentation for MCP service integration in the audit system.

---

## Overview

The audit system connects to external legal databases via Model Context Protocol (MCP). These services provide case law, operation manuals, and other immigration-specific data.

## Available Services

| Service | Port | Purpose |
|---------|------|---------|
| **caselaw** | 3105 | Federal Court case search |
| **operation-manual** | 3106 | IRCC operation manuals |
| **help-centre** | 3107 | IRCC help centre content |
| **noc** | 3108 | NOC code lookup |
| **immi-tools** | 3109 | Immigration calculators |
| **KG API** | 3104 | Knowledge Graph (similar cases, judge stats) |

---

## Transport Modes

### HTTP Mode (Production/Server)
```bash
export AUDIT_MCP_TRANSPORT=http
export AUDIT_MCP_HOST=http://localhost
export SEARCH_SERVICE_TOKEN=your_token
```

Ports must be accessible: 3105, 3106, 3107, 3108, 3109, 3104

### STDIO Mode (Local/Development)
```bash
export AUDIT_MCP_TRANSPORT=stdio
export IMMICORE_PATH=/path/to/immicore
export HOST_URL=http://localhost:3104/api/v1
export SEARCH_SERVICE_TOKEN=your_token
```

Requires MCP servers installed at `~/immicore/mcp-servers/`

---

## Authentication

All services use unified Bearer token authentication:

```bash
export SEARCH_SERVICE_TOKEN=your_token
```

This token is used for:
- Knowledge Graph API calls
- MCP service authentication
- HTTP mode requests

---

## Search Policy

The audit system enforces a strict search policy:

### Priority Order
1. **MCP Services** - Always try first
2. **Knowledge Graph** - Parallel with MCP (not fallback)
3. **Web Search** - Only if MCP unavailable (with restrictions)

### Domain Whitelist

| Category | Domains | Confidence |
|----------|---------|------------|
| **Government** | ircc.gc.ca, canada.ca, esdc.gc.ca | High |
| **Professional** | gands.com, fragomen.com | Medium |
| **Public** | x.com, reddit.com | Low |

### Agent Restrictions

| Agent | MCP | KG | Web Search | Web Fetch |
|-------|-----|-----|------------|-----------|
| Detective | Yes | Yes (Pro+) | Restricted | **NO** |
| Strategist | Yes | Yes (Pro+) | Restricted | **NO** |
| Gatekeeper | Yes | Yes (Pro+) | No | No |
| Verifier | Yes | Yes | No | No |

---

## MCP Tools

### Case Law Tools

| Tool | Purpose |
|------|---------|
| `caselaw_keyword_search` | BM25 keyword search |
| `caselaw_semantic_search` | Vector similarity search |
| `caselaw_optimized_search` | Combined BM25 + Semantic + KG |
| `caselaw_authority` | Get citation authority score |
| `caselaw_validity` | Check if case is still good law |

### Knowledge Graph Tools

| Tool | Purpose |
|------|---------|
| `kg_search` | Search cases with filters |
| `kg_case` | Get case by citation |
| `kg_similar_cases` | Find similar cases by profile |
| `kg_judge_stats` | Get judge approval rates |

---

## Configuration

### Full Config Example

```json
// .opencode/oh-my-opencode.json
{
  "audit_app": "spousal",
  "audit_tier": "pro",
  "search_policy": "mcp_first",
  "web_whitelist": {
    "government": ["ircc.gc.ca", "canada.ca", "esdc.gc.ca"],
    "professional": ["gands.com", "fragomen.com"],
    "public": ["x.com", "reddit.com"]
  },
  "audit_validate_knowledge": true,
  "audit_kg_base_url": "http://localhost:3104/api/v1",
  "audit_mcp_transport": "http",
  "audit_mcp_host": "http://localhost"
}
```

---

## Health Check

Run health check to verify MCP connectivity:

```bash
bun run src/audit-core/eval/health-check.ts
```

This verifies:
- All MCP services are reachable
- Authentication is valid
- KG API is responding

---

## Troubleshooting

### MCP Service Not Found
- Check if immicore is installed at expected path
- Verify MCP servers are running (HTTP mode)
- Check port availability

### Authentication Failed
- Verify `SEARCH_SERVICE_TOKEN` is set
- Check token hasn't expired
- Confirm token has required permissions

### Search Returns No Results
- Check query format
- Verify service is healthy
- Try different search tool (keyword vs semantic)

---

## Related Files

- `src/audit-core/mcp-bridge.ts` - MCP bridge configuration
- `src/audit-core/http-client.ts` - Authenticated HTTP client
- `src/audit-core/search/policy.ts` - Search policy implementation
- `src/tools/audit-kg/` - KG tool implementations
