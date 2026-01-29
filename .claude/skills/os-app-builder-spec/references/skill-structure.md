# Skill Structure Standards

## Manifest Standard Format

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

## Required Fields

| Field | Description |
|-------|-------------|
| `name` | Format: `{app-type}-{skill-name}` |
| `version` | Semantic version (start with 1.0.0) |
| `description` | Clear description of skill purpose |
| `references` | Reference file list (excluding manifest.json) - **MUST use this field name** |

## Optional Fields

| Field | Description |
|-------|-------------|
| `categories` | Category tags |
| `quality_level` | Quality level (L4 = production) |
| `depends_on` | Dependencies on other skills |
| `guide_types` | Client guidance types (client-guidance only) |

## Forbidden Fields

| Field | Reason |
|-------|--------|
| `files` | loader.ts doesn't read this field, causes empty skill content |

## Reference File Organization Rules

**Correct approach**:
- Merge all deep content into main files
- File naming: `{topic}.md` or `{topic}.json`
- Single responsibility per file

**Forbidden**:
- ~~base + deep separation pattern~~ (loader doesn't implement routing)
- ~~category_files field~~ (not implemented)
- ~~Referencing non-existent files in manifest~~

## 7 Skill Directory Templates

### {app-type}-audit-rules

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

### {app-type}-doc-analysis

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

### {app-type}-immicore-mcp

```
.claude/skills/{app-type}-immicore-mcp/
+-- SKILL.md
+-- references/
    +-- manifest.json
    +-- mcp_usage.json             # MCP usage policy
    +-- caselaw_query_patterns.json # Case law query patterns (with _authority_verified)
```

### {app-type}-knowledge-injection

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

### {app-type}-workflow

```
.claude/skills/{app-type}-workflow/
+-- SKILL.md
+-- references/
    +-- manifest.json
    +-- primary_assess_template.md # Primary assessment template
    +-- deep_analysis_template.md  # Deep analysis template
    +-- final_assess_template.md   # Final assessment template
```

### {app-type}-client-guidance

```
.claude/skills/{app-type}-client-guidance/
+-- SKILL.md
+-- references/
    +-- manifest.json
    +-- document_checklist.md      # Document checklist
    +-- interview_prep.md          # Interview preparation
    +-- statement_guide.md         # Statement guide
```

### {app-type}-reporter

```
.claude/skills/{app-type}-reporter/
+-- SKILL.md
+-- references/
    +-- manifest.json
    +-- executive_summary.md       # Executive summary template
    +-- document_list.md           # Document list template
    +-- submission_letter.md       # Submission letter template (if applicable)
```
