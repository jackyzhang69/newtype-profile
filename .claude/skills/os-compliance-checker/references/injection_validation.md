# Injection Profile Validation

Rules for validating `injection_profile.json` configuration.

## File Location

```
.claude/skills/{app}-knowledge-injection/references/injection_profile.json
```

## Schema

```json
{
  "version": "string",           // Required: "{app}-v{n}"
  "description": "string",       // Required: Purpose description
  "skills": {                    // Required: Skill configurations
    "{skill-name}": {
      "description": "string",   // Required: What this skill provides
      "inject_to": ["string"],   // Required: Target agent names
      "priority": number,        // Required: 1-10
      "files": ["string"]        // Required: Files to inject
    }
  },
  "injection_order": ["string"], // Required: Ordered skill list
  "tags": {                      // Optional: XML tag mappings
    "skill": "string",
    "risk": "string"
  },
  "stability": {                 // Optional: Change protection
    "allow_rename": boolean,
    "preserve_manifest": boolean
  }
}
```

## Validation Rules

### R1: Version Format

```
Pattern: {app}-v{number}
Valid:   spousal-v3, study-v2, work-v1
Invalid: v3, spousal, spousal-version-3
```

### R2: Valid Agent Names

The `inject_to` array must only contain valid agent names:

```javascript
const VALID_AGENTS = [
  "intake",
  "auditManager",    // or "audit-manager"
  "detective",
  "strategist",
  "gatekeeper",
  "verifier",
  "reporter"
]
```

### R3: Skill Reference Completeness

Every `{app}-*` skill in `.claude/skills/` must be:
1. Listed in the `skills` object
2. Included in `injection_order`

```javascript
// Validation pseudocode
const appSkills = listSkillsMatchingPattern(`${app}-*`)
const configuredSkills = Object.keys(injectionProfile.skills)
const orderedSkills = injectionProfile.injection_order

// Check all app skills are configured
for (const skill of appSkills) {
  assert(configuredSkills.includes(skill), `Missing skill config: ${skill}`)
  assert(orderedSkills.includes(skill), `Missing from injection_order: ${skill}`)
}
```

### R4: File Existence

All files listed in `files` array must exist:

```javascript
for (const [skillName, config] of Object.entries(skills)) {
  const skillPath = `.claude/skills/${skillName}/references/`
  for (const file of config.files) {
    assert(exists(`${skillPath}${file}`), `Missing file: ${skillPath}${file}`)
  }
}
```

### R5: Priority Uniqueness

Priority values should be unique across all skills:

```javascript
const priorities = Object.values(skills).map(s => s.priority)
const uniquePriorities = new Set(priorities)
assert(priorities.length === uniquePriorities.size, "Duplicate priorities found")
```

### R6: Injection Order Consistency

`injection_order` should match priority order:

```javascript
const byPriority = Object.entries(skills)
  .sort((a, b) => a[1].priority - b[1].priority)
  .map(([name]) => name)

assert(
  JSON.stringify(byPriority) === JSON.stringify(injection_order),
  "injection_order does not match priority sequence"
)
```

## Common Issues

### Issue: Skill Not Injected

**Symptom**: Agent doesn't receive expected knowledge

**Check**:
1. Skill listed in `skills` object?
2. Skill included in `injection_order`?
3. Target agent in `inject_to`?
4. Files exist and are valid?

### Issue: Wrong Agent Receives Skill

**Symptom**: Knowledge appears in wrong agent's context

**Check**:
1. Verify `inject_to` targets
2. Check for typos in agent names
3. Confirm no duplicate skill names

### Issue: Injection Order Problems

**Symptom**: Skills override each other incorrectly

**Check**:
1. Verify `priority` values
2. Ensure `injection_order` matches priority sequence
3. Check for circular dependencies

## Example Valid Profile

```json
{
  "version": "spousal-v3",
  "description": "Spousal sponsorship knowledge injection",
  "skills": {
    "spousal-audit-rules": {
      "description": "Risk patterns and eligibility rules",
      "inject_to": ["detective", "strategist", "gatekeeper"],
      "priority": 1,
      "files": ["risk_patterns.json", "eligibility_rules.md"]
    },
    "spousal-doc-analysis": {
      "description": "Document analysis rules",
      "inject_to": ["detective", "strategist"],
      "priority": 2,
      "files": ["imm5533_checklist.md", "evidence_standards.md"]
    }
  },
  "injection_order": [
    "spousal-audit-rules",
    "spousal-doc-analysis"
  ]
}
```
