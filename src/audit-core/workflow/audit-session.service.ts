import type { CaseProfile, AuditTier, ApplicationType } from "../types/case-profile"
import type {
  AuditSession,
  SessionStatus,
  Verdict,
  Recommendation,
  StageType,
  CreateCitationInput,
  VerificationStatus,
} from "../persistence/types"
import {
  createSession,
  updateSession,
  updateSessionStatus,
  addCompletedStage,
  completeSession,
  failSession,
  getSession,
  updateSessionWithRetry,
  OptimisticLockError,
} from "../persistence/repositories/session.repository"
import {
  saveCaseProfile,
  getCaseProfile,
} from "../persistence/repositories/case-profile.repository"
import {
  saveStageResult,
  getStageResults,
  getLatestStageResult,
} from "../persistence/repositories/stage-result.repository"
import {
  saveCitations,
  updateCitationStatus,
  getCitationStats,
} from "../persistence/repositories/citation.repository"
import {
  saveReport,
  markReportAsFinal,
  getNextVersion,
} from "../persistence/repositories/report.repository"
import {
  log,
  logStageStart,
  logStageComplete,
  logError,
} from "../persistence/repositories/audit-log.repository"
import {
  uploadReport,
  uploadAgentOutput,
} from "../persistence/storage/documents"

export interface AuditWorkflowConfig {
  caseId: string
  caseSlot: string
  tier: AuditTier
  appType: ApplicationType
  userId?: string
}

export interface StageOutput {
  stage: StageType
  output: Record<string, unknown>
  model?: string
  temperature?: number
  durationMs?: number
  summary?: string
}

export interface AuditResult {
  verdict: Verdict
  score: number
  scoreWithMitigation?: number
  recommendation: Recommendation
}

export class AuditSessionService {
  private _sessionId: string | null = null

  async startSession(config: AuditWorkflowConfig): Promise<AuditSession> {
    const session = await createSession({
      case_id: config.caseId,
      case_slot: config.caseSlot,
      tier: config.tier,
      app_type: config.appType,
      user_id: config.userId,
    })
    
    this._sessionId = session.id
    await log(session.id, { event_type: "session_started", event_data: { ...config } })
    
    return session
  }

  /** @deprecated Use explicit sessionId parameter instead */
  async getSessionId(): Promise<string> {
    if (!this._sessionId) {
      throw new Error("No active session. Call startSession first.")
    }
    return this._sessionId
  }

  /** @deprecated Use explicit sessionId parameter instead */
  async setSessionId(sessionId: string): Promise<void> {
    const session = await getSession(sessionId)
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`)
    }
    this._sessionId = sessionId
  }

  async getSessionById(sessionId: string): Promise<AuditSession | null> {
    return getSession(sessionId)
  }

  /** @deprecated Use getSessionById with explicit sessionId */
  async getCurrentSession(): Promise<AuditSession | null> {
    if (!this._sessionId) return null
    return getSession(this._sessionId)
  }

  async transitionToStageById(sessionId: string, stage: SessionStatus): Promise<void> {
    await updateSessionStatus(sessionId, stage, stage)
    await logStageStart(sessionId, stage)
  }

  /** @deprecated Use transitionToStageById with explicit sessionId */
  async transitionToStage(stage: SessionStatus): Promise<void> {
    const sessionId = await this.getSessionId()
    await this.transitionToStageById(sessionId, stage)
  }

  async saveCaseProfileById(sessionId: string, profile: CaseProfile): Promise<void> {
    await saveCaseProfile(sessionId, profile)
    await addCompletedStage(sessionId, "intake")
    await logStageComplete(sessionId, "intake")
  }

  /** @deprecated Use saveCaseProfileById with explicit sessionId */
  async saveCaseProfile(profile: CaseProfile): Promise<void> {
    const sessionId = await this.getSessionId()
    await this.saveCaseProfileById(sessionId, profile)
  }

  async getCaseProfileById(sessionId: string): Promise<CaseProfile | null> {
    return getCaseProfile(sessionId)
  }

  /** @deprecated Use getCaseProfileById with explicit sessionId */
  async getCaseProfile(): Promise<CaseProfile | null> {
    const sessionId = await this.getSessionId()
    return this.getCaseProfileById(sessionId)
  }

  async saveStageOutputById(sessionId: string, output: StageOutput): Promise<void> {
    const startTime = Date.now()
    
    await saveStageResult(sessionId, {
      stage: output.stage,
      output_data: output.output,
      agent_model: output.model,
      temperature: output.temperature,
      duration_ms: output.durationMs ?? (Date.now() - startTime),
      status: "success",
      summary: output.summary,
    })

    await uploadAgentOutput(sessionId, output.stage, output.output)
    await addCompletedStage(sessionId, output.stage)
    await logStageComplete(sessionId, output.stage, output.model, output.durationMs)
  }

  /** @deprecated Use saveStageOutputById with explicit sessionId */
  async saveStageOutput(output: StageOutput): Promise<void> {
    const sessionId = await this.getSessionId()
    await this.saveStageOutputById(sessionId, output)
  }

  async getStageOutputById(sessionId: string, stage: StageType): Promise<Record<string, unknown> | null> {
    const result = await getLatestStageResult(sessionId, stage)
    return result?.output_data ?? null
  }

  /** @deprecated Use getStageOutputById with explicit sessionId */
  async getStageOutput(stage: StageType): Promise<Record<string, unknown> | null> {
    const sessionId = await this.getSessionId()
    return this.getStageOutputById(sessionId, stage)
  }

  async getAllStageOutputsById(sessionId: string): Promise<Record<StageType, Record<string, unknown> | null>> {
    const results = await getStageResults(sessionId)
    
    const outputs: Record<StageType, Record<string, unknown> | null> = {
      intake: null,
      detective: null,
      strategist: null,
      gatekeeper: null,
      verifier: null,
      reporter: null,
    }
    
    for (const result of results) {
      outputs[result.stage] = result.output_data
    }
    
    return outputs
  }

  /** @deprecated Use getAllStageOutputsById with explicit sessionId */
  async getAllStageOutputs(): Promise<Record<StageType, Record<string, unknown> | null>> {
    const sessionId = await this.getSessionId()
    return this.getAllStageOutputsById(sessionId)
  }

  async saveCitationsById(sessionId: string, citations: CreateCitationInput[]): Promise<void> {
    await saveCitations(sessionId, citations)
  }

  /** @deprecated Use saveCitationsById with explicit sessionId */
  async saveCitations(citations: CreateCitationInput[]): Promise<void> {
    const sessionId = await this.getSessionId()
    await this.saveCitationsById(sessionId, citations)
  }

  async updateCitationVerification(
    citationId: string,
    status: VerificationStatus,
    additionalData?: { authority_score?: number; validity_status?: string }
  ): Promise<void> {
    await updateCitationStatus(citationId, status, additionalData)
  }

  async getCitationSummaryById(sessionId: string): Promise<{
    total: number
    verified: number
    failed: number
    pending: number
  }> {
    const stats = await getCitationStats(sessionId)
    return {
      total: stats.total,
      verified: stats.verified,
      failed: stats.failed + stats.unverified,
      pending: stats.pending,
    }
  }

  /** @deprecated Use getCitationSummaryById with explicit sessionId */
  async getCitationSummary(): Promise<{
    total: number
    verified: number
    failed: number
    pending: number
  }> {
    const sessionId = await this.getSessionId()
    return this.getCitationSummaryById(sessionId)
  }

  async saveReportById(
    sessionId: string,
    result: AuditResult,
    tier: string,
    content: { markdown: string; json?: Record<string, unknown> }
  ): Promise<{ reportId: string; paths: { markdown: string; json?: string } }> {
    const version = await getNextVersion(sessionId)
    
    const markdownPath = await uploadReport(sessionId, version, content.markdown, "md")
    let jsonPath: string | undefined
    
    if (content.json) {
      jsonPath = await uploadReport(sessionId, version, JSON.stringify(content.json, null, 2), "json")
    }

    const report = await saveReport(sessionId, {
      version,
      verdict: result.verdict,
      score: result.score,
      tier,
      markdown_path: markdownPath,
      json_path: jsonPath,
    })

    return {
      reportId: report.id,
      paths: { markdown: markdownPath, json: jsonPath },
    }
  }

  /** @deprecated Use saveReportById with explicit sessionId */
  async saveReport(
    result: AuditResult,
    tier: string,
    content: { markdown: string; json?: Record<string, unknown> }
  ): Promise<{ reportId: string; paths: { markdown: string; json?: string } }> {
    const sessionId = await this.getSessionId()
    return this.saveReportById(sessionId, result, tier, content)
  }

  async finalizeReport(reportId: string): Promise<void> {
    await markReportAsFinal(reportId)
  }

  async completeAuditById(sessionId: string, result: AuditResult): Promise<AuditSession> {
    await log(sessionId, {
      event_type: "audit_completed",
      event_data: {
        verdict: result.verdict,
        score: result.score,
        scoreWithMitigation: result.scoreWithMitigation,
        recommendation: result.recommendation,
      },
    })
    
    return completeSession(sessionId, {
      verdict: result.verdict,
      score: result.score,
      score_with_mitigation: result.scoreWithMitigation,
      recommendation: result.recommendation,
    })
  }

  /** @deprecated Use completeAuditById with explicit sessionId */
  async completeAudit(result: AuditResult): Promise<AuditSession> {
    const sessionId = await this.getSessionId()
    return this.completeAuditById(sessionId, result)
  }

  async failAuditById(sessionId: string, errorMessage: string, errorCode?: string): Promise<AuditSession> {
    await logError(sessionId, errorCode ?? "AUDIT_FAILED", errorMessage)
    return failSession(sessionId, errorMessage)
  }

  /** @deprecated Use failAuditById with explicit sessionId */
  async failAudit(errorMessage: string, errorCode?: string): Promise<AuditSession> {
    const sessionId = await this.getSessionId()
    return this.failAuditById(sessionId, errorMessage, errorCode)
  }

  async incrementVerifyIterationById(sessionId: string): Promise<number> {
    const session = await getSession(sessionId)
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`)
    }
    
    const newCount = (session.verify_iterations ?? 0) + 1
    await updateSession(sessionId, { verify_iterations: newCount })
    
    return newCount
  }

  /** @deprecated Use incrementVerifyIterationById with explicit sessionId */
  async incrementVerifyIteration(): Promise<number> {
    const sessionId = await this.getSessionId()
    return this.incrementVerifyIterationById(sessionId)
  }

  async updateSessionWithLock(
    sessionId: string,
    updateFn: (session: AuditSession) => { status?: SessionStatus; [key: string]: unknown },
    maxRetries: number = 3
  ): Promise<AuditSession> {
    return updateSessionWithRetry(sessionId, updateFn, maxRetries)
  }

  async completeAuditWithLockById(sessionId: string, result: AuditResult): Promise<AuditSession> {
    return this.updateSessionWithLock(sessionId, () => ({
      status: "completed" as SessionStatus,
      verdict: result.verdict,
      score: result.score,
      score_with_mitigation: result.scoreWithMitigation,
      recommendation: result.recommendation,
    }))
  }
}

let serviceInstance: AuditSessionService | null = null

export function getAuditSessionService(): AuditSessionService {
  if (!serviceInstance) {
    serviceInstance = new AuditSessionService()
  }
  return serviceInstance
}

export function resetAuditSessionService(): void {
  serviceInstance = null
}

export { OptimisticLockError }
