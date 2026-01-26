import { tool } from "@opencode-ai/plugin"
import { existsSync, writeFileSync, mkdirSync } from "fs"
import { dirname } from "path"
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
    save_to_file: tool.schema
      .string()
      .optional()
      .describe("Save full content to this file path. Returns summary only when set."),
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

      const result = await client.extractBatched(args.file_paths, {
        output_format: args.output_format,
        detect_scanned: args.detect_scanned,
        extract_xfa: args.extract_xfa,
        include_structure: args.include_structure,
      })

      if (args.save_to_file) {
        const dir = dirname(args.save_to_file)
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true })
        }

        const fullContent = JSON.stringify({
          status: result.failed_files.length === 0 ? "completed" : "partial",
          total_files: result.total_files,
          total_batches: result.total_batches,
          extracted_count: result.files.length,
          failed_count: result.failed_files.length,
          files: result.files,
          failed_files: result.failed_files.length > 0 ? result.failed_files : undefined,
        }, null, 2)

        writeFileSync(args.save_to_file, fullContent, "utf-8")

        const fileSummaries = result.files.map((f) => ({
          filename: f.filename,
          format: f.format,
          pdf_type: f.pdf_type,
          char_count: f.content?.length ?? 0,
          page_count: f.metadata?.page_count,
        }))

        return JSON.stringify({
          status: result.failed_files.length === 0 ? "completed" : "partial",
          total_files: result.total_files,
          extracted_count: result.files.length,
          failed_count: result.failed_files.length,
          saved_to: args.save_to_file,
          files: fileSummaries,
          failed_files: result.failed_files.length > 0 ? result.failed_files : undefined,
        })
      }

      return JSON.stringify({
        status: result.failed_files.length === 0 ? "completed" : "partial",
        total_files: result.total_files,
        total_batches: result.total_batches,
        extracted_count: result.files.length,
        failed_count: result.failed_files.length,
        files: result.files,
        failed_files: result.failed_files.length > 0 ? result.failed_files : undefined,
      })
    } catch (error) {
      return JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      })
    }
  },
})
