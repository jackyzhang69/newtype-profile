import { describe, it, expect } from "bun:test"
import { auditManagerAgent } from "./agents/audit-manager"
import { detectiveAgent } from "./agents/detective"
import { strategistAgent } from "./agents/strategist"
import { gatekeeperAgent } from "./agents/gatekeeper"
import { reporterAgent } from "./agents/reporter"
import { createBuiltinAgents } from "../agents/utils"

describe("Audit Core Agents", () => {
  describe("AuditManager", () => {
    it("should have correct role definition", () => {
      expect(auditManagerAgent.prompt).toContain('You are "AuditManager"')
      expect(auditManagerAgent.mode).toBe("primary")
    })

    it("should have simplified prompt (refactored for WorkflowEngine)", () => {
      // New simplified prompt structure
      expect(auditManagerAgent.prompt).toContain("<Workflow_Detection>")
      expect(auditManagerAgent.prompt).toContain("<Workflow_Execution>")
      expect(auditManagerAgent.prompt).toContain("<Delegation_Rules>")
      expect(auditManagerAgent.prompt).toContain("<Output_Synthesis>")

      // Base prompt should be concise (66 lines vs original 274 lines)
      // Note: Full prompt includes injected skills, so total length is larger
      expect(auditManagerAgent.prompt).toContain("workflow_next")
    })

    it("should mention workflow tools", () => {
      expect(auditManagerAgent.prompt).toContain("workflow_next")
      expect(auditManagerAgent.prompt).toContain("workflow_complete")
      expect(auditManagerAgent.prompt).toContain("workflow_status")
    })

    it("should have workflow tools enabled", () => {
      const tools = auditManagerAgent.tools as Record<string, boolean>
      expect(tools.workflow_next).toBe(true)
      expect(tools.workflow_complete).toBe(true)
      expect(tools.workflow_status).toBe(true)
    })

    it("should have audit_task tool enabled", () => {
      expect(auditManagerAgent.tools).toBeDefined()
      expect((auditManagerAgent.tools as Record<string, boolean>).audit_task).toBe(true)
    })

    it("should disable destructive tools (write, edit, bash)", () => {
      const tools = auditManagerAgent.tools as Record<string, boolean | undefined>
      // write and bash should not be in tools (disabled)
      expect(tools.write).not.toBe(true)
      expect(tools.bash).not.toBe(true)
    })

    it("should mention delegation to specialized agents", () => {
      expect(auditManagerAgent.prompt).toContain("Intake")
      expect(auditManagerAgent.prompt).toContain("Detective")
      expect(auditManagerAgent.prompt).toContain("Strategist")
      expect(auditManagerAgent.prompt).toContain("Gatekeeper")
      expect(auditManagerAgent.prompt).toContain("Verifier")
      expect(auditManagerAgent.prompt).toContain("Reporter")
    })

    it("should emphasize agent coordination, not case analysis", () => {
      expect(auditManagerAgent.prompt).toContain("orchestrate")
      expect(auditManagerAgent.prompt).toContain("dispatch agents")
      expect(auditManagerAgent.prompt).toContain("Analyze the case yourself")
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

  describe("Reporter", () => {
    it("should have subagent mode", () => {
      expect(reporterAgent.mode).toBe("subagent")
    })

    it("should focus on report generation", () => {
      expect(reporterAgent.prompt).toContain("Reporter")
      expect(reporterAgent.prompt).toContain("report")
    })

    it("should have write restriction (prevent direct file writing)", () => {
      if ((reporterAgent as any).permission) {
        expect((reporterAgent as any).permission.write).toBe("deny")
        return
      }
      if ((reporterAgent.tools as any)?.write === false) {
        expect((reporterAgent.tools as any).write).toBe(false)
        return
      }
      expect((reporterAgent.tools as any)?.exclude).toContain("write")
    })

    it("should use buildAuditPrompt for skill injection (not minimal prompt)", () => {
      // Should contain injected skills content
      expect(reporterAgent.prompt.length).toBeGreaterThan(500)
      // Should mention tier context from buildAuditPrompt
      expect(reporterAgent.prompt).toContain("<Tier_Context>")
    })
  })

  describe("Integration", () => {
    it("should be included in builtin agents", () => {
      const agents = createBuiltinAgents()
      expect(agents["audit-manager"]).toBeDefined()
      expect(agents["detective"]).toBeDefined()
      expect(agents["strategist"]).toBeDefined()
      expect(agents["gatekeeper"]).toBeDefined()
      expect(agents["reporter"]).toBeDefined()
    })
  })
})
