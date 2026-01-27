import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { writeFileSync, mkdirSync, rmSync } from "fs"
import { join } from "path"
import { documentFulltextRead } from "../../tools/document-fulltext"

describe("Judge Document Verification Protocol", () => {
  const testSessionId = "test-judge-verification"
  const testDir = join(process.cwd(), "tmp", testSessionId)
  const extractedDocsPath = join(testDir, "extracted_docs.json")

  beforeAll(() => {
    mkdirSync(testDir, { recursive: true })

    const mockExtractedDocs = {
      documents: [
        {
          filename: "Study Plan.pdf",
          content: `# Study Plan for Zhang Haocheng

## Introduction
I have the intention to immigrate to Canada after completing my studies.

## Academic Goals
I plan to pursue a Diploma in Business Administration at XYZ College.

## Career Progression
After graduation, I intend to return to China to apply my skills in my family business.

## Exit Strategy and Compliance
I understand that my study permit is temporary. I will comply with all visa conditions and return to China if my permanent residence application is not successful. I have strong family ties in China and significant business interests that require my presence.

## Conclusion
This program will enhance my skills for both Canadian and Chinese markets.`,
          metadata: {
            char_count: 650,
            page_count: 2,
          },
          format: "markdown",
        },
        {
          filename: "IMM0008.pdf",
          content: "Generic Application Form for Canada...",
          metadata: {
            char_count: 100,
            page_count: 1,
          },
          format: "text",
        },
      ],
    }

    writeFileSync(extractedDocsPath, JSON.stringify(mockExtractedDocs, null, 2))
  })

  afterAll(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  test("documentFulltextRead tool can retrieve complete document text", async () => {
    const resultStr = await documentFulltextRead.execute({
      session_id: testSessionId,
      filename: "Study Plan.pdf",
      reason: "Verify dual intent with exit strategy",
    })

    const result = JSON.parse(resultStr)

    expect(result.success).toBe(true)
    expect(result.full_text).toContain("I have the intention to immigrate to Canada")
    expect(result.full_text).toContain("Exit Strategy and Compliance")
    expect(result.full_text).toContain("I will comply with all visa conditions")
    expect(result.full_text).toContain("return to China if my permanent residence application is not successful")
    expect(result.metadata.char_count).toBe(650)
  })

  test("documentFulltextRead handles missing file gracefully", async () => {
    const resultStr = await documentFulltextRead.execute({
      session_id: testSessionId,
      filename: "NonExistent.pdf",
      reason: "Test error handling",
    })

    const result = JSON.parse(resultStr)

    expect(result.success).toBe(false)
    expect(result.error).toContain("not found")
  })

  test("documentFulltextRead handles missing session gracefully", async () => {
    const resultStr = await documentFulltextRead.execute({
      session_id: "non-existent-session",
      filename: "Study Plan.pdf",
      reason: "Test error handling",
    })

    const result = JSON.parse(resultStr)

    expect(result.success).toBe(false)
    expect(result.error).toContain("not found")
  })

  test("Judge can detect dual intent WITH exit strategy from full text", async () => {
    const resultStr = await documentFulltextRead.execute({
      session_id: testSessionId,
      filename: "Study Plan.pdf",
      reason: "Verify dual intent context",
    })

    const result = JSON.parse(resultStr)
    const fullText = result.full_text || ""
    const hasDualIntentStatement = fullText.includes("intention to immigrate")
    const hasExitStrategy = fullText.includes("Exit Strategy") || fullText.includes("return to China")
    const hasComplianceCommitment = fullText.includes("comply with all visa conditions")

    expect(hasDualIntentStatement).toBe(true)
    expect(hasExitStrategy).toBe(true)
    expect(hasComplianceCommitment).toBe(true)

    const shouldBeCritical = hasDualIntentStatement && !hasExitStrategy
    const shouldBeMedium = hasDualIntentStatement && hasExitStrategy && hasComplianceCommitment

    expect(shouldBeCritical).toBe(false)
    expect(shouldBeMedium).toBe(true)
  })

  test("Judge verification protocol: summary vs full text comparison", async () => {
    const summaryFromCaseProfile = "I have the intention to immigrate to Canada after completing my studies."

    const resultStr = await documentFulltextRead.execute({
      session_id: testSessionId,
      filename: "Study Plan.pdf",
      reason: "Verify complete context for dual intent",
    })

    const result = JSON.parse(resultStr)
    const fullText = result.full_text || ""

    expect(summaryFromCaseProfile).not.toContain("Exit Strategy")
    expect(summaryFromCaseProfile).not.toContain("comply with all visa conditions")
    expect(summaryFromCaseProfile).not.toContain("return to China")

    expect(fullText).toContain("Exit Strategy")
    expect(fullText).toContain("comply with all visa conditions")
    expect(fullText).toContain("return to China")

    const summaryAloneWouldTriggerCritical = summaryFromCaseProfile.includes("intention to immigrate")
    const fullTextShowsAcceptableContext = fullText.includes("Exit Strategy") && fullText.includes("comply")

    expect(summaryAloneWouldTriggerCritical).toBe(true)
    expect(fullTextShowsAcceptableContext).toBe(true)
  })
})
