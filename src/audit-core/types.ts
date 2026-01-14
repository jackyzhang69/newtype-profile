import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "../agents/types"

export type AuditAgentName = 
  | "audit-manager"
  | "detective"
  | "strategist"
  | "gatekeeper"

export const AUDIT_MANAGER_MODEL = "openai/gpt-5.2"
export const DETECTIVE_MODEL = "openai/gpt-5.2"
export const STRATEGIST_MODEL = "openai/gpt-5.2"
export const GATEKEEPER_MODEL = "openai/gpt-5.2"
