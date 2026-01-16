import type { AuditTier, TierConfig } from "./types"

export const TIER_CONFIGS: Record<AuditTier, TierConfig> = {
  guest: {
    models: {
      auditManager: "google/gemini-3-flash",
      detective: "google/gemini-3-flash",
      strategist: "google/gemini-3-flash",
      gatekeeper: "google/gemini-3-flash",
    },
    temperatures: {
      auditManager: 0.3,
      detective: 0.2,
      strategist: 0.4,
      gatekeeper: 0.2,
    },
    features: {
      verifier: false,
      kgSearch: false,
      deepAnalysis: false,
      multiRound: false,
    },
    limits: {
      maxCitations: 3,
      maxAgentCalls: 4,
    },
  },

  pro: {
    models: {
      auditManager: "anthropic/claude-sonnet-4-5",
      detective: "google/gemini-3-pro-high",
      strategist: "anthropic/claude-sonnet-4-5",
      gatekeeper: "anthropic/claude-sonnet-4-5",
      verifier: "google/gemini-3-flash",
    },
    temperatures: {
      auditManager: 0.2,
      detective: 0.1,
      strategist: 0.3,
      gatekeeper: 0.1,
      verifier: 0.0,
    },
    features: {
      verifier: true,
      kgSearch: true,
      deepAnalysis: false,
      multiRound: false,
    },
    limits: {
      maxCitations: 10,
      maxAgentCalls: 6,
    },
  },

  ultra: {
    models: {
      auditManager: "anthropic/claude-opus-4-5",
      detective: "anthropic/claude-sonnet-4-5",
      strategist: "anthropic/claude-sonnet-4-5",
      gatekeeper: "anthropic/claude-sonnet-4-5",
      verifier: "anthropic/claude-haiku-4-5",
    },
    temperatures: {
      auditManager: 0.2,
      detective: 0.1,
      strategist: 0.3,
      gatekeeper: 0.1,
      verifier: 0.0,
    },
    features: {
      verifier: true,
      kgSearch: true,
      deepAnalysis: true,
      multiRound: true,
    },
    limits: {
      maxCitations: 20,
      maxAgentCalls: 12,
    },
  },
}

export const DEFAULT_TIER: AuditTier = "guest"
