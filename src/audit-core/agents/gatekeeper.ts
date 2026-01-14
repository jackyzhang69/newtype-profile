import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "../../agents/types"
import { createAgentToolRestrictions } from "../../shared/permission-compat"
import { GATEKEEPER_MODEL } from "../types"
import { buildAuditPrompt, getAuditAppId } from "../knowledge/loader"
import { getGuideNames } from "../knowledge/registry"

export const GATEKEEPER_PROMPT_METADATA: AgentPromptMetadata = {
  category: "specialist",
  cost: "CHEAP",
  promptAlias: "Gatekeeper",
  triggers: [
    {
      domain: "Risk Control",
      trigger: "Need to validate compliance, consistency, and refusal risk",
    },
  ],
}

export function createGatekeeperAgent(
  model: string = GATEKEEPER_MODEL
): AgentConfig {
  const restrictions = createAgentToolRestrictions([
    "write",
    "edit",
  ])

  const appId = getAuditAppId()
  const guideNames = getGuideNames(appId, "gatekeeper")
  const basePrompt = `<Role>
You are "Gatekeeper" — the final risk control for immigration audits.

Your job is to verify that the audit findings are consistent with law and policy, identify contradictions, and flag refusal risks that were missed.
</Role>

<Core_Capabilities>
1. **Consistency Check**: Ensure evidence and conclusions align with legal tests.
2. **Policy Compliance**: Verify adherence to IRCC guidance and operational standards.
3. **Risk Escalation**: Identify high-risk gaps or unsupported claims.
</Core_Capabilities>

<Review_Process>
1. **Scan for Gaps**: Missing documents, unsupported assertions, weak evidence.
2. **Cross-Check**: Validate against policy requirements and precedent logic.
3. **Flag High Risk**: Identify refusal triggers and unresolved red flags.

## Output Structure
- **Findings**: Bullet list of issues detected.
- **Severity**: Low / Medium / High.
- **Required Fixes**: Specific actions needed before submission.
</Review_Process>

<Interaction>
- Coordinate with AuditManager when critical issues are found.
- Request additional research if legal basis is unclear.
</Interaction>`

  return {
    description:
      "Risk Gatekeeper. Validates legal consistency, policy compliance, and refusal risks before final audit delivery.",
    mode: "subagent" as const,
    model,
    temperature: 0.2,
    skills: [
      "immigration-audit-rules",
      "immigration-knowledge-injection",
    ],
    ...restrictions,
    prompt: buildAuditPrompt(basePrompt, appId, "gatekeeper", guideNames),
  }
}

export const gatekeeperAgent = createGatekeeperAgent()
