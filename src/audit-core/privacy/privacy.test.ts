import { describe, it, expect } from "bun:test"
import {
  extractPIIFromProfile,
  hasPII,
  extractPIIEntities,
} from "./extract-pii"
import {
  calculateAgeRange,
  calculateFundsRange,
  calculateRelationshipDurationMonths,
  extractFeaturesFromProfile,
  extractRiskFactors,
  extractVulnerabilities,
  extractStrengths,
} from "./extract-features"
import {
  sanitizeText,
  sanitizeReport,
  sanitizeReasoningChain,
  createAnonymizedSummary,
  batchSanitize,
} from "./sanitize"
import type { CaseProfile } from "../types/case-profile"

const mockProfile: CaseProfile = {
  case_id: "test-001",
  application_type: "spousal",
  intent: {
    task_type: "RISK_AUDIT",
    tier: "pro",
  },
  documents: {
    total_files: 10,
    extracted_count: 8,
    failed_count: 2,
    forms: [
      { type: "IMM0008", filename: "imm0008.pdf", path: "/path/to/imm0008.pdf" },
    ],
    evidence: [
      { category: "identity", filename: "passport.pdf", path: "/path/to/passport.pdf" },
    ],
  },
  sponsor: {
    name: "John Smith",
    family_name: "Smith",
    given_name: "John",
    dob: "1985-03-15",
    status: "citizen",
    uci: "1234567890",
    address: {
      street: "123 Main St",
      city: "Toronto",
      province: "ON",
      postal_code: "M5V 1A1",
    },
    employment: {
      current_employer: "Tech Corp",
      occupation: "Engineer",
      monthly_income: 8000,
    },
  },
  applicant: {
    name: "Jane Doe",
    family_name: "Doe",
    given_name: "Jane",
    dob: "1990-06-20",
    nationality: "China",
    uci: "0987654321",
    passport: {
      number: "AB1234567",
      issue_date: "2020-01-01",
      expiry_date: "2030-01-01",
    },
  },
  relationship: {
    type: "marriage",
    timeline: {
      first_met: "2020-01-15",
      courtship_start: "2020-03-01",
      cohabitation_start: "2021-06-01",
      marriage_date: "2022-08-15",
    },
    ceremony: {
      held: true,
      date: "2022-08-15",
      location: "Toronto City Hall",
      attendees: 50,
    },
    cohabiting: true,
    communication_frequency: "daily",
  },
  dependents: [
    { name: "Baby Smith", dob: "2023-05-10", relationship: "child", accompanying: true },
  ],
  red_flags: [
    {
      category: "relationship",
      severity: "low",
      description: "Short courtship period before marriage",
    },
  ],
  completeness: {
    critical_fields_present: true,
    missing_documents: [],
    warnings: [],
  },
}

describe("privacy/extract-pii", () => {
  describe("extractPIIFromProfile", () => {
    it("extracts sponsor PII correctly", () => {
      // #given
      const sessionId = "session-123"

      // #when
      const pii = extractPIIFromProfile(sessionId, mockProfile)

      // #then
      expect(pii.session_id).toBe(sessionId)
      expect(pii.sponsor_full_name).toBe("John Smith")
      expect(pii.sponsor_family_name).toBe("Smith")
      expect(pii.sponsor_given_name).toBe("John")
      expect(pii.sponsor_dob).toBe("1985-03-15")
      expect(pii.sponsor_uci).toBe("1234567890")
    })

    it("extracts applicant PII correctly", () => {
      // #given
      const sessionId = "session-123"

      // #when
      const pii = extractPIIFromProfile(sessionId, mockProfile)

      // #then
      expect(pii.applicant_full_name).toBe("Jane Doe")
      expect(pii.applicant_passport).toBe("AB1234567")
      expect(pii.applicant_uci).toBe("0987654321")
    })

    it("extracts dependents PII", () => {
      // #given
      const sessionId = "session-123"

      // #when
      const pii = extractPIIFromProfile(sessionId, mockProfile)

      // #then
      expect(pii.dependents_pii).toHaveLength(1)
      expect(pii.dependents_pii![0].name).toBe("Baby Smith")
    })

    it("collects raw document paths", () => {
      // #given
      const sessionId = "session-123"

      // #when
      const pii = extractPIIFromProfile(sessionId, mockProfile)

      // #then
      expect(pii.raw_document_paths).toContain("/path/to/imm0008.pdf")
      expect(pii.raw_document_paths).toContain("/path/to/passport.pdf")
    })
  })

  describe("hasPII", () => {
    it("detects passport numbers", () => {
      expect(hasPII("Passport: AB1234567")).toBe(true)
    })

    it("detects phone numbers", () => {
      expect(hasPII("Call me at 416-555-1234")).toBe(true)
    })

    it("detects email addresses", () => {
      expect(hasPII("Email: john@example.com")).toBe(true)
    })

    it("detects dates", () => {
      expect(hasPII("Born on 1985-03-15")).toBe(true)
    })

    it("returns false for clean text", () => {
      expect(hasPII("The Federal Court ruled in favor")).toBe(false)
    })
  })

  describe("extractPIIEntities", () => {
    it("extracts multiple entity types", () => {
      // #given
      const text = "John Smith (AB1234567) can be reached at john@email.com or 416-555-1234. DOB: 1985-03-15"

      // #when
      const entities = extractPIIEntities(text)

      // #then
      expect(entities.names).toContain("John Smith")
      expect(entities.numbers).toContain("AB1234567")
      expect(entities.emails).toContain("john@email.com")
      expect(entities.dates).toContain("1985-03-15")
    })

    it("filters out common words from names", () => {
      // #given
      const text = "The Federal Court of Canada reviewed this case"

      // #when
      const entities = extractPIIEntities(text)

      // #then
      expect(entities.names).not.toContain("Federal Court")
    })
  })
})

describe("privacy/extract-features", () => {
  describe("calculateAgeRange", () => {
    it("returns correct range for age 35", () => {
      // #given
      const dob = "1990-01-01"

      // #when
      const range = calculateAgeRange(dob)

      // #then
      expect(range).toBe("35-39")
    })

    it("returns null for undefined dob", () => {
      expect(calculateAgeRange(undefined)).toBeNull()
    })

    it("returns under-20 for young applicants", () => {
      const dob = "2010-01-01"
      expect(calculateAgeRange(dob)).toBe("under-20")
    })

    it("returns 60+ for seniors", () => {
      const dob = "1960-01-01"
      expect(calculateAgeRange(dob)).toBe("60+")
    })
  })

  describe("calculateFundsRange", () => {
    it("returns correct range for 8000/month", () => {
      expect(calculateFundsRange(8000)).toBe("75k-100k")
    })

    it("returns null for undefined income", () => {
      expect(calculateFundsRange(undefined)).toBeNull()
    })

    it("returns under-30k for low income", () => {
      expect(calculateFundsRange(2000)).toBe("under-30k")
    })

    it("returns 150k+ for high income", () => {
      expect(calculateFundsRange(15000)).toBe("150k+")
    })
  })

  describe("calculateRelationshipDurationMonths", () => {
    it("calculates months from marriage date", () => {
      // #given
      const timeline = { marriage_date: "2022-08-15" }

      // #when
      const months = calculateRelationshipDurationMonths(timeline)

      // #then
      expect(months).toBeGreaterThan(20)
    })

    it("returns null if no start date", () => {
      expect(calculateRelationshipDurationMonths({})).toBeNull()
    })
  })

  describe("extractFeaturesFromProfile", () => {
    it("extracts all abstract features", () => {
      // #when
      const features = extractFeaturesFromProfile(mockProfile, "session-123")

      // #then
      expect(features.application_type).toBe("spousal")
      expect(features.country_code).toBe("CN")
      expect(features.sponsor_country_code).toBe("CA")
      expect(features.relationship_type).toBe("marriage")
      expect(features.has_children).toBe(true)
    })

    it("includes profile features object", () => {
      // #when
      const features = extractFeaturesFromProfile(mockProfile)

      // #then
      expect(features.profile_features).toHaveProperty("cohabiting", true)
      expect(features.profile_features).toHaveProperty("ceremony_held", true)
      expect(features.profile_features).toHaveProperty("red_flag_count", 1)
    })
  })

  describe("extractRiskFactors", () => {
    it("converts red flags to risk factors", () => {
      // #when
      const factors = extractRiskFactors(mockProfile)

      // #then
      expect(factors).toHaveLength(1)
      expect(factors[0].code).toBe("RF_RELATIONSHIP")
      expect(factors[0].severity).toBe("low")
    })
  })

  describe("extractVulnerabilities", () => {
    it("identifies short relationship as vulnerability", () => {
      // #given
      const shortRelationship: CaseProfile = {
        ...mockProfile,
        relationship: {
          ...mockProfile.relationship,
          timeline: {
            marriage_date: new Date().toISOString().split("T")[0],
          },
        },
      }

      // #when
      const vulns = extractVulnerabilities(shortRelationship)

      // #then
      expect(vulns.some(v => v.area === "relationship_duration")).toBe(true)
    })
  })

  describe("extractStrengths", () => {
    it("identifies complete documentation as strength", () => {
      // #when
      const strengths = extractStrengths(mockProfile)

      // #then
      expect(strengths.some(s => s.area === "documentation")).toBe(true)
    })

    it("identifies large ceremony as strength", () => {
      // #when
      const strengths = extractStrengths(mockProfile)

      // #then
      expect(strengths.some(s => s.area === "ceremony")).toBe(true)
    })

    it("identifies cohabitation as strength", () => {
      // #when
      const strengths = extractStrengths(mockProfile)

      // #then
      expect(strengths.some(s => s.area === "cohabitation")).toBe(true)
    })
  })
})

describe("privacy/sanitize", () => {
  describe("sanitizeText", () => {
    it("replaces names with placeholders", () => {
      // #given
      const text = "John Smith applied for sponsorship"

      // #when
      const result = sanitizeText(text, { level: "conservative" })

      // #then
      expect(result.text).toContain("[PERSON_1]")
      expect(result.text).not.toContain("John Smith")
      expect(result.piiCount).toBeGreaterThan(0)
    })

    it("replaces emails", () => {
      // #given
      const text = "Contact john@example.com for details"

      // #when
      const result = sanitizeText(text, { level: "conservative" })

      // #then
      expect(result.text).toContain("[EMAIL]")
      expect(result.text).not.toContain("john@example.com")
    })

    it("preserves dates when option set", () => {
      // #given
      const text = "Married on 2022-08-15"

      // #when
      const result = sanitizeText(text, { level: "conservative", preserveDates: true })

      // #then
      expect(result.text).toContain("2022-08-15")
    })

    it("aggressive mode removes all dates", () => {
      // #given
      const text = "Married on 2022-08-15"

      // #when
      const result = sanitizeText(text, { level: "aggressive" })

      // #then
      expect(result.text).toContain("[DATE]")
      expect(result.text).not.toContain("2022-08-15")
    })

    it("tracks replacements in map", () => {
      // #given
      const text = "John Smith's email is john@example.com"

      // #when
      const result = sanitizeText(text, { level: "conservative" })

      // #then
      expect(result.replacements.size).toBeGreaterThan(0)
    })
  })

  describe("sanitizeReport", () => {
    it("replaces known sponsor and applicant names", () => {
      // #given
      const report = "John Smith sponsors Jane Doe for immigration"
      const profile = { sponsorName: "John Smith", applicantName: "Jane Doe" }

      // #when
      const result = sanitizeReport(report, profile)

      // #then
      expect(result.text).toContain("[SPONSOR]")
      expect(result.text).toContain("[APPLICANT]")
      expect(result.text).not.toContain("John Smith")
      expect(result.text).not.toContain("Jane Doe")
    })
  })

  describe("sanitizeReasoningChain", () => {
    it("sanitizes reasoning while preserving structure", () => {
      // #given
      const chain = "Step 1: Review John Smith's application. Step 2: Check passport AB1234567."

      // #when
      const result = sanitizeReasoningChain(chain, "conservative")

      // #then
      expect(result).toContain("Step 1:")
      expect(result).toContain("Step 2:")
      expect(result).not.toContain("John Smith")
    })
  })

  describe("createAnonymizedSummary", () => {
    it("handles common summary patterns", () => {
      // #given
      const summary = "This case involves Mr. Smith sponsoring applicant Jane Doe from China."

      // #when
      const result = createAnonymizedSummary(summary)

      // #then
      expect(result).not.toContain("Jane Doe")
      expect(result).toContain("China")
    })
  })

  describe("batchSanitize", () => {
    it("maintains consistent replacements across texts", () => {
      // #given
      const texts = [
        "John Smith is the sponsor",
        "The sponsor John Smith lives in Toronto",
      ]

      // #when
      const results = batchSanitize(texts, { level: "conservative" })

      // #then
      const replacement1 = results[0].replacements.get("John Smith")
      const replacement2 = results[1].replacements.get("John Smith")
      expect(replacement1).toBe(replacement2)
    })
  })
})
