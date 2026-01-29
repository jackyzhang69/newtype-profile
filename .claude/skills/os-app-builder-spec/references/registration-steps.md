# Registration Steps (Assembly to System)

Adding a new App Type requires updating **multiple layers** for type safety and complete support.

## Step 1: TypeScript Type Definition

**File:** `src/audit-core/types/case-profile.ts`

```typescript
// Add to ApplicationType union
export type ApplicationType =
  | "spousal"
  | "study"
  | "work"
  | "family"
  | "{app-type}"  // NEW
  | "other";
```

## Step 2: Database Migration

**File:** `supabase/migrations/YYYYMMDD_add_{app-type}_app_type.sql`

```sql
-- Update io_audit_sessions table CHECK constraint
ALTER TABLE io_audit_sessions
DROP CONSTRAINT IF EXISTS io_audit_sessions_app_type_check;

ALTER TABLE io_audit_sessions
ADD CONSTRAINT io_audit_sessions_app_type_check
CHECK (app_type IN ('spousal', 'study', 'work', 'family', '{app-type}', 'other'));
```

## Step 3: Tool Schema Update

**File:** `src/tools/audit-persistence/tools.ts`

```typescript
// Update audit_session_start app_type enum
app_type: tool.schema
  .enum(["spousal", "study", "work", "family", "{app-type}", "other"])
  .describe("Application type"),
```

## Registration Checklist

| Step | File                                   | Action                            |
| ---- | -------------------------------------- | --------------------------------- |
| 1    | `src/audit-core/types/case-profile.ts` | Add to `ApplicationType` union    |
| 2    | `supabase/migrations/`                 | Create migration to update CHECK  |
| 3    | `src/tools/audit-persistence/tools.ts` | Update `app_type` enum schema     |
| 4    | Run `bun run typecheck`                | Ensure type consistency           |
| 5    | Run `bun test`                         | Ensure no regression              |
| 6    | Run `bun run build`                    | Regenerate audit-manifest.json    |
| 7    | Execute SQL migration                  | Apply to Supabase                 |

> **Design Principle**: App Type is finite and stable (immigration application types). Hardcoding ensures type safety. Adding a new app is a major feature requiring corresponding skills, not just adding a string.
