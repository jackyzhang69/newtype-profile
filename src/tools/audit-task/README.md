# audit_task Tool

## Overview

`audit_task` is a specialized tool for delegating immigration audit tasks to domain-specific agents (Detective, Strategist, Gatekeeper, Verifier, Judge, Reporter). It enforces strict agent-based workflows with security sandboxing and retry mechanisms.

## Key Differences from `chief_task`

`audit_task` was forked from `chief_task` but is **NOT a regression** — it's a **correct specialization** for immigration audit workflows:

| Feature | chief_task | audit_task | Rationale |
|---------|-----------|------------|-----------|
| **Delegation Model** | Category OR Agent | **Agent only** | Immigration audits require strict agent roles |
| **Tool Access** | Open (blocked recursion only) | **Strict whitelist (48 tools)** | Security: prevent agents from modifying case files |
| **Model Selection** | Dynamic (category config) | **Static (agent config)** | Tier-based model assignment (guest/pro/ultra) |
| **Agent Validation** | Runtime query | **Hardcoded `AUDIT_AGENTS` constant** | Performance: avoid runtime lookups |
| **Persona Injection** | Automatic (category-based) | **Manual (skill-based)** | See "Skills Persona Requirement" below |

**Verdict**: `audit_task` sacrifices flexibility for **security**, **determinism**, and **domain specialization**.

---

## Usage

```typescript
// Delegate to Detective agent for legal research
audit_task({
  subagent_type: "detective",
  description: "Search case law for study permit refusals",
  prompt: "Find Federal Court cases on study permit refusals due to dual intent...",
  run_in_background: false,
  skills: ["study-immicore-mcp", "study-audit-rules"]
})

// Delegate to Strategist for risk assessment
audit_task({
  subagent_type: "strategist",
  description: "Assess defensibility score",
  prompt: "Based on Detective's findings, assess the defensibility score...",
  run_in_background: false,
  skills: ["study-audit-rules", "study-workflow"]
})
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `subagent_type` | string | ✅ | Agent name: `detective`, `strategist`, `gatekeeper`, `verifier`, `judge`, `reporter` |
| `description` | string | ✅ | Short task description (5-10 words) |
| `prompt` | string | ✅ | Detailed task prompt for the agent |
| `run_in_background` | boolean | ✅ | `true` = async (returns task_id), `false` = sync (waits for result) |
| `skills` | string[] | ✅ | Array of skill names to inject (e.g., `["study-audit-rules"]`) |
| `resume` | string | ❌ | Session ID to resume previous agent session |

---

## ⚠️ CRITICAL: Skills Persona Requirement

**Unlike `chief_task`, `audit_task` does NOT automatically inject agent personas.**

### Why This Matters

`chief_task` had automatic persona injection based on category:
```typescript
// chief_task automatically added:
"You are a skilled software engineer..."
```

**`audit_task` requires explicit persona definition in skills:**

```markdown
<!-- .claude/skills/study-audit-rules/SKILL.md -->

# Study Permit Audit Rules

<Role>
You are Detective — a skeptical fact-checker specializing in Canadian study permit applications.

Your role:
- Search case law via MCP (caselaw, operation-manual)
- Identify risk patterns (dual intent, financial capacity, ties to home country)
- Cross-reference with Knowledge Graph for similar cases
</Role>

<Rules>
- ALWAYS use MCP tools first (caselaw_optimized_search, operation_manual_keyword_search)
- NEVER fabricate citations
- Flag contradictions between documents
</Rules>
```

### How to Define Personas in Skills

Each app-specific skill (e.g., `spousal-audit-rules`, `study-audit-rules`) **MUST** include:

1. **`<Role>` section**: Define agent identity and responsibilities
2. **`<Rules>` section**: Behavioral constraints and guidelines
3. **`<Examples>` section** (optional): Sample inputs/outputs

**Example Structure:**

```markdown
# {App}-audit-rules

<Role>
You are {Agent Name} — {brief description}.

Your role:
- {Responsibility 1}
- {Responsibility 2}
- {Responsibility 3}
</Role>

<Rules>
- {Rule 1}
- {Rule 2}
- {Rule 3}
</Rules>

<Examples>
## Example 1: {Scenario}
**Input**: {sample input}
**Output**: {expected output}
</Examples>
```

### Injection Order

Skills are injected in the order specified in the `skills` parameter:

```typescript
audit_task({
  subagent_type: "detective",
  skills: [
    "study-immicore-mcp",    // 1st: MCP access policy
    "study-audit-rules",     // 2nd: Risk patterns + Detective persona
    "study-doc-analysis"     // 3rd: Document analysis rules
  ]
})
```

**Best Practice**: Place persona-defining skills (e.g., `*-audit-rules`) **early** in the injection order.

---

## Supported Agents

| Agent | File | Responsibility | Key Skills |
|-------|------|----------------|------------|
| **detective** | `src/audit-core/agents/detective.ts` | Legal research via MCP | `*-immicore-mcp`, `*-audit-rules` |
| **strategist** | `src/audit-core/agents/strategist.ts` | Risk assessment, defense strategy | `*-audit-rules`, `*-workflow` |
| **gatekeeper** | `src/audit-core/agents/gatekeeper.ts` | Compliance validation | `*-audit-rules`, `*-client-guidance` |
| **verifier** | `src/audit-core/agents/verifier.ts` | Citation verification | `*-immicore-mcp` |
| **judge** | `src/audit-core/agents/judge.ts` | Final verdict and scoring | `*-audit-rules` |
| **reporter** | `src/audit-core/agents/reporter.ts` | Report generation | `*-workflow`, `audit-report-output` |

**Note**: The `AUDIT_AGENTS` constant in `constants.ts` must match actual agent files in `src/audit-core/agents/`. A build-time test (`audit-task.test.ts`) validates this.

---

## Tool Whitelist (48 Tools)

Agents have access to a **strict whitelist** of 48 tools for security:

### File Operations (Read-Only)
- `read`, `glob`, `grep`

### MCP Integration
- `mcp_*` tools (caselaw, operation-manual, help-centre, noc, immi-tools)
- `kg_*` tools (Knowledge Graph search)

### Document Analysis
- `file_content_extract`, `documentFulltextRead`

### Audit Workflow
- `audit_*` tools (session, save_profile, save_stage_output, etc.)
- `workflow_*` tools (next, complete, status)

### Background Tasks
- `background_output`, `background_cancel`

### Web Search (Restricted)
- `web_search_exa` (with domain whitelist enforcement)

**Prohibited Tools**:
- `write`, `edit` (agents cannot modify case files)
- `bash` (no arbitrary command execution)
- `audit_task` (no recursive delegation)

See `constants.ts` for the complete whitelist.

---

## Retry Mechanism

`audit_task` includes automatic retry for transient failures:

### Prompt Sending Retry
- **Max retries**: 2
- **Delay**: 1 second between attempts
- **Triggers**: Network errors, service unavailable

```typescript
// Automatically retries up to 2 times
try {
  await client.session.promptAsync({ ... })
} catch (error) {
  // Retry with 1s delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  await client.session.promptAsync({ ... })
}
```

### Status Check Retry
- **Max retries**: 2
- **Triggers**: Status API failures

```typescript
try {
  const statusResult = await client.session.status()
} catch (error) {
  retryCount++
  if (retryCount <= MAX_RETRIES) {
    // Continue polling
  }
}
```

---

## Error Handling

### Common Errors

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `❌ Agent "xxx" not found` | Invalid `subagent_type` | Use one of: detective, strategist, gatekeeper, verifier, judge, reporter |
| `❌ Failed to send prompt` | Network/service error | Check MCP service health, retry automatically triggered |
| `❌ No assistant response found` | Agent failed to execute | Check agent logs, verify tool whitelist, ensure skills define persona |
| `❌ Error fetching result` | Session API error | Check session ID, verify agent completed |

### Debugging

Enable debug logging:

```typescript
import { log } from "../../shared/logger"

// Logs are automatically written for:
// - Agent execution starts
// - Session creation
// - Status changes
// - Retry attempts
```

Check logs for:
- `[audit_task] Executing agent: {agent_name}`
- `[audit_task] Session {session_id} status changed to: {status}`
- `[audit_task] Prompt failed (attempt X/2), retrying in 1s...`

---

## Testing

### Build-Time Validation

`audit-task.test.ts` validates:
1. `AUDIT_AGENTS` constant matches actual agent files
2. No extra agents in constant
3. No missing agents from filesystem

```bash
bun test src/tools/audit-task/audit-task.test.ts
```

### Integration Testing

Test full workflow:

```bash
# Set environment
export AUDIT_TIER=pro
export AUDIT_APP=study
export SEARCH_SERVICE_TOKEN=xxx

# Run audit
/audit /path/to/case --tier pro --app study
```

---

## Migration from `chief_task`

If migrating from `chief_task`:

1. **Replace `category` with `subagent_type`**:
   ```diff
   - category: "quick"
   + subagent_type: "detective"
   ```

2. **Add explicit `skills` parameter**:
   ```diff
   - // Persona auto-injected
   + skills: ["study-audit-rules", "study-immicore-mcp"]
   ```

3. **Define persona in skills**:
   ```markdown
   <!-- .claude/skills/study-audit-rules/SKILL.md -->
   <Role>
   You are Detective — a skeptical fact-checker...
   </Role>
   ```

4. **Update tool expectations**:
   - Agents have restricted tool access (48 tools)
   - No `write`, `edit`, or `bash` tools
   - Use `file_content_extract` with `save_to_file` parameter

---

## Maintenance

### Adding a New Agent

1. **Create agent file**: `src/audit-core/agents/new-agent.ts`
2. **Update constant**: Add to `AUDIT_AGENTS` in `constants.ts`
3. **Run test**: `bun test src/tools/audit-task/audit-task.test.ts`
4. **Define persona**: Add `<Role>` section in relevant skills

### Updating Tool Whitelist

1. **Edit constant**: Modify `AUDIT_TOOL_WHITELIST` in `constants.ts`
2. **Document reason**: Add comment explaining why tool is needed
3. **Security review**: Ensure tool doesn't allow case file modification

---

## See Also

- [Audit Workflow](../../../docs/agent-guides/audit/workflow.md)
- [Tier System](../../../docs/agent-guides/audit/tiers.md)
- [Building Agentic Workflows](../../../docs/agent-guides/framework/building-agentic-workflows.md)
- [Agent Architecture](../../../docs/agent-guides/audit/architecture.md)
