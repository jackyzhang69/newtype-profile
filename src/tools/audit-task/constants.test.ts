import { describe, expect, test } from "bun:test"
import { AUDIT_AGENTS, IMMI_OS_TOOLS, BLOCKED_TOOLS } from "./constants"

describe("audit-task constants", () => {
  describe("AUDIT_AGENTS", () => {
    test("includes all required agents", () => {
      // #given the audit workflow requires 6 agents
      const requiredAgents = ["intake", "detective", "strategist", "gatekeeper", "verifier", "reporter"] as const

      // #when checking AUDIT_AGENTS
      // #then all required agents should be present
      expect(AUDIT_AGENTS).toEqual(requiredAgents)
    })

    test("reporter agent is included", () => {
      // #given Reporter agent is needed for PDF generation
      // #when checking AUDIT_AGENTS
      // #then reporter should be in the list
      expect(AUDIT_AGENTS).toContain("reporter")
    })
  })

  describe("IMMI_OS_TOOLS", () => {
    test("includes bash tool for Reporter PDF generation", () => {
      // #given Reporter agent needs to execute document-generator script
      // #when checking IMMI_OS_TOOLS
      // #then bash tool should be enabled
      expect(IMMI_OS_TOOLS.bash).toBe(true)
    })

    test("includes all audit persistence tools", () => {
      // #given audit workflow needs persistence at each stage
      // #when checking IMMI_OS_TOOLS
      // #then all audit_* tools should be enabled
      expect(IMMI_OS_TOOLS.audit_session_start).toBe(true)
      expect(IMMI_OS_TOOLS.audit_save_profile).toBe(true)
      expect(IMMI_OS_TOOLS.audit_save_stage_output).toBe(true)
      expect(IMMI_OS_TOOLS.audit_save_citations).toBe(true)
      expect(IMMI_OS_TOOLS.audit_complete).toBe(true)
      expect(IMMI_OS_TOOLS.audit_get_session).toBe(true)
    })

    test("includes all MCP tools for legal research", () => {
      // #given Detective agent needs MCP access for case law and policy
      // #when checking IMMI_OS_TOOLS
      // #then all MCP tools should be enabled
      expect(IMMI_OS_TOOLS.caselaw_keyword_search).toBe(true)
      expect(IMMI_OS_TOOLS.caselaw_semantic_search).toBe(true)
      expect(IMMI_OS_TOOLS.caselaw_optimized_search).toBe(true)
      expect(IMMI_OS_TOOLS.operation_manual_keyword_search).toBe(true)
      expect(IMMI_OS_TOOLS.operation_manual_semantic_search).toBe(true)
      expect(IMMI_OS_TOOLS.help_centre_search).toBe(true)
    })

    test("includes file operations for report generation", () => {
      // #given Reporter needs to read/write files
      // #when checking IMMI_OS_TOOLS
      // #then file operation tools should be enabled
      expect(IMMI_OS_TOOLS.read).toBe(true)
      expect(IMMI_OS_TOOLS.write).toBe(true)
      expect(IMMI_OS_TOOLS.glob).toBe(true)
      expect(IMMI_OS_TOOLS.grep).toBe(true)
    })
  })

  describe("BLOCKED_TOOLS", () => {
    test("blocks recursive agent spawning", () => {
      // #given audit agents should not spawn other agents recursively
      // #when checking BLOCKED_TOOLS
      // #then task/chief_task/audit_task should be blocked
      expect(BLOCKED_TOOLS.task).toBe(false)
      expect(BLOCKED_TOOLS.chief_task).toBe(false)
      expect(BLOCKED_TOOLS.audit_task).toBe(false)
      expect(BLOCKED_TOOLS.call_omo_agent).toBe(false)
    })
  })
})
