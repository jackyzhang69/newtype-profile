# Validation Rules

Invoke os-compliance-checker:

```
/os-check {app-type}
```

## Validation Criteria

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

## Validation Script

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

## Required Skill Directories

1. `.claude/skills/{app-type}-audit-rules/`
2. `.claude/skills/{app-type}-doc-analysis/`
3. `.claude/skills/{app-type}-immicore-mcp/`
4. `.claude/skills/{app-type}-knowledge-injection/`
5. `.claude/skills/{app-type}-workflow/`
6. `.claude/skills/{app-type}-client-guidance/`
7. `.claude/skills/{app-type}-reporter/`

## Required Files Per Skill

Each skill MUST have:
- `SKILL.md` with valid frontmatter (name, description, trigger)
- `references/manifest.json` with `references` array (not `files`)
- At least one reference file listed in manifest
