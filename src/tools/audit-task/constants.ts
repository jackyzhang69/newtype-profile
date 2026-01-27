export const AUDIT_AGENTS = [
  "intake",
  "detective",
  "strategist",
  "gatekeeper",
  "verifier",
  "judge",
  "reporter",
] as const

export type AuditAgentName = typeof AUDIT_AGENTS[number]

export const IMMI_OS_TOOLS = {
  file_content_extract: true,
  audit_session_start: true,
  audit_save_profile: true,
  audit_save_stage_output: true,
  audit_save_citations: true,
  audit_complete: true,
  audit_get_session: true,
  kg_search: true,
  kg_case: true,
  kg_similar_cases: true,
  kg_judge_stats: true,
  kg_top_authorities: true,
  kg_metadata: true,
  caselaw_keyword_search: true,
  caselaw_semantic_search: true,
  caselaw_optimized_search: true,
  caselaw_authority: true,
  caselaw_validity: true,
  caselaw_get_fulltext_by_url: true,
  operation_manual_keyword_search: true,
  operation_manual_semantic_search: true,
  help_centre_search: true,
  help_centre_detail: true,
  mcp_list_prompts: true,
  mcp_get_prompt: true,
  mcp_list_resources: true,
  mcp_read_resource: true,
  mcp_call_tool: true,
  mcp_list_tools: true,
  read: true,
  write: true,
  glob: true,
  grep: true,
  bash: true, // Required for Reporter agent to execute document-generator PDF script
} as const

export const BLOCKED_TOOLS = {
  task: false,
  chief_task: false,
  audit_task: false,
  call_omo_agent: false,
} as const

export const AUDIT_TASK_DESCRIPTION = `Delegate audit tasks to specialized agents (intake, detective, strategist, gatekeeper, verifier, reporter).

This tool ensures subagents use immi-os tools (file_content_extract, audit_*, kg_*, caselaw_*, operation_manual_*, etc.) instead of generic opencode tools.

Parameters:
- subagent_type: Agent name (${AUDIT_AGENTS.join(", ")})
- description: Short task description
- prompt: Detailed prompt for the agent
- run_in_background: true=async (returns task_id), false=sync (waits for result)
- resume: Session ID to resume previous agent session
- skills: Array of skill names to prepend to prompt. Use [] if no skills needed.

Example:
  audit_task({
    subagent_type: "detective",
    description: "Search case law for study permit refusals",
    prompt: "Find relevant case law for study permit refusal based on purpose of visit concerns...",
    run_in_background: false,
    skills: ["study-immicore-mcp"]
  })`
