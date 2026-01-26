import { getSupabaseClient } from "../client"
import type { StageResult, CreateStageResultInput, StageType } from "../types"

const TABLE_NAME = "io_stage_results"
const UNIQUE_VIOLATION_CODE = "23505"

export async function saveStageResult(
  sessionId: string,
  input: CreateStageResultInput
): Promise<StageResult> {
  const client = getSupabaseClient()
  const iteration = input.iteration ?? 1
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .insert({
      session_id: sessionId,
      stage: input.stage,
      iteration,
      agent_model: input.agent_model ?? null,
      temperature: input.temperature ?? null,
      duration_ms: input.duration_ms ?? null,
      output_data: input.output_data,
      status: input.status ?? null,
      summary: input.summary ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === UNIQUE_VIOLATION_CODE) {
      const existing = await getStageResult(sessionId, input.stage, iteration)
      if (existing) return existing
    }
    throw new Error(`Failed to save stage result: ${error.message}`)
  }

  return data as StageResult
}

export async function getStageResults(sessionId: string): Promise<StageResult[]> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(`Failed to get stage results: ${error.message}`)
  }

  return data as StageResult[]
}

export async function getStageResult(
  sessionId: string,
  stage: StageType,
  iteration = 1
): Promise<StageResult | null> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("session_id", sessionId)
    .eq("stage", stage)
    .eq("iteration", iteration)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to get stage result: ${error.message}`)
  }

  return data as StageResult
}

export async function getLatestStageResult(
  sessionId: string,
  stage: StageType
): Promise<StageResult | null> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("session_id", sessionId)
    .eq("stage", stage)
    .order("iteration", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to get latest stage result: ${error.message}`)
  }

  return data as StageResult
}

export async function countStageIterations(
  sessionId: string,
  stage: StageType
): Promise<number> {
  const client = getSupabaseClient()
  
  const { count, error } = await client
    .from(TABLE_NAME)
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("stage", stage)

  if (error) {
    throw new Error(`Failed to count stage iterations: ${error.message}`)
  }

  return count ?? 0
}
