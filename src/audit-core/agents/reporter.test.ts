import { describe, test, expect } from "bun:test"
import { createReporterAgent } from "./reporter"

describe("Reporter Agent", () => {
  describe("Agent Configuration", () => {
    test("should create reporter agent with default settings", () => {
      const agent = createReporterAgent()
      
      expect(agent).toBeDefined()
      expect(agent.mode).toBe("subagent")
      expect(agent.description).toContain("Reporter")
      expect(agent.description).toContain("Judicial Authority")
    })

    test("should have tool restrictions configured", () => {
      const agent = createReporterAgent()
      
      const hasRestrictions = agent.tools !== undefined || agent.permission !== undefined
      expect(hasRestrictions).toBe(true)
    })

    test("should have prompt configured", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toBeDefined()
      expect(agent.prompt!.length).toBeGreaterThan(1000)
    })
  })

  describe("Tier-Based Templates", () => {
    test("should define Guest tier template (400 lines max)", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("GUEST TIER (Max 400 lines)")
      expect(agent.prompt).toContain("DIY applicants")
      expect(agent.prompt).toContain("report.pdf (single file)")
    })

    test("should define Pro tier template (500 lines max)", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("PRO TIER (Max 500 lines)")
      expect(agent.prompt).toContain("RCICs")
      expect(agent.prompt).toContain("report.pdf (single file)")
    })

    test("should define Ultra tier template (600 lines max)", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("ULTRA TIER (Max 600 lines)")
      expect(agent.prompt).toContain("Lawyers")
      expect(agent.prompt).toContain("report.pdf + technical_appendix.pdf")
    })
  })

  describe("Executive Summary Integration", () => {
    test("should specify integrated executive summary for Guest tier", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("EXECUTIVE SUMMARY (integrated, max 1/3 page")
      expect(agent.prompt).toContain("score, top 3 risks, top 3 strengths")
    })

    test("should specify integrated executive summary for Pro tier", () => {
      const agent = createReporterAgent()
      
      const proSection = agent.prompt?.match(/PRO TIER[\s\S]*?(?=##)/)?.[0]
      expect(proSection).toContain("EXECUTIVE SUMMARY (integrated")
    })

    test("should specify integrated executive summary for Ultra tier", () => {
      const agent = createReporterAgent()
      
      const ultraSection = agent.prompt?.match(/ULTRA TIER[\s\S]*?(?=<\/Template_Selection>)/)?.[0]
      expect(ultraSection).toContain("EXECUTIVE SUMMARY (integrated")
    })
  })

  describe("Technical Appendix (Ultra Only)", () => {
    test("should define technical appendix structure", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("Technical Appendix (technical_appendix.pdf)")
      expect(agent.prompt).toContain("LEGAL FRAMEWORK (full details)")
      expect(agent.prompt).toContain("VERIFICATION & QA (full details)")
      expect(agent.prompt).toContain("EVIDENCE ANALYSIS (full details)")
      expect(agent.prompt).toContain("METHODOLOGY")
    })

    test("should specify appendix content sections", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("Case law precedents table")
      expect(agent.prompt).toContain("Citation validation results")
      expect(agent.prompt).toContain("Document inventory")
      expect(agent.prompt).toContain("Audit process flowchart")
    })
  })

  describe("File Naming Rules", () => {
    test("should enforce lowercase file naming", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("All lowercase: report.pdf, technical_appendix.pdf, report_demo.pdf")
      expect(agent.prompt).toContain("No uppercase: NOT REPORT.pdf, NOT Report.pdf")
    })

    test("should specify internal files directory", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain(".internal/")
      expect(agent.prompt).toContain("No Markdown/JSON for users")
    })

    test("should specify no separate executive summary file", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("Executive summary integrated into main report, NOT separate file")
    })
  })

  describe("Directory Structure", () => {
    test("should define correct directory structure", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("audit_reports/")
      expect(agent.prompt).toContain("documents/")
      expect(agent.prompt).toContain(".internal/")
    })

    test("should specify file locations by tier", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("report.pdf")
      expect(agent.prompt).toContain("technical_appendix.pdf")
      expect(agent.prompt).toContain("report_demo.pdf")
    })
  })

  describe("Anonymization", () => {
    test("should define anonymization rules", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("--anonymize flag")
      expect(agent.prompt).toContain("[SPONSOR]")
      expect(agent.prompt).toContain("[APPLICANT]")
      expect(agent.prompt).toContain("[PASSPORT]")
    })

    test("should specify what to keep during anonymization", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("Country names")
      expect(agent.prompt).toContain("Province/State names")
      expect(agent.prompt).toContain("Relationship type")
    })
  })

  describe("Mandatory Disclaimer", () => {
    test("should include mandatory disclaimer text", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("This report provides a risk assessment")
      expect(agent.prompt).toContain("NOT a prediction of future outcomes")
      expect(agent.prompt).toContain("Immigration officers retain broad discretion")
    })

    test("should mark disclaimer as non-negotiable", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("NON-NEGOTIABLE")
      expect(agent.prompt).toContain("Do not modify, abbreviate, or omit")
    })
  })

  describe("Prohibited Language", () => {
    test("should list prohibited words", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("Guaranteed")
      expect(agent.prompt).toContain("100%")
      expect(agent.prompt).toContain("Promise")
      expect(agent.prompt).toContain("Success Rate")
    })

    test("should provide alternative language", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("Defensibility score")
      expect(agent.prompt).toContain("Procedural readiness")
      expect(agent.prompt).toContain("Based on precedent analysis")
    })
  })

  describe("Synthesis Rules", () => {
    test("should define what to extract from Detective", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("From Detective")
      expect(agent.prompt).toContain("Precedents table")
      expect(agent.prompt).toContain("Risk flags")
    })

    test("should define what to extract from Strategist", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("From Strategist")
      expect(agent.prompt).toContain("Vulnerabilities with Poison Pills")
      expect(agent.prompt).toContain("Strengths")
    })

    test("should define what to extract from Gatekeeper", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("From Gatekeeper")
      expect(agent.prompt).toContain("PASS/FAIL status")
      expect(agent.prompt).toContain("Required fixes")
    })

    test("should define what to extract from Verifier", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("From Verifier")
      expect(agent.prompt).toContain("Summary counts")
      expect(agent.prompt).toContain("corrections applied")
    })
  })

  describe("Length Enforcement", () => {
    test("should define length enforcement process", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("Count total lines")
      expect(agent.prompt).toContain("Compare against tier budget")
      expect(agent.prompt).toContain("Guest:400, Pro:500, Ultra:600")
    })

    test("should define section priority for cutting", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("Section Priority")
      expect(agent.prompt).toContain("Legal Framework details")
      expect(agent.prompt).toContain("Detailed evidence lists")
    })

    test("should define sections that must never be cut", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("NEVER CUT")
      expect(agent.prompt).toContain("Verdict + Score")
      expect(agent.prompt).toContain("Poison Pills")
      expect(agent.prompt).toContain("Action Items")
      expect(agent.prompt).toContain("Disclaimer")
    })
  })

  describe("Theme Application", () => {
    test("should define Judicial Authority color palette", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("#0A192F")
      expect(agent.prompt).toContain("#C5A059")
      expect(agent.prompt).toContain("#047857")
      expect(agent.prompt).toContain("#B45309")
      expect(agent.prompt).toContain("#BE123C")
    })

    test("should define typography rules", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("Georgia Bold")
      expect(agent.prompt).toContain("Arial")
      expect(agent.prompt).toContain("Georgia Italic")
    })

    test("should define verdict badges", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("GO (Green")
      expect(agent.prompt).toContain("CAUTION (Amber")
      expect(agent.prompt).toContain("NO-GO (Red")
    })
  })

  describe("Persistence Instructions", () => {
    test("should specify persistence requirements", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("Persistence (MANDATORY)")
      expect(agent.prompt).toContain("Save PII to database")
      expect(agent.prompt).toContain("Save to Knowledge Base")
      expect(agent.prompt).toContain("Save Report Metadata")
    })

    test("should specify report path fields", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("pdf_path")
      expect(agent.prompt).toContain("technical_appendix_path")
      expect(agent.prompt).toContain("is_anonymized")
      expect(agent.prompt).toContain("anonymize_level")
    })
  })
})
