import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { kg_search, kg_case, kg_similar_cases, kg_judge_stats, immicore_caselaw_search } from "./tools"
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
      return new Response(JSON.stringify([{ id: 1 }]), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    const result = await kg_search.execute({ issue_code: "SUB_FUNDS" }, {} as never)
    expect(calledUrl).toBe(`${baseUrl}/kg/search`)
    expect(result).toContain("id")
  })

  it("kg_case calls /kg/case", async () => {
    let calledUrl = ""
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url
      return new Response(JSON.stringify({ citation: "2024 FC 123" }), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    const result = await kg_case.execute({ citation: "2024 FC 123" }, {} as never)
    expect(calledUrl).toBe(`${baseUrl}/kg/case/2024%20FC%20123`)
    expect(result).toContain("2024 FC 123")
  })

  it("kg_similar_cases posts to /kg/similar-cases", async () => {
    let calledUrl = ""
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url
      return new Response(JSON.stringify([{ score: 0.8 }]), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    const result = await kg_similar_cases.execute({ country: "Canada" }, {} as never)
    expect(calledUrl).toBe(`${baseUrl}/kg/similar-cases`)
    expect(result).toContain("score")
  })

  it("kg_judge_stats calls /kg/judge/{id}/stats", async () => {
    let calledUrl = ""
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url
      return new Response(JSON.stringify({ approval_rate: 0.6 }), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    const result = await kg_judge_stats.execute({ judge_id: "JUDGE_FC_ZINN" }, {} as never)
    expect(calledUrl).toBe(`${baseUrl}/kg/judge/JUDGE_FC_ZINN/stats`)
    expect(result).toContain("approval_rate")
  })

  it("immicore_caselaw_search posts to /api/v1/caselaw/search with v3.0 params", async () => {
    // #given: mock fetch and v3.0 response
    let calledUrl = ""
    let calledBody = ""
    globalThis.fetch = mock(async (url: string, init?: RequestInit) => {
      calledUrl = url
      calledBody = init?.body as string
      return new Response(JSON.stringify({
        results: [{ citation: "2024 FC 123", rrf_score: 0.85 }],
        total_found: 1,
        kg_enhanced: true,
      }), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    // #when: executing with v3.0 parameters
    const result = await immicore_caselaw_search.execute({
      query: "spousal sponsorship genuineness",
      court: "fc",
      enhance_with_kg: true,
      must_include: ["IRPR 4(1)"],
    }, {} as never)

    // #then: correct endpoint and parameters used
    expect(calledUrl).toBe(`${baseUrl}/api/v1/caselaw/search`)
    const body = JSON.parse(calledBody)
    expect(body.query).toBe("spousal sponsorship genuineness")
    expect(body.court).toBe("fc")
    expect(body.enhance_with_kg).toBe(true)
    expect(body.must_include).toEqual(["IRPR 4(1)"])
    expect(result).toContain("2024 FC 123")
    expect(result).toContain("kg_enhanced")
  })
})
