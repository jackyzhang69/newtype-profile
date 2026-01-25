import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { createAuditSearchGuardHook } from "./index"

const TOOL_INPUT = { tool: "websearch_web_search_exa", sessionID: "s1", callID: "c1" }

function makeOutput(query: string) {
  return { args: { query } }
}

describe("audit-search-guard", () => {
  const env = { ...process.env }

  beforeEach(() => {
    // #given: Ensure stdio transport to avoid HTTP health checks in tests
    process.env.AUDIT_MCP_TRANSPORT = "stdio"
  })

  afterEach(() => {
    process.env = { ...env }
  })

  it("blocks websearch when policy is mcp_only", async () => {
    process.env.AUDIT_SEARCH_POLICY = "mcp_only"
    const hook = createAuditSearchGuardHook({} as never)
    const output = makeOutput("spousal sponsorship")

    await expect(
      hook["tool.execute.before"](TOOL_INPUT, output)
    ).rejects.toThrow("mcp_only")
  })

  it("appends whitelist when no site filter provided", async () => {
    process.env.AUDIT_SEARCH_POLICY = "mcp_first"
    process.env.AUDIT_WEB_WHITELIST = JSON.stringify({
      government: ["ircc.gc.ca"],
      professional: ["gands.com"],
      public: ["reddit.com"],
    })

    const hook = createAuditSearchGuardHook({} as never)
    const output = makeOutput("spousal sponsorship policy")

    await hook["tool.execute.before"](TOOL_INPUT, output)

    const query = output.args.query as string
    expect(query).toContain("site:ircc.gc.ca")
    expect(query).toContain("site:gands.com")
  })

  it("blocks non-whitelisted site filters", async () => {
    process.env.AUDIT_SEARCH_POLICY = "mcp_first"
    process.env.AUDIT_WEB_WHITELIST = JSON.stringify({
      government: ["ircc.gc.ca"],
      professional: [],
      public: [],
    })

    const hook = createAuditSearchGuardHook({} as never)
    const output = makeOutput("site:example.com spousal")

    await expect(
      hook["tool.execute.before"](TOOL_INPUT, output)
    ).rejects.toThrow("non-whitelisted")
  })
})
