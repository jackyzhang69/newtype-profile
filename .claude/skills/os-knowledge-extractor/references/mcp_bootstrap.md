# MCP Bootstrap Strategies

How to extract knowledge from MCP services when no local source exists.

## Overview

MCP Bootstrap retrieves immigration knowledge from:
1. **Case Law Service** - Federal Court and IRB decisions
2. **Operation Manual Service** - IRCC processing guidelines
3. **Help Centre Service** - Public Q&A information

## Search Strategy by App Type

### Work Permit

```javascript
const WORK_QUERIES = {
  caselaw: {
    primary: "work permit LMIA employer compliance",
    secondary: [
      "work permit refusal genuine job offer",
      "LMIA conditions wage",
      "work permit dual intent"
    ]
  },
  operation_manual: {
    policy_codes: ["IP 10", "FW 1"],
    keywords: ["work permit", "LMIA", "employer"]
  },
  help_centre: {
    queries: ["work permit apply", "LMIA requirement", "work permit extend"]
  }
}
```

### Visitor Visa

```javascript
const VISITOR_QUERIES = {
  caselaw: {
    primary: "visitor visa TRV refusal ties home country",
    secondary: [
      "visitor visa dual intent",
      "visitor visa financial support",
      "temporary resident visa purpose of visit"
    ]
  },
  operation_manual: {
    policy_codes: ["IP 2", "OP 11"],
    keywords: ["visitor", "TRV", "temporary resident"]
  },
  help_centre: {
    queries: ["visitor visa apply", "super visa", "visitor extend stay"]
  }
}
```

### Study Permit

```javascript
const STUDY_QUERIES = {
  caselaw: {
    primary: "study permit genuine student intent",
    secondary: [
      "study permit study plan reasonable",
      "study permit financial capacity",
      "study permit return home"
    ]
  },
  operation_manual: {
    policy_codes: ["IP 12", "OP 12"],
    keywords: ["study permit", "DLI", "student"]
  },
  help_centre: {
    queries: ["study permit apply", "student direct stream", "study permit work"]
  }
}
```

### Permanent Residence

```javascript
const PR_QUERIES = {
  caselaw: {
    primary: "express entry CRS score selection",
    secondary: [
      "permanent residence inadmissibility",
      "PNP nomination",
      "work experience verification"
    ]
  },
  operation_manual: {
    policy_codes: ["OP 7", "OP 25"],
    keywords: ["permanent residence", "express entry", "PNP"]
  },
  help_centre: {
    queries: ["express entry apply", "CRS score", "permanent residence process"]
  }
}
```

## MCP Tool Usage

### Case Law Search

```typescript
// Primary search - broad coverage
const primaryCases = await caselaw_optimized_search({
  query: QUERIES.caselaw.primary,
  court: "fc",
  target_count: 50,
  auto_route: true
})

// Secondary searches - specific issues
for (const query of QUERIES.caselaw.secondary) {
  const cases = await caselaw_keyword_search({
    query: query,
    court: "fc",
    top_k: 20,
    strategy: "balanced"
  })
  // Merge results, deduplicate by citation
}
```

### Operation Manual Search

```typescript
// By policy code
for (const code of QUERIES.operation_manual.policy_codes) {
  const sections = await operation_manual_semantic_search({
    query: `${appType} requirements assessment`,
    policy_code: code,
    size: 20
  })
}

// By keywords
const keywordResults = await operation_manual_keyword_search({
  query: QUERIES.operation_manual.keywords.join(" "),
  top_k: 30
})
```

### Help Centre Search

```typescript
const faqs = await help_centre_search({
  query: QUERIES.help_centre.queries[0],
  lang: "en",
  top_k: 20
})

// Get full content for relevant Q&As
for (const faq of faqs.results) {
  if (faq.relevance > 0.7) {
    const detail = await help_centre_detail({
      qnum: faq.qnum,
      lang: "en",
      format: "text"
    })
  }
}
```

## Result Processing

### Deduplication

```typescript
function deduplicateCases(cases: Case[]): Case[] {
  const seen = new Set<string>()
  return cases.filter(c => {
    if (seen.has(c.citation)) return false
    seen.add(c.citation)
    return true
  })
}
```

### Relevance Filtering

```typescript
function filterByRelevance(results: SearchResult[], threshold = 0.6): SearchResult[] {
  return results
    .filter(r => r.relevance_score >= threshold)
    .sort((a, b) => b.relevance_score - a.relevance_score)
}
```

### Pattern Extraction

```typescript
async function extractPatternsFromCases(cases: Case[]): Promise<RiskPattern[]> {
  const refusalReasons = new Map<string, number>()
  
  for (const c of cases) {
    // Extract refusal reasons from case text
    const reasons = await analyzeRefusalReasons(c.content)
    for (const reason of reasons) {
      refusalReasons.set(reason, (refusalReasons.get(reason) || 0) + 1)
    }
  }
  
  // Convert to risk patterns
  return Array.from(refusalReasons.entries())
    .filter(([_, count]) => count >= 5)  // At least 5 occurrences
    .map(([reason, count]) => ({
      pattern_id: generatePatternId(reason),
      name: reason,
      frequency: count,
      severity: calculateSeverity(count, cases.length)
    }))
}
```

## Output Assembly

### Combine Sources

```typescript
async function assembleKnowledge(
  cases: Case[],
  policies: PolicySection[],
  faqs: FAQ[]
): Promise<AppKnowledge> {
  // Extract risk patterns from cases
  const riskPatterns = await extractPatternsFromCases(cases)
  
  // Extract eligibility rules from policies
  const eligibilityRules = extractEligibilityRules(policies)
  
  // Generate query patterns
  const queryPatterns = generateQueryPatterns(riskPatterns)
  
  // Supplement with FAQ insights
  const supplementalInfo = extractFAQInsights(faqs)
  
  return {
    riskPatterns,
    eligibilityRules,
    queryPatterns,
    supplementalInfo
  }
}
```

### Save to Skill

```typescript
async function saveToSkill(
  knowledge: AppKnowledge,
  appType: string,
  skillType: string
): Promise<void> {
  const skillPath = `.claude/skills/${appType}-${skillType}/references/`
  
  await fs.mkdir(skillPath, { recursive: true })
  
  // Write extracted files
  if (skillType === 'audit-rules') {
    await writeJSON(`${skillPath}risk_patterns.json`, knowledge.riskPatterns)
    await writeMarkdown(`${skillPath}baseline_rules.md`, knowledge.eligibilityRules)
  }
  
  if (skillType === 'immicore-mcp') {
    await writeJSON(`${skillPath}caselaw_query_patterns.json`, knowledge.queryPatterns)
  }
  
  // Update manifest
  await updateManifest(skillPath, knowledge)
}
```

## Quality Thresholds

| Metric | Minimum | Target |
|--------|---------|--------|
| Cases retrieved | 50 | 100 |
| Policy sections | 20 | 50 |
| Risk patterns identified | 5 | 15 |
| Citation verification | 100% | 100% |
