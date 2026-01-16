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
  depends_on?: string[]
}

interface InjectionProfileSkill {
  description: string
  inject_to: string[]
  priority: number
  files?: string[]
}

interface InjectionProfile {
  version: string
  description: string
  skills: Record<string, InjectionProfileSkill>
  injection_order: string[]
}

type SkillFrontmatter = {
  name?: string
}

function readJsonSafe<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null
  }
  const content = fs.readFileSync(filePath, "utf-8")
  const { data } = parseJsoncSafe<T>(content)
  return data ?? null
}

function readFileSafe(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return ""
  }
  return fs.readFileSync(filePath, "utf-8")
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

function loadSkillManifest(skillName: string): SkillReferencesManifest | null {
  const skillDir = resolveSkillDir(skillName)
  if (!skillDir) return null
  
  const manifestPath = path.join(skillDir, "references", "manifest.json")
  return readJsonSafe<SkillReferencesManifest>(manifestPath)
}

function resolveSkillWithDependencies(
  skillName: string,
  visited: Set<string> = new Set(),
  visiting: Set<string> = new Set()
): string[] {
  if (visiting.has(skillName)) {
    console.warn(`[skill-loader] Circular dependency detected: ${skillName}`)
    return []
  }
  
  if (visited.has(skillName)) {
    return []
  }
  
  visiting.add(skillName)
  const result: string[] = []
  
  const manifest = loadSkillManifest(skillName)
  if (manifest?.depends_on) {
    for (const dep of manifest.depends_on) {
      result.push(...resolveSkillWithDependencies(dep, visited, visiting))
    }
  }
  
  visiting.delete(skillName)
  visited.add(skillName)
  result.push(skillName)
  
  return result
}

function loadInjectionProfile(appId: string): InjectionProfile | null {
  const skillName = `${appId}-knowledge-injection`
  const skillDir = resolveSkillDir(skillName)
  if (!skillDir) return null
  
  const profilePath = path.join(skillDir, "references", "injection_profile.json")
  return readJsonSafe<InjectionProfile>(profilePath)
}

function getSkillsForAgent(profile: InjectionProfile, agentName: string): string[] {
  const matchingSkills: Array<{ name: string; priority: number }> = []
  
  for (const [skillName, config] of Object.entries(profile.skills)) {
    if (config.inject_to.includes(agentName)) {
      matchingSkills.push({ name: skillName, priority: config.priority })
    }
  }
  
  matchingSkills.sort((a, b) => a.priority - b.priority)
  
  return matchingSkills.map(s => s.name)
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

function loadSkillReferencesWithDependencies(skillNames: string[]): string {
  const visited = new Set<string>()
  const allSkills: string[] = []
  
  for (const skillName of skillNames) {
    const resolved = resolveSkillWithDependencies(skillName, visited)
    allSkills.push(...resolved)
  }
  
  const uniqueSkills = [...new Set(allSkills)]
  
  const contents = uniqueSkills
    .map((skillName) => loadSkillReferences(skillName))
    .filter((text) => text.trim().length > 0)

  return contents.join("\n\n")
}

export function getAuditAppId(): string {
  return process.env.AUDIT_APP?.trim() || "spousal"
}

export function loadAuditAgentPrompt(appId: string, agentName: string): string {
  const promptPath = path.join(baseAppsPath, appId, "agents", `${agentName}.md`)
  return readFileSafe(promptPath)
}

export function buildAuditPrompt(
  basePrompt: string,
  appId: string,
  agentName: string,
  explicitSkills: string[] = []
): string {
  const profile = loadInjectionProfile(appId)
  
  let skillNames: string[]
  if (profile) {
    const autoSkills = getSkillsForAgent(profile, agentName)
    skillNames = [...new Set([...autoSkills, ...explicitSkills])]
  } else {
    skillNames = explicitSkills
  }
  
  const skillReferences = loadSkillReferencesWithDependencies(skillNames).trim()
  
  const agentPrompt = loadAuditAgentPrompt(appId, agentName).trim()
  
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

export {
  loadInjectionProfile,
  getSkillsForAgent,
  resolveSkillWithDependencies,
  loadSkillReferencesWithDependencies,
}
