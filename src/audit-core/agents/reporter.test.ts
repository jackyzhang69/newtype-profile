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
    test("should define tier variations for templates", () => {
      const agent = createReporterAgent()
      
      // Tier variations are defined in template selection
      expect(agent.prompt).toContain("GUEST (Max 400 lines)")
      expect(agent.prompt).toContain("PRO (Max 500 lines)")
      expect(agent.prompt).toContain("ULTRA (Max 600 lines)")
    })

    test("should define Initial Assessment / Risk Audit templates", () => {
      const agent = createReporterAgent()
      
      // Initial Assessment uses JSON template
      expect(agent.prompt).toContain("INITIAL ASSESSMENT / RISK AUDIT TEMPLATES")
      expect(agent.prompt).toContain("initial_assessment_pro_template.json")
    })

    test("should define Final Review templates", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("FINAL REVIEW TEMPLATES")
      expect(agent.prompt).toContain("final_review_pro_template.json")
      expect(agent.prompt).toContain("APPROVE | REVISE")
    })

    test("should define Refusal Analysis templates", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("REFUSAL ANALYSIS TEMPLATES")
      expect(agent.prompt).toContain("refusal_analysis_pro_template.json")
      expect(agent.prompt).toContain("APPEAL | REAPPLY | ABANDON")
    })
  })

  describe("Mandatory JSON Templates", () => {
    test("should require JSON template files for all workflows", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("MANDATORY: Use JSON Template Files")
      expect(agent.prompt).toContain("Follow the EXACT section order defined in the template")
    })

    test("should list template files by workflow", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("initial_assessment_pro_template.json")
      expect(agent.prompt).toContain("final_review_pro_template.json")
      expect(agent.prompt).toContain("refusal_analysis_pro_template.json")
    })

    test("should define critical rules for all workflows", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("Disclaimer appears ONCE at the beginning only")
      expect(agent.prompt).toContain("Case info appears ONCE as \"CASE SNAPSHOT\"")
      expect(agent.prompt).toContain("NO emojis - use [CRITICAL], [HIGH], [MEDIUM], [LOW]")
    })
  })

  describe("Technical Appendix (Ultra Only)", () => {
    test("should define technical appendix for Ultra tier", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("technical_appendix.pdf")
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

    test("should specify executive summary is integrated", () => {
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

  describe("Disclaimer Reference", () => {
    test("should reference disclaimer from core-reporter skill", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("core-reporter/references/disclaimer.md")
      expect(agent.prompt).toContain("SINGLE SOURCE OF TRUTH")
    })

    test("should mark disclaimer as non-negotiable", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("NON-NEGOTIABLE")
      expect(agent.prompt).toContain("never omit the disclaimer")
    })

    test("should specify disclaimer appears once at beginning", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("Disclaimer appears ONCE at the beginning")
      expect(agent.prompt).toContain("Do NOT add a second disclaimer at the end")
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
    })

    test("should define what to extract from Verifier", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("From Verifier")
      expect(agent.prompt).toContain("Summary counts")
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
    })

    test("should specify report path fields", () => {
      const agent = createReporterAgent()
      
      expect(agent.prompt).toContain("pdf_path")
      expect(agent.prompt).toContain("technical_appendix_path")
      expect(agent.prompt).toContain("is_anonymized")
    })
  })
})
