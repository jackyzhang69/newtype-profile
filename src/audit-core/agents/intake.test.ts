import { describe, it, expect } from "bun:test"
import { createIntakeAgent } from "./intake"

describe("Intake Agent", () => {
  it("#given no parameters #when creating agent #then uses default model and temperature", () => {
    const agent = createIntakeAgent()

    expect(agent.model).toBe("anthropic/claude-sonnet-4")
    expect(agent.temperature).toBe(0.1)
    expect(agent.mode).toBe("primary")
  })

  it("#given custom model and temperature #when creating agent #then uses provided values", () => {
    const agent = createIntakeAgent("openai/gpt-4", 0.2)

    expect(agent.model).toBe("openai/gpt-4")
    expect(agent.temperature).toBe(0.2)
  })

  it("#given agent created #when checking tools #then denies write/edit/glob/grep/webfetch/websearch/look_at", () => {
    const agent = createIntakeAgent()

    const deniedTools = [
      "write",
      "edit",
      "glob",
      "grep",
      "webfetch",
      "websearch",
      "look_at",
    ]

    if ("permission" in agent && agent.permission) {
      deniedTools.forEach((tool) => {
        const permission = agent.permission as Record<string, string>
        expect(permission[tool]).toBe("deny")
      })
    } else if ("tools" in agent && agent.tools) {
      deniedTools.forEach((tool) => {
        const tools = agent.tools as Record<string, boolean>
        expect(tools[tool]).toBe(false)
      })
    }
  })

  it("#given agent created #when checking prompt #then contains intake instructions", () => {
    const agent = createIntakeAgent()

    expect(agent.prompt).toContain("Intake")
    expect(agent.prompt).toContain("file_content_extract")
    expect(agent.prompt).toContain("Intent Recognition")
    expect(agent.prompt).toContain("Form Parsing")
    expect(agent.prompt).toContain("Fact Extraction")
    expect(agent.prompt).toContain("Structured Profile")
  })

  it("#given agent created #when checking description #then describes intake purpose", () => {
    const agent = createIntakeAgent()

    expect(agent.description).toContain("Stage 0")
    expect(agent.description).toContain("Intake")
    expect(agent.description).toContain("facts")
    expect(agent.description).toContain("intent")
  })

  it("#given agent created #when checking prompt #then supports multiple document formats", () => {
    const agent = createIntakeAgent()

    expect(agent.prompt).toContain("pdf")
    expect(agent.prompt).toContain("docx")
    expect(agent.prompt).toContain("doc")
    expect(agent.prompt).toContain("jpg")
    expect(agent.prompt).toContain("png")
  })

  it("#given agent created #when checking prompt #then does NOT do analysis", () => {
    const agent = createIntakeAgent()

    expect(agent.prompt).toContain("FACT EXTRACTOR")
    expect(agent.prompt).toContain("do NOT")
    expect(agent.prompt).toContain("Assess risks")
    expect(agent.prompt).toContain("Make legal judgments")
  })
})
