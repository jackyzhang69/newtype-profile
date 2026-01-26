import { describe, it, expect, beforeEach, mock } from "bun:test"
import {
  audit_session_start,
  audit_save_profile,
  audit_save_stage_output,
  audit_save_citations,
  audit_complete,
  audit_get_session,
} from "./tools"

const mockSession = {
  id: "session-123",
  status: "intake",
  case_id: "case-001",
}

const mockService = {
  startSession: mock(() => Promise.resolve(mockSession)),
  setSessionId: mock(() => Promise.resolve()),
  saveCaseProfile: mock(() => Promise.resolve()),
  saveStageOutput: mock(() => Promise.resolve()),
  saveCitations: mock(() => Promise.resolve()),
  completeAudit: mock(() => Promise.resolve({ ...mockSession, status: "completed" })),
  getCurrentSession: mock(() => Promise.resolve(mockSession)),
  getCaseProfile: mock(() => Promise.resolve({ case_id: "test" })),
  getAllStageOutputs: mock(() =>
    Promise.resolve({
      intake: { data: "test" },
      detective: null,
      strategist: null,
      gatekeeper: null,
      verifier: null,
      reporter: null,
    })
  ),
  getCitationSummary: mock(() =>
    Promise.resolve({ total: 5, verified: 3, failed: 1, pending: 1 })
  ),
}

mock.module("../../audit-core/workflow", () => ({
  getAuditSessionService: () => mockService,
}))

describe("audit-persistence tools", () => {
  beforeEach(() => {
    mockService.startSession.mockClear()
    mockService.setSessionId.mockClear()
    mockService.saveCaseProfile.mockClear()
    mockService.saveStageOutput.mockClear()
    mockService.saveCitations.mockClear()
    mockService.completeAudit.mockClear()
    mockService.getCurrentSession.mockClear()
    mockService.getCaseProfile.mockClear()
    mockService.getAllStageOutputs.mockClear()
    mockService.getCitationSummary.mockClear()
  })

  describe("audit_session_start", () => {
    it("creates a new session", async () => {
      // #given
      const args = {
        case_id: "case-001",
        case_slot: "20260126-test",
        tier: "pro" as const,
        app_type: "spousal" as const,
      }

      // #when
      const result = JSON.parse(await audit_session_start.execute(args, {} as any))

      // #then
      expect(result.success).toBe(true)
      expect(result.session_id).toBe("session-123")
      expect(mockService.startSession).toHaveBeenCalledWith({
        caseId: "case-001",
        caseSlot: "20260126-test",
        tier: "pro",
        appType: "spousal",
        userId: undefined,
      })
    })

    it("handles errors gracefully", async () => {
      // #given
      mockService.startSession.mockRejectedValueOnce(new Error("DB error"))

      // #when
      const result = JSON.parse(
        await audit_session_start.execute(
          { case_id: "x", case_slot: "x", tier: "guest" as const, app_type: "study" as const },
          {} as any
        )
      )

      // #then
      expect(result.success).toBe(false)
      expect(result.error).toContain("DB error")
    })
  })

  describe("audit_save_profile", () => {
    it("saves case profile", async () => {
      // #given
      const args = {
        session_id: "session-123",
        profile: { case_id: "test", applicant: {} },
      }

      // #when
      const result = JSON.parse(await audit_save_profile.execute(args, {} as any))

      // #then
      expect(result.success).toBe(true)
      expect(mockService.setSessionId).toHaveBeenCalledWith("session-123")
      expect(mockService.saveCaseProfile).toHaveBeenCalled()
    })
  })

  describe("audit_save_stage_output", () => {
    it("saves stage output with metadata", async () => {
      // #given
      const args = {
        session_id: "session-123",
        stage: "detective" as const,
        output: { findings: ["test"] },
        model: "claude-sonnet-4-5",
        summary: "Test summary",
      }

      // #when
      const result = JSON.parse(await audit_save_stage_output.execute(args, {} as any))

      // #then
      expect(result.success).toBe(true)
      expect(mockService.saveStageOutput).toHaveBeenCalledWith({
        stage: "detective",
        output: { findings: ["test"] },
        model: "claude-sonnet-4-5",
        temperature: undefined,
        durationMs: undefined,
        summary: "Test summary",
      })
    })
  })

  describe("audit_save_citations", () => {
    it("saves citations array", async () => {
      // #given
      const args = {
        session_id: "session-123",
        citations: [
          { citation: "Smith v. Canada, 2023 FC 123", source_stage: "detective" },
          { citation: "Doe v. Canada, 2024 FC 456" },
        ],
      }

      // #when
      const result = JSON.parse(await audit_save_citations.execute(args, {} as any))

      // #then
      expect(result.success).toBe(true)
      expect(result.count).toBe(2)
      expect(mockService.saveCitations).toHaveBeenCalledWith(args.citations)
    })
  })

  describe("audit_complete", () => {
    it("completes audit with verdict and score", async () => {
      // #given
      const args = {
        session_id: "session-123",
        verdict: "GO" as const,
        score: 85,
        score_with_mitigation: 90,
        recommendation: "PROCEED" as const,
      }

      // #when
      const result = JSON.parse(await audit_complete.execute(args, {} as any))

      // #then
      expect(result.success).toBe(true)
      expect(result.verdict).toBe("GO")
      expect(result.score).toBe(85)
      expect(mockService.completeAudit).toHaveBeenCalledWith({
        verdict: "GO",
        score: 85,
        scoreWithMitigation: 90,
        recommendation: "PROCEED",
      })
    })
  })

  describe("audit_get_session", () => {
    it("retrieves session state", async () => {
      // #given
      const args = { session_id: "session-123" }

      // #when
      const result = JSON.parse(await audit_get_session.execute(args, {} as any))

      // #then
      expect(result.success).toBe(true)
      expect(result.session).toEqual(mockSession)
      expect(result.profile.exists).toBe(true)
      expect(result.stages.intake.exists).toBe(true)
      expect(result.stages.detective.exists).toBe(false)
      expect(result.citations).toEqual({ total: 5, verified: 3, failed: 1, pending: 1 })
    })
  })
})
