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

export interface KeywordSearchFilters {
  citation?: string
  court?: string
  start_date?: string
  end_date?: string
  must_include?: string[]
  must_not?: string[]
  optional_keywords?: string[]
  judgment_result?: string[]
}

export interface KeywordSearchRequest {
  query: string
  filters?: KeywordSearchFilters
  top_k?: number
  from_?: number
  strategy?: "balanced" | "precision" | "filter_driven"
  field_boosts?: {
    style_of_cause?: number
    citation?: number
    text?: number
  }
  key_phrases?: Array<{
    field: string
    query: string
    boost: number
  }>
  enable_highlighting?: boolean
}

export interface SemanticSearchRequest {
  query: string
  court?: string
  start_date?: string
  end_date?: string
  fetch_k?: number
  top_k?: number
}

export interface OptimizedSearchFilters {
  court?: string
  start_date?: string
  end_date?: string
  judge_id?: string
  issue_code?: string
  country_code?: string
  outcome?: string
}

export interface OptimizedSearchRequest {
  query: string
  filters?: OptimizedSearchFilters
  target_count?: number
  interpret_count?: number
  enable_cache?: boolean
  auto_route?: boolean
}

export interface CaseAuthorityParams {
  citation: string
}

export interface CaseValidityParams {
  citation: string
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

export interface KeywordSearchResult {
  page_content: string
  metadata: {
    id: string
    citation: string
    style_of_cause: string
    text: string
    url: string
    judgment_date: string
    court: string
    score: number
    highlight?: {
      text?: string[]
      style_of_cause?: string[]
      citation?: string[]
    }
  }
}

export interface KeywordSearchResponse {
  results: KeywordSearchResult[]
  total?: number
}

export interface SemanticSearchResult {
  citation: string | null
  style_of_cause: string | null
  highlights: string[]
  metadata: {
    citation: string
    style_of_cause: string
    url: string
    judgment_date: string
    court: string
  }
}

export interface SemanticSearchResponse {
  results: SemanticSearchResult[]
  total?: number
}

export interface OptimizedSearchMatchMetadata {
  citation: string
  combined_score: number
  bm25_score: number
  semantic_score: number
  kg_score: number
  match_type: "intersection" | "bm25+semantic" | "bm25" | "semantic" | "kg"
}

export interface OptimizedSearchInterpretation {
  why_relevant: string
  facts: string
  arguments: string
  decision: string
  consideration: string
}

export interface OptimizedSearchResult {
  citation: string
  style_of_cause: string
  text: string
  url: string
  judgment_date: string
  court: string
  score: number
  match_metadata: OptimizedSearchMatchMetadata
  highlight?: Record<string, unknown>
  interpretation?: OptimizedSearchInterpretation
}

export interface OptimizedSearchQueryInfo {
  query_type: "keyword" | "semantic" | "kg" | "hybrid"
  has_intersection: boolean
  citations_from_bm25: number
  citations_from_semantic: number
  citations_from_kg: number
  final_count: number
  interpretation_count: number
}

export interface OptimizedSearchPerformance {
  total_latency_ms: number
  phase1_query_ms: number
  phase2_selection_ms: number
  phase3_fetch_ms: number
  phase4_interpret_ms: number
  cache_hit: boolean
}

export interface OptimizedSearchResponse {
  results: OptimizedSearchResult[]
  query_info: OptimizedSearchQueryInfo
  performance?: OptimizedSearchPerformance
}

export interface CaseAuthorityInfo {
  citation: string
  style_of_cause: string
  authority_score: number
  cited_by_count: number
  cites_count: number
  is_good_law: boolean
  top_citing_cases: string[]
}

export interface CaseValidityInfo {
  citation: string
  is_good_law: boolean
  validity_status: string
  warning: string | null
  affecting_cases: Array<{
    citation: string
    type: string
    date: string
  }>
}

export interface TopAuthoritiesParams {
  issue_code?: string
  court?: string
  outcome?: string
  limit?: number
}

export interface TopAuthorityCase {
  citation: string
  style_of_cause: string | null
  authority_score: number
  authority_rank: number
  cited_by_count: number
  cites_count: number
  is_good_law: boolean
}

export interface KgMetadataResponse {
  issue_codes: string[]
  courts: string[]
  outcomes: string[]
  total_cases?: number
  cases_with_citations?: number
}
