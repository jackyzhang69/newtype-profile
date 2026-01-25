# Skill Structure Requirements

Standard structure and format requirements for Immigration Audit Skills.

## Directory Layout

```
.claude/skills/{skill-name}/
├── SKILL.md                      # Main entry point (< 500 lines)
└── references/
    ├── manifest.json             # Required: file index
    └── {content files}           # Domain-specific content
```

## SKILL.md Format

### Required YAML Frontmatter

```yaml
---
name: {skill-name}
description: |
  Brief description of skill purpose.
  Use when: [trigger condition 1], [trigger condition 2].
---
```

### Content Guidelines

| Section | Required | Content |
|---------|----------|---------|
| Title | Yes | `# {Skill Name}` |
| Purpose | Yes | 1-2 sentences |
| Quick Start | Recommended | Usage examples |
| Scope | Recommended | What it covers |
| References | Yes | Link to manifest.json |

### Length Limit

- SKILL.md must be < 500 lines
- Detailed content goes in `references/`

## manifest.json Format

```json
{
  "name": "{skill-name}",
  "version": "1.0.0",
  "description": "Detailed description",
  "categories": {
    "{category}": {
      "name": "Category Name",
      "description": "What this category contains",
      "files": [
        {
          "path": "filename.md",
          "title": "File Title",
          "description": "What this file covers",
          "topics": ["topic1", "topic2"]
        }
      ]
    }
  },
  "last_updated": "YYYY-MM-DD"
}
```

## Skill Types and Required Content

### audit-rules

```
{app}-audit-rules/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── baseline_rules.md         # Core rules
    ├── risk_patterns.json        # Risk pattern definitions
    ├── risk_framework.json       # Scoring framework
    ├── eligibility_rules.md      # Hard eligibility checks
    └── checklist_templates.json  # Checklist structure
```

### doc-analysis

```
{app}-doc-analysis/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── baseline_doc_analysis.md  # Analysis rules
    ├── extraction_schema.json    # Field mappings
    ├── evidence_standards.md     # Quality grading
    └── {form}_checklist.md       # Form-specific checklists
```

### immicore-mcp

```
{app}-immicore-mcp/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── mcp_usage.json            # Tool usage patterns
    └── caselaw_query_patterns.json  # Query templates
```

### knowledge-injection

```
{app}-knowledge-injection/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── baseline_guides.md        # Overview document
    └── injection_profile.json    # Injection configuration
```

### workflow

```
{app}-workflow/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── primary_assess_template.md
    ├── deep_analysis_template.md
    ├── final_assess_template.md
    └── submission_letter_template.md
```

### client-guidance

```
{app}-client-guidance/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── document_list_guide.md    # Required documents
    ├── love_story_guide.md       # Relationship statement
    └── interview_guide.md        # Interview prep
```

### reporter

```
{app}-reporter/
├── SKILL.md
└── references/
    ├── manifest.json
    ├── executive_summary.md      # Summary template
    ├── document_list.md          # Checklist generation
    └── submission_letter.md      # Cover letter template
```

## Validation Rules

### File Naming

- Use snake_case for files: `risk_patterns.json`
- Use kebab-case for directories: `spousal-audit-rules`
- Match skill name in SKILL.md frontmatter to directory name

### Content Quality

- No placeholder text (`TODO`, `TBD`, `...`)
- No hardcoded dates in year 2024
- Use English for code/technical content
- Include version information
