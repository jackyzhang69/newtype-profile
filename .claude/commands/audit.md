---
description: Immigration application audit
argument-hint: <case-directory> [--tier ultra|pro|guest] [--app spousal|study]
---

# /audit

## MANDATORY: Document Extraction

**BEFORE any analysis, MUST use `file_content_extract` tool:**

```
file_content_extract({
  "file_paths": [ALL PDF files in case directory],
  "output_format": "markdown",
  "extract_xfa": true,
  "include_structure": true
})
```

## FORBIDDEN

- ❌ `mcp_look_at` for case documents
- ❌ `mcp_read` for PDF files
- ❌ Any analysis before extraction completes

## Workflow

1. `find <case-directory> -name "*.pdf" -type f`
2. `file_content_extract` with ALL files
3. Verify: `extracted_count === total_files`
4. Run audit agents (Detective → Strategist → Gatekeeper → Verifier)
5. Save report to `cases/<case-name>/audit-report.md`

## User input

$ARGUMENTS
