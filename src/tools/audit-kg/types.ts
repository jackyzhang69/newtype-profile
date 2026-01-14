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
