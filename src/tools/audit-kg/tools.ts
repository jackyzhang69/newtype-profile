import { tool } from "@opencode-ai/plugin"
import { fetchJson, mcpCall, getAvailableMcpServices } from "./utils"
import type {
  KgSearchFilters,
  KgSimilarCasesInput,
  KeywordSearchRequest,
  SemanticSearchRequest,
  OptimizedSearchRequest,
  CaseAuthorityParams,
  CaseValidityParams,
  TopAuthoritiesParams,
  KgMetadataResponse,
} from "./types"

export const kg_search = tool({
  description: "Search cases in the Immicore Knowledge Graph with optional filters. NOTE: Requires Neo4j which may not be available on remote server.",
  args: {
    judge_id: tool.schema.string().optional(),
    issue_code: tool.schema.string().optional(),
    country_code: tool.schema.string().optional(),
    outcome: tool.schema.string().optional(),
    start_date: tool.schema.string().optional(),
    end_date: tool.schema.string().optional(),
    limit: tool.schema.number().optional(),
  },
  execute: async (args) => {
    try {
      const payload: KgSearchFilters = { ...args }
      const result = await fetchJson('/kg/search', {
        method: "POST",
        body: JSON.stringify(payload),
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const kg_case = tool({
  description: "Get a Knowledge Graph case by citation. NOTE: Requires Neo4j which may not be available on remote server.",
  args: {
    citation: tool.schema.string(),
  },
  execute: async (args) => {
    try {
      const citation = encodeURIComponent(args.citation)
      const result = await fetchJson(`/kg/case/${citation}`)
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const kg_similar_cases = tool({
  description: "Find similar cases in the Immicore Knowledge Graph based on applicant profile. NOTE: Requires Neo4j which may not be available on remote server.",
  args: {
    age_range: tool.schema.string().optional(),
    education_level: tool.schema.string().optional(),
    country: tool.schema.string().optional(),
    funds_min: tool.schema.number().optional(),
    funds_max: tool.schema.number().optional(),
    issue_codes: tool.schema.array(tool.schema.string()).optional(),
    limit: tool.schema.number().optional(),
  },
  execute: async (args) => {
    try {
      const payload: KgSimilarCasesInput = { ...args }
      const result = await fetchJson('/kg/similar-cases', {
        method: "POST",
        body: JSON.stringify(payload),
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const kg_judge_stats = tool({
  description: "Get judge stats and approval rates from the Immicore Knowledge Graph. NOTE: Requires Neo4j which may not be available on remote server.",
  args: {
    judge_id: tool.schema.string(),
  },
  execute: async (args) => {
    try {
      const judgeId = encodeURIComponent(args.judge_id)
      const result = await fetchJson(`/kg/judge/${judgeId}/stats`)
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const caselaw_keyword_search = tool({
  description: "BM25 keyword search for Canadian immigration case law. Best for short queries with specific legal terms.",
  args: {
    query: tool.schema.string().describe("Search query"),
    court: tool.schema.enum(["fc", "fca", "irb", "tr", "tcc"]).optional().describe("Court filter: fc=Federal Court, fca=Federal Court of Appeal, irb=Immigration and Refugee Board"),
    start_date: tool.schema.string().optional().describe("Start date (YYYY-MM-DD)"),
    end_date: tool.schema.string().optional().describe("End date (YYYY-MM-DD)"),
    must_include: tool.schema.array(tool.schema.string()).optional().describe("Keywords that MUST appear"),
    must_not: tool.schema.array(tool.schema.string()).optional().describe("Keywords that must NOT appear"),
    judgment_result: tool.schema.array(tool.schema.string()).optional().describe("Filter by judgment result"),
    top_k: tool.schema.number().optional().describe("Number of results (default: 10)"),
    strategy: tool.schema.enum(["balanced", "precision", "filter_driven"]).optional().describe("Search strategy"),
  },
  execute: async (args) => {
    try {
      const payload: KeywordSearchRequest = {
        query: args.query,
        filters: {
          court: args.court,
          start_date: args.start_date,
          end_date: args.end_date,
          must_include: args.must_include,
          must_not: args.must_not,
          judgment_result: args.judgment_result,
        },
        top_k: args.top_k ?? 10,
        strategy: args.strategy ?? "balanced",
        enable_highlighting: true,
      }
      const result = await fetchJson('/rag/keyword-caselaw-retrieve', {
        method: "POST",
        body: JSON.stringify(payload),
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const caselaw_semantic_search = tool({
  description: "Semantic vector search for Canadian immigration case law. Best for natural language queries and finding conceptually related cases.",
  args: {
    query: tool.schema.string().describe("Natural language search query"),
    court: tool.schema.enum(["fc", "fca", "irb"]).optional().describe("Court filter (default: fc)"),
    start_date: tool.schema.string().optional().describe("Start date (YYYY-MM-DD)"),
    end_date: tool.schema.string().optional().describe("End date (YYYY-MM-DD)"),
    fetch_k: tool.schema.number().optional().describe("Candidate count (default: 20)"),
    top_k: tool.schema.number().optional().describe("Final result count (default: 5)"),
  },
  execute: async (args) => {
    try {
      const payload: SemanticSearchRequest = {
        query: args.query,
        court: args.court ?? "fc",
        start_date: args.start_date,
        end_date: args.end_date,
        fetch_k: args.fetch_k ?? 20,
        top_k: args.top_k ?? 5,
      }
      const result = await fetchJson('/rag/semantic-caselaw-search', {
        method: "POST",
        body: JSON.stringify(payload),
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const caselaw_optimized_search = tool({
  description: "Optimized intersection search combining BM25 + Semantic + KG with intelligent routing. RECOMMENDED for most searches.",
  args: {
    query: tool.schema.string().describe("Search query"),
    court: tool.schema.enum(["fc", "fca", "irb"]).optional().describe("Court filter"),
    start_date: tool.schema.string().optional().describe("Start date (YYYY-MM-DD)"),
    end_date: tool.schema.string().optional().describe("End date (YYYY-MM-DD)"),
    judge_id: tool.schema.string().optional().describe("Judge ID for KG-priority search"),
    issue_code: tool.schema.string().optional().describe("Issue code for KG-priority search"),
    target_count: tool.schema.number().optional().describe("Target result count (default: 10)"),
    interpret_count: tool.schema.number().optional().describe("Number of results to interpret with AI (default: 3, 0=no interpretation)"),
    auto_route: tool.schema.boolean().optional().describe("Auto-detect query type (default: true)"),
  },
  execute: async (args) => {
    try {
      const payload: OptimizedSearchRequest = {
        query: args.query,
        filters: {
          court: args.court,
          start_date: args.start_date,
          end_date: args.end_date,
          judge_id: args.judge_id,
          issue_code: args.issue_code,
        },
        target_count: args.target_count ?? 10,
        interpret_count: args.interpret_count ?? 3,
        enable_cache: true,
        auto_route: args.auto_route ?? true,
      }
      const result = await fetchJson('/rag/caselaw-optimized-search', {
        method: "POST",
        body: JSON.stringify(payload),
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const caselaw_authority = tool({
  description: "Get authority score and citation network for a case. Shows how influential a case is.",
  args: {
    citation: tool.schema.string().describe("Case citation (e.g., '2024 FC 123')"),
  },
  execute: async (args) => {
    try {
      const citation = encodeURIComponent(args.citation)
      const result = await fetchJson(`/case/${citation}/authority`)
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const caselaw_validity = tool({
  description: "Check if a case is still good law. Returns validity status and any overruling/distinguishing cases.",
  args: {
    citation: tool.schema.string().describe("Case citation (e.g., '2024 FC 123')"),
  },
  execute: async (args) => {
    try {
      const citation = encodeURIComponent(args.citation)
      const result = await fetchJson(`/case/${citation}/validity`)
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const kg_top_authorities = tool({
  description: `Get most authoritative cases, ranked by citation count.

Without filters: Returns landmark cases (Vavilov, Dunsmuir) most cited across all immigration law.
With filters: Returns cases matching criteria, ordered by citations then date.

Example: { "issue_code": "SUB_STUDY_PLAN", "limit": 10 }`,
  args: {
    issue_code: tool.schema.string().optional().describe("Filter by issue code (e.g., 'SUB_FUNDS', 'SUB_STUDY_PLAN')"),
    court: tool.schema.string().optional().describe("Filter by court (e.g., 'FC')"),
    outcome: tool.schema.enum(["ALLOWED", "DISMISSED", "GRANTED", "DENIED", "REMITTED", "STAYED"]).optional().describe("Filter by case outcome"),
    limit: tool.schema.number().optional().describe("Maximum results (default: 20)"),
  },
  execute: async (args) => {
    try {
      const params = new URLSearchParams()
      if (args.issue_code) params.append('issue_code', args.issue_code)
      if (args.court) params.append('court', args.court)
      if (args.outcome) params.append('outcome', args.outcome)
      params.append('limit', String(args.limit || 20))

      const result = await fetchJson(`/top-authorities?${params.toString()}`)
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const kg_metadata = tool({
  description: `Get available filter values for Knowledge Graph searches.

Returns all valid values for:
- issue_codes: Legal issue codes (e.g., "SUB_FUNDS", "PF_REASONS", "SUB_PURPOSE")
- courts: Court identifiers (e.g., "FC" for Federal Court)
- outcomes: Case outcomes (e.g., "ALLOWED", "DISMISSED")

Call this FIRST to discover valid filter values before using graph_search or find_similar.`,
  args: {},
  execute: async () => {
    try {
      const result = await fetchJson('/kg/metadata') as KgMetadataResponse
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const caselaw_get_fulltext_by_url = tool({
  description: `Get full text of a case by its URL.

Returns: citation, style_of_cause, judgment_date, and complete page_content.

Example: { "url": "https://decisions.fct-cf.gc.ca/fc-cf/decisions/en/item/123456/index.do" }`,
  args: {
    url: tool.schema.string().describe("The unique URL of the case"),
  },
  execute: async (args) => {
    try {
      const payload = {
        query: '',
        key_phrases: [
          { field: 'url', query: args.url, boost: 10 }
        ],
        filters: {},
        fields: ['page_content', 'citation', 'style_of_cause', 'judgment_date', 'url'],
        top_k: 3
      }
      const result = await fetchJson('/rag/keyword-caselaw-retrieve', {
        method: "POST",
        body: JSON.stringify(payload),
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const operation_manual_keyword_search = tool({
  description: `Search the IRCC operation manual using Elasticsearch keyword search.

All keyword inputs (query, must_include, must_not, should) must be in English.

Input parameters:
  - query (string, required): Main search query in English
  - policy_code (string, optional): Policy code to restrict search scope (e.g., "ip08-eng")
  - must_include (string[], optional): Keywords that must appear in results
  - must_not (string[], optional): Keywords to exclude from results
  - should (string[], optional): Preferred keywords to include
  - top_k (number, optional): Number of results to return (default: 5)

Example: { "query": "spousal sponsorship requirements", "policy_code": "ip08-eng", "must_include": ["eligibility"], "top_k": 3 }`,
  args: {
    query: tool.schema.string().describe("Main search query in English"),
    policy_code: tool.schema.string().optional().describe("Policy code to restrict search scope"),
    must_include: tool.schema.array(tool.schema.string()).optional().describe("Keywords that must appear in results"),
    must_not: tool.schema.array(tool.schema.string()).optional().describe("Keywords to exclude from results"),
    should: tool.schema.array(tool.schema.string()).optional().describe("Preferred keywords to include"),
    top_k: tool.schema.number().optional().describe("Number of results to return (default: 5)"),
  },
  execute: async (args) => {
    try {
      const payload = {
        query: args.query,
        policy_code: args.policy_code,
        must_include: args.must_include,
        must_not: args.must_not,
        should: args.should,
        top_k: args.top_k ?? 5,
      }
      const result = await fetchJson('/rag/keyword-operation-manual-retrieve', {
        method: "POST",
        body: JSON.stringify(payload),
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const operation_manual_semantic_search = tool({
  description: `Search the IRCC operation manual using semantic vector search.

All query and keyword inputs must be in English.

Input parameters:
  - query (string, required): Main search query in English
  - policy_code (string, optional): Policy code to restrict search scope (e.g., "OP02-ENG")
  - policy_title_keywords (string[], optional): Keywords to match in policy title
  - section_id (string, optional): Section ID to restrict search (e.g., "2.1")
  - section_title_keywords (string[], optional): Keywords to match in section title
  - text_keywords (string[], optional): Keywords to match in text
  - from (number, optional): Pagination start index (default: 0)
  - size (number, optional): Number of results to return (default: 5)

Example: { "query": "spousal sponsorship", "policy_code": "IP08-ENG", "size": 5 }`,
  args: {
    query: tool.schema.string().describe("Main search query in English"),
    policy_code: tool.schema.string().optional().describe("Policy code to restrict search scope"),
    policy_title_keywords: tool.schema.array(tool.schema.string()).optional().describe("Keywords to match in policy title"),
    section_id: tool.schema.string().optional().describe("Section ID to restrict search"),
    section_title_keywords: tool.schema.array(tool.schema.string()).optional().describe("Keywords to match in section title"),
    text_keywords: tool.schema.array(tool.schema.string()).optional().describe("Keywords to match in text"),
    from: tool.schema.number().optional().describe("Pagination start index (default: 0)"),
    size: tool.schema.number().optional().describe("Number of results to return (default: 5)"),
  },
  execute: async (args) => {
    try {
      const payload = {
        query: args.query,
        policy_code: args.policy_code,
        policy_title_keywords: args.policy_title_keywords,
        section_id: args.section_id,
        section_title_keywords: args.section_title_keywords,
        text_keywords: args.text_keywords,
        from: args.from ?? 0,
        size: args.size ?? 5,
      }
      const result = await fetchJson('/rag/semantic-operation-manual-retrieve', {
        method: "POST",
        body: JSON.stringify(payload),
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const help_centre_search = tool({
  description: `Search the IRCC Help Centre for Q&A content.

Supports bilingual search:
- lang="en": Search English content
- lang="zh": Search Chinese (Simplified) content

Example:
- English: { "query": "study permit application", "lang": "en", "top_k": 5 }
- Chinese: { "query": "学习许可申请", "lang": "zh", "top_k": 5 }`,
  args: {
    query: tool.schema.string().describe("Search query (English or Chinese based on lang)"),
    lang: tool.schema.enum(["en", "zh"]).optional().describe('Language: "en" for English, "zh" for Chinese (default: en)'),
    top_k: tool.schema.number().optional().describe("Number of results to return (default: 10, max: 50)"),
  },
  execute: async (args) => {
    try {
      const payload = {
        query: args.query,
        lang: args.lang ?? 'en',
        top_k: args.top_k ?? 10,
      }
      const result = await fetchJson('/help-centre/search', {
        method: "POST",
        body: JSON.stringify(payload),
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const help_centre_detail = tool({
  description: `Get the full content of an IRCC Help Centre Q&A by its question number (qnum).

Use this after searching to retrieve the complete answer text.

Parameters:
- qnum: The question number from search results
- lang: "en" for English, "zh" for Chinese (default: en)
- format: "text" for plain text (default), "html" for HTML markup

Example: { "qnum": 478, "lang": "en", "format": "text" }`,
  args: {
    qnum: tool.schema.number().describe("Question number (unique ID from search results)"),
    lang: tool.schema.enum(["en", "zh"]).optional().describe('Language: "en" for English, "zh" for Chinese (default: en)'),
    format: tool.schema.enum(["text", "html"]).optional().describe('Content format: "text" or "html" (default: text)'),
  },
  execute: async (args) => {
    try {
      const params = new URLSearchParams()
      params.append('lang', args.lang ?? 'en')
      params.append('format', args.format ?? 'text')
      const result = await fetchJson(`/help-centre/detail/${args.qnum}?${params.toString()}`)
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

// =============================================================================
// MCP Protocol Tools (prompts, resources)
// =============================================================================

export const mcp_list_prompts = tool({
  description: `List available prompts from an ImmiCore MCP service.

Services: caselaw, operation-manual, help-centre, noc, email-kg

Example: { "service": "caselaw" }
Returns: Array of prompt objects with name, description, and arguments schema.`,
  args: {
    service: tool.schema.enum(["caselaw", "operation-manual", "help-centre", "noc", "email-kg"]).describe("MCP service name"),
  },
  execute: async (args) => {
    try {
      const result = await mcpCall(args.service, 'prompts/list')
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const mcp_get_prompt = tool({
  description: `Get a specific prompt from an ImmiCore MCP service with arguments.

First call mcp_list_prompts to see available prompts and their argument schemas.

Example: { "service": "caselaw", "name": "study-permit-research", "arguments": { "applicant_country": "China", "study_program": "Computer Science" } }`,
  args: {
    service: tool.schema.enum(["caselaw", "operation-manual", "help-centre", "noc", "email-kg"]).describe("MCP service name"),
    name: tool.schema.string().describe("Prompt name (from mcp_list_prompts)"),
    arguments: tool.schema.record(tool.schema.string(), tool.schema.unknown()).optional().describe("Prompt arguments (schema from mcp_list_prompts)"),
  },
  execute: async (args) => {
    try {
      const result = await mcpCall(args.service, 'prompts/get', {
        name: args.name,
        arguments: args.arguments || {},
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const mcp_list_resources = tool({
  description: `List available resources from an ImmiCore MCP service.

Services: caselaw, operation-manual, help-centre, noc, email-kg

Resources are static reference materials like tool selection guides, schema docs, etc.

Example: { "service": "caselaw" }`,
  args: {
    service: tool.schema.enum(["caselaw", "operation-manual", "help-centre", "noc", "email-kg"]).describe("MCP service name"),
  },
  execute: async (args) => {
    try {
      const result = await mcpCall(args.service, 'resources/list')
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const mcp_read_resource = tool({
  description: `Read a specific resource from an ImmiCore MCP service.

First call mcp_list_resources to see available resources and their URIs.

Example: { "service": "caselaw", "uri": "caselaw://tool-selection-guide" }`,
  args: {
    service: tool.schema.enum(["caselaw", "operation-manual", "help-centre", "noc", "email-kg"]).describe("MCP service name"),
    uri: tool.schema.string().describe("Resource URI (from mcp_list_resources)"),
  },
  execute: async (args) => {
    try {
      const result = await mcpCall(args.service, 'resources/read', {
        uri: args.uri,
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const mcp_call_tool = tool({
  description: `Call a tool on an ImmiCore MCP service directly.

This is a low-level interface for calling any MCP tool. For common operations,
prefer the dedicated tools (caselaw_keyword_search, operation_manual_semantic_search, etc.).

Use this when you need to call a tool that doesn't have a dedicated wrapper.

Example: { "service": "caselaw", "tool_name": "keyword_search", "arguments": { "query": "study permit", "top_k": 5 } }`,
  args: {
    service: tool.schema.enum(["caselaw", "operation-manual", "help-centre", "noc", "email-kg"]).describe("MCP service name"),
    tool_name: tool.schema.string().describe("Tool name to call"),
    arguments: tool.schema.record(tool.schema.string(), tool.schema.unknown()).optional().describe("Tool arguments"),
  },
  execute: async (args) => {
    try {
      const result = await mcpCall(args.service, 'tools/call', {
        name: args.tool_name,
        arguments: args.arguments || {},
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

export const mcp_list_tools = tool({
  description: `List available tools from an ImmiCore MCP service.

Services: caselaw, operation-manual, help-centre, noc, email-kg

Returns: Array of tool objects with name, description, and input schema.

Example: { "service": "caselaw" }`,
  args: {
    service: tool.schema.enum(["caselaw", "operation-manual", "help-centre", "noc", "email-kg"]).describe("MCP service name"),
  },
  execute: async (args) => {
    try {
      const result = await mcpCall(args.service, 'tools/list')
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})

// =============================================================================
// Legacy/Deprecated Tools
// =============================================================================

export const immicore_caselaw_search = tool({
  description: "[DEPRECATED] Use caselaw_keyword_search or caselaw_optimized_search instead. Legacy v3.0 API wrapper.",
  args: {
    query: tool.schema.string(),
    court: tool.schema.enum(["fc", "fca", "irb"]).optional(),
    start_date: tool.schema.string().optional(),
    end_date: tool.schema.string().optional(),
    must_include: tool.schema.array(tool.schema.string()).optional(),
    must_not: tool.schema.array(tool.schema.string()).optional(),
    top_k: tool.schema.number().optional(),
  },
  execute: async (args) => {
    try {
      const payload: KeywordSearchRequest = {
        query: args.query,
        filters: {
          court: args.court,
          start_date: args.start_date,
          end_date: args.end_date,
          must_include: args.must_include,
          must_not: args.must_not,
        },
        top_k: args.top_k ?? 10,
        strategy: "balanced",
        enable_highlighting: true,
      }
      const result = await fetchJson('/rag/keyword-caselaw-retrieve', {
        method: "POST",
        body: JSON.stringify(payload),
      })
      return JSON.stringify(result)
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  },
})
