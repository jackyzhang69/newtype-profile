import fs from "node:fs"
import path from "node:path"

const requiredSkills = [
  "immigration-audit-rules",
  "immigration-doc-analysis",
  "immigration-immicore-mcp",
  "immigration-knowledge-injection",
]

export function validateAuditSkills(projectRoot: string = process.cwd()): string[] {
  const errors: string[] = []
  const skillsPath = path.join(projectRoot, ".claude", "skills")

  if (!fs.existsSync(skillsPath)) {
    return [".claude/skills directory not found in project root"]
  }

  for (const skill of requiredSkills) {
    const skillDir = path.join(skillsPath, skill)
    const skillFile = path.join(skillDir, "SKILL.md")
    const manifestFile = path.join(skillDir, "references", "manifest.json")

    if (!fs.existsSync(skillDir)) {
      errors.push(`missing skill directory: ${skill}`)
      continue
    }

    if (!fs.existsSync(skillFile)) {
      errors.push(`missing SKILL.md for: ${skill}`)
    }

    if (!fs.existsSync(manifestFile)) {
      errors.push(`missing references/manifest.json for: ${skill}`)
    }
  }

  return errors
}
