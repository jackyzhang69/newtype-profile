export interface KgSearchFilters {
  judge_id?: string
  issue_code?: string
  country_code?: string
  outcome?: string
  start_date?: string
  end_date?: string
  limit?: number
}

export interface KgSimilarCasesInput {
  age_range?: string
  education_level?: string
  country?: string
  funds_min?: number
  funds_max?: number
  issue_codes?: string[]
  limit?: number
}

export interface CaselawSearchV3Input {
  query: string
  court?: "fc" | "fca" | "irb"
  start_date?: string
  end_date?: string
  must_include?: string[]
  must_not?: string[]
  top_k?: number
  fetch_k?: number
  include_text?: boolean
  enhance_with_kg?: boolean
  rerank_by_authority?: boolean
  authority_weight?: number
}

export interface CaselawValidity {
  is_good_law: boolean
  validity_status: "GOOD_LAW" | "OVERRULED" | "DISTINGUISHED" | "QUESTIONED"
  warning: string | null
}

export interface CaselawAuthority {
  authority_score: number
  cited_by_count: number
  cites_count: number
  authority_rank: number
}

export interface CaselawSearchV3Result {
  citation: string
  style_of_cause: string
  judgment_date: string
  court: string
  url: string
  rrf_score: number
  final_rank: number
  bm25_rank: number
  semantic_rank: number
  match_type: "bm25" | "semantic" | "both"
  validity?: CaselawValidity
  authority?: CaselawAuthority
  text?: string
}

export interface CaselawSearchV3Response {
  results: CaselawSearchV3Result[]
  query_type: string
  total_found: number
  bm25_count: number
  semantic_count: number
  latency_ms: number
  kg_enhanced: boolean
}
