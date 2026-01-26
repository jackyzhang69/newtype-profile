import { getSupabaseClient } from "../client"
import type {
  KnowledgeBaseEntry,
  CreateKnowledgeBaseInput,
  UpdateKnowledgeBaseInput,
  KnowledgeBaseStats,
  SimilarCaseQuery,
} from "../types"

const TABLE_NAME = "io_knowledge_base"

export async function createKnowledgeBaseEntry(
  input: CreateKnowledgeBaseInput
): Promise<KnowledgeBaseEntry> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .insert({
      pii_ref_id: input.pii_ref_id ?? null,
      session_id: input.session_id ?? null,
      application_type: input.application_type,
      country_code: input.country_code ?? null,
      sponsor_country_code: input.sponsor_country_code ?? null,
      applicant_age_range: input.applicant_age_range ?? null,
      sponsor_age_range: input.sponsor_age_range ?? null,
      funds_range: input.funds_range ?? null,
      education_level: input.education_level ?? null,
      relationship_type: input.relationship_type ?? null,
      relationship_duration_months: input.relationship_duration_months ?? null,
      has_children: input.has_children ?? null,
      has_previous_refusal: input.has_previous_refusal ?? null,
      profile_features: input.profile_features ?? null,
      audit_report_anonymized: input.audit_report_anonymized ?? null,
      reasoning_chain_anonymized: input.reasoning_chain_anonymized ?? null,
      executive_summary_anonymized: input.executive_summary_anonymized ?? null,
      risk_factors: input.risk_factors ?? null,
      vulnerabilities: input.vulnerabilities ?? null,
      strengths: input.strengths ?? null,
      verdict: input.verdict ?? null,
      score: input.score ?? null,
      score_with_mitigation: input.score_with_mitigation ?? null,
      tier: input.tier ?? null,
      is_verified: false,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create knowledge base entry: ${error.message}`)
  }

  return data as KnowledgeBaseEntry
}

export async function getKnowledgeBaseEntry(id: string): Promise<KnowledgeBaseEntry | null> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to get knowledge base entry: ${error.message}`)
  }

  return data as KnowledgeBaseEntry
}

export async function getKnowledgeBaseBySession(
  sessionId: string
): Promise<KnowledgeBaseEntry | null> {
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
    throw new Error(`Failed to get knowledge base by session: ${error.message}`)
  }

  return data as KnowledgeBaseEntry
}

export async function updateKnowledgeBaseEntry(
  id: string,
  updates: UpdateKnowledgeBaseInput
): Promise<KnowledgeBaseEntry> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update knowledge base entry: ${error.message}`)
  }

  return data as KnowledgeBaseEntry
}

export async function findSimilarCases(
  query: SimilarCaseQuery
): Promise<KnowledgeBaseEntry[]> {
  const client = getSupabaseClient()
  
  let q = client
    .from(TABLE_NAME)
    .select()
    .eq("application_type", query.application_type)
    .not("verdict", "is", null)
    .order("score", { ascending: false })

  if (query.country_code) {
    q = q.eq("country_code", query.country_code)
  }
  if (query.applicant_age_range) {
    q = q.eq("applicant_age_range", query.applicant_age_range)
  }
  if (query.education_level) {
    q = q.eq("education_level", query.education_level)
  }

  q = q.limit(query.limit ?? 5)

  const { data, error } = await q

  if (error) {
    throw new Error(`Failed to find similar cases: ${error.message}`)
  }

  return data as KnowledgeBaseEntry[]
}

export async function getKnowledgeStats(): Promise<KnowledgeBaseStats> {
  const client = getSupabaseClient()
  
  const { data, error } = await client.rpc("get_knowledge_stats")

  if (error) {
    throw new Error(`Failed to get knowledge stats: ${error.message}`)
  }

  return data as KnowledgeBaseStats
}

export async function listKnowledgeBaseEntries(options?: {
  applicationPath?: string
  verdict?: string
  isVerified?: boolean
  limit?: number
  offset?: number
}): Promise<KnowledgeBaseEntry[]> {
  const client = getSupabaseClient()
  
  let query = client
    .from(TABLE_NAME)
    .select()
    .order("created_at", { ascending: false })

  if (options?.applicationPath) {
    query = query.eq("application_type", options.applicationPath)
  }
  if (options?.verdict) {
    query = query.eq("verdict", options.verdict)
  }
  if (options?.isVerified !== undefined) {
    query = query.eq("is_verified", options.isVerified)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to list knowledge base entries: ${error.message}`)
  }

  return data as KnowledgeBaseEntry[]
}

export async function markAsVerified(
  id: string,
  qualityScore?: number
): Promise<KnowledgeBaseEntry> {
  return updateKnowledgeBaseEntry(id, {
    is_verified: true,
    quality_score: qualityScore,
  })
}

export async function recordActualOutcome(
  id: string,
  outcome: "approved" | "refused" | "withdrawn" | "unknown",
  outcomeDate?: string,
  notes?: string
): Promise<KnowledgeBaseEntry> {
  return updateKnowledgeBaseEntry(id, {
    actual_outcome: outcome,
    outcome_date: outcomeDate,
    annotator_notes: notes,
  })
}
