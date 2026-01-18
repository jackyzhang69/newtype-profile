import { tool } from "@opencode-ai/plugin"
import { existsSync } from "fs"
import { getFileContentClient } from "../../audit-core/file-content"
import { FILE_CONTENT_EXTRACT_DESCRIPTION } from "./constants"
import type { FileContentExtractArgs } from "./types"

export const file_content_extract = tool({
  description: FILE_CONTENT_EXTRACT_DESCRIPTION,
  args: {
    file_paths: tool.schema
      .array(tool.schema.string())
      .describe("Array of absolute file paths to extract"),
    output_format: tool.schema
      .enum(["markdown", "text", "json"])
      .optional()
      .describe("Output format (default: markdown)"),
    detect_scanned: tool.schema
      .boolean()
      .optional()
      .describe("Auto-detect and OCR scanned PDFs (default: true)"),
    extract_xfa: tool.schema
      .boolean()
      .optional()
      .describe("Extract XFA form fields (default: true)"),
    include_structure: tool.schema
      .boolean()
      .optional()
      .describe("Return page-level content (default: false)"),
    wait_for_result: tool.schema
      .boolean()
      .optional()
      .describe("Wait for extraction to complete (default: true)"),
  },
  execute: async (args: FileContentExtractArgs) => {
    try {
      const missingFiles = args.file_paths.filter((p) => !existsSync(p))
      if (missingFiles.length > 0) {
        return JSON.stringify({
          error: "Files not found",
          missing_files: missingFiles,
        })
      }

      if (args.file_paths.length === 0) {
        return JSON.stringify({ error: "No file paths provided" })
      }

      const client = getFileContentClient()

      const task = await client.submitExtraction(args.file_paths, {
        output_format: args.output_format,
        detect_scanned: args.detect_scanned,
        extract_xfa: args.extract_xfa,
        include_structure: args.include_structure,
      })

      if (args.wait_for_result === false) {
        return JSON.stringify({
          task_id: task.task_id,
          status: task.status,
          file_count: task.file_count,
          estimated_seconds: task.estimated_seconds,
          message: "Task submitted. Poll /file-content/tasks/{task_id} for status.",
        })
      }

      const result = await client.pollUntilComplete(task.task_id)

      return JSON.stringify(result)
    } catch (error) {
      return JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },
})
