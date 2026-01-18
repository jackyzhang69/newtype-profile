import type { OutputFormat } from "../../audit-core/file-content/types"

export interface FileContentExtractArgs {
  file_paths: string[]
  output_format?: OutputFormat
  detect_scanned?: boolean
  extract_xfa?: boolean
  include_structure?: boolean
  wait_for_result?: boolean
}
