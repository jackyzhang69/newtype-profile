import { tool } from "@opencode-ai/plugin"
import { readFile } from "node:fs/promises"
import { existsSync } from "node:fs"

export const documentFulltextRead = tool({
  description: `Read full text of a document when critical issues need verification.

Use this tool when:
- You detect a potential CRITICAL poison pill
- The CaseProfile summary seems incomplete or contradictory
- You need to verify exact wording in submission letters or explanations

Example: If you see "dual_intent_stated" flag but no exit strategy in summary, 
read the full Study Plan to verify if exit strategy exists.

IMPORTANT: This tool is for Judge agent to verify critical findings. 
Do not use for routine document reading - use CaseProfile.documents.evidence[].summary instead.`,

  args: {
    session_id: tool.schema.string().describe("Audit session ID"),
    filename: tool.schema.string().describe("Exact filename to read (e.g., 'Study Plan.pdf')"),
    reason: tool.schema.string().describe("Why you need full text (for audit trail)"),
  },

  async execute({ session_id, filename, reason }: { session_id: string; filename: string; reason: string }) {
    try {
      const extractedDocsPath = `./tmp/${session_id}/extracted_docs.json`

      if (!existsSync(extractedDocsPath)) {
        return JSON.stringify({
          success: false,
          error: `Document storage not found at ${extractedDocsPath}. This may be an old case before document storage was implemented.`,
          suggestion: "Use CaseProfile.documents.evidence[].summary instead, or re-run intake if needed.",
        }, null, 2)
      }

      const content = await readFile(extractedDocsPath, "utf-8")
      const storage = JSON.parse(content)

      const doc = storage.documents?.find(
        (d: any) => d.filename === filename || d.filename.includes(filename)
      )

      if (!doc) {
        return JSON.stringify({
          success: false,
          error: `Document "${filename}" not found in storage`,
          available_documents: storage.documents?.map((d: any) => d.filename) || [],
          suggestion: "Check available_documents list and try again with exact filename",
        }, null, 2)
      }

      return JSON.stringify({
        success: true,
        filename: doc.filename,
        full_text: doc.content,
        metadata: {
          page_count: doc.metadata?.page_count,
          char_count: doc.metadata?.char_count,
          pdf_type: doc.pdf_type,
          format: doc.format,
        },
        reason_for_access: reason,
        accessed_at: new Date().toISOString(),
      }, null, 2)
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Failed to read document storage: ${error instanceof Error ? error.message : String(error)}`,
      }, null, 2)
    }
  },
})
