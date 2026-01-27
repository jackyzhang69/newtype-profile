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

| Agent              | Role                              | Guest             | Pro               | Ultra             |
| ------------------ | --------------------------------- | ----------------- | ----------------- | ----------------- |
| **Intake**         | Case facts extraction, intake     | claude-sonnet-4-5 | claude-sonnet-4-5 | claude-sonnet-4-5 |
| **AuditManager**   | Workflow orchestration            | gemini-3-flash    | claude-sonnet-4-5 | claude-opus-4-5   |
| **Detective**      | Case law search via MCP           | gemini-3-flash    | gemini-3-pro-high | claude-sonnet-4-5 |
| **Strategist**     | Risk assessment, defense strategy | gemini-3-flash    | claude-sonnet-4-5 | claude-sonnet-4-5 |
| **Gatekeeper**     | Compliance & refusal risk review  | gemini-3-flash    | claude-sonnet-4-5 | claude-sonnet-4-5 |
| **Verifier**       | Citation validation (Pro+ only)   | N/A               | gemini-3-flash    | claude-haiku-4-5  |
| **Judge**          | Final verdict & decision synthesis | N/A               | claude-sonnet-4-5 | claude-opus-4-5   |
| **Reporter**       | Audit report generation           | gemini-3-flash    | claude-sonnet-4-5 | claude-sonnet-4-5 |

**Tier Features**:
| Feature | Guest | Pro | Ultra |
|---------|-------|-----|-------|
| Intake Agent | Yes | Yes | Yes |
| Judge Agent | No | Yes | Yes |
| Verifier Agent | No | Yes | Yes |
| KG Search | No | Yes | Yes |
| Deep Analysis | No | No | Yes |
| Multi-Round | No | No | Yes |
| Max Citations | 3 | 10 | 20 |
| Max Agent Calls | 4 | 8 | 15 |

### MCP Services

- **Ports**: caselaw (3105), operation-manual (3106), help-centre (3107), noc (3108), immi-tools (3109)
- **Auth**: `SEARCH_SERVICE_TOKEN` environment variable
- **Transport**: `AUDIT_MCP_TRANSPORT=http` for server, `stdio` for local

### Configuration

```bash
export AUDIT_TIER=pro                # guest | pro | ultra
export AUDIT_APP=spousal             # spousal | study | work
export AUDIT_MCP_TRANSPORT=http      # http | stdio
export SEARCH_SERVICE_TOKEN=xxx      # MCP/KG auth token
export FILE_CONTENT_BASE_URL=http... # File extraction service (optional)
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

- Modify `src/index.ts` (plugin core) or `src/agents/` (framework agents)
- Use npm/yarn (Bun only)
- Hallucinate case citations - use Verifier (Pro+ tier) or avoid citations entirely
- Suppress type errors with `as any`, `@ts-ignore`, `@ts-expect-error`
- Return `skills` property in agent config if already using `buildAuditPrompt` (causes double processing)
- Create temp files outside `./tmp/` directory (**ALL temporary files MUST go to `./tmp/`**)
- **Fire agents directly** - all agents must be dispatched via AuditManager + WorkflowEngine
- **Skip workflow_complete() calls** - state machine becomes inconsistent
- **Call agents out of order** - audit-workflow-enforcer hooks will block it
- **Modify audit checkpoint files** directly - use workflow tools instead
- **Skip workflow_next() validation** - always check before dispatching agents
- **Output report files user didn't request** - only generate reports when explicitly asked
- **Save temporary outputs outside ./tmp/** - ALL intermediate files (JSON, markdown, logs) MUST be in `./tmp/`
- **Make Judge calls from outside workflow** - Judge is only called by AuditManager in workflow Stage 5
- **Request file extraction without Intake** - Intake handles ALL file extraction (batch mode)

---

## Directory Structure

```
immi-os/
├── src/
│   ├── audit-core/           # Business logic (MODIFY HERE)
│   │   ├── agents/           # 8 audit agents + orchestrator
│   │   │   ├── intake.ts     # Stage 0: Case facts extraction, document intake
│   │   │   ├── audit-manager.ts # Orchestrator: WorkflowEngine coordinator
│   │   │   ├── detective.ts  # Stage 1: Case law search via MCP (trigger: audit)
│   │   │   ├── strategist.ts # Stage 2: Risk assessment & defense strategy
│   │   │   ├── gatekeeper.ts # Stage 3: Compliance & refusal risk review
│   │   │   ├── verifier.ts   # Stage 4: Citation validation (Pro+ tier only)
│   │   │   ├── judge.ts      # Stage 5: Final verdict & decision synthesis (Pro+ tier)
│   │   │   └── reporter.ts   # Stage 6: Audit report generation
│   │   ├── apps/             # spousal/, study/, work/
│   │   ├── tiers/            # Tier config (guest/pro/ultra model selection)
│   │   ├── knowledge/        # Dynamic knowledge injection
│   │   ├── search/           # Search policy (MCP-first, never hallucinate)
│   │   ├── workflow/         # WorkflowEngine + state machine
│   │   │   ├── defs/         # risk-audit.json, document-list.json, client-guidance.json
│   │   │   ├── engine.ts     # Core workflow state machine
│   │   │   └── types.ts      # Workflow type definitions
│   │   └── file-content/     # File extraction (PDF, DOCX, JPG, PNG via external service)
│   ├── agents/               # Framework agents (Sisyphus, Oracle...)
│   ├── hooks/                # 22+ lifecycle hooks + audit-workflow-enforcer
│   │   └── audit-workflow-enforcer/  # Enforcement hooks for workflow state machine
│   ├── tools/                # LSP, AST-Grep, Glob, audit-task...
│   │   └── workflow-manager/ # workflow_next, workflow_complete, workflow_status tools
│   ├── features/             # Claude Code compat layer
│   └── shared/               # Cross-cutting utilities
├── cases/                    # Case files and checkpoints
│   └── .audit-checkpoints/   # Workflow state checkpoints (auto-generated)
├── .claude/
│   ├── agents/               # External agent configs (audit-report-builder)
│   ├── skills/               # 20+ project skills (core-*, spousal-*, study-*, work-*, standalone)
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
Intake (Stage 0)
├─ Extract case facts from directory
├─ Recognize user intent (RISK_AUDIT / DOCUMENT_LIST / INTERVIEW_PREP / etc)
└─ Create CaseProfile (structured JSON)
    |
    v
AuditManager (orchestrator)
├─ Load workflow definition (risk-audit.json / document-list.json / etc)
└─ Coordinate state machine via WorkflowEngine
    |
    +---> workflow_next() → get next stage info
    |
    +---> audit_task() → dispatch stage agent
    |         |
    |         v (stages are conditional based on tier & intent)
    |     Stage 1: Detective (MCP case law search - always if RISK_AUDIT)
    |     Stage 2: Strategist (risk analysis - Pro+ tier only)
    |     Stage 3: Gatekeeper (compliance review - always if RISK_AUDIT)
    |     Stage 4: Verifier (citation validation - Pro+ tier only)
    |     Stage 5: Judge (verdict synthesis - Pro+ tier only)
    |     Stage 6: Reporter (report generation - always)
    |         |
    |         v
    |     [agent executes, output stored in checkpoint]
    |
    +---> workflow_complete(session_id, stage_id, output) → advance state
    |
    +---> [repeat until workflow_next() returns { status: "complete" }]
    |
    v
Final Output (Audit Report / Document List / Client Guidance / etc.)
```

### Workflow Tools

**Three main tools for state machine orchestration**:

| Tool                                              | Purpose                              | Returns                                                               |
| ------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------- |
| `workflow_next(session_id)`                       | Get next stage to execute            | `{ stage, agent, description, progress }` or `{ status: "complete" }` |
| `workflow_complete(session_id, stage_id, output)` | Mark stage complete and advance state | `{ completed, next_stage, progress }`                                 |
| `workflow_status(session_id)`                     | Check current workflow progress      | `{ current, completed, progress, is_complete }`                       |

**Workflow State Machine Definitions**:

| Workflow | Stages | Trigger | Output |
|----------|--------|---------|--------|
| `risk-audit.json` | 7 (intake → detective → strategist → gatekeeper → verifier → judge → reporter) | "audit", "risk assessment" | Audit report + scores |
| `document-list.json` | 2 (intake → gatekeeper) | "document checklist", "what documents" | Document list (IMM forms, evidence) |
| `client-guidance.json` | 2 (intake → guidance) | "interview prep", "love story" | Client guidance (statements, preparation) |

---

## Agent/Skill Quick Reference

> Detailed guide: `docs/agent-guides/framework/agent-skill-selection.md`

### When to Fire Each Agent

**IMPORTANT**: Do NOT fire agents directly. They are dispatched by **AuditManager** via WorkflowEngine.

| Trigger | Agent | Workflow Stage | Tier | Notes |
|---------|-------|-----------------|------|-------|
| User provides case directory | **Intake** | Stage 0 | All | Always runs first (facts extraction) |
| "audit", "risk assessment", "analyze" | **AuditManager** | Orchestrator | All | Loads workflow & calls workflow_next/complete |
| Inside audit workflow | **Detective** | Stage 1 | All | Case law search (MCP-first, never hallucinate) |
| Inside audit workflow | **Strategist** | Stage 2 | Pro+ | Risk analysis & defense strategy |
| Inside audit workflow | **Gatekeeper** | Stage 3 | All | Compliance & refusal triggers |
| Inside audit workflow | **Verifier** | Stage 4 | Pro+ | Citation validation (prevents hallucination) |
| Inside audit workflow | **Judge** | Stage 5 | Pro+ | Final verdict (GO/CAUTION/NO-GO or APPROVE/REVISE) |
| Inside audit workflow | **Reporter** | Stage 6 | All | Report generation (markdown → PDF via audit-report-builder) |
| "generate PDF" | **audit-report-builder** | Post-workflow | All | External tool (after Reporter completes) |

### Skill Naming Convention

| Prefix      | Scope                  | Example                                     |
| ----------- | ---------------------- | ------------------------------------------- |
| `core-*`    | Shared across all apps | `core-audit-rules`, `core-doc-analysis`    |
| `spousal-*` | Spousal app only       | `spousal-audit-rules`, `spousal-knowledge-injection` |
| `study-*`   | Study app only         | `study-audit-rules`, `study-doc-analysis`  |
| `work-*`    | Work permit app        | `work-audit-rules`, `work-doc-analysis`    |
| (none)      | Standalone             | `audit-report-output`, `learned-guardrails`, `os-knowledge-updater` |

---

## Audit Agent Responsibilities

### Intake (Stage 0) - Case Facts Extraction
- Extract ALL documents from case directory (batch mode via file_content_extract service)
- Parse IRCC forms (XFA fields) and extract structured facts
- Recognize user intent (RISK_AUDIT / DOCUMENT_LIST / INTERVIEW_PREP / etc)
- Create CaseProfile JSON (structured data for downstream agents)
- Flag missing documents (classification only, NOT risk assessment)
- **Note**: Always runs first, available in all tiers

### Judge (Stage 5) - Final Verdict & Decision Synthesis
- Does NOT re-analyze cases - only synthesizes prior agent analysis
- Operates in 3 scenarios:
  1. **Initial Assessment** (quick viability) → GO | CAUTION | NO-GO
  2. **Final Review** (pre-submission) → APPROVE | REVISE
  3. **Refusal Analysis** (post-refusal) → APPEAL | REAPPLY | ABANDON
- Weighs Detective + Strategist + Gatekeeper + Verifier outputs
- Produces clear, actionable verdict with rationale
- **Pro+ tier only** (not available in Guest tier)

---

## Output Requirements

Every audit report (RISK_AUDIT) MUST include:

1. **Disclaimer**: "This report provides a risk assessment based on historical Federal Court jurisprudence..."
2. **Case Summary**: Application type, key facts, applicant profile
3. **Judge Verdict**: GO/CAUTION/NO-GO or APPROVE/REVISE (if Pro+ tier available)
4. **Defensibility Score**: 0-100 with clear rationale
5. **Detective Findings**: Relevant case law, jurisprudence patterns, risk patterns
6. **Strategist Report**: Strengths, weaknesses, risk mitigation strategy
7. **Gatekeeper Review**: Compliance issues, hard eligibility assessment, refusal triggers
8. **Evidence Checklist**: Baseline / Live / Strategic document categories (per workflow)

**Note**: Verifier citations included if Pro+ tier (prevents hallucination of case law)

---

## Knowledge Index

<!-- KNOWLEDGE_INDEX:START -->

| Category  | Topic                                                      | Path                                                        |
| --------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| Framework | LSP (11 tools), AST-Grep, Glob, Sessi...                   | `docs/agent-guides/framework/tools.md`                      |
| Framework | 22+ lifecycle hooks for context injec...                   | `docs/agent-guides/framework/hooks.md`                      |
| Framework | Claude Code compatibility layer, back...                   | `docs/agent-guides/framework/features.md`                   |
| Framework | CLI installer, doctor health checks, ...                   | `docs/agent-guides/framework/cli.md`                        |
| Audit     | 8-agent workflow: Intake, AuditManager, Detective, Strategist, Gatekeeper, Verifier, Judge, Reporter | `docs/agent-guides/audit/workflow.md`                       |
| Audit     | Tiered system: guest/pro/ultra, Verif...                   | `docs/agent-guides/audit/tiers.md`                          |
| Audit     | MCP services (caselaw, operation-manu...                   | `docs/agent-guides/audit/mcp-integration.md`                |
| Apps      | Spousal sponsorship: genuineness, evi...                   | `docs/agent-guides/apps/spousal.md`                         |
| Apps      | Study permit: genuine intent, financi...                   | `docs/agent-guides/apps/study.md`                           |
| System    | 服务器访问规则、测试环境配置、环境变量、ImmiCore 服务依赖  | `docs/system/environment.md`                                |
| Framework | Common pitfalls: agent empty response...                   | `docs/agent-guides/framework/pitfalls.md`                   |
| Framework | OpenCode/OMO framework: plugin system...                   | `docs/agent-guides/framework/opencode-omo.md`               |
| Framework | Agent/skill selection guide: when to ...                   | `docs/agent-guides/framework/agent-skill-selection.md`      |
| Audit     | Archived milestones: Supabase persist...                   | `docs/agent-guides/audit/completed-milestones.md`           |
| Framework | Guide for building custom multi-agent...                   | `docs/agent-guides/framework/building-agentic-workflows.md` |
| Audit     | 搭积木式多智能体审计系统设计：8 Agents（含 Judge）, 16 ... | `docs/agent-guides/audit/architecture.md`                   |
| System    | Server URL configuration: Try LAN (19...                   | `docs/system/server.md`                                     |

<!-- KNOWLEDGE_INDEX:END -->

---

## See Also

- Framework details: `docs/agent-guides/framework/`
- Audit workflow: `docs/agent-guides/audit/`
- App specifics: `docs/agent-guides/apps/`
- Full guide: `docs/immigration-audit-guide.md`
