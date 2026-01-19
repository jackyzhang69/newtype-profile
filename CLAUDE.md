# Immi-OS - Immigration Audit System

> AI-powered immigration application audit system built on oh-my-opencode framework. Orchestrates specialized agents to simulate real immigration lawyer workflows.

---

## Quick Reference

### Project Identity
- **Domain**: Canadian Immigration Application Audit
- **Base Framework**: oh-my-opencode (Claude Code plugin)
- **Runtime**: Bun (NOT npm/yarn)
- **Build**: `bun run build` | `bun test` (TDD mandatory)

### Tiered Audit System

**Tiers**: `guest` | `pro` | `ultra` (set via `AUDIT_TIER` env)

| Agent | Role | Guest | Pro | Ultra |
|-------|------|-------|-----|-------|
| **AuditManager** | Orchestration, final report | gemini-3-flash | claude-sonnet-4-5 | claude-opus-4-5 |
| **Detective** | Case law search via MCP | gemini-3-flash | gemini-3-pro-high | claude-sonnet-4-5 |
| **Strategist** | Risk assessment, defense | gemini-3-flash | claude-sonnet-4-5 | claude-sonnet-4-5 |
| **Gatekeeper** | Compliance review | gemini-3-flash | claude-sonnet-4-5 | claude-sonnet-4-5 |
| **Verifier** | Citation validation | N/A | gemini-3-flash | claude-haiku-4-5 |

**Tier Features**:
| Feature | Guest | Pro | Ultra |
|---------|-------|-----|-------|
| Verifier | No | Yes | Yes |
| KG Search | No | Yes | Yes |
| Deep Analysis | No | No | Yes |
| Multi-Round | No | No | Yes |
| Max Citations | 3 | 10 | 20 |
| Max Agent Calls | 4 | 6 | 12 |

### MCP Services
- **Ports**: caselaw (3105), operation-manual (3106), help-centre (3107), noc (3108), immi-tools (3109)
- **Auth**: `SEARCH_SERVICE_TOKEN` environment variable
- **Transport**: `AUDIT_MCP_TRANSPORT=http` for server, `stdio` for local

### Configuration
```bash
export AUDIT_TIER=pro           # guest | pro | ultra
export AUDIT_APP=spousal        # spousal | study
export AUDIT_MCP_TRANSPORT=http # http | stdio
export SEARCH_SERVICE_TOKEN=xxx # MCP/KG auth token
```

---

## Critical Rules

### DO
- Business logic in `src/audit-core/` ONLY
- Use MCP tools BEFORE web search (Detective/Strategist)
- Include disclaimer in all audit reports
- Follow TDD: RED -> GREEN -> REFACTOR
- **MUST READ `docs/agent-guides/framework/pitfalls.md` before writing code** - contains known issues and their solutions

### DO NOT
- Modify `src/index.ts` (plugin core)
- Use npm/yarn (Bun only)
- Hallucinate case citations (use Verifier)
- Suppress type errors with `as any`
- Return `skills` property in agent config if already using `buildAuditPrompt` (causes double processing)

---

## Directory Structure

```
immi-os/
├── src/
│   ├── audit-core/           # Business logic (MODIFY HERE)
│   │   ├── agents/           # 5 audit agents
│   │   ├── apps/             # spousal/, study/
│   │   ├── tiers/            # Tier config system
│   │   ├── knowledge/        # Dynamic injection
│   │   └── search/           # Search policy
│   ├── agents/               # Framework agents (Sisyphus, Oracle...)
│   ├── hooks/                # 22+ lifecycle hooks
│   ├── tools/                # LSP, AST-Grep, Glob...
│   ├── features/             # Claude Code compat layer
│   └── shared/               # Cross-cutting utilities
├── .claude/
│   ├── agents/               # External agent configs (audit-report-builder)
│   ├── skills/               # 16 project skills (core-*, spousal-*, study-*, standalone)
│   └── rules/                # Auto-loaded rules
├── docs/
│   ├── agent-guides/         # On-demand knowledge
│   │   ├── framework/        # Tools, hooks, features docs
│   │   ├── audit/            # Audit workflow docs
│   │   └── apps/             # App-specific docs
│   └── manifest.json         # Knowledge index (SSOT)
└── CLAUDE.md                 # This file (auto-loaded)
```

---

## Audit Workflow

```
User Request
    |
    v
AuditManager (orchestrator)
    |
    +---> Detective (case law search via MCP)
    |         |
    |         v
    |     [caselaw, operation-manual, KG]
    |
    +---> Strategist (risk assessment)
    |         |
    |         v
    |     [Defensibility Score + Evidence Plan]
    |
    +---> Gatekeeper (compliance check)
    |         |
    |         v
    |     [Refusal triggers + Required fixes]
    |
    +---> Verifier (all tiers)
              |
              v
          [Citation validation]
    |
    v
Final Audit Report
```

---

## Agent/Skill Quick Reference

> Detailed guide: `docs/agent-guides/framework/agent-skill-selection.md`

### When to Fire Each Agent

| Trigger | Agent | Mode |
|---------|-------|------|
| "audit", "risk assessment" | AuditManager | primary |
| "case law search" | Detective | subagent |
| "risk analysis", "defense" | Strategist | subagent |
| "compliance", "refusal risk" | Gatekeeper | subagent |
| "verify citation" | Verifier | subagent |
| "generate PDF report" | audit-report-builder* | external |

*External agent in `.claude/agents/`

### Skill Naming Convention

| Prefix | Scope | Example |
|--------|-------|---------|
| `core-*` | Shared across all apps | `core-audit-rules` |
| `spousal-*` | Spousal app only | `spousal-knowledge-injection` |
| `study-*` | Study app only | `study-audit-rules` |
| (none) | Standalone | `audit-report-output`, `learned-guardrails` |

---

## Output Requirements

Every audit report MUST include:
1. **Disclaimer**: "This report provides a risk assessment based on historical Federal Court jurisprudence..."
2. **Case Summary**: Application type, key facts
3. **Defensibility Score**: 0-100 with rationale
4. **Strategist Report**: Strengths, weaknesses, evidence plan
5. **Gatekeeper Review**: Compliance issues, refusal triggers
6. **Evidence Checklist**: Baseline / Live / Strategic categories

---

## Knowledge Index

<!-- KNOWLEDGE_INDEX:START -->
| Category | Topic | Path |
|----------|-------|------|
| Framework | LSP (11 tools), AST-Grep, Glob, Sessi... | `docs/agent-guides/framework/tools.md` |
| Framework | 22+ lifecycle hooks for context injec... | `docs/agent-guides/framework/hooks.md` |
| Framework | Claude Code compatibility layer, back... | `docs/agent-guides/framework/features.md` |
| Framework | CLI installer, doctor health checks, ... | `docs/agent-guides/framework/cli.md` |
| Audit | 5-agent audit workflow with verificat... | `docs/agent-guides/audit/workflow.md` |
| Audit | Tiered system: guest/pro/ultra, Verif... | `docs/agent-guides/audit/tiers.md` |
| Audit | MCP services (caselaw, operation-manu... | `docs/agent-guides/audit/mcp-integration.md` |
| Apps | Spousal sponsorship: genuineness, evi... | `docs/agent-guides/apps/spousal.md` |
| Apps | Study permit: genuine intent, financi... | `docs/agent-guides/apps/study.md` |
| System | 服务器访问规则、测试环境配置、环境变量、ImmiCore 服务依赖 | `docs/system/environment.md` |
| Framework | Common pitfalls: agent empty response... | `docs/agent-guides/framework/pitfalls.md` |
| Framework | OpenCode/OMO framework: plugin system... | `docs/agent-guides/framework/opencode-omo.md` |
| Framework | Agent/skill selection guide: when to ... | `docs/agent-guides/framework/agent-skill-selection.md` |
<!-- KNOWLEDGE_INDEX:END -->

---

## See Also

- Framework details: `docs/agent-guides/framework/`
- Audit workflow: `docs/agent-guides/audit/`
- App specifics: `docs/agent-guides/apps/`
- Full guide: `docs/immigration-audit-guide.md`
