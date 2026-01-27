import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import {
  isValidTier,
  getAuditTier,
  getTierConfig,
  getAgentModel,
  getAgentTemperature,
  getTierFeature,
  getTierLimit,
  isVerifierEnabled,
} from "./loader"

describe("isValidTier", () => {
  it("#given valid tier names #then returns true", () => {
    expect(isValidTier("guest")).toBe(true)
    expect(isValidTier("pro")).toBe(true)
    expect(isValidTier("ultra")).toBe(true)
  })

  it("#given invalid tier names #then returns false", () => {
    expect(isValidTier("free")).toBe(false)
    expect(isValidTier("standard")).toBe(false)
    expect(isValidTier("premium")).toBe(false)
    expect(isValidTier("")).toBe(false)
    expect(isValidTier("GUEST")).toBe(false)
  })
})

describe("getAuditTier", () => {
  const originalEnv = process.env.AUDIT_TIER

  beforeEach(() => {
    delete process.env.AUDIT_TIER
  })

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.AUDIT_TIER = originalEnv
    } else {
      delete process.env.AUDIT_TIER
    }
  })

  it("#given no env var #then returns default tier (guest)", () => {
    expect(getAuditTier()).toBe("guest")
  })

  it("#given valid AUDIT_TIER env #then returns that tier", () => {
    process.env.AUDIT_TIER = "pro"
    expect(getAuditTier()).toBe("pro")

    process.env.AUDIT_TIER = "ultra"
    expect(getAuditTier()).toBe("ultra")
  })

  it("#given AUDIT_TIER with different case #then normalizes to lowercase", () => {
    process.env.AUDIT_TIER = "PRO"
    expect(getAuditTier()).toBe("pro")

    process.env.AUDIT_TIER = "Ultra"
    expect(getAuditTier()).toBe("ultra")
  })

  it("#given invalid AUDIT_TIER #then returns default tier", () => {
    process.env.AUDIT_TIER = "invalid"
    expect(getAuditTier()).toBe("guest")
  })
})

describe("getTierConfig", () => {
  it("#given specific tier #then returns that tier's config", () => {
    const guestConfig = getTierConfig("guest")
    expect(guestConfig.models.auditManager).toBe("anthropic/claude-haiku-4-5")

    const proConfig = getTierConfig("pro")
    expect(proConfig.models.auditManager).toBe("anthropic/claude-opus-4-5")

    const ultraConfig = getTierConfig("ultra")
    expect(ultraConfig.models.auditManager).toBe("anthropic/claude-opus-4-5")
  })
})

describe("getAgentModel", () => {
  it("#given agent name and tier #then returns correct model", () => {
    expect(getAgentModel("auditManager", "guest")).toBe("anthropic/claude-haiku-4-5")
    expect(getAgentModel("auditManager", "pro")).toBe("anthropic/claude-opus-4-5")
    expect(getAgentModel("detective", "ultra")).toBe("anthropic/claude-sonnet-4-5")
  })

  it("#given verifier on any tier #then returns haiku-4-5 model", () => {
    expect(getAgentModel("verifier", "guest")).toBe("anthropic/claude-haiku-4-5")
    expect(getAgentModel("verifier", "pro")).toBe("anthropic/claude-haiku-4-5")
    expect(getAgentModel("verifier", "ultra")).toBe("anthropic/claude-haiku-4-5")
  })
})

describe("getAgentTemperature", () => {
  it("#given agent and tier #then returns correct temperature", () => {
    expect(getAgentTemperature("auditManager", "guest")).toBe(0.3)
    expect(getAgentTemperature("auditManager", "pro")).toBe(0.2)
    expect(getAgentTemperature("verifier", "pro")).toBe(0.0)
  })
})

describe("getTierFeature", () => {
  it("#given feature name and tier #then returns correct value", () => {
    expect(getTierFeature("verifier", "guest")).toBe(true)
    expect(getTierFeature("verifier", "pro")).toBe(true)
    expect(getTierFeature("verifier", "ultra")).toBe(true)
    expect(getTierFeature("deepAnalysis", "guest")).toBe(false)
    expect(getTierFeature("deepAnalysis", "pro")).toBe(false)
    expect(getTierFeature("deepAnalysis", "ultra")).toBe(true)
  })
})

describe("getTierLimit", () => {
  it("#given limit name and tier #then returns correct value", () => {
    expect(getTierLimit("maxCitations", "guest")).toBe(3)
    expect(getTierLimit("maxCitations", "pro")).toBe(10)
    expect(getTierLimit("maxCitations", "ultra")).toBe(20)
    expect(getTierLimit("maxAgentCalls", "ultra")).toBe(12)
  })

  it("#given maxVerifyIterations #then returns tier-specific values", () => {
    expect(getTierLimit("maxVerifyIterations", "guest")).toBe(1)
    expect(getTierLimit("maxVerifyIterations", "pro")).toBe(2)
    expect(getTierLimit("maxVerifyIterations", "ultra")).toBe(3)
  })
})

describe("isVerifierEnabled", () => {
  it("#given any tier #then verifier is enabled", () => {
    expect(isVerifierEnabled("guest")).toBe(true)
    expect(isVerifierEnabled("pro")).toBe(true)
    expect(isVerifierEnabled("ultra")).toBe(true)
  })
})
