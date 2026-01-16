# Spousal Sponsorship Audit Reference

> Application-specific knowledge for spousal sponsorship audits.

---

## Overview

Spousal sponsorship is a family class immigration program allowing Canadian citizens or permanent residents to sponsor their spouse, common-law partner, or conjugal partner for permanent residence.

## Key Risk Areas

### 1. Relationship Genuineness
- **Primary concern**: Marriage of convenience
- **Evidence focus**: Communication history, photos, financial intertwining
- **Red flags**: Short courtship, age gap, immigration history

### 2. Sponsor Eligibility
- **Income requirements**: No minimum for spouse class
- **Criminal inadmissibility**: Certain offences disqualify
- **Previous sponsorships**: Undertaking periods

### 3. Applicant Admissibility
- **Medical**: Excessive demand, danger to public health
- **Criminal**: Serious criminality, organized crime
- **Misrepresentation**: Material facts

---

## Evidence Categories

### Baseline Documents
- Marriage/relationship certificate
- Identity documents (passport, birth certificate)
- Immigration status proof

### Live Documents
- Communication records (WhatsApp, WeChat, email)
- Photos with metadata
- Travel history together
- Joint financial accounts

### Strategic Documents
- Affidavits from family/friends
- Property deeds
- Insurance beneficiary designations
- Relationship timeline narrative

---

## Common Refusal Triggers

| Trigger | Risk Level | Mitigation |
|---------|------------|------------|
| No cohabitation evidence | High | Address proactively |
| Limited communication history | High | Provide detailed records |
| Sponsor's previous sponsorship | Medium | Explain circumstances |
| Age gap > 10 years | Medium | Emphasize genuine connection |
| Quick marriage after meeting | Medium | Document courtship timeline |
| Immigration benefit obvious | High | Focus on relationship evidence |

---

## Relevant Case Law Themes

When searching for case law, focus on:

1. **Genuineness test**: Singh v. Canada (MCI) standard
2. **Primary purpose test**: When relationship not primarily for immigration
3. **Procedural fairness**: Interview requirements, opportunity to respond
4. **Evidence weight**: Photo/communication evidence standards

---

## Skills Used

| Skill | Purpose |
|-------|---------|
| `core-audit-rules` | Baseline eligibility checks |
| `spousal-audit-rules` | Spousal-specific risk badges |
| `spousal-knowledge-injection` | Business knowledge injection |
| `spousal-doc-analysis` | Document extraction rules |
| `spousal-immicore-mcp` | MCP access policy |

---

## Configuration

```bash
export AUDIT_APP=spousal
```

This activates:
- Spousal-specific agent prompts from `src/audit-core/apps/spousal/agents/`
- Spousal knowledge injection
- Spousal risk badge assessment

---

## Output Specifics

### Defensibility Score Factors
- Relationship evidence quality (40%)
- Sponsor eligibility (20%)
- Applicant admissibility (20%)
- Documentation completeness (20%)

### Required Sections
- Relationship timeline analysis
- Red flag assessment
- Interview preparation guidance (if applicable)
- Evidence gap identification

---

## Related Files

- `src/audit-core/apps/spousal/agents/` - Agent prompts
- `.claude/skills/spousal-*` - Spousal skills (6)
- `docs/immigration-audit-guide.md` - Full guide
