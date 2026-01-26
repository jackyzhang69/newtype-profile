import { getSupabaseClient } from "../client"
import type {
  AuditSession,
  CreateSessionInput,
  UpdateSessionInput,
} from "../types"

const TABLE_NAME = "io_audit_sessions"

export async function createSession(input: CreateSessionInput): Promise<AuditSession> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .insert({
      case_id: input.case_id,
      case_slot: input.case_slot,
      tier: input.tier,
      app_type: input.app_type,
      user_id: input.user_id ?? null,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`)
  }

  return data as AuditSession
}

export async function getSession(sessionId: string): Promise<AuditSession | null> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("id", sessionId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to get session: ${error.message}`)
  }

  return data as AuditSession
}

export async function updateSession(
  sessionId: string,
  input: UpdateSessionInput
): Promise<AuditSession> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .update(input)
    .eq("id", sessionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update session: ${error.message}`)
  }

  return data as AuditSession
}

export async function updateSessionStatus(
  sessionId: string,
  status: AuditSession["status"],
  currentStage?: string
): Promise<void> {
  const client = getSupabaseClient()
  
  const updateData: Record<string, unknown> = { status }
  if (currentStage !== undefined) {
    updateData.current_stage = currentStage
  }

  const { error } = await client
    .from(TABLE_NAME)
    .update(updateData)
    .eq("id", sessionId)

  if (error) {
    throw new Error(`Failed to update session status: ${error.message}`)
  }
}

export async function addCompletedStage(
  sessionId: string,
  stage: string
): Promise<void> {
  const session = await getSession(sessionId)
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`)
  }

  const stagesCompleted = [...(session.stages_completed || []), stage]
  
  const client = getSupabaseClient()
  const { error } = await client
    .from(TABLE_NAME)
    .update({ stages_completed: stagesCompleted })
    .eq("id", sessionId)

  if (error) {
    throw new Error(`Failed to add completed stage: ${error.message}`)
  }
}

export async function completeSession(
  sessionId: string,
  result: {
    verdict: NonNullable<AuditSession["verdict"]>
    score: number
    score_with_mitigation?: number
    recommendation: NonNullable<AuditSession["recommendation"]>
  }
): Promise<AuditSession> {
  return updateSession(sessionId, {
    status: "completed",
    verdict: result.verdict,
    score: result.score,
    score_with_mitigation: result.score_with_mitigation,
    recommendation: result.recommendation,
  })
}

export async function failSession(
  sessionId: string,
  errorMessage: string
): Promise<AuditSession> {
  return updateSession(sessionId, {
    status: "failed",
    error_message: errorMessage,
  })
}

export async function listSessions(options?: {
  userId?: string
  status?: AuditSession["status"]
  limit?: number
  offset?: number
}): Promise<AuditSession[]> {
  const client = getSupabaseClient()
  
  let query = client
    .from(TABLE_NAME)
    .select()
    .order("created_at", { ascending: false })

  if (options?.userId) {
    query = query.eq("user_id", options.userId)
  }
  if (options?.status) {
    query = query.eq("status", options.status)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to list sessions: ${error.message}`)
  }

  return data as AuditSession[]
}

export class OptimisticLockError extends Error {
  constructor(
    public sessionId: string,
    public expectedVersion: number,
    public actualVersion?: number
  ) {
    super(`Optimistic lock failed: session ${sessionId} version mismatch (expected ${expectedVersion}, got ${actualVersion ?? 'unknown'})`)
    this.name = "OptimisticLockError"
  }
}

export async function updateSessionOptimistic(
  sessionId: string,
  expectedVersion: number,
  input: UpdateSessionInput
): Promise<AuditSession> {
  const client = getSupabaseClient()
  
  const { data, error } = await client.rpc("update_session_optimistic", {
    p_session_id: sessionId,
    p_expected_version: expectedVersion,
    p_updates: input,
  })

  if (error) {
    throw new Error(`Failed to update session: ${error.message}`)
  }

  if (!data) {
    const current = await getSession(sessionId)
    throw new OptimisticLockError(sessionId, expectedVersion, current?.version)
  }

  return data as AuditSession
}

export async function updateSessionWithRetry(
  sessionId: string,
  updateFn: (session: AuditSession) => UpdateSessionInput,
  maxRetries: number = 3
): Promise<AuditSession> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const session = await getSession(sessionId)
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`)
    }

    try {
      const updates = updateFn(session)
      return await updateSessionOptimistic(sessionId, session.version, updates)
    } catch (err) {
      if (err instanceof OptimisticLockError) {
        lastError = err
        continue
      }
      throw err
    }
  }

  throw lastError ?? new Error(`Failed to update session after ${maxRetries} retries`)
}
