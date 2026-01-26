import type { CaseProfile } from "../types/case-profile"
import type { AnonymizeLevel } from "../persistence/types"
import {
  createCasePII,
  getCasePIIBySession,
  createKnowledgeBaseEntry,
  getKnowledgeBaseBySession,
} from "../persistence/repositories"
import {
  extractPIIFromProfile,
} from "./extract-pii"
import {
  extractFeaturesFromProfile,
  extractRiskFactors,
  extractVulnerabilities,
  extractStrengths,
} from "./extract-features"
import {
  sanitizeReport,
  sanitizeReasoningChain,
  createAnonymizedSummary,
} from "./sanitize"

export interface PrivacyProcessResult {
  piiId: string
  knowledgeBaseId: string | null
  anonymizedReport: string
  piiCount: number
}

export interface ProcessReportOptions {
  sessionId: string
  profile: CaseProfile
  report: string
  reasoningChain?: string
  executiveSummary?: string
  verdict?: "GO" | "CAUTION" | "NO-GO"
  score?: number
  scoreWithMitigation?: number
  tier?: string
  userId?: string
  anonymizeLevel?: AnonymizeLevel
  skipKnowledgeBase?: boolean
}

export async function processIntakePII(
  sessionId: string,
  profile: CaseProfile,
  userId?: string
): Promise<string> {
  const existing = await getCasePIIBySession(sessionId)
  if (existing) {
    return existing.id
  }

  const piiInput = extractPIIFromProfile(sessionId, profile, userId)
  const pii = await createCasePII(piiInput)
  return pii.id
}

export async function processReportForPrivacy(
  options: ProcessReportOptions
): Promise<PrivacyProcessResult> {
  const {
    sessionId,
    profile,
    report,
    reasoningChain,
    executiveSummary,
    verdict,
    score,
    scoreWithMitigation,
    tier,
    userId,
    anonymizeLevel = "conservative",
    skipKnowledgeBase = false,
  } = options

  const piiId = await processIntakePII(sessionId, profile, userId)

  const sanitizedReport = sanitizeReport(report, {
    sponsorName: profile.sponsor.name,
    applicantName: profile.applicant.name,
  }, anonymizeLevel)

  let knowledgeBaseId: string | null = null

  if (!skipKnowledgeBase) {
    const existingKB = await getKnowledgeBaseBySession(sessionId)
    
    if (!existingKB) {
      const features = extractFeaturesFromProfile(profile, sessionId)
      
      const kbEntry = await createKnowledgeBaseEntry({
        ...features,
        pii_ref_id: piiId,
        audit_report_anonymized: sanitizedReport.text,
        reasoning_chain_anonymized: reasoningChain 
          ? sanitizeReasoningChain(reasoningChain, anonymizeLevel)
          : undefined,
        executive_summary_anonymized: executiveSummary
          ? createAnonymizedSummary(executiveSummary, anonymizeLevel)
          : undefined,
        risk_factors: extractRiskFactors(profile),
        vulnerabilities: extractVulnerabilities(profile),
        strengths: extractStrengths(profile),
        verdict,
        score,
        score_with_mitigation: scoreWithMitigation,
        tier,
      })
      
      knowledgeBaseId = kbEntry.id
    } else {
      knowledgeBaseId = existingKB.id
    }
  }

  return {
    piiId,
    knowledgeBaseId,
    anonymizedReport: sanitizedReport.text,
    piiCount: sanitizedReport.piiCount,
  }
}

export async function generateDualReports(
  sessionId: string,
  profile: CaseProfile,
  report: string,
  anonymizeLevel: AnonymizeLevel = "conservative"
): Promise<{ standard: string; anonymized: string; piiCount: number }> {
  const sanitized = sanitizeReport(report, {
    sponsorName: profile.sponsor.name,
    applicantName: profile.applicant.name,
  }, anonymizeLevel)

  return {
    standard: report,
    anonymized: sanitized.text,
    piiCount: sanitized.piiCount,
  }
}
