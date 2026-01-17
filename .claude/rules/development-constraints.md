---
globs: ["src/**"]
alwaysApply: false
---

# Development Constraints

## Core Rules

### DO
- Business logic in `src/audit-core/` ONLY
- Use Bun for all package operations
- Follow TDD: RED -> GREEN -> REFACTOR
- Run `lsp_diagnostics` after edits
- Run `bun test` before completing tasks

### DO NOT
- Modify `src/index.ts` (plugin core initialization)
- Use npm or yarn
- Suppress type errors with `as any`, `@ts-ignore`, `@ts-expect-error`
- Delete failing tests to "pass"
- Commit without explicit request

## Audit-Specific Constraints

### Business Logic Location
```
src/audit-core/           # ALL audit business logic here
├── agents/               # Agent implementations
├── apps/                 # App-specific (spousal, study)
├── tiers/                # Tier configuration
├── knowledge/            # Knowledge loading
└── search/               # Search policy
```

### Off-Limits Files
- `src/index.ts` - Plugin core
- `src/agents/index.ts` - Framework agents (only add, don't modify)
- `src/hooks/` - Framework hooks
- `src/tools/` - Framework tools

### Testing Requirements
- New features require tests
- Bug fixes require regression tests
- Use BDD comments: `#given`, `#when`, `#then`
- Test file naming: `*.test.ts` alongside source

## Tier-Aware Development

When modifying audit agents:
1. Check tier config in `src/audit-core/tiers/config.ts`
2. Use dynamic getters from `src/audit-core/types.ts`
3. Test across all tiers (guest, pro, ultra)
