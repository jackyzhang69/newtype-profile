---
globs: ["src/audit-core/**", "**/audit*", "**/detective*", "**/strategist*", "**/gatekeeper*", "**/verifier*"]
alwaysApply: true
---

# Audit Document Extraction Policy

## CRITICAL: MANDATORY EXTRACTION METHOD

When conducting immigration audits, reading case documents is **STRICTLY CONTROLLED**.

### The ONLY Allowed Tool

**`file_content_extract`** is the **ONLY** permitted tool for reading case document contents.

```
ALLOWED:
  ✅ file_content_extract

FORBIDDEN:
  ❌ mcp_look_at
  ❌ mcp_read  
  ❌ Any other file reading method
```

---

## EXACT INVOCATION TEMPLATE

### Step 1: List All Files

```bash
# Get all PDF files in the case directory
find /path/to/case/directory -name "*.pdf" -type f
```

### Step 2: Extract ALL Documents (MANDATORY)

**Single call with ALL files - tool handles batching automatically:**

```
file_content_extract({
  "file_paths": [
    "/absolute/path/to/file1.pdf",
    "/absolute/path/to/file2.pdf",
    ... (ALL PDF files in one call)
  ],
  "output_format": "markdown",
  "extract_xfa": true,
  "include_structure": true
})
```

**The tool automatically:**
- Splits files into optimal batches based on size (max 40MB per batch)
- Uploads batches sequentially
- Retries failed batches (up to 2 retries)
- Aggregates all results into a single response

**No manual batching required.**

### Step 3: Verify Extraction Result

**MUST verify the response contains:**

```json
{
  "status": "completed",
  "total_files": 25,
  "total_batches": 3,
  "extracted_count": 25,
  "failed_count": 0,
  "files": [
    {
      "filename": "xxx.pdf",
      "content": "... full extracted text ...",
      "metadata": {
        "page_count": N,
        "char_count": N,
        "has_xfa": true/false,
        "xfa_fields": [...]
      }
    }
  ]
}
```

**Check for partial failures:**
- If `status: "partial"` and `failed_count > 0`, check `failed_files` array
- Retry or report missing files to user

### Step 4: Build Document Index

After successful extraction, create index:

| # | Filename | Pages | Characters | XFA Fields | Status |
|---|----------|-------|------------|------------|--------|
| 1 | file1.pdf | N | N | N | ✅ |
| 2 | file2.pdf | N | N | N | ✅ |

**Confirm: Total files = Extracted files (no missing)**

---

## WORKFLOW ENFORCEMENT

### Phase 0: Document Extraction (BLOCKING)

```
┌─────────────────────────────────────────────────────────┐
│  BEFORE ANY ANALYSIS, MUST COMPLETE ALL OF THE FOLLOWING │
├─────────────────────────────────────────────────────────┤
│  1. find /case/dir -name "*.pdf" -type f                │
│  2. file_content_extract({ all files in single call })  │
│     (tool handles batching automatically)               │
│  3. Verify: status === "completed" or "partial"         │
│  4. Verify: extracted_count === total_files             │
│  5. Build document index table                          │
│  6. ONLY THEN proceed to analysis                       │
└─────────────────────────────────────────────────────────┘
```

### BLOCKING VIOLATIONS

**If ANY of the following occur, STOP and report error:**

1. ❌ Using `mcp_look_at` for case documents
2. ❌ Using `mcp_read` for PDF files
3. ❌ Starting analysis before extraction completes
4. ❌ Skipping any files
5. ❌ Extraction returns error (must retry or block)
6. ❌ File count mismatch (extracted < total)

---

## SERVICE CONFIGURATION

### Environment Variables (from AGENTS.md)

The `file_content_extract` tool reads configuration from environment variables:

```
Resolution Order (see src/audit-core/file-content/client.ts):
1. FILE_CONTENT_BASE_URL (if set, use this)
2. AUDIT_KG_BASE_URL (fallback)
3. Default: localhost:3104 (last resort)

Authentication:
- SEARCH_SERVICE_TOKEN (Bearer token for API auth)
```

**DO NOT hardcode any URLs in prompts or analysis.**

### Health Check Method (per AGENTS.md)

```bash
# Server access rules from AGENTS.md:
# - IP: Read from environment/AGENTS.md
# - Health check via SSH to server, then curl localhost:3104
ssh jacky@${SERVER_IP} "curl -s http://localhost:3104/health"
```

### If Service Unavailable

1. **DO NOT** fall back to other tools
2. **DO NOT** proceed with partial data
3. **REPORT** to user: "file_content_extract service unavailable, audit blocked"
4. **WAIT** for service to be available

---

## WHY THIS RULE EXISTS

| Problem with Other Methods | Result |
|---------------------------|--------|
| `mcp_look_at` uses AI interpretation | Loses accuracy, misses details |
| `mcp_read` doesn't support PDF | Cannot read binary files |
| Partial reading | Incomplete analysis, wrong conclusions |
| No metadata | Cannot verify completeness |
| No XFA extraction | Misses IMM form field values |

| Benefit of `file_content_extract` | Result |
|----------------------------------|--------|
| Complete text extraction | No missing content |
| XFA form field parsing | Captures all IMM form values |
| Page-level structure | Precise referencing |
| Metadata (page count, char count) | Verification of completeness |
| OCR for scanned documents | Handles all PDF types |

---

## EXAMPLE: CORRECT AUDIT START

```
User: Audit this case at /Users/jacky/Desktop/tian

Agent Response:

## Phase 0: Document Extraction

### Step 1: List all files
[Execute: find /Users/jacky/Desktop/tian -name "*.pdf" -type f]

Found 25 PDF files.

### Step 2: Extract all documents
[Execute: file_content_extract with all 25 file paths]
(Tool automatically batches based on file sizes)

### Step 3: Verify extraction
- Status: completed ✅
- Files extracted: 25/25 ✅
- All have content: ✅

### Step 4: Document Index

| # | Filename | Pages | Chars | XFA | Status |
|---|----------|-------|-------|-----|--------|
| 1 | IMM0008.pdf | 4 | 12453 | Yes | ✅ |
| 2 | IMM5406.pdf | 2 | 5621 | Yes | ✅ |
... (all 25 files)

✅ Phase 0 Complete - Proceeding to Analysis
```

---

## ANTI-PATTERN: INCORRECT AUDIT START

```
❌ WRONG - Do not do this:

User: Audit this case at /Users/jacky/Desktop/tian

Agent Response:
Let me look at the explanation letter first...
[Execute: mcp_look_at for explanation letter]

Then check the IMM0008...
[Execute: mcp_look_at for IMM0008]

... (partial reading, wrong tool)
```

**This is a BLOCKING VIOLATION. The audit must be stopped and restarted correctly.**
