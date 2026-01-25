# Generated File Templates

Standard templates for knowledge extraction output files.

## risk_patterns.json

```json
{
  "$schema": "https://immi-os.dev/schemas/risk-patterns-v1.json",
  "version": "1.0.0",
  "app_type": "{app}",
  "generated_at": "ISO8601 timestamp",
  "source": "local | mcp | hybrid",
  "patterns": [
    {
      "pattern_id": "{app}_{category}_{number}",
      "category": "GENUINENESS | ADMISSIBILITY | DOCUMENTATION | FINANCIAL | TIES | COMPLIANCE | HISTORY",
      "subcategory": "string (optional)",
      "name": "Human-readable pattern name",
      "description": "Detailed description of the risk pattern",
      "severity": "CRITICAL | HIGH | MEDIUM | LOW",
      "frequency": "number (occurrences in source material)",
      "indicators": [
        "Observable sign 1",
        "Observable sign 2"
      ],
      "mitigation": [
        "Recommended mitigation 1",
        "Recommended mitigation 2"
      ],
      "case_references": [
        {
          "citation": "2024 FC 123",
          "relevance": "Why this case is relevant",
          "paragraph": "optional paragraph number"
        }
      ],
      "policy_references": [
        {
          "policy_code": "IP 10.5",
          "section": "Assessment criteria",
          "relevance": "Why this policy applies"
        }
      ],
      "kg_query": {
        "issue_code": "KG issue code if applicable",
        "keywords": ["search", "keywords"]
      }
    }
  ],
  "summary": {
    "total_patterns": "number",
    "by_category": {
      "GENUINENESS": "count",
      "COMPLIANCE": "count"
    },
    "by_severity": {
      "CRITICAL": "count",
      "HIGH": "count",
      "MEDIUM": "count",
      "LOW": "count"
    }
  }
}
```

## baseline_rules.md

```markdown
# {App Type} Baseline Rules

> Auto-generated from {source} on {date}
> Source: {local path | MCP services}

## Overview

Brief description of this app type and common assessment criteria.

## Eligibility Requirements

### Statutory Requirements

| Requirement | Regulation | Description |
|-------------|------------|-------------|
| Requirement 1 | R{number} | What is required |
| Requirement 2 | R{number} | What is required |

### Processing Guidelines

Reference to relevant operation manual sections.

## Risk Assessment Framework

### Critical Risks (Fatal)

These issues cannot be mitigated and result in automatic refusal:

1. **{Risk Name}**
   - Description
   - Why it's fatal
   - Regulation reference

### High Risks

Likely refusal without strong mitigation:

1. **{Risk Name}**
   - Description
   - Common officer concerns
   - Recommended mitigation

### Medium Risks

Requires explanation or additional evidence:

1. **{Risk Name}**
   - Description
   - What officers look for
   - How to address

### Low Risks

Minor concerns, address if convenient:

1. **{Risk Name}**
   - Description
   - Standard approach

## Evidence Standards

### Required Documents

| Document | Purpose | Quality Standard |
|----------|---------|-----------------|
| Document 1 | Why needed | What makes it good |

### Recommended Documents

Additional documents that strengthen the application.

## Officer Assessment Criteria

How officers evaluate applications based on case law analysis:

1. **Criterion 1**: Description
2. **Criterion 2**: Description

## Common Refusal Reasons

Based on {N} cases analyzed:

| Refusal Reason | Frequency | Typical Scenario |
|----------------|-----------|------------------|
| Reason 1 | {count} cases | When this happens |

## Key Case Law Principles

### {Principle Name}
- Citation: {case}
- Holding: What the court decided
- Application: How to apply this

## Source References

- Cases analyzed: {count}
- Policy sections referenced: {count}
- Generated: {date}
```

## caselaw_query_patterns.json

```json
{
  "version": "1.0.0",
  "app_type": "{app}",
  "generated_at": "ISO8601 timestamp",
  "patterns": [
    {
      "pattern_id": "query_{app}_{number}",
      "name": "Human-readable query name",
      "description": "What this query finds",
      "use_case": "When to use this query",
      "query_template": {
        "tool": "caselaw_optimized_search | caselaw_keyword_search | caselaw_semantic_search",
        "query": "The search query text",
        "court": "fc | fca | irb",
        "must_include": ["required", "terms"],
        "must_not": ["excluded", "terms"],
        "issue_code": "KG issue code (optional)",
        "start_date": "YYYY-MM-DD (optional)",
        "end_date": "YYYY-MM-DD (optional)"
      },
      "expected_results": "Description of what results to expect",
      "sample_citations": ["2024 FC 123", "2023 FC 456"],
      "related_patterns": ["query_{app}_2", "query_{app}_3"]
    }
  ],
  "operation_manual_patterns": [
    {
      "pattern_id": "om_{app}_{number}",
      "name": "Policy search name",
      "description": "What policy to find",
      "use_case": "When to search operation manual",
      "query_template": {
        "tool": "operation_manual_semantic_search | operation_manual_keyword_search",
        "query": "Search text",
        "policy_code": "IP 10 (optional)",
        "section_title_keywords": ["keywords"]
      },
      "expected_sections": ["IP 10.5", "IP 10.6"]
    }
  ]
}
```

## eligibility_rules.md

```markdown
# {App Type} Eligibility Rules

## Hard Eligibility Checks

These are fatal blockers - if any fail, application cannot proceed.

### Check 1: {Name}

| Field | Value |
|-------|-------|
| Regulation | R{number} |
| Requirement | What must be true |
| Fatal if | Condition that fails |
| Evidence | How to prove compliance |

### Check 2: {Name}

...

## Soft Eligibility Factors

These affect assessment but are not automatic blockers.

### Factor 1: {Name}

- Weight: HIGH | MEDIUM | LOW
- Assessment: How officers evaluate
- Positive indicators: List
- Negative indicators: List

## Eligibility Matrix

| Scenario | Eligibility | Notes |
|----------|-------------|-------|
| Scenario 1 | Eligible | Standard processing |
| Scenario 2 | Conditional | Requires additional proof |
| Scenario 3 | Ineligible | Cannot apply under this category |

## Regulatory References

| Regulation | Title | Relevance |
|------------|-------|-----------|
| R{number} | Title | How it applies |
```

## mcp_usage.json

```json
{
  "version": "1.0.0",
  "app_type": "{app}",
  "services": {
    "caselaw": {
      "primary_queries": [
        {
          "name": "Main search",
          "query": "default query for this app type",
          "target_count": 50
        }
      ],
      "fallback_queries": [
        {
          "name": "Broader search",
          "query": "less specific query",
          "when": "primary returns < 10 results"
        }
      ]
    },
    "operation_manual": {
      "relevant_policies": [
        {
          "policy_code": "IP XX",
          "relevance": "Why this policy matters",
          "key_sections": ["1.1", "2.3"]
        }
      ]
    },
    "help_centre": {
      "relevant_topics": [
        {
          "query": "topic query",
          "use_for": "When to use this"
        }
      ]
    }
  },
  "usage_guidelines": {
    "search_order": ["caselaw", "operation_manual", "help_centre"],
    "max_results_per_service": 50,
    "deduplication": true,
    "relevance_threshold": 0.6
  }
}
```
