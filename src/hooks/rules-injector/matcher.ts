import { createHash } from "crypto"
import { relative } from "node:path"
import picomatch from "picomatch"
import type { RuleMetadata } from "./types"

export interface MatchResult {
  applies: boolean
  reason?: string
}

export interface AgentMatchOptions {
  agentName?: string
}

/**
 * Check if a rule should apply based on agent filtering
 */
export function shouldApplyToAgent(
  metadata: RuleMetadata,
  options: AgentMatchOptions
): MatchResult {
  const { agentName } = options

  if (!agentName) {
    return { applies: true, reason: "no agent context" }
  }

  if (metadata.excludeAgents?.length) {
    const normalizedAgent = agentName.toLowerCase()
    const excluded = metadata.excludeAgents.some(
      (a) => a.toLowerCase() === normalizedAgent
    )
    if (excluded) {
      return { applies: false, reason: `excludeAgents: ${agentName}` }
    }
  }

  if (metadata.agents?.length) {
    const normalizedAgent = agentName.toLowerCase()
    const included = metadata.agents.some(
      (a) => a.toLowerCase() === normalizedAgent
    )
    if (!included) {
      return { applies: false, reason: `agents whitelist excludes: ${agentName}` }
    }
    return { applies: true, reason: `agents: ${agentName}` }
  }

  return { applies: true, reason: "no agent restriction" }
}

/**
 * Check if a rule should apply to the current file based on metadata
 */
export function shouldApplyRule(
  metadata: RuleMetadata,
  currentFilePath: string,
  projectRoot: string | null,
  options: AgentMatchOptions = {}
): MatchResult {
  const agentCheck = shouldApplyToAgent(metadata, options)
  if (!agentCheck.applies) {
    return agentCheck
  }

  if (metadata.alwaysApply === true) {
    return { applies: true, reason: "alwaysApply" }
  }

  const globs = metadata.globs
  if (!globs) {
    return { applies: false }
  }

  const patterns = Array.isArray(globs) ? globs : [globs]
  if (patterns.length === 0) {
    return { applies: false }
  }

  const relativePath = projectRoot ? relative(projectRoot, currentFilePath) : currentFilePath

  for (const pattern of patterns) {
    if (picomatch.isMatch(relativePath, pattern, { dot: true, bash: true })) {
      return { applies: true, reason: `glob: ${pattern}` }
    }
  }

  return { applies: false }
}

/**
 * Check if realPath already exists in cache (symlink deduplication)
 */
export function isDuplicateByRealPath(realPath: string, cache: Set<string>): boolean {
  return cache.has(realPath)
}

/**
 * Create SHA-256 hash of content, truncated to 16 chars
 */
export function createContentHash(content: string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 16)
}

/**
 * Check if content hash already exists in cache
 */
export function isDuplicateByContentHash(hash: string, cache: Set<string>): boolean {
  return cache.has(hash)
}
