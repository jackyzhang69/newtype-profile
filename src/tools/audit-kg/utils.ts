import { getKgClient } from '../../audit-core/http-client'

export async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  if (url.startsWith('http')) {
    const client = new (await import('../../audit-core/http-client')).AuthenticatedHttpClient({
      baseUrl: '',
      authToken: process.env.SEARCH_SERVICE_TOKEN?.trim(),
    })
    return client.fetchJson(url, init)
  }

  return getKgClient().fetchJson(url, init)
}
