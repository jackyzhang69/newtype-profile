import type { AuditTier, ApplicationType, CaseProfile } from "../../audit-core/types/case-profile"
import type { StageType, Verdict, Recommendation, CreateCitationInput } from "../../audit-core/persistence/types"

export type WorkflowType = "risk_audit" | "initial_assessment" | "final_review" | "refusal_analysis" | "document_list" | "client_guidance"

export interface AuditSessionStartArgs {
  case_id: string
  case_slot: string
  tier: AuditTier
  app_type: ApplicationType
  workflow_type?: WorkflowType
  user_id?: string
}

export interface AuditSaveProfileArgs {
  session_id: string
  profile: CaseProfile
}

export interface AuditSaveStageOutputArgs {
  session_id: string
  stage: StageType
  output: Record<string, unknown>
  model?: string
  temperature?: number
  duration_ms?: number
  summary?: string
}

export interface AuditSaveCitationsArgs {
  session_id: string
  citations: CreateCitationInput[]
}

export interface AuditCompleteArgs {
  session_id: string
  verdict: Verdict
  score: number
  score_with_mitigation?: number
  recommendation: Recommendation
}

export interface AuditGetSessionArgs {
  session_id: string
}
