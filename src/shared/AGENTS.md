# SHARED UTILITIES KNOWLEDGE BASE

## OVERVIEW

Cross-cutting utilities: path resolution, config management, text processing, Claude Code compatibility helpers.

## STRUCTURE

```
shared/
├── index.ts              # Barrel export
├── claude-config-dir.ts  # ~/.claude resolution
├── command-executor.ts   # Shell exec with variable expansion
├── config-errors.ts      # Global error tracking
├── config-path.ts        # User/project config paths
├── data-path.ts          # XDG data directory
├── deep-merge.ts         # Type-safe recursive merge
├── dynamic-truncator.ts  # Token-aware truncation
├── file-reference-resolver.ts  # @filename syntax
├── file-utils.ts         # Symlink, markdown detection
├── frontmatter.ts        # YAML frontmatter parsing
├── hook-disabled.ts      # Check if hook disabled
├── jsonc-parser.ts       # JSON with Comments
├── logger.ts             # File-based logging
├── migration.ts          # Legacy name migration (oh-my-opencode → immi-os)
├── migration.test.ts     # TDD tests for migration utilities
├── model-sanitizer.ts    # Normalize model names
├── pattern-matcher.ts    # Tool name matching
├── snake-case.ts         # Case conversion
└── tool-name.ts          # PascalCase normalization
```

## WHEN TO USE

| Task | Utility |
|------|---------|
| Find ~/.claude | `getClaudeConfigDir()` |
| Merge configs | `deepMerge(base, override)` |
| Parse user files | `parseJsonc()` |
| Check hook enabled | `isHookDisabled(name, list)` |
| Truncate output | `dynamicTruncate(text, budget)` |
| Resolve @file | `resolveFileReferencesInText()` |
| Execute shell | `resolveCommandsInText()` |
| Legacy names | `migrateAgentNames()`, `migrateHookNames()`, `migrateConfigFile()` |

## CRITICAL PATTERNS

```typescript
// Dynamic truncation
const output = dynamicTruncate(result, remainingTokens, 0.5)

// Deep merge priority
const final = deepMerge(deepMerge(defaults, userConfig), projectConfig)

// Safe JSONC
const { config, error } = parseJsoncSafe(content)
```

## AGENT NAME MIGRATION

Legacy oh-my-opencode agent names are auto-migrated to immi-os names:

| Legacy Name | Current Name | Purpose |
|-------------|--------------|---------|
| chief, omo, OmO, sisyphus, prometheus | `audit-manager` | Primary orchestrator |
| oracle, explore | `researcher` | Research/exploration |
| librarian | `archivist` | Documentation/archives |
| frontend-ui-ux-engineer, document-writer | `writer` | Content generation |
| multimodal-looker | `extractor` | PDF/image extraction |
| build | `deputy` | Task execution |

**Hook name migration:**
- `anthropic-auto-compact` → `anthropic-context-window-limit-recovery`

## ANTI-PATTERNS

- Hardcoding paths (use getClaudeConfigDir, getUserConfigPath)
- JSON.parse for user files (use parseJsonc)
- Ignoring truncation (large outputs MUST use dynamicTruncate)
- Direct string concat for configs (use deepMerge)
- Using legacy agent names in new code (use current names from AGENT_NAME_MAP)
