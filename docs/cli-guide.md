# Immi-OS CLI Guide

This document provides a comprehensive guide to using the Immi-OS CLI tools.

## 1. Overview

Immi-OS provides CLI tools accessible via the `immi-os` command (or `bunx immi-os`). The CLI supports various features including plugin installation, environment diagnostics, and session execution.

```bash
# Basic execution (displays help)
bunx immi-os

# Or run with npx
npx immi-os
```

---

## 2. Available Commands

| Command | Description |
|---------|-------------|
| `install` | Interactive Setup Wizard |
| `doctor` | Environment diagnostics and health checks |
| `run` | OpenCode session runner |
| `auth` | Google Antigravity authentication management |
| `version` | Display version information |

---

## 3. `install` - Interactive Setup Wizard

An interactive installation tool for initial Immi-OS setup. Provides a beautiful TUI (Text User Interface) based on `@clack/prompts`.

### Usage

```bash
bunx immi-os install
```

### Installation Process

1. **Provider Selection**: Choose your AI provider from Claude, ChatGPT, or Gemini.
2. **API Key Input**: Enter the API key for your selected provider.
3. **Configuration File Creation**: Generates `opencode.json` or `oh-my-opencode.json` files.
4. **Plugin Registration**: Automatically registers the immi-os plugin in OpenCode settings.

### Options

| Option | Description |
|--------|-------------|
| `--no-tui` | Run in non-interactive mode without TUI (for CI/CD environments) |
| `--verbose` | Display detailed logs |

---

## 4. `doctor` - Environment Diagnostics

Diagnoses your environment to ensure Immi-OS is functioning correctly. Performs 17+ health checks.

### Usage

```bash
bunx immi-os doctor
```

### Diagnostic Categories

| Category | Check Items |
|----------|-------------|
| **Installation** | OpenCode version (>= 1.0.150), plugin registration status |
| **Configuration** | Configuration file validity, JSONC parsing |
| **Authentication** | Anthropic, OpenAI, Google API key validity |
| **Dependencies** | Bun, Node.js, Git installation status |
| **Tools** | LSP server status, MCP server status |
| **Updates** | Latest version check |

### Options

| Option | Description |
|--------|-------------|
| `--category <name>` | Check specific category only (e.g., `--category authentication`) |
| `--json` | Output results in JSON format |
| `--verbose` | Include detailed information |

### Example Output

```
immi-os doctor

┌──────────────────────────────────────────────────┐
│  Immi-OS Doctor                                  │
└──────────────────────────────────────────────────┘

Installation
  ✓ OpenCode version: 1.0.155 (>= 1.0.150)
  ✓ Plugin registered in opencode.json

Configuration
  ✓ oh-my-opencode.json is valid
  ⚠ categories.visual-engineering: using default model

Authentication
  ✓ Anthropic API key configured
  ✓ OpenAI API key configured
  ✗ Google API key not found

Dependencies
  ✓ Bun 1.2.5 installed
  ✓ Node.js 22.0.0 installed
  ✓ Git 2.45.0 installed

Summary: 10 passed, 1 warning, 1 failed
```

---

## 5. `run` - OpenCode Session Runner

Executes OpenCode sessions and monitors task completion.

### Usage

```bash
bunx immi-os run [prompt]
```

### Options

| Option | Description |
|--------|-------------|
| `--enforce-completion` | Keep session active until all TODOs are completed |
| `--timeout <seconds>` | Set maximum execution time |

---

## 6. `auth` - Authentication Management

Manages Google Antigravity OAuth authentication. Required for using Gemini models.

### Usage

```bash
# Login
bunx immi-os auth login

# Logout
bunx immi-os auth logout

# Check current status
bunx immi-os auth status
```

---

## 7. Configuration Files

The CLI searches for configuration files in the following locations (in priority order):

1. **Project Level**: `.opencode/oh-my-opencode.json`
2. **User Level**: `~/.config/opencode/oh-my-opencode.json`

### JSONC Support

Configuration files support **JSONC (JSON with Comments)** format. You can use comments and trailing commas.

```jsonc
{
  // Agent configuration
  "sisyphus_agent": {
    "disabled": false,
    "planner_enabled": true,
  },
  
  /* Category customization */
  "categories": {
    "visual-engineering": {
      "model": "google/gemini-3-pro-preview",
    },
  },
}
```

---

## 8. Troubleshooting

### "OpenCode version too old" Error

```bash
# Update OpenCode
npm install -g opencode@latest
# or
bun install -g opencode@latest
```

### "Plugin not registered" Error

```bash
# Reinstall plugin
bunx immi-os install
```

### Doctor Check Failures

```bash
# Diagnose with detailed information
bunx immi-os doctor --verbose

# Check specific category only
bunx immi-os doctor --category authentication
```

---

## 9. Non-Interactive Mode

Use the `--no-tui` option for CI/CD environments.

```bash
# Run doctor in CI environment
bunx immi-os doctor --no-tui --json

# Save results to file
bunx immi-os doctor --json > doctor-report.json
```

---

## 10. Developer Information

### CLI Structure

```
src/cli/
├── index.ts              # Commander.js-based main entry
├── install.ts            # @clack/prompts-based TUI installer
├── config-manager.ts     # JSONC parsing, multi-source config management
├── doctor/               # Health check system
│   ├── index.ts          # Doctor command entry
│   └── checks/           # 17+ individual check modules
├── run/                  # Session runner
└── commands/auth.ts      # Authentication management
```