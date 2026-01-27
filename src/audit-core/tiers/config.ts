import type { AuditTier, TierConfig } from "./types"

export const TIER_CONFIGS: Record<AuditTier, TierConfig> = {
  guest: {
    models: {
      auditManager: "anthropic/claude-haiku-4-5",
      detective: "anthropic/claude-haiku-4-5",
      strategist: "anthropic/claude-haiku-4-5",
      gatekeeper: "anthropic/claude-haiku-4-5",
      verifier: "anthropic/claude-haiku-4-5",
      judge: "anthropic/claude-sonnet-4-5",
      reporter: "anthropic/claude-haiku-4-5",
    },
    temperatures: {
      auditManager: 0.3,
      detective: 0.2,
      strategist: 0.4,
      gatekeeper: 0.2,
      verifier: 0.0,
      judge: 0.1,
      reporter: 0.1,
    },
    features: {
      verifier: true,
      kgSearch: false,
      deepAnalysis: false,
      multiRound: false,
    },
    limits: {
      maxCitations: 3,
      maxAgentCalls: 4,
      maxVerifyIterations: 1,
    },
    outputConstraints: {
      maxReportLines: 400,
      agentLimits: {
        detective: 100,
        strategist: 150,
        gatekeeper: 80,
        verifier: 30,
      },
      poisonPillThreshold: "critical",
      includeCitationTable: false,
      includeLegalFramework: false,
    },
  },

  pro: {
    models: {
      auditManager: "anthropic/claude-sonnet-4-5",
      detective: "anthropic/claude-sonnet-4-5",
      strategist: "anthropic/claude-sonnet-4-5",
      gatekeeper: "anthropic/claude-sonnet-4-5",
      verifier: "anthropic/claude-haiku-4-5",
      judge: "anthropic/claude-opus-4-5",
      reporter: "anthropic/claude-haiku-4-5",
    },
    temperatures: {
      auditManager: 0.2,
      detective: 0.1,
      strategist: 0.3,
      gatekeeper: 0.1,
      verifier: 0.0,
      judge: 0.1,
      reporter: 0.1,
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
      maxVerifyIterations: 2,
    },
    outputConstraints: {
      maxReportLines: 500,
      agentLimits: {
        detective: 120,
        strategist: 200,
        gatekeeper: 100,
        verifier: 40,
      },
      poisonPillThreshold: "high",
      includeCitationTable: false,
      includeLegalFramework: false,
    },
  },

  ultra: {
    models: {
      auditManager: "anthropic/claude-opus-4-5",
      detective: "anthropic/claude-sonnet-4-5",
      strategist: "anthropic/claude-sonnet-4-5",
      gatekeeper: "anthropic/claude-sonnet-4-5",
      verifier: "anthropic/claude-haiku-4-5",
      judge: "anthropic/claude-opus-4-5",
      reporter: "anthropic/claude-haiku-4-5",
    },
    temperatures: {
      auditManager: 0.2,
      detective: 0.1,
      strategist: 0.3,
      gatekeeper: 0.1,
      verifier: 0.0,
      judge: 0.1,
      reporter: 0.1,
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
      maxVerifyIterations: 3,
    },
    outputConstraints: {
      maxReportLines: 600,
      agentLimits: {
        detective: 150,
        strategist: 250,
        gatekeeper: 100,
        verifier: 50,
      },
      poisonPillThreshold: "all",
      includeCitationTable: true,
      includeLegalFramework: true,
    },
  },
}

export const DEFAULT_TIER: AuditTier = "guest"
