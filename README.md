# Immi-OS

> AI-powered Canadian Immigration Application Audit System

Immi-OS orchestrates a team of specialized AI agents to simulate immigration lawyer workflows, providing defensibility assessments based on Federal Court jurisprudence.

## Features

- **7-Agent Workflow**: Intake, AuditManager, Detective, Strategist, Gatekeeper, Verifier, ReportBuilder
- **Modular "Building Blocks"**: Composable skills and agents for different application types
- **Tiered Service**: Guest / Pro / Ultra with different model configurations
- **MCP Integration**: Case law, operation manuals, help centre via ImmiCore services
- **Knowledge Injection**: Dynamic skill loading based on application type (spousal, study)
- **Defensibility Scoring**: Risk assessment with actionable defense strategies

## Quick Start

### Prerequisites

- Bun 1.0+
- OpenCode CLI with oh-my-opencode plugin
- ImmiCore MCP services (optional, for full functionality)

### Installation

```bash
git clone https://github.com/jackyzhang69/immi-os.git
cd immi-os
bun install
```

### Configuration

```bash
# Environment variables
export AUDIT_TIER=pro              # guest | pro | ultra
export AUDIT_APP=spousal           # spousal | study
export AUDIT_MCP_TRANSPORT=http    # http | stdio
export SEARCH_SERVICE_TOKEN=xxx    # MCP/KG authentication
```

### Running an Audit

```bash
# Start OpenCode session
opencode

# In the session, run:
/audit /path/to/case/directory --tier pro --app spousal
```

## Architecture

### Workflow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Stage 0: INTAKE                                                │
│  └── Document extraction, intent recognition, profile generation│
├─────────────────────────────────────────────────────────────────┤
│  Stage 1: ORCHESTRATION (AuditManager)                          │
│  └── Workflow control, task decomposition, final report         │
├─────────────────────────────────────────────────────────────────┤
│  Stage 2: INVESTIGATION (Detective)                             │
│  └── Case law search, policy lookup via MCP/KG                  │
├─────────────────────────────────────────────────────────────────┤
│  Stage 3: STRATEGY (Strategist)                                 │
│  └── Risk assessment, defense arguments, evidence planning      │
├─────────────────────────────────────────────────────────────────┤
│  Stage 4: REVIEW (Gatekeeper + Verifier)                        │
│  └── Compliance check, citation validation, loop-back if needed │
├─────────────────────────────────────────────────────────────────┤
│  Stage 5: JUDGMENT (AuditManager)                               │
│  └── Assign score, make verdict, package AuditJudgment          │
├─────────────────────────────────────────────────────────────────┤
│  Stage 5.5: REPORT (ReportBuilder)                              │
│  └── Format report with Judicial Authority theme, output PDF    │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Team

| Agent | Stage | Role | Key Responsibilities |
|-------|-------|------|---------------------|
| **Intake** | 0 | Extractor | Document extraction, intent recognition, structured profile |
| **AuditManager** | 1,5 | Orchestrator | Workflow control, task decomposition, final judgment |
| **Detective** | 2 | Investigator | Case law search, policy lookup via MCP/KG |
| **Strategist** | 3 | Analyst | Risk scoring, defense arguments, evidence plan |
| **Gatekeeper** | 4 | Reviewer | Compliance check, refusal triggers, quality control |
| **Verifier** | 4 | Validator | Citation accuracy check, loop-back triggers |
| **Reporter** | 5.5 | Formatter | Report generation with Judicial Authority theme |

## Agent Models by Tier

| Agent | Guest | Pro | Ultra |
|-------|-------|-----|-------|
| **Intake** | claude-sonnet-4 | claude-sonnet-4 | claude-sonnet-4 |
| **AuditManager** | gemini-3-flash | claude-sonnet-4-5 | claude-opus-4-5 |
| **Detective** | gemini-3-flash | claude-sonnet-4-5 | claude-sonnet-4-5 |
| **Strategist** | gemini-3-flash | claude-sonnet-4-5 | claude-sonnet-4-5 |
| **Gatekeeper** | gemini-3-flash | claude-sonnet-4-5 | claude-sonnet-4-5 |
| **Verifier** | gemini-3-flash | gemini-3-flash | claude-haiku-4-5 |
| **Reporter** | gemini-3-flash | claude-haiku-4-5 | claude-haiku-4-5 |

## Tier Features

| Feature | Guest | Pro | Ultra |
|---------|-------|-----|-------|
| Verifier | Yes | Yes | Yes |
| KG Search | No | Yes | Yes |
| Deep Analysis | No | No | Yes |
| Multi-Round | No | No | Yes |
| Max Citations | 3 | 10 | 20 |
| Max Report Lines | 400 | 500 | 600 |
| Verify Iterations | 1 | 2 | 3 |

## Building Blocks Architecture

Immi-OS uses a modular "building blocks" approach:

```
┌─────────────────────────────────────────────────────────────────┐
│  Application Layer                                              │
│  └── spousal | study | work | family                            │
├─────────────────────────────────────────────────────────────────┤
│  Skills Layer (16 composable modules)                           │
│  ├── Core Skills: audit-rules, doc-analysis, mcp-policy         │
│  ├── App Skills: spousal-*, study-* (6 per app type)            │
│  └── Cross-cutting: learned-guardrails, audit-report-output     │
├─────────────────────────────────────────────────────────────────┤
│  Agent Layer (7 specialized agents)                             │
│  └── Each agent receives skills dynamically based on app type   │
├─────────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                           │
│  └── ImmiCore MCP Services | Knowledge Graph | File Extraction  │
└─────────────────────────────────────────────────────────────────┘
```

### How Skills are Injected

```
User Request: "Audit spousal case at /path/to/dir"
                    │
                    ▼
          ┌─────────────────┐
          │  Intake Agent   │ ← No skill injection (pure extraction)
          └────────┬────────┘
                   │ Structured Profile
                   ▼
        ┌───────────────────┐
        │  AuditManager     │ ← audit-report-output
        └─────────┬─────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌────────┐  ┌──────────┐  ┌──────────┐
│Detective│  │Strategist│  │Gatekeeper│
└────┬───┘  └────┬─────┘  └────┬─────┘
     │           │             │
     ▼           ▼             ▼
spousal-      spousal-      spousal-
immicore-mcp  audit-rules   workflow
spousal-                    learned-
doc-analysis                guardrails
```

## Project Structure

```
immi-os/
├── src/audit-core/        # Core audit business logic
│   ├── agents/            # 7 specialized agents
│   │   ├── intake.ts      # Stage 0: Document extraction
│   │   ├── audit-manager.ts
│   │   ├── detective.ts
│   │   ├── strategist.ts
│   │   ├── gatekeeper.ts
│   │   ├── verifier.ts
│   │   └── reporter.ts        # Stage 5.5: Report formatting
│   ├── apps/              # Application-specific rules (spousal, study)
│   ├── tiers/             # Tier configuration
│   └── knowledge/         # Dynamic knowledge injection
├── .claude/skills/        # 16 domain skills
│   ├── core-*/            # Shared audit rules
│   ├── spousal-*/         # Spousal sponsorship specifics
│   ├── study-*/           # Study permit specifics
│   └── learned-guardrails # Semantic verification rules
└── docs/                  # Documentation
    └── agent-guides/      # Developer guides
```

## Skills (16 Total)

| Category | Skills | Purpose |
|----------|--------|---------|
| **Core** (4) | core-audit-rules, core-doc-analysis, core-immicore-mcp, core-knowledge-injection | Shared baseline rules |
| **Spousal** (6) | spousal-audit-rules, spousal-doc-analysis, spousal-immicore-mcp, spousal-knowledge-injection, spousal-workflow, spousal-client-guidance | Spousal-specific |
| **Study** (4) | study-audit-rules, study-doc-analysis, study-immicore-mcp, study-knowledge-injection | Study permit-specific |
| **Other** (2) | learned-guardrails, audit-report-output | Cross-cutting |

## Development

```bash
# Type check
bun run typecheck

# Build
bun run build

# Test (TDD mandatory)
bun test

# Run specific test
bun test src/audit-core/agents.test.ts
```

## Documentation

- [Audit Workflow](docs/agent-guides/audit/workflow.md)
- [Tier System](docs/agent-guides/audit/tiers.md)
- [MCP Integration](docs/agent-guides/audit/mcp-integration.md)
- [Building Agentic Workflows](docs/agent-guides/framework/building-agentic-workflows.md)

## License

SUL-1.0
