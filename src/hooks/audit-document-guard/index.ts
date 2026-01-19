import type { PluginInput } from "@opencode-ai/plugin"

interface ToolExecuteInput {
  tool: string
  sessionID: string
  callID: string
}

interface ToolExecuteBeforeOutput {
  args: unknown
}

// Case document extensions that should use file_content_extract
const CASE_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".gif", ".bmp", ".tiff",
  ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
]

// Common case directory patterns
const CASE_DIRECTORY_PATTERNS = [
  /\/cases\//i,
  /\/Desktop\//i,
  /\/Documents\//i,
  /\/audit/i,
  /\/immigration/i,
  /\/sponsor/i,
  /\/applicant/i,
]

function isCaseDocument(filePath: string): boolean {
  const lowerPath = filePath.toLowerCase()
  
  // Check if file extension matches case document types
  const hasMatchingExtension = CASE_DOCUMENT_EXTENSIONS.some(ext => 
    lowerPath.endsWith(ext)
  )
  
  if (!hasMatchingExtension) return false
  
  // Check if path looks like a case directory
  const isInCaseDirectory = CASE_DIRECTORY_PATTERNS.some(pattern => 
    pattern.test(filePath)
  )
  
  return isInCaseDirectory
}

function buildBlockMessage(toolName: string, filePath: string): string {
  return `❌ BLOCKED: Case documents must use file_content_extract tool

Tool attempted: ${toolName}
File path: ${filePath}

According to .claude/rules/audit-document-extraction.md:
- ALL case documents MUST use file_content_extract tool
- This includes PDF, images, and Office documents
- This ensures complete text extraction, XFA form parsing, and metadata verification

Correct usage:
  file_content_extract({
    "file_paths": ["${filePath}"],
    "output_format": "markdown",
    "extract_xfa": true,
    "include_structure": true
  })

For multiple files (RECOMMENDED):
  file_content_extract({
    "file_paths": [
      "/path/to/file1.pdf",
      "/path/to/file2.pdf",
      ... (ALL case files in one call)
    ],
    "output_format": "markdown",
    "extract_xfa": true,
    "include_structure": true
  })

Why this matters:
- ${toolName} may lose accuracy or miss details
- file_content_extract provides complete extraction with page-level structure
- XFA form fields (IMM forms) are properly parsed
- Metadata verification ensures completeness
- OCR support for scanned documents`
}

export function createAuditDocumentGuardHook(_ctx: PluginInput) {
  const toolExecuteBefore = async (
    input: ToolExecuteInput,
    output: ToolExecuteBeforeOutput
  ) => {
    const toolName = input.tool.toLowerCase()

    // Block both 'read' and 'look_at' tools for case documents
    if (toolName === "read" || toolName === "look_at") {
      const args = output.args as { filePath?: string; file_path?: string } | undefined
      const filePath = args?.filePath || args?.file_path

      if (filePath && isCaseDocument(filePath)) {
        return {
          blocked: true,
          message: buildBlockMessage(toolName, filePath),
        }
      }
    }

    return undefined
  }

  return {
    "tool.execute.before": toolExecuteBefore,
  }
}
