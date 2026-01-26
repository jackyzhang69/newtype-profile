import {
  lsp_hover,
  lsp_goto_definition,
  lsp_find_references,
  lsp_document_symbols,
  lsp_workspace_symbols,
  lsp_diagnostics,
  lsp_servers,
  lsp_prepare_rename,
  lsp_rename,
  lsp_code_actions,
  lsp_code_action_resolve,
} from "./lsp"

import {
  ast_grep_search,
  ast_grep_replace,
} from "./ast-grep"

import { grep } from "./grep"
import { glob } from "./glob"
import { file_content_extract } from "./file-content"
import {
  audit_session_start,
  audit_save_profile,
  audit_save_stage_output,
  audit_save_citations,
  audit_complete,
  audit_get_session,
} from "./audit-persistence"
import {
  kg_search,
  kg_case,
  kg_similar_cases,
  kg_judge_stats,
  kg_top_authorities,
  kg_metadata,
  immicore_caselaw_search,
  caselaw_keyword_search,
  caselaw_semantic_search,
  caselaw_optimized_search,
  caselaw_authority,
  caselaw_validity,
  caselaw_get_fulltext_by_url,
  operation_manual_keyword_search,
  operation_manual_semantic_search,
  help_centre_search,
  help_centre_detail,
  mcp_list_prompts,
  mcp_get_prompt,
  mcp_list_resources,
  mcp_read_resource,
  mcp_call_tool,
  mcp_list_tools,
} from "./audit-kg"
export { createSlashcommandTool, discoverCommandsSync } from "./slashcommand"

import {
  session_list,
  session_read,
  session_search,
  session_info,
} from "./session-manager"

export { sessionExists } from "./session-manager/storage"

export { interactive_bash, startBackgroundCheck as startTmuxCheck } from "./interactive-bash"
export { createSkillTool } from "./skill"
export { getTmuxPath } from "./interactive-bash/utils"
export { createSkillMcpTool } from "./skill-mcp"

import {
  createBackgroundOutput,
  createBackgroundCancel,
} from "./background-task"

import type { PluginInput, ToolDefinition } from "@opencode-ai/plugin"
import type { BackgroundManager } from "../features/background-agent"

type OpencodeClient = PluginInput["client"]

export { createCallOmoAgent } from "./call-omo-agent"
export { createLookAt } from "./look-at"
export { file_content_extract } from "./file-content"
export { createChiefTask, type ChiefTaskToolOptions, DEFAULT_CATEGORIES, CATEGORY_PROMPT_APPENDS } from "./chief-task"
export {
  kg_search,
  kg_case,
  kg_similar_cases,
  kg_judge_stats,
  kg_top_authorities,
  kg_metadata,
  immicore_caselaw_search,
  caselaw_keyword_search,
  caselaw_semantic_search,
  caselaw_optimized_search,
  caselaw_authority,
  caselaw_validity,
  caselaw_get_fulltext_by_url,
  operation_manual_keyword_search,
  operation_manual_semantic_search,
  help_centre_search,
  help_centre_detail,
  mcp_list_prompts,
  mcp_get_prompt,
  mcp_list_resources,
  mcp_read_resource,
  mcp_call_tool,
  mcp_list_tools,
} from "./audit-kg"

export function createBackgroundTools(manager: BackgroundManager, client: OpencodeClient): Record<string, ToolDefinition> {
  return {
    background_output: createBackgroundOutput(manager, client),
    background_cancel: createBackgroundCancel(manager, client),
  }
}

export const builtinTools: Record<string, ToolDefinition> = {
  lsp_hover,
  lsp_goto_definition,
  lsp_find_references,
  lsp_document_symbols,
  lsp_workspace_symbols,
  lsp_diagnostics,
  lsp_servers,
  lsp_prepare_rename,
  lsp_rename,
  lsp_code_actions,
  lsp_code_action_resolve,
  ast_grep_search,
  ast_grep_replace,
  grep,
  glob,
  session_list,
  session_read,
  session_search,
  session_info,
  kg_search,
  kg_case,
  kg_similar_cases,
  kg_judge_stats,
  kg_top_authorities,
  kg_metadata,
  immicore_caselaw_search,
  caselaw_keyword_search,
  caselaw_semantic_search,
  caselaw_optimized_search,
  caselaw_authority,
  caselaw_validity,
  caselaw_get_fulltext_by_url,
  operation_manual_keyword_search,
  operation_manual_semantic_search,
  help_centre_search,
  help_centre_detail,
  mcp_list_prompts,
  mcp_get_prompt,
  mcp_list_resources,
  mcp_read_resource,
  mcp_call_tool,
  mcp_list_tools,
  file_content_extract,
  audit_session_start,
  audit_save_profile,
  audit_save_stage_output,
  audit_save_citations,
  audit_complete,
  audit_get_session,
}
