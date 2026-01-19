import type { AuditTier, TierConfig, AuditAgentName } from "./types"
import { TIER_CONFIGS, DEFAULT_TIER } from "./config"

const VALID_TIERS: readonly AuditTier[] = ["guest", "pro", "ultra"]

export function isValidTier(tier: string): tier is AuditTier {
  return VALID_TIERS.includes(tier as AuditTier)
}

let tierWarningLogged = false

export function getAuditTier(): AuditTier {
  const envTier = process.env.AUDIT_TIER?.toLowerCase()
  if (envTier && isValidTier(envTier)) {
    return envTier
  }
  if (!tierWarningLogged && envTier) {
    console.warn(`[Audit] Invalid AUDIT_TIER="${envTier}", using default: ${DEFAULT_TIER}`)
    tierWarningLogged = true
  }
  return DEFAULT_TIER
}

export function logTierInfo(context: string = "Audit"): void {
  const tier = getAuditTier()
  const config = getTierConfig(tier)
  console.log(`[${context}] Tier: ${tier}`)
  console.log(`[${context}] Verifier: ${config.features.verifier ? "enabled" : "disabled"}`)
  console.log(`[${context}] KG Search: ${config.features.kgSearch ? "enabled" : "disabled"}`)
}

export function getTierConfig(tier?: AuditTier): TierConfig {
  const resolvedTier = tier ?? getAuditTier()
  return TIER_CONFIGS[resolvedTier]
}

export function getAgentModel(agent: AuditAgentName, tier?: AuditTier): string {
  const config = getTierConfig(tier)
  const model = config.models[agent]
  if (!model) {
    throw new Error(`Model not configured for agent "${agent}" at tier "${tier ?? getAuditTier()}"`)
  }
  return model
}

export function getAgentTemperature(agent: AuditAgentName, tier?: AuditTier): number {
  const config = getTierConfig(tier)
  return config.temperatures[agent] ?? 0.2
}

export function getTierFeature<K extends keyof TierConfig["features"]>(
  feature: K,
  tier?: AuditTier
): TierConfig["features"][K] {
  const config = getTierConfig(tier)
  return config.features[feature]
}

export function getTierLimit<K extends keyof TierConfig["limits"]>(
  limit: K,
  tier?: AuditTier
): TierConfig["limits"][K] {
  const config = getTierConfig(tier)
  return config.limits[limit]
}

export function isVerifierEnabled(tier?: AuditTier): boolean {
  return getTierFeature("verifier", tier)
}
