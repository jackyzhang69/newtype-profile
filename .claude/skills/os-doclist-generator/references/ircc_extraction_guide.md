# IRCC Checklist Extraction Guide

Automated extraction of document checklists from IRCC website using Playwright.

## Overview

This guide enables automatic discovery and extraction of IRCC document checklists when:
1. User does NOT provide checklist content
2. Building a new app type that needs official IRCC requirements
3. Updating existing checklists to latest IRCC versions

## IRCC Website Structure

### Forms Index Page

**URL**: `https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides.html`

**Structure**:
```
Page Load
    ↓
Radio: "Get a form or a checklist" (ref=e71)
    ↓
Searchable Table (235 forms)
    ↓
Filter by keyword → Form details page
    ↓
PDF download link
```

### Form Detail Page Pattern

**URL Pattern**: `/en/immigration-refugees-citizenship/services/application/application-forms-guides/{form_id}.html`

**Examples**:
- IMM 5533: `.../imm5533.html` (Spousal Sponsorship)
- IMM 5483: `.../imm5483.html` (Study Permit)
- IMM 5771: `.../imm5771.html` (Parents/Grandparents)

### PDF URL Pattern

```
/content/dam/ircc/documents/pdf/english/kits/forms/{form_id}/{date}/{form_id}e.pdf
```

**Examples**:
- `imm5533/01-09-2022/imm5533e.pdf`
- `imm5483/01-08-2025/imm5483e.pdf`

## Extraction Workflow

### Step 1: Discover Forms

```yaml
# Navigate to forms page
browser_navigate:
  url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides.html"

# Select "Get a form or checklist"
browser_click:
  ref: "e71"
  element: "Get a form or a checklist radio button"

# Search for specific form or keyword
browser_type:
  ref: "e194"  # Filter searchbox
  text: "{keyword}"  # e.g., "5483" or "study permit"
```

### Step 2: Extract Form List

After filtering, parse the table snapshot:

```yaml
# Table structure
table:
  rowgroup:
    row:
      - cell: "IMM 5483"           # Form number
      - cell: "Document Checklist: Study Permit"  # Title
      - cell: "2025-08"            # Last modified
```

**Extraction Pattern**:
```javascript
function parseFormTable(snapshot) {
  const forms = []
  // Find rows in rowgroup[ref=e214]
  for (const row of snapshot.rows) {
    forms.push({
      form_number: row.cells[0].text,
      title: row.cells[1].text,
      link: row.cells[1].link.url,
      last_modified: row.cells[2].text
    })
  }
  return forms
}
```

### Step 3: Navigate to Form Detail

```yaml
# Click on form link
browser_click:
  ref: "{form_link_ref}"
  element: "Document Checklist link"

# Switch to new tab if opened
browser_tabs:
  action: "select"
  index: 1
```

### Step 4: Extract PDF URL

From form detail page, find PDF download link:

```yaml
# PDF link pattern in snapshot
link:
  text: "Document Checklist: {title} [IMM {number}] (PDF, X.X MB)"
  url: "/content/dam/ircc/documents/pdf/english/kits/forms/{form_id}/{date}/{form_id}e.pdf"
```

### Step 5: Download and Parse PDF

```javascript
// Use file_content_extract MCP tool
const result = await file_content_extract({
  file_paths: [`https://www.canada.ca${pdfUrl}`],
  output_format: "markdown",
  extract_xfa: true,  // IRCC forms use XFA
  detect_scanned: true
})
```

## Form Number to App Type Mapping

| App Type | Primary Checklist | Related Forms |
|----------|------------------|---------------|
| `spousal` | IMM 5533 | IMM 1344, IMM 5532, IMM 0008 |
| `study` | IMM 5483 | IMM 1294, IMM 5645 |
| `work` | (varies by stream) | IMM 1295, IMM 5645 |
| `parents` | IMM 5771 | IMM 1344, IMM 5748 |
| `visitor` | IMM 5257 | IMM 5645 |
| `pr_express_entry` | IMM 0008 | Schedule 3, IMM 5669 |

## Keyword Search Mapping

| User Intent | Search Keywords |
|-------------|-----------------|
| "spousal sponsorship" | `5533`, `spouse` |
| "study permit" | `5483`, `study` |
| "work permit" | `1295`, `work permit` |
| "parents grandparents" | `5771`, `parents` |
| "visitor visa" | `5257`, `visitor` |
| "express entry" | `0008`, `express entry` |

## Error Handling

### Form Not Found

```javascript
if (searchResults.length === 0) {
  // Try alternative keywords
  const alternatives = getAlternativeKeywords(keyword)
  for (const alt of alternatives) {
    // Retry search
  }
  
  // If still not found, return error
  return {
    error: "FORM_NOT_FOUND",
    message: `No IRCC form found for: ${keyword}`,
    suggestions: alternatives
  }
}
```

### PDF Download Failed

```javascript
if (pdfExtraction.error) {
  return {
    error: "PDF_EXTRACTION_FAILED",
    message: pdfExtraction.error,
    fallback: "Use manual checklist from references/ircc_forms_catalog.md"
  }
}
```

### Page Structure Changed

```javascript
// Validate expected elements exist
const expectedRefs = ['e71', 'e194', 'e199']
for (const ref of expectedRefs) {
  if (!snapshot.includes(ref)) {
    return {
      error: "PAGE_STRUCTURE_CHANGED",
      message: "IRCC website structure may have changed",
      action: "Update ircc_extraction_guide.md with new refs"
    }
  }
}
```

## Caching Strategy

To avoid repeated scraping:

```javascript
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000  // 7 days

function getCachedChecklist(formNumber) {
  const cachePath = `./tmp/ircc-cache/${formNumber}.json`
  if (fs.existsSync(cachePath)) {
    const cached = JSON.parse(fs.readFileSync(cachePath))
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }
  }
  return null
}

function cacheChecklist(formNumber, data) {
  const cachePath = `./tmp/ircc-cache/${formNumber}.json`
  fs.writeFileSync(cachePath, JSON.stringify({
    timestamp: Date.now(),
    data
  }))
}
```

## Complete Extraction Example

```javascript
async function extractIRCCChecklist(appType) {
  // 1. Map app type to form number
  const formNumber = APP_TO_FORM_MAP[appType]
  
  // 2. Check cache
  const cached = getCachedChecklist(formNumber)
  if (cached) return cached
  
  // 3. Navigate to IRCC forms page
  await browser_navigate({ url: IRCC_FORMS_URL })
  
  // 4. Select "Get a form or checklist"
  await browser_click({ ref: "e71" })
  
  // 5. Search for form
  await browser_type({ ref: "e194", text: formNumber })
  
  // 6. Get snapshot and find form link
  const snapshot = await browser_snapshot()
  const formLink = findFormLink(snapshot, formNumber)
  
  // 7. Navigate to form detail page
  await browser_click({ ref: formLink.ref })
  await browser_tabs({ action: "select", index: 1 })
  
  // 8. Extract PDF URL
  const detailSnapshot = await browser_snapshot()
  const pdfUrl = extractPdfUrl(detailSnapshot)
  
  // 9. Download and parse PDF
  const pdfContent = await file_content_extract({
    file_paths: [`https://www.canada.ca${pdfUrl}`],
    output_format: "markdown",
    extract_xfa: true
  })
  
  // 10. Parse checklist structure
  const checklist = parseChecklistFromPdf(pdfContent)
  
  // 11. Cache result
  cacheChecklist(formNumber, checklist)
  
  // 12. Close browser
  await browser_close()
  
  return checklist
}
```

## Integration with os-doclist-generator

The extraction result feeds into the standard checklist generation:

```javascript
async function generateDoclist(appType, clientProfile, userProvidedChecklist) {
  // Smart source selection
  let baseChecklist
  
  if (userProvidedChecklist) {
    // User provided content - use it directly
    baseChecklist = parseUserChecklist(userProvidedChecklist)
  } else {
    // No user content - fetch from IRCC
    baseChecklist = await extractIRCCChecklist(appType)
  }
  
  // Apply conditional logic based on client profile
  const customizedChecklist = applyConditions(baseChecklist, clientProfile)
  
  return customizedChecklist
}
```
