import { join } from "node:path";
import { getOpenCodeStorageDir } from "../../shared/data-path";

export const OPENCODE_STORAGE = getOpenCodeStorageDir();
export const AGENT_USAGE_REMINDER_STORAGE = join(
  OPENCODE_STORAGE,
  "agent-usage-reminder",
);

// All tool names normalized to lowercase for case-insensitive matching
export const TARGET_TOOLS = new Set([
  "grep",
  "safe_grep",
  "glob",
  "safe_glob",
  "webfetch",
  "context7_resolve-library-id",
  "context7_query-docs",
  "websearch_web_search_exa",
  "context7_get-library-docs",
  "grep_app_searchgithub",
]);

export const AGENT_TOOLS = new Set([
  "task",
  "call_omo_agent",
  "audit_task",
]);

export const REMINDER_MESSAGE = `
[Agent Usage Reminder]

You called a search/fetch tool directly without leveraging specialized agents.

RECOMMENDED: Use audit_task for immigration audit workflows:

\`\`\`
// For audit-related searches, use audit_task to delegate to specialized agents
audit_task(subagent_type="detective", prompt="Search case law for X")
audit_task(subagent_type="strategist", prompt="Analyze risk for Y")

// For general research, use call_omo_agent
call_omo_agent(subagent_type="explore", prompt="Find information about Z")
\`\`\`

WHY:
- Specialized agents have domain expertise
- Background tasks run in parallel, saving time
- Reduces context window usage in main session
- Maintains proper workflow state

ALWAYS prefer: Specialized agent calls > Direct tool calls
`;
