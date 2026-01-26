import { describe, it, expect, beforeEach, mock } from "bun:test"
import {
  AuditSessionService,
  getAuditSessionService,
  resetAuditSessionService,
  type AuditWorkflowConfig,
  type StageOutput,
  type AuditResult,
} from "./audit-session.service"
import type { AuditSession, StageResult } from "../persistence/types"

const mockSession: AuditSession = {
  id: "session-123",
  case_id: "case-001",
  case_slot: "20260126-01",
  tier: "pro",
  app_type: "spousal",
  status: "intake",
  current_stage: "intake",
  stages_completed: [],
  verdict: null,
  score: null,
  score_with_mitigation: null,
  recommendation: null,
  error_message: null,
  verify_iterations: 0,
  user_id: null,
  version: 1,
  created_at: "2026-01-26T00:00:00Z",
  updated_at: "2026-01-26T00:00:00Z",
}

const mockCreateSession = mock(() => Promise.resolve(mockSession))
const mockUpdateSession = mock(() => Promise.resolve(mockSession))
const mockUpdateSessionStatus = mock(() => Promise.resolve(mockSession))
const mockAddCompletedStage = mock(() => Promise.resolve(mockSession))
const mockCompleteSession = mock(() =>
  Promise.resolve({ ...mockSession, status: "completed" as const })
)
const mockFailSession = mock(() =>
  Promise.resolve({ ...mockSession, status: "failed" as const })
)
const mockGetSession = mock(() => Promise.resolve(mockSession))

const mockSaveCaseProfile = mock(() => Promise.resolve({ id: "profile-1" }))
const mockGetCaseProfile = mock(() => Promise.resolve(null))

const mockSaveStageResult = mock(() => Promise.resolve({ id: "result-1" }))
const mockGetStageResults = mock(() => Promise.resolve([] as StageResult[]))
const mockGetLatestStageResult = mock(() => Promise.resolve(null))

const mockSaveCitations = mock(() => Promise.resolve([]))
const mockUpdateCitationStatus = mock(() => Promise.resolve({ id: "citation-1" }))
const mockGetCitationStats = mock(() =>
  Promise.resolve({ total: 5, verified: 3, failed: 1, pending: 1, unverified: 0 })
)

const mockSaveReport = mock(() => Promise.resolve({ id: "report-1" }))
const mockMarkReportAsFinal = mock(() => Promise.resolve({ id: "report-1", is_final: true }))
const mockGetNextVersion = mock(() => Promise.resolve(1))

const mockLog = mock(() => Promise.resolve({ id: "log-1" }))
const mockLogStageStart = mock(() => Promise.resolve({ id: "log-2" }))
const mockLogStageComplete = mock(() => Promise.resolve({ id: "log-3" }))
const mockLogError = mock(() => Promise.resolve({ id: "log-4" }))

const mockUploadReport = mock(() =>
  Promise.resolve("immi-os/session-123/reports/v1/report.md")
)
const mockUploadAgentOutput = mock(() =>
  Promise.resolve("immi-os/session-123/agent-outputs/detective.json")
)

mock.module("../persistence/repositories/session.repository", () => ({
  createSession: mockCreateSession,
  updateSession: mockUpdateSession,
  updateSessionStatus: mockUpdateSessionStatus,
  addCompletedStage: mockAddCompletedStage,
  completeSession: mockCompleteSession,
  failSession: mockFailSession,
  getSession: mockGetSession,
}))

mock.module("../persistence/repositories/case-profile.repository", () => ({
  saveCaseProfile: mockSaveCaseProfile,
  getCaseProfile: mockGetCaseProfile,
}))

mock.module("../persistence/repositories/stage-result.repository", () => ({
  saveStageResult: mockSaveStageResult,
  getStageResults: mockGetStageResults,
  getLatestStageResult: mockGetLatestStageResult,
}))

mock.module("../persistence/repositories/citation.repository", () => ({
  saveCitations: mockSaveCitations,
  updateCitationStatus: mockUpdateCitationStatus,
  getCitationStats: mockGetCitationStats,
}))

mock.module("../persistence/repositories/report.repository", () => ({
  saveReport: mockSaveReport,
  markReportAsFinal: mockMarkReportAsFinal,
  getNextVersion: mockGetNextVersion,
}))

mock.module("../persistence/repositories/audit-log.repository", () => ({
  log: mockLog,
  logStageStart: mockLogStageStart,
  logStageComplete: mockLogStageComplete,
  logError: mockLogError,
}))

mock.module("../persistence/storage/documents", () => ({
  uploadReport: mockUploadReport,
  uploadAgentOutput: mockUploadAgentOutput,
}))

describe("AuditSessionService", () => {
  let service: AuditSessionService

  beforeEach(() => {
    resetAuditSessionService()
    service = new AuditSessionService()

    mockCreateSession.mockClear()
    mockUpdateSession.mockClear()
    mockUpdateSessionStatus.mockClear()
    mockAddCompletedStage.mockClear()
    mockCompleteSession.mockClear()
    mockFailSession.mockClear()
    mockGetSession.mockClear()
    mockSaveCaseProfile.mockClear()
    mockGetCaseProfile.mockClear()
    mockSaveStageResult.mockClear()
    mockGetStageResults.mockClear()
    mockGetLatestStageResult.mockClear()
    mockSaveCitations.mockClear()
    mockUpdateCitationStatus.mockClear()
    mockGetCitationStats.mockClear()
    mockSaveReport.mockClear()
    mockMarkReportAsFinal.mockClear()
    mockGetNextVersion.mockClear()
    mockLog.mockClear()
    mockLogStageStart.mockClear()
    mockLogStageComplete.mockClear()
    mockLogError.mockClear()
    mockUploadReport.mockClear()
    mockUploadAgentOutput.mockClear()
  })

  describe("startSession", () => {
    it("creates a new session with config", async () => {
      // #given
      const config: AuditWorkflowConfig = {
        caseId: "case-001",
        caseSlot: "20260126-01",
        tier: "pro",
        appType: "spousal",
        userId: "user-123",
      }

      // #when
      const session = await service.startSession(config)

      // #then
      expect(session.id).toBe("session-123")
      expect(mockCreateSession).toHaveBeenCalledWith({
        case_id: "case-001",
        case_slot: "20260126-01",
        tier: "pro",
        app_type: "spousal",
        user_id: "user-123",
      })
      expect(mockLog).toHaveBeenCalledWith(
        "session-123",
        expect.objectContaining({ event_type: "session_started" })
      )
    })

    it("stores session id for subsequent calls", async () => {
      // #given
      const config: AuditWorkflowConfig = {
        caseId: "case-001",
        caseSlot: "20260126-01",
        tier: "guest",
        appType: "study",
      }

      // #when
      await service.startSession(config)
      const sessionId = await service.getSessionId()

      // #then
      expect(sessionId).toBe("session-123")
    })
  })

  describe("getSessionId", () => {
    it("throws if no session started", async () => {
      // #when/#then
      await expect(service.getSessionId()).rejects.toThrow("No active session")
    })
  })

  describe("setSessionId", () => {
    it("sets session id from existing session", async () => {
      // #when
      await service.setSessionId("session-123")
      const sessionId = await service.getSessionId()

      // #then
      expect(sessionId).toBe("session-123")
      expect(mockGetSession).toHaveBeenCalledWith("session-123")
    })

    it("throws if session not found", async () => {
      // #given
      mockGetSession.mockResolvedValueOnce(null as any)

      // #when/#then
      await expect(service.setSessionId("invalid-session")).rejects.toThrow(
        "Session not found"
      )
    })
  })

  describe("getCurrentSession", () => {
    it("returns null if no session", async () => {
      // #when
      const session = await service.getCurrentSession()

      // #then
      expect(session).toBeNull()
    })

    it("returns current session if set", async () => {
      // #given
      await service.setSessionId("session-123")

      // #when
      const session = await service.getCurrentSession()

      // #then
      expect(session).toEqual(mockSession)
    })
  })

  describe("transitionToStage", () => {
    it("updates session status and logs stage start", async () => {
      // #given
      await service.setSessionId("session-123")

      // #when
      await service.transitionToStage("investigation")

      // #then
      expect(mockUpdateSessionStatus).toHaveBeenCalledWith(
        "session-123",
        "investigation",
        "investigation"
      )
      expect(mockLogStageStart).toHaveBeenCalledWith("session-123", "investigation")
    })
  })

  describe("saveCaseProfile", () => {
    it("saves profile and marks intake complete", async () => {
      // #given
      await service.setSessionId("session-123")
      const profile = { case_id: "case-001" } as any

      // #when
      await service.saveCaseProfile(profile)

      // #then
      expect(mockSaveCaseProfile).toHaveBeenCalledWith("session-123", profile)
      expect(mockAddCompletedStage).toHaveBeenCalledWith("session-123", "intake")
      expect(mockLogStageComplete).toHaveBeenCalledWith("session-123", "intake")
    })
  })

  describe("getCaseProfile", () => {
    it("retrieves case profile for session", async () => {
      // #given
      await service.setSessionId("session-123")

      // #when
      const profile = await service.getCaseProfile()

      // #then
      expect(profile).toBeNull()
      expect(mockGetCaseProfile).toHaveBeenCalledWith("session-123")
    })
  })

  describe("saveStageOutput", () => {
    it("saves stage result with all metadata", async () => {
      // #given
      await service.setSessionId("session-123")
      const output: StageOutput = {
        stage: "detective",
        output: { findings: ["finding1"] },
        model: "claude-sonnet-4-5",
        temperature: 0.1,
        durationMs: 5000,
        summary: "Found key evidence",
      }

      // #when
      await service.saveStageOutput(output)

      // #then
      expect(mockSaveStageResult).toHaveBeenCalledWith(
        "session-123",
        expect.objectContaining({
          stage: "detective",
          output_data: { findings: ["finding1"] },
          agent_model: "claude-sonnet-4-5",
          temperature: 0.1,
          status: "success",
          summary: "Found key evidence",
        })
      )
      expect(mockUploadAgentOutput).toHaveBeenCalledWith("session-123", "detective", {
        findings: ["finding1"],
      })
      expect(mockAddCompletedStage).toHaveBeenCalledWith("session-123", "detective")
      expect(mockLogStageComplete).toHaveBeenCalledWith(
        "session-123",
        "detective",
        "claude-sonnet-4-5",
        5000
      )
    })
  })

  describe("getStageOutput", () => {
    it("returns null if no result", async () => {
      // #given
      await service.setSessionId("session-123")

      // #when
      const output = await service.getStageOutput("detective")

      // #then
      expect(output).toBeNull()
    })

    it("returns output data if result exists", async () => {
      // #given
      await service.setSessionId("session-123")
      mockGetLatestStageResult.mockResolvedValueOnce({
        output_data: { score: 75 },
      } as any)

      // #when
      const output = await service.getStageOutput("strategist")

      // #then
      expect(output).toEqual({ score: 75 })
    })
  })

  describe("getAllStageOutputs", () => {
    it("returns all stage outputs organized by stage", async () => {
      // #given
      await service.setSessionId("session-123")
      mockGetStageResults.mockResolvedValueOnce([
        { stage: "detective", output_data: { findings: [] } },
        { stage: "strategist", output_data: { score: 75 } },
      ] as any)

      // #when
      const outputs = await service.getAllStageOutputs()

      // #then
      expect(outputs.detective).toEqual({ findings: [] })
      expect(outputs.strategist).toEqual({ score: 75 })
      expect(outputs.gatekeeper).toBeNull()
    })
  })

  describe("saveCitations", () => {
    it("saves citations for session", async () => {
      // #given
      await service.setSessionId("session-123")
      const citations = [
        { citation: "Smith v. Canada, 2023 FC 123" },
        { citation: "Doe v. Canada, 2024 FC 456" },
      ]

      // #when
      await service.saveCitations(citations)

      // #then
      expect(mockSaveCitations).toHaveBeenCalledWith("session-123", citations)
    })
  })

  describe("updateCitationVerification", () => {
    it("updates citation status", async () => {
      // #when
      await service.updateCitationVerification("citation-1", "verified", {
        authority_score: 85,
      })

      // #then
      expect(mockUpdateCitationStatus).toHaveBeenCalledWith("citation-1", "verified", {
        authority_score: 85,
      })
    })
  })

  describe("getCitationSummary", () => {
    it("returns citation statistics", async () => {
      // #given
      await service.setSessionId("session-123")

      // #when
      const summary = await service.getCitationSummary()

      // #then
      expect(summary).toEqual({
        total: 5,
        verified: 3,
        failed: 1,
        pending: 1,
      })
    })
  })

  describe("saveReport", () => {
    it("uploads report and creates database record", async () => {
      // #given
      await service.setSessionId("session-123")
      const result: AuditResult = {
        verdict: "GO",
        score: 80,
        recommendation: "PROCEED",
      }
      const content = {
        markdown: "# Audit Report\n\n...",
        json: { summary: "test" },
      }

      // #when
      const { reportId, paths } = await service.saveReport(result, "pro", content)

      // #then
      expect(mockGetNextVersion).toHaveBeenCalledWith("session-123")
      expect(mockUploadReport).toHaveBeenCalledTimes(2)
      expect(mockSaveReport).toHaveBeenCalledWith(
        "session-123",
        expect.objectContaining({
          verdict: "GO",
          score: 80,
          tier: "pro",
        })
      )
      expect(reportId).toBe("report-1")
      expect(paths.markdown).toContain("report.md")
    })

    it("handles report without json", async () => {
      // #given
      await service.setSessionId("session-123")
      const result: AuditResult = {
        verdict: "CAUTION",
        score: 60,
        recommendation: "REVISE",
      }

      // #when
      await service.saveReport(result, "guest", { markdown: "# Report" })

      // #then
      expect(mockUploadReport).toHaveBeenCalledTimes(1)
    })
  })

  describe("finalizeReport", () => {
    it("marks report as final", async () => {
      // #when
      await service.finalizeReport("report-1")

      // #then
      expect(mockMarkReportAsFinal).toHaveBeenCalledWith("report-1")
    })
  })

  describe("completeAudit", () => {
    it("logs completion and updates session", async () => {
      // #given
      await service.setSessionId("session-123")
      const result: AuditResult = {
        verdict: "GO",
        score: 85,
        scoreWithMitigation: 90,
        recommendation: "PROCEED",
      }

      // #when
      const session = await service.completeAudit(result)

      // #then
      expect(mockLog).toHaveBeenCalledWith(
        "session-123",
        expect.objectContaining({ event_type: "audit_completed" })
      )
      expect(mockCompleteSession).toHaveBeenCalledWith("session-123", {
        verdict: "GO",
        score: 85,
        score_with_mitigation: 90,
        recommendation: "PROCEED",
      })
      expect(session.status).toBe("completed")
    })
  })

  describe("failAudit", () => {
    it("logs error and fails session", async () => {
      // #given
      await service.setSessionId("session-123")

      // #when
      const session = await service.failAudit("MCP service unavailable", "MCP_ERROR")

      // #then
      expect(mockLogError).toHaveBeenCalledWith(
        "session-123",
        "MCP_ERROR",
        "MCP service unavailable"
      )
      expect(mockFailSession).toHaveBeenCalledWith(
        "session-123",
        "MCP service unavailable"
      )
      expect(session.status).toBe("failed")
    })

    it("uses default error code if not provided", async () => {
      // #given
      await service.setSessionId("session-123")

      // #when
      await service.failAudit("Unknown error")

      // #then
      expect(mockLogError).toHaveBeenCalledWith(
        "session-123",
        "AUDIT_FAILED",
        "Unknown error"
      )
    })
  })

  describe("incrementVerifyIteration", () => {
    it("increments and returns new count", async () => {
      // #given
      await service.setSessionId("session-123")

      // #when
      const count = await service.incrementVerifyIteration()

      // #then
      expect(count).toBe(1)
      expect(mockUpdateSession).toHaveBeenCalledWith("session-123", {
        verify_iterations: 1,
      })
    })

    it("increments from existing count", async () => {
      // #given
      await service.setSessionId("session-123")
      mockGetSession.mockResolvedValueOnce({ ...mockSession, verify_iterations: 2 })

      // #when
      const count = await service.incrementVerifyIteration()

      // #then
      expect(count).toBe(3)
    })
  })
})

describe("getAuditSessionService", () => {
  beforeEach(() => {
    resetAuditSessionService()
  })

  it("returns singleton instance", () => {
    // #when
    const service1 = getAuditSessionService()
    const service2 = getAuditSessionService()

    // #then
    expect(service1).toBe(service2)
  })
})

describe("resetAuditSessionService", () => {
  it("clears singleton instance", () => {
    // #given
    resetAuditSessionService()
    const service1 = new AuditSessionService()

    // #when
    const service2 = new AuditSessionService()

    // #then
    expect(service1).toBeInstanceOf(AuditSessionService)
    expect(service2).toBeInstanceOf(AuditSessionService)
    expect(service1 === service2).toBe(false)
  })
})

describe("Stateless API (explicit sessionId)", () => {
  let service: AuditSessionService

  beforeEach(() => {
    resetAuditSessionService()
    service = new AuditSessionService()

    mockCreateSession.mockClear()
    mockGetSession.mockClear()
    mockUpdateSessionStatus.mockClear()
    mockLogStageStart.mockClear()
    mockSaveCaseProfile.mockClear()
    mockAddCompletedStage.mockClear()
    mockLogStageComplete.mockClear()
    mockGetCaseProfile.mockClear()
    mockSaveStageResult.mockClear()
    mockUploadAgentOutput.mockClear()
    mockGetLatestStageResult.mockClear()
    mockGetStageResults.mockClear()
    mockSaveCitations.mockClear()
    mockGetCitationStats.mockClear()
    mockGetNextVersion.mockClear()
    mockUploadReport.mockClear()
    mockSaveReport.mockClear()
    mockLog.mockClear()
    mockCompleteSession.mockClear()
    mockLogError.mockClear()
    mockFailSession.mockClear()
    mockUpdateSession.mockClear()
  })

  describe("getSessionById", () => {
    it("retrieves session without internal state", async () => {
      // #when
      const session = await service.getSessionById("session-123")

      // #then
      expect(session).toEqual(mockSession)
      expect(mockGetSession).toHaveBeenCalledWith("session-123")
    })
  })

  describe("transitionToStageById", () => {
    it("transitions stage without internal state", async () => {
      // #when
      await service.transitionToStageById("session-123", "investigation")

      // #then
      expect(mockUpdateSessionStatus).toHaveBeenCalledWith(
        "session-123",
        "investigation",
        "investigation"
      )
      expect(mockLogStageStart).toHaveBeenCalledWith("session-123", "investigation")
    })
  })

  describe("saveCaseProfileById", () => {
    it("saves profile without internal state", async () => {
      // #given
      const profile = { case_id: "case-001" } as any

      // #when
      await service.saveCaseProfileById("session-123", profile)

      // #then
      expect(mockSaveCaseProfile).toHaveBeenCalledWith("session-123", profile)
      expect(mockAddCompletedStage).toHaveBeenCalledWith("session-123", "intake")
      expect(mockLogStageComplete).toHaveBeenCalledWith("session-123", "intake")
    })
  })

  describe("getCaseProfileById", () => {
    it("retrieves profile without internal state", async () => {
      // #when
      await service.getCaseProfileById("session-123")

      // #then
      expect(mockGetCaseProfile).toHaveBeenCalledWith("session-123")
    })
  })

  describe("saveStageOutputById", () => {
    it("saves output without internal state", async () => {
      // #given
      const output: StageOutput = {
        stage: "detective",
        output: { findings: ["finding1"] },
        model: "claude-sonnet-4-5",
      }

      // #when
      await service.saveStageOutputById("session-123", output)

      // #then
      expect(mockSaveStageResult).toHaveBeenCalledWith(
        "session-123",
        expect.objectContaining({ stage: "detective" })
      )
      expect(mockUploadAgentOutput).toHaveBeenCalledWith(
        "session-123",
        "detective",
        { findings: ["finding1"] }
      )
    })
  })

  describe("getStageOutputById", () => {
    it("retrieves output without internal state", async () => {
      // #given
      mockGetLatestStageResult.mockResolvedValueOnce({
        output_data: { score: 75 },
      } as any)

      // #when
      const output = await service.getStageOutputById("session-123", "strategist")

      // #then
      expect(output).toEqual({ score: 75 })
      expect(mockGetLatestStageResult).toHaveBeenCalledWith("session-123", "strategist")
    })
  })

  describe("getAllStageOutputsById", () => {
    it("retrieves all outputs without internal state", async () => {
      // #given
      mockGetStageResults.mockResolvedValueOnce([
        { stage: "detective", output_data: { findings: [] } },
      ] as any)

      // #when
      const outputs = await service.getAllStageOutputsById("session-123")

      // #then
      expect(outputs.detective).toEqual({ findings: [] })
      expect(mockGetStageResults).toHaveBeenCalledWith("session-123")
    })
  })

  describe("saveCitationsById", () => {
    it("saves citations without internal state", async () => {
      // #given
      const citations = [{ citation: "Smith v. Canada" }]

      // #when
      await service.saveCitationsById("session-123", citations)

      // #then
      expect(mockSaveCitations).toHaveBeenCalledWith("session-123", citations)
    })
  })

  describe("getCitationSummaryById", () => {
    it("retrieves summary without internal state", async () => {
      // #when
      const summary = await service.getCitationSummaryById("session-123")

      // #then
      expect(summary.total).toBe(5)
      expect(mockGetCitationStats).toHaveBeenCalledWith("session-123")
    })
  })

  describe("saveReportById", () => {
    it("saves report without internal state", async () => {
      // #given
      const result: AuditResult = {
        verdict: "GO",
        score: 80,
        recommendation: "PROCEED",
      }

      // #when
      await service.saveReportById("session-123", result, "pro", {
        markdown: "# Report",
      })

      // #then
      expect(mockGetNextVersion).toHaveBeenCalledWith("session-123")
      expect(mockUploadReport).toHaveBeenCalled()
      expect(mockSaveReport).toHaveBeenCalledWith(
        "session-123",
        expect.objectContaining({ verdict: "GO" })
      )
    })
  })

  describe("completeAuditById", () => {
    it("completes audit without internal state", async () => {
      // #given
      const result: AuditResult = {
        verdict: "GO",
        score: 85,
        recommendation: "PROCEED",
      }

      // #when
      await service.completeAuditById("session-123", result)

      // #then
      expect(mockLog).toHaveBeenCalledWith(
        "session-123",
        expect.objectContaining({ event_type: "audit_completed" })
      )
      expect(mockCompleteSession).toHaveBeenCalledWith(
        "session-123",
        expect.objectContaining({ verdict: "GO" })
      )
    })
  })

  describe("failAuditById", () => {
    it("fails audit without internal state", async () => {
      // #when
      await service.failAuditById("session-123", "Error message", "ERROR_CODE")

      // #then
      expect(mockLogError).toHaveBeenCalledWith("session-123", "ERROR_CODE", "Error message")
      expect(mockFailSession).toHaveBeenCalledWith("session-123", "Error message")
    })
  })

  describe("incrementVerifyIterationById", () => {
    it("increments without internal state", async () => {
      // #when
      const count = await service.incrementVerifyIterationById("session-123")

      // #then
      expect(count).toBe(1)
      expect(mockUpdateSession).toHaveBeenCalledWith("session-123", { verify_iterations: 1 })
    })
  })
})
