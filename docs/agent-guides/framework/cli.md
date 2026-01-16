# Framework CLI Reference

> Detailed documentation for oh-my-opencode CLI tools.

---

## Overview

CLI for oh-my-opencode: interactive installer, health diagnostics (doctor), runtime launcher. Entry: `bunx oh-my-opencode`.

## Directory Structure

```
src/cli/
├── index.ts              # Commander.js entry, subcommand routing
├── install.ts            # Interactive TUI installer (436 lines)
├── config-manager.ts     # JSONC parsing, env detection (725 lines)
├── types.ts              # CLI-specific types
├── commands/             # CLI subcommands
├── doctor/               # Health check system
│   ├── index.ts          # Doctor command entry
│   ├── runner.ts         # Health check orchestration
│   ├── constants.ts      # Check categories
│   ├── types.ts          # Check result interfaces
│   └── checks/           # 17+ individual checks
├── get-local-version/    # Version detection
└── run/                  # OpenCode session launcher
    ├── completion.ts     # Completion logic
    └── events.ts         # Event handling
```

---

## CLI Commands

| Command | Purpose |
|---------|---------|
| `install` | Interactive setup wizard |
| `doctor` | Environment health checks |
| `run` | Launch OpenCode session |

---

## Doctor Checks

17+ checks in `doctor/checks/`:

| Check | Purpose |
|-------|---------|
| `version.ts` | OpenCode >= 1.0.150 |
| `config.ts` | Plugin registered |
| `bun.ts` | Bun installed |
| `node.ts` | Node.js version |
| `git.ts` | Git available |
| `anthropic-auth.ts` | Anthropic API auth |
| `openai-auth.ts` | OpenAI API auth |
| `google-auth.ts` | Google API auth |
| `lsp-*.ts` | LSP servers |
| `mcp-*.ts` | MCP services |

---

## Config Manager (725 lines)

### Features
- **JSONC support**: Comments, trailing commas
- **Multi-source**: User (~/.config/opencode/) + Project (.opencode/)
- **Zod validation**: Type-safe config
- **Legacy format migration**: Automatic upgrade
- **Error aggregation**: For doctor checks

### Config Locations
```
~/.config/opencode/oh-my-opencode.json  # User-level
.opencode/oh-my-opencode.json           # Project-level
```

---

## How to Add a Doctor Check

1. Create `src/cli/doctor/checks/my-check.ts`:

```typescript
import type { DoctorCheck } from "../types"

export const myCheck: DoctorCheck = {
  name: "my-check",
  category: "environment",
  check: async () => {
    // Perform check
    const success = await someVerification()
    
    return {
      status: success ? "pass" : "fail",
      message: success 
        ? "Check passed" 
        : "Check failed: reason"
    }
  }
}
```

2. Add to `src/cli/doctor/checks/index.ts`

---

## Anti-Patterns

- **Blocking prompts in non-TTY**: Check `process.stdout.isTTY`
- **Hardcoded paths**: Use shared utilities
- **JSON.parse for user files**: Use parseJsonc
- **Silent failures in doctor checks**: Always return status
