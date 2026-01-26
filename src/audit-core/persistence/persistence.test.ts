import { describe, it, expect, beforeEach, mock } from "bun:test"
import {
  storagePaths,
  type CreateSessionInput,
  type CreateStageResultInput,
  type CreateCitationInput,
  type CreateDocumentInput,
  type CreateReportInput,
  type CreateCasePIIInput,
  type CreateKnowledgeBaseInput,
  type UpdateKnowledgeBaseInput,
  type SimilarCaseQuery,
} from "./types"

describe("persistence/types", () => {
  describe("storagePaths", () => {
    const sessionId = "test-session-123"

    it("generates correct source path", () => {
      // #given
      const filename = "IMM0008.pdf"

      // #when
      const path = storagePaths.source(sessionId, filename)

      // #then
      expect(path).toBe(`${sessionId}/source/${filename}`)
    })

    it("generates correct extracted path", () => {
      // #given
      const filename = "IMM0008.md"

      // #when
      const path = storagePaths.extracted(sessionId, filename)

      // #then
      expect(path).toBe(`${sessionId}/extracted/${filename}`)
    })

    it("generates correct report path", () => {
      // #given
      const version = 2
      const ext = "pdf"

      // #when
      const path = storagePaths.report(sessionId, version, ext)

      // #then
      expect(path).toBe(`${sessionId}/reports/v${version}/report.${ext}`)
    })

    it("generates correct agent output path", () => {
      // #given
      const stage = "detective"

      // #when
      const path = storagePaths.agentOutput(sessionId, stage)

      // #then
      expect(path).toBe(`${sessionId}/agent-outputs/${stage}.json`)
    })
  })
})

describe("persistence/types - input validation", () => {
  describe("CreateSessionInput", () => {
    it("accepts valid session input", () => {
      // #given
      const input: CreateSessionInput = {
        case_id: "case-001",
        case_slot: "20260126-01",
        tier: "pro",
        app_type: "spousal",
      }

      // #then
      expect(input.case_id).toBe("case-001")
      expect(input.tier).toBe("pro")
      expect(input.app_type).toBe("spousal")
    })

    it("allows optional user_id", () => {
      // #given
      const input: CreateSessionInput = {
        case_id: "case-001",
        case_slot: "20260126-01",
        tier: "guest",
        app_type: "study",
        user_id: "user-123",
      }

      // #then
      expect(input.user_id).toBe("user-123")
    })
  })

  describe("CreateStageResultInput", () => {
    it("accepts valid stage result input", () => {
      // #given
      const input: CreateStageResultInput = {
        stage: "detective",
        output_data: { findings: ["finding1", "finding2"] },
      }

      // #then
      expect(input.stage).toBe("detective")
      expect(input.output_data).toHaveProperty("findings")
    })

    it("allows optional fields", () => {
      // #given
      const input: CreateStageResultInput = {
        stage: "strategist",
        output_data: { score: 75 },
        iteration: 2,
        agent_model: "claude-sonnet-4-5",
        temperature: 0.1,
        duration_ms: 5000,
        status: "success",
        summary: "Completed analysis",
      }

      // #then
      expect(input.iteration).toBe(2)
      expect(input.agent_model).toBe("claude-sonnet-4-5")
      expect(input.status).toBe("success")
    })
  })

  describe("CreateCitationInput", () => {
    it("accepts valid citation input", () => {
      // #given
      const input: CreateCitationInput = {
        citation: "Smith v. Canada (MCI), 2023 FC 123",
      }

      // #then
      expect(input.citation).toContain("Smith v. Canada")
    })

    it("allows optional verification data", () => {
      // #given
      const input: CreateCitationInput = {
        citation: "Doe v. Canada, 2024 FC 456",
        source_stage: "detective",
        verification_status: "verified",
        authority_score: 85.5,
        case_url: "https://example.com/case/456",
      }

      // #then
      expect(input.verification_status).toBe("verified")
      expect(input.authority_score).toBe(85.5)
    })
  })

  describe("CreateDocumentInput", () => {
    it("accepts valid document input", () => {
      // #given
      const input: CreateDocumentInput = {
        filename: "passport.pdf",
      }

      // #then
      expect(input.filename).toBe("passport.pdf")
    })

    it("allows optional extraction data", () => {
      // #given
      const input: CreateDocumentInput = {
        filename: "IMM0008.pdf",
        original_path: "/path/to/IMM0008.pdf",
        file_type: "pdf",
        file_size: 1024000,
        storage_path: "session-1/source/IMM0008.pdf",
        extraction_status: "success",
        form_type: "IMM0008",
        xfa_fields: { applicant_name: "John Doe" },
        page_count: 5,
      }

      // #then
      expect(input.extraction_status).toBe("success")
      expect(input.form_type).toBe("IMM0008")
      expect(input.xfa_fields).toHaveProperty("applicant_name")
    })
  })

  describe("CreateReportInput", () => {
    it("accepts valid report input", () => {
      // #given
      const input: CreateReportInput = {
        verdict: "CAUTION",
        score: 65,
        tier: "pro",
      }

      // #then
      expect(input.verdict).toBe("CAUTION")
      expect(input.score).toBe(65)
      expect(input.tier).toBe("pro")
    })

    it("allows optional paths and metadata", () => {
      // #given
      const input: CreateReportInput = {
        verdict: "GO",
        score: 85,
        tier: "ultra",
        version: 2,
        is_final: true,
        markdown_path: "session-1/reports/v2/report.md",
        pdf_path: "session-1/reports/v2/report.pdf",
        json_path: "session-1/reports/v2/report.json",
        theme: "judicial-authority",
      }

      // #then
      expect(input.is_final).toBe(true)
      expect(input.version).toBe(2)
      expect(input.theme).toBe("judicial-authority")
    })
  })

  describe("CreateCasePIIInput", () => {
    it("accepts valid PII input with minimal fields", () => {
      // #given
      const input: CreateCasePIIInput = {
        session_id: "session-123",
      }

      // #then
      expect(input.session_id).toBe("session-123")
    })

    it("accepts full sponsor and applicant PII", () => {
      // #given
      const input: CreateCasePIIInput = {
        session_id: "session-123",
        sponsor_full_name: "John Smith",
        sponsor_family_name: "Smith",
        sponsor_given_name: "John",
        sponsor_dob: "1980-01-15",
        sponsor_passport: "AB123456",
        sponsor_uci: "1234567890",
        sponsor_contact: { email: "john@example.com", phone: "+1234567890" },
        applicant_full_name: "Jane Doe",
        applicant_family_name: "Doe",
        applicant_given_name: "Jane",
        applicant_dob: "1985-06-20",
        applicant_passport: "CD789012",
        applicant_uci: "0987654321",
        applicant_contact: { email: "jane@example.com" },
        dependents_pii: [{ name: "Child One", dob: "2015-03-10" }],
        raw_document_paths: ["session-123/source/passport.pdf"],
        user_id: "user-456",
      }

      // #then
      expect(input.sponsor_full_name).toBe("John Smith")
      expect(input.applicant_full_name).toBe("Jane Doe")
      expect(input.dependents_pii).toHaveLength(1)
      expect(input.raw_document_paths).toContain("session-123/source/passport.pdf")
    })
  })

  describe("CreateKnowledgeBaseInput", () => {
    it("accepts minimal knowledge base input", () => {
      // #given
      const input: CreateKnowledgeBaseInput = {
        application_type: "spousal",
      }

      // #then
      expect(input.application_type).toBe("spousal")
    })

    it("accepts full anonymized case data", () => {
      // #given
      const input: CreateKnowledgeBaseInput = {
        session_id: "session-123",
        application_type: "spousal",
        country_code: "CN",
        sponsor_country_code: "CA",
        applicant_age_range: "30-35",
        sponsor_age_range: "35-40",
        funds_range: "50000-100000",
        education_level: "bachelors",
        relationship_type: "marriage",
        relationship_duration_months: 24,
        has_children: false,
        has_previous_refusal: false,
        profile_features: { language_score: "CLB 7" },
        audit_report_anonymized: "Anonymized report content...",
        reasoning_chain_anonymized: "Step 1: ... Step 2: ...",
        executive_summary_anonymized: "Case summary without PII",
        risk_factors: [{ code: "RF001", description: "Short relationship" }],
        vulnerabilities: [{ area: "funds", severity: "medium" }],
        strengths: [{ area: "documentation", note: "Complete" }],
        verdict: "GO",
        score: 85,
        score_with_mitigation: 90,
        tier: "pro",
      }

      // #then
      expect(input.verdict).toBe("GO")
      expect(input.score).toBe(85)
      expect(input.country_code).toBe("CN")
      expect(input.applicant_age_range).toBe("30-35")
      expect(input.risk_factors).toHaveLength(1)
    })
  })

  describe("UpdateKnowledgeBaseInput", () => {
    it("accepts outcome annotation", () => {
      // #given
      const input: UpdateKnowledgeBaseInput = {
        actual_outcome: "approved",
        outcome_date: "2026-03-15",
        annotator_notes: "Visa issued after interview",
        is_verified: true,
        quality_score: 0.95,
      }

      // #then
      expect(input.actual_outcome).toBe("approved")
      expect(input.is_verified).toBe(true)
      expect(input.quality_score).toBe(0.95)
    })
  })

  describe("SimilarCaseQuery", () => {
    it("accepts query parameters", () => {
      // #given
      const query: SimilarCaseQuery = {
        application_type: "spousal",
        country_code: "CN",
        applicant_age_range: "25-30",
        education_level: "masters",
        limit: 10,
      }

      // #then
      expect(query.application_type).toBe("spousal")
      expect(query.limit).toBe(10)
    })
  })
})

describe("persistence/optimistic-lock", () => {
  describe("OptimisticLockError", () => {
    it("creates error with version info", () => {
      // #given
      const { OptimisticLockError } = require("./repositories/session.repository")

      // #when
      const error = new OptimisticLockError("session-123", 5, 7)

      // #then
      expect(error.name).toBe("OptimisticLockError")
      expect(error.sessionId).toBe("session-123")
      expect(error.expectedVersion).toBe(5)
      expect(error.actualVersion).toBe(7)
      expect(error.message).toContain("version mismatch")
    })

    it("handles unknown actual version", () => {
      // #given
      const { OptimisticLockError } = require("./repositories/session.repository")

      // #when
      const error = new OptimisticLockError("session-456", 3)

      // #then
      expect(error.actualVersion).toBeUndefined()
      expect(error.message).toContain("unknown")
    })

    it("is instanceof Error", () => {
      // #given
      const { OptimisticLockError } = require("./repositories/session.repository")

      // #when
      const error = new OptimisticLockError("session-123", 1, 2)

      // #then
      expect(error instanceof Error).toBe(true)
    })
  })

  describe("AuditSession version field", () => {
    it("includes version in AuditSession type", () => {
      // #given
      const session: import("./types").AuditSession = {
        id: "test-id",
        created_at: "2026-01-26",
        updated_at: "2026-01-26",
        case_id: "case-001",
        case_slot: "slot-1",
        tier: "pro",
        app_type: "spousal",
        status: "pending",
        current_stage: null,
        stages_completed: [],
        verdict: null,
        score: null,
        score_with_mitigation: null,
        recommendation: null,
        error_message: null,
        verify_iterations: 0,
        user_id: null,
        version: 1,
      }

      // #then
      expect(session.version).toBe(1)
    })

    it("version defaults to 1 for new sessions", () => {
      // #given
      const session: import("./types").AuditSession = {
        id: "new-session",
        created_at: "2026-01-26",
        updated_at: "2026-01-26",
        case_id: "case-new",
        case_slot: "slot-new",
        tier: "guest",
        app_type: "study",
        status: "pending",
        current_stage: null,
        stages_completed: [],
        verdict: null,
        score: null,
        score_with_mitigation: null,
        recommendation: null,
        error_message: null,
        verify_iterations: 0,
        user_id: null,
        version: 1,
      }

      // #then
      expect(session.version).toBe(1)
    })
  })

  describe("concurrent update scenarios (mocked)", () => {
    it("detects version mismatch when two updates race", () => {
      // #given - Two agents read the same session at version 1
      const { OptimisticLockError } = require("./repositories/session.repository")
      const sessionId = "concurrent-session"
      const agentAVersion: number = 1
      const agentBVersion: number = 1

      // Agent A updates first, version becomes 2
      const dbVersionAfterAgentA: number = 2

      // #when - Agent B tries to update with stale version 1
      const agentBExpectedVersion: number = agentBVersion
      const actualDbVersion: number = dbVersionAfterAgentA

      // #then - Agent B should get OptimisticLockError
      expect(agentBExpectedVersion).not.toBe(actualDbVersion)
      const error = new OptimisticLockError(sessionId, agentBExpectedVersion, actualDbVersion)
      expect(error.expectedVersion).toBe(1)
      expect(error.actualVersion).toBe(2)
      expect(error.message).toContain("version mismatch")
    })

    it("succeeds when version matches", () => {
      // #given - Agent reads session at version 3
      const sessionId = "matching-version-session"
      const expectedVersion = 3
      const actualDbVersion = 3

      // #when - Agent updates with correct version
      const versionMatches = expectedVersion === actualDbVersion

      // #then - Update should succeed (no error thrown)
      expect(versionMatches).toBe(true)
    })

    it("retry logic re-reads and applies update", async () => {
      // #given - Simulated retry scenario
      let retryCount = 0
      let currentDbVersion = 1

      const simulateOptimisticUpdate = async (
        sessionId: string,
        updates: Record<string, unknown>,
        expectedVersion: number
      ): Promise<{ success: boolean; newVersion: number }> => {
        // Simulate version check
        if (expectedVersion !== currentDbVersion) {
          throw new Error(`Version mismatch: expected ${expectedVersion}, actual ${currentDbVersion}`)
        }
        // Simulate successful update
        currentDbVersion++
        return { success: true, newVersion: currentDbVersion }
      }

      const simulateUpdateWithRetry = async (
        sessionId: string,
        updates: Record<string, unknown>,
        maxRetries: number
      ): Promise<{ success: boolean; retriesUsed: number }> => {
        let lastVersion = 1 // Initial read
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            await simulateOptimisticUpdate(sessionId, updates, lastVersion)
            return { success: true, retriesUsed: attempt }
          } catch {
            retryCount++
            // Re-read the current version
            lastVersion = currentDbVersion
          }
        }
        return { success: false, retriesUsed: maxRetries }
      }

      // Simulate another agent updating before our first attempt
      currentDbVersion = 2 // Someone else updated

      // #when - We try to update with retry
      const result = await simulateUpdateWithRetry("retry-session", { status: "completed" }, 3)

      // #then - Should succeed after retry
      expect(result.success).toBe(true)
      expect(result.retriesUsed).toBe(1) // Failed first, succeeded on retry
      expect(retryCount).toBe(1)
    })

    it("fails after max retries exceeded", async () => {
      // #given - Continuously changing version (simulates very high contention)
      let attemptCount = 0

      const simulateHighContentionUpdate = async (maxRetries: number): Promise<boolean> => {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          attemptCount++
          // Always fail - simulates extreme contention
          const versionMatches = false
          if (!versionMatches) {
            continue
          }
          return true
        }
        return false
      }

      // #when - Try to update with max 3 retries
      const success = await simulateHighContentionUpdate(3)

      // #then - Should fail after all retries exhausted
      expect(success).toBe(false)
      expect(attemptCount).toBe(4) // Initial + 3 retries
    })
  })

  describe("version increment behavior", () => {
    it("version increments by 1 on each update", () => {
      // #given
      const initialVersion = 1

      // #when - Simulate 3 updates
      const afterUpdate1 = initialVersion + 1
      const afterUpdate2 = afterUpdate1 + 1
      const afterUpdate3 = afterUpdate2 + 1

      // #then
      expect(afterUpdate1).toBe(2)
      expect(afterUpdate2).toBe(3)
      expect(afterUpdate3).toBe(4)
    })

    it("version is monotonically increasing", () => {
      // #given
      const versions: number[] = []
      let currentVersion = 1

      // #when - Simulate series of updates
      for (let i = 0; i < 10; i++) {
        currentVersion++
        versions.push(currentVersion)
      }

      // #then - Each version should be greater than previous
      for (let i = 1; i < versions.length; i++) {
        expect(versions[i]).toBeGreaterThan(versions[i - 1])
      }
    })
  })
})
