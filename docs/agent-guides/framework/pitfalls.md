# Pitfalls Knowledge Base

Common mistakes and lessons learned in immi-os development.

## Agent Configuration

### Pitfall: Agent Returns Empty Response

**Symptom**: `chief_task` returns "(No text output)" or empty assistant message.

**Root Causes**:
1. **Double skill processing**: Agent config has `skills` property AND `buildAuditPrompt` already injects skills into prompt
2. **Plugin not reloaded**: OpenCode caches plugin, changes require restart
3. **Model not configured**: Model ID not in opencode.json provider config

**Solution**:
- Remove `skills` property from agent return if using `buildAuditPrompt` for skill injection
- Restart OpenCode after plugin changes
- Verify model exists in `opencode models <provider>`

**Prevention**:
- Choose ONE skill injection method: either `skills` property OR manual prompt injection
- After modifying plugin code, always restart OpenCode before testing

---

### Pitfall: Agent Not Registered

**Symptom**: `opencode agent list` doesn't show custom agents.

**Root Cause**: Plugin's config handler returns agents via `config.agent`, but OpenCode hasn't reloaded.

**Solution**: Restart OpenCode.

**Prevention**: Document that plugin changes require restart.

---

## Debugging Strategy

### Pitfall: Wrong Investigation Direction

**Symptom**: Spent hours debugging wrong area (e.g., plugin return structure) when issue was simpler (e.g., recent commit broke something).

**Root Cause**: Didn't follow systematic debugging approach.

**Correct Approach**:
1. "It worked yesterday" → `git log --since="3 days ago"` FIRST
2. Unclear about framework → Query Context7 FIRST
3. Test in isolation before complex investigation

**Prevention**:
- When user says "it worked before", immediately check git history
- When unsure about OpenCode/OMO behavior, use Context7

---

## Skill System

### Pitfall: Skills Processed Twice

**Symptom**: Prompt unexpectedly large, duplicate content.

**Root Cause**: 
- `buildAuditPrompt(basePrompt, appId, agentName, skills)` injects skill references
- `buildAgent()` sees `agent.skills` and calls `resolveMultipleSkills()` again

**Solution**: Don't return `skills` property in agent config if already using `buildAuditPrompt`.

**Code Pattern**:
```typescript
// WRONG - double processing
return {
  skills,  // buildAgent will process this
  prompt: buildAuditPrompt(basePrompt, appId, "detective", skills),  // already injected
}

// CORRECT - single injection via buildAuditPrompt
return {
  prompt: buildAuditPrompt(basePrompt, appId, "detective", skills),
}
```

---

## Model Configuration

### Pitfall: Model Authentication Mismatch

**Symptom**: Model returns empty response or auth error.

**Root Cause**: 
- Using `google/gemini-3-flash` (requires API key)
- But authenticated via OAuth subscription (needs `google/antigravity-*` or native model in provider config)

**Solution**: 
- Check `opencode auth list` for auth method
- Ensure model ID matches auth method
- Add model to `~/.config/opencode/opencode.json` provider section if needed

---

## Configuration

### Pitfall: Config Changes Not Taking Effect

**Symptom**: Modified oh-my-opencode.json or tier config, but behavior unchanged.

**Root Causes**:
1. Plugin caches config at startup
2. Wrong config file location (user vs project)
3. Build not run after source changes

**Solution**:
1. Run `bun run build`
2. Restart OpenCode
3. Verify correct config path: project `.opencode/oh-my-opencode.json` overrides user `~/.config/opencode/oh-my-opencode.json`

---

## MCP Services

### Pitfall: MCP Health Check Timeout

**Symptom**: Audit agents slow to start or MCP tools fail.

**Root Cause**: Serial health checks, wrong endpoint URLs.

**Solution**: 
- Use parallel health checks
- Verify MCP URLs match nginx proxy paths (e.g., `/mcp/caselaw` not `:3105/mcp`)

---

## Testing

### Pitfall: Testing in Main Session

**Symptom**: Hard to isolate issues, context pollution.

**Better Approach**:
- Use `bun -e "..."` for unit testing agent creation
- Use `chief_task` with `run_in_background=false` for isolated agent tests
- Check `session_read` to see actual messages

---

## Tool Name Matching

### Pitfall: Hook Not Detecting Tool Calls

**Symptom**: Hook checks for tool name but doesn't trigger (e.g., `empty-task-response-detector` only checked `"Task"` but not `"chief_task"`).

**Root Cause**: Tool names in OpenCode can have different cases and variants:
- `Task` vs `task` vs `chief_task`
- Hooks must handle all variants

**Solution**: 
```typescript
// WRONG - exact match only
if (input.tool !== "Task") return

// CORRECT - case-insensitive, handle all variants
const toolName = input.tool.toLowerCase()
if (toolName !== "task" && toolName !== "chief_task") return
```

**Fix Applied**: `src/hooks/empty-task-response-detector.ts` now detects both `task` and `chief_task` with case-insensitive matching.

---

## Quick Reference: Debugging Checklist

When something stops working:

1. [ ] Check git history: `git log --oneline --since="3 days ago"`
2. [ ] Rebuild: `bun run build`
3. [ ] Restart OpenCode
4. [ ] Query Context7 if unsure about framework behavior
5. [ ] Test in isolation with `bun -e` or `chief_task`
6. [ ] Check session content with `session_read`
