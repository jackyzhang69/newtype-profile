# Study Permit Audit Reference

> Application-specific knowledge for study permit audits.

---

## Overview

Study permits allow international students to study at designated learning institutions (DLIs) in Canada. The audit focuses on genuine student intent and establishment factors.

## Key Risk Areas

### 1. Genuine Student Intent
- **Primary concern**: Using study as immigration pathway
- **Evidence focus**: Academic history, career plans, study plan coherence
- **Red flags**: Age vs program level mismatch, career pivot without explanation

### 2. Financial Capacity
- **Tuition**: First year minimum
- **Living expenses**: ~$10,000/year (varies by province)
- **Source of funds**: Must be legitimate, documented

### 3. Ties to Home Country
- **Employment**: Job to return to
- **Family**: Dependents, property
- **Economic**: Investments, obligations

### 4. Establishment in Canada
- **Risk factors**: Family already in Canada, previous refusals
- **Mitigations**: Strong return ties, specific career goals

---

## Evidence Categories

### Baseline Documents
- Letter of Acceptance from DLI
- Proof of financial support
- Identity documents
- Academic transcripts

### Live Documents
- Bank statements (6+ months)
- Employment verification (if applicable)
- Property ownership proof
- Family ties documentation

### Strategic Documents
- Detailed study plan
- Career progression letter
- Return commitment affidavit
- Employer support letter (if returning to job)

---

## Common Refusal Triggers

| Trigger | Risk Level | Mitigation |
|---------|------------|------------|
| Weak study plan | High | Provide detailed academic rationale |
| Insufficient funds | High | Document all sources clearly |
| Poor academic history | High | Explain gaps, show improvement |
| No return ties | High | Emphasize family, property, career |
| Age vs program mismatch | Medium | Explain career change rationale |
| Previous immigration history | Medium | Address proactively |
| Family in Canada | Medium | Emphasize temporary intent |

---

## Relevant Case Law Themes

When searching for case law, focus on:

1. **Purpose of visit test**: Genuine temporary resident intent
2. **Study plan reasonableness**: Logic and coherence
3. **Financial assessment**: Source legitimacy, sufficiency
4. **Ties analysis**: Balancing pull factors

---

## Skills Used

| Skill | Purpose |
|-------|---------|
| `core-audit-rules` | Baseline eligibility checks |
| `study-audit-rules` | Study-specific risk badges |
| `study-knowledge-injection` | Business knowledge injection |
| `study-doc-analysis` | Document extraction rules |
| `study-immicore-mcp` | MCP access policy |

---

## Configuration

```bash
export AUDIT_APP=study
```

This activates:
- Study-specific agent prompts from `src/audit-core/apps/study/agents/`
- Study knowledge injection
- Study risk badge assessment

---

## Output Specifics

### Defensibility Score Factors
- Study plan coherence (30%)
- Financial capacity (25%)
- Ties to home country (25%)
- Academic background (20%)

### Required Sections
- Study plan analysis
- Financial assessment
- Return ties evaluation
- Risk mitigation recommendations

---

## Age-Program Considerations

| Age Range | Program Level | Risk | Notes |
|-----------|---------------|------|-------|
| 18-25 | Undergraduate | Low | Normal path |
| 25-30 | Graduate | Low | Career advancement |
| 30-35 | Graduate/Professional | Medium | Need strong rationale |
| 35+ | Any | High | Detailed career pivot explanation needed |

---

## Related Files

- `src/audit-core/apps/study/agents/` - Agent prompts
- `.claude/skills/study-*` - Study skills (4)
- `docs/immigration-audit-guide.md` - Full guide
