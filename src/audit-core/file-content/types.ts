/**
 * FileContentService API types
 * Based on ImmiCore PRD: ~/immicore/docs/services/file-content/PRD.md
 */

export type TaskStatus = "pending" | "processing" | "completed" | "failed"
export type PdfType = "text" | "scanned" | "xfa" | "mixed"
export type OutputFormat = "markdown" | "text" | "json"

export interface TaskCreatedResponse {
  task_id: string
  status: "pending"
  message: string
  file_count: number
  estimated_seconds: number
  links: { self: string; cancel?: string }
}

export interface TaskProgress {
  current: number
  total: number
  percentage: number
  current_file: string | null
}

export interface TaskError {
  code: string
  message: string
  failed_file?: string
}

export interface TaskStatusResponse {
  task_id: string
  status: TaskStatus
  progress: TaskProgress
  created_at: string
  started_at: string | null
  completed_at: string | null
  error?: TaskError
  summary?: { total_chars: number; total_pages: number }
  links: { self: string; result?: string }
}

export interface XfaField {
  field_id: string
  label: string
  value: string
  path?: string
  type?: string
}

export interface FileMetadata {
  filename: string
  format: string
  pdf_type?: PdfType
  size_bytes: number
  page_count?: number
  sheet_count?: number
  char_count: number
  language?: string
  extracted_at: string
  author?: string
  created_at?: string
  ocr_confidence?: number
  has_xfa?: boolean
  xfa_field_count?: number
  xfa_fields?: XfaField[]
}

export interface PageContent {
  page: number
  title?: string
  content: string
  char_count: number
}

export interface ExtractedFile {
  filename: string
  format: string
  pdf_type: PdfType | null
  content: string
  pages?: PageContent[]
  metadata: FileMetadata
}

export interface ExtractionResultData {
  content: string | null
  pages?: PageContent[]
  metadata: FileMetadata | null
  files: ExtractedFile[] | null
}

export interface ExtractionResult {
  task_id: string
  status: TaskStatus
  result: ExtractionResultData
  completed_at: string
}

export interface ExtractOptions {
  output_format?: OutputFormat
  detect_scanned?: boolean
  extract_xfa?: boolean
  include_structure?: boolean
}

export interface PollOptions {
  pollIntervalMs?: number
  maxWaitMs?: number
  onProgress?: (status: TaskStatusResponse) => void
}
