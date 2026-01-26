import type { CaseProfile } from "../types/case-profile"
import type { CreateCasePIIInput } from "../persistence/types"

export function extractPIIFromProfile(
  sessionId: string,
  profile: CaseProfile,
  userId?: string
): CreateCasePIIInput {
  const sponsor = profile.sponsor
  const applicant = profile.applicant

  const dependentsPii = profile.dependents?.map(dep => ({
    name: dep.name,
    dob: dep.dob,
    relationship: dep.relationship,
  }))

  const rawDocumentPaths = [
    ...profile.documents.forms.map(f => f.path),
    ...profile.documents.evidence.map(e => e.path),
  ]

  return {
    session_id: sessionId,
    sponsor_full_name: sponsor.name,
    sponsor_family_name: sponsor.family_name,
    sponsor_given_name: sponsor.given_name,
    sponsor_dob: sponsor.dob,
    sponsor_uci: sponsor.uci,
    sponsor_contact: sponsor.address ? {
      street: sponsor.address.street,
      city: sponsor.address.city,
      province: sponsor.address.province,
      postal_code: sponsor.address.postal_code,
    } : undefined,
    applicant_full_name: applicant.name,
    applicant_family_name: applicant.family_name,
    applicant_given_name: applicant.given_name,
    applicant_dob: applicant.dob,
    applicant_passport: applicant.passport?.number,
    applicant_uci: applicant.uci,
    applicant_contact: undefined,
    dependents_pii: dependentsPii,
    raw_document_paths: rawDocumentPaths,
    user_id: userId,
  }
}

export function hasPII(text: string): boolean {
  const piiPatterns = [
    /\b[A-Z]{2}\d{6,9}\b/,
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
    /\b\d{4}[-/]\d{2}[-/]\d{2}\b/,
    /\b\d{10}\b/,
    /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/i,
  ]

  if (piiPatterns.some(pattern => pattern.test(text))) {
    return true
  }

  const nameMatches = text.match(/\b[A-Z][a-z]{1,15} [A-Z][a-z]{1,15}\b/g) || []
  const commonWords = ["The", "This", "That", "Federal", "Court", "Canada", "Immigration", "Minister", "Citizenship"]
  const filteredNames = nameMatches.filter(name => !commonWords.some(w => name.startsWith(w) || name.endsWith(w)))
  
  return filteredNames.length > 0
}

/**
 * Extract PII entities from text.
 * 
 * IMPORTANT: This function intentionally does NOT detect names via regex.
 * Name detection via regex causes massive false positives (e.g., "Application Type",
 * "Legal Basis", "Good Law" all get matched as names).
 * 
 * Instead, names should be passed explicitly via the `knownNames` parameter,
 * which are typically extracted from the CaseProfile (sponsor/applicant names).
 * 
 * @param text - The text to extract PII from
 * @param knownNames - Optional array of known names to include (from profile)
 */
export function extractPIIEntities(
  text: string,
  knownNames: string[] = []
): {
  names: string[]
  dates: string[]
  numbers: string[]
  emails: string[]
} {
  const names: string[] = []
  const dates: string[] = []
  const numbers: string[] = []
  const emails: string[] = []

  // Emails - safe to detect via regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
  let match
  while ((match = emailRegex.exec(text)) !== null) {
    emails.push(match[0])
  }

  // Dates in ISO or common formats - safe to detect via regex
  const dateRegex = /\b(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\b/g
  while ((match = dateRegex.exec(text)) !== null) {
    dates.push(match[0])
  }

  // Passport numbers (e.g., AB1234567) - safe to detect via regex
  const passportRegex = /\b[A-Z]{2}\d{6,9}\b/g
  while ((match = passportRegex.exec(text)) !== null) {
    numbers.push(match[0])
  }

  // UCI numbers (8 or 10 digits per IRCC) - safe to detect via regex
  // Format: 0000-0000 (8 digits) or 00-0000-0000 (10 digits)
  const uci8Regex = /\b\d{8}\b/g
  while ((match = uci8Regex.exec(text)) !== null) {
    numbers.push(match[0])
  }
  const uci10Regex = /\b\d{10}\b/g
  while ((match = uci10Regex.exec(text)) !== null) {
    numbers.push(match[0])
  }

  // Phone numbers - safe to detect via regex
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g
  while ((match = phoneRegex.exec(text)) !== null) {
    numbers.push(match[0])
  }

  // Names - ONLY use explicitly provided names, NO regex detection
  // This avoids false positives like "Application Type", "Legal Basis", etc.
  for (const name of knownNames) {
    if (name && text.includes(name)) {
      names.push(name)
    }
  }

  return {
    names: [...new Set(names)],
    dates: [...new Set(dates)],
    numbers: [...new Set(numbers)],
    emails: [...new Set(emails)],
  }
}
