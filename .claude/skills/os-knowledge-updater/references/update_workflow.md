# Update Workflow

Detailed step-by-step process for updating skill references.

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  User Request: /os-update-knowledge {app} --source {source}     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: VALIDATE                                               │
│  • Check app exists                                             │
│  • Check skill exists                                           │
│  • Validate source accessibility                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: BACKUP                                                 │
│  • Create timestamped backup                                    │
│  • Store in .backup/{date}/                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: EXTRACT                                                │
│  • Process source files/MCP results                             │
│  • Generate structured patterns                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: MERGE                                                  │
│  • Apply merge strategy                                         │
│  • Resolve conflicts                                            │
│  • Generate diff                                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: VALIDATE                                               │
│  • JSON schema validation                                       │
│  • Citation verification                                        │
│  • Consistency check                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 6: WRITE                                                  │
│  • Write updated files                                          │
│  • Update manifest.json                                         │
│  • Generate change report                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Step 1: Validation

### Check App Exists

```typescript
function validateApp(appName: string): boolean {
  const skillsDir = `.claude/skills/`
  const appSkills = fs.readdirSync(skillsDir)
    .filter(d => d.startsWith(`${appName}-`))
  
  if (appSkills.length === 0) {
    throw new Error(`No skills found for app: ${appName}`)
  }
  
  return true
}
```

### Check Skill Exists

```typescript
function validateSkill(appName: string, skillType: string): string {
  const skillPath = `.claude/skills/${appName}-${skillType}/`
  
  if (!fs.existsSync(skillPath)) {
    throw new Error(`Skill not found: ${skillPath}`)
  }
  
  // Verify required files
  const requiredFiles = ['SKILL.md', 'references/manifest.json']
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(skillPath, file))) {
      throw new Error(`Missing required file: ${file}`)
    }
  }
  
  return skillPath
}
```

### Validate Source

```typescript
function validateSource(source: string): SourceType {
  if (source === 'mcp') {
    return { type: 'mcp', valid: true }
  }
  
  if (fs.existsSync(source)) {
    const stat = fs.statSync(source)
    return {
      type: stat.isDirectory() ? 'directory' : 'file',
      path: source,
      valid: true
    }
  }
  
  throw new Error(`Source not found: ${source}`)
}
```

## Step 2: Backup

### Create Backup Directory

```typescript
async function createBackup(skillPath: string): Promise<string> {
  const date = new Date().toISOString().split('T')[0]
  const backupDir = path.join(skillPath, 'references', '.backup', date)
  
  await fs.mkdir(backupDir, { recursive: true })
  
  // Copy current reference files
  const refsDir = path.join(skillPath, 'references')
  const files = fs.readdirSync(refsDir)
    .filter(f => !f.startsWith('.'))
  
  for (const file of files) {
    const src = path.join(refsDir, file)
    const dst = path.join(backupDir, file)
    if (fs.statSync(src).isFile()) {
      await fs.copyFile(src, dst)
    }
  }
  
  return backupDir
}
```

## Step 3: Extract

### From Local Files

```typescript
async function extractFromLocal(source: string): Promise<ExtractedKnowledge> {
  const files = await collectFiles(source)
  const knowledge: ExtractedKnowledge = {
    riskPatterns: [],
    rules: [],
    queryPatterns: []
  }
  
  for (const file of files) {
    const content = await readFile(file)
    const extracted = await analyzeContent(content, file.extension)
    
    knowledge.riskPatterns.push(...extracted.riskPatterns)
    knowledge.rules.push(...extracted.rules)
    knowledge.queryPatterns.push(...extracted.queryPatterns)
  }
  
  return knowledge
}
```

### From MCP

```typescript
async function extractFromMCP(
  appType: string,
  options: MCPOptions
): Promise<ExtractedKnowledge> {
  // Search case law
  const cases = await caselaw_optimized_search({
    query: buildQuery(appType),
    target_count: options.count || 50,
    start_date: options.since
  })
  
  // Extract patterns from cases
  const riskPatterns = await extractRiskPatterns(cases)
  
  // Search operation manual
  const policies = await operation_manual_semantic_search({
    query: appType,
    size: 30
  })
  
  // Extract rules from policies
  const rules = extractRules(policies)
  
  return { riskPatterns, rules, queryPatterns: [] }
}
```

## Step 4: Merge

### Load Existing

```typescript
async function loadExisting(
  skillPath: string,
  targetFile: string
): Promise<any> {
  const filePath = path.join(skillPath, 'references', targetFile)
  
  if (!fs.existsSync(filePath)) {
    return null
  }
  
  const content = await fs.readFile(filePath, 'utf-8')
  
  if (targetFile.endsWith('.json')) {
    return JSON.parse(content)
  }
  
  return content
}
```

### Apply Merge Strategy

```typescript
function mergeContent(
  existing: any,
  extracted: any,
  mode: MergeMode,
  preferSource: boolean
): { merged: any; changes: Change[] } {
  const changes: Change[] = []
  
  switch (mode) {
    case 'merge':
      return mergeWithExisting(existing, extracted, preferSource, changes)
    
    case 'replace':
      changes.push({ type: 'replace', reason: 'Full replacement' })
      return { merged: extracted, changes }
    
    case 'append':
      return appendNew(existing, extracted, changes)
    
    default:
      throw new Error(`Unknown merge mode: ${mode}`)
  }
}
```

### Merge Risk Patterns

```typescript
function mergeRiskPatterns(
  existing: RiskPattern[],
  extracted: RiskPattern[],
  preferSource: boolean,
  changes: Change[]
): RiskPattern[] {
  const result = [...existing]
  const existingIds = new Set(existing.map(p => p.pattern_id))
  
  for (const pattern of extracted) {
    if (existingIds.has(pattern.pattern_id)) {
      // Conflict
      if (preferSource) {
        const idx = result.findIndex(p => p.pattern_id === pattern.pattern_id)
        changes.push({
          type: 'update',
          id: pattern.pattern_id,
          reason: 'Source preferred'
        })
        result[idx] = pattern
      } else {
        changes.push({
          type: 'skip',
          id: pattern.pattern_id,
          reason: 'Existing preserved'
        })
      }
    } else {
      // New pattern
      changes.push({
        type: 'add',
        id: pattern.pattern_id,
        reason: 'New pattern'
      })
      result.push(pattern)
    }
  }
  
  return result
}
```

## Step 5: Validate Output

### JSON Schema Validation

```typescript
async function validateJSON(
  data: any,
  schemaFile: string
): Promise<ValidationResult> {
  const schema = await loadSchema(schemaFile)
  const validator = new JSONValidator(schema)
  
  return validator.validate(data)
}
```

### Citation Verification

```typescript
async function verifyCitations(
  patterns: RiskPattern[]
): Promise<CitationVerification[]> {
  const results: CitationVerification[] = []
  
  for (const pattern of patterns) {
    for (const ref of pattern.case_references || []) {
      const exists = await caselaw_authority({
        citation: ref.citation
      })
      
      results.push({
        citation: ref.citation,
        pattern_id: pattern.pattern_id,
        valid: exists.found,
        error: exists.found ? null : 'Citation not found'
      })
    }
  }
  
  return results
}
```

### Consistency Check

```typescript
function checkConsistency(
  merged: any,
  manifest: Manifest
): ConsistencyResult {
  const issues: string[] = []
  
  // Check all referenced files exist
  for (const file of manifest.files) {
    if (!fs.existsSync(file.path)) {
      issues.push(`Missing file: ${file.path}`)
    }
  }
  
  // Check no duplicate IDs
  if (Array.isArray(merged.patterns)) {
    const ids = merged.patterns.map(p => p.pattern_id)
    const uniqueIds = new Set(ids)
    if (ids.length !== uniqueIds.size) {
      issues.push('Duplicate pattern IDs found')
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  }
}
```

## Step 6: Write

### Write Updated Files

```typescript
async function writeUpdates(
  skillPath: string,
  updates: Map<string, any>
): Promise<void> {
  for (const [filename, content] of updates) {
    const filePath = path.join(skillPath, 'references', filename)
    
    if (filename.endsWith('.json')) {
      await fs.writeFile(filePath, JSON.stringify(content, null, 2))
    } else {
      await fs.writeFile(filePath, content)
    }
  }
}
```

### Update Manifest

```typescript
async function updateManifest(
  skillPath: string,
  changes: Change[]
): Promise<void> {
  const manifestPath = path.join(skillPath, 'references', 'manifest.json')
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'))
  
  manifest.last_updated = new Date().toISOString().split('T')[0]
  manifest.update_history = manifest.update_history || []
  manifest.update_history.push({
    date: manifest.last_updated,
    changes: changes.length,
    summary: summarizeChanges(changes)
  })
  
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
}
```

### Generate Change Report

```typescript
function generateReport(
  app: string,
  skill: string,
  mode: string,
  changes: Change[],
  verification: VerificationResult
): string {
  const report = `
## Knowledge Update Summary

**App:** ${app}
**Skill:** ${skill}
**Mode:** ${mode}
**Date:** ${new Date().toISOString()}

### Changes

${formatChanges(changes)}

### Verification

${formatVerification(verification)}

### Backup Location

\`.claude/skills/${app}-${skill}/references/.backup/${new Date().toISOString().split('T')[0]}/\`
`
  return report.trim()
}
```
