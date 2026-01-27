# Workflow State Migration: File System → Supabase

## Task Overview

**Objective**: Migrate WorkflowEngine state management from local file system (`cases/.audit-checkpoints/*.json`) to Supabase database

**Background**:
- Supabase is fully integrated (10 tables, Repository layer, Storage)
- Currently using dual persistence: Supabase (business data) + file checkpoint (workflow state)
- Code analysis confirms: WorkflowEngine 100% uses file system, zero Supabase integration
- Requirement: Remove file checkpoint completely, use Supabase exclusively

**Keep Unchanged**:
- Final report storage: Keep dual-track (local files + Supabase Storage)

---

## Current Architecture Analysis (Code Audit Results)

### File System Checkpoint (Currently in Use)

**Location**: `cases/.audit-checkpoints/{sessionId}.json`

**WorkflowEngine Actual Implementation**:
- Constructor loads from file: `this.loadStateFromFile(sessionId)`
- All state changes call: `this.saveState()` (atomic write to file system)
- State changes at: `getNextStage()`, `markStageComplete()`, `incrementRetry()`, `getProgress()`
- **Conclusion**: WorkflowEngine is 100% file system dependent

---

### Supabase Current Structure (Partially Implemented)

**io_audit_sessions table** (existing fields):
- ✅ `current_stage` (text)
- ✅ `stages_completed` (text[])
- ❌ `workflow_type` (missing)
- ❌ `stage_outputs` (jsonb - missing)
- ❌ `stage_retries` (jsonb - missing)
- ❌ `workflow_started_at` (timestamptz - missing)

**session.repository.ts** (existing methods):
- ✅ `addCompletedStage(sessionId, stage)` - updates stages_completed
- ✅ `updateSessionStatus(sessionId, status, currentStage)` - updates current_stage
- ❌ Missing: Complete workflow state getters/setters

**AuditSessionService** (exists at line 87+):
- Coordinates Supabase persistence
- But WorkflowEngine doesn't use it for state management

---

## Migration Plan

### Phase 1: Database Schema Extension

**New Migration**: `supabase/migrations/20260127120000_add_workflow_state_fields.sql`

Add to `io_audit_sessions` table:
```sql
ALTER TABLE io_audit_sessions
  ADD COLUMN IF NOT EXISTS workflow_type text,
  ADD COLUMN IF NOT EXISTS stage_outputs jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS stage_retries jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS workflow_started_at timestamptz;

ALTER TABLE io_audit_sessions
  ADD CONSTRAINT check_workflow_type
  CHECK (workflow_type IS NULL OR workflow_type IN (
    'risk_audit', 'document_list', 'client_guidance',
    'initial_assessment', 'final_review', 'refusal_analysis'
  ));

CREATE INDEX IF NOT EXISTS idx_io_audit_sessions_workflow_type
  ON io_audit_sessions(workflow_type);
```

### Phase 2: Repository Layer Extension

**File**: `src/audit-core/persistence/repositories/session.repository.ts`

**New Methods**:
```typescript
// 1. Get workflow state
export async function getWorkflowState(sessionId: string): Promise<WorkflowState | null> {
  const session = await getSession(sessionId)
  if (!session) return null
  return {
    sessionId: session.id,
    workflowType: session.workflow_type!,
    tier: session.tier,
    currentStage: session.current_stage ?? null,
    completedStages: session.stages_completed ?? [],
    outputs: session.stage_outputs ?? {},
    retries: session.stage_retries ?? {},
    startedAt: session.workflow_started_at ?? session.created_at,
    updatedAt: session.updated_at,
  }
}

// 2. Save workflow state
export async function saveWorkflowState(
  sessionId: string,
  state: Partial<WorkflowState>
): Promise<void> {
  const updateData: Record<string, any> = {}
  if (state.workflowType !== undefined) updateData.workflow_type = state.workflowType
  if (state.currentStage !== undefined) updateData.current_stage = state.currentStage
  if (state.completedStages !== undefined) updateData.stages_completed = state.completedStages
  if (state.outputs !== undefined) updateData.stage_outputs = state.outputs
  if (state.retries !== undefined) updateData.stage_retries = state.retries
  if (state.startedAt !== undefined) updateData.workflow_started_at = state.startedAt

  await updateSession(sessionId, updateData)
}

// 3. Mark stage complete
export async function markStageComplete(
  sessionId: string,
  stageId: string,
  output: any
): Promise<void> {
  const state = await getWorkflowState(sessionId)
  if (!state) throw new Error(`Session not found: ${sessionId}`)

  const completedStages = [...new Set([...state.completedStages, stageId])]
  const outputs = { ...state.outputs, [stageId]: output }

  await saveWorkflowState(sessionId, {
    completedStages,
    outputs,
    currentStage: null,
  })
}

// 4. Increment retry count
export async function incrementStageRetry(
  sessionId: string,
  stageId: string
): Promise<number> {
  const state = await getWorkflowState(sessionId)
  if (!state) throw new Error(`Session not found: ${sessionId}`)

  const retries = { ...state.retries }
  const currentRetries = (retries[stageId] ?? 0) + 1
  retries[stageId] = currentRetries

  await saveWorkflowState(sessionId, { retries })
  return currentRetries
}
```

### Phase 3: WorkflowEngine Refactor

**File**: `src/audit-core/workflow/engine.ts`

**Key Changes**:
1. Remove `checkpointDir` parameter from constructor
2. Replace `loadStateFromFile()` with async load from Supabase
3. Replace all `saveState()` calls with `saveStateToSupabase()`
4. Make constructor async or use static factory method `WorkflowEngine.create()`
5. Remove all file system code (fs imports, directory creation, etc.)

**Core Implementation Pattern**:
```typescript
export class WorkflowEngine {
  private state: WorkflowState
  private definition: WorkflowDefinition

  // ✅ Static factory for async initialization
  static async create(
    workflowType: string,
    tier: AuditTier,
    sessionId: string
  ): Promise<WorkflowEngine> {
    const engine = new WorkflowEngine(workflowType, tier, sessionId)
    await engine.initialize()
    return engine
  }

  private constructor(...) {
    this.definition = this.loadDefinition(workflowType)
  }

  // ✅ Load from Supabase
  private async initialize() {
    const existingState = await getWorkflowState(this.sessionId)
    if (existingState) {
      this.state = existingState
    } else {
      this.state = { sessionId, workflowType, tier, ... }
      await this.saveStateToSupabase()
    }
  }

  // ✅ Save to Supabase
  private async saveStateToSupabase(): Promise<void> {
    this.state.updatedAt = new Date().toISOString()
    await saveWorkflowState(this.state.sessionId, this.state)
  }

  // ✅ Replace all saveState() calls
  async markStageComplete(stageId: string, output: unknown): Promise<void> {
    this.state.completedStages.push(stageId)
    this.state.outputs[stageId] = output
    this.state.currentStage = null

    await this.saveStateToSupabase()  // ← Supabase, not file system
  }

  // ✅ Static method to load state
  static async loadState(sessionId: string): Promise<WorkflowState | null> {
    return await getWorkflowState(sessionId)
  }
}
```

### Phase 4: Workflow Tools Adaptation

**File**: `src/tools/workflow-manager/tools.ts`

**Update workflow_next, workflow_complete, workflow_status**:
```typescript
export const workflow_next = tool({
  args: { session_id: tool.schema.string() },
  execute: async ({ session_id }) => {
    // ✅ Load state from Supabase
    const state = await WorkflowEngine.loadState(session_id)
    if (!state) throw new Error(`Workflow state not found: ${session_id}`)

    const engine = await WorkflowEngine.create(state.workflowType, state.tier, session_id)
    const stage = await engine.getNextStage()

    return stage
      ? { stage: stage.stage, agent: stage.agent, description: stage.description }
      : { status: "complete" }
  }
})
```

### Phase 5: Cleanup

1. Remove file system code from WorkflowEngine
2. Delete checkpoint file write logic
3. Update documentation (.claude/AGENTS.md, CLAUDE.md)
4. Preserve checkpoint directory for backward compatibility (don't delete)

### Phase 6: Data Migration (Optional)

**Script**: `script/migrate-checkpoints-to-supabase.ts`

For migrating existing checkpoint files to Supabase (if needed).

---

## Implementation Steps

| Phase | Task | Time | Files |
|-------|------|------|-------|
| 1 | Database Schema | 15 min | supabase/migrations/20260127120000_*.sql |
| 2 | Repository Layer | 30 min | src/audit-core/persistence/repositories/session.repository.ts |
| 3 | WorkflowEngine | 60 min | src/audit-core/workflow/engine.ts |
| 4 | Tools Adaptation | 30 min | src/tools/workflow-manager/tools.ts |
| 5 | Cleanup & Tests | 45 min | Various |
| 6 | Data Migration (opt) | 30 min | script/migrate-checkpoints-to-supabase.ts |
| **Total** | | **3.5 hours** | |

---

## Verification Plan

### Unit Tests
- Test `getWorkflowState()` and `saveWorkflowState()`
- Test `markStageComplete()` updates outputs correctly
- Test `incrementStageRetry()` increases counter

### Integration Tests
- Execute complete workflow (intake → detective → ... → reporter)
- Verify state persists in Supabase
- Verify checkpoint files are NOT created

### Manual Tests
1. Create audit → verify Supabase has initial state
2. Complete stages → verify outputs and retries updated in DB
3. Interrupt and resume → verify recovery from Supabase (not file)
4. Check `cases/.audit-checkpoints/` → confirm no new files

---

## Success Criteria

- [ ] All workflow types execute normally (risk-audit, document-list, etc.)
- [ ] workflow_next/complete/status tools work correctly
- [ ] Workflow interruption + resume recovers state from Supabase
- [ ] No new files created in `cases/.audit-checkpoints/`
- [ ] All tests pass
- [ ] Performance: state operations < 200ms

---

## Files Modified

### New Files (2)
- `supabase/migrations/20260127120000_add_workflow_state_fields.sql`
- `script/migrate-checkpoints-to-supabase.ts` (optional)

### Modified Files (5)
- `src/audit-core/persistence/repositories/session.repository.ts` (add 4 methods)
- `src/audit-core/workflow/engine.ts` (refactor for Supabase)
- `src/tools/workflow-manager/tools.ts` (adapt 3 tools)
- `.claude/AGENTS.md` (documentation)
- `CLAUDE.md` (documentation)

---

## Risks & Mitigation

### Risk 1: Async Constructor
**Issue**: Breaking change to WorkflowEngine constructor
**Mitigation**: Use static factory method `WorkflowEngine.create()`

### Risk 2: Supabase Unavailable
**Issue**: If Supabase down, workflow fails
**Mitigation**: Add retry logic, clear error messages

### Risk 3: Concurrent Updates
**Issue**: Multiple processes updating same session
**Mitigation**: Use optimistic locking already in io_audit_sessions

### Risk 4: Data Loss During Migration
**Issue**: Checkpoint files not migrated
**Mitigation**: Keep backup, verify migration completeness

---

## Timeline

**Status**: Ready for implementation (code audit complete)
**Next Step**: Execute Phase 1 (Database Schema)

---

## Notes

- Code audit completed 2026-01-27
- Latest commit: `2f65cb3` (misc docs/improvements, no workflow state changes)
- WorkflowEngine unchanged since `782f0c5` (uses file system only)
- AuditSessionService exists but WorkflowEngine doesn't use it yet
- This plan bridges the gap between WorkflowEngine and Supabase
