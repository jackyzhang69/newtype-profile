import { describe, it, expect } from "bun:test"
import { detectRefusalAnalysis } from "./odn-detector"

describe("ODN Detector", () => {
  // #given: Mock extracted documents
  const mockIMM0276WithODN = {
    filename: "Refusal notes-IMM0276.pdf",
    content: `
IMM 0276 (10-2025)

Decision Date: 2025-12-22

I have reviewed the application. The applicant is applying for the Business Information Technology Management diploma. The applicant has a master of Business Administration. It is not evident why applicant would study this program at such great expense considering applicant already possesses a higher level of qualification. I am not satisfied that this is a reasonable progression of studies.

The applicant has not demonstrated adequate financial capacity to support their studies in Canada.

For the reasons above, I have refused this application.
    `,
    format: "markdown",
  }

  const mockIMM0276NoODN = {
    filename: "IMM0276.pdf",
    content: `
IMM 0276 (08-2024)

Decision Date: 2024-08-15

[No Officer Decision Notes section]
    `,
    format: "markdown",
  }

  const mockRefusalLetterOnly = {
    filename: "refusal_letter.pdf",
    content: `
Your application has been refused.

Please see attached IMM 5621 for details.
    `,
    format: "markdown",
  }

  it("#given IMM 0276 with ODN #when detecting #then extracts ODN content and sets needs_gcms to false", () => {
    // #when
    const result = detectRefusalAnalysis([mockIMM0276WithODN])

    // #then
    expect(result.has_refusal_letter).toBe(true)
    expect(result.has_imm0276).toBe(true)
    expect(result.has_odn).toBe(true)
    expect(result.needs_gcms).toBe(false)
    expect(result.odn_content).toContain("I have reviewed the application")
    expect(result.odn_content).toContain("For the reasons above, I have refused")
    expect(result.refusal_date).toBe("2025-12-22")
    expect(result.imm0276_version).toBe("10-2025")
  })

  it("#given IMM 0276 with ODN #when detecting #then parses officer concerns", () => {
    // #when
    const result = detectRefusalAnalysis([mockIMM0276WithODN])

    // #then
    expect(result.officer_concerns).toBeDefined()
    expect(result.officer_concerns?.length).toBeGreaterThan(0)
    expect(result.officer_concerns?.some(c => c.includes("reasonable progression"))).toBe(true)
    expect(result.officer_concerns?.some(c => c.includes("financial capacity"))).toBe(true)
  })

  it("#given IMM 0276 without ODN #when detecting #then sets needs_gcms to true", () => {
    // #when
    const result = detectRefusalAnalysis([mockIMM0276NoODN])

    // #then
    expect(result.has_refusal_letter).toBe(true)
    expect(result.has_imm0276).toBe(true)
    expect(result.has_odn).toBe(false)
    expect(result.needs_gcms).toBe(true)
    expect(result.odn_content).toBeUndefined()
    expect(result.officer_concerns).toBeUndefined()
  })

  it("#given refusal letter without IMM 0276 #when detecting #then sets needs_gcms to true", () => {
    // #when
    const result = detectRefusalAnalysis([mockRefusalLetterOnly])

    // #then
    expect(result.has_refusal_letter).toBe(true)
    expect(result.has_imm0276).toBe(false)
    expect(result.has_odn).toBe(false)
    expect(result.needs_gcms).toBe(true)
  })

  it("#given no refusal documents #when detecting #then returns no refusal", () => {
    // #given
    const mockOtherDocs = [
      { filename: "passport.pdf", content: "Passport content", format: "markdown" },
      { filename: "transcript.pdf", content: "Transcript content", format: "markdown" },
    ]

    // #when
    const result = detectRefusalAnalysis(mockOtherDocs)

    // #then
    expect(result.has_refusal_letter).toBe(false)
    expect(result.has_imm0276).toBe(false)
    expect(result.has_odn).toBe(false)
    expect(result.needs_gcms).toBe(true) // Default to true when no refusal found
  })

  it("#given IMM 0276 with alternative filename #when detecting #then finds it", () => {
    // #given
    const mockAlternativeFilename = {
      ...mockIMM0276WithODN,
      filename: "imm 0276 refusal notes.pdf",
    }

    // #when
    const result = detectRefusalAnalysis([mockAlternativeFilename])

    // #then
    expect(result.has_imm0276).toBe(true)
    expect(result.has_odn).toBe(true)
  })

  it("#given IMM 0276 with bullet point ODN marker #when detecting #then extracts ODN", () => {
    // #given
    const mockBulletPointODN = {
      filename: "IMM0276.pdf",
      content: `
IMM 0276 (11-2025)

• I have reviewed the application. The applicant's study plan is not convincing.

For the reasons above, I have refused this application.
      `,
      format: "markdown",
    }

    // #when
    const result = detectRefusalAnalysis([mockBulletPointODN])

    // #then
    expect(result.has_odn).toBe(true)
    expect(result.odn_content).toContain("I have reviewed the application")
  })

  it("#given multiple documents including IMM 0276 #when detecting #then finds IMM 0276", () => {
    // #given
    const mockMultipleDocs = [
      { filename: "passport.pdf", content: "Passport", format: "markdown" },
      mockIMM0276WithODN,
      { filename: "transcript.pdf", content: "Transcript", format: "markdown" },
    ]

    // #when
    const result = detectRefusalAnalysis(mockMultipleDocs)

    // #then
    expect(result.has_imm0276).toBe(true)
    expect(result.has_odn).toBe(true)
  })

  it("#given IMM 0276 with incomplete ODN markers #when detecting #then returns no ODN", () => {
    // #given
    const mockIncompleteODN = {
      filename: "IMM0276.pdf",
      content: `
IMM 0276 (10-2025)

I have reviewed the application. The applicant's study plan is not convincing.

[Missing end marker]
      `,
      format: "markdown",
    }

    // #when
    const result = detectRefusalAnalysis([mockIncompleteODN])

    // #then
    expect(result.has_imm0276).toBe(true)
    expect(result.has_odn).toBe(false)
    expect(result.needs_gcms).toBe(true)
  })

  it("#given empty documents array #when detecting #then returns no refusal", () => {
    // #when
    const result = detectRefusalAnalysis([])

    // #then
    expect(result.has_refusal_letter).toBe(false)
    expect(result.has_imm0276).toBe(false)
    expect(result.has_odn).toBe(false)
    expect(result.needs_gcms).toBe(true)
  })
})
