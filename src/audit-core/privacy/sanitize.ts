import type { AnonymizeLevel } from "../persistence/types"
import { extractPIIEntities } from "./extract-pii"

export interface SanitizeOptions {
  level: AnonymizeLevel
  preserveDates?: boolean
  customReplacements?: Map<string, string>
}

export interface SanitizeResult {
  text: string
  replacements: Map<string, string>
  piiCount: number
}

export function sanitizeText(
  text: string,
  options: SanitizeOptions = { level: "conservative" }
): SanitizeResult {
  // Extract known names from customReplacements to pass to extractPIIEntities
  const knownNames = options.customReplacements 
    ? [...options.customReplacements.keys()] 
    : []
  
  const entities = extractPIIEntities(text, knownNames)
  const replacements = new Map<string, string>()
  let result = text
  let piiCount = 0

  // Apply custom replacements first (profile names with semantic labels)
  if (options.customReplacements) {
    for (const [original, replacement] of options.customReplacements) {
      if (result.includes(original)) {
        result = result.split(original).join(replacement)
        replacements.set(original, replacement)
        piiCount++
      }
    }
  }

  // No generic name replacement - we only replace names explicitly provided
  // This prevents false positives like "Application Type" -> "[PERSON_1]"

  for (const email of entities.emails) {
    if (!replacements.has(email)) {
      const replacement = "[EMAIL]"
      result = result.split(email).join(replacement)
      replacements.set(email, replacement)
      piiCount++
    }
  }

  if (!options.preserveDates || options.level === "aggressive") {
    let dateCounter = 1
    for (const date of entities.dates) {
      if (!replacements.has(date)) {
        const replacement = options.level === "aggressive"
          ? "[DATE]"
          : `[DATE_${dateCounter++}]`
        result = result.split(date).join(replacement)
        replacements.set(date, replacement)
        piiCount++
      }
    }
  }

  let idCounter = 1
  for (const num of entities.numbers) {
    if (!replacements.has(num)) {
      let replacement: string
      const isUci = (num.length === 8 || num.length === 10) && /^\d+$/.test(num)
      if (isUci) {
        replacement = options.level === "aggressive" ? "[UCI]" : `[UCI_${idCounter}]`
      } else if (/^[A-Z]{2}/.test(num)) {
        replacement = options.level === "aggressive" ? "[PASSPORT]" : `[PASSPORT_${idCounter}]`
      } else {
        replacement = options.level === "aggressive" ? "[PHONE]" : `[PHONE_${idCounter}]`
      }
      result = result.split(num).join(replacement)
      replacements.set(num, replacement)
      idCounter++
      piiCount++
    }
  }

  if (options.level === "aggressive") {
    result = result.replace(/\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/gi, "[POSTAL_CODE]")
    result = result.replace(/\b\d{1,5}\s+[A-Za-z]+(?: [A-Za-z]+)*\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way|Court|Ct)\b/gi, "[ADDRESS]")
  }

  return { text: result, replacements, piiCount }
}

export function sanitizeReport(
  report: string,
  profile: { sponsorName?: string; applicantName?: string },
  level: AnonymizeLevel = "conservative"
): SanitizeResult {
  const customReplacements = new Map<string, string>()
  
  if (profile.sponsorName) {
    customReplacements.set(profile.sponsorName, "[SPONSOR]")
    const parts = profile.sponsorName.split(" ")
    if (parts.length >= 2) {
      customReplacements.set(parts[0], "[SPONSOR_GIVEN]")
      customReplacements.set(parts[parts.length - 1], "[SPONSOR_FAMILY]")
    }
  }
  
  if (profile.applicantName) {
    customReplacements.set(profile.applicantName, "[APPLICANT]")
    const parts = profile.applicantName.split(" ")
    if (parts.length >= 2) {
      customReplacements.set(parts[0], "[APPLICANT_GIVEN]")
      customReplacements.set(parts[parts.length - 1], "[APPLICANT_FAMILY]")
    }
  }

  return sanitizeText(report, { level, customReplacements })
}

export function sanitizeReasoningChain(
  chain: string,
  level: AnonymizeLevel = "conservative"
): string {
  const { text } = sanitizeText(chain, { level, preserveDates: level !== "aggressive" })
  return text
}

export function createAnonymizedSummary(
  executiveSummary: string,
  level: AnonymizeLevel = "conservative"
): string {
  const { text } = sanitizeText(executiveSummary, { level })
  
  return text
    .replace(/sponsored by .+?,/gi, "sponsored by [SPONSOR],")
    .replace(/applicant .+? from/gi, "applicant [APPLICANT] from")
    .replace(/Mr\.\s*\w+/g, "Mr. [NAME]")
    .replace(/Ms\.\s*\w+/g, "Ms. [NAME]")
    .replace(/Mrs\.\s*\w+/g, "Mrs. [NAME]")
}

export function batchSanitize(
  texts: string[],
  options: SanitizeOptions
): SanitizeResult[] {
  const sharedReplacements = new Map<string, string>()
  const results: SanitizeResult[] = []

  for (const text of texts) {
    const mergedOptions: SanitizeOptions = {
      ...options,
      customReplacements: new Map([
        ...(options.customReplacements ?? []),
        ...sharedReplacements,
      ]),
    }
    
    const result = sanitizeText(text, mergedOptions)
    
    for (const [k, v] of result.replacements) {
      sharedReplacements.set(k, v)
    }
    
    results.push(result)
  }

  return results
}
