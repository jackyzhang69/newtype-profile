# Immigration Audit System - Agent Architecture

> **Today's Date:** Run `date "+%Y-%m-%d"` to get current date. NEVER use year 2024 in any output.

**Last Updated:** 2026-01-27
**Branch:** dev
**Domain**: Canadian Immigration Application Audit (Spousal, Study Permit)

## OVERVIEW

AI-powered immigration audit system orchestrated by **AuditManager** agent. Multi-tier audit workflow (guest/pro/ultra) with specialized agents for legal research (Detective), risk assessment (Strategist), compliance review (Gatekeeper), citation verification (Verifier), and report generation (Reporter).

## 语言规则 (Language Rules)

- **代码**: 全部使用英文（变量名、注释、commit message）
- **对话**: 与用户交流使用中文
- **文档**: 面向用户的文档使用中文（如审计报告、说明文档）

## ⚠️ CORE PRINCIPLES

This immigration audit system is **workflow-driven** with strict state machine enforcement:
- **AuditManager** orchestrates the complete workflow sequence
- **Workflow tools** (workflow_next, workflow_complete, workflow_status) manage state machine
- **Agents** are purely specialized and never analyze cases themselves
- **Enforcement hooks** prevent out-of-order agent execution
- **No hallucinations** allowed - all citations must be verified by Verifier agent

## AUDIT-CORE STRUCTURE

```
immi-os/src/audit-core/
├── agents/                 # 6 audit agents
│   ├── audit-manager.ts   # Orchestrator (workflow controller)
│   ├── intake.ts          # Case intake and document extraction
│   ├── detective.ts       # Legal research via MCP
│   ├── strategist.ts      # Risk assessment and defense strategy
│   ├── gatekeeper.ts      # Compliance validation
│   ├── verifier.ts        # Citation verification
│   └── reporter.ts        # Final report generation
├── apps/                   # App-specific logic
│   ├── spousal/           # Spousal sponsorship rules
│   └── study/             # Study permit rules
├── tiers/                 # Tier configuration (guest/pro/ultra)
│   └── config.ts
├── knowledge/             # Knowledge injection system
│   └── loader.ts
├── search/                # Search policy enforcement
│   └── policy.ts
├── workflow/              # State machine and orchestration
│   ├── engine.ts          # WorkflowEngine implementation
│   ├── types.ts           # Workflow types
│   └── defs/              # Workflow definitions (JSON)
│       ├── risk-audit.json
│       ├── document-list.json
│       └── client-guidance.json
└── file-content/          # Document extraction service
    └── client.ts
```

## AUDIT AGENT REFERENCE

| Agent | File | Responsibility |
|-------|------|-----------------|
| **AuditManager** | `src/audit-core/agents/audit-manager.ts` | Workflow orchestration, agent dispatch, final synthesis |
| **Intake** | `src/audit-core/agents/intake.ts` | Extract case facts, list documents, initialize session |
| **Detective** | `src/audit-core/agents/detective.ts` | Legal research via MCP (caselaw, operation manual) |
| **Strategist** | `src/audit-core/agents/strategist.ts` | Risk assessment, strengths/weaknesses, evidence plan |
| **Gatekeeper** | `src/audit-core/agents/gatekeeper.ts` | Compliance validation, refusal risk check |
| **Verifier** | `src/audit-core/agents/verifier.ts` | Citation validation against MCP sources |
| **Reporter** | `src/audit-core/agents/reporter.ts` | Final report generation with all sections |

| Task | Location | Notes |
|------|----------|-------|
| Add agent | `src/audit-core/agents/` | Must implement proper prompt with delegation rules |
| Modify tier | `src/audit-core/tiers/config.ts` | Update model/temperature per tier (guest/pro/ultra) |
| Add app | `src/audit-core/apps/` | New spousal/study variant, add audit rules skills |
| Workflow engine | `src/audit-core/workflow/engine.ts` | State machine, stage transitions |
| Knowledge injection | `src/audit-core/knowledge/loader.ts` | Dynamic skill loading per app/tier |
| Search policy | `src/audit-core/search/policy.ts` | MCP-first enforcement, domain whitelist |
| File extraction | `src/audit-core/file-content/client.ts` | PDF/DOCX parser, XFA form extraction |

## AUDIT-MANAGER WORKFLOW (CORE PATTERN)

**AuditManager is the central orchestrator** that controls the entire audit process via strict workflow state machine:

```
User Request (audit/checklist/guidance)
    ↓
AuditManager.workflow_next({ session_id })
    ↓
[Stage Available?]
    ├─ YES: Dispatch Agent → audit_task({ subagent_type, prompt, ... })
    │       ↓ [Agent Completes]
    │       workflow_complete({ session_id, stage_id, output })
    │       ↓ Go back to workflow_next()
    │
    └─ NO: Synthesize Final Report and Exit
```

**Key Workflow Methods:**
- `workflow_next(session_id)` → Returns `{ stage, agent, description, progress }` or `{ status: "complete" }`
- `audit_task(subagent_type, prompt, ...)` → Dispatches Detective/Strategist/Gatekeeper/Verifier/Reporter
- `workflow_complete(session_id, stage_id, output)` → Marks stage done, advances state machine
- `workflow_status(session_id)` → Check current progress

**Critical Rules:**
- ✅ ALWAYS call `workflow_complete()` after each agent finishes (state machine depends on it)
- ✅ ALWAYS follow agent dispatch order (enforcement hooks block out-of-sequence calls)
- ✅ Synthesize final report using outputs from all agents
- ❌ NEVER analyze case yourself (agents handle that)
- ❌ NEVER skip workflow steps or modify checkpoint files directly

**Workflow Definitions** (auto-selected based on request type):
- `risk-audit.json`: Full audit (6 stages) - intake → detective → strategist → gatekeeper → verifier → reporter
- `document-list.json`: Checklist only (2 stages) - intake → gatekeeper
- `client-guidance.json`: Guidance only (2 stages) - intake → guidance

## TDD (Test-Driven Development)

**MANDATORY for new features and bug fixes.** Follow RED-GREEN-REFACTOR:

```
1. RED    - Write failing test first (test MUST fail)
2. GREEN  - Write MINIMAL code to pass (nothing more)
3. REFACTOR - Clean up while tests stay GREEN
4. REPEAT - Next test case
```

| Phase | Action | Verification |
|-------|--------|--------------|
| **RED** | Write test describing expected behavior | `bun test` -> FAIL (expected) |
| **GREEN** | Implement minimum code to pass | `bun test` -> PASS |
| **REFACTOR** | Improve code quality, remove duplication | `bun test` -> PASS (must stay green) |

**Rules:**
- NEVER write implementation before test
- NEVER delete failing tests to "pass" - fix the code
- One test at a time - don't batch
- Test file naming: `*.test.ts` alongside source
- BDD comments: `#given`, `#when`, `#then` (same as AAA)

## CONVENTIONS

- **Package manager**: Bun only (`bun run`, `bun build`, `bunx`)
- **Types**: bun-types (not @types/node)
- **Build**: `bun build` (ESM) + `tsc --emitDeclarationOnly`
- **Exports**: Barrel pattern in index.ts; explicit named exports for tools/hooks
- **Naming**: kebab-case directories, createXXXHook/createXXXTool factories
- **Testing**: BDD comments `#given/#when/#then`, TDD workflow (RED-GREEN-REFACTOR)
- **Temperature**: 0.1 for code agents, max 0.3

## ANTI-PATTERNS (THIS PROJECT)

- **npm/yarn**: Use bun exclusively
- **@types/node**: Use bun-types
- **Bash file ops**: Never mkdir/touch/rm/cp/mv for file creation in code
- **Direct bun publish**: GitHub Actions workflow_dispatch only (OIDC provenance)
- **Local version bump**: Version managed by CI workflow
- **Year 2024**: NEVER use 2024 in code/prompts (use current year)
- **Rush completion**: Never mark tasks complete without verification
- **Over-exploration**: Stop searching when sufficient context found
- **High temperature**: Don't use >0.3 for code-related agents
- **Broad tool access**: Prefer explicit `include` over unrestricted access
- **Heavy PreToolUse logic**: Slows every tool call
- **Trust agent self-reports**: ALWAYS verify results independently
- **Skip TODO creation**: Multi-step tasks MUST have todos first
- **Batch completions**: Mark TODOs complete immediately, don't group
- **Giant commits**: 3+ files = 2+ commits minimum
- **Separate test from impl**: Same commit always
- **Double skill injection**: Don't return `skills` property in agent config if using `buildAuditPrompt` (see pitfalls.md)
- **Exact tool name matching**: Use case-insensitive matching for tool names in hooks (see pitfalls.md)
- **Temp files outside ./tmp/**: ⚠️ **ALL temporary files MUST be saved to `./tmp/` directory** (checkpoints, logs, JSON, intermediate outputs)
- **Unrequested report generation**: ⚠️ **NEVER output report files user didn't request** (only generate final audit report when explicitly asked for full audit)
- **Unsolicited output files**: ⚠️ **Don't create intermediate report files in project root** - save to `./tmp/` or keep in memory

## ⚠️ MANDATORY: READ PITFALLS BEFORE CODING

**BEFORE writing any code in this project**, read `docs/agent-guides/framework/pitfalls.md`.

This document contains:
- Known bugs and their solutions
- Common mistakes that waste hours of debugging
- Code patterns to avoid (with correct alternatives)

**Key pitfalls to avoid:**
1. Agent empty response → Double skill processing
2. Hook not triggering → Tool name case sensitivity
3. Config not taking effect → Plugin not reloaded
4. Skills not injecting → Wrong injection method

## AUDIT SYSTEM PATTERNS

- **Agent structure**: Each agent has prompt (role, rules, examples), tools config, model/temperature per tier
- **Error handling**: Consistent try/catch with async/await for all service calls
- **Tier awareness**: All models resolved via getter functions (e.g., `getAuditManagerModel()`)
- **Knowledge injection**: Dynamic skill loading based on app + tier combination
- **Search policy**: MCP-first enforcement, fallback to web search with domain restrictions
- **File handling**: All temp files in `./tmp/`, no side effects in project root
- **Workflow state**: Persisted in checkpoint files, managed via WorkflowEngine

## ⚠️ CRITICAL: 服务器访问规则

### 服务器信息

| 项目 | 值 |
|------|-----|
| IP | `192.168.1.98` |
| 用户 | `jacky` |
| 密码 | `${SERVER_PASSWORD}` (见 `.env`) |
| SSH | `ssh jacky@192.168.1.98` |
| ImmiCore 目录 | `/home/jacky/apps/immicore` |

### 访问策略

| 策略 | 说明 |
|------|------|
| **只读访问** | Agent 只能通过 SSH 查看服务器状态、日志、配置 |
| **禁止修改** | 绝对不允许在服务器上执行任何写操作（文件修改、git、docker 操作等） |
| **修改方案** | 如需修改服务器内容，只能向用户提出修改方案，由用户决定执行 |

### 允许的操作

```bash
# 查看服务状态
ssh jacky@192.168.1.98 "docker ps"
# 查看日志
ssh jacky@192.168.1.98 "docker logs immicore-search-service-1 --tail 50"
# 健康检查
ssh jacky@192.168.1.98 "curl -s http://localhost:3104/health"
```

### 禁止的操作

```bash
# ❌ 修改文件
ssh jacky@192.168.1.98 "vim /home/jacky/apps/immicore/.env"
# ❌ 重启服务
ssh jacky@192.168.1.98 "docker restart ..."
# ❌ 部署/更新
ssh jacky@192.168.1.98 "cd /home/jacky/apps/immicore && git pull"
```

详细信息见: `docs/system/environment.md`

## IMMIGRATION AUDIT MCP/KG AUTHENTICATION

**ImmiCore 服务统一认证**：
- 使用 `SEARCH_SERVICE_TOKEN` 环境变量作为统一的 Bearer token
- 用于 Knowledge Graph API 和所有 MCP 服务器的认证
- 在 HTTP 模式下（`AUDIT_MCP_TRANSPORT=http`），必须配置此令牌

**环境变量配置**：
```bash
export SEARCH_SERVICE_TOKEN=your_token
```

**实现位置**：
- `src/audit-core/http-client.ts`：AuthenticatedHttpClient 认证支持
- `src/tools/audit-kg/utils.ts`：KG 工具认证集成
- `src/audit-core/mcp-bridge.ts`：MCP 服务器认证集成
- `src/audit-core/eval/health-check.ts`：健康检查认证

**强制 MCP 策略**：
- `audit-search-guard` hook 拦截 websearch 和 webfetch
- HTTP 模式下，如果 MCP 服务器不健康，完全阻止外网搜索
- Detective/Strategist agent 禁止使用 webfetch 工具
- 域名白名单过滤（government/professional/public 三级）

## AUDIT AGENT MODELS (TIER-DEPENDENT)

| Agent | Guest | Pro | Ultra | Purpose |
|-------|-------|-----|-------|---------|
| **AuditManager** | claude-haiku-4-5 | claude-sonnet-4-5 | claude-opus-4-5 | Orchestration & synthesis |
| **Detective** | claude-haiku-4-5 | claude-sonnet-4-5 | claude-sonnet-4-5 | Legal research via MCP |
| **Strategist** | claude-haiku-4-5 | claude-sonnet-4-5 | claude-sonnet-4-5 | Risk assessment |
| **Gatekeeper** | claude-haiku-4-5 | claude-sonnet-4-5 | claude-sonnet-4-5 | Compliance validation |
| **Verifier** | claude-haiku-4-5 | claude-haiku-4-5 | claude-haiku-4-5 | Citation verification |
| **Judge** | claude-sonnet-4-5 | claude-opus-4-5 | claude-opus-4-5 | Final judgment & scoring |
| **Reporter** | claude-haiku-4-5 | claude-haiku-4-5 | claude-haiku-4-5 | Report generation |

**Model Selection**: Configured in `src/audit-core/tiers/config.ts` based on `AUDIT_TIER` environment variable (guest | pro | ultra)

## COMMANDS

```bash
bun run typecheck           # Type check all TypeScript
bun run build              # Build and test
bun run rebuild            # Clean rebuild
bun test                   # Run audit test suite (TDD workflow)
bun test -- --watch       # Watch mode for development
```

## AUDIT EXECUTION

**Starting an audit workflow:**

```bash
# Example: Start spousal sponsorship audit with pro tier
export AUDIT_TIER=pro
export AUDIT_APP=spousal
export SEARCH_SERVICE_TOKEN=your_token
export AUDIT_MCP_TRANSPORT=http

# AuditManager will auto-detect and execute correct workflow
```

**Workflow automation:**
- AuditManager receives case directory
- Automatically selects workflow (risk-audit/document-list/client-guidance)
- Calls workflow_next() → audit_task() → workflow_complete() loop
- Synthesizes final report when workflow_next() returns `{ status: "complete" }`

## COMPLEXITY HOTSPOTS

| File | Purpose | Complexity |
|------|---------|------------|
| `src/audit-core/agents/audit-manager.ts` | Workflow orchestration | Moderate (workflow loop, agent delegation) |
| `src/audit-core/agents/intake.ts` | Document extraction, fact gathering | High (multi-file parsing, state init) |
| `src/audit-core/agents/reporter.ts` | Final report synthesis | High (multi-section markdown gen) |
| `src/audit-core/workflow/engine.ts` | State machine implementation | High (checkpoint persistence, validation) |
| `src/audit-core/knowledge/loader.ts` | Dynamic skill injection | Moderate (tier/app-based selection) |
| `src/audit-core/file-content/client.ts` | PDF/DOCX extraction | Moderate (service client, batching) |

## NOTES

- **Testing**: Bun native test (`bun test`), BDD-style `#given/#when/#then`, audit test files in `src/audit-core/agents/`
- **Tier System**: Model/feature selection via `AUDIT_TIER` environment variable (guest | pro | ultra)
- **MCP Services**: caselaw (3105), operation-manual (3106), help-centre (3107), noc (3108), immi-tools (3109)
- **Temporary Files**: ALL intermediate outputs stored in `./tmp/` directory, never in project root
- **Report Generation**: Only generated when explicitly requested, never as side effect
- **Workflow State**: Persisted in case directory under `.audit-checkpoints/`, checkpoint files read-only for agents

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
