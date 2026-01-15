import { describe, it, expect } from "bun:test"
import fs from "node:fs"
import path from "node:path"
import { tmpdir } from "node:os"
import { buildAuditPrompt } from "./loader"

describe("buildAuditPrompt", () => {
  it("should include skill references when available", () => {
    // #given: skill references with baseline content
    const cwd = process.cwd()
    const tempDir = fs.mkdtempSync(path.join(tmpdir(), "audit-knowledge-"))
    const skillDir = path.join(
      tempDir,
      ".claude",
      "skills",
      "spousal-knowledge-injection"
    )
    const referencesDir = path.join(skillDir, "references")
    fs.mkdirSync(referencesDir, { recursive: true })
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      "---\nname: spousal-knowledge-injection\n---\nSkill body"
    )
    fs.writeFileSync(
      path.join(referencesDir, "baseline_guides.md"),
      "Baseline Guide Content"
    )
    fs.writeFileSync(
      path.join(referencesDir, "manifest.json"),
      JSON.stringify({ references: ["baseline_guides.md"] })
    )

    // #when: building prompt with skill references
    process.chdir(tempDir)
    try {
      const result = buildAuditPrompt(
        "Base Prompt",
        "spousal",
        "detective",
        ["spousal-knowledge-injection"]
      )

      // #then: skill references are injected into prompt
      expect(result).toContain("<Skill_References>")
      expect(result).toContain("Baseline Guide Content")
      expect(result).not.toContain("<Reference_Guides>")
    } finally {
      process.chdir(cwd)
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
