# Audit Document Extraction Enforcement

## Problem

When users provide case file paths for audit, the AI was not consistently following the mandatory document extraction workflow defined in `.claude/rules/audit-document-extraction.md`. This led to:

1. Using `mcp_look_at` instead of `file_content_extract` for PDF files
2. Missing XFA form field extraction from IMM forms
3. Incomplete document analysis
4. Skipping Phase 0 (document extraction) workflow

## Root Causes

### 1. Rules Injector Trigger Limitation
The `rules-injector` hook only triggered when using `read/write/edit/multiedit` tools. When AI used `mcp_look_at` directly, the rule was never injected into context.

### 2. `alwaysApply` Not Working as Expected
The `alwaysApply: true` frontmatter in rule files only worked for copilot-instructions single files, not for `.claude/rules/` directory rules.

### 3. No Tool-Level Enforcement
There was no mechanism to block incorrect tool usage at the tool execution level.

## Solution: Dual-Layer Enforcement

### Layer 1: Proactive Rule Injection (Education)

**File**: `src/hooks/rules-injector/index.ts`

Added `chat.message` hook that:
- Detects audit-related keywords in user prompts
- Proactively injects `audit-document-extraction.md` rule
- Ensures AI sees the rule before making tool choices

**Detection Keywords**:
- "audit"
- "case"
- "/users/", "/home/", "desktop/", "documents/" (file paths)

**Mechanism**:
```typescript
const chatMessage = async (input, output) => {
  // Detect audit request from user prompt
  // Inject rule by prepending to first text part
  // Track injection to avoid duplicates
}
```

### Layer 2: Tool-Level Guard (Enforcement)

**File**: `src/hooks/audit-document-guard/index.ts`

New `PreToolUse` hook that:
- Intercepts `read` tool calls
- Blocks PDF file access
- Returns clear error message with correct usage

**Also Modified**: `src/tools/look-at/tools.ts`
- Added PDF detection in `execute` function
- Returns error message instead of processing

**Block Conditions**:
- Tool: `read` or `look_at`
- File extension: `.pdf` (case-insensitive)

**Error Message**:
```
❌ BLOCKED: PDF files must use file_content_extract tool

Correct usage:
  file_content_extract({
    "file_paths": ["/path/to/file.pdf"],
    "output_format": "markdown",
    "extract_xfa": true,
    "include_structure": true
  })
```

## Implementation Details

### Files Modified

1. **src/hooks/rules-injector/index.ts**
   - Added `chatMessage` function
   - Detects audit requests
   - Injects rule proactively

2. **src/tools/look-at/tools.ts**
   - Added PDF detection in `execute`
   - Returns error for PDF files

3. **src/hooks/audit-document-guard/** (NEW)
   - `index.ts`: Main hook implementation
   - `constants.ts`: Hook metadata
   - `types.ts`: Type definitions
   - `index.test.ts`: Test suite (4 tests, all passing)

4. **src/hooks/index.ts**
   - Exported new hook

5. **src/index.ts**
   - Imported and initialized new hook
   - Added to `tool.execute.before` chain

6. **src/config/schema.ts**
   - Added `"audit-document-guard"` to `HookNameSchema`

### Configuration

The hook is enabled by default. To disable:

```json
// .opencode/oh-my-opencode.json
{
  "disabled_hooks": ["audit-document-guard"]
}
```

## Testing

### Unit Tests
```bash
bun test src/hooks/audit-document-guard/index.test.ts
```

**Coverage**:
- ✅ Blocks `read` tool with PDF files
- ✅ Allows `read` tool with non-PDF files
- ✅ Allows other tools even with PDF files
- ✅ Case-insensitive PDF extension matching

### Integration Test

**Before Fix**:
```
User: audit this case /Users/jacky/Desktop/tian
AI: Let me look at the explanation letter...
    [Uses mcp_look_at - WRONG]
```

**After Fix**:
```
User: audit this case /Users/jacky/Desktop/tian
AI: [Rule injected automatically]
    ## Phase 0: Document Extraction
    [Uses file_content_extract - CORRECT]
```

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Rule Visibility** | Only after file access | Immediately on audit request |
| **Tool Enforcement** | None | Blocked at execution |
| **Error Guidance** | Generic | Specific with correct usage |
| **Consistency** | Depends on AI | Guaranteed by system |

## Future Enhancements

1. **Expand Detection**: Add more audit-related keywords
2. **Smart Path Detection**: Detect case directories by structure
3. **Batch Tool Guard**: Block `batch` tool calls containing PDF reads
4. **Metrics**: Track how often rules are violated/blocked

## Related Documentation

- `.claude/rules/audit-document-extraction.md` - The rule being enforced
- `docs/agent-guides/audit/workflow.md` - Audit workflow documentation
- `src/tools/file-content/` - file_content_extract tool implementation
