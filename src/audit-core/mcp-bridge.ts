import { join } from "path"
import { homedir } from "os"
import { createMcpClient } from "./http-client"

export interface McpServerConfig {
  command?: string
  args?: string[]
  env?: Record<string, string>
  type?: "http" | "stdio"
  url?: string
}

export function getImmicorePath(): string {
  if (process.env.IMMICORE_PATH) {
    return process.env.IMMICORE_PATH
  }
  return join(homedir(), "immicore")
}

function getMcpTransport(): "http" | "stdio" {
  const transport = process.env.AUDIT_MCP_TRANSPORT?.trim().toLowerCase()
  return transport === "http" ? "http" : "stdio"
}

function getMcpHost(): string {
  return process.env.AUDIT_MCP_HOST?.trim() || "http://localhost"
}

export function getImmicoreMcpConfigs(): Record<string, McpServerConfig> {
  const transport = getMcpTransport()
  if (transport === "http") {
    const host = getMcpHost()
    return {
      // Services are exposed through nginx proxy at /mcp/{service-name}
      "caselaw": { type: "http", url: `${host}/mcp/caselaw` },
      "email-kg": { type: "http", url: `${host}/mcp/email-kg` },
      "operation-manual": { type: "http", url: `${host}/mcp/operation-manual` },
      "noc": { type: "http", url: `${host}/mcp/noc` },
      "help-centre": { type: "http", url: `${host}/mcp/help-centre` },
      // Note: immi-tools not in nginx config, might not be available
    }
  }

  const immicorePath = getImmicorePath()
  const mcpServersPath = join(immicorePath, "mcp-servers")

  const stdioEnv: Record<string, string> = {}
  if (process.env.HOST_URL) {
    stdioEnv.HOST_URL = process.env.HOST_URL
  }
  if (process.env.SEARCH_SERVICE_TOKEN) {
    stdioEnv.SEARCH_SERVICE_TOKEN = process.env.SEARCH_SERVICE_TOKEN
  }

  return {
    "caselaw": {
      command: join(mcpServersPath, "caselaw", "node_modules", ".bin", "tsx"),
      args: [join(mcpServersPath, "caselaw", "src", "index.ts"), "--stdio"],
      env: stdioEnv
    },
    "operation-manual": {
      command: join(mcpServersPath, "operation-manual", "node_modules", ".bin", "tsx"),
      args: [join(mcpServersPath, "operation-manual", "src", "index.ts"), "--stdio"],
      env: stdioEnv
    }
  }
}

export async function checkMcpHealth(config: McpServerConfig): Promise<boolean> {
  if (config.type !== 'http' || !config.url) return true

  try {
    const client = createMcpClient(config.url)
    return await client.healthCheck()
  } catch {
    return false
  }
}

export async function getHealthyMcpConfigs(): Promise<Record<string, McpServerConfig>> {
  const configs = getImmicoreMcpConfigs()

  // Run health checks in parallel to avoid sequential timeouts
  const healthChecks = await Promise.all(
    Object.entries(configs).map(async ([name, config]) => {
      const isHealthy = await checkMcpHealth(config)
      return { name, config, isHealthy }
    })
  )

  // Collect healthy configs
  const healthyConfigs: Record<string, McpServerConfig> = {}
  for (const { name, config, isHealthy } of healthChecks) {
    if (isHealthy) {
      healthyConfigs[name] = config
    }
  }

  return healthyConfigs
}

export function shouldBlockWebFallback(): boolean {
  const transport = getMcpTransport()
  return transport === 'http'
}
