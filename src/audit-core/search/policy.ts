export type AuditSearchPolicy = "mcp_only" | "mcp_first" | "web_fallback"

export interface WebWhitelist {
  government: string[]
  professional: string[]
  public: string[]
}

const defaultGovernmentDomains = [
  "ircc.gc.ca",
  "canada.ca",
  "esdc.gc.ca",
  "cbsa-asfc.gc.ca",
  "cic.gc.ca",
  "ontario.ca",
  "gov.bc.ca",
  "alberta.ca",
  "saskatchewan.ca",
  "manitoba.ca",
  "novascotia.ca",
  "princeedwardisland.ca",
  "newbrunswick.ca",
  "nl.ca",
]

const defaultProfessionalDomains = [
  "gands.com",
  "fragomen.com",
  "lyonstern.com",
  "gowlingwlg.com",
  "canadavisa.com",
  "immigration.ca",
  "garsonil.com",
  "hummellaw.ca",
  "ackahlaw.com",
  "currentsimmigration.com",
  "capellekane.com",
  "desloges.ca",
  "vancouverlaw.ca",
  "cig-ab.ca",
  "drnlaw.ca",
]

const defaultPublicDomains = ["x.com", "twitter.com", "reddit.com"]

const defaultWhitelist: WebWhitelist = {
  government: defaultGovernmentDomains,
  professional: defaultProfessionalDomains,
  public: defaultPublicDomains,
}

export function getAuditSearchPolicy(): AuditSearchPolicy {
  const policy = process.env.AUDIT_SEARCH_POLICY?.trim()
  if (policy === "mcp_only" || policy === "mcp_first" || policy === "web_fallback") {
    return policy
  }
  return "mcp_first"
}

function parseWhitelistEnv(): Partial<WebWhitelist> {
  const raw = process.env.AUDIT_WEB_WHITELIST?.trim()
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Partial<WebWhitelist>
  } catch {
    return {}
  }
}

export function getWebWhitelist(): WebWhitelist {
  const override = parseWhitelistEnv()
  return {
    government: override.government?.length ? override.government : defaultWhitelist.government,
    professional: override.professional?.length ? override.professional : defaultWhitelist.professional,
    public: override.public?.length ? override.public : defaultWhitelist.public,
  }
}

export function getSourceConfidence(domain: string, whitelist: WebWhitelist = getWebWhitelist()): "high" | "medium" | "low" | "unknown" {
  if (whitelist.government.includes(domain)) return "high"
  if (whitelist.professional.includes(domain)) return "medium"
  if (whitelist.public.includes(domain)) return "low"
  return "unknown"
}

export function isWhitelistedDomain(domain: string, whitelist: WebWhitelist = getWebWhitelist()): boolean {
  return (
    whitelist.government.includes(domain) ||
    whitelist.professional.includes(domain) ||
    whitelist.public.includes(domain)
  )
}

export function buildSearchPolicySection(): string {
  const policy = getAuditSearchPolicy()
  const whitelist = getWebWhitelist()

  return `<Search_Router>
- Policy: ${policy}
- Primary Source: ImmiCore MCP (caselaw, operation-manual, help-centre)
- Knowledge Graph: Parallel usage for similar cases and judge tendencies
- Web Search: Only for real-time updates or similar-case references
- Web Whitelist:
  - Government: ${whitelist.government.join(", ")}
  - Professional: ${whitelist.professional.join(", ")}
  - Public: ${whitelist.public.join(", ")}
- Confidence:
  - High: Government sources
  - Medium: Professional law firm blogs
  - Low: Public sources (X/Reddit) with explicit disclaimer
- Reporting Template:
  - Source: <domain>
  - Confidence: high | medium | low
  - Note: If public source, add disclaimer
</Search_Router>`
}
