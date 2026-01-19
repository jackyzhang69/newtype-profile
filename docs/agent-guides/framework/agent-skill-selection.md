# Agent and Skill Selection Guide

> When to use which agent and skill in the Immi-OS audit system.

---

## Quick Reference: Agent Selection

| Trigger Words | Agent | Role | Mode |
|---------------|-------|------|------|
| "audit", "risk assessment", "analyze case" | **AuditManager** | Orchestrates all agents, produces final report | Primary |
| "case law", "find precedent", "search cases" | **Detective** | Case law search via MCP services | Subagent |
| "risk analysis", "defense strategy", "evidence plan" | **Strategist** | Risk assessment, defensibility score | Subagent |
| "compliance", "refusal risk", "eligibility check" | **Gatekeeper** | Compliance review, refusal triggers | Subagent |
| "verify citation", "validate case", "check reference" | **Verifier** | Citation validation against sources | Subagent |
| "generate report", "create PDF", "produce document" | **audit-report-builder** | Transform findings into themed PDF | External |

---

## Quick Reference: Skill Selection

### By Task Type

| Task | Skill to Use | Description |
|------|--------------|-------------|
| Full audit workflow | `core-audit-rules` | Base risk framework, audit flow |
| Case law search | `core-immicore-mcp` | MCP access policy for services |
| Document extraction | `core-doc-analysis` | Document analysis rules |
| Context building | `core-knowledge-injection` | Agent prompt injection |
| Spousal-specific analysis | `spousal-*` variants | Marriage, genuineness focus |
| Study-specific analysis | `study-*` variants | Intent, financial capacity focus |
| PDF report generation | `audit-report-output` | Judicial Authority theme |
| Semantic verification | `learned-guardrails` | Error pattern detection |

---

## Detailed Agent Profiles

### AuditManager (Orchestrator)

**When to Use**:
- User requests a full audit or risk assessment
- Initial entry point for any case analysis
- Need to coordinate multiple subagents

**When NOT to Use**:
- Single-task requests (e.g., "just find case law")
- PDF generation only (use audit-report-builder)
- Document extraction only (use Intake agent)

**Skills Attached** (via `buildAuditPrompt`):
- `core-audit-rules`
- `core-knowledge-injection`
- `{app}-audit-rules` (based on AUDIT_APP)
- `{app}-knowledge-injection`

**Tier Variations**:
| Tier | Model | Max Agent Calls |
|------|-------|-----------------|
| guest | gemini-3-flash | 4 |
| pro | claude-sonnet-4-5 | 6 |
| ultra | claude-opus-4-5 | 12 |

---

### Detective (Case Law Search)

**When to Use**:
- Need to find relevant Federal Court cases
- Search operation-manual or help-centre
- Build legal foundation for analysis

**When NOT to Use**:
- Risk scoring (use Strategist)
- Compliance checks (use Gatekeeper)
- General web research (not allowed for audit)

**Skills Attached**:
- `core-immicore-mcp`
- `{app}-immicore-mcp`

**MCP Tools Available**:
- `mcp_caselaw_search`
- `mcp_operation_manual_search`
- `mcp_help_centre_search`
- `kg_search` (pro/ultra only)

**Important**: Detective does NOT have webfetch access. All searches must go through MCP.

---

### Strategist (Risk Assessment)

**When to Use**:
- Calculate defensibility score (0-100)
- Identify strengths and weaknesses
- Develop evidence plan
- Assess judicial review risks

**When NOT to Use**:
- Finding case citations (use Detective)
- Checking hard eligibility rules (use Gatekeeper)
- Generating final report (use AuditManager)

**Skills Attached**:
- `core-knowledge-injection`
- `{app}-knowledge-injection`
- `{app}-audit-rules`

**Output Includes**:
- Defensibility Score with rationale
- Strengths analysis
- Weaknesses and mitigation
- Evidence recommendations (Baseline/Live/Strategic)

---

### Gatekeeper (Compliance Review)

**When to Use**:
- Check hard eligibility requirements
- Identify refusal triggers
- Verify IRCC policy compliance
- Flag critical deficiencies

**When NOT to Use**:
- Strategic analysis (use Strategist)
- Case law research (use Detective)
- Score calculation (use Strategist)

**Skills Attached**:
- `core-audit-rules`
- `{app}-audit-rules`
- `{app}-client-guidance`

**Output Includes**:
- Pass/Fail on hard requirements
- Refusal triggers identified
- Required fixes with priority
- Policy references

---

### Verifier (Citation Validation)

**When to Use**:
- Validate case citations are real
- Check citation accuracy
- Verify legal references
- Quality assurance on Detective output

**When NOT to Use**:
- Initial case search (use Detective)
- Analysis work (use Strategist)
- As primary research tool

**Skills Attached**:
- `core-immicore-mcp`
- `learned-guardrails`

**Verification Process**:
1. Extract citations from audit findings
2. Search MCP services for each citation
3. Compare against original source
4. Flag hallucinated or misquoted citations
5. Return validation report

**Tier Availability**:
| Tier | Available | Max Retries |
|------|-----------|-------------|
| guest | Yes (basic) | 1 |
| pro | Yes | 2 |
| ultra | Yes | 3 |

---

### audit-report-builder (External Agent)

**When to Use**:
- Transform audit findings into PDF
- Need professional document output
- Final deliverable generation

**When NOT to Use**:
- Actual audit analysis (use AuditManager)
- Data gathering (use Detective/Strategist)
- Compliance checking (use Gatekeeper)

**Skills Attached**:
- `audit-report-output`

**Output**:
- PDF document with Judicial Authority theme
- Verdict badges (GO/CAUTION/NO-GO)
- Executive summary, detailed analysis, recommendations
- WCAG AA compliant

**Location**: `.claude/agents/audit-report-builder.md`

---

## Skill Taxonomy

### Core Skills (Shared Across Apps)

| Skill | Purpose | Used By |
|-------|---------|---------|
| `core-audit-rules` | Base risk framework, audit flow | AuditManager, Gatekeeper |
| `core-doc-analysis` | Document extraction schema | Intake |
| `core-immicore-mcp` | MCP access policy | Detective, Verifier |
| `core-knowledge-injection` | Agent prompt injection | AuditManager, Strategist |

### App-Specific Skills

**Spousal Application** (`AUDIT_APP=spousal`):

| Skill | Purpose |
|-------|---------|
| `spousal-audit-rules` | Marriage genuineness, relationship evidence |
| `spousal-client-guidance` | Client prep templates |
| `spousal-doc-analysis` | Spousal document extraction |
| `spousal-immicore-mcp` | Spousal MCP policy |
| `spousal-knowledge-injection` | Spousal agent prompts |
| `spousal-workflow` | Report templates, output formats |

**Study Permit** (`AUDIT_APP=study`):

| Skill | Purpose |
|-------|---------|
| `study-audit-rules` | Genuine intent, financial capacity |
| `study-doc-analysis` | Study document extraction |
| `study-immicore-mcp` | Study MCP policy |
| `study-knowledge-injection` | Study agent prompts |

### Standalone Skills

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `audit-report-output` | Judicial Authority PDF theme | Final report generation |
| `learned-guardrails` | Semantic error detection | Verifier validation phase |

---

## Decision Flowchart

```
User Request
    │
    ├─→ "audit" / "risk assessment" / "analyze"
    │       └─→ AuditManager (orchestrates all)
    │
    ├─→ "find case law" / "search precedent"
    │       └─→ Detective (via MCP only)
    │
    ├─→ "risk score" / "defense strategy"
    │       └─→ Strategist
    │
    ├─→ "compliance" / "eligibility" / "refusal risk"
    │       └─→ Gatekeeper
    │
    ├─→ "verify citation" / "check reference"
    │       └─→ Verifier
    │
    ├─→ "generate report" / "create PDF"
    │       └─→ audit-report-builder
    │
    └─→ "extract documents" / "intake"
            └─→ Intake agent (if implemented)
```

---

## Skill Loading Rules

1. **Core skills always load first** - `core-*` skills are foundational
2. **App skills load based on AUDIT_APP** - Set `AUDIT_APP=spousal` or `AUDIT_APP=study`
3. **Standalone skills load on demand** - `audit-report-output` only for report generation
4. **Never double-load** - If using `buildAuditPrompt`, don't also set `skills` property

---

## Common Patterns

### Full Audit Flow
```
User: "Audit this spousal case"
→ AuditManager receives request
  → Calls Detective for case law
  → Calls Strategist for risk assessment
  → Calls Gatekeeper for compliance
  → Calls Verifier to validate citations
  → Produces final audit report
```

### Report Generation Only
```
User: "Generate PDF from these findings"
→ audit-report-builder receives findings
  → Applies Judicial Authority theme
  → Outputs publication-ready PDF
```

### Targeted Search
```
User: "Find case law about relationship genuineness"
→ Detective performs MCP search
  → Returns relevant cases with citations
```

---

## Anti-Patterns

### DO NOT
- Call Detective for risk scoring (use Strategist)
- Use webfetch in audit agents (MCP only)
- Skip Verifier for citation validation
- Call AuditManager for simple searches
- Load skills manually if using `buildAuditPrompt`

### DO
- Always validate citations through Verifier
- Use appropriate agent for task type
- Let AuditManager orchestrate multi-agent workflows
- Reference skills by correct naming convention

---

## See Also

- Agent implementations: `src/audit-core/agents/`
- Tier configuration: `docs/agent-guides/audit/tiers.md`
- MCP integration: `docs/agent-guides/audit/mcp-integration.md`
- Workflow details: `docs/agent-guides/audit/workflow.md`
