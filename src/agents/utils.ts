import type { AgentConfig } from "@opencode-ai/sdk"
import type { BuiltinAgentName, AgentOverrideConfig, AgentOverrides, AgentFactory, AgentPromptMetadata } from "./types"

import { createAuditManagerAgent, AUDIT_MANAGER_PROMPT_METADATA } from "../audit-core/agents/audit-manager"
import { createDetectiveAgent, DETECTIVE_PROMPT_METADATA } from "../audit-core/agents/detective"
import { createStrategistAgent, STRATEGIST_PROMPT_METADATA } from "../audit-core/agents/strategist"
import { createGatekeeperAgent, GATEKEEPER_PROMPT_METADATA } from "../audit-core/agents/gatekeeper"
import { deepMerge } from "../shared"
import { DEFAULT_CATEGORIES } from "../tools/chief-task/constants"
import { resolveMultipleSkills } from "../features/opencode-skill-loader/skill-content"

type AgentSource = AgentFactory | AgentConfig

const agentSources: Record<BuiltinAgentName, AgentSource> = {
  "audit-manager": createAuditManagerAgent,
  detective: createDetectiveAgent,
  strategist: createStrategistAgent,
  gatekeeper: createGatekeeperAgent,
}

/**
 * Metadata for each agent, used to build Chief's dynamic prompt sections
 * (Delegation Table, Tool Selection, Key Triggers, etc.)
 */
const agentMetadata: Partial<Record<BuiltinAgentName, AgentPromptMetadata>> = {
  "audit-manager": AUDIT_MANAGER_PROMPT_METADATA,
  detective: DETECTIVE_PROMPT_METADATA,
  strategist: STRATEGIST_PROMPT_METADATA,
  gatekeeper: GATEKEEPER_PROMPT_METADATA,
}

function isFactory(source: AgentSource): source is AgentFactory {
  return typeof source === "function"
}

export function buildAgent(source: AgentSource, model?: string): AgentConfig {
  const base = isFactory(source) ? source(model) : source

  const agentWithCategory = base as AgentConfig & { category?: string; skills?: string[] }
  if (agentWithCategory.category) {
    const categoryConfig = DEFAULT_CATEGORIES[agentWithCategory.category]
    if (categoryConfig) {
      if (!base.model) {
        base.model = categoryConfig.model
      }
      if (base.temperature === undefined && categoryConfig.temperature !== undefined) {
        base.temperature = categoryConfig.temperature
      }
    }
  }

  if (agentWithCategory.skills?.length) {
    const { resolved } = resolveMultipleSkills(agentWithCategory.skills)
    if (resolved.size > 0) {
      const skillContent = Array.from(resolved.values()).join("\n\n")
      base.prompt = skillContent + (base.prompt ? "\n\n" + base.prompt : "")
    }
  }

  return base
}

/**
 * Creates OmO-specific environment context (time, timezone, locale).
 * Note: Working directory, platform, and date are already provided by OpenCode's system.ts,
 * so we only include fields that OpenCode doesn't provide to avoid duplication.
 * See: https://github.com/code-yeongyu/oh-my-opencode/issues/379
 */
export function createEnvContext(): string {
  const now = new Date()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const locale = Intl.DateTimeFormat().resolvedOptions().locale

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })

  return `
<omo-env>
  Current time: ${timeStr}
  Timezone: ${timezone}
  Locale: ${locale}
</omo-env>`
}

function mergeAgentConfig(
  base: AgentConfig,
  override: AgentOverrideConfig
): AgentConfig {
  const { prompt_append, ...rest } = override
  const merged = deepMerge(base, rest as Partial<AgentConfig>)

  if (prompt_append && merged.prompt) {
    merged.prompt = merged.prompt + "\n" + prompt_append
  }

  return merged
}

export function createBuiltinAgents(
  disabledAgents: BuiltinAgentName[] = [],
  agentOverrides: AgentOverrides = {},
  directory?: string,
  systemDefaultModel?: string
): Record<string, AgentConfig> {
  const result: Record<string, AgentConfig> = {}

  for (const [name, source] of Object.entries(agentSources)) {
    const agentName = name as BuiltinAgentName

    if (disabledAgents.includes(agentName)) continue

    const override = agentOverrides[agentName]
    const model = override?.model

    let config = buildAgent(source, model)

    if (override) {
      config = mergeAgentConfig(config, override)
    }

    result[name] = config
  }

  return result
}
