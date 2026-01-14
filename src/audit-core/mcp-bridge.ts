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
      "caselaw": { type: "http", url: `${host}:3105/mcp` },
      "email-kg": { type: "http", url: `${host}:3106/mcp` },
      "operation-manual": { type: "http", url: `${host}:3107/mcp` },
      "noc": { type: "http", url: `${host}:3108/mcp` },
      "help-centre": { type: "http", url: `${host}:3109/mcp` },
      "immi-tools": { type: "http", url: `${host}:3009/mcp` },
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
  const healthyConfigs: Record<string, McpServerConfig> = {}

  for (const [name, config] of Object.entries(configs)) {
    if (await checkMcpHealth(config)) {
      healthyConfigs[name] = config
    }
  }

  return healthyConfigs
}

export function shouldBlockWebFallback(): boolean {
  const transport = getMcpTransport()
  return transport === 'http'
}
