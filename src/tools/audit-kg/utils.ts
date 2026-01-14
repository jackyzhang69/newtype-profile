const DEFAULT_KG_BASE_URL = "http://localhost:3104/api/v1"

export function getKgBaseUrl(): string {
  return process.env.AUDIT_KG_BASE_URL?.trim() || DEFAULT_KG_BASE_URL
}

export async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, init)
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text || response.statusText}`)
  }
  return response.json()
}
