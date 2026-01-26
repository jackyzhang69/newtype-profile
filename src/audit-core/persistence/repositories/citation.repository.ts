import { getSupabaseClient } from "../client"
import type { Citation, CreateCitationInput, VerificationStatus } from "../types"

const TABLE_NAME = "io_citations"

export async function findCitationByText(
  sessionId: string,
  citationText: string
): Promise<Citation | null> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("session_id", sessionId)
    .eq("citation", citationText)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to find citation: ${error.message}`)
  }

  return data as Citation | null
}

export async function saveCitation(
  sessionId: string,
  input: CreateCitationInput,
  skipDuplicate = true
): Promise<Citation> {
  if (skipDuplicate) {
    const existing = await findCitationByText(sessionId, input.citation)
    if (existing) return existing
  }

  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .insert({
      session_id: sessionId,
      citation: input.citation,
      source_stage: input.source_stage ?? null,
      verification_status: input.verification_status ?? "pending",
      authority_score: input.authority_score ?? null,
      validity_status: input.validity_status ?? null,
      relevance_note: input.relevance_note ?? null,
      case_url: input.case_url ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save citation: ${error.message}`)
  }

  return data as Citation
}

export async function saveCitations(
  sessionId: string,
  citations: CreateCitationInput[],
  skipDuplicates = true
): Promise<Citation[]> {
  if (citations.length === 0) return []
  
  if (skipDuplicates) {
    const existingCitations = await getCitations(sessionId)
    const existingTexts = new Set(existingCitations.map(c => c.citation))
    const newCitations = citations.filter(c => !existingTexts.has(c.citation))
    
    if (newCitations.length === 0) return existingCitations.filter(
      ec => citations.some(c => c.citation === ec.citation)
    )
    
    citations = newCitations
  }
  
  const client = getSupabaseClient()
  
  const records = citations.map(input => ({
    session_id: sessionId,
    citation: input.citation,
    source_stage: input.source_stage ?? null,
    verification_status: input.verification_status ?? "pending",
    authority_score: input.authority_score ?? null,
    validity_status: input.validity_status ?? null,
    relevance_note: input.relevance_note ?? null,
    case_url: input.case_url ?? null,
  }))

  const { data, error } = await client
    .from(TABLE_NAME)
    .insert(records)
    .select()

  if (error) {
    throw new Error(`Failed to save citations: ${error.message}`)
  }

  return data as Citation[]
}

export async function getCitations(sessionId: string): Promise<Citation[]> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(`Failed to get citations: ${error.message}`)
  }

  return data as Citation[]
}

export async function updateCitationStatus(
  citationId: string,
  status: VerificationStatus,
  additionalData?: {
    authority_score?: number
    validity_status?: string
  }
): Promise<Citation> {
  const client = getSupabaseClient()
  
  const updateData: Record<string, unknown> = {
    verification_status: status,
    verified_at: status !== "pending" ? new Date().toISOString() : null,
  }
  
  if (additionalData?.authority_score !== undefined) {
    updateData.authority_score = additionalData.authority_score
  }
  if (additionalData?.validity_status !== undefined) {
    updateData.validity_status = additionalData.validity_status
  }

  const { data, error } = await client
    .from(TABLE_NAME)
    .update(updateData)
    .eq("id", citationId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update citation status: ${error.message}`)
  }

  return data as Citation
}

export async function getPendingCitations(sessionId: string): Promise<Citation[]> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("session_id", sessionId)
    .eq("verification_status", "pending")

  if (error) {
    throw new Error(`Failed to get pending citations: ${error.message}`)
  }

  return data as Citation[]
}

export async function getCitationStats(sessionId: string): Promise<{
  total: number
  verified: number
  unverified: number
  failed: number
  pending: number
}> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select("verification_status")
    .eq("session_id", sessionId)

  if (error) {
    throw new Error(`Failed to get citation stats: ${error.message}`)
  }

  const stats = {
    total: data.length,
    verified: 0,
    unverified: 0,
    failed: 0,
    pending: 0,
  }

  for (const row of data) {
    const status = row.verification_status as VerificationStatus
    if (status === "verified") stats.verified++
    else if (status === "unverified") stats.unverified++
    else if (status === "failed" || status === "bad_law") stats.failed++
    else stats.pending++
  }

  return stats
}
