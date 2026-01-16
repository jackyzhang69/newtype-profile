# Framework Hooks Reference

> Detailed documentation for oh-my-opencode lifecycle hooks.

---

## Overview

22+ lifecycle hooks intercepting/modifying agent behavior. Context injection, error recovery, output control, notifications.

## Hook Events

| Event | Timing | Can Block | Use Case |
|-------|--------|-----------|----------|
| **PreToolUse** | Before tool | Yes | Validate, modify input |
| **PostToolUse** | After tool | No | Add context, warnings |
| **UserPromptSubmit** | On prompt | Yes | Inject messages, block |
| **Stop** | Session idle | No | Inject follow-ups |
| **onSummarize** | Compaction | No | Preserve context |

---

## Directory Structure

```
src/hooks/
├── anthropic-context-window-limit-recovery/  # Auto-compact at token limit (556 lines)
├── auto-slash-command/         # Detect and execute /command patterns
├── auto-update-checker/        # Version notifications, startup toast
├── background-notification/    # OS notify on task complete
├── claude-code-hooks/          # settings.json PreToolUse/PostToolUse/etc (408 lines)
├── comment-checker/            # Prevent excessive AI comments
│   ├── filters/                # docstring, directive, bdd, shebang
│   └── output/                 # XML builder, formatter
├── compaction-context-injector/ # Preserve context during compaction
├── directory-agents-injector/  # Auto-inject AGENTS.md
├── directory-readme-injector/  # Auto-inject README.md
├── edit-error-recovery/        # Recover from edit failures
├── empty-message-sanitizer/    # Sanitize empty messages
├── interactive-bash-session/   # Tmux session management
├── keyword-detector/           # ultrawork/search keyword activation
├── non-interactive-env/        # CI/headless handling
├── preemptive-compaction/      # Pre-emptive at 85% usage
├── prometheus-md-only/         # Restrict prometheus to read-only
├── ralph-loop/                 # Self-referential dev loop
├── rules-injector/             # Conditional rules from .claude/rules/
├── session-recovery/           # Recover from errors (432 lines)
├── sisyphus-orchestrator/      # Main orchestration hook (660 lines)
├── start-work/                 # Initialize Sisyphus work session
├── task-resume-info/           # Track task resume state
├── think-mode/                 # Auto-detect thinking triggers
├── thinking-block-validator/   # Validate thinking block format
├── agent-usage-reminder/       # Remind to use specialists
├── context-window-monitor.ts   # Monitor usage (standalone)
├── session-notification.ts     # OS notify on idle
├── todo-continuation-enforcer.ts # Force TODO completion (413 lines)
└── tool-output-truncator.ts    # Truncate verbose outputs
```

---

## Key Hooks

### Context Injection Hooks

| Hook | Purpose |
|------|---------|
| `directory-agents-injector` | Auto-inject AGENTS.md when reading files |
| `directory-readme-injector` | Auto-inject README.md for project context |
| `rules-injector` | Conditional rules from `.claude/rules/` |
| `compaction-context-injector` | Preserve context during session compaction |

### Recovery Hooks

| Hook | Purpose |
|------|---------|
| `anthropic-context-window-limit-recovery` | Auto-compact at token limit |
| `edit-error-recovery` | Recover from edit failures |
| `session-recovery` | Recover from errors |

### Orchestration Hooks

| Hook | Purpose |
|------|---------|
| `sisyphus-orchestrator` | Main orchestration (660 lines) |
| `start-work` | Initialize work session |
| `todo-continuation-enforcer` | Force TODO completion |

---

## How to Add a Hook

1. Create `src/hooks/my-hook/`
2. Files: `index.ts` (createMyHook), `constants.ts`, `types.ts` (optional)
3. Return: `{ PreToolUse?, PostToolUse?, UserPromptSubmit?, Stop?, onSummarize? }`
4. Export from `src/hooks/index.ts`

### Example Structure

```typescript
// src/hooks/my-hook/index.ts
export function createMyHook(): Hook {
  return {
    PreToolUse: async (tool, input) => {
      // Validate or modify input
      return { modified: input }
    },
    PostToolUse: async (tool, result) => {
      // Add context or warnings
      return { messages: [{ role: "user", content: "..." }] }
    }
  }
}
```

---

## Patterns

- **Storage**: JSON file for persistent state across sessions
- **Once-per-session**: Track injected paths in Set
- **Message injection**: Return `{ messages: [...] }`
- **Blocking**: Return `{ blocked: true, message: "..." }` from PreToolUse

---

## Anti-Patterns

- **Heavy computation in PreToolUse**: Slows every tool call
- **Blocking without actionable message**: User doesn't know what to do
- **Duplicate injection**: Track what's injected
- **Missing try/catch**: Don't crash session
