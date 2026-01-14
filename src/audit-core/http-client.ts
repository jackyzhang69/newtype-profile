export interface HttpClientConfig {
  baseUrl: string
  authToken?: string
  timeout?: number
}

export class AuthenticatedHttpClient {
  private readonly config: HttpClientConfig

  constructor(config: HttpClientConfig) {
    this.config = {
      timeout: 30000,
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

  async fetchJson<T = unknown>(url: string, init?: RequestInit): Promise<T> {
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
}

export function createKgClient(): AuthenticatedHttpClient {
  const baseUrl = process.env.AUDIT_KG_BASE_URL?.trim() || 'http://localhost:3104/api/v1'
  const authToken = process.env.SEARCH_SERVICE_TOKEN?.trim()

  return new AuthenticatedHttpClient({ baseUrl, authToken })
}

export function createMcpClient(baseUrl: string): AuthenticatedHttpClient {
  const authToken = process.env.SEARCH_SERVICE_TOKEN?.trim()

  return new AuthenticatedHttpClient({ baseUrl, authToken })
}

let kgClientInstance: AuthenticatedHttpClient | null = null

export function getKgClient(): AuthenticatedHttpClient {
  if (!kgClientInstance) {
    kgClientInstance = createKgClient()
  }
  return kgClientInstance
}

export function resetKgClient(): void {
  kgClientInstance = null
}
