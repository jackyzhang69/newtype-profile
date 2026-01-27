import { describe, test, expect } from "bun:test"
import { createBuiltinAgents } from "./utils"
import type { AgentConfig } from "@opencode-ai/sdk"

describe("createBuiltinAgents with model overrides", () => {
  test("audit-manager with default model", () => {
    // #given - no overrides
    // #when
    const agents = createBuiltinAgents()

    // #then - model depends on AUDIT_TIER env (default: guest -> haiku, pro/ultra -> opus)
    const tier = process.env.AUDIT_TIER || "guest"
    const expectedModel = tier === "pro" || tier === "ultra"
      ? "anthropic/claude-opus-4-5" 
      : "anthropic/claude-haiku-4-5"
    expect(agents["audit-manager"].model).toBe(expectedModel)
  })

  test("audit-manager with GPT model override", () => {
    // #given
    const overrides = {
      "audit-manager": { model: "openai/gpt-5.2" },
    }

    // #when
    const agents = createBuiltinAgents([], overrides)

    // #then
    expect(agents["audit-manager"].model).toBe("openai/gpt-5.2")
  })

  test("gatekeeper with temperature override", () => {
    // #given
    const overrides = {
      gatekeeper: { temperature: 0.5 },
    }

    // #when
    const agents = createBuiltinAgents([], overrides)

    // #then
    expect(agents.gatekeeper.temperature).toBe(0.5)
  })
})

describe("buildAgent with skills", () => {
  const { buildAgent } = require("./utils")

  test("agent with skills has content prepended to prompt", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: ["frontend-ui-ux"],
          prompt: "Original prompt content",
        }) as AgentConfig,
    }

    // #when
    const agent = buildAgent(source["test-agent"])

    // #then
    expect(agent.prompt).toContain("Role: Designer-Turned-Developer")
    expect(agent.prompt).toContain("Original prompt content")
  })

  test("agent with multiple skills has all content prepended", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: ["frontend-ui-ux"],
          prompt: "Agent prompt",
        }) as AgentConfig,
    }

    // #when
    const agent = buildAgent(source["test-agent"])

    // #then
    expect(agent.prompt).toContain("Role: Designer-Turned-Developer")
    expect(agent.prompt).toContain("Agent prompt")
  })

  test("agent without skills works as before", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          model: "custom/model",
          temperature: 0.5,
          prompt: "Base prompt",
        }) as AgentConfig,
    }

    // #when
    const agent = buildAgent(source["test-agent"])

    // #then
    expect(agent.model).toBe("custom/model")
    expect(agent.temperature).toBe(0.5)
    expect(agent.prompt).toBe("Base prompt")
  })

  test("agent with non-existent skills only prepends found ones", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: ["frontend-ui-ux", "non-existent-skill"],
          prompt: "Base prompt",
        }) as AgentConfig,
    }

    // #when
    const agent = buildAgent(source["test-agent"])

    // #then
    expect(agent.prompt).toContain("Role: Designer-Turned-Developer")
    expect(agent.prompt).toContain("Base prompt")
  })

  test("agent with empty skills array keeps original prompt", () => {
    // #given
    const source = {
      "test-agent": () =>
        ({
          description: "Test agent",
          skills: [],
          prompt: "Base prompt",
        }) as AgentConfig,
    }

    // #when
    const agent = buildAgent(source["test-agent"])

    // #then
    expect(agent.prompt).toBe("Base prompt")
  })
})
