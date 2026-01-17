# OpenCode & Oh-My-OpenCode Framework Knowledge

Essential knowledge for working within the OpenCode/OMO framework.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         OpenCode CLI                            │
├─────────────────────────────────────────────────────────────────┤
│  Server (HTTP API)  │  TUI  │  SDK (@opencode-ai/sdk)          │
├─────────────────────────────────────────────────────────────────┤
│                         Plugins                                 │
│  ├── oh-my-opencode (orchestration, tools, hooks)              │
│  ├── immi-os (audit agents, MCP integration)                   │
│  └── opencode-antigravity-auth (Google OAuth)                  │
├─────────────────────────────────────────────────────────────────┤
│                    Built-in Agents                              │
│  build, plan, compaction, summary, title, explore, general     │
└─────────────────────────────────────────────────────────────────┘
```

## Plugin System

### Plugin Return Object

```typescript
const MyPlugin: Plugin = async (ctx) => {
  return {
    auth: { ... },           // Authentication hooks
    tool: { ... },           // Custom tools
    agent: { ... },          // Custom agents (via config handler)
    config: (config) => {},  // Config transformation
    event: (input) => {},    // Event handlers
    "chat.message": ...,     // Message hooks
    "tool.execute.before": ...,
    "tool.execute.after": ...,
  }
}
```

### Key Points

1. **Plugin loads once at startup** - Changes require OpenCode restart
2. **Config handler transforms config** - Agents registered via `config.agent`
3. **Context available**: `ctx.directory`, `ctx.client`, `ctx.$`

### Agent Registration (OMO Pattern)

```typescript
// In config handler
config.agent = {
  ...builtinAgents,        // From createBuiltinAgents()
  ...userAgents,           // From ~/.claude/agents/
  ...projectAgents,        // From .claude/agents/
  ...pluginAgents,         // From installed plugins
}
```

## Agent Configuration

### AgentConfig Interface

```typescript
interface AgentConfig {
  description?: string
  mode: "primary" | "subagent" | "all"
  model?: string
  prompt?: string
  temperature?: number
  permission?: Record<string, "allow" | "deny" | "ask">
  tools?: Record<string, boolean>  // Legacy, use permission
}
```

### Mode Types

| Mode | Purpose | Can be called via |
|------|---------|-------------------|
| `primary` | Top-level orchestrator | Direct selection only |
| `subagent` | Delegated tasks | `task`, `chief_task`, `call_omo_agent` |
| `all` | Both (default) | Any |

### Skill Injection Methods

**Method 1: Via `skills` property** (processed by `buildAgent`)
```typescript
return {
  skills: ["skill-a", "skill-b"],
  prompt: basePrompt,
}
```

**Method 2: Via manual injection** (e.g., `buildAuditPrompt`)
```typescript
return {
  prompt: buildAuditPrompt(basePrompt, appId, agentName, skills),
}
```

**WARNING**: Don't use both - causes double processing!

## Tool System

### Creating Custom Tools

```typescript
import { tool } from "@opencode-ai/plugin"

export const myTool = tool({
  description: "What this tool does",
  args: {
    param: tool.schema.string().describe("Parameter description"),
  },
  async execute(args, ctx) {
    // ctx has: agent, sessionID, messageID
    return "Result string"
  },
})
```

### Tool Context

- `ctx.agent` - Current agent name
- `ctx.sessionID` - Current session
- `ctx.messageID` - Current message
- NO directory access in execute - store globally at plugin init

## Hook System

### Hook Types

| Hook | When | Purpose |
|------|------|---------|
| `chat.message` | After user message | Inject context |
| `tool.execute.before` | Before tool runs | Modify args, block |
| `tool.execute.after` | After tool runs | Transform output |
| `event` | Various events | Session lifecycle |
| `config` | At startup | Transform config |

### Event Types

- `session.created` - New session started
- `session.deleted` - Session removed
- `session.error` - Error occurred
- `message.*` - Message events

## Configuration

### Config Priority (highest first)

1. Project: `.opencode/opencode.json`
2. User: `~/.config/opencode/opencode.json`

### OMO Config Priority

1. Project: `.opencode/oh-my-opencode.json`
2. User: `~/.config/opencode/oh-my-opencode.json`

### Model Configuration

```json
{
  "provider": {
    "google": {
      "models": {
        "gemini-3-flash": {
          "name": "Gemini 3 Flash",
          "limit": { "context": 1048576, "output": 65536 }
        }
      }
    }
  }
}
```

## Session Management

### Session API

```typescript
// Create session
const session = await client.session.create({ body: { title: "..." } })

// Send prompt
const result = await client.session.prompt({
  path: { id: sessionID },
  body: {
    agent: "detective",
    parts: [{ type: "text", text: "..." }]
  }
})

// List sessions
const sessions = await client.session.list()
```

### Background Tasks (OMO)

```typescript
// Launch background task
const task = await manager.launch({
  description: "...",
  prompt: "...",
  agent: "detective",
  parentSessionID: ctx.sessionID,
})

// Check output
const result = await manager.getOutput(taskId)
```

## Context7 Integration

When unsure about OpenCode/OMO behavior:

```typescript
// Step 1: Resolve library ID
context7_resolve-library-id: 
  libraryName="opencode"
  query="your question"

// Step 2: Query docs
context7_query-docs:
  libraryId="/anomalyco/opencode"
  query="detailed question"
```

### Key Library IDs

| Library | Context7 ID |
|---------|-------------|
| OpenCode | `/anomalyco/opencode` |
| Oh-My-OpenCode | `/code-yeongyu/oh-my-opencode` |
| OpenCode SDK | `/sst/opencode-sdk-js` |

## Common Commands

```bash
# List agents
opencode agent list

# List models
opencode models google

# Check auth
opencode auth list

# Run with specific agent
opencode --agent detective
```

## Debugging Tips

1. **Plugin not loading**: Check `~/.config/opencode/opencode.json` plugin array
2. **Agent not found**: Restart OpenCode after plugin changes
3. **Model not working**: Verify in `opencode models <provider>`
4. **Check session**: Use `session_read` tool
5. **Test isolation**: Use `bun -e` for unit tests
