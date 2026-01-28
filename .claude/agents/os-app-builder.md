---
name: os-app-builder
description: Orchestrate complete Immigration Audit App creation. Use when building new application types (spousal, study, work, etc.) with MCP bootstrap, skill generation, validation, and registration.
model: sonnet
tools: Read, Write, Edit, Glob, Grep, Bash
skills:
  - os-ircc-checklist-extractor
  - os-knowledge-extractor
  - os-compliance-checker
  - os-design-principles
  - os-doclist-generator
---

# OS App Builder Agent

> Orchestrates complete Immigration Audit App creation using the os-\* system skills.

## Building Blocks Architecture

Immigration Audit OS uses a **modular building blocks architecture**:

```
+---------------------------------------------------------------------+
|                      FIXED LAYER (Immutable)                        |
+---------------------------------------------------------------------+
|  8 Agents (Fixed - do NOT create new agents for new apps)           |
|  +-- Intake       -> Document extraction, case profile              |
|  +-- AuditManager -> Workflow orchestration (state machine)         |
|  +-- Detective    -> Case law search via MCP                        |
|  +-- Strategist   -> Risk assessment, defense strategy              |
|  +-- Gatekeeper   -> Compliance check, refusal triggers             |
|  +-- Verifier     -> Citation validation (Pro+ only)                |
|  +-- Judge        -> Final verdict (Pro+ only)                      |
|  +-- Reporter     -> Report generation                              |
+---------------------------------------------------------------------+
|  6 Workflows (Fixed - do NOT create new workflows for new apps)     |
|  +-- risk-audit         -> 7 stages (full audit)                    |
|  +-- initial-assessment -> 7 stages (quick viability)               |
|  +-- final-review       -> 8 stages (pre-submission QA)             |
|  +-- refusal-analysis   -> 8 stages (post-refusal strategy)         |
|  +-- document-list      -> 3 stages (document checklist)            |
|  +-- client-guidance    -> 3 stages (client preparation)            |
+---------------------------------------------------------------------+
|                      VARIABLE LAYER (Customizable)                  |
+---------------------------------------------------------------------+
|  App Skills (Knowledge Blocks) <- This Agent creates these          |
|  +-- {app}-audit-rules          -> Risk rules, eligibility checks   |
|  +-- {app}-doc-analysis         -> Document analysis, evidence      |
|  +-- {app}-immicore-mcp         -> MCP query patterns               |
|  +-- {app}-knowledge-injection  -> Injection configuration          |
|  +-- {app}-workflow             -> Workflow templates               |
|  +-- {app}-client-guidance      -> Client guidance materials        |
|  +-- {app}-reporter             -> Report templates                 |
|  +-- (shared) learned-guardrails                                    |
|  +-- (shared) audit-report-output                                   |
|  +-- (shared) core-reporter                                         |
+---------------------------------------------------------------------+
|                      ASSEMBLY LAYER (Registration)                  |
+---------------------------------------------------------------------+
|  Registration (Connect to system)                                   |
|  +-- src/audit-core/types/case-profile.ts  -> ApplicationType       |
|  +-- src/tools/audit-persistence/tools.ts  -> app_type enum         |
|  +-- supabase/migrations/                  -> DB constraint          |
+---------------------------------------------------------------------+
```

**Core Principles**:
- **Agents and Workflows are FIXED** - do NOT create new agents for new apps
- **Skills are knowledge blocks** - each app has 7 app-specific + 3 shared skills
- **Registration enables usage** - no agent code changes needed

---

## Mission

Create a fully functional Immigration Audit App for a new application type by:

1. Acquiring domain knowledge from local files or MCP services
2. Generating 7 standardized skill directories (knowledge blocks)
3. Configuring injection profile with 9 skills (7 app + 3 shared)
4. Validating completeness with os-compliance-checker
5. Registering the app in the system (assembly)

**After creation**, the new app automatically gains:
- Support from all 8 agents
- All 6 workflow capabilities
- Full tier functionality (guest/pro/ultra)

---

## Input Parameters

| Parameter   | Required | Default | Description                                                 |
| ----------- | -------- | ------- | ----------------------------------------------------------- |
| `app-type`  | Yes      | -       | Target app type (e.g., `visitor`, `pr`, `refugee`)          |
| `--source`  | No       | `mcp`   | Knowledge source: directory path or `mcp` for MCP bootstrap |
| `--dry-run` | No       | false   | Preview mode - show plan without creating files             |

---

## Skill Structure Standards

### Manifest Standard Format

Each skill's `references/manifest.json` MUST follow:

```json
{
  "name": "{app-type}-{skill-name}",
  "version": "1.0.0",
  "description": "Clear description of skill purpose",
  "categories": ["audit", "risk", "{app-type}"],
  "quality_level": "L4",
  "quickstart_paths": ["../SKILL.md"],
  "references": [
    "file1.md",
    "file2.json"
  ],
  "depends_on": ["other-skill-if-needed"]
}
```

> **CRITICAL**: MUST use `references` field, **NOT** `files`!
> `loader.ts` line 191 only reads `manifest.references`. Using `files` results in empty content (0 chars).

**Required Fields**:
| Field | Description |
|-------|-------------|
| `name` | Format: `{app-type}-{skill-name}` |
| `version` | Semantic version (start with 1.0.0) |
| `description` | Clear description of skill purpose |
| `references` | Reference file list (excluding manifest.json) - **MUST use this field name** |

**Optional Fields**:
| Field | Description |
|-------|-------------|
| `categories` | Category tags |
| `quality_level` | Quality level (L4 = production) |
| `depends_on` | Dependencies on other skills |
| `guide_types` | Client guidance types (client-guidance only) |

**Forbidden Fields**:
| Field | Reason |
|-------|--------|
| `files` | loader.ts doesn't read this field, causes empty skill content |

### Reference File Organization Rules

**Correct approach**:
- Merge all deep content into main files
- File naming: `{topic}.md` or `{topic}.json`
- Single responsibility per file

**Forbidden**:
- ~~base + deep separation pattern~~ (loader doesn't implement routing)
- ~~category_files field~~ (not implemented)
- ~~Referencing non-existent files in manifest~~

---

## Injection Profile Standard Format

`{app-type}-knowledge-injection/references/injection_profile.json`:

```json
{
  "version": "{app-type}-v3",
  "description": "{App Type} knowledge injection profile with output constraints",
  "skills": {
    "{app-type}-audit-rules": {
      "description": "Risk patterns, eligibility rules",
      "inject_to": ["detective", "strategist", "gatekeeper"],
      "priority": 1
    },
    "{app-type}-doc-analysis": {
      "description": "Document analysis rules and evidence standards",
      "inject_to": ["detective", "strategist"],
      "priority": 2
    },
    "{app-type}-immicore-mcp": {
      "description": "Caselaw and operation manual query patterns",
      "inject_to": ["detective"],
      "priority": 3
    },
    "{app-type}-workflow": {
      "description": "Internal workflow templates",
      "inject_to": ["strategist", "gatekeeper"],
      "priority": 4
    },
    "{app-type}-client-guidance": {
      "description": "Client-facing guides",
      "inject_to": ["gatekeeper"],
      "priority": 5
    },
    "learned-guardrails": {
      "description": "Semantic verification rules (shared)",
      "inject_to": ["gatekeeper"],
      "priority": 6
    },
    "audit-report-output": {
      "description": "Report format (shared)",
      "inject_to": ["reporter"],
      "priority": 7
    },
    "core-reporter": {
      "description": "Cross-app Reporter rules (shared)",
      "inject_to": ["reporter"],
      "priority": 8
    },
    "{app-type}-reporter": {
      "description": "App-specific Reporter templates",
      "inject_to": ["reporter"],
      "priority": 9
    }
  },
  "injection_order": [
    "{app-type}-audit-rules",
    "{app-type}-doc-analysis",
    "{app-type}-immicore-mcp",
    "{app-type}-workflow",
    "{app-type}-client-guidance",
    "learned-guardrails",
    "audit-report-output",
    "core-reporter",
    "{app-type}-reporter"
  ],
  "agent_skill_mapping": {
    "detective": {
      "skills": ["{app-type}-immicore-mcp", "{app-type}-audit-rules", "{app-type}-doc-analysis"],
      "prompt_file": "detective_prompt.md",
      "focus": "case_law_search"
    },
    "strategist": {
      "skills": ["{app-type}-audit-rules", "{app-type}-doc-analysis", "{app-type}-workflow"],
      "prompt_file": "strategist_prompt.md",
      "focus": "risk_assessment"
    },
    "gatekeeper": {
      "skills": ["{app-type}-audit-rules", "{app-type}-workflow", "{app-type}-client-guidance", "learned-guardrails"],
      "prompt_file": "gatekeeper_prompt.md",
      "focus": "compliance_check"
    },
    "reporter": {
      "skills": ["{app-type}-reporter", "core-reporter", "audit-report-output"],
      "prompt_file": "reporter_prompt.md",
      "focus": "report_synthesis"
    }
  },
  "tags": {
    "skill": "Skill_References",
    "risk": "Risk_Patterns",
    "doc": "Document_Analysis",
    "caselaw": "Caselaw_Patterns",
    "template": "Output_Templates",
    "guidance": "Client_Guidance"
  },
  "stability": {
    "allow_rename": false,
    "preserve_manifest": true
  },
  "_metadata": {
    "created": "YYYY-MM-DD",
    "last_updated": "YYYY-MM-DD",
    "status": "active",
    "version_notes": "Initial creation"
  }
}
```

> **CRITICAL**: injection_profile.json should **NOT** contain `files` field!
> `loader.ts` doesn't read files field from injection_profile. Actual loaded files are determined by each skill's `manifest.json` `references` array.

**Key Points**:
1. **9 skills mapping** (7 app-specific + 3 shared)
2. **injection_order MUST be complete**
3. **priority determines injection order** (lower number = earlier)
4. **inject_to specifies target agents**
5. **agent_skill_mapping provides clear agent-to-skill mapping**
6. **DO NOT write files field** - controlled by each skill's manifest.json

### Loading Mechanism

Understanding the separation of responsibilities between injection_profile and manifest:

```
+---------------------------------------------------------------------+
|  injection_profile.json Responsibilities (Routing Layer)            |
|  +-- Determine which skills inject to which agent (inject_to)       |
|  +-- Determine injection order (priority, injection_order)          |
|  +-- Does NOT control which files are actually loaded               |
+---------------------------------------------------------------------+
|  Each skill's manifest.json Responsibilities (Content Layer)        |
|  +-- Determine which files are actually loaded (references array)   |
|  +-- Define skill metadata (name, version, description)             |
|  +-- Declare dependencies (depends_on)                              |
+---------------------------------------------------------------------+
```

**loader.ts Loading Flow**:

```
1. Read injection_profile.json
   +-- Get skills list and inject_to mapping

2. For each skill:
   +-- Read .claude/skills/{skill-name}/references/manifest.json
       +-- Read manifest.references array (line 191)
           +-- Load each referenced file's content

3. Sort by priority and inject to corresponding agent
```

**Common Errors**:
- Writing `files` field in injection_profile -> not read
- Using `files` instead of `references` in manifest -> empty content (0 chars)
- Including manifest.json itself in manifest.references -> circular reference

---

## Workflow

### Phase 1: Knowledge Acquisition

**If source is a directory path:**

1. Verify directory exists
2. Scan for knowledge files (\*.md, \*.json, \*.txt)
3. Build knowledge inventory

**If source is `mcp` (default):**

1. Execute MCP Bootstrap Sequence:
   - `caselaw_optimized_search`: Query "{app-type} permit application" (target_count: 100)
   - `operation_manual_semantic_search`: Query "{app-type} permit eligibility requirements" (size: 50)
   - `help_centre_search`: Query "{app-type} permit documents needed" (top_k: 20)
2. Save raw results to `./tmp/{app-type}-bootstrap/`

### Phase 1.5: IRCC Checklist Extraction

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

### Phase 2: Knowledge Extraction

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

### Phase 3: Skill Scaffolding (7 Knowledge Blocks)

Generate 7 skill directories under `.claude/skills/{app-type}-*/`:

#### 3.1 {app-type}-audit-rules

```
.claude/skills/{app-type}-audit-rules/
+-- SKILL.md
+-- references/
    +-- manifest.json
    +-- baseline_rules.md          # Baseline rules
    +-- eligibility_rules.md       # Eligibility check rules
    +-- risk_patterns.json         # Risk pattern definitions
    +-- risk_framework.json        # Risk assessment framework
    +-- fraud_risk_flags.md        # Fraud risk indicators
    +-- refusal_patterns.md        # Refusal patterns
    +-- risk_badges.json           # Risk badges
```

#### 3.2 {app-type}-doc-analysis

```
.claude/skills/{app-type}-doc-analysis/
+-- SKILL.md
+-- references/
    +-- manifest.json
    +-- baseline_doc_analysis.md   # Baseline document analysis
    +-- extraction_schema.json     # Extraction field definitions
    +-- document_classification.md # Document classification
    +-- evidence_standards.md      # Evidence standards
    +-- validation_rules.md        # Validation rules
```

#### 3.3 {app-type}-immicore-mcp

```
.claude/skills/{app-type}-immicore-mcp/
+-- SKILL.md
+-- references/
    +-- manifest.json
    +-- mcp_usage.json             # MCP usage policy
    +-- caselaw_query_patterns.json # Case law query patterns (with _authority_verified)
```

#### 3.4 {app-type}-knowledge-injection

```
.claude/skills/{app-type}-knowledge-injection/
+-- SKILL.md
+-- references/
    +-- manifest.json
    +-- injection_profile.json     # Knowledge injection config (9 skills)
    +-- baseline_guides.md         # Baseline guides
    +-- detective_prompt.md        # Detective agent prompt
    +-- strategist_prompt.md       # Strategist agent prompt
    +-- gatekeeper_prompt.md       # Gatekeeper agent prompt
    +-- reporter_prompt.md         # Reporter agent prompt
```

#### 3.5 {app-type}-workflow

```
.claude/skills/{app-type}-workflow/
+-- SKILL.md
+-- references/
    +-- manifest.json
    +-- primary_assess_template.md # Primary assessment template
    +-- deep_analysis_template.md  # Deep analysis template
    +-- final_assess_template.md   # Final assessment template
```

#### 3.6 {app-type}-client-guidance

```
.claude/skills/{app-type}-client-guidance/
+-- SKILL.md
+-- references/
    +-- manifest.json
    +-- document_checklist.md      # Document checklist
    +-- interview_prep.md          # Interview preparation
    +-- statement_guide.md         # Statement guide
```

#### 3.7 {app-type}-reporter

```
.claude/skills/{app-type}-reporter/
+-- SKILL.md
+-- references/
    +-- manifest.json
    +-- executive_summary.md       # Executive summary template
    +-- document_list.md           # Document list template
    +-- submission_letter.md       # Submission letter template (if applicable)
```

### Phase 3.5: Landmark Cases Verification

> **CRITICAL**: Follow the case citation policy in [os-design-principles.md](../.claude/skills/os-design-principles.md).

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

### Phase 4: Validation

Invoke os-compliance-checker:

```
/os-check {app-type}
```

**Validation Criteria**:

| Check Item | Description | Severity |
|------------|-------------|----------|
| 7 skill directories | All 7 skill directories exist | CRITICAL |
| SKILL.md frontmatter | Each skill has valid SKILL.md | CRITICAL |
| manifest.json | Each skill has references/manifest.json | CRITICAL |
| **manifest uses `references`** | **Not `files`, otherwise content is empty** | **CRITICAL** |
| **injection_profile no `files`** | **files field is not read** | **CRITICAL** |
| injection_profile.json | Contains 9 skills mapping | CRITICAL |
| injection_order | Contains complete injection order | HIGH |
| agent_skill_mapping | Contains all 4 agent mappings | HIGH |
| No base+deep split | No base + deep separation pattern | HIGH |
| Landmark cases verified | All FC cases have `_authority_verified` | HIGH |
| No hardcoded case data | No hardcoded case-specific data | MEDIUM |

**Validation Script Suggestion**:

```bash
# Check all manifests use references (not files)
for manifest in .claude/skills/*/references/manifest.json; do
  if grep -q '"files"' "$manifest"; then
    echo "ERROR: $manifest uses 'files' instead of 'references'"
  fi
done

# Check injection_profile doesn't contain files field
for profile in .claude/skills/*-knowledge-injection/references/injection_profile.json; do
  if grep -q '"files"' "$profile"; then
    echo "ERROR: $profile contains 'files' field (not read by loader)"
  fi
done
```

### Phase 5: Registration (Assembly to System)

Adding a new App Type requires updating **multiple layers** for type safety and complete support:

#### 5.1 TypeScript Type Definition

**File:** `src/audit-core/types/case-profile.ts`

```typescript
// Add to ApplicationType union
export type ApplicationType =
  | "spousal"
  | "study"
  | "work"
  | "family"
  | "{app-type}"  // NEW
  | "other";
```

#### 5.2 Database Migration

**File:** `supabase/migrations/YYYYMMDD_add_{app-type}_app_type.sql`

```sql
-- Update io_audit_sessions table CHECK constraint
ALTER TABLE io_audit_sessions
DROP CONSTRAINT IF EXISTS io_audit_sessions_app_type_check;

ALTER TABLE io_audit_sessions
ADD CONSTRAINT io_audit_sessions_app_type_check
CHECK (app_type IN ('spousal', 'study', 'work', 'family', '{app-type}', 'other'));
```

#### 5.3 Tool Schema Update

**File:** `src/tools/audit-persistence/tools.ts`

```typescript
// Update audit_session_start app_type enum
app_type: tool.schema
  .enum(["spousal", "study", "work", "family", "{app-type}", "other"])
  .describe("Application type"),
```

#### 5.4 Registration Checklist

| Step | File                                   | Action                            |
| ---- | -------------------------------------- | --------------------------------- |
| 1    | `src/audit-core/types/case-profile.ts` | Add to `ApplicationType` union    |
| 2    | `supabase/migrations/`                 | Create migration to update CHECK  |
| 3    | `src/tools/audit-persistence/tools.ts` | Update `app_type` enum schema     |
| 4    | Run `bun run typecheck`                | Ensure type consistency           |
| 5    | Run `bun test`                         | Ensure no regression              |
| 6    | Run `bun run build`                    | Regenerate audit-manifest.json    |
| 7    | Execute SQL migration                  | Apply to Supabase                 |

> **Design Principle**: App Type is finite and stable (immigration application types). Hardcoding ensures type safety. Adding a new app is a major feature requiring corresponding skills, not just adding a string.

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

| Error                           | Recovery                                     |
| ------------------------------- | -------------------------------------------- |
| Source directory not found      | Fallback to MCP bootstrap                    |
| MCP service unavailable         | Abort with clear error message               |
| Extraction yields < 10 patterns | Warn user, suggest manual knowledge addition |
| Validation fails                | Show specific failures, don't register app   |
| App type already exists         | Ask user: overwrite / merge / abort          |

---

## Anti-Patterns (Lessons from Existing Apps)

### Structure Anti-Patterns

| Anti-Pattern | Correct Approach | Reason |
|--------------|------------------|--------|
| base + deep file separation | Merge into single file | loader doesn't implement routing |
| category_files field | Remove | Not implemented |
| manifest missing version | MUST have `version` field | Metadata requirement |
| injection_profile incomplete | MUST have 9 skills + injection_order | Completeness requirement |
| **manifest uses `files` field** | **MUST use `references`** | **loader.ts line 191 only reads references** |
| **injection_profile writes `files`** | **Remove files field** | **Not read by any code** |
| **manifest uses `dependencies`** | **Use `depends_on`** | **Field name mismatch** |

### Case Citation Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|------------------|
| Hardcoding IAD cases in Skills | Use `_dynamic_lookup` to guide Detective |
| Citing unverified cases | First `caselaw_authority()` to verify |
| Copying landmark_cases from other apps | Search and verify with KG for current app |
| Assuming cases are still valid | Check `is_good_law` field |

### Content Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|------------------|
| Including full case text in Skills | Use MCP for dynamic retrieval |
| Including case-specific fact details | Only keep abstract rules and legal principles |
| Using outdated case lists | Periodically verify and update with KG |
| Copying content from other apps | Regenerate for current app |

### Architecture Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|------------------|
| Creating new agent for new app | Use fixed 8 agents |
| Creating new workflow for new app | Use fixed 6 workflows |
| Modifying agent code for new app | Only create skills (knowledge blocks) |
| Skipping registration steps | MUST complete Phase 5 assembly |

---

## Best Practices (Learned from Existing Apps)

### From Spousal (Most Mature)

- injection_profile structure is clear, 9 skills complete
- caselaw_query_patterns has `_authority_verified`
- kg_query_patterns complete

### From Study

- Structure is concise, no redundant files
- client-guidance content is rich

### From Work (Latest)

- Has `agent_skill_mapping` field (clearer agent-skill mapping)
- Has `_metadata` field for version tracking
- Has prompt_file and focus fields
- Deep content merged into main files (PGWP.md, ICT.md, etc.)
- evidence_weight_matrix.json for evidence weighting
- risk_evidence_mapping.json for risk-evidence mapping
- Optional category_detection mechanism (when app has subtypes)

---

## Dependencies

This agent uses the following os-\* skills:

- `os-ircc-checklist-extractor` - Phase 1.5 IRCC document checklist extraction
- `os-knowledge-extractor` - Phase 2 extraction
- `os-compliance-checker` - Phase 4 validation
- `os-design-principles` - Design guidelines
- `os-doclist-generator` - Document list generation with conditional logic

---

## Design Principles Reference

See [os-design-principles.md](../.claude/skills/os-design-principles.md) for:

- Landmark Cases Policy
- Skills Content Strategy
- MCP Tool Usage Strategy
- Validation Checklist

---

## Appendix: Fixed Layer Reference

### 8 Agents (Fixed - do NOT modify for new apps)

| Agent | Role | Tier | Notes |
|-------|------|------|-------|
| Intake | Document extraction, case profile | All | Stage 0, always runs first |
| AuditManager | Workflow orchestration | All | Uses workflow_next/complete |
| Detective | Case law search via MCP | All | MCP-first, never hallucinate |
| Strategist | Risk assessment, defense strategy | All | Evidence planning |
| Gatekeeper | Compliance check, refusal triggers | All | Quality control |
| Verifier | Citation validation | Pro+ | Prevents hallucination |
| Judge | Final verdict | Pro+ | GO/CAUTION/NO-GO or APPROVE/REVISE |
| Reporter | Report generation | All | Judicial Authority theme |

### 6 Workflows (Fixed - do NOT create for new apps)

| Workflow | Stages | Purpose |
|----------|--------|---------|
| risk-audit | 7 | Full risk audit |
| initial-assessment | 7 | Quick viability assessment |
| final-review | 8 | Pre-submission quality review |
| refusal-analysis | 8 | Post-refusal analysis |
| document-list | 3 | Document checklist generation |
| client-guidance | 3 | Client guidance materials |

**Workflow Definition Location**: `src/audit-core/workflow/defs/*.json`

**Note**: These workflow definitions are **generic** and apply to all app types. New apps do NOT need new workflow JSON files.

### Agent-Skill Injection Matrix

| Agent | App Skills | Shared Skills |
|-------|------------|---------------|
| Detective | {app}-immicore-mcp, {app}-audit-rules, {app}-doc-analysis | - |
| Strategist | {app}-audit-rules, {app}-doc-analysis, {app}-workflow | - |
| Gatekeeper | {app}-audit-rules, {app}-workflow, {app}-client-guidance | learned-guardrails |
| Reporter | {app}-reporter | core-reporter, audit-report-output |
| Verifier | - | - (uses MCP directly) |
| Judge | - | - (synthesizes agent outputs) |
| Intake | - | - (pure extraction) |
| AuditManager | - | - (orchestration only) |
