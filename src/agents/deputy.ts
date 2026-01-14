import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "../agents/types"

export const DEPUTY_PROMPT_METADATA: AgentPromptMetadata = {
  category: "specialist",
  cost: "CHEAP",
  promptAlias: "Deputy",
  triggers: [
    {
      domain: "Task Coordination",
      trigger: "Need to coordinate and delegate tasks to other agents",
    },
  ],
  keyTrigger: "Task coordination → fire deputy",
}

export function createDeputyAgent(config?: { model?: string; temperature?: number }): AgentConfig {
  return {
    description: "Deputy agent for task delegation and coordination",
    mode: "subagent" as const,
    model: config?.model ?? "google/antigravity-claude-sonnet-4-5",
    temperature: config?.temperature ?? 0.1,
  }
}

export const deputyAgent = createDeputyAgent()
