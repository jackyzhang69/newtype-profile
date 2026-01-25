# Audit Workflow Reference

> Detailed documentation for the immigration audit workflow.

---

## Overview

The audit system orchestrates a team of 7 specialized AI agents to simulate real immigration lawyer audit workflows. It produces a **Defensibility Score** based on historical Federal Court jurisprudence.

## Agent Team

| Agent | Stage | Role | Primary Tasks |
|-------|-------|------|---------------|
| **Intake** | 0 | Extractor | Document extraction, intent recognition, structured profile |
| **AuditManager** | 1,5 | Orchestrator | Case decomposition, workflow control, final judgment |
| **Detective** | 2 | Investigator | Case law search, policy lookup via MCP/KG |
| **Strategist** | 3 | Analyst | Risk assessment, defense arguments, evidence planning |
| **Gatekeeper** | 4 | Reviewer | Compliance check, refusal triggers, quality control |
| **Verifier** | 4 | Validator | Citation accuracy check (all tiers) |
| **Reporter** | 5.5 | Formatter | Report generation with Judicial Authority theme |

---

## Workflow Stages

```
┌─────────────────────────────────────────────────────────────────┐
│  Stage 0: DOCUMENT EXTRACTION                                   │
│  - Intake agent extracts text from uploaded documents           │
│  - Recognizes application intent (spousal, study, etc.)         │
│  - Produces structured ApplicantProfile JSON                    │
│  - No legal analysis - pure extraction and normalization        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 1: ORCHESTRATION                                         │
│  - AuditManager receives ApplicantProfile from Intake           │
│  - Identifies application type (spousal, study, etc.)           │
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
│  Stage 5: JUDGMENT                                              │
│  - AuditManager reviews all findings                            │
│  - Assigns Defensibility Score (0-100)                          │
│  - Makes verdict: GO / CAUTION / NO-GO                          │
│  - Packages AuditJudgment struct                                │
│  - If verification failed: Include INCOMPLETE warning           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage 5.5: REPORT GENERATION                                   │
│  - Reporter receives AuditJudgment from AuditManager            │
│  - Selects tier-based template (Guest/Pro/Ultra)                │
│  - Synthesizes all agent outputs into cohesive narrative        │
│  - Applies Judicial Authority theme (Navy/Gold/Paper)           │
│  - Generates Markdown + PDF output                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Delegation Rules

### Intake MUST:
- Extract ALL text from uploaded documents using file_content_extract
- Recognize application intent from document types and content
- Produce structured ApplicantProfile with normalized fields
- NEVER perform legal analysis - pure data extraction only
- Pass ApplicantProfile to AuditManager

### AuditManager MUST:
- Receive ApplicantProfile from Intake (never extract directly)
- Use Detective for ALL legal research (never hallucinate case law)
- Use Strategist for argument construction
- Use Gatekeeper for compliance validation
- Use Verifier for citation checks (all tiers, mandatory)
- Track verification iterations and enforce tier limits
- Handle INCOMPLETE reports when verification fails after max retries
- Make final judgment (score, verdict) BEFORE delegating to Reporter
- Delegate to Reporter for report formatting (never format reports directly)

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

### Reporter MUST:
- Receive AuditJudgment struct from AuditManager (never compute scores/verdicts)
- Apply Judicial Authority theme consistently
- Use tier-appropriate template (Guest/Pro/Ultra depth)
- Include all required sections: Disclaimer, Summary, Score, Evidence, Recommendations
- Output Markdown AND PDF to case directory
- Never modify the judgment - presentation only

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
