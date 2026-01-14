import { getAuditSearchPolicy, getWebWhitelist, isWhitelistedDomain } from "../../audit-core/search/policy"
import { log } from "../../shared/logger"
import { getHealthyMcpConfigs } from "../../audit-core/mcp-bridge"

const WEBSEARCH_TOOLS = new Set(["websearch_web_search_exa", "websearch", "webfetch"])

function normalizeDomain(value: string): string {
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/[),]+$/g, "")
    .trim()
    .toLowerCase()
}

function extractSiteDomains(query: string): string[] {
  const matches = query.match(/site:([^\s)]+)/gi) ?? []
  return matches
    .map((match) => match.replace(/site:/i, ""))
    .map(normalizeDomain)
    .filter(Boolean)
}

function extractUrlDomain(url: string): string | null {
  try {
    const parsed = new URL(url)
    return normalizeDomain(parsed.hostname)
  } catch {
    return null
  }
}

function shouldIncludePublicSources(query: string): boolean {
  return /\b(reddit|x\.com|twitter|social|forum)\b/i.test(query)
}

async function getEffectivePolicy(): Promise<string> {
  const policy = getAuditSearchPolicy()
  if (policy !== "mcp_first") return policy

  try {
    const healthyConfigs = await getHealthyMcpConfigs()
    const healthyServerCount = Object.keys(healthyConfigs).length

    if (healthyServerCount === 0) {
      log("[audit-search-guard] No healthy MCP servers, blocking web fallback", {})
      return "mcp_only"
    }

    return policy
  } catch {
    return policy
  }
}

export function createAuditSearchGuardHook(_ctx: unknown) {
  return {
    "tool.execute.before": async (
      input: { tool: string; sessionID: string; callID: string },
      output: { args: Record<string, unknown>; message?: string }
    ): Promise<void> => {
      const toolName = input.tool.toLowerCase()
      if (!WEBSEARCH_TOOLS.has(toolName)) return

      const policy = await getEffectivePolicy()
      if (policy === "mcp_only") {
        throw new Error(
          "[audit-search-guard] Web search blocked: ImmiCore MCP servers are not healthy. " +
            "Fix MCP servers or configure search_policy=mcp_only with working MCP servers."
        )
      }

      if (toolName === "webfetch") {
        const url = output.args.url
        if (typeof url !== "string" || url.trim().length === 0) {
          return
        }

        const domain = extractUrlDomain(url)
        if (!domain) {
          throw new Error("[audit-search-guard] Invalid URL format")
        }

        const whitelist = getWebWhitelist()
        if (!isWhitelistedDomain(domain, whitelist)) {
          throw new Error(
            `[audit-search-guard] Blocked non-whitelisted domain: ${domain}. ` +
              "Use government/professional/public whitelist only."
          )
        }

        log("[audit-search-guard] allowed webfetch to whitelisted domain", {
          sessionID: input.sessionID,
          tool: input.tool,
          domain,
        })
        return
      }

      const query = output.args.query
      if (typeof query !== "string" || query.trim().length === 0) {
        return
      }

      const whitelist = getWebWhitelist()
      const includePublic = shouldIncludePublicSources(query)
      const allowedDomains = includePublic
        ? [...whitelist.government, ...whitelist.professional, ...whitelist.public]
        : [...whitelist.government, ...whitelist.professional]

      const existingSites = extractSiteDomains(query)
      if (existingSites.length > 0) {
        for (const domain of existingSites) {
          if (!isWhitelistedDomain(domain, whitelist)) {
            throw new Error(
              `[audit-search-guard] Blocked non-whitelisted domain: ${domain}. ` +
                "Use government/professional/public whitelist only."
            )
          }
        }
        return
      }

      if (allowedDomains.length === 0) {
        throw new Error("[audit-search-guard] Web whitelist is empty. Configure AUDIT_WEB_WHITELIST.")
      }

      const siteFilter = allowedDomains.map((domain) => `site:${domain}`).join(" OR ")
      output.args.query = `${query} (${siteFilter})`
      log("[audit-search-guard] appended whitelist filter", {
        sessionID: input.sessionID,
        tool: input.tool,
        includePublic,
      })
    },
  }
}
