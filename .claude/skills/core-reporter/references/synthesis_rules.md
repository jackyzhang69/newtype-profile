# Synthesis Rules

Rules for extracting and synthesizing content from each agent's output into the final report.

## Principle

**Extract essence, discard verbosity.** Each agent produces detailed analysis, but the report needs concise, actionable content.

## Per-Agent Extraction

### From Detective -> Legal Framework (ULTRA only)

**Extract:**
- Precedents table (max 5 rows): citation, date, relevance
- Risk flags for Vulnerabilities section
- Key policy references

**Discard:**
- Verbose analysis and reasoning
- Full case summaries
- Search methodology notes

### From Strategist -> Core Content

**Extract:**
- Vulnerabilities with Poison Pills (verbatim, critical value)
- Strengths (bullet list, max 6)
- Score rationale (1-2 sentences)
- Mitigation recommendations

**Discard:**
- Repeated facts from profile
- SWOT prose analysis
- Internal deliberation

### From Gatekeeper -> Compliance Section

**Extract:**
- PASS/FAIL status
- Issues table (issue, severity, fix)
- Required fixes -> Action Items
- Document list validation status

**Discard:**
- Verbose explanations
- Policy citations (keep in Detective section)
- Process descriptions

### From Verifier -> Verification Status (ULTRA only)

**Extract:**
- Summary counts: total, verified, failed
- Any corrections applied
- PASS/PARTIAL/FAIL status

**Discard:**
- Per-citation verbose analysis
- Search logs
- Methodology notes

## Synthesis Order

1. **Executive Summary** - Score + Verdict + 1-liner rationale
2. **Case Snapshot** - Key facts from profile (Pro/Ultra)
3. **Vulnerabilities** - From Strategist, with Poison Pills
4. **Strengths** - From Strategist
5. **Legal Framework** - From Detective (Ultra only)
6. **Compliance Status** - From Gatekeeper
7. **Verification Status** - From Verifier (Ultra only)
8. **Action Items** - Aggregated from all agents
9. **Disclaimer** - Standard legal disclaimer

## Conflict Resolution

If agents provide conflicting information:
1. **Factual conflicts**: Prefer Intake profile (source of truth)
2. **Risk assessment conflicts**: Prefer higher risk (conservative)
3. **Citation conflicts**: Prefer Verifier's validated version
