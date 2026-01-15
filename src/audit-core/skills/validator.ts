import fs from "node:fs"
import path from "node:path"
import { parseJsoncSafe } from "../../shared"
import { parseFrontmatter } from "../../shared/frontmatter"

function getAuditAppId(): string {
  return process.env.AUDIT_APP?.trim() || "spousal"
}

function getCoreSkillNames(): string[] {
  return [
    "core-audit-rules",
    "core-doc-analysis",
    "core-immicore-mcp",
    "core-knowledge-injection",
  ]
}

function getAuditSkillNames(appId: string): string[] {
  const prefix = appId
  return [
    `${prefix}-audit-rules`,
    `${prefix}-doc-analysis`,
    `${prefix}-knowledge-injection`,
  ]
}

type SkillReferencesManifest = {
  references?: unknown[]
}

type SkillFrontmatter = {
  name?: string
}

function hasReferenceEntries(manifestFile: string): boolean {
  if (!fs.existsSync(manifestFile)) {
    return false
  }

  const content = fs.readFileSync(manifestFile, "utf-8")
  const { data } = parseJsoncSafe<SkillReferencesManifest>(content)
  if (!data || !Array.isArray(data.references)) {
    return false
  }

  return data.references.length > 0
}

function resolveSkillDirByName(skillsRoot: string, skillName: string): string | null {
  if (!fs.existsSync(skillsRoot)) {
    return null
  }

  const entries = fs.readdirSync(skillsRoot, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue

    const entryPath = path.join(skillsRoot, entry.name)
    const skillFile = path.join(entryPath, "SKILL.md")
    if (!fs.existsSync(skillFile)) continue

    const content = fs.readFileSync(skillFile, "utf-8")
    const { data, parseError } = parseFrontmatter<SkillFrontmatter>(content)
    if (parseError) continue

    const resolvedName = data.name || entry.name
    if (resolvedName === skillName) {
      return entryPath
    }
  }

  return null
}

export function validateAuditSkills(projectRoot: string = process.cwd()): string[] {
  const errors: string[] = []
  const skillsPath = path.join(projectRoot, ".claude", "skills")

  if (!fs.existsSync(skillsPath)) {
    return [".claude/skills directory not found in project root"]
  }

  const requiredSkills = [
    ...getCoreSkillNames(),
    ...getAuditSkillNames(getAuditAppId()),
  ]
  for (const skill of requiredSkills) {
    const skillDir = resolveSkillDirByName(skillsPath, skill)
    if (!skillDir) {
      errors.push(`missing skill directory: ${skill}`)
      continue
    }

    const skillFile = path.join(skillDir, "SKILL.md")
    const manifestFile = path.join(skillDir, "references", "manifest.json")

    if (!fs.existsSync(skillFile)) {
      errors.push(`missing SKILL.md for: ${skill}`)
    }

    if (!fs.existsSync(manifestFile)) {
      errors.push(`missing references/manifest.json for: ${skill}`)
    } else if (!hasReferenceEntries(manifestFile)) {
      errors.push(`empty references/manifest.json for: ${skill}`)
    }
  }

  return errors
}
