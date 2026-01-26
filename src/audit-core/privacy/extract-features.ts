import type { CaseProfile } from "../types/case-profile"
import type { CreateKnowledgeBaseInput } from "../persistence/types"

export function calculateAgeRange(dob: string | undefined): string | null {
  if (!dob) return null
  
  const birthDate = new Date(dob)
  const today = new Date()
  const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  
  if (age < 20) return "under-20"
  if (age < 25) return "20-24"
  if (age < 30) return "25-29"
  if (age < 35) return "30-34"
  if (age < 40) return "35-39"
  if (age < 45) return "40-44"
  if (age < 50) return "45-49"
  if (age < 55) return "50-54"
  if (age < 60) return "55-59"
  return "60+"
}

export function calculateFundsRange(monthlyIncome: number | undefined): string | null {
  if (monthlyIncome === undefined) return null
  
  const annual = monthlyIncome * 12
  
  if (annual < 30000) return "under-30k"
  if (annual < 50000) return "30k-50k"
  if (annual < 75000) return "50k-75k"
  if (annual < 100000) return "75k-100k"
  if (annual < 150000) return "100k-150k"
  return "150k+"
}

export function calculateRelationshipDurationMonths(
  timeline: CaseProfile["relationship"]["timeline"]
): number | null {
  const startDate = timeline.marriage_date || timeline.cohabitation_start || timeline.courtship_start
  if (!startDate) return null
  
  const start = new Date(startDate)
  const now = new Date()
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  
  return Math.max(0, months)
}

export function extractFeaturesFromProfile(
  profile: CaseProfile,
  sessionId?: string
): CreateKnowledgeBaseInput {
  const sponsor = profile.sponsor
  const applicant = profile.applicant
  const relationship = profile.relationship

  return {
    session_id: sessionId,
    application_type: profile.application_type,
    country_code: mapNationalityToCode(applicant.nationality),
    sponsor_country_code: "CA",
    applicant_age_range: calculateAgeRange(applicant.dob) ?? undefined,
    sponsor_age_range: calculateAgeRange(sponsor.dob) ?? undefined,
    funds_range: calculateFundsRange(sponsor.employment?.monthly_income) ?? undefined,
    education_level: undefined,
    relationship_type: relationship.type,
    relationship_duration_months: calculateRelationshipDurationMonths(relationship.timeline) ?? undefined,
    has_children: (profile.dependents?.length ?? 0) > 0,
    has_previous_refusal: profile.red_flags?.some(rf => 
      rf.category === "immigration" && rf.description.toLowerCase().includes("refusal")
    ) ?? false,
    profile_features: {
      cohabiting: relationship.cohabiting,
      communication_frequency: relationship.communication_frequency,
      ceremony_held: relationship.ceremony?.held,
      red_flag_count: profile.red_flags?.length ?? 0,
      critical_red_flags: profile.red_flags?.filter(rf => rf.severity === "critical").length ?? 0,
      document_completeness: profile.completeness.critical_fields_present,
      missing_document_count: profile.completeness.missing_documents?.length ?? 0,
    },
  }
}

function mapNationalityToCode(nationality: string): string {
  const mapping: Record<string, string> = {
    "china": "CN",
    "chinese": "CN",
    "india": "IN",
    "indian": "IN",
    "philippines": "PH",
    "filipino": "PH",
    "pakistan": "PK",
    "pakistani": "PK",
    "iran": "IR",
    "iranian": "IR",
    "nigeria": "NG",
    "nigerian": "NG",
    "brazil": "BR",
    "brazilian": "BR",
    "mexico": "MX",
    "mexican": "MX",
    "vietnam": "VN",
    "vietnamese": "VN",
    "korea": "KR",
    "korean": "KR",
    "japan": "JP",
    "japanese": "JP",
    "united states": "US",
    "american": "US",
    "united kingdom": "GB",
    "british": "GB",
  }
  
  const lower = nationality.toLowerCase()
  return mapping[lower] ?? nationality.substring(0, 2).toUpperCase()
}

export function extractRiskFactors(profile: CaseProfile): Record<string, unknown>[] {
  const factors: Record<string, unknown>[] = []
  
  if (profile.red_flags) {
    for (const flag of profile.red_flags) {
      factors.push({
        code: `RF_${flag.category.toUpperCase()}`,
        category: flag.category,
        severity: flag.severity,
        description_template: sanitizeDescription(flag.description),
      })
    }
  }
  
  return factors
}

export function extractVulnerabilities(profile: CaseProfile): Record<string, unknown>[] {
  const vulns: Record<string, unknown>[] = []
  
  if (profile.completeness.missing_documents?.length) {
    vulns.push({
      area: "documentation",
      severity: "medium",
      count: profile.completeness.missing_documents.length,
    })
  }
  
  const timeline = profile.relationship.timeline
  const durationMonths = calculateRelationshipDurationMonths(timeline)
  if (durationMonths !== null && durationMonths < 12) {
    vulns.push({
      area: "relationship_duration",
      severity: "high",
      months: durationMonths,
    })
  }
  
  if (profile.relationship.timeline.separations?.length) {
    vulns.push({
      area: "separations",
      severity: "medium",
      count: profile.relationship.timeline.separations.length,
    })
  }
  
  return vulns
}

export function extractStrengths(profile: CaseProfile): Record<string, unknown>[] {
  const strengths: Record<string, unknown>[] = []
  
  if (profile.completeness.critical_fields_present && !profile.completeness.missing_documents?.length) {
    strengths.push({
      area: "documentation",
      note: "Complete documentation package",
    })
  }
  
  if (profile.relationship.ceremony?.held && (profile.relationship.ceremony.attendees ?? 0) > 20) {
    strengths.push({
      area: "ceremony",
      note: "Large wedding ceremony",
    })
  }
  
  if (profile.relationship.cohabiting) {
    strengths.push({
      area: "cohabitation",
      note: "Currently cohabiting",
    })
  }
  
  const durationMonths = calculateRelationshipDurationMonths(profile.relationship.timeline)
  if (durationMonths !== null && durationMonths >= 24) {
    strengths.push({
      area: "relationship_duration",
      note: "Long-term relationship",
      months: durationMonths,
    })
  }
  
  return strengths
}

function sanitizeDescription(description: string): string {
  return description
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "[PERSON]")
    .replace(/\b\d{4}[-/]\d{2}[-/]\d{2}\b/g, "[DATE]")
    .replace(/\b[A-Z]{2}\d{6,9}\b/g, "[ID]")
}
