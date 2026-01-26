import { getSupabaseClient } from "../client"
import type { CaseProfile } from "../../types/case-profile"
import type { CaseProfileRecord } from "../types"

const TABLE_NAME = "io_case_profiles"

export async function saveCaseProfile(
  sessionId: string,
  profile: CaseProfile
): Promise<CaseProfileRecord> {
  const client = getSupabaseClient()
  
  const record = {
    session_id: sessionId,
    profile_data: profile,
    application_type: profile.application_type,
    sponsor_name: profile.sponsor?.name ?? null,
    applicant_name: profile.applicant?.name ?? null,
    applicant_nationality: profile.applicant?.nationality ?? null,
    relationship_type: profile.relationship?.type ?? null,
    total_files: profile.documents?.total_files ?? 0,
    extracted_count: profile.documents?.extracted_count ?? 0,
    failed_count: profile.documents?.failed_count ?? 0,
    is_complete: profile.completeness?.critical_fields_present ?? false,
    missing_documents: profile.completeness?.missing_documents ?? [],
    warnings: profile.completeness?.warnings ?? [],
  }

  const { data, error } = await client
    .from(TABLE_NAME)
    .upsert(record, { onConflict: "session_id" })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save case profile: ${error.message}`)
  }

  return data as CaseProfileRecord
}

export async function getCaseProfile(sessionId: string): Promise<CaseProfile | null> {
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
    throw new Error(`Failed to get case profile: ${error.message}`)
  }

  return (data as CaseProfileRecord).profile_data
}

export async function getCaseProfileRecord(sessionId: string): Promise<CaseProfileRecord | null> {
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
    throw new Error(`Failed to get case profile record: ${error.message}`)
  }

  return data as CaseProfileRecord
}

export async function updateCaseProfileCompleteness(
  sessionId: string,
  completeness: {
    is_complete?: boolean
    missing_documents?: string[]
    warnings?: string[]
  }
): Promise<void> {
  const client = getSupabaseClient()
  
  const { error } = await client
    .from(TABLE_NAME)
    .update(completeness)
    .eq("session_id", sessionId)

  if (error) {
    throw new Error(`Failed to update case profile completeness: ${error.message}`)
  }
}
