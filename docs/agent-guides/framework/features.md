# Framework Features Reference

> Detailed documentation for oh-my-opencode features and Claude Code compatibility layer.

---

## Overview

Claude Code compatibility layer + core feature modules. Commands, skills, agents, MCPs, hooks from Claude Code work seamlessly.

## Directory Structure

```
src/features/
├── background-agent/           # Task lifecycle, notifications (608 lines)
├── boulder-state/              # Boulder state persistence
├── builtin-commands/           # Built-in slash commands
│   └── templates/              # start-work, refactor, init-deep, ralph-loop
├── builtin-skills/             # Built-in skills
│   ├── git-master/             # Atomic commits, rebase, history search
│   └── frontend-ui-ux/         # Designer-turned-developer skill
├── claude-code-agent-loader/   # ~/.claude/agents/*.md
├── claude-code-command-loader/ # ~/.claude/commands/*.md
├── claude-code-mcp-loader/     # .mcp.json files
│   └── env-expander.ts         # ${VAR} expansion
├── claude-code-plugin-loader/  # installed_plugins.json (486 lines)
├── claude-code-session-state/  # Session state persistence
├── context-injector/           # Context collection and injection
├── opencode-skill-loader/      # Skills from OpenCode + Claude paths
├── skill-mcp-manager/          # MCP servers in skill YAML
├── task-toast-manager/         # Task toast notifications
└── hook-message-injector/      # Inject messages into conversation
```

---

## Loader Priority

| Loader | Priority (highest first) |
|--------|--------------------------|
| **Commands** | `.opencode/command/` > `~/.config/opencode/command/` > `.claude/commands/` > `~/.claude/commands/` |
| **Skills** | `.opencode/skill/` > `~/.config/opencode/skill/` > `.claude/skills/` > `~/.claude/skills/` |
| **Agents** | `.claude/agents/` > `~/.claude/agents/` |
| **MCPs** | `.claude/.mcp.json` > `.mcp.json` > `~/.claude/.mcp.json` |

---

## Config Toggles

```json
{
  "claude_code": {
    "mcp": false,      // Skip .mcp.json
    "commands": false, // Skip commands/*.md
    "skills": false,   // Skip skills/*/SKILL.md
    "agents": false,   // Skip agents/*.md
    "hooks": false     // Skip settings.json hooks
  }
}
```

---

## Background Agent System

### Lifecycle
`pending` -> `running` -> `completed` / `failed`

### Tools
| Tool | Purpose |
|------|---------|
| `sisyphus_task` | Launch background agent task |
| `background_output` | Retrieve task results |
| `background_cancel` | Cancel task (by ID or all) |

### Features
- OS notification on task complete
- Session-scoped cleanup
- Parallel execution support

---

## Skill MCP System

- MCP servers embedded in skill YAML frontmatter
- Lazy client loading, session-scoped cleanup
- `skill_mcp` tool exposes capabilities

### Example Skill with MCP

```yaml
---
name: my-skill
description: Skill with embedded MCP
mcp:
  my-server:
    command: node
    args: ["server.js"]
---

# My Skill Content
...
```

---

## Shared Utilities

Located in `src/shared/`:

| Utility | Purpose |
|---------|---------|
| `getClaudeConfigDir()` | Find ~/.claude |
| `deepMerge(base, override)` | Type-safe recursive merge |
| `parseJsonc()` | Parse JSON with Comments |
| `isHookDisabled(name, list)` | Check hook enabled |
| `dynamicTruncate(text, budget)` | Token-aware truncation |
| `resolveFileReferencesInText()` | Resolve @file syntax |

---

## Anti-Patterns

- **Blocking on load**: Loaders run at startup
- **No error handling**: Always try/catch
- **Ignoring priority order**: Higher priority wins
- **Writing to ~/.claude/**: Read-only for plugins
