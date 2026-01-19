# Case Analyzer Agent - Design Specification

## Vision

**CaseAnalyzer** is the **first stage** (Stage 0) of every audit workflow. It transforms raw case directories into structured, actionable intelligence for downstream agents.

## Core Responsibilities

### 1. Document Extraction
- Batch extract ALL case documents using `file_content_extract`
- Parse XFA form fields from IRCC forms (IMM 0008, IMM 1344, IMM 5532, etc.)
- Organize documents by type (forms, evidence, supporting docs)

### 2. Case Background Understanding
- Extract key facts from documents:
  - Sponsor profile (name, status, DOB, address, employment)
  - Applicant profile (name, nationality, DOB, current status)
  - Relationship timeline (met, courtship, cohabitation, marriage)
  - Previous relationships (divorces, prior sponsorships)
  - Dependents (children, financial dependents)
- Identify application type (spousal, study, work, etc.)
- Build comprehensive case summary

### 3. User Intent Recognition
- Detect task type from user prompt:
  - **RISK_AUDIT**: "audit this case", "assess defensibility"
  - **DOCUMENT_LIST**: "generate checklist", "文件清单"
  - **INTERVIEW_PREP**: "interview preparation"
  - **LOVE_STORY**: "relationship statement"
  - **CUSTOM**: Other specific requests
- Identify special requirements:
  - Tier preference (guest/pro/ultra)
  - Urgency level
  - Specific concerns to address
  - Output format preferences

### 4. Structured Profile Generation
- Build JSON profile conforming to schema
- Validate completeness (flag missing critical info)
- Generate case summary for human review
- Prepare handoff package for downstream agents

## Workflow

```
User: "Audit this case at /Users/jacky/Desktop/tian using ultra mode"
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 0: CaseAnalyzer                                      │
├─────────────────────────────────────────────────────────────┤
│  Step 1: Intent Recognition                                │
│  - Task type: RISK_AUDIT                                   │
│  - Tier: ULTRA                                             │
│  - Case directory: /Users/jacky/Desktop/tian               │
│                                                             │
│  Step 2: Document Discovery                                │
│  - find /Users/jacky/Desktop/tian -name "*.pdf"            │
│  - Found: 25 PDF files                                     │
│                                                             │
│  Step 3: Document Extraction                               │
│  - file_content_extract({ file_paths: [...all 25] })       │
│  - Status: 25/25 extracted successfully                    │
│                                                             │
│  Step 4: Form Parsing                                      │
│  - IMM 1344: Extract sponsor info (XFA fields)             │
│  - IMM 0008: Extract applicant info                        │
│  - IMM 5532: Extract relationship timeline                 │
│  - IMM 5406: Extract family members                        │
│                                                             │
│  Step 5: Case Background Analysis                          │
│  - Sponsor: Zhuang Tian (Canadian Citizen, DOB 1989-06-28) │
│  - Applicant: Zhun Huang (Chinese National, DOB 1994-02-03)│
│  - Application: Spousal Sponsorship (In-Canada)            │
│  - Relationship: Met 2020-02-03, Married 2023-06-06        │
│  - Red flags detected: No wedding ceremony, brief separation│
│                                                             │
│  Step 6: Structured Profile Generation                     │
│  - Build JSON profile (see schema below)                   │
│  - Validate completeness: ✅ All critical fields present   │
│                                                             │
│  Step 7: Case Summary                                      │
│  - Generate human-readable summary                         │
│  - Highlight key facts and potential issues                │
│  - Confirm with user before proceeding                     │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  User Confirmation                                          │
│  "Case analysis complete. Proceed to audit? [Y/n]"         │
└─────────────────────────────────────────────────────────────┘
    │
    ▼ [User confirms]
    │
┌─────────────────────────────────────────────────────────────┐
│  Stage 1: AuditManager (Intake)                            │
│  - Receives structured profile (not raw text)              │
│  - Validates against schema                                │
│  - Proceeds to Detective → Strategist → Gatekeeper         │
└─────────────────────────────────────────────────────────────┘
```

## Structured Profile Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["case_id", "application_type", "sponsor", "applicant", "intent"],
  "properties": {
    "case_id": {
      "type": "string",
      "description": "Unique case identifier (e.g., tian-2025-01)"
    },
    "application_type": {
      "enum": ["spousal", "study", "work", "family", "other"],
      "description": "Type of immigration application"
    },
    "intent": {
      "type": "object",
      "required": ["task_type", "tier"],
      "properties": {
        "task_type": {
          "enum": ["RISK_AUDIT", "DOCUMENT_LIST", "INTERVIEW_PREP", "LOVE_STORY", "CUSTOM"],
          "description": "What the user wants to accomplish"
        },
        "tier": {
          "enum": ["guest", "pro", "ultra"],
          "description": "Audit tier requested"
        },
        "urgency": {
          "enum": ["low", "medium", "high"],
          "description": "How urgent is this case"
        },
        "specific_concerns": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Specific issues user wants addressed"
        }
      }
    },
    "documents": {
      "type": "object",
      "properties": {
        "total_files": { "type": "number" },
        "extracted_count": { "type": "number" },
        "failed_count": { "type": "number" },
        "forms": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": { "type": "string", "description": "e.g., IMM0008, IMM1344" },
              "filename": { "type": "string" },
              "path": { "type": "string" },
              "xfa_fields": { "type": "object" },
              "page_count": { "type": "number" }
            }
          }
        },
        "evidence": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "category": { 
                "enum": ["identity", "relationship", "financial", "travel", "other"],
                "description": "Evidence category"
              },
              "filename": { "type": "string" },
              "path": { "type": "string" }
            }
          }
        }
      }
    },
    "sponsor": {
      "type": "object",
      "required": ["name", "status"],
      "properties": {
        "name": { "type": "string" },
        "family_name": { "type": "string" },
        "given_name": { "type": "string" },
        "dob": { "type": "string", "format": "date" },
        "status": { 
          "enum": ["citizen", "permanent_resident", "indian_status"],
          "description": "Immigration status in Canada"
        },
        "uci": { "type": "string" },
        "address": {
          "type": "object",
          "properties": {
            "street": { "type": "string" },
            "city": { "type": "string" },
            "province": { "type": "string" },
            "postal_code": { "type": "string" }
          }
        },
        "employment": {
          "type": "object",
          "properties": {
            "current_employer": { "type": "string" },
            "occupation": { "type": "string" },
            "monthly_income": { "type": "number" }
          }
        },
        "marital_history": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "spouse_name": { "type": "string" },
              "relationship_start": { "type": "string", "format": "date" },
              "relationship_end": { "type": "string", "format": "date" },
              "end_reason": { "enum": ["divorce", "death", "annulment"] }
            }
          }
        },
        "previous_sponsorships": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "sponsored_person": { "type": "string" },
              "relationship": { "type": "string" },
              "date": { "type": "string", "format": "date" }
            }
          }
        }
      }
    },
    "applicant": {
      "type": "object",
      "required": ["name", "nationality"],
      "properties": {
        "name": { "type": "string" },
        "family_name": { "type": "string" },
        "given_name": { "type": "string" },
        "dob": { "type": "string", "format": "date" },
        "nationality": { "type": "string" },
        "uci": { "type": "string" },
        "current_status_in_canada": {
          "enum": ["visitor", "worker", "student", "none"],
          "description": "Current immigration status"
        },
        "passport": {
          "type": "object",
          "properties": {
            "number": { "type": "string" },
            "issue_date": { "type": "string", "format": "date" },
            "expiry_date": { "type": "string", "format": "date" }
          }
        },
        "marital_history": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "spouse_name": { "type": "string" },
              "relationship_start": { "type": "string", "format": "date" },
              "relationship_end": { "type": "string", "format": "date" },
              "end_reason": { "enum": ["divorce", "death", "annulment"] }
            }
          }
        }
      }
    },
    "relationship": {
      "type": "object",
      "required": ["type", "timeline"],
      "properties": {
        "type": { 
          "enum": ["marriage", "common_law", "conjugal"],
          "description": "Type of relationship"
        },
        "timeline": {
          "type": "object",
          "properties": {
            "first_met": { "type": "string", "format": "date" },
            "courtship_start": { "type": "string", "format": "date" },
            "cohabitation_start": { "type": "string", "format": "date" },
            "marriage_date": { "type": "string", "format": "date" },
            "separations": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "start": { "type": "string", "format": "date" },
                  "end": { "type": "string", "format": "date" },
                  "reason": { "type": "string" }
                }
              }
            }
          }
        },
        "ceremony": {
          "type": "object",
          "properties": {
            "held": { "type": "boolean" },
            "date": { "type": "string", "format": "date" },
            "location": { "type": "string" },
            "attendees": { "type": "number" },
            "reason_if_not_held": { "type": "string" }
          }
        },
        "cohabiting": { "type": "boolean" },
        "communication_frequency": { 
          "enum": ["daily", "weekly", "monthly", "rarely"],
          "description": "How often they communicate"
        }
      }
    },
    "dependents": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "dob": { "type": "string", "format": "date" },
          "relationship": { "type": "string" },
          "accompanying": { "type": "boolean" }
        }
      }
    },
    "red_flags": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "category": {
            "enum": ["genuineness", "misrepresentation", "credibility", "financial", "procedural"],
            "description": "Type of red flag"
          },
          "severity": {
            "enum": ["low", "medium", "high", "critical"],
            "description": "How serious is this issue"
          },
          "description": { "type": "string" },
          "evidence": { "type": "string", "description": "Where this was detected" }
        }
      }
    },
    "completeness": {
      "type": "object",
      "properties": {
        "critical_fields_present": { "type": "boolean" },
        "missing_documents": {
          "type": "array",
          "items": { "type": "string" }
        },
        "warnings": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  }
}
```

## Agent Configuration

### Tools

**ONLY allow:**
- `file_content_extract` - Document extraction
- `bash` - Directory scanning (find, ls)
- `read` - Read extracted content (for parsing)

**DENY:**
- `write`, `edit` - No file modifications
- `webfetch`, `websearch` - No external searches
- `look_at` - Use file_content_extract instead

### Model & Temperature

- **Model**: `anthropic/claude-sonnet-4` (needs good reasoning for parsing)
- **Temperature**: `0.1` (deterministic extraction)

### Prompt Structure

```
<Role>
You are "CaseAnalyzer" — the first stage of every immigration audit workflow.

Your job is to transform raw case directories into structured, actionable intelligence.
</Role>

<Core_Capabilities>
1. **Document Extraction**: Batch extract ALL case documents
2. **Form Parsing**: Extract XFA fields from IRCC forms
3. **Case Understanding**: Build comprehensive case background
4. **Intent Recognition**: Detect what user wants to accomplish
5. **Profile Generation**: Create structured JSON profile
</Core_Capabilities>

<Workflow>
[Detailed 7-step workflow as shown above]
</Workflow>

<Output_Format>
## Case Analysis Report

### Intent Recognition
- Task Type: [RISK_AUDIT | DOCUMENT_LIST | ...]
- Tier: [guest | pro | ultra]
- Urgency: [low | medium | high]

### Document Extraction
- Total Files: X
- Extracted: Y
- Failed: Z

### Case Summary
**Application Type**: Spousal Sponsorship (In-Canada)

**Sponsor**: [Name], [Status], DOB [Date]
**Applicant**: [Name], [Nationality], DOB [Date]

**Relationship Timeline**:
- Met: [Date]
- Courtship: [Date]
- Cohabitation: [Date]
- Marriage: [Date]

**Red Flags Detected**:
- [Flag 1]: [Description]
- [Flag 2]: [Description]

### Structured Profile
```json
{...}
```

### Recommendation
✅ Case analysis complete. Ready to proceed to audit.
⚠️ Missing documents: [list]
❌ Critical issues detected: [list]

**Proceed to Stage 1 (AuditManager)? [Y/n]**
</Output_Format>
```

## Integration with Audit Workflow

### Hook: audit-case-detector

**Location**: `src/hooks/audit-case-detector/index.ts`

**Trigger**: `chat.userPromptSubmit`

**Logic**:
```typescript
// Detect case directory in user prompt
if (detectsCaseDirectory(userPrompt)) {
  // Suggest case analysis
  return {
    message: "Case directory detected. Run CaseAnalyzer first? [Y/n]",
    suggestedAction: "dispatch_case_analyzer"
  }
}

// If user confirms, dispatch CaseAnalyzer
if (userConfirms) {
  dispatchAgent("case-analyzer", {
    caseDirectory: extractedPath,
    userIntent: extractedIntent
  })
}
```

**Post-Agent Hook**: `chat.agentComplete`

```typescript
// After CaseAnalyzer completes
if (agentType === "case-analyzer") {
  const profile = extractStructuredProfile(agentOutput)
  
  // Inject profile into next message
  injectIntoContext({
    type: "case_profile",
    data: profile
  })
  
  // Suggest next step
  return {
    message: "Case analysis complete. Proceed to audit? [Y/n]"
  }
}
```

## Benefits

### Before (DocumentExtractor)
- ❌ Only extracts documents
- ❌ No case understanding
- ❌ No intent recognition
- ❌ Unstructured output
- ❌ Manual handoff to AuditManager

### After (CaseAnalyzer)
- ✅ Extracts + parses + understands
- ✅ Builds comprehensive case background
- ✅ Detects user intent automatically
- ✅ Structured JSON profile
- ✅ Automatic handoff with validation
- ✅ Red flag pre-detection
- ✅ Completeness checking

## Migration Path

### Phase 1: Rename & Extend
1. Rename `document-extractor` → `case-analyzer`
2. Extend prompt with case understanding logic
3. Add form parsing capabilities
4. Add intent recognition

### Phase 2: Schema & Validation
1. Define JSON schema for structured profile
2. Implement profile generation logic
3. Add completeness validation
4. Add red flag detection

### Phase 3: Hook Integration
1. Create `audit-case-detector` hook
2. Auto-detect case directories
3. Auto-dispatch CaseAnalyzer
4. Inject profile into AuditManager

### Phase 4: Testing & Refinement
1. Test with eval cases (Tian, etc.)
2. Refine schema based on real data
3. Improve red flag detection
4. Optimize performance

## Success Metrics

- **Extraction Accuracy**: 100% of documents extracted
- **Parsing Accuracy**: >95% XFA fields correctly extracted
- **Intent Detection**: >90% correct task type identification
- **Profile Completeness**: >80% critical fields populated
- **Red Flag Detection**: >70% of known issues pre-detected
- **User Satisfaction**: Reduces manual data entry by >80%

## Next Steps

1. Review and approve this design
2. Implement Phase 1 (rename + extend)
3. Define detailed JSON schema
4. Implement form parsing logic
5. Test with Tian case
6. Iterate based on feedback
