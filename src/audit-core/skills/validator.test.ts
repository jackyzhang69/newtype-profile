import { describe, it, expect } from "bun:test"
import fs from "node:fs"
import path from "node:path"
import { tmpdir } from "node:os"
import { validateAuditSkills } from "./validator"

function createSkill(root: string, dirName: string, skillName: string): void {
  const skillDir = path.join(root, ".claude", "skills", dirName)
  const referencesDir = path.join(skillDir, "references")
  fs.mkdirSync(referencesDir, { recursive: true })
  fs.writeFileSync(
    path.join(skillDir, "SKILL.md"),
    `---\nname: ${skillName}\n---\nSkill body`
  )
  fs.writeFileSync(path.join(referencesDir, "baseline.md"), "baseline")
  fs.writeFileSync(
    path.join(referencesDir, "manifest.json"),
    JSON.stringify({ references: ["baseline.md"] })
  )
}

describe("validateAuditSkills", () => {
  it("should validate spousal skills", () => {
    // #given: spousal skills in project
    const cwd = process.cwd()
    const previousApp = process.env.AUDIT_APP
    const tempDir = fs.mkdtempSync(path.join(tmpdir(), "audit-skills-"))
    process.env.AUDIT_APP = "spousal"

    createSkill(tempDir, "spousal-audit-rules", "spousal-audit-rules")
    createSkill(tempDir, "spousal-doc-analysis", "spousal-doc-analysis")
    createSkill(tempDir, "spousal-immicore-mcp", "spousal-immicore-mcp")
    createSkill(tempDir, "spousal-knowledge-injection", "spousal-knowledge-injection")

    // #when: validating skills
    process.chdir(tempDir)
    try {
      const result = validateAuditSkills(tempDir)

      // #then: no errors
      expect(result).toEqual([])
    } finally {
      process.chdir(cwd)
      process.env.AUDIT_APP = previousApp
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it("should validate study skills", () => {
    // #given: study skills in project
    const cwd = process.cwd()
    const previousApp = process.env.AUDIT_APP
    const tempDir = fs.mkdtempSync(path.join(tmpdir(), "audit-skills-"))
    process.env.AUDIT_APP = "study"

    createSkill(tempDir, "study-audit-rules", "study-audit-rules")
    createSkill(tempDir, "study-doc-analysis", "study-doc-analysis")
    createSkill(tempDir, "study-immicore-mcp", "study-immicore-mcp")
    createSkill(tempDir, "study-knowledge-injection", "study-knowledge-injection")

    // #when: validating skills
    process.chdir(tempDir)
    try {
      const result = validateAuditSkills(tempDir)

      // #then: no errors
      expect(result).toEqual([])
    } finally {
      process.chdir(cwd)
      process.env.AUDIT_APP = previousApp
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
