---
description: Immigration application audit
argument-hint: <case-directory> [--tier ultra|pro|guest] [--app spousal|study] [--anonymize dual|true|false] [--anonymize-level minimal|conservative|aggressive]
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

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--tier` | `pro` | Service tier: `guest`, `pro`, `ultra` |
| `--app` | `spousal` | Application type: `spousal`, `study` |
| `--anonymize` | `dual` | Report output: `dual` (both), `true` (demo only), `false` (real only) |
| `--anonymize-level` | `conservative` | PII anonymization level: `minimal`, `conservative`, `aggressive` |

## Workflow

1. `find <case-directory> -name "*.pdf" -type f`
2. `file_content_extract` with ALL files
3. Verify: `extracted_count === total_files`
4. Run audit agents (Detective -> Strategist -> Gatekeeper -> Verifier)
5. Generate reports:
   - `report.md` / `report.pdf` - Standard report with real client info
   - `report_demo.md` / `report_demo.pdf` - Anonymized report (if `--anonymize=dual` or `true`)
6. Save to `cases/<case-name>/`

## Output Files

```
cases/<case-name>/
├── report.md           # Standard report
├── report.pdf          # Standard PDF
├── report_demo.md      # Anonymized report (if enabled)
└── report_demo.pdf     # Anonymized PDF (if enabled)
```

## User input

$ARGUMENTS
