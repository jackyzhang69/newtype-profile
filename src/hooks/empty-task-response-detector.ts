import type { PluginInput } from "@opencode-ai/plugin"

const EMPTY_RESPONSE_WARNING = `[Task Empty Response Warning]

Task invocation completed but returned no response. This indicates the agent either:
- Failed to execute properly
- Did not terminate correctly
- Returned an empty result

Note: The call has already completed - you are NOT waiting for a response. Proceed accordingly.`

export function createEmptyTaskResponseDetectorHook(_ctx: PluginInput) {
  return {
    "tool.execute.after": async (
      input: { tool: string; sessionID: string; callID: string },
      output: { title: string; output: string; metadata: unknown }
    ) => {
      const toolName = input.tool.toLowerCase()
      if (toolName !== "task" && toolName !== "audit_task") return

      const responseText = output.output?.trim() ?? ""

      if (responseText === "") {
        output.output = EMPTY_RESPONSE_WARNING
      }
    },
  }
}
