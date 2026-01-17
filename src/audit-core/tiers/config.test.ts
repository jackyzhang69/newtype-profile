import { describe, it, expect } from "bun:test"
import { TIER_CONFIGS, DEFAULT_TIER } from "./config"
import type { AuditTier } from "./types"

describe("TIER_CONFIGS", () => {
  const tiers: AuditTier[] = ["guest", "pro", "ultra"]

  it("#given all tier names #when accessing TIER_CONFIGS #then each tier has a config", () => {
    for (const tier of tiers) {
      expect(TIER_CONFIGS[tier]).toBeDefined()
    }
  })

  describe("guest tier", () => {
    const config = TIER_CONFIGS.guest

    it("#given guest tier #when checking models #then all use gemini-flash", () => {
      expect(config.models.auditManager).toBe("google/gemini-3-flash")
      expect(config.models.detective).toBe("google/gemini-3-flash")
      expect(config.models.strategist).toBe("google/gemini-3-flash")
      expect(config.models.gatekeeper).toBe("google/gemini-3-flash")
      expect(config.models.verifier).toBe("google/gemini-3-flash")
    })

    it("#given guest tier #when checking features #then verifier enabled but no KG", () => {
      expect(config.features.verifier).toBe(true)
      expect(config.features.kgSearch).toBe(false)
      expect(config.features.deepAnalysis).toBe(false)
    })

    it("#given guest tier #when checking limits #then limits are minimal", () => {
      expect(config.limits.maxCitations).toBe(3)
      expect(config.limits.maxAgentCalls).toBe(4)
    })
  })

  describe("pro tier", () => {
    const config = TIER_CONFIGS.pro

    it("#given pro tier #when checking models #then uses sonnet and gemini-pro", () => {
      expect(config.models.auditManager).toBe("anthropic/claude-sonnet-4-5")
      expect(config.models.detective).toBe("google/gemini-3-pro-high")
      expect(config.models.verifier).toBe("google/gemini-3-flash")
    })

    it("#given pro tier #when checking features #then verifier is enabled", () => {
      expect(config.features.verifier).toBe(true)
      expect(config.features.kgSearch).toBe(true)
      expect(config.features.deepAnalysis).toBe(false)
    })

    it("#given pro tier #when checking limits #then limits are moderate", () => {
      expect(config.limits.maxCitations).toBe(10)
      expect(config.limits.maxAgentCalls).toBe(6)
    })
  })

  describe("ultra tier", () => {
    const config = TIER_CONFIGS.ultra

    it("#given ultra tier #when checking models #then uses opus for manager", () => {
      expect(config.models.auditManager).toBe("anthropic/claude-opus-4-5")
      expect(config.models.verifier).toBe("anthropic/claude-haiku-4-5")
    })

    it("#given ultra tier #when checking features #then all features enabled", () => {
      expect(config.features.verifier).toBe(true)
      expect(config.features.kgSearch).toBe(true)
      expect(config.features.deepAnalysis).toBe(true)
      expect(config.features.multiRound).toBe(true)
    })

    it("#given ultra tier #when checking limits #then limits are maximum", () => {
      expect(config.limits.maxCitations).toBe(20)
      expect(config.limits.maxAgentCalls).toBe(12)
    })
  })
})

describe("DEFAULT_TIER", () => {
  it("#given no tier specified #then default is guest", () => {
    expect(DEFAULT_TIER).toBe("guest")
  })
})
