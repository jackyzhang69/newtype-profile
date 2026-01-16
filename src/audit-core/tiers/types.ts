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
}

export interface TierConfig {
  models: TierModelConfig
  temperatures: TierTemperatures
  features: TierFeatures
  limits: TierLimits
}
