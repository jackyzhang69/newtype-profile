import { getSupabaseClient } from "../client"
import type { AuditLogEntry, CreateAuditLogInput } from "../types"

const TABLE_NAME = "io_audit_log"

export async function log(
  sessionId: string | null,
  input: CreateAuditLogInput
): Promise<AuditLogEntry> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .insert({
      session_id: sessionId,
      event_type: input.event_type,
      event_data: input.event_data ?? null,
      stage: input.stage ?? null,
      agent_name: input.agent_name ?? null,
      error_code: input.error_code ?? null,
      error_message: input.error_message ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create audit log: ${error.message}`)
  }

  return data as AuditLogEntry
}

export async function logStageStart(
  sessionId: string,
  stage: string,
  agentName?: string
): Promise<AuditLogEntry> {
  return log(sessionId, {
    event_type: "stage_start",
    stage,
    agent_name: agentName,
    event_data: { started_at: new Date().toISOString() },
  })
}

export async function logStageComplete(
  sessionId: string,
  stage: string,
  agentName?: string,
  durationMs?: number
): Promise<AuditLogEntry> {
  return log(sessionId, {
    event_type: "stage_complete",
    stage,
    agent_name: agentName,
    event_data: {
      completed_at: new Date().toISOString(),
      duration_ms: durationMs,
    },
  })
}

export async function logError(
  sessionId: string | null,
  errorCode: string,
  errorMessage: string,
  context?: { stage?: string; agent_name?: string; event_data?: Record<string, unknown> }
): Promise<AuditLogEntry> {
  return log(sessionId, {
    event_type: "error",
    error_code: errorCode,
    error_message: errorMessage,
    stage: context?.stage,
    agent_name: context?.agent_name,
    event_data: context?.event_data,
  })
}

export async function logWarning(
  sessionId: string,
  message: string,
  context?: { stage?: string; event_data?: Record<string, unknown> }
): Promise<AuditLogEntry> {
  return log(sessionId, {
    event_type: "warning",
    error_message: message,
    stage: context?.stage,
    event_data: context?.event_data,
  })
}

export async function getLogs(
  sessionId: string,
  options?: {
    eventType?: string
    limit?: number
  }
): Promise<AuditLogEntry[]> {
  const client = getSupabaseClient()
  
  let query = client
    .from(TABLE_NAME)
    .select()
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })

  if (options?.eventType) {
    query = query.eq("event_type", options.eventType)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to get audit logs: ${error.message}`)
  }

  return data as AuditLogEntry[]
}

export async function getErrors(sessionId: string): Promise<AuditLogEntry[]> {
  return getLogs(sessionId, { eventType: "error" })
}
