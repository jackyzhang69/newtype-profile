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
| **Verifier** | Validator | Citation accuracy check (all tiers) |

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
│  - Verifier checks citation accuracy (all tiers)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 4.5: VERIFICATION LOOP-BACK (if citations fail)          │
│  - Track iteration count (Guest:1, Pro:2, Ultra:3 max)          │
│  - Detective finds replacement citations                        │
│  - Strategist updates arguments                                 │
│  - Verifier re-validates                                        │
│  - If max iterations reached: Mark report INCOMPLETE            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 5: FINALIZATION                                          │
│  - AuditManager reviews all findings                            │
│  - Loops back if gaps exist                                     │
│  - Compiles Final Audit Report                                  │
│  - If verification failed: Include INCOMPLETE warning           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Delegation Rules

### AuditManager MUST:
- Use Detective for ALL legal research (never hallucinate case law)
- Use Strategist for argument construction
- Use Gatekeeper for compliance validation
- Use Verifier for citation checks (all tiers, mandatory)
- Track verification iterations and enforce tier limits
- Handle INCOMPLETE reports when verification fails after max retries

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
- Validate document lists (DOCUMENT_LIST tasks, all tiers mandatory)

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
| Verifier check | Yes (1 retry) | Yes (2 retries) | Yes (3 retries) |
| KG similar cases | No | Yes | Yes |
| Deep MCP analysis | No | No | Yes |
| Multi-round review | No | No | Yes |
| Max Citations | 3 | 10 | 20 |
| Max Agent Calls | 4 | 6 | 12 |

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

## Verification Failure Handling

When Verifier reports CRITICAL failures (citation not found, overruled case):

### Loop-Back Process
1. **Track Iteration**: Check tier limit (Guest:1, Pro:2, Ultra:3)
2. **Detective Re-search**: Find replacement citations for failed ones
3. **Strategist Update**: Revise arguments with new citations
4. **Re-verify**: Dispatch Verifier again
5. **Repeat**: Until PASS or max iterations reached

### INCOMPLETE Report Format
If citations cannot be verified after maximum attempts:

```markdown
## AUDIT INCOMPLETE - MANUAL REVIEW REQUIRED

The following citations could not be verified after {n} attempts:

| Citation | Issue | Attempts |
|----------|-------|----------|
| Smith v. Canada, 2022 FC 456 | Case not found in database | 2 |
| Old v. Canada, 2010 FC 789 | Overruled by New v. Canada, 2020 FC 100 | 2 |

**Recommended Actions**:
1. Manually verify via CanLII/Westlaw
2. Find alternative supporting case law
3. Remove unsupported arguments if no alternative exists

**Verified Portions**: The remainder of this report has been verified and can be relied upon.
```

### Critical Rules
- **NEVER** output unverified citations as facts
- **ALWAYS** mark report as INCOMPLETE if verification fails
- **ALWAYS** list failed citations with specific issues
- **ALWAYS** provide actionable next steps

---

## Quality Checklist

Before finalizing a report, verify:

- [ ] Disclaimer appears at the beginning
- [ ] Defensibility Score is present with rationale
- [ ] All citations verified (Verifier check for all tiers)
- [ ] Verification status included (PASS/INCOMPLETE)
- [ ] Evidence checklist includes all three categories
- [ ] Gatekeeper review addresses compliance
- [ ] No "guaranteed success" language
- [ ] If INCOMPLETE: Failed citations listed with retry count
