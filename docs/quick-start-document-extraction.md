# Quick Start: Document Extraction

## TL;DR

```typescript
// Extract all case documents
chief_task({
  subagent_type: "document-extractor",
  description: "Extract case documents",
  prompt: "Extract all PDF documents from /path/to/case/directory",
  run_in_background: false,
  skills: []
})
```

## Prerequisites

✅ Plugin built: `bun run build`  
✅ Claude session restarted (to load new agent)  
✅ Environment variables set:
```bash
AUDIT_KG_BASE_URL=https://es_search.jackyzhang.app/api/v1
SEARCH_SERVICE_TOKEN=<your-token>
```

## Step-by-Step

### 1. Prepare Case Directory

```bash
# Example: Tian case
ls /Users/jacky/Desktop/tian/*.pdf
# Should show 25 PDF files
```

### 2. Dispatch Document Extractor

```typescript
chief_task({
  subagent_type: "document-extractor",
  description: "Extract Tian case documents",
  prompt: `Extract all PDF documents from /Users/jacky/Desktop/tian.
  
  Instructions:
  1. List all PDF files
  2. Extract ALL files in ONE call using file_content_extract
  3. Verify all 25 files extracted successfully
  4. Build document index table`,
  run_in_background: false,
  skills: []
})
```

### 3. Verify Results

Expected output:
```
## Extraction Report

### Summary
- Total files: 25
- Successfully extracted: 25
- Failed: 0

### Document Index
| # | Filename | Pages | XFA | Status |
|---|----------|-------|-----|--------|
| 1 | IMM0008.pdf | 4 | ✅ | ✅ |
| 2 | IMM1344.pdf | 8 | ✅ | ✅ |
...
```

### 4. Use Extracted Data

The extracted content is now available for Detective/Strategist agents to analyze.

## Common Issues

### "Unknown agent: document-extractor"

**Cause:** Plugin not reloaded  
**Fix:** Restart Claude session

### "Connection failed"

**Cause:** Service unavailable  
**Fix:** Check service health:
```bash
curl https://es_search.jackyzhang.app/health
```

### "Unauthorized"

**Cause:** Invalid token  
**Fix:** Verify `SEARCH_SERVICE_TOKEN` in `.env`

## Next Steps

After successful extraction:

1. **Detective Agent** - Legal research
2. **Strategist Agent** - Risk analysis
3. **Gatekeeper Agent** - Compliance review
4. **Verifier Agent** - Citation validation (ULTRA tier)

## Full Documentation

See [Document Extractor Agent Guide](./document-extractor-agent.md)
