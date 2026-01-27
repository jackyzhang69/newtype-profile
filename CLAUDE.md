# Immi-OS - Immigration Audit System

> **Today's Date:** Run `date "+%Y-%m-%d"` to get current date. NEVER use year 2024 in any output.

AI-powered immigration audit system built on oh-my-opencode framework. Orchestrates specialized agents to simulate real immigration lawyer workflows.

## 🎯 CORE PRINCIPLES (优先级顺序)

1. **准确性 (Accuracy)** - 审计结论必须基于完整信息，不能遗漏关键细节
2. **稳定性 (Stability)** - 系统运行可靠，不出错，结果可复现
3. **成本 (Cost)** - 在满足准确性和稳定性前提下，优化 token 使用和性能

**决策原则**：当方案冲突时，按上述顺序权衡。例如：提高准确性可以增加成本，但不能牺牲稳定性。

---

## 语言规则 (Language Rules)

- **代码**: 全部使用英文（变量名、注释、commit message）
- **对话**: 与用户交流使用中文
- **文档**: 面向用户的文档使用中文（如审计报告、说明文档）

## 沟通规则 (Communication Rules)

**中间过程不展示，只沟通核心内容和决策**：
- ❌ 不展示：代码实现细节、工具调用过程、执行日志、查询结果
- ✅ 只展示：核心发现、关键决策、建议方案、最终结果
- 例外：用户明确要求时（"给我看代码"）才展示细节

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
- Create temp files outside `./tmp/` directory (**ALL temporary files MUST go to `./tmp/`**)
- **Skip workflow_complete() calls** - state machine will become inconsistent
- **Call agents out of order** - enforcement hooks will block it
- **Modify audit checkpoint files** directly - use workflow tools instead
- **Skip workflow_next() validation** - always check before dispatching agents
- **Output report files user didn't request** - only generate reports when explicitly asked
- **Save temporary outputs outside ./tmp/** - ALL intermediate files (JSON, markdown, logs) MUST be in `./tmp/`

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
│   │   ├── search/           # Search policy
│   │   ├── workflow/         # WorkflowEngine + state machine
│   │   │   ├── defs/         # risk-audit.json, document-list.json, client-guidance.json
│   │   │   ├── engine.ts     # Core workflow state machine
│   │   │   └── types.ts      # Workflow type definitions
│   │   └── file-content/     # File extraction (PDF, DOCX, etc.)
│   ├── agents/               # Framework agents (Sisyphus, Oracle...)
│   ├── hooks/                # 22+ lifecycle hooks + audit-workflow-enforcer
│   │   └── audit-workflow-enforcer/  # Enforcement hooks for workflow
│   ├── tools/                # LSP, AST-Grep, Glob...
│   │   └── workflow-manager/ # workflow_next, workflow_complete, workflow_status tools
│   ├── features/             # Claude Code compat layer
│   └── shared/               # Cross-cutting utilities
├── cases/                    # Case files and checkpoints
│   └── .audit-checkpoints/   # Workflow state checkpoints (auto-generated)
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
├── tmp/                      # ALL temporary files go here
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
    +---> workflow_next() → get stage info
    |
    +---> audit_task() → dispatch agent
    |         |
    |         v
    |     Detective | Strategist | Gatekeeper | Verifier
    |         |
    |         v
    |     [agent completes]
    |
    +---> workflow_complete() → advance state
    |
    +---> [repeat until workflow_next() returns null]
    |
    v
Final Audit Report
```

### Workflow Tools (NEW)

**Three main workflow tools for orchestration**:

| Tool | Purpose | Returns |
|------|---------|---------|
| `workflow_next(session_id)` | Get next stage to execute | `{ stage, agent, description, progress }` or `{ status: "complete" }` |
| `workflow_complete(session_id, stage_id, output)` | Mark stage done and advance | `{ completed, next_stage, progress }` |
| `workflow_status(session_id)` | Check workflow progress | `{ current, completed, progress, is_complete }` |

**Workflow Definitions** (automatic state machine):
- `risk-audit.json`: 6-stage full audit (intake → detective → strategist → gatekeeper → verifier → reporter)
- `document-list.json`: 2-stage checklist (intake → gatekeeper)
- `client-guidance.json`: 2-stage guidance (intake → guidance)

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
| Audit | 8-agent workflow orchestration with W... | `docs/agent-guides/audit/workflow.md` |
| Audit | Tiered system: guest/pro/ultra, Verif... | `docs/agent-guides/audit/tiers.md` |
| Audit | MCP services (caselaw, operation-manu... | `docs/agent-guides/audit/mcp-integration.md` |
| Apps | Spousal sponsorship: genuineness, evi... | `docs/agent-guides/apps/spousal.md` |
| Apps | Study permit: genuine intent, financi... | `docs/agent-guides/apps/study.md` |
| System | 服务器访问规则、测试环境配置、环境变量、ImmiCore 服务依赖 | `docs/system/environment.md` |
| Framework | Common pitfalls: agent empty response... | `docs/agent-guides/framework/pitfalls.md` |
| Framework | OpenCode/OMO framework: plugin system... | `docs/agent-guides/framework/opencode-omo.md` |
| Framework | Agent/skill selection guide: when to ... | `docs/agent-guides/framework/agent-skill-selection.md` |
| Audit | Archived milestones: Supabase persist... | `docs/agent-guides/audit/completed-milestones.md` |
| Framework | Guide for building custom multi-agent... | `docs/agent-guides/framework/building-agentic-workflows.md` |
| Audit | 搭积木式多智能体审计系统设计：8 Agents（含 Judge）, 16 ... | `docs/agent-guides/audit/architecture.md` |
| System | Server URL configuration: Try LAN (19... | `docs/system/server.md` |
<!-- KNOWLEDGE_INDEX:END -->

---

## See Also

- Framework details: `docs/agent-guides/framework/`
- Audit workflow: `docs/agent-guides/audit/`
- App specifics: `docs/agent-guides/apps/`
- Full guide: `docs/immigration-audit-guide.md`
