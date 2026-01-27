import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildSearchPolicySection } from "../search/policy"
import { getClaudeConfigDir, parseJsoncSafe } from "../../shared"
import { parseFrontmatter } from "../../shared/frontmatter"
import { getAuditTier, getTierConfig } from "../tiers"

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

function buildSystemIdentitySection(): string {
  try {
    // Load manifest from dist directory (generated at build time)
    const manifestPath = path.join(process.cwd(), "dist", "audit-manifest.json")
    const manifest = readJsonSafe<{
      generated_at: string
      agents: Array<{ name: string; description?: string }>
      workflows: Array<{ id: string; stages: number }>
      summary: { total_agents: number; total_workflows: number }
    }>(manifestPath)

    if (!manifest) {
      return `<System_Identity>
## Self-Awareness: Unable to Load Manifest
Manifest not available. Run 'bun run build' to generate dist/audit-manifest.json
</System_Identity>`
    }

    // Format agents list
    const agentsList = manifest.agents
      .map((agent) => `- **${agent.name}**: ${agent.description || "(no description)"}`)
      .join("\n")

    // Format workflows list
    const workflowsList = manifest.workflows
      .map((wf) => `- **${wf.id}**: ${wf.stages} stages`)
      .join("\n")

    return `<System_Identity>
## Self-Awareness: Complete Capabilities Inventory

Generated: ${manifest.generated_at}

### Agents Under My Control (${manifest.summary.total_agents})
I orchestrate these specialized agents in sequence:

${agentsList}

### Available Workflows (${manifest.summary.total_workflows})
I can execute these workflow definitions:

${workflowsList}

### Key Note
When workflow_next() returns a stage, the stage.agent field tells me which agent to dispatch. I always respect the workflow sequence and never deviate from it.
</System_Identity>`
  } catch (error) {
    return `<System_Identity>
## Self-Awareness: Error Loading Manifest
Error: ${error instanceof Error ? error.message : String(error)}
Fallback: Using hardcoded agent list. Run 'bun run build' to regenerate.
</System_Identity>`
  }
}

function buildTierContextSection(): string {
  const tier = getAuditTier()
  const config = getTierConfig(tier)

  const featuresList = [
    `- KG Search: ${config.features.kgSearch ? "YES" : "NO"}`,
    `- Deep Analysis: ${config.features.deepAnalysis ? "YES" : "NO"}`,
    `- Verifier Agent: ${config.features.verifier ? "YES" : "NO"}`,
    `- Multi-Round Review: ${config.features.multiRound ? "YES" : "NO"}`,
  ].join("\n")

  const limitsList = [
    `- Max Citations: ${config.limits.maxCitations}`,
    `- Max Agent Calls: ${config.limits.maxAgentCalls}`,
    `- Max Verify Iterations: ${config.limits.maxVerifyIterations}`,
  ].join("\n")

  let workflowRules: string
  switch (tier) {
    case "guest":
      workflowRules = `- MUST delegate to Detective, Strategist, Gatekeeper, Verifier (full workflow)
- Use Skill knowledge for quick responses when appropriate
- Limit MCP calls to essential queries only
- Skip KG search (not available)
- If Verifier reports CRITICAL failures, loop back (max ${config.limits.maxVerifyIterations} iteration)
- Focus on correctness within resource constraints`
      break
    case "pro":
      workflowRules = `- MUST delegate to Detective for legal research via MCP
- MUST delegate to Strategist for defense arguments
- MUST delegate to Gatekeeper for compliance check
- MUST delegate to Verifier for citation validation after Gatekeeper
- Use KG for similar case matching
- If Verifier reports CRITICAL failures, loop back (max ${config.limits.maxVerifyIterations} iteration)
- Do NOT attempt to do analysis yourself - ALWAYS delegate to specialized agents`
      break
    case "ultra":
      workflowRules = `- MUST use full agent workflow (Detective → Strategist → Gatekeeper → Verifier)
- MUST delegate to Verifier for citation validation - this is MANDATORY
- MUST perform deep MCP analysis with multiple search iterations
- MUST do multi-round review if issues found
- If Verifier reports CRITICAL failures, loop back (max ${config.limits.maxVerifyIterations} iterations)
- Use KG extensively for case patterns and similar cases
- Do NOT attempt to do analysis yourself - ALWAYS delegate to specialized agents
- Ensure comprehensive coverage with maximum citations`
      break
    default:
      workflowRules = "- Follow standard audit workflow"
  }

  return `<Tier_Context>
## Current Tier: ${tier.toUpperCase()}

### Available Features
${featuresList}

### Limits
${limitsList}

### Workflow Rules for ${tier.toUpperCase()} Tier
${workflowRules}
</Tier_Context>`
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

  // For AuditManager, inject System_Identity at the beginning
  if (agentName === "audit-manager") {
    const systemIdentity = buildSystemIdentitySection()
    // Replace placeholder with actual content
    const updatedBasePrompt = basePrompt.replace(
      /<System_Identity>[\s\S]*?<\/System_Identity>/,
      systemIdentity
    )
    basePrompt = updatedBasePrompt
  }

  const tierContext = buildTierContextSection()
  sections.push(tierContext)

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

  return `${basePrompt}\n\n${sections.join("\n\n")}`
}

export {
  loadInjectionProfile,
  getSkillsForAgent,
  resolveSkillWithDependencies,
  loadSkillReferencesWithDependencies,
}
