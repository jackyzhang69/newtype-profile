---
category_id: semantic_confusion
name: Semantic Confusion Rules
name_zh: 语义混淆规则
description: |
  Rules that detect and correct semantic boundary errors - cases where 
  similar but distinct concepts are confused, leading to incorrect conclusions.
description_zh: |
  检测并纠正语义边界错误的规则 - 当相似但不同的概念被混淆时，导致错误结论的情况。
priority: critical
applies_to:
  - spousal
  - study
  - all
---

# Semantic Confusion Category

## Overview

Semantic confusion errors occur when the audit system misinterprets terms that are **related but not equivalent**. These errors are particularly dangerous because:

1. They appear logical on the surface
2. They can cascade into severe risk assessments
3. They may not be caught by standard document verification

## Common Patterns

### 1. Concept Substitution
Treating one concept as if it were another:
- `ceremony` ≠ `marriage`
- `cohabitation` ≠ `relationship`
- `engagement` ≠ `commitment to marry`

### 2. Temporal Confusion
Confusing states at different points in time:
- `will marry` ≠ `are married`
- `planning to live together` ≠ `living together`

### 3. Cultural Translation Errors
Misunderstanding terms across cultural contexts:
- Chinese "领证" (get certificate) = legal marriage
- Chinese "办婚礼" (have wedding) = ceremony (separate event)

## Detection Signals

When reviewing conclusions, watch for:

- **Contradiction flags** where documents actually agree
- **Misrepresentation claims** based on narrative vs form discrepancies
- **Status conclusions** that don't match certificate evidence

## Rules in This Category

| Rule ID | Title | Severity |
|---------|-------|----------|
| RULE-001 | Ceremony vs Marriage | Critical |

## Verification Approach

For any semantic confusion rule:

1. **Identify the confused terms** (what was conflated?)
2. **Check primary documents** (certificates, official forms)
3. **Re-read context** with correct distinction in mind
4. **Adjust severity** based on document evidence

## Related Categories

- `timeline_issues`: Often co-occurs with semantic confusion
- `cultural_context`: May provide explanation for apparent confusion
