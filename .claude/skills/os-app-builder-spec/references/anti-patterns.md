# Anti-Patterns (Lessons from Existing Apps)

## ⛔ FATAL Anti-Pattern: Using Training Knowledge

| Anti-Pattern | Why It's FATAL |
|--------------|----------------|
| **Generating legal content from training knowledge** | Training data may be outdated, inaccurate, or fabricated |
| **Skipping Phase 1 MCP Bootstrap** | No verified source for case law and policies |
| **Skipping Phase 1.5 IRCC Extraction** | Document checklists will be wrong |
| **Falling back to training knowledge when MCP fails** | Produces unreliable, potentially harmful content |
| **Copying content from other apps without verification** | Different app types have different legal requirements |

**If you catch yourself generating content without first calling MCP tools, STOP IMMEDIATELY.**

---

## Structure Anti-Patterns

| Anti-Pattern | Correct Approach | Reason |
|--------------|------------------|--------|
| base + deep file separation | Merge into single file | loader doesn't implement routing |
| category_files field | Remove | Not implemented |
| manifest missing version | MUST have `version` field | Metadata requirement |
| injection_profile incomplete | MUST have 9 skills + injection_order | Completeness requirement |
| **manifest uses `files` field** | **MUST use `references`** | **loader.ts line 191 only reads references** |
| **injection_profile writes `files`** | **Remove files field** | **Not read by any code** |
| **manifest uses `dependencies`** | **Use `depends_on`** | **Field name mismatch** |

---

## Case Citation Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|------------------|
| Hardcoding IAD cases in Skills | Use `_dynamic_lookup` to guide Detective |
| Citing unverified cases | First `caselaw_authority()` to verify |
| Copying landmark_cases from other apps | Search and verify with KG for current app |
| Assuming cases are still valid | Check `is_good_law` field |

---

## Content Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|------------------|
| Including full case text in Skills | Use MCP for dynamic retrieval |
| Including case-specific fact details | Only keep abstract rules and legal principles |
| Using outdated case lists | Periodically verify and update with KG |
| Copying content from other apps | Regenerate for current app |

---

## Architecture Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|------------------|
| Creating new agent for new app | Use fixed 8 agents |
| Creating new workflow for new app | Use fixed 6 workflows |
| Modifying agent code for new app | Only create skills (knowledge blocks) |
| Skipping registration steps | MUST complete Phase 5 assembly |
