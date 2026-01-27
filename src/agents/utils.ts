import type { AgentConfig } from "@opencode-ai/sdk"
import type { BuiltinAgentName, AgentOverrideConfig, AgentOverrides, AgentFactory, AgentPromptMetadata } from "./types"

import { createAuditManagerAgent, AUDIT_MANAGER_PROMPT_METADATA } from "../audit-core/agents/audit-manager"
import { createDetectiveAgent, DETECTIVE_PROMPT_METADATA } from "../audit-core/agents/detective"
import { createStrategistAgent, STRATEGIST_PROMPT_METADATA } from "../audit-core/agents/strategist"
import { createGatekeeperAgent, GATEKEEPER_PROMPT_METADATA } from "../audit-core/agents/gatekeeper"
import { createVerifierAgent, VERIFIER_PROMPT_METADATA } from "../audit-core/agents/verifier"
import { createJudgeAgent, JUDGE_PROMPT_METADATA } from "../audit-core/agents/judge"
import { createReporterAgent, REPORTER_PROMPT_METADATA } from "../audit-core/agents/reporter"
import { deepMerge } from "../shared"
import { resolveMultipleSkills } from "../features/opencode-skill-loader/skill-content"

type AgentSource = AgentFactory | AgentConfig
type ConditionalAgentSource = () => AgentConfig | null

const agentSources: Record<string, AgentSource> = {
  "audit-manager": createAuditManagerAgent,
  detective: createDetectiveAgent,
  strategist: createStrategistAgent,
  gatekeeper: createGatekeeperAgent,
  judge: createJudgeAgent,
  reporter: createReporterAgent,
}

const conditionalAgentSources: Record<string, ConditionalAgentSource> = {
  verifier: createVerifierAgent,
}

const agentMetadata: Partial<Record<BuiltinAgentName, AgentPromptMetadata>> = {
  "audit-manager": AUDIT_MANAGER_PROMPT_METADATA,
  detective: DETECTIVE_PROMPT_METADATA,
  strategist: STRATEGIST_PROMPT_METADATA,
  gatekeeper: GATEKEEPER_PROMPT_METADATA,
  verifier: VERIFIER_PROMPT_METADATA,
  judge: JUDGE_PROMPT_METADATA,
  reporter: REPORTER_PROMPT_METADATA,
}

function isFactory(source: AgentSource): source is AgentFactory {
  return typeof source === "function"
}

export function buildAgent(source: AgentSource, model?: string): AgentConfig {
  const base = isFactory(source) ? source(model) : source

  const agentWithSkills = base as AgentConfig & { skills?: string[] }
  if (agentWithSkills.skills?.length) {
    const { resolved } = resolveMultipleSkills(agentWithSkills.skills)
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

  for (const [name, factory] of Object.entries(conditionalAgentSources)) {
    const agentName = name as BuiltinAgentName

    if (disabledAgents.includes(agentName)) continue

    const config = factory()
    if (!config) continue

    const override = agentOverrides[agentName]
    if (override) {
      result[name] = mergeAgentConfig(config, override)
    } else {
      result[name] = config
    }
  }

  return result
}
