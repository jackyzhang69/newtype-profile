import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildSearchPolicySection } from "../search/policy"

const baseAppsPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "apps"
)

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

export function listAuditGuides(appId: string): string[] {
  const guidesPath = path.join(baseAppsPath, appId, "knowledge", "guides")
  if (!fs.existsSync(guidesPath)) {
    return []
  }
  return fs
    .readdirSync(guidesPath)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""))
}

export function loadAuditGuides(appId: string, guideNames: string[]): string {
  const guidesPath = path.join(baseAppsPath, appId, "knowledge", "guides")
  const contents = guideNames
    .map((name) => readFileSafe(path.join(guidesPath, `${name}.md`)))
    .filter((text) => text.trim().length > 0)
  return contents.join("\n\n")
}

export function buildAuditPrompt(
  basePrompt: string,
  appId: string,
  agentName: string,
  guideNames: string[]
): string {
  const agentPrompt = loadAuditAgentPrompt(appId, agentName).trim()
  const guides = loadAuditGuides(appId, guideNames).trim()
  const sections: string[] = []

  if (agentPrompt) {
    sections.push(`<Business_Context>\n${agentPrompt}\n</Business_Context>`)
  }

  if (guides) {
    sections.push(`<Reference_Guides>\n${guides}\n</Reference_Guides>`)
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
