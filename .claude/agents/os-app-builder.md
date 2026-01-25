# os-app-builder Agent

> Orchestrates complete Immigration Audit App creation using the os-* system skills.

## Trigger

```
/agent os-app-builder <app-type> [--source <path|mcp>] [--dry-run]
```

**Examples:**
```bash
# Build work permit app from local knowledge
/agent os-app-builder work --source ./knowledge/work/

# Build visitor app bootstrapped from MCP
/agent os-app-builder visitor --source mcp

# Preview what would be created without writing files
/agent os-app-builder pr --dry-run
```

## Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `app-type` | Yes | - | Target app type (e.g., `work`, `visitor`, `pr`, `refugee`) |
| `--source` | No | `mcp` | Knowledge source: directory path or `mcp` for MCP bootstrap |
| `--dry-run` | No | false | Preview mode - show plan without creating files |

## Agent Configuration

```yaml
model: anthropic/claude-sonnet-4-5
temperature: 0.1
tools:
  include:
    - Read
    - Write
    - Edit
    - Glob
    - Grep
    - Bash
    - Task
    - caselaw_optimized_search
    - operation_manual_semantic_search
    - help_centre_search
```

## Workflow

### Phase 1: Knowledge Acquisition

```
IF --source is directory path:
    1. Verify directory exists
    2. Scan for:
       - *.md files (policies, guidelines)
       - *.json files (structured data)
       - *.txt files (case summaries)
    3. Build knowledge inventory
    
ELSE (--source is mcp or default):
    1. MCP Bootstrap Sequence:
       a. caselaw_optimized_search:
          - Query: "{app-type} permit application"
          - target_count: 100
          - Extract: refusal reasons, success factors, officer concerns
       
       b. operation_manual_semantic_search:
          - Query: "{app-type} permit eligibility requirements"
          - size: 50
          - Extract: R criteria, policy guidelines, assessment factors
       
       c. help_centre_search:
          - Query: "{app-type} permit documents needed"
          - top_k: 20
          - Extract: document checklists, common questions
    
    2. Save raw results to ./tmp/{app-type}-bootstrap/
```

### Phase 2: Knowledge Extraction

```
Invoke: /os-extract-knowledge ./tmp/{app-type}-bootstrap/ --app {app-type}

Expected outputs in ./tmp/{app-type}-extracted/:
- refusal_patterns.json      # Common refusal reasons
- success_factors.json       # Approval indicators
- r_criteria.json            # Regulatory requirements
- assessment_factors.json    # Officer consideration points
- document_requirements.json # Required/supporting docs
```

### Phase 3: Skill Scaffolding

Generate 7 skill directories under `.claude/skills/{app-type}-*/`:

#### 3.1 {app-type}-audit-rules

```
.claude/skills/{app-type}-audit-rules/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── hard_eligibility.md      # R criteria violations
    ├── fraud_risk_flags.md      # Red flags for genuineness
    ├── refusal_patterns.md      # Common refusal reasons
    └── risk_badges.json         # Badge definitions
```

**SKILL.md Template:**
```markdown
---
description: "{App-type} audit rules and risk badges. Use for hard eligibility checks and fraud risk flags."
---

# {App-type} Audit Rules

## Purpose
Define eligibility requirements, fraud indicators, and risk assessment criteria for {app-type} permit applications.

## Risk Badge Schema
[Include badge definitions from extracted knowledge]

## Hard Eligibility Checks
[R criteria that result in automatic ineligibility]

## Fraud Risk Indicators
[Patterns suggesting application genuineness concerns]
```

#### 3.2 {app-type}-doc-analysis

```
.claude/skills/{app-type}-doc-analysis/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── extraction_schema.json   # Fields to extract per doc type
    ├── document_types.md        # Expected document categories
    └── validation_rules.md      # Cross-document consistency checks
```

#### 3.3 {app-type}-immicore-mcp

```
.claude/skills/{app-type}-immicore-mcp/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── search_strategies.md     # Optimal MCP query patterns
    ├── relevant_policy_codes.md # IP/OP codes for this app type
    └── issue_codes.md           # Knowledge Graph issue codes
```

#### 3.4 {app-type}-knowledge-injection

```
.claude/skills/{app-type}-knowledge-injection/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── injection_profile.json   # Which skills inject to which agents
    ├── detective_prompt.md      # Legal research guidance
    ├── strategist_prompt.md     # Risk assessment guidance
    ├── gatekeeper_prompt.md     # Compliance check guidance
    └── reporter_prompt.md       # Report generation guidance
```

**injection_profile.json Structure:**
```json
{
  "app_type": "{app-type}",
  "version": "1.0.0",
  "injection_targets": {
    "detective": {
      "skills": ["{app-type}-immicore-mcp", "{app-type}-audit-rules"],
      "prompt_file": "detective_prompt.md"
    },
    "strategist": {
      "skills": ["{app-type}-audit-rules", "{app-type}-doc-analysis"],
      "prompt_file": "strategist_prompt.md"
    },
    "gatekeeper": {
      "skills": ["{app-type}-audit-rules"],
      "prompt_file": "gatekeeper_prompt.md"
    },
    "reporter": {
      "skills": ["{app-type}-workflow", "{app-type}-client-guidance"],
      "prompt_file": "reporter_prompt.md"
    }
  }
}
```

#### 3.5 {app-type}-workflow

```
.claude/skills/{app-type}-workflow/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── primary_assessment.md    # Initial review template
    ├── deep_analysis.md         # Detailed analysis template
    ├── final_review.md          # Final review template
    └── submission_letter.md     # Cover letter template
```

#### 3.6 {app-type}-client-guidance

```
.claude/skills/{app-type}-client-guidance/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── document_checklist.md    # What client needs to provide
    ├── statement_template.md    # Personal statement guidance
    ├── interview_prep.md        # Interview preparation tips
    └── common_mistakes.md       # Pitfalls to avoid
```

#### 3.7 {app-type}-reporter

```
.claude/skills/{app-type}-reporter/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── report_structure.md      # Section organization
    ├── submission_letter.md     # RCIC cover letter template
    ├── compliance_rules.md      # ICCRC compliance requirements
    └── disclaimer.md            # Required legal disclaimers
```

### Phase 4: Validation

```
Invoke: /os-check {app-type}

Expected validation:
1. All 7 skill directories exist
2. Each has SKILL.md with valid frontmatter
3. Each has references/manifest.json
4. injection_profile.json has all 4 agent targets
5. No hardcoded case-specific data
6. All R criteria citations are valid format
```

### Phase 5: Registration

Update `src/audit-core/apps/index.ts`:

```typescript
// Add to APP_TYPES
export const APP_TYPES = [
  'spousal',
  'study',
  '{app-type}',  // NEW
] as const;

// Add to APP_SKILL_MAP
export const APP_SKILL_MAP: Record<AppType, string[]> = {
  spousal: ['spousal-audit-rules', 'spousal-doc-analysis', ...],
  study: ['study-audit-rules', 'study-doc-analysis', ...],
  '{app-type}': [
    '{app-type}-audit-rules',
    '{app-type}-doc-analysis',
    '{app-type}-immicore-mcp',
    '{app-type}-knowledge-injection',
    '{app-type}-workflow',
    '{app-type}-client-guidance',
    '{app-type}-reporter',
  ],
};
```

## Output Summary

On successful completion, display:

```
=== os-app-builder Complete ===

App Type: {app-type}
Knowledge Source: {source}

Created Skills:
  [x] .claude/skills/{app-type}-audit-rules/
  [x] .claude/skills/{app-type}-doc-analysis/
  [x] .claude/skills/{app-type}-immicore-mcp/
  [x] .claude/skills/{app-type}-knowledge-injection/
  [x] .claude/skills/{app-type}-workflow/
  [x] .claude/skills/{app-type}-client-guidance/
  [x] .claude/skills/{app-type}-reporter/

Validation: PASSED (7/7 skills valid)

Registration: src/audit-core/apps/index.ts updated

Next Steps:
1. Review generated skills in .claude/skills/{app-type}-*/
2. Customize risk badges in {app-type}-audit-rules
3. Update document checklist in {app-type}-client-guidance
4. Test with: /audit ./test-case/ --app {app-type}
```

## Error Handling

| Error | Recovery |
|-------|----------|
| Source directory not found | Fallback to MCP bootstrap |
| MCP service unavailable | Abort with clear error message |
| Extraction yields < 10 patterns | Warn user, suggest manual knowledge addition |
| Validation fails | Show specific failures, don't register app |
| App type already exists | Ask user: overwrite / merge / abort |

## Dependencies

This agent uses the following os-* skills:
- `os-knowledge-extractor` - Phase 2 extraction
- `os-compliance-checker` - Phase 4 validation

## Anti-Patterns

- **Never** copy verbatim from existing app skills (e.g., spousal → work)
- **Never** include case-specific data in skill references
- **Never** hardcode R section numbers without verification
- **Never** skip validation phase even for quick iterations
- **Never** register app before validation passes
