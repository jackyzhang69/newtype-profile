import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { kg_search, kg_case, kg_similar_cases, kg_judge_stats } from "./tools"
import { mock } from "bun:test"

const baseUrl = "http://localhost:3104/api/v1"

describe("audit-kg tools", () => {
  let originalFetch: typeof fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
    process.env.AUDIT_KG_BASE_URL = baseUrl
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    delete process.env.AUDIT_KG_BASE_URL
  })

  it("kg_search posts to /kg/search", async () => {
    let calledUrl = ""
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url
      return new Response(JSON.stringify([{ id: 1 }]))
    }) as unknown as typeof fetch

    const result = await kg_search.execute({ issue_code: "SUB_FUNDS" }, {} as never)
    expect(calledUrl).toBe(`${baseUrl}/kg/search`)
    expect(result).toContain("id")
  })

  it("kg_case calls /kg/case", async () => {
    let calledUrl = ""
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url
      return new Response(JSON.stringify({ citation: "2024 FC 123" }))
    }) as unknown as typeof fetch

    const result = await kg_case.execute({ citation: "2024 FC 123" }, {} as never)
    expect(calledUrl).toBe(`${baseUrl}/kg/case/2024%20FC%20123`)
    expect(result).toContain("2024 FC 123")
  })

  it("kg_similar_cases posts to /kg/similar-cases", async () => {
    let calledUrl = ""
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url
      return new Response(JSON.stringify([{ score: 0.8 }]))
    }) as unknown as typeof fetch

    const result = await kg_similar_cases.execute({ country: "Canada" }, {} as never)
    expect(calledUrl).toBe(`${baseUrl}/kg/similar-cases`)
    expect(result).toContain("score")
  })

  it("kg_judge_stats calls /kg/judge/{id}/stats", async () => {
    let calledUrl = ""
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url
      return new Response(JSON.stringify({ approval_rate: 0.6 }))
    }) as unknown as typeof fetch

    const result = await kg_judge_stats.execute({ judge_id: "JUDGE_FC_ZINN" }, {} as never)
    expect(calledUrl).toBe(`${baseUrl}/kg/judge/JUDGE_FC_ZINN/stats`)
    expect(result).toContain("approval_rate")
  })
})
