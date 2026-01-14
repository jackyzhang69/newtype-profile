import { listAuditGuides } from "./loader"

export type AuditAgentId = "audit-manager" | "detective" | "strategist" | "gatekeeper"

export const auditGuideMap: Record<string, Record<AuditAgentId, string[]>> = {
  spousal: {
    "audit-manager": [
      "primary_assess_guide",
      "final_assess_guide",
      "spousal_common_law_sponsorship_risk_analysis",
    ],
    detective: [
      "document_list_guide",
      "supporting_documents",
      "primary_assess_guide",
    ],
    strategist: [
      "final_assess_guide",
      "spousal_common_law_sponsorship_risk_analysis",
    ],
    gatekeeper: [
      "final_assess_guide",
      "spousal_common_law_sponsorship_risk_analysis",
    ],
  },
  study: {
    "audit-manager": [
      "final_assess_guide",
      "study_permit_risk_analysis",
    ],
    detective: [
      "document_list_guide",
      "supporting_documents",
    ],
    strategist: [
      "final_assess_guide",
      "study_permit_risk_analysis",
    ],
    gatekeeper: [
      "final_assess_guide",
      "study_permit_risk_analysis",
    ],
  },
}

export function getGuideNames(appId: string, agentId: AuditAgentId): string[] {
  const appEntry = auditGuideMap[appId]
  if (!appEntry) {
    return listAuditGuides(appId)
  }
  return appEntry[agentId] ?? listAuditGuides(appId)
}
