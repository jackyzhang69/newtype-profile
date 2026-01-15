import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildSearchPolicySection } from "../search/policy"
import { getClaudeConfigDir, parseJsoncSafe } from "../../shared"
import { parseFrontmatter } from "../../shared/frontmatter"

const baseAppsPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "apps"
)

type SkillReferenceEntry = {
  file?: string
  path?: string
}

type SkillReferencesManifest = {
  references?: Array<string | SkillReferenceEntry>
}

function readJsonSafe<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null
  }
  const content = fs.readFileSync(filePath, "utf-8")
  const { data } = parseJsoncSafe<T>(content)
  return data ?? null
}

type SkillFrontmatter = {
  name?: string
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

function resolveSkillDir(skillName: string): string | null {
  const projectSkillsRoot = path.join(process.cwd(), ".claude", "skills")
  const userSkillsRoot = path.join(getClaudeConfigDir(), "skills")
  const hasProjectSkills = fs.existsSync(projectSkillsRoot)

  const projectMatch = resolveSkillDirByName(projectSkillsRoot, skillName)
  if (projectMatch) {
    return projectMatch
  }

  if (hasProjectSkills) {
    return null
  }

  return resolveSkillDirByName(userSkillsRoot, skillName)
}

function resolveReferenceFile(ref: string | SkillReferenceEntry): string | null {
  if (typeof ref === "string") {
    return ref.trim() || null
  }

  if (ref && typeof ref === "object") {
    if (typeof ref.file === "string" && ref.file.trim()) {
      return ref.file.trim()
    }
    if (typeof ref.path === "string" && ref.path.trim()) {
      return ref.path.trim()
    }
  }

  return null
}

function loadSkillReferences(skillName: string): string {
  const skillDir = resolveSkillDir(skillName)
  if (!skillDir) {
    return ""
  }

  const referencesDir = path.join(skillDir, "references")
  const manifestPath = path.join(referencesDir, "manifest.json")
  const manifest = readJsonSafe<SkillReferencesManifest>(manifestPath)
  const references = Array.isArray(manifest?.references)
    ? manifest.references
        .map((ref) => resolveReferenceFile(ref))
        .filter((ref): ref is string => Boolean(ref))
    : []

  if (references.length === 0) {
    return ""
  }

  const contents = references
    .map((ref) => readFileSafe(path.join(referencesDir, ref)))
    .filter((text) => text.trim().length > 0)

  return contents.join("\n\n")
}

function loadSkillReferencesForSkills(skillNames: string[]): string {
  const contents = skillNames
    .map((skillName) => loadSkillReferences(skillName))
    .filter((text) => text.trim().length > 0)

  return contents.join("\n\n")
}

export function getAuditAppId(): string {
  return process.env.AUDIT_APP?.trim() || "spousal"
}

function readFileSafe(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return ""
  }
  return fs.readFileSync(filePath, "utf-8")
}

export function loadAuditAgentPrompt(appId: string, agentName: string): string {
  const promptPath = path.join(baseAppsPath, appId, "agents", `${agentName}.md`)
  return readFileSafe(promptPath)
}

export function buildAuditPrompt(
  basePrompt: string,
  appId: string,
  agentName: string,
  skillNames: string[] = []
): string {
  const agentPrompt = loadAuditAgentPrompt(appId, agentName).trim()
  const skillReferences = loadSkillReferencesForSkills(skillNames).trim()
  const sections: string[] = []

  if (agentPrompt) {
    sections.push(`<Business_Context>\n${agentPrompt}\n</Business_Context>`)
  }

  if (skillReferences) {
    sections.push(`<Skill_References>\n${skillReferences}\n</Skill_References>`)
  }


  const searchPolicy = buildSearchPolicySection().trim()
  if (searchPolicy) {
    sections.push(searchPolicy)
  }

  if (sections.length === 0) {
    return basePrompt
  }

  return `${basePrompt}\n\n${sections.join("\n\n")}`
}
