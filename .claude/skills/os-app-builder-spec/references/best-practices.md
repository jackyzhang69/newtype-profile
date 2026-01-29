# Best Practices (Learned from Existing Apps)

## From Spousal (Most Mature)

- injection_profile structure is clear, 9 skills complete
- caselaw_query_patterns has `_authority_verified`
- kg_query_patterns complete

## From Study

- Structure is concise, no redundant files
- client-guidance content is rich

## From Work (Latest)

- Has `agent_skill_mapping` field (clearer agent-skill mapping)
- Has `_metadata` field for version tracking
- Has prompt_file and focus fields
- Deep content merged into main files (PGWP.md, ICT.md, etc.)
- evidence_weight_matrix.json for evidence weighting
- risk_evidence_mapping.json for risk-evidence mapping
- Optional category_detection mechanism (when app has subtypes)

---

## Output Format

On successful completion:

```
=== os-app-builder Complete ===

Building Blocks Architecture
   Fixed Layer:  8 Agents + 6 Workflows (unchanged)
   Variable Layer: 7 Skills created for {app-type}
   Shared Skills: 3 (learned-guardrails, audit-report-output, core-reporter)
   Assembly Layer: Registered to system

App Type: {app-type}
Knowledge Source: {source}

Created Skills (Knowledge Blocks):
  [x] .claude/skills/{app-type}-audit-rules/
  [x] .claude/skills/{app-type}-doc-analysis/
  [x] .claude/skills/{app-type}-immicore-mcp/
  [x] .claude/skills/{app-type}-knowledge-injection/
  [x] .claude/skills/{app-type}-workflow/
  [x] .claude/skills/{app-type}-client-guidance/
  [x] .claude/skills/{app-type}-reporter/

Injection Profile:
  [x] 9 skills configured (7 app + 3 shared)
  [x] agent_skill_mapping complete
  [x] injection_order verified

Validation: PASSED (7/7 skills valid)

Registration (Assembly):
  [x] src/audit-core/types/case-profile.ts
  [x] src/tools/audit-persistence/tools.ts
  [x] supabase/migrations/YYYYMMDD_add_{app-type}.sql

Next Steps:
1. Review generated skills in .claude/skills/{app-type}-*/
2. Customize risk patterns in {app-type}-audit-rules
3. Update document checklist in {app-type}-client-guidance
4. Run: bun run build && bun test
5. Test with: AUDIT_APP={app-type} /audit ./test-case/
```

---

## Error Handling

> **⛔ CRITICAL: NEVER fall back to training knowledge. If external sources fail, STOP.**

| Error                           | Recovery                                     |
| ------------------------------- | -------------------------------------------- |
| Source directory not found      | Fallback to MCP bootstrap                    |
| MCP service unavailable         | **STOP. Report error. Do NOT use training knowledge.** |
| IRCC website unreachable        | **STOP. Report error. Do NOT fabricate checklist.** |
| Extraction yields < 10 patterns | Warn user, suggest manual knowledge addition |
| Validation fails                | Show specific failures, don't register app   |
| App type already exists         | Ask user: overwrite / merge / abort          |
