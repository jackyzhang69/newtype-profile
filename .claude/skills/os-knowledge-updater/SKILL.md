---
name: os-knowledge-updater
description: |
  Update existing app skill references from user-specified knowledge sources.
  Supports: local directories, files, MCP services, or hybrid sources.
  Preserves existing structure while adding/updating knowledge content.
  Use when: refreshing skill references, adding new case law, updating policy knowledge.
  Trigger: /os-update-knowledge <app> --source <path|mcp> --skill <skill-type>
---

# OS Knowledge Updater

Update existing Immigration Audit App skill references with new knowledge.

## Quick Start

```bash
# Update spousal audit-rules from local directory
/os-update-knowledge spousal --source ./new-cases/ --skill audit-rules

# Update from MCP (latest 50 cases)
/os-update-knowledge spousal --source mcp --skill audit-rules --count 50

# Update specific file only
/os-update-knowledge spousal --source ./refusal-analysis.md --skill audit-rules --target risk_patterns.json

# Update all skills for an app
/os-update-knowledge spousal --source ./knowledge/ --skill all

# Dry run (show what would change)
/os-update-knowledge spousal --source mcp --skill audit-rules --dry-run
```

## Source Types

### Local Directory

Process all supported files in directory:

```bash
/os-update-knowledge work --source ./new-knowledge/
```

### Individual File

Add knowledge from a specific file:

```bash
/os-update-knowledge work --source ./lmia-update-2026.pdf
```

### MCP Services

Fetch latest from MCP services:

```bash
# Default: 50 newest cases
/os-update-knowledge work --source mcp

# Custom count
/os-update-knowledge work --source mcp --count 100

# Filter by date range
/os-update-knowledge work --source mcp --since 2025-01-01

# Filter by issue
/os-update-knowledge work --source mcp --issue LMIA_COMPLIANCE
```

### Hybrid

Combine local and MCP sources:

```bash
/os-update-knowledge work --source ./local/ --source mcp --count 30
```

## Update Modes

### Merge (Default)

Adds new patterns/rules while preserving existing ones.

```bash
/os-update-knowledge spousal --source ./new-cases/ --mode merge
```

**Behavior:**
- New patterns: Added
- Existing patterns: Keep original (no overwrite)
- Removed from source: Keep in skill (no deletion)

### Replace

Replaces entire file content with new extraction.

```bash
/os-update-knowledge spousal --source ./new-cases/ --mode replace
```

**Behavior:**
- New patterns: Added
- Existing patterns: Overwritten
- Not in source: Deleted

**Warning:** Creates backup before replace.

### Append

Only adds new items, never modifies existing.

```bash
/os-update-knowledge spousal --source ./new-cases/ --mode append
```

**Behavior:**
- New patterns: Added
- Existing patterns: Untouched
- Duplicates: Skipped

### Selective

Update only specified target files.

```bash
/os-update-knowledge spousal --source mcp --target risk_patterns.json
```

## Target Skills

| Skill Type | Updatable Files | Notes |
|------------|-----------------|-------|
| `audit-rules` | risk_patterns.json, baseline_rules.md, eligibility_rules.md | Core risk knowledge |
| `doc-analysis` | evidence_standards.md, consistency_rules.md | Document rules |
| `immicore-mcp` | caselaw_query_patterns.json, mcp_usage.json | Search patterns |
| `workflow` | *_template.md | Output templates |
| `client-guidance` | *_guide.md | Client-facing docs |
| `all` | All above | Full update |

## Workflow

### Step 1: Validate Existing Skill

```
Check: .claude/skills/{app}-{skill}/ exists
Check: SKILL.md, manifest.json present
Check: references/ directory exists
```

### Step 2: Extract from Source

```
If source is local:
  → Read and parse files
  → Extract patterns/rules

If source is MCP:
  → Search caselaw/operation_manual
  → Extract patterns from results
```

### Step 3: Merge/Replace Logic

```
Load existing: {skill}/references/{target_file}
Load extracted: patterns from source

Based on mode:
  merge:   existing ∪ extracted (prefer existing on conflict)
  replace: extracted only (backup existing)
  append:  existing + new_only(extracted)
```

### Step 4: Validate Output

```
Verify: JSON is valid
Verify: All citations exist (if caselaw)
Verify: No duplicate pattern_ids
Verify: Markdown formatting correct
```

### Step 5: Write and Report

```
Write: Updated files
Update: manifest.json timestamps
Output: Change summary
```

## Change Summary Output

```markdown
## Knowledge Update Summary

**App:** spousal
**Skill:** audit-rules
**Mode:** merge
**Source:** MCP (50 cases)

### Changes

#### risk_patterns.json
- Added: 3 new patterns
  - spousal_genuineness_005: "Video call frequency assessment"
  - spousal_financial_003: "Joint account requirement clarification"
  - spousal_documentation_007: "Photo metadata concerns"
- Unchanged: 15 existing patterns
- Conflicts: 2 (kept existing)
  - spousal_genuineness_001: Different severity (existing: HIGH, source: MEDIUM)

#### baseline_rules.md
- Added: 1 new section
  - "Remote Relationship Assessment" (post-pandemic guidelines)
- Updated: 0 sections
- Unchanged: 12 sections

### Verification
- All citations verified: 23/23 ✓
- No duplicate IDs: ✓
- JSON valid: ✓

### Backup
- Created: .claude/skills/spousal-audit-rules/references/.backup/2026-01-25/
```

## Backup and Rollback

### Automatic Backups

Every update creates a backup:

```
.claude/skills/{app}-{skill}/references/.backup/{date}/
├── risk_patterns.json
├── baseline_rules.md
└── manifest.json
```

### Manual Rollback

```bash
# List backups
ls .claude/skills/spousal-audit-rules/references/.backup/

# Rollback to specific date
/os-update-knowledge spousal --rollback 2026-01-20
```

## Safety Features

### Dry Run

Preview changes without writing:

```bash
/os-update-knowledge spousal --source mcp --dry-run
```

### Validation

All updates are validated:
- JSON schema compliance
- Citation existence (for case law)
- No orphaned references
- Manifest consistency

### Conflict Resolution

When the same pattern exists in both source and skill:

| Mode | Resolution |
|------|------------|
| merge | Keep existing |
| replace | Use source |
| append | Keep existing |

Override with `--prefer-source`:

```bash
/os-update-knowledge spousal --source mcp --mode merge --prefer-source
```

## References

- [update_workflow.md](references/update_workflow.md) - Detailed update process
- [merge_strategies.md](references/merge_strategies.md) - Conflict resolution rules
- [backup_policy.md](references/backup_policy.md) - Backup and rollback procedures
