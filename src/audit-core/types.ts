import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "../agents/types"
import { getAgentModel, getAgentTemperature } from "./tiers"

export type AuditAgentName =
  | "audit-manager"
  | "detective"
  | "strategist"
  | "gatekeeper"
  | "verifier"
  | "judge"

export const getAuditManagerModel = () => getAgentModel("auditManager")
export const getDetectiveModel = () => getAgentModel("detective")
export const getStrategistModel = () => getAgentModel("strategist")
export const getGatekeeperModel = () => getAgentModel("gatekeeper")
export const getJudgeModel = () => getAgentModel("judge")

export const getAuditManagerTemperature = () => getAgentTemperature("auditManager")
export const getDetectiveTemperature = () => getAgentTemperature("detective")
export const getStrategistTemperature = () => getAgentTemperature("strategist")
export const getGatekeeperTemperature = () => getAgentTemperature("gatekeeper")
export const getJudgeTemperature = () => getAgentTemperature("judge")
