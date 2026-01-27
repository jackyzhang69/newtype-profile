/**
 * Tier Enforcer for Audit Resource Limits
 * Enforces tier-based limits on agent calls, citations, etc.
 */

import type { AuditTier } from "../../audit-core/workflow/types"

/**
 * Tier configuration for resource limits
 */
const TIER_CONFIG: Record<AuditTier, {
  maxAgentCalls: number
  maxCitations: number
  verifierEnabled: boolean
  kgSearchEnabled: boolean
  deepAnalysisEnabled: boolean
  multiRoundEnabled: boolean
}> = {
  guest: {
    maxAgentCalls: 4,
    maxCitations: 3,
    verifierEnabled: false,
    kgSearchEnabled: false,
    deepAnalysisEnabled: false,
    multiRoundEnabled: false,
  },
  pro: {
    maxAgentCalls: 6,
    maxCitations: 10,
    verifierEnabled: true,
    kgSearchEnabled: true,
    deepAnalysisEnabled: false,
    multiRoundEnabled: false,
  },
  ultra: {
    maxAgentCalls: 12,
    maxCitations: 20,
    verifierEnabled: true,
    kgSearchEnabled: true,
    deepAnalysisEnabled: true,
    multiRoundEnabled: true,
  },
}

export class TierEnforcer {
  private sessionId: string
  private tier: AuditTier
  private agentCallCounts: Map<string, number> = new Map()
  private totalAgentCalls: number = 0
  private citationCount: number = 0

  constructor(sessionId: string, tier: AuditTier) {
    this.sessionId = sessionId
    this.tier = tier
  }

  /**
   * Check if agent call is allowed
   */
  checkAgentCallLimit(): { allowed: boolean; reason?: string } {
    const config = TIER_CONFIG[this.tier]
    if (this.totalAgentCalls >= config.maxAgentCalls) {
      return {
        allowed: false,
        reason: `Agent call limit exceeded for ${this.tier} tier (max: ${config.maxAgentCalls})`,
      }
    }
    return { allowed: true }
  }

  /**
   * Increment agent call count
   */
  incrementAgentCall(agentName: string): void {
    this.totalAgentCalls++
    const current = this.agentCallCounts.get(agentName) ?? 0
    this.agentCallCounts.set(agentName, current + 1)
  }

  /**
   * Check if citations are within limit
   */
  checkCitationLimit(citationCount: number): boolean {
    const config = TIER_CONFIG[this.tier]
    return this.citationCount + citationCount <= config.maxCitations
  }

  /**
   * Add citations
   */
  addCitations(count: number): void {
    this.citationCount += count
  }

  /**
   * Check if feature is enabled for this tier
   */
  isFeatureEnabled(feature: string): boolean {
    const config = TIER_CONFIG[this.tier]
    switch (feature) {
      case "verifier":
        return config.verifierEnabled
      case "kg_search":
        return config.kgSearchEnabled
      case "deep_analysis":
        return config.deepAnalysisEnabled
      case "multi_round":
        return config.multiRoundEnabled
      default:
        return false
    }
  }

  /**
   * Get current usage stats
   */
  getUsageStats(): {
    tier: AuditTier
    agentCallsUsed: number
    agentCallsMax: number
    citationsUsed: number
    citationsMax: number
    agentBreakdown: Record<string, number>
  } {
    const config = TIER_CONFIG[this.tier]
    return {
      tier: this.tier,
      agentCallsUsed: this.totalAgentCalls,
      agentCallsMax: config.maxAgentCalls,
      citationsUsed: this.citationCount,
      citationsMax: config.maxCitations,
      agentBreakdown: Object.fromEntries(this.agentCallCounts),
    }
  }

  /**
   * Get remaining resources
   */
  getRemainingResources(): {
    agentCalls: number
    citations: number
  } {
    const config = TIER_CONFIG[this.tier]
    return {
      agentCalls: Math.max(0, config.maxAgentCalls - this.totalAgentCalls),
      citations: Math.max(0, config.maxCitations - this.citationCount),
    }
  }

  /**
   * Check if at limit
   */
  isAtLimit(): boolean {
    const config = TIER_CONFIG[this.tier]
    return this.totalAgentCalls >= config.maxAgentCalls || this.citationCount >= config.maxCitations
  }

  /**
   * Get tier configuration
   */
  getTierConfig() {
    return TIER_CONFIG[this.tier]
  }
}
