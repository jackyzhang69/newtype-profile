export type AuditTier = "guest" | "pro" | "ultra"

export type AuditAgentName =
  | "auditManager"
  | "detective"
  | "strategist"
  | "gatekeeper"
  | "verifier"

export interface TierModelConfig {
  auditManager: string
  detective: string
  strategist: string
  gatekeeper: string
  verifier?: string
}

export interface TierTemperatures {
  auditManager: number
  detective: number
  strategist: number
  gatekeeper: number
  verifier?: number
}

export interface TierFeatures {
  verifier: boolean
  kgSearch: boolean
  deepAnalysis: boolean
  multiRound: boolean
}

export interface TierLimits {
  maxCitations: number
  maxAgentCalls: number
  maxVerifyIterations: number
}

/**
 * Output constraints for controlling report length and format by tier.
 * Addresses issue: Tian case 2117 lines vs target 400-600 lines.
 */
export interface TierOutputConstraints {
  /** Maximum total lines for final report */
  maxReportLines: number
  /** Per-agent output limits */
  agentLimits: {
    detective: number
    strategist: number
    gatekeeper: number
    verifier: number
  }
  /** Threshold for generating Poison Pill defense paragraphs */
  poisonPillThreshold: "critical" | "high" | "all"
  /** Whether to include legal citation table in report */
  includeCitationTable: boolean
  /** Whether to include full legal framework section */
  includeLegalFramework: boolean
}

export interface TierConfig {
  models: TierModelConfig
  temperatures: TierTemperatures
  features: TierFeatures
  limits: TierLimits
  outputConstraints: TierOutputConstraints
}
