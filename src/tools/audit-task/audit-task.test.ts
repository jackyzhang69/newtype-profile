/**
 * Audit Task Tool Tests
 * 
 * Ensures AUDIT_AGENTS constant stays in sync with actual agent implementations
 */

import { describe, test, expect } from "bun:test"
import { readdirSync } from "node:fs"
import { join } from "node:path"
import { AUDIT_AGENTS } from "./constants"

describe("audit_task configuration", () => {
  test("AUDIT_AGENTS constant matches actual agent files", () => {
    // #given: Agent files exist in src/audit-core/agents/
    const agentsDir = join(__dirname, "../../audit-core/agents")
    const agentFiles = readdirSync(agentsDir)
      .filter(file => file.endsWith(".ts") && !file.endsWith(".test.ts"))
      .map(file => file.replace(".ts", ""))
      .filter(name => name !== "audit-manager") // AuditManager is not a subagent
      .sort()

    // #when: We compare with AUDIT_AGENTS constant
    const constantAgents = [...AUDIT_AGENTS].sort()

    // #then: They should match exactly
    expect(constantAgents.join(",")).toBe(agentFiles.join(","))
  })

  test("AUDIT_AGENTS contains expected count", () => {
    // #given: AUDIT_AGENTS constant
    const agents = AUDIT_AGENTS

    // #when: We check the count
    const count = agents.length

    // #then: Should have 7 agents (intake, detective, strategist, gatekeeper, verifier, judge, reporter)
    expect(count).toBe(7)
  })

  test("AUDIT_AGENTS contains no duplicates", () => {
    // #given: AUDIT_AGENTS constant
    const agents = AUDIT_AGENTS

    // #when: We check for duplicates
    const uniqueAgents = [...new Set(agents)]

    // #then: No duplicates should exist
    expect(uniqueAgents.length).toBe(agents.length)
  })

  test("All AUDIT_AGENTS are lowercase with hyphens", () => {
    // #given: AUDIT_AGENTS constant
    const agents = AUDIT_AGENTS

    // #when: We check naming convention
    const invalidNames = agents.filter(name => {
      return name !== name.toLowerCase() || name.includes("_")
    })

    // #then: All names should be lowercase with hyphens only
    expect(invalidNames.length).toBe(0)
  })
})
