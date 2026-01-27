# Audit Workflow Reference

> Detailed documentation for the immigration audit workflow.

---

## Overview

The audit system orchestrates a team of 7 specialized AI agents to simulate real immigration lawyer audit workflows. It produces a **Defensibility Score** based on historical Federal Court jurisprudence.

## Agent Team

| Agent | Role | Primary Tasks | Workflows |
|-------|------|---------------|-----------|
| **Intake** | Extractor | Document extraction, intent recognition, structured profile | All (初始 stage) |
| **AuditManager** | Orchestrator | workflow_next() 查询、audit_task() 派遣、workflow_complete() 推进 | All |
| **Detective** | Investigator | Case law search, policy lookup via MCP/KG | risk-audit, initial-assessment, final-review, refusal-analysis |
| **Strategist** | Analyst | Risk assessment, defense arguments, evidence planning | risk-audit, initial-assessment, final-review, refusal-analysis |
| **Gatekeeper** | Reviewer | Compliance check, refusal triggers, quality control | All except client-guidance |
| **Verifier** | Validator | Citation accuracy check (Pro+) | risk-audit, final-review (verifier stage) |
| **Judge** | Decision Maker | 汇总所有发现，做最终判决（GO/CAUTION/NO-GO 或 APPROVE/REVISE） | initial-assessment, final-review, refusal-analysis (Judge stage) |
| **Reporter** | Formatter | Report generation with Judicial Authority theme | All (最后 stage) |

**注意**:
- AuditManager 从"手动编排"改为"状态机查询"，使用 workflow_next/complete 而非硬编码逻辑
- Judge 是**可选** agent，仅在需要明确判决的 workflows 中出现
- 其他 workflows（document-list, client-guidance）只包含 Intake → Gatekeeper/Reporter

---

## Workflow Tools

AuditManager 使用三个核心工具来编排工作流。这些工具与 WorkflowEngine 交互，管理整个审计流程的状态转换。

### workflow_next(session_id)

**用途**：获取下一个要执行的 stage 信息

**调用**：
```typescript
const result = await workflow_next({ session_id: "abc123" })
```

**返回**（normal case）：
```json
{
  "stage": "detective",
  "agent": "detective",
  "description": "Research case law via MCP services",
  "progress": {
    "completed": 2,
    "total": 7,
    "percentage": 28
  }
}
```

**返回**（workflow complete）：
```json
{
  "status": "complete",
  "progress": {
    "completed": 7,
    "total": 7,
    "percentage": 100
  }
}
```

**关键逻辑**：
1. 读取 workflow definition（JSON）
2. 查询 checkpoint 中的 completedStages
3. 找到下一个 `depends_on` 满足的 stage
4. 如果没有下一个 stage，返回 `{ status: "complete" }`

### workflow_complete(session_id, stage_id, output)

**用途**：标记 stage 完成，保存输出，推进状态机

**调用**：
```typescript
const result = await workflow_complete({
  session_id: "abc123",
  stage_id: "detective",
  output: {
    case_law: [...],
    policy_citations: [...]
  }
})
```

**返回**：
```json
{
  "completed": "detective",
  "next_stage": "strategist",
  "progress": {
    "completed": 3,
    "total": 7,
    "percentage": 42
  }
}
```

**关键逻辑**：
1. 验证 stage_id 是当前 workflow_next() 返回的 stage
2. 将 output 保存到 checkpoint
3. 添加 stage_id 到 completedStages
4. 原子写入 checkpoint 文件
5. 返回下一个 stage 信息（方便 AuditManager 立即调用 audit_task）

### workflow_status(session_id)

**用途**：检查当前 workflow 的进度，无需推进

**调用**：
```typescript
const status = await workflow_status({ session_id: "abc123" })
```

**返回**：
```json
{
  "current_stage": "strategist",
  "completed_stages": ["intake", "detective"],
  "total_stages": 7,
  "progress": {
    "completed": 2,
    "total": 7,
    "percentage": 28
  },
  "is_complete": false,
  "checkpoint_path": "cases/.audit-checkpoints/abc123.json"
}
```

---

## Workflow 工作循环

AuditManager 的伪代码：

```typescript
async function executeWorkflow(sessionId: string) {
  while (true) {
    // Step 1: 获取下一个 stage
    const nextStage = await workflow_next({ session_id: sessionId })

    // Step 2: 检查 workflow 是否完成
    if (nextStage.status === "complete") {
      console.log("✓ Workflow complete, generating final report...")
      await generateFinalReport(sessionId)
      break
    }

    // Step 3: 派遣对应的 agent
    console.log(`→ Executing stage: ${nextStage.stage}`)
    const agentOutput = await audit_task({
      subagent_type: nextStage.agent,
      prompt: buildAgentPrompt(nextStage.agent, caseData)
    })

    // Step 4: 标记完成，推进状态机
    const completion = await workflow_complete({
      session_id: sessionId,
      stage_id: nextStage.stage,
      output: agentOutput
    })

    console.log(`✓ Stage ${nextStage.stage} completed`)
    console.log(`  Progress: ${completion.progress.completed}/${completion.progress.total}`)
  }
}
```

**关键点**：
1. ✅ 循环直到 `workflow_next()` 返回 `{ status: "complete" }`
2. ✅ 每个 agent 调用前，先调用 `workflow_next()` 获取最新的 stage 信息
3. ✅ agent 完成后，立即调用 `workflow_complete()` 保存结果
4. ✅ 不要在 AuditManager 中硬编码 stage 顺序，完全由 workflow definition 驱动

---

## Workflow Stages（状态机驱动）

**驱动方式**：由 `workflow_next()` 驱动的 WorkflowEngine 状态机，而非 AuditManager 手动编排。

```
┌─────────────────────────────────────────────────────────────────┐
│  WorkflowEngine State Machine Loop                              │
│                                                                 │
│  while (true) {                                                 │
│    1. const stage = await workflow_next(sessionId)              │
│    2. if (stage.status === "complete") break                    │
│    3. output = await audit_task(stage.agent)                    │
│    4. await workflow_complete(sessionId, stage.id, output)      │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage: intake                                                  │
│  - Intake agent extracts text from uploaded documents           │
│  - Recognizes application intent (spousal, study, etc.)         │
│  - Produces structured ApplicantProfile JSON                    │
│  - No legal analysis - pure extraction and normalization        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage: detective (依赖 intake 完成)                             │
│  - Detective searches case law via MCP (caselaw service)        │
│  - Detective retrieves operation manual sections                │
│  - KG provides similar cases and judge statistics (Pro+)        │
│  - Returns: case_law, policy_citations, research_notes         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage: strategist (依赖 detective 完成)                         │
│  - Strategist receives facts + legal research                   │
│  - Produces Defensibility Score (0-100)                         │
│  - Creates evidence plan (Baseline/Live/Strategic)              │
│  - Identifies strengths and weaknesses                          │
│  - Returns: defensibility_score, evidence_plan, analysis        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage: gatekeeper (依赖 strategist 完成)                        │
│  - Gatekeeper validates compliance                              │
│  - Identifies refusal triggers                                  │
│  - Suggests required fixes                                      │
│  - Returns: compliance_issues, refusal_risks, recommendations   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage: verifier (依赖 gatekeeper, 仅 Pro+ tier, optional)       │
│  - Verifier checks citation accuracy                            │
│  - Track iteration count (Guest:1, Pro:2, Ultra:3 max)          │
│  - If citations fail: loop back to detective for new citations  │
│  - If max iterations reached: Mark report INCOMPLETE            │
│  - Returns: verification_status, failed_citations, fixes        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage: judge (依赖 verifier, 仅部分 workflows)                  │
│  - Judge reviews all findings from previous agents              │
│  - Makes final verdict based on evidence:                       │
│    • initial-assessment → GO/CAUTION/NO-GO                      │
│    • final-review → APPROVE/REVISE                              │
│    • refusal-analysis → APPEAL/REAPPLY/ABANDON                  │
│  - Returns: verdict, rationale, recommendations                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stage: reporter (最后一步)                                      │
│  - Reporter receives Judge verdict (或 AuditManager 判断)        │
│  - Selects tier-based template (Guest/Pro/Ultra)                │
│  - Synthesizes all agent outputs into cohesive narrative        │
│  - Applies Judicial Authority theme (Navy/Gold/Paper)           │
│  - Generates Markdown + PDF output                              │
│  - Includes: Disclaimer, Summary, Score, Evidence, Plans        │
│  - Returns: report_markdown, report_pdf                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    [WORKFLOW COMPLETE]
            workflow_next() 返回 { status: "complete" }
```

**关键特点**：
- ✅ **动态 stage 序列**：由 workflow definition JSON 决定，不是硬编码的 Stage 0-5
- ✅ **依赖关系自动管理**：`depends_on` 字段确保 stage 顺序
- ✅ **Tier 感知**：verifier 仅在 Pro+ tier 运行，guest tier 自动跳过
- ✅ **Judge 可选**：仅在需要明确判决的 workflows 中出现
- ✅ **状态持久化**：每次 workflow_complete() 自动保存检查点

---

## Delegation Rules

### Intake MUST:
- Extract ALL text from uploaded documents using file_content_extract
- Recognize application intent from document types and content
- Produce structured ApplicantProfile with normalized fields
- NEVER perform legal analysis - pure data extraction only
- Pass ApplicantProfile to AuditManager

### AuditManager MUST:
- Receive ApplicantProfile from Intake (never extract directly)
- Use Detective for ALL legal research (never hallucinate case law)
- Use Strategist for argument construction
- Use Gatekeeper for compliance validation
- Use Verifier for citation checks (all tiers, mandatory)
- Track verification iterations and enforce tier limits
- Handle INCOMPLETE reports when verification fails after max retries
- Make final judgment (score, verdict) BEFORE delegating to Reporter
- Delegate to Reporter for report formatting (never format reports directly)

### Detective MUST:
- Search MCP services BEFORE web search
- Cite actual case references
- Note confidence levels for sources

### Strategist MUST:
- Base arguments on evidence from Detective
- Provide Defensibility Score with rationale
- Create actionable evidence plan

### Gatekeeper MUST:
- Check for refusal triggers
- Validate output compliance
- Flag critical issues
- Validate document lists (DOCUMENT_LIST tasks, all tiers mandatory)

### Reporter MUST:
- Receive AuditJudgment struct from AuditManager (never compute scores/verdicts)
- Apply Judicial Authority theme consistently
- Use tier-appropriate template (Guest/Pro/Ultra depth)
- Include all required sections: Disclaimer, Summary, Score, Evidence, Recommendations
- Output Markdown AND PDF to case directory
- Never modify the judgment - presentation only

---

## Output Format

Every audit report MUST include:

### 1. Disclaimer (Required)
```
This report provides a risk assessment based on historical Federal Court 
jurisprudence. It does NOT predict outcomes or guarantee visa issuance. 
Officers retain discretion. We assess judicial defensibility only.
```

### 2. Case Summary
- Application type
- Key facts
- Applicant profile

### 3. Defensibility Score
- Score: 0-100
- Rationale for score
- Confidence level

### 4. Strategist Report
- Strengths
- Weaknesses
- Evidence Plan:
  - Baseline (existing documents)
  - Live (obtainable documents)
  - Strategic (recommended additions)

### 5. Gatekeeper Review
- Compliance issues
- Refusal triggers
- Required fixes

### 6. Final Decision
- `PROCEED` - Low risk, can submit
- `REVISE` - Moderate risk, needs fixes
- `HIGH-RISK` - Significant concerns

---

## Tier-Based Features

| Feature | Guest | Pro | Ultra |
|---------|-------|-----|-------|
| Basic audit | Yes | Yes | Yes |
| Verifier check | Yes (1 retry) | Yes (2 retries) | Yes (3 retries) |
| KG similar cases | No | Yes | Yes |
| Deep MCP analysis | No | No | Yes |
| Multi-round review | No | No | Yes |
| Max Citations | 3 | 10 | 20 |
| Max Agent Calls | 4 | 6 | 12 |

---

## MCP Services

| Service | Port | Purpose |
|---------|------|---------|
| caselaw | 3105 | Federal Court case search |
| operation-manual | 3106 | IRCC operation manuals |
| help-centre | 3107 | IRCC help centre content |
| noc | 3108 | NOC code lookup |
| immi-tools | 3109 | Immigration calculators |

---

## Verification Failure Handling

When Verifier reports CRITICAL failures (citation not found, overruled case):

### Loop-Back Process
1. **Track Iteration**: Check tier limit (Guest:1, Pro:2, Ultra:3)
2. **Detective Re-search**: Find replacement citations for failed ones
3. **Strategist Update**: Revise arguments with new citations
4. **Re-verify**: Dispatch Verifier again
5. **Repeat**: Until PASS or max iterations reached

### INCOMPLETE Report Format
If citations cannot be verified after maximum attempts:

```markdown
## AUDIT INCOMPLETE - MANUAL REVIEW REQUIRED

The following citations could not be verified after {n} attempts:

| Citation | Issue | Attempts |
|----------|-------|----------|
| Smith v. Canada, 2022 FC 456 | Case not found in database | 2 |
| Old v. Canada, 2010 FC 789 | Overruled by New v. Canada, 2020 FC 100 | 2 |

**Recommended Actions**:
1. Manually verify via CanLII/Westlaw
2. Find alternative supporting case law
3. Remove unsupported arguments if no alternative exists

**Verified Portions**: The remainder of this report has been verified and can be relied upon.
```

### Critical Rules
- **NEVER** output unverified citations as facts
- **ALWAYS** mark report as INCOMPLETE if verification fails
- **ALWAYS** list failed citations with specific issues
- **ALWAYS** provide actionable next steps

---

## Quality Checklist

Before finalizing a report, verify:

- [ ] Disclaimer appears at the beginning
- [ ] Defensibility Score is present with rationale
- [ ] All citations verified (Verifier check for all tiers)
- [ ] Verification status included (PASS/INCOMPLETE)
- [ ] Evidence checklist includes all three categories
- [ ] Gatekeeper review addresses compliance
- [ ] No "guaranteed success" language
- [ ] If INCOMPLETE: Failed citations listed with retry count
