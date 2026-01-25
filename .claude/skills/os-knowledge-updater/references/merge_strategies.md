# Merge Strategies

How to handle conflicts when updating skill references.

## Strategy Overview

| Strategy | New Items | Existing Items | Conflicts | Use Case |
|----------|-----------|----------------|-----------|----------|
| `merge` | Add | Keep | Keep existing | Safe incremental update |
| `replace` | Add | Delete | Use source | Full refresh |
| `append` | Add | Keep | Skip | Add-only update |

## Merge Strategy (Default)

The safest option for incremental updates.

### Behavior

```
Existing:  [A, B, C]
Source:    [B*, D, E]   (* = modified version)
Result:    [A, B, C, D, E]  (B unchanged, D & E added)
```

### Algorithm

```typescript
function merge(existing: Item[], source: Item[]): Item[] {
  const result = [...existing]
  const existingIds = new Set(existing.map(i => i.id))
  
  for (const item of source) {
    if (!existingIds.has(item.id)) {
      // New item - add it
      result.push(item)
    }
    // Existing item - keep original (no change)
  }
  
  return result
}
```

### When to Use

- Regular knowledge updates
- Adding new case law
- Preserving manual edits
- Low-risk updates

### With `--prefer-source`

```
Existing:  [A, B, C]
Source:    [B*, D, E]
Result:    [A, B*, C, D, E]  (B updated to B*, D & E added)
```

## Replace Strategy

Full replacement of reference content.

### Behavior

```
Existing:  [A, B, C]
Source:    [B*, D, E]
Result:    [B*, D, E]  (A & C deleted, B replaced)
```

### Algorithm

```typescript
function replace(existing: Item[], source: Item[]): Item[] {
  // Backup existing first!
  createBackup(existing)
  
  // Simply return source
  return source
}
```

### When to Use

- Complete knowledge refresh
- After major policy changes
- Correcting systematic errors
- Starting fresh with new extraction

### Safety

**Always creates backup before replace:**
```
.backup/{date}/risk_patterns.json.before-replace
```

## Append Strategy

Add-only, never modify or delete.

### Behavior

```
Existing:  [A, B, C]
Source:    [B*, D, E]
Result:    [A, B, C, D, E]  (B unchanged, only D & E added)
```

### Algorithm

```typescript
function append(existing: Item[], source: Item[]): Item[] {
  const result = [...existing]
  const existingIds = new Set(existing.map(i => i.id))
  
  for (const item of source) {
    if (!existingIds.has(item.id)) {
      result.push(item)
    }
    // Skip items that already exist (even if different)
  }
  
  return result
}
```

### When to Use

- Strict add-only policy
- When existing content is authoritative
- Supplementing with additional cases
- Avoiding accidental overwrites

## Conflict Resolution

### What is a Conflict?

A conflict occurs when:
- Same `pattern_id` exists in both existing and source
- Content differs between them

### Conflict Fields

For risk patterns, these fields can differ:

| Field | Conflict Type | Resolution |
|-------|---------------|------------|
| `severity` | Value difference | Use strategy rule |
| `description` | Text difference | Use strategy rule |
| `indicators` | Array difference | Merge arrays or use strategy |
| `case_references` | Array difference | Always merge (additive) |

### Merge with Partial Updates

For array fields, use union merge:

```typescript
function mergeArrayFields(existing: Item, source: Item): Item {
  return {
    ...existing,
    // Merge arrays (union)
    indicators: [...new Set([...existing.indicators, ...source.indicators])],
    case_references: mergeReferences(existing.case_references, source.case_references),
    // Keep existing for scalar fields
    severity: existing.severity,
    description: existing.description
  }
}
```

### Conflict Report

When conflicts occur, log them:

```markdown
### Conflicts Detected

| Pattern ID | Field | Existing | Source | Resolution |
|------------|-------|----------|--------|------------|
| spousal_001 | severity | HIGH | MEDIUM | Kept existing |
| spousal_003 | description | "..." | "..." | Kept existing |

Use `--prefer-source` to accept source values instead.
```

## File-Specific Strategies

### risk_patterns.json

```typescript
interface MergeConfig {
  idField: 'pattern_id',
  mergeArrays: ['indicators', 'mitigation', 'case_references', 'policy_references'],
  preferExisting: ['severity', 'name', 'description']
}
```

### baseline_rules.md

For Markdown files, use section-based merge:

```typescript
function mergeMarkdown(existing: string, source: string): string {
  const existingSections = parseMarkdownSections(existing)
  const sourceSections = parseMarkdownSections(source)
  
  // Add new sections at end
  for (const [title, content] of sourceSections) {
    if (!existingSections.has(title)) {
      existingSections.set(title, content)
    }
  }
  
  return renderMarkdown(existingSections)
}
```

### caselaw_query_patterns.json

Always merge with union for query patterns:

```typescript
function mergeQueryPatterns(existing: QueryPattern[], source: QueryPattern[]): QueryPattern[] {
  const byId = new Map(existing.map(p => [p.pattern_id, p]))
  
  for (const pattern of source) {
    if (!byId.has(pattern.pattern_id)) {
      byId.set(pattern.pattern_id, pattern)
    } else {
      // Merge sample_citations
      const ex = byId.get(pattern.pattern_id)!
      ex.sample_citations = [...new Set([...ex.sample_citations, ...pattern.sample_citations])]
    }
  }
  
  return Array.from(byId.values())
}
```

## Manual Override

### Force Specific Strategy per File

```bash
/os-update-knowledge spousal --source mcp \
  --file-strategy risk_patterns.json:merge \
  --file-strategy baseline_rules.md:replace
```

### Interactive Conflict Resolution

```bash
/os-update-knowledge spousal --source mcp --interactive
```

Prompts for each conflict:
```
Conflict: spousal_001 severity
  Existing: HIGH
  Source:   MEDIUM
  
  [K]eep existing / [U]se source / [S]kip: 
```
