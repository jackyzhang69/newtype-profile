import { getSupabaseClient } from "../client"
import type { CasePII, CreateCasePIIInput } from "../types"

const TABLE_NAME = "io_case_pii"

export async function createCasePII(input: CreateCasePIIInput): Promise<CasePII> {
  const client = getSupabaseClient()
  
  const { data: deleteAt } = await client.rpc("calculate_pii_delete_at")
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .insert({
      session_id: input.session_id,
      delete_at: deleteAt,
      sponsor_full_name: input.sponsor_full_name ?? null,
      sponsor_family_name: input.sponsor_family_name ?? null,
      sponsor_given_name: input.sponsor_given_name ?? null,
      sponsor_dob: input.sponsor_dob ?? null,
      sponsor_passport: input.sponsor_passport ?? null,
      sponsor_uci: input.sponsor_uci ?? null,
      sponsor_contact: input.sponsor_contact ?? null,
      applicant_full_name: input.applicant_full_name ?? null,
      applicant_family_name: input.applicant_family_name ?? null,
      applicant_given_name: input.applicant_given_name ?? null,
      applicant_dob: input.applicant_dob ?? null,
      applicant_passport: input.applicant_passport ?? null,
      applicant_uci: input.applicant_uci ?? null,
      applicant_contact: input.applicant_contact ?? null,
      dependents_pii: input.dependents_pii ?? null,
      raw_document_paths: input.raw_document_paths ?? [],
      user_id: input.user_id ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create case PII: ${error.message}`)
  }

  return data as CasePII
}

export async function getCasePIIBySession(sessionId: string): Promise<CasePII | null> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("session_id", sessionId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to get case PII: ${error.message}`)
  }

  return data as CasePII
}

export async function updateCasePII(
  sessionId: string,
  updates: Partial<Omit<CreateCasePIIInput, "session_id">>
): Promise<CasePII> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .update(updates)
    .eq("session_id", sessionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update case PII: ${error.message}`)
  }

  return data as CasePII
}

export async function deleteCasePII(sessionId: string): Promise<void> {
  const client = getSupabaseClient()
  
  const { error } = await client
    .from(TABLE_NAME)
    .delete()
    .eq("session_id", sessionId)

  if (error) {
    throw new Error(`Failed to delete case PII: ${error.message}`)
  }
}

export async function getExpiredPIICount(): Promise<number> {
  const client = getSupabaseClient()
  
  const { count, error } = await client
    .from(TABLE_NAME)
    .select("*", { count: "exact", head: true })
    .lt("delete_at", new Date().toISOString())

  if (error) {
    throw new Error(`Failed to count expired PII: ${error.message}`)
  }

  return count ?? 0
}

export async function extendPIIRetention(
  sessionId: string,
  additionalDays: number
): Promise<CasePII> {
  const client = getSupabaseClient()
  
  const current = await getCasePIIBySession(sessionId)
  if (!current) {
    throw new Error(`Case PII not found for session: ${sessionId}`)
  }

  const currentDeleteAt = new Date(current.delete_at)
  currentDeleteAt.setDate(currentDeleteAt.getDate() + additionalDays)

  const { data, error } = await client
    .from(TABLE_NAME)
    .update({ delete_at: currentDeleteAt.toISOString() })
    .eq("session_id", sessionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to extend PII retention: ${error.message}`)
  }

  return data as CasePII
}

export async function addRawDocumentPath(
  sessionId: string,
  path: string
): Promise<void> {
  const current = await getCasePIIBySession(sessionId)
  if (!current) {
    throw new Error(`Case PII not found for session: ${sessionId}`)
  }

  const paths = [...(current.raw_document_paths || []), path]
  
  const client = getSupabaseClient()
  const { error } = await client
    .from(TABLE_NAME)
    .update({ raw_document_paths: paths })
    .eq("session_id", sessionId)

  if (error) {
    throw new Error(`Failed to add raw document path: ${error.message}`)
  }
}
