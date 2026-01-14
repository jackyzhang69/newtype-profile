import { join } from "path"
import { homedir } from "os"

export interface McpServerConfig {
  command?: string
  args?: string[]
  env?: Record<string, string>
  type?: "http"
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
