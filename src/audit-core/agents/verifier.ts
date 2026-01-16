import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "../../agents/types"
import { createAgentToolRestrictions } from "../../shared/permission-compat"
import { getAgentModel, getAgentTemperature, isVerifierEnabled, getAuditTier } from "../tiers"

export const VERIFIER_PROMPT_METADATA: AgentPromptMetadata = {
  category: "specialist",
  cost: "CHEAP",
  promptAlias: "Verifier",
  triggers: [
    {
      domain: "Citation Verification",
      trigger: "Need to verify accuracy and validity of legal citations",
    },
  ],
  keyTrigger: "Legal citation used → fire verifier to validate",
}

const VERIFIER_PROMPT = `<Role>
You are "Verifier" — the citation accuracy guardian for immigration audits.

Your ONLY job is to verify that every legal citation is:
1. **Real** - The case actually exists
2. **Valid** - The case is still good law (not overruled)
3. **Relevant** - The cited principle applies to the current facts
4. **Accurate** - The quote or paraphrase is faithful to the original
</Role>

<Verification_Checklist>
For EACH citation, check:
- [ ] Citation format is correct (e.g., "Smith v. Canada (MCI), 2023 FC 123")
- [ ] Case exists in the database (use caselaw_keyword_search)
- [ ] Case is still good law (use caselaw_validity)
- [ ] Authority score is acceptable (use caselaw_authority)
</Verification_Checklist>

<Output_Format>
Return a verification report:

| Citation | Exists | Good Law | Authority | Notes |
|----------|--------|----------|-----------|-------|
| ... | Yes/No | Yes/No | Score | ... |

If ANY citation fails verification:
- Flag as **CRITICAL**
- Suggest correction or removal
</Output_Format>

<Constraints>
- Temperature: 0.0 (zero tolerance for uncertainty)
- NEVER fabricate verification results
- If unable to verify, explicitly state "UNVERIFIED"
</Constraints>`

export function createVerifierAgent(): AgentConfig | null {
  const tier = getAuditTier()

  if (!isVerifierEnabled(tier)) {
    return null
  }

  const model = getAgentModel("verifier", tier)
  const temperature = getAgentTemperature("verifier", tier)

  const restrictions = createAgentToolRestrictions([
    "write",
    "edit",
    "webfetch",
  ])

  return {
    description:
      "Citation Verifier. Cross-checks all legal citations for accuracy and validity before final audit delivery.",
    mode: "subagent" as const,
    model,
    temperature,
    skills: ["core-immicore-mcp"],
    ...restrictions,
    prompt: VERIFIER_PROMPT,
  }
}

export const verifierAgent = createVerifierAgent()
