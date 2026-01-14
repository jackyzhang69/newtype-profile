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
