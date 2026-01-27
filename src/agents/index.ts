import type { AgentConfig } from "@opencode-ai/sdk"
import { auditManagerAgent } from "../audit-core/agents/audit-manager"
import { createDetectiveAgent } from "../audit-core/agents/detective"
import { createStrategistAgent } from "../audit-core/agents/strategist"
import { createGatekeeperAgent } from "../audit-core/agents/gatekeeper"
import { createVerifierAgent } from "../audit-core/agents/verifier"
import { createIntakeAgent } from "../audit-core/agents/intake"
import { createReporterAgent } from "../audit-core/agents/reporter"

export function getBuiltinAgents(): Record<string, AgentConfig> {
  const baseAgents: Record<string, AgentConfig> = {
    "audit-manager": auditManagerAgent,
    detective: createDetectiveAgent(),
    strategist: createStrategistAgent(),
    gatekeeper: createGatekeeperAgent(),
    intake: createIntakeAgent(),
    reporter: createReporterAgent(),
  }

  const verifierAgent = createVerifierAgent()
  if (verifierAgent) {
    return { ...baseAgents, verifier: verifierAgent }
  }
  return baseAgents
}

export * from "./types"
export { createBuiltinAgents } from "./utils"
