import { createKgClient, AuthenticatedHttpClient, getEnvVar } from '../../audit-core/http-client'

export async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const kgClient = createKgClient()
  
  if (url.startsWith('http')) {
    const client = new AuthenticatedHttpClient({
      baseUrl: '',
      authToken: kgClient.getAuthToken(),
    })
    return client.fetchJson(url, init)
  }

  return kgClient.fetchJson(url, init)
}

const MCP_SERVICES = ['caselaw', 'operation-manual', 'help-centre', 'noc', 'email-kg'] as const
type McpService = typeof MCP_SERVICES[number]

function getMcpBaseUrl(): string {
  return getEnvVar('AUDIT_MCP_BASE_URL') || getEnvVar('AUDIT_KG_BASE_URL')?.replace('/api/v1', '') || 'https://es_search.jackyzhang.app'
}

export async function mcpCall(service: string, method: string, params?: Record<string, unknown>): Promise<unknown> {
  const baseUrl = getMcpBaseUrl()
  const authToken = getEnvVar('SEARCH_SERVICE_TOKEN')
  
  const response = await fetch(`${baseUrl}/mcp/${service}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params: params || {},
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText)
    throw new Error(`MCP call failed: HTTP ${response.status}: ${text}`)
  }

  const json = await response.json() as { result?: unknown; error?: { message: string } }
  if (json.error) {
    throw new Error(`MCP error: ${json.error.message}`)
  }
  return json.result
}

export function getAvailableMcpServices(): string[] {
  return [...MCP_SERVICES]
}
