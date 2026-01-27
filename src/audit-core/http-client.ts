export interface HttpClientConfig {
  baseUrl: string
  authToken?: string
  timeout?: number
}

const DEFAULT_TIMEOUT = 60000
const TIMEOUT_ENV_KEY = 'MCP_REQUEST_TIMEOUT'

const SERVICE_TIMEOUTS: Record<string, number> = {
  caselaw: 90000,
  'operation-manual': 60000,
  'help-centre': 45000,
  'email-kg': 45000,
  noc: 45000,
}

function getDefaultTimeout(): number {
  const envTimeout = process.env[TIMEOUT_ENV_KEY]
  if (envTimeout) {
    const parsed = parseInt(envTimeout, 10)
    if (!isNaN(parsed) && parsed > 0) {
      return parsed
    }
  }
  return DEFAULT_TIMEOUT
}

export function getServiceTimeout(serviceName: string): number {
  const envKey = `MCP_${serviceName.toUpperCase().replace(/-/g, '_')}_TIMEOUT`
  const envTimeout = process.env[envKey]
  if (envTimeout) {
    const parsed = parseInt(envTimeout, 10)
    if (!isNaN(parsed) && parsed > 0) {
      return parsed
    }
  }
  return SERVICE_TIMEOUTS[serviceName] ?? getDefaultTimeout()
}

export class AuthenticatedHttpClient {
  private readonly config: HttpClientConfig

  constructor(config: HttpClientConfig) {
    this.config = {
      timeout: config.timeout ?? getDefaultTimeout(),
      ...config,
    }
  }

  private getHeaders(initHeaders?: unknown): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`
    }

    if (initHeaders) {
      if (typeof initHeaders === 'string') {
        Object.assign(headers, this.parseStringHeaders(initHeaders))
      } else if (Array.isArray(initHeaders)) {
        for (const [key, value] of initHeaders) {
          headers[key] = String(value)
        }
      } else if (typeof initHeaders === 'object') {
        for (const [key, value] of Object.entries(initHeaders)) {
          headers[key] = String(value)
        }
      }
    }

    return headers
  }

  private parseStringHeaders(headers: string): Record<string, string> {
    const result: Record<string, string> = {}
    for (const line of headers.split('\n')) {
      const [key, ...values] = line.split(':')
      if (key && values.length > 0) {
        result[key.trim()] = values.join(':').trim()
      }
    }
    return result
  }

  async fetch(url: string, init?: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...init,
        headers: this.getHeaders(init?.headers),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`)
      }

      throw error
    }
  }

  async fetchJson<T = unknown>(path: string, init?: RequestInit): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.config.baseUrl}${path}`
    const response = await this.fetch(url, init)

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText)
      throw new Error(`HTTP ${response.status}: ${text || response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json() as Promise<T>
    }

    throw new Error(`Unexpected content-type: ${contentType}`)
  }

  async healthCheck(path: string = '/health'): Promise<boolean> {
    try {
      const response = await this.fetch(`${this.config.baseUrl}${path}`)
      return response.ok
    } catch {
      return false
    }
  }

  getBaseUrl(): string {
    return this.config.baseUrl
  }

  hasAuth(): boolean {
    return !!this.config.authToken
  }

  getAuthToken(): string | undefined {
    return this.config.authToken
  }
}

function loadEnvFile(): Record<string, string> {
  const env: Record<string, string> = {}
  try {
    const fs = require('fs')
    const path = require('path')
    const os = require('os')
    
    const possiblePaths: string[] = []
    
    if (projectDirectory) {
      possiblePaths.push(path.join(projectDirectory, '.env'))
    }
    
    possiblePaths.push(
      path.join(process.cwd(), '.env'),
      path.join(__dirname, '../../.env'),
      path.join(__dirname, '../../../.env'),
      path.join(os.homedir(), 'immi-os/.env'),
    )
    
    for (const envPath of possiblePaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8')
        for (const line of content.split('\n')) {
          const trimmed = line.trim()
          if (trimmed && !trimmed.startsWith('#')) {
            const eqIndex = trimmed.indexOf('=')
            if (eqIndex > 0) {
              const key = trimmed.slice(0, eqIndex).trim()
              const value = trimmed.slice(eqIndex + 1).trim()
              env[key] = value
            }
          }
        }
        break
      }
    }
  } catch {
  }
  return env
}

export function getEnvVar(key: string): string | undefined {
  if (process.env[key]) {
    return process.env[key]?.trim()
  }
  const envFile = loadEnvFile()
  return envFile[key]?.trim()
}

export function createKgClient(): AuthenticatedHttpClient {
  const baseUrl = getEnvVar('AUDIT_KG_BASE_URL') || 'http://192.168.1.98:3104/api/v1'
  const authToken = getEnvVar('SEARCH_SERVICE_TOKEN')

  return new AuthenticatedHttpClient({ baseUrl, authToken })
}

export function createMcpClient(baseUrl: string): AuthenticatedHttpClient {
  const authToken = getEnvVar('SEARCH_SERVICE_TOKEN')

  return new AuthenticatedHttpClient({ baseUrl, authToken })
}

let kgClientInstance: AuthenticatedHttpClient | null = null
let projectDirectory: string | null = null

export function setProjectDirectory(dir: string): void {
  projectDirectory = dir
  resetKgClient()
}

export function getProjectDirectory(): string | null {
  return projectDirectory
}

export function getKgClient(): AuthenticatedHttpClient {
  if (!kgClientInstance) {
    kgClientInstance = createKgClient()
  }
  return kgClientInstance
}

export function resetKgClient(): void {
  kgClientInstance = null
}
