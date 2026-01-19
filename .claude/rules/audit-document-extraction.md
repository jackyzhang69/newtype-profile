---
globs: ["src/audit-core/**"]
alwaysApply: false
description: "Document extraction policy for Intake phase only. Should NOT be injected into specialist agents (Detective, Strategist, Gatekeeper, Verifier)."
agents: ["main", "audit-manager", "sisyphus"]
---

# Audit Document Extraction Policy

## File Type Routing Strategy

When conducting immigration audits, use the appropriate tool based on file type:

### Text Files (Direct Read)
**Extensions**: `.txt`, `.md`, `.json`, `.csv`, `.xml`, `.log`  
**Tool**: `mcp_read`  
**Reason**: Simple, fast, no service dependency

```
✅ ALLOWED for text files:
  - mcp_read
```

### Binary/Complex Files (Service Extract)
**Extensions**: `.pdf`, `.docx`, `.doc`, `.jpg`, `.jpeg`, `.png`  
**Tool**: `file_content_extract`  
**Reason**: OCR, XFA forms, image recognition needed

```
✅ ALLOWED for binary files:
  - file_content_extract
```

### Unsupported Files (Warning Only)
**Extensions**: `.zip`, `.exe`, `.dmg`, `.mp4`, `.avi`, etc.  
**Action**: Log warning, skip file, continue processing  
**DO NOT**: Fail the entire intake

```
⚠️ UNSUPPORTED files:
  - Log warning with filename and reason
  - Continue processing other files
  - Include in final report warnings section
```

---

## EXACT INVOCATION TEMPLATE

### Step 1: List All Files

```bash
# Get all document files in the case directory
find /path/to/case/directory -type f \( \
  -iname "*.pdf" -o -iname "*.docx" -o -iname "*.doc" -o \
  -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o \
  -iname "*.txt" -o -iname "*.md" -o -iname "*.json" -o \
  -iname "*.csv" -o -iname "*.xml" \)
```

**Supported Formats:**
- **Binary Documents**: PDF, DOCX, DOC
- **Images**: JPG, JPEG, PNG (for photos, scanned documents)
- **Text Files**: TXT, MD, JSON, CSV, XML

### Step 2: Extract Documents by Type

**A. Text Files (use mcp_read)**

```typescript
// For each text file
for (const textFile of textFiles) {
  try {
    const content = await mcp_read(textFile);
    results.success.push({ file: textFile, content, method: 'mcp_read' });
  } catch (error) {
    results.errors.push({ file: textFile, error: error.message });
  }
}
```

**B. Binary Files (use file_content_extract)**

```typescript
// Single call with ALL binary files - tool handles batching automatically
try {
  const result = await file_content_extract({
    "file_paths": [
      "/absolute/path/to/file1.pdf",
      "/absolute/path/to/file2.docx",
      "/absolute/path/to/photo.jpg",
      ... (ALL binary files in one call)
    ],
    "output_format": "markdown",
    "extract_xfa": true,
    "include_structure": true
  });
  
  // Process successful extractions
  for (const file of result.files) {
    results.success.push({ ...file, method: 'file_content_extract' });
  }
  
  // Process failures
  for (const failed of result.failed_files || []) {
    results.errors.push({ file: failed.filename, error: failed.error });
  }
} catch (error) {
  // Service unavailable - log all binary files as errors
  for (const file of binaryFiles) {
    results.errors.push({ file, error: 'Service unavailable' });
  }
}
```

**C. Unsupported Files (log warning)**

```typescript
for (const unsupportedFile of unsupportedFiles) {
  results.warnings.push({
    file: unsupportedFile,
    reason: `Unsupported file type: ${path.extname(unsupportedFile)}`,
    severity: 'warning'
  });
}
```

**The file_content_extract tool automatically:**
- Splits files into optimal batches based on size (max 40MB per batch)
- Uploads batches sequentially
- Retries failed batches (up to 2 retries)
- Aggregates all results into a single response

**No manual batching required for binary files.**

### Step 3: Build Comprehensive Report

**ALWAYS return status: 'completed' even with warnings/errors**

```json
{
  "status": "completed",  // Always completed, never fail intake
  "total_files": 30,
  "successful": 25,
  "warnings": 3,
  "errors": 2,
  "details": {
    "success": [...],   // Successfully extracted files
    "warnings": [...],  // Unsupported file types
    "errors": [...]     // Failed extractions
  }
}
```

### Step 4: Build Document Index

Create comprehensive index showing all files:

| # | Filename | Type | Method | Status |
|---|----------|------|--------|--------|
| 1 | explanation.txt | TXT | mcp_read | ✅ |
| 2 | IMM0008.pdf | PDF | file_content_extract | ✅ |
| 3 | photos.jpg | JPG | file_content_extract | ✅ |
| 4 | archive.zip | ZIP | - | ⚠️ Unsupported |
| 5 | corrupted.pdf | PDF | file_content_extract | ❌ Failed |

**Include all three categories:**
- ✅ Successfully extracted
- ⚠️ Warnings (unsupported types)
- ❌ Errors (extraction failures)

### Step 5: Report Warnings and Errors

**Warnings Section (Unsupported Files):**
```markdown
### ⚠️ Warnings - Unsupported Files (3)
| # | Filename | Type | Reason |
|---|----------|------|--------|
| 1 | archive.zip | ZIP | Unsupported file type, skipped |
| 2 | video.mp4 | MP4 | Unsupported file type, skipped |
| 3 | backup.tar.gz | TAR.GZ | Unsupported file type, skipped |

**Action**: Review these files manually if needed.
```

**Errors Section (Failed Extractions):**
```markdown
### ❌ Errors - Failed Extraction (2)
| # | Filename | Type | Error |
|---|----------|------|-------|
| 1 | corrupted.pdf | PDF | Service error: file corrupted |
| 2 | large.docx | DOCX | Service timeout |

**Action**: Check files and retry if possible.
```

**Recommendation:**
```markdown
### Recommendation
- Successfully extracted: 25 documents ✅
- Unsupported files: 3 (review manually if needed) ⚠️
- Failed extractions: 2 (check and retry) ❌
- **Proceed with analysis using 25 successfully extracted documents**
```

---

## WORKFLOW ENFORCEMENT

### Phase 0: Document Extraction (NON-BLOCKING)

```
┌─────────────────────────────────────────────────────────┐
│  BEFORE ANY ANALYSIS, MUST COMPLETE ALL OF THE FOLLOWING │
├─────────────────────────────────────────────────────────┤
│  1. find /case/dir -type f (all supported formats)      │
│  2. Route files by type:                                │
│     - Text files → mcp_read                             │
│     - Binary files → file_content_extract               │
│     - Unsupported → log warning, continue               │
│  3. Handle errors gracefully:                           │
│     - Log errors, continue processing other files       │
│     - NEVER fail entire intake                          │
│  4. Build comprehensive report:                         │
│     - Success count ✅                                  │
│     - Warnings count ⚠️                                 │
│     - Errors count ❌                                   │
│  5. ALWAYS return status: "completed"                   │
│  6. Proceed to analysis with available documents        │
└─────────────────────────────────────────────────────────┘
```

### CRITICAL RULES

**✅ MUST DO:**
1. Route text files to `mcp_read`
2. Route binary files to `file_content_extract`
3. Log warnings for unsupported files
4. Log errors for failed extractions
5. Continue processing after errors
6. Always return `status: "completed"`
7. Include warnings/errors in final report

**❌ MUST NOT DO:**
1. Use `mcp_look_at` for document extraction
2. Use `mcp_read` for binary files (PDF, DOCX, JPG)
3. Use `file_content_extract` for text files
4. Fail entire intake due to unsupported files
5. Fail entire intake due to extraction errors
6. Skip reporting warnings or errors

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

1. **Log all binary files as errors** with reason "Service unavailable"
2. **Continue with text files** (using mcp_read)
3. **Report service status** in final report
4. **Proceed with available data** (text files only)
5. **Recommend** user to check service and retry binary files

---

## WHY THESE RULES EXIST

### File Type Routing

| Method | Best For | Why |
|--------|----------|-----|
| `mcp_read` | Text files (TXT, MD, JSON, CSV) | Fast, reliable, no service dependency |
| `file_content_extract` | Binary files (PDF, DOCX, JPG) | OCR, XFA forms, image recognition |

### Benefits by File Type

**Text Files (mcp_read):**
- ✅ No service dependency
- ✅ Fast and reliable
- ✅ Simple implementation
- ✅ No network overhead

**Binary Files (file_content_extract):**
- ✅ Complete text extraction from PDFs
- ✅ XFA form field parsing (IMM forms)
- ✅ OCR for scanned documents
- ✅ Image recognition for photos
- ✅ Page-level structure preservation
- ✅ Metadata (page count, char count)

### Error Handling Philosophy

**Why Non-Blocking:**
- One bad file shouldn't stop entire audit
- Partial data is better than no data
- User can decide if missing files are critical
- Allows graceful degradation

**Why Report Everything:**
- Transparency: user knows what was processed
- Actionable: user can fix issues and retry
- Audit trail: clear record of what was analyzed

---

## EXAMPLE: CORRECT AUDIT START

```
User: Audit this case at /Users/jacky/Desktop/tian

Agent Response:

## Phase 0: Document Extraction

### Step 1: List all files
[Execute: find /Users/jacky/Desktop/tian -type f ...]

Found 30 files:
- 20 binary files (PDF, DOCX, JPG)
- 8 text files (TXT, MD, JSON)
- 2 unsupported files (ZIP, MP4)

### Step 2: Extract by type

**Text files (8):**
[Execute: mcp_read for each text file]
✅ All 8 text files extracted successfully

**Binary files (20):**
[Execute: file_content_extract with all 20 binary files]
✅ 18 extracted successfully
❌ 2 failed (corrupted.pdf, timeout on large.docx)

**Unsupported files (2):**
⚠️ archive.zip - Unsupported file type, skipped
⚠️ video.mp4 - Unsupported file type, skipped

### Step 3: Extraction Report

**Summary:**
- Total Files: 30
- Successfully Extracted: 26 ✅
- Warnings (Unsupported): 2 ⚠️
- Errors (Failed): 2 ❌

### Step 4: Document Index

| # | Filename | Type | Method | Status |
|---|----------|------|--------|--------|
| 1 | explanation.txt | TXT | mcp_read | ✅ |
| 2 | IMM0008.pdf | PDF | file_content_extract | ✅ |
| 3 | photos.jpg | JPG | file_content_extract | ✅ |
... (26 successful files)
| 27 | archive.zip | ZIP | - | ⚠️ Unsupported |
| 28 | video.mp4 | MP4 | - | ⚠️ Unsupported |
| 29 | corrupted.pdf | PDF | file_content_extract | ❌ Failed |
| 30 | large.docx | DOCX | file_content_extract | ❌ Failed |

### Recommendation
- Proceed with analysis using 26 successfully extracted documents
- Review 2 unsupported files manually if needed
- Check and retry 2 failed files

✅ Phase 0 Complete - Proceeding to Analysis
```

---

## ANTI-PATTERN: INCORRECT APPROACHES

### ❌ WRONG 1: Using wrong tools

```
User: Audit this case at /Users/jacky/Desktop/tian

Agent Response:
Let me look at the explanation letter first...
[Execute: mcp_look_at for explanation letter]  ❌ Wrong tool

Then check the IMM0008...
[Execute: mcp_read for IMM0008.pdf]  ❌ Wrong tool for PDF
```

### ❌ WRONG 2: Failing on unsupported files

```
Agent Response:
Found archive.zip - unsupported file type.
ERROR: Cannot process this case, aborting audit.  ❌ Should continue
```

### ❌ WRONG 3: Failing on extraction errors

```
Agent Response:
file_content_extract failed for corrupted.pdf
ERROR: Extraction failed, cannot proceed.  ❌ Should continue with other files
```

### ✅ CORRECT: Graceful degradation

```
Agent Response:
Found 30 files, successfully extracted 26.
2 unsupported files logged as warnings.
2 extraction failures logged as errors.
Proceeding with analysis using 26 available documents.  ✅ Correct
```
