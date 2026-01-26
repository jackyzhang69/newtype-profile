export const AUDIT_SESSION_START_NAME = "audit_session_start"
export const AUDIT_SESSION_START_DESCRIPTION = `Start a new audit session for tracking workflow state.

Call this FIRST before any audit workflow to initialize session tracking.

Returns: { session_id: string, status: "intake" }

Example:
  audit_session_start({
    case_id: "tian-2026-01",
    case_slot: "20260126-tian",
    tier: "pro",
    app_type: "spousal"
  })`

export const AUDIT_SAVE_PROFILE_NAME = "audit_save_profile"
export const AUDIT_SAVE_PROFILE_DESCRIPTION = `Save the extracted CaseProfile after intake stage.

Call this after Intake agent completes document extraction and profile generation.

Returns: { success: true, profile_id: string }

Example:
  audit_save_profile({
    session_id: "abc-123",
    profile: { case_id: "...", applicant: {...}, sponsor: {...}, ... }
  })`

export const AUDIT_SAVE_STAGE_OUTPUT_NAME = "audit_save_stage_output"
export const AUDIT_SAVE_STAGE_OUTPUT_DESCRIPTION = `Save agent stage output to persistence layer.

Call this after each agent (Detective, Strategist, Gatekeeper, Verifier, Reporter) completes.

Returns: { success: true, result_id: string }

Example:
  audit_save_stage_output({
    session_id: "abc-123",
    stage: "detective",
    output: { findings: [...], citations: [...] },
    model: "claude-sonnet-4-5",
    summary: "Found 5 relevant cases"
  })`

export const AUDIT_SAVE_CITATIONS_NAME = "audit_save_citations"
export const AUDIT_SAVE_CITATIONS_DESCRIPTION = `Save legal citations for verification tracking.

Call this when Detective or Strategist produces citations that need verification.

Returns: { success: true, count: number }

Example:
  audit_save_citations({
    session_id: "abc-123",
    citations: [
      { citation: "Smith v. Canada, 2023 FC 123", source_stage: "detective" },
      { citation: "Doe v. Canada, 2024 FC 456", source_stage: "strategist" }
    ]
  })`

export const AUDIT_COMPLETE_NAME = "audit_complete"
export const AUDIT_COMPLETE_DESCRIPTION = `Mark audit session as completed with final verdict and score.

Call this when AuditManager has finalized the audit judgment.

Returns: { success: true, session_id: string, status: "completed" }

Example:
  audit_complete({
    session_id: "abc-123",
    verdict: "GO",
    score: 85,
    score_with_mitigation: 90,
    recommendation: "PROCEED"
  })`

export const AUDIT_GET_SESSION_NAME = "audit_get_session"
export const AUDIT_GET_SESSION_DESCRIPTION = `Get current audit session state and outputs.

Call this to retrieve session state, completed stages, and previous agent outputs.

Returns: { session: {...}, stages: {...}, citations: {...} }

Example:
  audit_get_session({ session_id: "abc-123" })`
