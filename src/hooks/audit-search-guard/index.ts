import { getAuditSearchPolicy, getWebWhitelist, isWhitelistedDomain } from "../../audit-core/search/policy"
import { log } from "../../shared/logger"

const WEBSEARCH_TOOLS = new Set(["websearch_web_search_exa", "websearch"])

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

function shouldIncludePublicSources(query: string): boolean {
  return /\b(reddit|x\.com|twitter|social|forum)\b/i.test(query)
}

export function createAuditSearchGuardHook(_ctx: unknown) {
  return {
    "tool.execute.before": async (
      input: { tool: string; sessionID: string; callID: string },
      output: { args: Record<string, unknown>; message?: string }
    ): Promise<void> => {
      const toolName = input.tool.toLowerCase()
      if (!WEBSEARCH_TOOLS.has(toolName)) return

      const policy = getAuditSearchPolicy()
      if (policy === "mcp_only") {
        throw new Error("[audit-search-guard] Web search blocked: policy is mcp_only. Use ImmiCore MCP sources.")
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
