import type { AgentConfig } from "@opencode-ai/sdk"
import { createAuditManagerAgent } from "../audit-core/agents/audit-manager"
import { createDetectiveAgent } from "../audit-core/agents/detective"
import { createStrategistAgent } from "../audit-core/agents/strategist"
import { createGatekeeperAgent } from "../audit-core/agents/gatekeeper"
import { createVerifierAgent } from "../audit-core/agents/verifier"

export function getBuiltinAgents(): Record<string, AgentConfig> {
  const baseAgents: Record<string, AgentConfig> = {
    "audit-manager": createAuditManagerAgent(),
    detective: createDetectiveAgent(),
    strategist: createStrategistAgent(),
    gatekeeper: createGatekeeperAgent(),
  }

  const verifierAgent = createVerifierAgent()
  if (verifierAgent) {
    return { ...baseAgents, verifier: verifierAgent }
  }
  return baseAgents
}

export * from "./types"
export { createBuiltinAgents } from "./utils"
