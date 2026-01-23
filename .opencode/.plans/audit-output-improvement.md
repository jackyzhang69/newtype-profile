# Audit Output Improvement Plan

**Created:** 2026-01-19
**Status:** COMPLETED
**Branch:** dev
**Completed:** 2026-01-19

## Problem Summary

| Issue | Current State | Target State |
|-------|---------------|--------------|
| **Report Length** | 2117 lines / 50 pages (Tian) | 400-600 lines / 5-20 pages |
| **Poison Pill Defense** | Missing | Every CRITICAL/HIGH risk gets copy-paste defense |
| **Tier-based Format** | Not differentiated | Guest: actionable, Pro: technical, Ultra: citations |
| **Length Controls** | None | Per-section max lines + total budget |

## Root Cause Analysis

1. **No output length constraints** in agent prompts
2. **AuditManager concatenates** agent outputs instead of synthesizing
3. **Missing "Poison Pill" format** from Strategist output
4. **No tier-based differentiation** in final report format

## Solution Design

### Tier-Based Output Constraints

| Tier | Max Lines | Poison Pills | Citations |
|------|-----------|--------------|-----------|
| Guest | 300-400 | CRITICAL only | None |
| Pro | 400-500 | CRITICAL + HIGH | Max 5 (no inline) |
| Ultra | 500-600 | All severities | Max 10 (table) |

### Per-Agent Output Limits

| Agent | Max Lines | Key Sections |
|-------|-----------|--------------|
| Detective | 150 | Precedents table + Risk flags |
| Strategist | 250 | Score + Vulnerabilities with Poison Pills |
| Gatekeeper | 100 | PASS/FAIL + Required fixes |
| Verifier | 50 | Summary table |
| AuditManager | 500 | Synthesized final report |

### Poison Pill Format (Strategist Output)

```markdown
### VULNERABILITY #X: [Title] - [SEVERITY]

**The Problem:** [1-2 sentences]
**Officer's Question:** "[Direct quote]"
**Defense (Copy & Paste):**
> "[Complete paragraph with case citation]"
**Evidence:** [Bullet list]
```

## Implementation Phases

### Phase 1: Tier Config Updates
- [x] Add `TierOutputConstraints` to types.ts
- [x] Add output constraints to each tier in config.ts

### Phase 2: Strategist Poison Pill
- [x] Add `<Poison_Pill_Format>` section to prompt
- [x] Add `<Output_Constraints>` with length limits
- [x] Reference tier's `poisonPillThreshold`

### Phase 3: Detective Length Constraints
- [x] Add `<Output_Constraints>` section
- [x] Enforce table format for precedents
- [x] Limit to key findings only

### Phase 4: Gatekeeper Length Constraints
- [x] Add `<Output_Constraints>` section
- [x] PASS/FAIL format only
- [x] Brief bullet list for fixes

### Phase 5: AuditManager Synthesis Rules
- [x] Add tier-based `<Output_Format_By_Tier>` section
- [x] Add `<Synthesis_Rules>` for report compilation
- [x] Remove concatenation, enforce synthesis

### Phase 6: Client Report Template
- [x] Create `client_report_template.md` in audit-report-output skill
- [x] Define section structure with length targets

### Phase 7: Skill Injection Update
- [x] Add audit-report-output to injection profile
- [x] Inject to audit-manager agent

## Files to Modify

| File | Phase | Changes |
|------|-------|---------|
| `src/audit-core/tiers/types.ts` | 1 | Add TierOutputConstraints interface |
| `src/audit-core/tiers/config.ts` | 1 | Add outputConstraints to each tier |
| `src/audit-core/agents/strategist.ts` | 2 | Add Poison Pill format + constraints |
| `src/audit-core/agents/detective.ts` | 3 | Add output constraints |
| `src/audit-core/agents/gatekeeper.ts` | 4 | Add output constraints |
| `src/audit-core/agents/audit-manager.ts` | 5 | Add synthesis rules + tier formats |
| `.claude/skills/audit-report-output/references/client_report_template.md` | 6 | Create new file |
| `.claude/skills/spousal-knowledge-injection/references/injection_profile.json` | 7 | Add audit-report-output skill |

## Success Criteria

1. **Tian case re-audit** produces < 600 lines
2. **Vicky case re-audit** stays similar (~400 lines)
3. **All CRITICAL/HIGH risks** have Poison Pills
4. **Guest tier** is actionable without legal jargon
5. **Ultra tier** includes citation tables

## Testing Plan

1. Run `bun run typecheck` - must pass
2. Run `bun test` - must pass
3. Re-audit Tian case with Ultra tier
4. Compare output length and structure

## Rollback Plan

If issues arise:
1. Revert agent prompt changes
2. Keep tier config changes (non-breaking)
3. Investigate specific agent causing issues
