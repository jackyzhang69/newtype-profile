import { describe, it, expect, beforeEach } from "bun:test"
import type { PluginInput } from "@opencode-ai/plugin"
import { createAuditDocumentGuardHook } from "./index"

describe("audit-document-guard hook", () => {
  let hook: ReturnType<typeof createAuditDocumentGuardHook>
  const mockCtx = {} as PluginInput

  beforeEach(() => {
    hook = createAuditDocumentGuardHook(mockCtx)
  })

  describe("tool.execute.before", () => {
    describe("read tool", () => {
      it("#given read tool with PDF in case directory #when execute #then blocks", async () => {
        // #given
        const input = { tool: "read", sessionID: "test-session", callID: "test-call" }
        const output = { args: { filePath: "/Users/jacky/Desktop/tian/document.pdf" } }

        // #when
        const result = await hook["tool.execute.before"]?.(input, output)

        // #then
        expect(result).toBeDefined()
        expect(result?.blocked).toBe(true)
        expect(result?.message).toContain("file_content_extract")
      })

      it("#given read tool with image in case directory #when execute #then blocks", async () => {
        // #given
        const input = { tool: "read", sessionID: "test-session", callID: "test-call" }
        const output = { args: { filePath: "/Users/jacky/cases/test/photo.jpg" } }

        // #when
        const result = await hook["tool.execute.before"]?.(input, output)

        // #then
        expect(result).toBeDefined()
        expect(result?.blocked).toBe(true)
      })

      it("#given read tool with txt file #when execute #then allows", async () => {
        // #given
        const input = { tool: "read", sessionID: "test-session", callID: "test-call" }
        const output = { args: { filePath: "/path/to/document.txt" } }

        // #when
        const result = await hook["tool.execute.before"]?.(input, output)

        // #then
        expect(result).toBeUndefined()
      })

      it("#given read tool with PDF outside case directory #when execute #then allows", async () => {
        // #given
        const input = { tool: "read", sessionID: "test-session", callID: "test-call" }
        const output = { args: { filePath: "/tmp/random/document.pdf" } }

        // #when
        const result = await hook["tool.execute.before"]?.(input, output)

        // #then
        expect(result).toBeUndefined()
      })
    })

    describe("look_at tool", () => {
      it("#given look_at tool with PDF in case directory #when execute #then blocks", async () => {
        // #given
        const input = { tool: "look_at", sessionID: "test-session", callID: "test-call" }
        const output = { args: { file_path: "/Users/jacky/Desktop/case/IMM0008.pdf" } }

        // #when
        const result = await hook["tool.execute.before"]?.(input, output)

        // #then
        expect(result).toBeDefined()
        expect(result?.blocked).toBe(true)
        expect(result?.message).toContain("file_content_extract")
        expect(result?.message).toContain("look_at")
      })

      it("#given look_at tool with image in Documents #when execute #then blocks", async () => {
        // #given
        const input = { tool: "look_at", sessionID: "test-session", callID: "test-call" }
        const output = { args: { file_path: "/Users/jacky/Documents/passport.png" } }

        // #when
        const result = await hook["tool.execute.before"]?.(input, output)

        // #then
        expect(result).toBeDefined()
        expect(result?.blocked).toBe(true)
      })
    })

    describe("other tools", () => {
      it("#given write tool with PDF #when execute #then allows", async () => {
        // #given
        const input = { tool: "write", sessionID: "test-session", callID: "test-call" }
        const output = { args: { filePath: "/Users/jacky/Desktop/document.pdf" } }

        // #when
        const result = await hook["tool.execute.before"]?.(input, output)

        // #then
        expect(result).toBeUndefined()
      })
    })

    describe("case directory patterns", () => {
      it("#given PDF in /cases/ directory #when execute #then blocks", async () => {
        // #given
        const input = { tool: "read", sessionID: "test-session", callID: "test-call" }
        const output = { args: { filePath: "/home/user/cases/client/doc.pdf" } }

        // #when
        const result = await hook["tool.execute.before"]?.(input, output)

        // #then
        expect(result?.blocked).toBe(true)
      })

      it("#given PDF in audit directory #when execute #then blocks", async () => {
        // #given
        const input = { tool: "read", sessionID: "test-session", callID: "test-call" }
        const output = { args: { filePath: "/data/audit-2024/form.pdf" } }

        // #when
        const result = await hook["tool.execute.before"]?.(input, output)

        // #then
        expect(result?.blocked).toBe(true)
      })
    })
  })
})
