import { tool } from "@opencode-ai/plugin"
import { fetchJson } from "./utils"
import type { KgSearchFilters, KgSimilarCasesInput } from "./types"

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
