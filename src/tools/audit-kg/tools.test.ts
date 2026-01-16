import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import {
  kg_search,
  kg_case,
  kg_similar_cases,
  kg_judge_stats,
  immicore_caselaw_search,
  caselaw_keyword_search,
  caselaw_semantic_search,
  caselaw_optimized_search,
  caselaw_authority,
  caselaw_validity,
} from "./tools"
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
    // #given: mock fetch
    let calledUrl = ""
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url
      return new Response(JSON.stringify([{ id: 1 }]), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    // #when: executing kg_search
    const result = await kg_search.execute({ issue_code: "SUB_FUNDS" }, {} as never)

    // #then: correct endpoint called
    expect(calledUrl).toBe(`${baseUrl}/kg/search`)
    expect(result).toContain("id")
  })

  it("kg_case calls /kg/case/{citation}", async () => {
    // #given: mock fetch
    let calledUrl = ""
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url
      return new Response(JSON.stringify({ citation: "2024 FC 123" }), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    // #when: executing kg_case
    const result = await kg_case.execute({ citation: "2024 FC 123" }, {} as never)

    // #then: correct endpoint called with encoded citation
    expect(calledUrl).toBe(`${baseUrl}/kg/case/2024%20FC%20123`)
    expect(result).toContain("2024 FC 123")
  })

  it("kg_similar_cases posts to /kg/similar-cases", async () => {
    // #given: mock fetch
    let calledUrl = ""
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url
      return new Response(JSON.stringify([{ score: 0.8 }]), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    // #when: executing kg_similar_cases
    const result = await kg_similar_cases.execute({ country: "Canada" }, {} as never)

    // #then: correct endpoint called
    expect(calledUrl).toBe(`${baseUrl}/kg/similar-cases`)
    expect(result).toContain("score")
  })

  it("kg_judge_stats calls /kg/judge/{id}/stats", async () => {
    // #given: mock fetch
    let calledUrl = ""
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url
      return new Response(JSON.stringify({ approval_rate: 0.6 }), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    // #when: executing kg_judge_stats
    const result = await kg_judge_stats.execute({ judge_id: "JUDGE_FC_ZINN" }, {} as never)

    // #then: correct endpoint called
    expect(calledUrl).toBe(`${baseUrl}/kg/judge/JUDGE_FC_ZINN/stats`)
    expect(result).toContain("approval_rate")
  })

  it("caselaw_keyword_search posts to /rag/keyword-caselaw-retrieve", async () => {
    // #given: mock fetch
    let calledUrl = ""
    let calledBody = ""
    globalThis.fetch = mock(async (url: string, init?: RequestInit) => {
      calledUrl = url
      calledBody = init?.body as string
      return new Response(JSON.stringify({
        results: [{ metadata: { citation: "2024 FC 123" } }],
      }), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    // #when: executing keyword search
    const result = await caselaw_keyword_search.execute({
      query: "study permit refusal",
      court: "fc",
      must_include: ["dual intent"],
    }, {} as never)

    // #then: correct endpoint and parameters
    expect(calledUrl).toBe(`${baseUrl}/rag/keyword-caselaw-retrieve`)
    const body = JSON.parse(calledBody)
    expect(body.query).toBe("study permit refusal")
    expect(body.filters.court).toBe("fc")
    expect(body.filters.must_include).toEqual(["dual intent"])
    expect(result).toContain("2024 FC 123")
  })

  it("caselaw_semantic_search posts to /rag/semantic-caselaw-search", async () => {
    // #given: mock fetch
    let calledUrl = ""
    let calledBody = ""
    globalThis.fetch = mock(async (url: string, init?: RequestInit) => {
      calledUrl = url
      calledBody = init?.body as string
      return new Response(JSON.stringify({
        results: [{ citation: "2024 FC 456" }],
      }), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    // #when: executing semantic search
    const result = await caselaw_semantic_search.execute({
      query: "relationship genuineness assessment",
      court: "fc",
      top_k: 5,
    }, {} as never)

    // #then: correct endpoint and parameters
    expect(calledUrl).toBe(`${baseUrl}/rag/semantic-caselaw-search`)
    const body = JSON.parse(calledBody)
    expect(body.query).toBe("relationship genuineness assessment")
    expect(body.court).toBe("fc")
    expect(body.top_k).toBe(5)
    expect(result).toContain("2024 FC 456")
  })

  it("caselaw_optimized_search posts to /rag/caselaw-optimized-search", async () => {
    // #given: mock fetch
    let calledUrl = ""
    let calledBody = ""
    globalThis.fetch = mock(async (url: string, init?: RequestInit) => {
      calledUrl = url
      calledBody = init?.body as string
      return new Response(JSON.stringify({
        results: [{ citation: "2024 FC 789" }],
        query_info: { query_type: "hybrid", has_intersection: true },
      }), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    // #when: executing optimized search
    const result = await caselaw_optimized_search.execute({
      query: "LMIA refusal",
      target_count: 10,
      interpret_count: 3,
    }, {} as never)

    // #then: correct endpoint and parameters
    expect(calledUrl).toBe(`${baseUrl}/rag/caselaw-optimized-search`)
    const body = JSON.parse(calledBody)
    expect(body.query).toBe("LMIA refusal")
    expect(body.target_count).toBe(10)
    expect(body.interpret_count).toBe(3)
    expect(result).toContain("2024 FC 789")
    expect(result).toContain("hybrid")
  })

  it("caselaw_authority calls /case/{citation}/authority", async () => {
    // #given: mock fetch
    let calledUrl = ""
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url
      return new Response(JSON.stringify({
        citation: "2024 FC 123",
        authority_score: 0.85,
        cited_by_count: 42,
      }), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    // #when: executing authority check
    const result = await caselaw_authority.execute({ citation: "2024 FC 123" }, {} as never)

    // #then: correct endpoint called
    expect(calledUrl).toBe(`${baseUrl}/case/2024%20FC%20123/authority`)
    expect(result).toContain("authority_score")
    expect(result).toContain("cited_by_count")
  })

  it("caselaw_validity calls /case/{citation}/validity", async () => {
    // #given: mock fetch
    let calledUrl = ""
    globalThis.fetch = mock(async (url: string) => {
      calledUrl = url
      return new Response(JSON.stringify({
        citation: "2024 FC 123",
        is_good_law: true,
        validity_status: "GOOD_LAW",
      }), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    // #when: executing validity check
    const result = await caselaw_validity.execute({ citation: "2024 FC 123" }, {} as never)

    // #then: correct endpoint called
    expect(calledUrl).toBe(`${baseUrl}/case/2024%20FC%20123/validity`)
    expect(result).toContain("is_good_law")
    expect(result).toContain("GOOD_LAW")
  })

  it("immicore_caselaw_search redirects to keyword search", async () => {
    // #given: mock fetch
    let calledUrl = ""
    let calledBody = ""
    globalThis.fetch = mock(async (url: string, init?: RequestInit) => {
      calledUrl = url
      calledBody = init?.body as string
      return new Response(JSON.stringify({
        results: [{ metadata: { citation: "2024 FC 123" } }],
      }), {
        headers: { "Content-Type": "application/json" }
      })
    }) as unknown as typeof fetch

    // #when: executing legacy immicore_caselaw_search
    const result = await immicore_caselaw_search.execute({
      query: "spousal sponsorship genuineness",
      court: "fc",
      must_include: ["IRPR 4(1)"],
    }, {} as never)

    // #then: redirects to keyword search endpoint
    expect(calledUrl).toBe(`${baseUrl}/rag/keyword-caselaw-retrieve`)
    const body = JSON.parse(calledBody)
    expect(body.query).toBe("spousal sponsorship genuineness")
    expect(body.filters.court).toBe("fc")
    expect(body.filters.must_include).toEqual(["IRPR 4(1)"])
    expect(result).toContain("2024 FC 123")
  })
})
