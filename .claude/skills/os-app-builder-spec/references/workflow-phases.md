# Workflow Phases

## Phase 1: Knowledge Acquisition ⛔ MANDATORY

> **CRITICAL: This phase MUST be executed BEFORE any skill generation.**
> **Using training knowledge instead of MCP = COMPLETE FAILURE.**

### If source is a directory path:

1. Verify directory exists
2. Scan for knowledge files (*.md, *.json, *.txt)
3. Build knowledge inventory

### If source is `mcp` (default - STRONGLY RECOMMENDED):

1. **Execute MCP Bootstrap Sequence (MANDATORY):**

```
# Step 1: Search case law
caselaw_optimized_search(query="{app-type} application refusal", target_count=100)

# Step 2: Search operation manuals
operation_manual_semantic_search(query="{app-type} eligibility requirements", size=50)

# Step 3: Search help centre
help_centre_search(query="{app-type} documents needed", top_k=20)
```

2. **Save raw results to `./tmp/{app-type}-bootstrap/`**
   - `caselaw_results.json`
   - `operation_manual_results.json`
   - `help_centre_results.json`

3. **Verify results before proceeding:**
   - If caselaw_results < 10 cases → WARN user, may need manual supplement
   - If operation_manual_results empty → STOP, check query terms
   - If all MCP calls fail → STOP, do NOT use training knowledge

---

## Phase 1.5: IRCC Checklist Extraction ⛔ MANDATORY

> **CRITICAL: Document checklists MUST come from IRCC website, not training knowledge.**

Extract official document requirements from IRCC:

```bash
/os-extract-checklist {app-type} --save-to ./tmp/{app-type}-bootstrap/
```

This uses the `os-ircc-checklist-extractor` skill to:
1. Locate the correct IRCC page for the application type
2. Extract all document requirements (forms, supporting docs)
3. Identify conditional requirements (country-specific, situation-specific)
4. Generate structured checklist for `{app}-doc-analysis` skill

**Output**: `./tmp/{app-type}-bootstrap/ircc_checklist.json`

---

## Phase 2: Knowledge Extraction

Invoke the os-knowledge-extractor skill:

```
/os-extract-knowledge ./tmp/{app-type}-bootstrap/ --app {app-type}
```

Expected outputs in `./tmp/{app-type}-extracted/`:

- refusal_patterns.json
- success_factors.json
- r_criteria.json
- assessment_factors.json
- document_requirements.json

---

## Phase 3: Skill Scaffolding

Generate 7 skill directories under `.claude/skills/{app-type}-*/`

See `skill-structure.md` for detailed templates.

---

## Phase 3.5: Landmark Cases Verification

> **CRITICAL**: Follow the case citation policy in os-design-principles.

When generating `{app-type}-immicore-mcp`, MUST verify all landmark_cases:

```bash
# 1. Get authoritative cases
kg_top_authorities(issue_code='SUB_XXX', court='FC', limit=10)

# 2. Verify each case
caselaw_authority(citation='YYYY FC XXXX')

# 3. Confirm conditions met
# - is_good_law: true
# - Prefer cited_by_count > 0
```

**caselaw_query_patterns.json Required Format**:

```json
{
  "version": "3.0",
  "_landmark_cases_policy": {
    "policy": "Only list KG-verified FC/FCA authoritative cases",
    "verification_method": "caselaw_authority(citation)",
    "last_verified": "YYYY-MM-DD"
  },
  "{app-type}_specific_queries": {
    "category_name": {
      "queries": [
        {
          "id": "query_id",
          "label": "Query label",
          "landmark_cases": ["Case v Canada, YYYY FC XXXX"],
          "_authority_verified": {
            "YYYY FC XXXX": {"cited_by": N, "is_good_law": true}
          },
          "_dynamic_lookup": "kg_top_authorities(issue_code='XXX', court='FC')"
        }
      ]
    }
  }
}
```

**Forbidden**:
- Including IAD/IRB (CanLII) cases in landmark_cases
- Unverified case citations
- Copying landmark_cases from other apps

---

## Phase 4: Validation

Invoke os-compliance-checker:

```
/os-check {app-type}
```

See `validation-rules.md` for detailed criteria.

---

## Phase 5: Registration

See `registration-steps.md` for detailed steps.
