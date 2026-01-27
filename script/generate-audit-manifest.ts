/**
 * Generate audit manifest from agents and workflows
 * This script is run during build to auto-generate the agents/workflows list
 * Used by AuditManager to know its own capabilities
 */

import { readdirSync, readFileSync } from "fs"
import { join } from "path"

const PROJECT_ROOT = import.meta.dir + "/.."

interface AgentInfo {
  name: string
  file: string
  description?: string
}

interface WorkflowInfo {
  id: string
  file: string
  stages: number
}

interface AuditManifest {
  generated_at: string
  agents: AgentInfo[]
  workflows: WorkflowInfo[]
  summary: {
    total_agents: number
    total_workflows: number
  }
}

// Scan agents directory
function scanAgents(): AgentInfo[] {
  const agentsDir = join(PROJECT_ROOT, "src/audit-core/agents")
  const files = readdirSync(agentsDir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))

  return files.map((file) => {
    const name = file.replace(".ts", "")
    const agentNameMap: Record<string, string> = {
      intake: "Intake - 案件接收和文档提取",
      "audit-manager": "AuditManager - 编排和协调",
      detective: "Detective - 法律研究",
      strategist: "Strategist - 风险评估和策略",
      gatekeeper: "Gatekeeper - 合规检查",
      verifier: "Verifier - 引用验证",
      judge: "Judge - 最终判决",
      reporter: "Reporter - 报告生成",
    }

    return {
      name,
      file,
      description: agentNameMap[name],
    }
  })
}

// Scan workflows directory
function scanWorkflows(): WorkflowInfo[] {
  const workflowsDir = join(PROJECT_ROOT, "src/audit-core/workflow/defs")
  const files = readdirSync(workflowsDir).filter((f) => f.endsWith(".json"))

  return files.map((file) => {
    const id = file.replace(".json", "")
    const filePath = join(workflowsDir, file)
    const content = readFileSync(filePath, "utf-8")
    const data = JSON.parse(content)
    const stages = data.stages ? data.stages.length : 0

    return {
      id,
      file,
      stages,
    }
  })
}

// Generate manifest
function generateManifest(): AuditManifest {
  const agents = scanAgents()
  const workflows = scanWorkflows()

  return {
    generated_at: new Date().toISOString(),
    agents: agents.sort((a, b) => a.name.localeCompare(b.name)),
    workflows: workflows.sort((a, b) => a.id.localeCompare(b.id)),
    summary: {
      total_agents: agents.length,
      total_workflows: workflows.length,
    },
  }
}

// Write manifest
async function writeManifest() {
  const manifest = generateManifest()
  const distDir = join(PROJECT_ROOT, "dist")

  // Ensure dist directory exists
  const distPath = Bun.file(distDir)
  if (!distPath.exists()) {
    console.log(`Creating ${distDir}`)
  }

  const manifestPath = join(distDir, "audit-manifest.json")
  await Bun.write(manifestPath, JSON.stringify(manifest, null, 2))

  console.log(`✓ Generated audit manifest: ${manifestPath}`)
  console.log(`  - Agents: ${manifest.summary.total_agents}`)
  console.log(`  - Workflows: ${manifest.summary.total_workflows}`)

  return manifest
}

// Run if executed directly
if (import.meta.main) {
  await writeManifest()
}

export { generateManifest, writeManifest, AgentInfo, WorkflowInfo, AuditManifest }
