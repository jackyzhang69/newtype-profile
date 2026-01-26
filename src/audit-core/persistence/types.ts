import type { CaseProfile, AuditTier, ApplicationType } from "../types/case-profile"

export type SessionStatus =
  | "pending"
  | "intake"
  | "investigation"
  | "strategy"
  | "review"
  | "verification"
  | "judgment"
  | "reporting"
  | "completed"
  | "failed"

export type Verdict = "GO" | "CAUTION" | "NO-GO"
export type Recommendation = "PROCEED" | "REVISE" | "HIGH-RISK"
export type StageType = "intake" | "detective" | "strategist" | "gatekeeper" | "verifier" | "reporter"
export type VerificationStatus = "pending" | "verified" | "unverified" | "failed" | "bad_law"
export type ExtractionStatus = "pending" | "processing" | "success" | "failed" | "unsupported"
export type StageResultStatus = "success" | "partial" | "failed"

export interface AuditSession {
  id: string
  created_at: string
  updated_at: string
  case_id: string
  case_slot: string
  tier: AuditTier
  app_type: ApplicationType
  status: SessionStatus
  current_stage: string | null
  stages_completed: string[]
  verdict: Verdict | null
  score: number | null
  score_with_mitigation: number | null
  recommendation: Recommendation | null
  error_message: string | null
  verify_iterations: number
  user_id: string | null
  version: number
}

export interface CreateSessionInput {
  case_id: string
  case_slot: string
  tier: AuditTier
  app_type: ApplicationType
  user_id?: string
}

export interface UpdateSessionInput {
  status?: SessionStatus
  current_stage?: string
  stages_completed?: string[]
  verdict?: Verdict
  score?: number
  score_with_mitigation?: number
  recommendation?: Recommendation
  error_message?: string
  verify_iterations?: number
}

export interface CaseProfileRecord {
  id: string
  created_at: string
  updated_at: string
  session_id: string
  profile_data: CaseProfile
  application_type: string
  sponsor_name: string | null
  applicant_name: string | null
  applicant_nationality: string | null
  relationship_type: string | null
  total_files: number
  extracted_count: number
  failed_count: number
  is_complete: boolean
  missing_documents: string[]
  warnings: string[]
}

export interface StageResult {
  id: string
  created_at: string
  session_id: string
  stage: StageType
  iteration: number
  agent_model: string | null
  temperature: number | null
  duration_ms: number | null
  output_data: Record<string, unknown>
  status: StageResultStatus | null
  summary: string | null
}

export interface CreateStageResultInput {
  stage: StageType
  iteration?: number
  agent_model?: string
  temperature?: number
  duration_ms?: number
  output_data: Record<string, unknown>
  status?: StageResultStatus
  summary?: string
}

export interface Citation {
  id: string
  created_at: string
  session_id: string
  citation: string
  source_stage: string | null
  verification_status: VerificationStatus
  verified_at: string | null
  authority_score: number | null
  validity_status: string | null
  relevance_note: string | null
  case_url: string | null
}

export interface CreateCitationInput {
  citation: string
  source_stage?: string
  verification_status?: VerificationStatus
  authority_score?: number
  validity_status?: string
  relevance_note?: string
  case_url?: string
}

export interface DocumentRecord {
  id: string
  created_at: string
  session_id: string
  filename: string
  original_path: string | null
  file_type: string | null
  file_size: number | null
  storage_path: string | null
  storage_bucket: string
  extraction_status: ExtractionStatus
  extraction_error: string | null
  document_type: string | null
  form_type: string | null
  xfa_fields: Record<string, unknown> | null
  page_count: number | null
}

export interface CreateDocumentInput {
  filename: string
  original_path?: string
  file_type?: string
  file_size?: number
  storage_path?: string
  extraction_status?: ExtractionStatus
  document_type?: string
  form_type?: string
  xfa_fields?: Record<string, unknown>
  page_count?: number
}

export interface ReportRecord {
  id: string
  created_at: string
  session_id: string
  version: number
  is_final: boolean
  verdict: Verdict
  score: number
  markdown_path: string | null
  pdf_path: string | null
  json_path: string | null
  tier: string
  theme: string
  is_anonymized: boolean
  anonymize_level: AnonymizeLevel | null
}

export interface CreateReportInput {
  version?: number
  is_final?: boolean
  verdict: Verdict
  score: number
  markdown_path?: string
  pdf_path?: string
  json_path?: string
  tier: string
  theme?: string
  is_anonymized?: boolean
  anonymize_level?: AnonymizeLevel
}

export interface AuditLogEntry {
  id: string
  created_at: string
  session_id: string | null
  event_type: string
  event_data: Record<string, unknown> | null
  stage: string | null
  agent_name: string | null
  error_code: string | null
  error_message: string | null
}

export interface CreateAuditLogInput {
  event_type: string
  event_data?: Record<string, unknown>
  stage?: string
  agent_name?: string
  error_code?: string
  error_message?: string
}

export interface StoragePaths {
  source: (sessionId: string, filename: string) => string
  extracted: (sessionId: string, filename: string) => string
  report: (sessionId: string, version: number, ext: string) => string
  reportAnonymized: (sessionId: string, version: number, ext: string) => string
  agentOutput: (sessionId: string, stage: string) => string
}

export const storagePaths: StoragePaths = {
  source: (sessionId, filename) => `${sessionId}/source/${filename}`,
  extracted: (sessionId, filename) => `${sessionId}/extracted/${filename}`,
  report: (sessionId, version, ext) => `${sessionId}/reports/v${version}/report.${ext}`,
  reportAnonymized: (sessionId, version, ext) => `${sessionId}/reports/v${version}/report_demo.${ext}`,
  agentOutput: (sessionId, stage) => `${sessionId}/agent-outputs/${stage}.json`,
}

// ============================================
// PII (Personal Identifiable Information) Types
// ============================================

export type AnonymizeLevel = "minimal" | "conservative" | "aggressive"

export interface CasePII {
  id: string
  created_at: string
  delete_at: string
  session_id: string
  // Sponsor PII
  sponsor_full_name: string | null
  sponsor_family_name: string | null
  sponsor_given_name: string | null
  sponsor_dob: string | null
  sponsor_passport: string | null
  sponsor_uci: string | null
  sponsor_contact: Record<string, unknown> | null
  // Applicant PII
  applicant_full_name: string | null
  applicant_family_name: string | null
  applicant_given_name: string | null
  applicant_dob: string | null
  applicant_passport: string | null
  applicant_uci: string | null
  applicant_contact: Record<string, unknown> | null
  // Dependents
  dependents_pii: Record<string, unknown>[] | null
  // Document paths for S3 cleanup
  raw_document_paths: string[]
  // Ownership
  user_id: string | null
}

export interface CreateCasePIIInput {
  session_id: string
  // Sponsor
  sponsor_full_name?: string
  sponsor_family_name?: string
  sponsor_given_name?: string
  sponsor_dob?: string
  sponsor_passport?: string
  sponsor_uci?: string
  sponsor_contact?: Record<string, unknown>
  // Applicant
  applicant_full_name?: string
  applicant_family_name?: string
  applicant_given_name?: string
  applicant_dob?: string
  applicant_passport?: string
  applicant_uci?: string
  applicant_contact?: Record<string, unknown>
  // Dependents
  dependents_pii?: Record<string, unknown>[]
  // Document paths
  raw_document_paths?: string[]
  // Ownership
  user_id?: string
}

// ============================================
// Knowledge Base Types (Anonymized Training Data)
// ============================================

export type KnowledgeBaseVerdict = "GO" | "CAUTION" | "NO-GO"
export type ActualOutcome = "approved" | "refused" | "withdrawn" | "unknown"

export interface KnowledgeBaseEntry {
  id: string
  created_at: string
  pii_ref_id: string | null
  session_id: string | null
  // Abstract Features (no PII)
  application_type: string
  country_code: string | null
  sponsor_country_code: string | null
  // Ranges (not exact values)
  applicant_age_range: string | null
  sponsor_age_range: string | null
  funds_range: string | null
  // Categorical features
  education_level: string | null
  relationship_type: string | null
  relationship_duration_months: number | null
  has_children: boolean | null
  has_previous_refusal: boolean | null
  // Extended features
  profile_features: Record<string, unknown> | null
  // Anonymized Outputs
  audit_report_anonymized: string | null
  reasoning_chain_anonymized: string | null
  executive_summary_anonymized: string | null
  // Structured analysis
  risk_factors: Record<string, unknown>[] | null
  vulnerabilities: Record<string, unknown>[] | null
  strengths: Record<string, unknown>[] | null
  // Results
  verdict: KnowledgeBaseVerdict | null
  score: number | null
  score_with_mitigation: number | null
  tier: string | null
  // Human annotation
  actual_outcome: ActualOutcome | null
  outcome_date: string | null
  annotator_notes: string | null
  // Quality flags
  is_verified: boolean
  quality_score: number | null
}

export interface CreateKnowledgeBaseInput {
  pii_ref_id?: string
  session_id?: string
  application_type: string
  country_code?: string
  sponsor_country_code?: string
  applicant_age_range?: string
  sponsor_age_range?: string
  funds_range?: string
  education_level?: string
  relationship_type?: string
  relationship_duration_months?: number
  has_children?: boolean
  has_previous_refusal?: boolean
  profile_features?: Record<string, unknown>
  audit_report_anonymized?: string
  reasoning_chain_anonymized?: string
  executive_summary_anonymized?: string
  risk_factors?: Record<string, unknown>[]
  vulnerabilities?: Record<string, unknown>[]
  strengths?: Record<string, unknown>[]
  verdict?: KnowledgeBaseVerdict
  score?: number
  score_with_mitigation?: number
  tier?: string
}

export interface UpdateKnowledgeBaseInput {
  actual_outcome?: ActualOutcome
  outcome_date?: string
  annotator_notes?: string
  is_verified?: boolean
  quality_score?: number
}

export interface KnowledgeBaseStats {
  total_cases: number
  by_application_type: Record<string, number>
  by_verdict: Record<string, number>
  by_country: Record<string, number>
  verified_count: number
  avg_score: number | null
}

export interface SimilarCaseQuery {
  application_type: string
  country_code?: string
  applicant_age_range?: string
  education_level?: string
  limit?: number
}
