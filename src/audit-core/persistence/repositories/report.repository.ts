import { getSupabaseClient } from "../client"
import type { ReportRecord, CreateReportInput, Verdict, AnonymizeLevel } from "../types"

const TABLE_NAME = "io_reports"

export async function saveReport(
  sessionId: string,
  input: CreateReportInput
): Promise<ReportRecord> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .insert({
      session_id: sessionId,
      version: input.version ?? 1,
      is_final: input.is_final ?? false,
      verdict: input.verdict,
      score: input.score,
      markdown_path: input.markdown_path ?? null,
      pdf_path: input.pdf_path ?? null,
      json_path: input.json_path ?? null,
      technical_appendix_path: input.technical_appendix_path ?? null,
      tier: input.tier,
      theme: input.theme ?? "judicial-authority",
      is_anonymized: input.is_anonymized ?? false,
      anonymize_level: input.anonymize_level ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save report: ${error.message}`)
  }

  return data as ReportRecord
}

export async function getReports(sessionId: string): Promise<ReportRecord[]> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("session_id", sessionId)
    .order("version", { ascending: false })

  if (error) {
    throw new Error(`Failed to get reports: ${error.message}`)
  }

  return data as ReportRecord[]
}

export async function getLatestReport(sessionId: string): Promise<ReportRecord | null> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("session_id", sessionId)
    .order("version", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to get latest report: ${error.message}`)
  }

  return data as ReportRecord
}

export async function getFinalReport(sessionId: string): Promise<ReportRecord | null> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select()
    .eq("session_id", sessionId)
    .eq("is_final", true)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to get final report: ${error.message}`)
  }

  return data as ReportRecord
}

export async function markReportAsFinal(reportId: string): Promise<ReportRecord> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .update({ is_final: true })
    .eq("id", reportId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to mark report as final: ${error.message}`)
  }

  return data as ReportRecord
}

export async function updateReportPaths(
  reportId: string,
  paths: {
    markdown_path?: string
    pdf_path?: string
    json_path?: string
    technical_appendix_path?: string
  }
): Promise<ReportRecord> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .update(paths)
    .eq("id", reportId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update report paths: ${error.message}`)
  }

  return data as ReportRecord
}

export async function getNextVersion(sessionId: string): Promise<number> {
  const client = getSupabaseClient()
  
  const { data, error } = await client
    .from(TABLE_NAME)
    .select("version")
    .eq("session_id", sessionId)
    .order("version", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return 1
    }
    throw new Error(`Failed to get next version: ${error.message}`)
  }

  return (data.version as number) + 1
}

export interface DualReportInput {
  verdict: Verdict
  score: number
  tier: string
  standardMarkdownPath?: string
  standardPdfPath?: string
  technicalAppendixPath?: string
  anonymizedMarkdownPath?: string
  anonymizeLevel?: AnonymizeLevel
}

export interface DualReportResult {
  standard: ReportRecord
  anonymized: ReportRecord
}

export async function saveDualReports(
  sessionId: string,
  input: DualReportInput
): Promise<DualReportResult> {
  const version = await getNextVersion(sessionId)
  
  const standard = await saveReport(sessionId, {
    version,
    verdict: input.verdict,
    score: input.score,
    tier: input.tier,
    markdown_path: input.standardMarkdownPath,
    pdf_path: input.standardPdfPath,
    technical_appendix_path: input.technicalAppendixPath,
    is_final: true,
    is_anonymized: false,
  })

  const anonymized = await saveReport(sessionId, {
    version,
    verdict: input.verdict,
    score: input.score,
    tier: input.tier,
    markdown_path: input.anonymizedMarkdownPath,
    is_final: false,
    is_anonymized: true,
    anonymize_level: input.anonymizeLevel ?? "conservative",
  })

  return { standard, anonymized }
}
