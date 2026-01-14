import type { AgentConfig } from "@opencode-ai/sdk"
import { auditManagerAgent } from "../audit-core/agents/audit-manager"
import { detectiveAgent } from "../audit-core/agents/detective"
import { strategistAgent } from "../audit-core/agents/strategist"
import { gatekeeperAgent } from "../audit-core/agents/gatekeeper"

export const builtinAgents: Record<string, AgentConfig> = {
  "audit-manager": auditManagerAgent,
  detective: detectiveAgent,
  strategist: strategistAgent,
  gatekeeper: gatekeeperAgent,
}

export * from "./types"
export { createBuiltinAgents } from "./utils"
