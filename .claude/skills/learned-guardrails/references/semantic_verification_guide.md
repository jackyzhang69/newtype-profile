# Semantic Verification Guide

> **Purpose**: Detect and correct semantic confusion errors before finalizing audit conclusions.

## Overview

This guide provides rules for catching common semantic errors where similar concepts are confused. These errors are particularly dangerous because they appear logical but lead to incorrect risk assessments.

## When to Apply

Apply semantic verification when the audit conclusion contains:
- Contradiction or inconsistency flags
- Misrepresentation risk assessments
- Document vs statement discrepancies

## Active Rules

### RULE-001: Ceremony vs Marriage Confusion

**Severity**: CRITICAL

**Trigger Phrases**:
- "no ceremony", "no formal wedding", "haven't had a wedding"
- "没有婚礼", "没有举办仪式", "未举行婚礼"

**Error Pattern**:
Seeing "no ceremony" and concluding "not married" or flagging misrepresentation.

**Correct Understanding**:
- `ceremony` = wedding celebration/banquet (social event)
- `marriage` = legal union via civil registration (legal status)
- These are INDEPENDENT concepts
- Many couples legally marry first, hold ceremony later (or never)

**Verification Steps**:
1. Check IMM 0008 Section B for marriage date
2. Check if marriage certificate is submitted
3. If certificate exists with valid date → legally married
4. "No ceremony" only means no celebration, NOT unmarried

**Severity Adjustment**:
- If marriage certificate confirms legal marriage: CRITICAL → LOW
- "No ceremony" with valid certificate = normal, not misrepresentation

**Case Law Support**:
- *Brar v. Canada (MCI)*, 2014 FC 1008: Lack of ceremony doesn't indicate non-genuine marriage
- *Singh v. Canada (MCI)*, 2016 FC 1229: No negative inference from lack of wedding photos when certificate exists

---

## Verification Checklist

When reviewing audit conclusions, check for these semantic traps:

| Trigger | Question to Ask | Verification |
|---------|-----------------|--------------|
| "no ceremony" | Is there a marriage certificate? | Check IMM 0008 + certificate |
| "relationship started X, married Y" | Is the timeline actually contradictory? | Check if courtship → marriage is normal |
| "different dates in documents" | Are these actually the same event? | Distinguish relationship start vs cohabitation vs marriage |

## Output Format

When semantic verification catches an error:

```
## Semantic Verification Alert

**Rule Triggered**: RULE-001 (Ceremony vs Marriage)
**Original Conclusion**: [quote the problematic conclusion]
**Issue Detected**: Confused "no ceremony" with "no marriage"
**Evidence Check**:
- Marriage certificate: [exists/missing]
- IMM 0008 marriage date: [date or N/A]
- Certificate date matches: [yes/no]

**Corrected Assessment**:
[revised conclusion with proper understanding]

**Severity Adjustment**: [CRITICAL → LOW, etc.]
```

## Adding New Rules

When a new semantic error is discovered:

1. Document the error pattern
2. Create rule file in `rules/core/semantic/RULE-XXX-name.md`
3. Run `python scripts/sync_rules.py --sync`
4. Update this guide with the new rule summary
