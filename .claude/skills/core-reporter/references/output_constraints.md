# Output Constraints

Tier-based length limits and content priority rules for report generation.

## Length Limits by Tier

| Tier | Max Lines | Target Audience | Depth |
|------|-----------|-----------------|-------|
| **Guest** | 400 | DIY applicants | Actionable guidance |
| **Pro** | 500 | RCICs | Technical details |
| **Ultra** | 600 | Lawyers | Full legal analysis |

## Length Enforcement Process

**BEFORE outputting final report:**

1. Count total lines
2. Compare against tier budget
3. If over budget: Compress by removing redundancy
4. If still over: Move details to "Full analysis available on request"

## Section Priority (What to Cut First)

When over budget, cut in this order:

1. Legal Framework details (keep summary only)
2. Detailed evidence lists (keep summary only)
3. Risk matrix prose (keep table only)
4. Verification details (keep status only)
5. Extended recommendations (keep top 3)

## NEVER CUT

These sections must always be included regardless of length:

- Verdict + Score
- Poison Pills (the core value proposition)
- Top 3 Action Items
- Disclaimer

## Tier-Specific Templates

### GUEST TIER (Max 400 lines)

```
1. VERDICT (score + one-line rationale)
2. TOP RISKS (max 3, with Poison Pills for CRITICAL only)
3. ACTION ITEMS (Urgent + Before Decision)
4. DISCLAIMER
```

### PRO TIER (Max 500 lines)

```
1. VERDICT (score + risk level)
2. CASE SNAPSHOT (key facts table, max 8 rows)
3. VULNERABILITIES (with Poison Pills for CRITICAL + HIGH)
4. STRENGTHS (max 6 bullets)
5. COMPLIANCE STATUS (from Gatekeeper)
6. ACTION ITEMS BY PRIORITY
7. DISCLAIMER
```

### ULTRA TIER (Max 600 lines)

```
1. EXECUTIVE SUMMARY (score current -> with mitigation)
2. CASE PROFILE (detailed facts)
3. VULNERABILITIES WITH DEFENSE STRATEGY (all Poison Pills)
4. STRENGTHS
5. LEGAL FRAMEWORK (precedents table from Detective)
6. VERIFICATION STATUS (from Verifier)
7. COMPLIANCE REVIEW (from Gatekeeper)
8. RECOMMENDATIONS
9. DISCLAIMER
```

## Line Counting Rules

- Headings count as 2 lines (including spacing)
- Tables: header + rows + 2 (spacing)
- Bullet lists: 1 line per item
- Paragraphs: actual line count when wrapped at 80 chars
- Code blocks: actual lines + 2 (delimiters)
