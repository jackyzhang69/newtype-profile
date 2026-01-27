import { describe, it, expect } from "bun:test"
import { createEmptyTaskResponseDetectorHook } from "./empty-task-response-detector"

describe("empty-task-response-detector", () => {
  const mockCtx = {} as Parameters<typeof createEmptyTaskResponseDetectorHook>[0]
  const hook = createEmptyTaskResponseDetectorHook(mockCtx)

  describe("tool.execute.after", () => {
    // #given a Task tool with empty response
    // #when the hook processes the output
    // #then it should inject the warning message
    it("should detect empty response from Task tool", async () => {
      const input = { tool: "Task", sessionID: "ses_123", callID: "call_1" }
      const output = { title: "Task", output: "", metadata: {} }

      await hook["tool.execute.after"](input, output)

      expect(output.output).toContain("[Task Empty Response Warning]")
    })

    // #given a audit_task tool with empty response
    // #when the hook processes the output
    // #then it should inject the warning message
    it("should detect empty response from audit_task tool", async () => {
      const input = { tool: "audit_task", sessionID: "ses_123", callID: "call_2" }
      const output = { title: "audit_task", output: "", metadata: {} }

      await hook["tool.execute.after"](input, output)

      expect(output.output).toContain("[Task Empty Response Warning]")
    })

    // #given a audit_task tool with only whitespace response
    // #when the hook processes the output
    // #then it should inject the warning message
    it("should detect whitespace-only response as empty", async () => {
      const input = { tool: "audit_task", sessionID: "ses_123", callID: "call_3" }
      const output = { title: "audit_task", output: "   \n\t  ", metadata: {} }

      await hook["tool.execute.after"](input, output)

      expect(output.output).toContain("[Task Empty Response Warning]")
    })

    // #given a audit_task tool with valid response
    // #when the hook processes the output
    // #then it should NOT modify the output
    it("should not modify valid response", async () => {
      const input = { tool: "audit_task", sessionID: "ses_123", callID: "call_4" }
      const originalOutput = "Task completed successfully with results..."
      const output = { title: "audit_task", output: originalOutput, metadata: {} }

      await hook["tool.execute.after"](input, output)

      expect(output.output).toBe(originalOutput)
    })

    // #given a non-task tool with empty response
    // #when the hook processes the output
    // #then it should NOT modify the output
    it("should ignore non-task tools", async () => {
      const input = { tool: "bash", sessionID: "ses_123", callID: "call_5" }
      const output = { title: "bash", output: "", metadata: {} }

      await hook["tool.execute.after"](input, output)

      expect(output.output).toBe("")
    })

    // #given tool name in different cases (TASK, Task, task)
    // #when the hook processes the output
    // #then it should handle case-insensitively
    it("should handle tool name case-insensitively", async () => {
      const testCases = ["TASK", "Task", "task", "AUDIT_TASK", "Audit_Task"]

      for (const toolName of testCases) {
        const input = { tool: toolName, sessionID: "ses_123", callID: `call_${toolName}` }
        const output = { title: toolName, output: "", metadata: {} }

        await hook["tool.execute.after"](input, output)

        expect(output.output).toContain("[Task Empty Response Warning]")
      }
    })
  })
})
