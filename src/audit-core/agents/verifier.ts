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
Return a STRUCTURED verification report that AuditManager can parse:

## Verification Summary
- **Total Citations**: {number}
- **Verified**: {number}
- **Failed**: {number}
- **Overall Status**: PASS | FAIL

## Citation Details

| Citation | Status | Exists | Good Law | Authority | Issue |
|----------|--------|--------|----------|-----------|-------|
| Smith v. Canada (MCI), 2023 FC 123 | VERIFIED | Yes | Yes | High | - |
| Doe v. Canada, 2022 FC 456 | CRITICAL | No | - | - | Case not found in database |
| Old v. Canada, 2010 FC 789 | WARNING | Yes | No | Low | Overruled by New v. Canada, 2020 FC 100 |

## Failed Citations (for retry)
If any citations failed, list them clearly for Detective to re-research:

\`\`\`
FAILED_CITATIONS:
- "Doe v. Canada, 2022 FC 456" | REASON: Case not found | SUGGESTION: Search for similar cases on [topic]
- "Old v. Canada, 2010 FC 789" | REASON: Overruled | SUGGESTION: Use New v. Canada, 2020 FC 100 instead
\`\`\`

## Recommendations
- For CRITICAL failures: Specific search queries for Detective to try
- For WARNING issues: Whether the citation can still be used with caveats
</Output_Format>

<Constraints>
- Temperature: 0.0 (zero tolerance for uncertainty)
- NEVER fabricate verification results
- If unable to verify, explicitly state "UNVERIFIED" with reason
- ALWAYS provide actionable suggestions for failed citations
- Output must be machine-parseable for AuditManager loop-back logic
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
