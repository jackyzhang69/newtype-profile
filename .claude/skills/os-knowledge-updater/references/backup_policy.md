# Backup and Rollback Policy

How backups are created and managed during knowledge updates.

## Automatic Backups

### When Backups Are Created

Backups are created automatically:
- Before any `replace` mode operation
- Before any `merge` with `--prefer-source`
- When `--backup` flag is explicitly set
- When updating more than 3 files at once

### Backup Location

```
.claude/skills/{app}-{skill}/references/.backup/
└── {YYYY-MM-DD}/
    └── {HH-MM-SS}/
        ├── risk_patterns.json
        ├── baseline_rules.md
        ├── manifest.json
        └── _metadata.json
```

### Metadata File

Each backup includes metadata:

```json
{
  "backup_date": "2026-01-25T14:30:00Z",
  "app": "spousal",
  "skill": "audit-rules",
  "operation": "update",
  "mode": "replace",
  "source": "mcp",
  "files_backed_up": [
    "risk_patterns.json",
    "baseline_rules.md",
    "manifest.json"
  ],
  "trigger": "replace_mode"
}
```

## Backup Retention

### Default Policy

| Backup Age | Action |
|------------|--------|
| < 7 days | Keep all |
| 7-30 days | Keep one per day |
| 30-90 days | Keep one per week |
| > 90 days | Delete |

### Configuration

In `.claude/skills/{app}-{skill}/references/.backup/policy.json`:

```json
{
  "retention": {
    "days_full": 7,
    "days_daily": 30,
    "days_weekly": 90,
    "max_backups": 50
  },
  "auto_cleanup": true,
  "compress_after_days": 7
}
```

## Manual Backup

### Create Backup

```bash
# Backup specific skill
/os-update-knowledge spousal --backup-only --skill audit-rules

# Backup all skills for an app
/os-update-knowledge spousal --backup-only --skill all
```

### List Backups

```bash
# List all backups for a skill
ls -la .claude/skills/spousal-audit-rules/references/.backup/

# Or use command
/os-update-knowledge spousal --list-backups --skill audit-rules
```

Output:
```
Backups for spousal-audit-rules:

| Date | Time | Files | Size | Mode |
|------|------|-------|------|------|
| 2026-01-25 | 14:30 | 3 | 45KB | replace |
| 2026-01-24 | 10:15 | 3 | 42KB | merge |
| 2026-01-20 | 09:00 | 3 | 38KB | replace |
```

## Rollback

### Rollback to Specific Date

```bash
# Rollback to date
/os-update-knowledge spousal --rollback 2026-01-24 --skill audit-rules

# Rollback to specific backup
/os-update-knowledge spousal --rollback 2026-01-24/10-15-00 --skill audit-rules
```

### Rollback Process

```
1. Validate backup exists
2. Create backup of current state (pre-rollback)
3. Copy backup files to references/
4. Update manifest.json
5. Verify restored files
6. Report completion
```

### Rollback Report

```markdown
## Rollback Complete

**App:** spousal
**Skill:** audit-rules
**Restored From:** 2026-01-24 10:15:00

### Files Restored

| File | Current → Restored |
|------|-------------------|
| risk_patterns.json | 18 patterns → 15 patterns |
| baseline_rules.md | 245 lines → 230 lines |

### Pre-Rollback Backup

Created: `.backup/2026-01-25/14-35-00/` (before rollback)

### Verification

- All files restored: ✓
- JSON valid: ✓
- Manifest updated: ✓
```

## Recovery Scenarios

### Scenario 1: Accidental Replace

**Problem:** Used `--mode replace` and lost important patterns.

**Solution:**
```bash
# List recent backups
/os-update-knowledge spousal --list-backups --skill audit-rules

# Rollback to before the replace
/os-update-knowledge spousal --rollback 2026-01-25/10-00-00 --skill audit-rules
```

### Scenario 2: Bad MCP Extraction

**Problem:** MCP extraction produced low-quality patterns.

**Solution:**
```bash
# Rollback
/os-update-knowledge spousal --rollback 2026-01-24 --skill audit-rules

# Re-run with different parameters
/os-update-knowledge spousal --source mcp --count 100 --mode merge
```

### Scenario 3: Merge Conflict Resolution

**Problem:** Merge conflicts resolved incorrectly.

**Solution:**
```bash
# Rollback
/os-update-knowledge spousal --rollback 2026-01-24 --skill audit-rules

# Re-run with interactive mode
/os-update-knowledge spousal --source mcp --mode merge --interactive
```

### Scenario 4: Partial Recovery

**Problem:** Only need to restore one file.

**Solution:**
```bash
# Copy single file from backup
cp .claude/skills/spousal-audit-rules/references/.backup/2026-01-24/risk_patterns.json \
   .claude/skills/spousal-audit-rules/references/risk_patterns.json

# Or use command
/os-update-knowledge spousal --rollback 2026-01-24 --skill audit-rules --file risk_patterns.json
```

## Backup Cleanup

### Manual Cleanup

```bash
# Remove backups older than 30 days
/os-update-knowledge spousal --cleanup-backups --older-than 30d --skill audit-rules

# Remove all backups except latest 5
/os-update-knowledge spousal --cleanup-backups --keep-latest 5 --skill audit-rules
```

### Automatic Cleanup

Runs after each update operation:
1. Check backup count against policy
2. Apply retention rules
3. Compress old backups
4. Delete expired backups

### Compressed Backups

Backups older than 7 days are compressed:

```
.backup/2026-01-15/
└── backup.tar.gz
```

To restore from compressed backup:
```bash
/os-update-knowledge spousal --rollback 2026-01-15 --skill audit-rules
# Automatically extracts and restores
```

## Best Practices

1. **Always verify before replace mode**
   ```bash
   /os-update-knowledge spousal --source mcp --mode replace --dry-run
   ```

2. **Keep at least one manual backup**
   ```bash
   /os-update-knowledge spousal --backup-only --skill all
   ```

3. **Review backup policy periodically**
   - Adjust retention based on update frequency
   - Increase max_backups for critical apps

4. **Document significant rollbacks**
   - Why rollback was needed
   - What was learned
   - How to prevent in future
