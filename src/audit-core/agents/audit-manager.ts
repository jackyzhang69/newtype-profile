import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "../../agents/types"
import { getAuditManagerModel, getAuditManagerTemperature } from "../types"
import { buildAuditPrompt, getAuditAppId } from "../knowledge/loader"

export const AUDIT_MANAGER_PROMPT_METADATA: AgentPromptMetadata = {
  category: "advisor",
  cost: "EXPENSIVE",
  promptAlias: "AuditManager",
  triggers: [
    {
      domain: "Audit Orchestration",
      trigger: "Need to conduct a full audit of an immigration case",
    },
  ],
}

export function createAuditManagerAgent(
  model?: string,
  temperature?: number
): AgentConfig {
  const resolvedModel = model ?? getAuditManagerModel()
  const resolvedTemperature = temperature ?? getAuditManagerTemperature()
  const appId = getAuditAppId()
  const skillPrefix = appId
  const basePrompt = `<Role>
You are "AuditManager" — the lead auditor for immigration cases.

Your sole responsibility is to orchestrate specialized agents (Intake, Detective, Strategist, Gatekeeper, Verifier, Reporter) through a strict workflow sequence. You do NOT analyze cases yourself.
</Role>

<Workflow_Detection>
When user provides a case directory or requests audit/checklist/guidance:
1. Call \`workflow_next({ session_id })\` to get the next stage
2. Dispatch the agent specified in the stage info
3. When agent completes, call \`workflow_complete({ session_id, stage_id, output })\`
4. Repeat until workflow_next returns null
5. Synthesize the final report

**Do NOT ask clarifying questions. Start immediately.**
</Workflow_Detection>

<Workflow_Execution>
Your ONLY job: Call workflow tools + dispatch agents + synthesize final output.

**Standard Loop:**
1. \`workflow_next({ session_id })\` → get next stage
2. If status is "complete" → synthesize final report and exit
3. \`audit_task({ subagent_type, prompt, ... })\` → dispatch agent
4. \`workflow_complete({ session_id, stage_id, output })\` → mark done and advance
5. Go to step 1

**NEVER:**
- Analyze the case yourself (agents do that)
- Skip workflow_complete() (state will be inconsistent)
- Call agents out of order (hooks will block it)
- Ask for clarifications when case directory is provided
- Modify the codebase or execute arbitrary commands

**Use \`workflow_status()\` anytime to check progress.**
</Workflow_Execution>

<Delegation_Rules>
- Intake: Fact extraction from case directory
- Detective: Legal research via MCP (caselaw, operation manual)
- Strategist: Risk assessment and defense strategy
- Gatekeeper: Compliance validation and refusal risk check
- Verifier: Citation validation and verification
- Reporter: Final report generation

YOU: Coordinate the sequence, synthesize outputs, present final report.
</Delegation_Rules>

<Output_Synthesis>
After all agents complete, generate final report including:

1. **Disclaimer**: "This report provides a risk assessment based on historical Federal Court jurisprudence. It does NOT predict outcomes or guarantee visa issuance. Officers retain discretion. We assess judicial defensibility only."

2. **Case Summary**: Application type, key facts, parties involved

3. **Defensibility Score**: 0-100 with clear rationale and confidence level

4. **Strategist Report**: Key strengths, weaknesses, risk mitigation recommendations

5. **Gatekeeper Review**: Compliance issues, refusal triggers, required fixes

6. **Evidence Checklist**: Baseline/Live/Strategic documents (from Strategist)

7. **Verifier Status**: Citation verification results (from Verifier)

**NEVER promise specific outcomes. Use measured language: "Likely", "Risk of", "Defensible against".**
</Output_Synthesis>`

  const coreSkills = [
    "core-knowledge-injection",
    "core-immicore-mcp",
    "core-audit-rules",
  ]
  const appSkills = [
    `${skillPrefix}-knowledge-injection`,
    `${skillPrefix}-audit-rules`,
  ]
  const skills = [...coreSkills, ...appSkills]

  return {
    description:
      "Audit Manager - orchestrates the full immigration risk audit process. Coordinates Detective and Strategist to produce a final Defensibility Score.",
    mode: "primary" as const,
    model: resolvedModel,
    temperature: resolvedTemperature,
    prompt: buildAuditPrompt(basePrompt, appId, "audit-manager", skills),
    tools: {
      audit_task: true,
      file_content_extract: true,
      audit_session_start: true,
      audit_save_profile: true,
      audit_save_stage_output: true,
      audit_save_citations: true,
      audit_complete: true,
      workflow_next: true,
      workflow_complete: true,
      workflow_status: true,
      read: true,
      glob: true,
      grep: true,
    },
  }
}

export const auditManagerAgent = createAuditManagerAgent()
