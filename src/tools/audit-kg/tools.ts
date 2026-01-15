import { tool } from "@opencode-ai/plugin"
import { fetchJson } from "./utils"
import type { KgSearchFilters, KgSimilarCasesInput, CaselawSearchV3Input } from "./types"

export const kg_search = tool({
  description: "Search cases in the Immicore Knowledge Graph with optional filters.",
  args: {
    judge_id: tool.schema.string().optional(),
    issue_code: tool.schema.string().optional(),
    country_code: tool.schema.string().optional(),
    outcome: tool.schema.string().optional(),
    start_date: tool.schema.string().optional(),
    end_date: tool.schema.string().optional(),
    limit: tool.schema.number().optional(),
  },
  execute: async (args) => {
    try {
      const payload: KgSearchFilters = { ...args }
      const result = await fetchJson('/kg/search', {
        method: "POST",
        body: JSON.stringify(payload),
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const kg_case = tool({
  description: "Get a Knowledge Graph case by citation.",
  args: {
    citation: tool.schema.string(),
  },
  execute: async (args) => {
    try {
      const citation = encodeURIComponent(args.citation)
      const result = await fetchJson(`/kg/case/${citation}`)
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const kg_similar_cases = tool({
  description: "Find similar cases in the Immicore Knowledge Graph based on applicant profile.",
  args: {
    age_range: tool.schema.string().optional(),
    education_level: tool.schema.string().optional(),
    country: tool.schema.string().optional(),
    funds_min: tool.schema.number().optional(),
    funds_max: tool.schema.number().optional(),
    issue_codes: tool.schema.array(tool.schema.string()).optional(),
    limit: tool.schema.number().optional(),
  },
  execute: async (args) => {
    try {
      const payload: KgSimilarCasesInput = { ...args }
      const result = await fetchJson('/kg/similar-cases', {
        method: "POST",
        body: JSON.stringify(payload),
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const kg_judge_stats = tool({
  description: "Get judge stats and approval rates from the Immicore Knowledge Graph.",
  args: {
    judge_id: tool.schema.string(),
  },
  execute: async (args) => {
    try {
      const judgeId = encodeURIComponent(args.judge_id)
      const result = await fetchJson(`/kg/judge/${judgeId}/stats`)
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const immicore_caselaw_search = tool({
  description: "Search case law using ImmiCore v3.0 API with RRF fusion (BM25 + Semantic), validity checking, and authority ranking.",
  args: {
    query: tool.schema.string(),
    court: tool.schema.enum(["fc", "fca", "irb"]).optional(),
    start_date: tool.schema.string().optional(),
    end_date: tool.schema.string().optional(),
    must_include: tool.schema.array(tool.schema.string()).optional(),
    must_not: tool.schema.array(tool.schema.string()).optional(),
    top_k: tool.schema.number().optional(),
    fetch_k: tool.schema.number().optional(),
    include_text: tool.schema.boolean().optional(),
    enhance_with_kg: tool.schema.boolean().optional(),
    rerank_by_authority: tool.schema.boolean().optional(),
    authority_weight: tool.schema.number().optional(),
  },
  execute: async (args) => {
    try {
      const payload: CaselawSearchV3Input = {
        query: args.query,
        court: args.court,
        start_date: args.start_date,
        end_date: args.end_date,
        must_include: args.must_include,
        must_not: args.must_not,
        top_k: args.top_k ?? 10,
        fetch_k: args.fetch_k ?? 20,
        include_text: args.include_text ?? false,
        enhance_with_kg: args.enhance_with_kg ?? true,
        rerank_by_authority: args.rerank_by_authority ?? false,
        authority_weight: args.authority_weight ?? 0.3,
      }
      const result = await fetchJson('/api/v1/caselaw/search', {
        method: "POST",
        body: JSON.stringify(payload),
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})
