import { describe, it, expect } from "bun:test"
import { auditManagerAgent } from "./agents/audit-manager"
import { detectiveAgent } from "./agents/detective"
import { strategistAgent } from "./agents/strategist"
import { gatekeeperAgent } from "./agents/gatekeeper"
import { createBuiltinAgents } from "../agents/utils"

describe("Audit Core Agents", () => {
  describe("AuditManager", () => {
    it("should have correct role definition", () => {
      expect(auditManagerAgent.prompt).toContain('You are "AuditManager"')
      expect(auditManagerAgent.mode).toBe("primary")
    })

    it("should mention specialized agents", () => {
      expect(auditManagerAgent.prompt).toContain("Detective")
      expect(auditManagerAgent.prompt).toContain("Strategist")
      expect(auditManagerAgent.prompt).toContain("Gatekeeper")
      expect(auditManagerAgent.prompt).toContain("Business_Context")
    })

    // #given Audit-Manager prompt with auto-start mechanism
    // #when checking for automatic workflow trigger
    // #then should contain trigger conditions and mandatory behavior
    it("should have automatic workflow trigger mechanism", () => {
      expect(auditManagerAgent.prompt).toContain("<Automatic_Workflow_Trigger>")
      expect(auditManagerAgent.prompt).toContain("AUTO-START RULES")
      expect(auditManagerAgent.prompt).toContain("MUST FIRST")
      expect(auditManagerAgent.prompt).toContain("MUST IMMEDIATELY")
      expect(auditManagerAgent.prompt).toContain("MUST NOT")
    })

    // #given Audit-Manager prompt with trigger conditions
    // #when checking trigger patterns
    // #then should map triggers to correct workflows
    it("should have trigger conditions for RISK_AUDIT workflow", () => {
      expect(auditManagerAgent.prompt).toContain("case directory path")
      expect(auditManagerAgent.prompt).toContain("audit_session_start")
      expect(auditManagerAgent.prompt).toContain("dispatch `Intake`")
    })

    // #given Audit-Manager configured for orchestration
    // #when checking tool access
    // #then should have audit_task tool enabled
    it("should have audit_task tool enabled", () => {
      expect(auditManagerAgent.tools).toBeDefined()
      expect((auditManagerAgent.tools as Record<string, boolean>).audit_task).toBe(true)
    })

    // #given Audit-Manager prompt with wrong response example
    // #when checking anti-patterns
    // #then should explicitly show what NOT to do
    it("should include anti-pattern examples", () => {
      expect(auditManagerAgent.prompt).toContain("WRONG Response")
      expect(auditManagerAgent.prompt).toContain("NEVER do this")
      expect(auditManagerAgent.prompt).toContain("Could you tell me")
    })
  })

  describe("Detective", () => {
    it("should have subagent mode", () => {
      expect(detectiveAgent.mode).toBe("subagent")
    })

    it("should use immicore tools", () => {
      expect(detectiveAgent.prompt).toContain("immicore_caselaw_search")
      expect(detectiveAgent.prompt).toContain("immicore_manual_lookup")
      expect(detectiveAgent.prompt).toContain("配偶团聚")
    })

    it("should have write restriction", () => {
      if ((detectiveAgent as any).permission) {
        expect((detectiveAgent as any).permission.write).toBe("deny")
        return
      }
      if ((detectiveAgent.tools as any)?.write === false) {
        expect((detectiveAgent.tools as any).write).toBe(false)
        return
      }
      expect((detectiveAgent.tools as any)?.exclude).toContain("write")
    })
  })

  describe("Strategist", () => {
    it("should have subagent mode", () => {
      expect(strategistAgent.mode).toBe("subagent")
    })

    it("should focus on risk scoring", () => {
      expect(strategistAgent.prompt).toContain("Risk Scoring")
    })
  })

  describe("Gatekeeper", () => {
    it("should have subagent mode", () => {
      expect(gatekeeperAgent.mode).toBe("subagent")
    })

    it("should focus on compliance checks", () => {
      expect(gatekeeperAgent.prompt).toContain("Policy Compliance")
    })
  })

  describe("Integration", () => {
    it("should be included in builtin agents", () => {
      const agents = createBuiltinAgents()
      expect(agents["audit-manager"]).toBeDefined()
      expect(agents["detective"]).toBeDefined()
      expect(agents["strategist"]).toBeDefined()
      expect(agents["gatekeeper"]).toBeDefined()
    })
  })
})
