# Audit Workflow Reference

> Detailed documentation for the immigration audit workflow.

---

## Overview

The audit system orchestrates a team of specialized AI agents to simulate real immigration lawyer audit workflows. It produces a **Defensibility Score** based on historical Federal Court jurisprudence.

## Agent Team

| Agent | Role | Primary Tasks |
|-------|------|---------------|
| **AuditManager** | Orchestrator | Case decomposition, workflow control, final report |
| **Detective** | Investigator | Case law search, policy lookup via MCP/KG |
| **Strategist** | Analyst | Risk assessment, defense arguments, evidence planning |
| **Gatekeeper** | Reviewer | Compliance check, refusal triggers, quality control |
| **Verifier** | Validator | Citation accuracy check (Pro/Ultra only) |

---

## Workflow Stages

```
┌─────────────────────────────────────────────────────────────────┐
│  Stage 1: INTAKE                                                │
│  - AuditManager receives client profile                         │
│  - Identifies application type (spousal, study, etc.)          │
│  - Decomposes into auditable components                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 2: INVESTIGATION                                         │
│  - Detective searches case law via MCP (caselaw service)        │
│  - Detective retrieves operation manual sections                │
│  - KG provides similar cases and judge statistics (Pro+)        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 3: STRATEGY                                              │
│  - Strategist receives facts + legal research                   │
│  - Produces Defensibility Score (0-100)                         │
│  - Creates evidence plan (Baseline/Live/Strategic)              │
│  - Identifies strengths and weaknesses                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 4: REVIEW                                                │
│  - Gatekeeper validates compliance                              │
│  - Identifies refusal triggers                                  │
│  - Suggests required fixes                                      │
│  - Verifier checks citation accuracy (Pro+ only)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 5: FINALIZATION                                          │
│  - AuditManager reviews all findings                            │
│  - Loops back if gaps exist                                     │
│  - Compiles Final Audit Report                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Delegation Rules

### AuditManager MUST:
- Use Detective for ALL legal research (never hallucinate case law)
- Use Strategist for argument construction
- Use Gatekeeper for compliance validation
- Use Verifier for citation checks (when available)

### Detective MUST:
- Search MCP services BEFORE web search
- Cite actual case references
- Note confidence levels for sources

### Strategist MUST:
- Base arguments on evidence from Detective
- Provide Defensibility Score with rationale
- Create actionable evidence plan

### Gatekeeper MUST:
- Check for refusal triggers
- Validate output compliance
- Flag critical issues

---

## Output Format

Every audit report MUST include:

### 1. Disclaimer (Required)
```
This report provides a risk assessment based on historical Federal Court 
jurisprudence. It does NOT predict outcomes or guarantee visa issuance. 
Officers retain discretion. We assess judicial defensibility only.
```

### 2. Case Summary
- Application type
- Key facts
- Applicant profile

### 3. Defensibility Score
- Score: 0-100
- Rationale for score
- Confidence level

### 4. Strategist Report
- Strengths
- Weaknesses
- Evidence Plan:
  - Baseline (existing documents)
  - Live (obtainable documents)
  - Strategic (recommended additions)

### 5. Gatekeeper Review
- Compliance issues
- Refusal triggers
- Required fixes

### 6. Final Decision
- `PROCEED` - Low risk, can submit
- `REVISE` - Moderate risk, needs fixes
- `HIGH-RISK` - Significant concerns

---

## Tier-Based Features

| Feature | Guest | Pro | Ultra |
|---------|-------|-----|-------|
| Basic audit | Yes | Yes | Yes |
| Verifier check | No | Yes | Yes |
| KG similar cases | No | Yes | Yes |
| Deep MCP analysis | No | No | Yes |
| Multi-round review | No | No | Yes |

---

## MCP Services

| Service | Port | Purpose |
|---------|------|---------|
| caselaw | 3105 | Federal Court case search |
| operation-manual | 3106 | IRCC operation manuals |
| help-centre | 3107 | IRCC help centre content |
| noc | 3108 | NOC code lookup |
| immi-tools | 3109 | Immigration calculators |

---

## Quality Checklist

Before finalizing a report, verify:

- [ ] Disclaimer appears at the beginning
- [ ] Defensibility Score is present with rationale
- [ ] All citations are real (Verifier check for Pro+)
- [ ] Evidence checklist includes all three categories
- [ ] Gatekeeper review addresses compliance
- [ ] No "guaranteed success" language
