import { tool } from "@opencode-ai/plugin"
import { getAuditSessionService } from "../../audit-core/workflow"
import { WorkflowEngine } from "../../audit-core/workflow/engine"
import {
  AUDIT_SESSION_START_DESCRIPTION,
  AUDIT_SAVE_PROFILE_DESCRIPTION,
  AUDIT_SAVE_STAGE_OUTPUT_DESCRIPTION,
  AUDIT_SAVE_CITATIONS_DESCRIPTION,
  AUDIT_COMPLETE_DESCRIPTION,
  AUDIT_GET_SESSION_DESCRIPTION,
} from "./constants"
import type {
  AuditSessionStartArgs,
  AuditSaveProfileArgs,
  AuditSaveStageOutputArgs,
  AuditSaveCitationsArgs,
  AuditCompleteArgs,
  AuditGetSessionArgs,
} from "./types"

/**
 * Map workflow_type parameter to workflow definition file name
 */
function resolveWorkflowType(workflowType?: string): string {
  const mapping: Record<string, string> = {
    risk_audit: "risk_audit",
    initial_assessment: "initial_assessment",
    final_review: "final_review",
    refusal_analysis: "refusal_analysis",
    document_list: "document_list",
    client_guidance: "client_guidance",
  }
  return mapping[workflowType ?? "risk_audit"] ?? "risk_audit"
}

export const audit_session_start = tool({
  description: AUDIT_SESSION_START_DESCRIPTION,
  args: {
    case_id: tool.schema.string().describe("Unique case identifier"),
    case_slot: tool.schema.string().describe("Case slot (e.g., 20260126-tian)"),
    tier: tool.schema.enum(["guest", "pro", "ultra"]).describe("Audit tier"),
    app_type: tool.schema
      .enum(["spousal", "study", "work", "family", "other"])
      .describe("Application type"),
    workflow_type: tool.schema
      .enum(["risk_audit", "initial_assessment", "final_review", "refusal_analysis", "document_list", "client_guidance"])
      .optional()
      .describe("Workflow type (default: risk_audit)"),
    user_id: tool.schema.string().optional().describe("User ID for multi-tenant"),
  },
  execute: async (args: AuditSessionStartArgs) => {
    try {
      const service = getAuditSessionService()
      const session = await service.startSession({
        caseId: args.case_id,
        caseSlot: args.case_slot,
        tier: args.tier,
        appType: args.app_type,
        userId: args.user_id,
      })

      // Create local workflow checkpoint file for WorkflowEngine
      const workflowType = resolveWorkflowType(args.workflow_type)
      const engine = new WorkflowEngine(workflowType, args.tier, session.id)
      engine.saveState()

      return JSON.stringify({
        success: true,
        session_id: session.id,
        status: session.status,
        workflow_type: workflowType,
      })
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },
})

export const audit_save_profile = tool({
  description: AUDIT_SAVE_PROFILE_DESCRIPTION,
  args: {
    session_id: tool.schema.string().describe("Session ID from audit_session_start"),
    profile: tool.schema.unknown().describe("CaseProfile JSON object"),
  },
  execute: async (args: AuditSaveProfileArgs) => {
    try {
      const service = getAuditSessionService()
      await service.setSessionId(args.session_id)
      await service.saveCaseProfile(args.profile)

      return JSON.stringify({
        success: true,
        message: "Profile saved successfully",
      })
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },
})

export const audit_save_stage_output = tool({
  description: AUDIT_SAVE_STAGE_OUTPUT_DESCRIPTION,
  args: {
    session_id: tool.schema.string().describe("Session ID"),
    stage: tool.schema
      .enum(["intake", "detective", "strategist", "gatekeeper", "verifier", "reporter"])
      .describe("Stage name"),
    output: tool.schema.unknown().describe("Stage output JSON"),
    model: tool.schema.string().optional().describe("Model used (e.g., claude-sonnet-4-5)"),
    temperature: tool.schema.number().optional().describe("Temperature used"),
    duration_ms: tool.schema.number().optional().describe("Duration in milliseconds"),
    summary: tool.schema.string().optional().describe("Brief summary of output"),
  },
  execute: async (args: AuditSaveStageOutputArgs) => {
    try {
      const service = getAuditSessionService()
      await service.setSessionId(args.session_id)
      await service.saveStageOutput({
        stage: args.stage,
        output: args.output as Record<string, unknown>,
        model: args.model,
        temperature: args.temperature,
        durationMs: args.duration_ms,
        summary: args.summary,
      })

      return JSON.stringify({
        success: true,
        message: `Stage ${args.stage} output saved`,
      })
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },
})

export const audit_save_citations = tool({
  description: AUDIT_SAVE_CITATIONS_DESCRIPTION,
  args: {
    session_id: tool.schema.string().describe("Session ID"),
    citations: tool.schema
      .array(
        tool.schema.object({
          citation: tool.schema.string().describe("Citation text"),
          source_stage: tool.schema.string().optional().describe("Stage that produced citation"),
          case_url: tool.schema.string().optional().describe("URL to case"),
        })
      )
      .describe("Array of citations to save"),
  },
  execute: async (args: AuditSaveCitationsArgs) => {
    try {
      const service = getAuditSessionService()
      await service.setSessionId(args.session_id)
      await service.saveCitations(args.citations)

      return JSON.stringify({
        success: true,
        count: args.citations.length,
        message: `Saved ${args.citations.length} citations`,
      })
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },
})

export const audit_complete = tool({
  description: AUDIT_COMPLETE_DESCRIPTION,
  args: {
    session_id: tool.schema.string().describe("Session ID"),
    verdict: tool.schema.enum(["GO", "CAUTION", "NO-GO"]).describe("Final verdict"),
    score: tool.schema.number().describe("Defensibility score (0-100)"),
    score_with_mitigation: tool.schema
      .number()
      .optional()
      .describe("Score after mitigation (0-100)"),
    recommendation: tool.schema
      .enum(["PROCEED", "REVISE", "HIGH-RISK"])
      .describe("Recommendation"),
  },
  execute: async (args: AuditCompleteArgs) => {
    try {
      const service = getAuditSessionService()
      await service.setSessionId(args.session_id)
      const session = await service.completeAudit({
        verdict: args.verdict,
        score: args.score,
        scoreWithMitigation: args.score_with_mitigation,
        recommendation: args.recommendation,
      })

      return JSON.stringify({
        success: true,
        session_id: session.id,
        status: session.status,
        verdict: args.verdict,
        score: args.score,
      })
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },
})

export const audit_get_session = tool({
  description: AUDIT_GET_SESSION_DESCRIPTION,
  args: {
    session_id: tool.schema.string().describe("Session ID to retrieve"),
  },
  execute: async (args: AuditGetSessionArgs) => {
    try {
      const service = getAuditSessionService()
      await service.setSessionId(args.session_id)

      const [session, profile, stages, citationSummary] = await Promise.all([
        service.getCurrentSession(),
        service.getCaseProfile(),
        service.getAllStageOutputs(),
        service.getCitationSummary(),
      ])

      return JSON.stringify({
        success: true,
        session,
        profile: profile ? { exists: true } : { exists: false },
        stages: Object.fromEntries(
          Object.entries(stages).map(([k, v]) => [k, v ? { exists: true } : { exists: false }])
        ),
        citations: citationSummary,
      })
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },
})
