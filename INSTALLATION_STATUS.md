# Oh-My-OpenCode Installation & Configuration Status

**Date:** 2026-01-19  
**OpenCode Version:** 1.1.26  
**Project:** immi-os (Immigration Audit System)

## ✅ Installation Complete

Oh-my-opencode is **fully installed and configured** in this project.

## Current Configuration

### 1. OpenCode Plugin Registration
**File:** `.opencode/opencode.json`
```json
{
  "plugin": ["/Users/jacky/immi-os"],
  "$schema": "https://opencode.ai/config.json"
}
```

### 2. Oh-My-OpenCode Settings
**File:** `.opencode/oh-my-opencode.json`

Key configurations:
- ✅ Google Authentication enabled
- ✅ Audit tier: PRO
- ✅ Audit app: Spousal sponsorship
- ✅ Search policy: MCP-first (prioritizes legal databases)
- ✅ MCP transport: HTTP
- ✅ Dynamic context pruning enabled
- ✅ Background task concurrency configured
- ✅ Auto-update enabled

### 3. Environment Variables
**File:** `.env`

Critical variables configured:
- `SEARCH_SERVICE_TOKEN`: Authentication for ImmiCore services
- `AUDIT_MCP_HOST`: https://es_search.jackyzhang.app
- `AUDIT_KG_BASE_URL`: Knowledge Graph API endpoint
- `AUDIT_TIER`: pro

### 4. Build Status
- ✅ TypeScript compilation: Passing
- ✅ Distribution files: Built
- ✅ CLI available: `dist/cli/index.js`

## Available Features

### Audit Agents
- **audit-manager**: Lead auditor orchestrating the workflow
- **detective**: Legal research and case law search
- **strategist**: Defense strategy and risk analysis
- **gatekeeper**: Compliance validation
- **verifier**: Citation verification (PRO tier)

### MCP Integrations
- **caselaw**: Canadian immigration case law search
- **operation-manual**: IRCC operation manual lookup
- **help-centre**: IRCC Help Centre Q&A
- **noc**: National Occupational Classification
- **email-kg**: Email knowledge graph

### Skills Available
- `playwright`: Browser automation
- `frontend-ui-ux`: UI/UX design
- `git-master`: Advanced git operations
- Immigration-specific skills (spousal, study, etc.)

## How to Use

### Starting an Audit Session

1. **Start OpenCode:**
   ```bash
   opencode
   ```

2. **Select the audit-manager agent** or simply ask:
   ```
   Audit this spousal sponsorship application...
   ```

3. **The system will automatically:**
   - Detect the audit intent
   - Load relevant knowledge bases
   - Orchestrate specialized agents
   - Generate a defensibility report

### Running Slash Commands

Available commands:
- `/audit <case-directory>` - Run full audit
- `/init-project --name <name>` - Initialize new project
- `/saas-os-help` - Show available skills

### Checking Agent Status

```bash
opencode agent list
```

### Checking Model Configuration

```bash
opencode models google
opencode models anthropic
```

## Configuration Recommendations

### For Different Audit Tiers

**GUEST Tier** (Free):
```json
{
  "audit_tier": "guest",
  "search_policy": "mcp_only"
}
```

**PRO Tier** (Current):
```json
{
  "audit_tier": "pro",
  "search_policy": "mcp_first"
}
```

**ULTRA Tier** (Premium):
```json
{
  "audit_tier": "ultra",
  "search_policy": "web_fallback"
}
```

### For Different Application Types

Change `audit_app` in `.opencode/oh-my-opencode.json`:
- `"spousal"` - Spousal sponsorship
- `"study"` - Study permit
- `"work"` - Work permit (if available)

## Troubleshooting

### Plugin Not Loading
```bash
# Restart OpenCode
# Check plugin registration
cat .opencode/opencode.json
```

### Agent Not Found
```bash
# List available agents
opencode agent list

# Rebuild the project
cd /Users/jacky/immi-os
bun run build
```

### MCP Connection Issues
```bash
# Check environment variables
cat .env | grep AUDIT_MCP

# Test MCP health
curl -H "Authorization: Bearer $SEARCH_SERVICE_TOKEN" \
  https://es_search.jackyzhang.app/health
```

### Model Not Working
```bash
# Verify model availability
opencode models google
opencode models anthropic

# Check authentication
opencode auth list
```

## Next Steps

1. **Test the Installation:**
   ```bash
   opencode --agent audit-manager
   ```
   Then ask: "What can you help me with?"

2. **Run a Sample Audit:**
   Create a test case directory and run:
   ```
   /audit path/to/test-case --tier pro --app spousal
   ```

3. **Customize Agent Behavior:**
   Edit `.opencode/oh-my-opencode.json` to adjust:
   - Agent models
   - Temperature settings
   - Tool permissions
   - Background task concurrency

4. **Enable Additional Features:**
   - Ralph Loop (self-referential development)
   - Preemptive compaction
   - Aggressive truncation (for large contexts)

## Documentation

- [Framework Guide](docs/agent-guides/framework/opencode-omo.md)
- [Audit Workflow](docs/agent-guides/audit/workflow.md)
- [MCP Integration](docs/agent-guides/audit/mcp-integration.md)
- [Environment Setup](docs/system/environment.md)

## Support

For issues or questions:
1. Check the [pitfalls guide](docs/agent-guides/framework/pitfalls.md)
2. Review the [knowledge index](AGENTS.md)
3. Consult the [OpenCode documentation](https://opencode.ai/docs)

---

**Status:** ✅ Ready to use  
**Last Updated:** 2026-01-19  
**Configuration Version:** 1.0
