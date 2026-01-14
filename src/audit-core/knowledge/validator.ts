import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const baseAppsPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "apps"
)

const requiredAgentFiles = [
  "audit-manager.md",
  "detective.md",
  "strategist.md",
  "gatekeeper.md",
]

export function validateAuditKnowledge(): string[] {
  const errors: string[] = []

  if (!fs.existsSync(baseAppsPath)) {
    return ["audit-core apps directory not found"]
  }

  const appDirs = fs
    .readdirSync(baseAppsPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

  for (const appId of appDirs) {
    const agentsPath = path.join(baseAppsPath, appId, "agents")
    const guidesPath = path.join(baseAppsPath, appId, "knowledge", "guides")

    if (!fs.existsSync(agentsPath)) {
      errors.push(`[${appId}] missing agents directory`) 
      continue
    }

    if (!fs.existsSync(guidesPath)) {
      errors.push(`[${appId}] missing knowledge/guides directory`)
      continue
    }

    const agentFiles = fs.readdirSync(agentsPath)
    for (const required of requiredAgentFiles) {
      if (!agentFiles.includes(required)) {
        errors.push(`[${appId}] missing agents/${required}`)
      }
    }

    const guideFiles = fs.readdirSync(guidesPath).filter((name) => name.endsWith(".md"))
    if (guideFiles.length === 0) {
      errors.push(`[${appId}] knowledge/guides is empty`)
    }
  }

  return errors
}
