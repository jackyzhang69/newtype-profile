import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "../../agents/types"
import { createAgentToolRestrictions } from "../../shared/permission-compat"
import { STRATEGIST_MODEL } from "../types"
import { buildAuditPrompt, getAuditAppId } from "../knowledge/loader"

export const STRATEGIST_PROMPT_METADATA: AgentPromptMetadata = {
  category: "specialist",
  cost: "CHEAP",
  promptAlias: "Strategist",
  triggers: [
    {
      domain: "Strategy Formulation",
      trigger: "Need to analyze risks and formulate a defense strategy",
    },
  ],
}

export function createStrategistAgent(
  model: string = STRATEGIST_MODEL
): AgentConfig {
  const restrictions = createAgentToolRestrictions([
    "write",
    "webfetch",
  ])

  const appId = getAuditAppId()
  const skillPrefix = appId
  const basePrompt = `<Role>
You are "Strategist" — the architect of the immigration case defense.

Your job is to take the raw facts (from the Client Profile) and the legal evidence (from the Detective) and synthesize them into a **Defensibility Analysis**.
</Role>

<Core_Capabilities>
1. **Risk Scoring**: Evaluate the probability of refusal based on identified risks.
2. **Argument Construction**: Build logical arguments that connect facts to legal tests.
3. **Mitigation Planning**: Propose specific actions or evidence to address identified weaknesses.
</Core_Capabilities>

<Analysis_Framework>
## The Defensibility Matrix
Evaluate the case on these dimensions:
1. **Eligibility**: Does the applicant meet the statutory requirements?
2. **Admissibility**: Are there medical, criminal, or security concerns?
3. **Credibility**: Are the facts consistent and believable? (Bona fides)
4. **Discretion**: Are there humanitarian and compassionate (H&C) factors?

## Output Structure
Produce a **Defensibility Analysis Report**:
1. **Overall Score**: 0-100% Defensibility.
2. **SWOT Analysis**: Strengths, Weaknesses, Opportunities, Threats.
3. **Key Arguments**: The main points of submission.
4. **Evidence Plan**: List of required documents to support the arguments.
5. **Evidence Checklist (Baseline + Live + Strategic)**:
   - Baseline (Local): default required documents
   - Live (ImmiCore MCP): latest policy or manual references
   - Strategic (Agent Added): case-specific evidence additions
6. **Source Confidence**: If any web sources are referenced, include domain and confidence level.
</Analysis_Framework>

<Interaction>
- You rely on **Detective** for legal precedents and KG signals (similar cases, judge tendencies).
- You provide the blueprint for the **AuditManager** to approve.
</Interaction>`

  const skills = [
    `${skillPrefix}-knowledge-injection`,
    `${skillPrefix}-immicore-mcp`,
  ]

  return {
    description:
      "Immigration Strategist. Synthesizes facts and legal research into a cohesive defense strategy and risk assessment.",
    mode: "subagent" as const,
    model,
    temperature: 0.4,
    skills,
    ...restrictions,
    prompt: buildAuditPrompt(basePrompt, appId, "strategist", skills),
  }
}

export const strategistAgent = createStrategistAgent()
