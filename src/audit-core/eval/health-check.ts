import fs from "node:fs"
import path from "node:path"

function getKgBaseUrl(): string {
  return process.env.AUDIT_KG_BASE_URL?.trim() || "http://192.168.1.98:3104/api/v1"
}

async function checkKg(): Promise<string | null> {
  const baseUrl = getKgBaseUrl()
  const authToken = process.env.SEARCH_SERVICE_TOKEN?.trim()

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`
  }

  try {
    const response = await fetch(`${baseUrl}/kg/search`, {
      method: "POST",
      headers,
      body: JSON.stringify({ limit: 1 }),
    })
    if (!response.ok) {
      return `KG health check failed: ${response.status}`
    }
    return null
  } catch (error) {
    return `KG health check error: ${error instanceof Error ? error.message : String(error)}`
  }
}

function checkImmicorePath(): string | null {
  const immicorePath = process.env.IMMICORE_PATH || path.join(process.env.HOME || "", "immicore")
  const mcpPath = path.join(immicorePath, "mcp-servers")
  if (!fs.existsSync(mcpPath)) {
    return `Immicore MCP path not found: ${mcpPath}`
  }
  return null
}

async function checkMcpHttp(): Promise<string | null> {
  const host = process.env.AUDIT_MCP_HOST || "http://192.168.1.98"
  const ports = [3105, 3106, 3107, 3108, 3109, 3009]
  for (const port of ports) {
    try {
      const response = await fetch(`${host}:${port}/health`)
      if (!response.ok) {
        return `MCP health check failed at ${host}:${port}`
      }
    } catch (error) {
      return `MCP health check error at ${host}:${port}: ${error instanceof Error ? error.message : String(error)}`
    }
  }
  return null
}

export async function runHealthChecks(): Promise<string[]> {
  const issues: string[] = []
  const transport = process.env.AUDIT_MCP_TRANSPORT || "stdio"
  if (transport === "http") {
    const mcpHttpIssue = await checkMcpHttp()
    if (mcpHttpIssue) issues.push(mcpHttpIssue)
  } else {
    const mcpIssue = checkImmicorePath()
    if (mcpIssue) issues.push(mcpIssue)
  }

  const kgIssue = await checkKg()
  if (kgIssue) issues.push(kgIssue)

  return issues
}

if (import.meta.main) {
  runHealthChecks().then((issues) => {
    if (issues.length > 0) {
      console.error("Health check failed")
      for (const issue of issues) console.error(issue)
      process.exit(1)
    }
    console.log("Health check passed")
  })
}
