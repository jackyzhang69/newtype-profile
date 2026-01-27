import { tool, type PluginInput, type ToolDefinition } from "@opencode-ai/plugin"
import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import type { BackgroundManager } from "../../features/background-agent"
import type { AuditTaskArgs, AuditTaskToolOptions } from "./types"
import { AUDIT_TASK_DESCRIPTION, AUDIT_AGENTS, IMMI_OS_TOOLS, BLOCKED_TOOLS } from "./constants"
import { findNearestMessageWithFields, MESSAGE_STORAGE } from "../../features/hook-message-injector"
import { resolveMultipleSkills } from "../../features/opencode-skill-loader/skill-content"
import { createBuiltinSkills } from "../../features/builtin-skills/skills"
import { getTaskToastManager } from "../../features/task-toast-manager"
import { subagentSessions } from "../../features/claude-code-session-state"
import { log } from "../../shared/logger"

type OpencodeClient = PluginInput["client"]

function getMessageDir(sessionID: string): string | null {
  if (!existsSync(MESSAGE_STORAGE)) return null

  const directPath = join(MESSAGE_STORAGE, sessionID)
  if (existsSync(directPath)) return directPath

  for (const dir of readdirSync(MESSAGE_STORAGE)) {
    const sessionPath = join(MESSAGE_STORAGE, dir, sessionID)
    if (existsSync(sessionPath)) return sessionPath
  }

  return null
}

function formatDuration(start: Date, end?: Date): string {
  const duration = (end ?? new Date()).getTime() - start.getTime()
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

type ToolContextWithMetadata = {
  sessionID: string
  messageID: string
  agent: string
  abort: AbortSignal
  metadata?: (input: { title?: string; metadata?: Record<string, unknown> }) => void
}

function buildSystemContent(skillContent?: string): string | undefined {
  if (!skillContent) return undefined
  const wrapped = `<injected_skills>\n${skillContent}\n</injected_skills>`

  return wrapped
}

export function createAuditTask(options: AuditTaskToolOptions): ToolDefinition {
  const { manager, client } = options

  return tool({
    description: AUDIT_TASK_DESCRIPTION,
    args: {
      description: tool.schema.string().describe("Short task description"),
      prompt: tool.schema.string().describe("Full detailed prompt for the agent"),
      subagent_type: tool.schema.string().describe(`Audit agent name: ${AUDIT_AGENTS.join(", ")}`),
      run_in_background: tool.schema.boolean().describe("Run in background. Use false for sequential workflow, true for parallel tasks."),
      resume: tool.schema.string().optional().describe("Session ID to resume previous agent session"),
      skills: tool.schema.array(tool.schema.string()).describe("Array of skill names to prepend. Use [] if no skills needed."),
    },
    async execute(args: AuditTaskArgs, toolContext) {
      const ctx = toolContext as ToolContextWithMetadata

      if (args.run_in_background === undefined) {
        return `❌ Invalid arguments: 'run_in_background' parameter is REQUIRED.`
      }
      if (args.skills === undefined) {
        return `❌ Invalid arguments: 'skills' parameter is REQUIRED. Use skills=[] if no skills needed.`
      }

      const agentToUse = args.subagent_type.trim()
      if (!agentToUse) {
        return `❌ Agent name cannot be empty.`
      }

      if (!AUDIT_AGENTS.includes(agentToUse as typeof AUDIT_AGENTS[number])) {
        return `❌ Unknown audit agent: "${agentToUse}". Available: ${AUDIT_AGENTS.join(", ")}`
      }

      let skillContent: string | undefined
      if (args.skills.length > 0) {
        const { resolved, notFound } = resolveMultipleSkills(args.skills)
        if (notFound.length > 0) {
          const available = createBuiltinSkills().map(s => s.name).join(", ")
          return `❌ Skills not found: ${notFound.join(", ")}. Available: ${available}`
        }
        skillContent = Array.from(resolved.values()).join("\n\n")
      }

      const messageDir = getMessageDir(ctx.sessionID)
      const prevMessage = messageDir ? findNearestMessageWithFields(messageDir) : null
      const parentAgent = ctx.agent ?? prevMessage?.agent
      const parentModel = prevMessage?.model?.providerID && prevMessage?.model?.modelID
        ? { providerID: prevMessage.model.providerID, modelID: prevMessage.model.modelID }
        : undefined

      const auditToolConfig = {
        ...IMMI_OS_TOOLS,
        ...BLOCKED_TOOLS,
      }

      const runInBackground = args.run_in_background === true

      log(`[audit_task] Executing agent: ${agentToUse}, background: ${runInBackground}, skills: ${args.skills.join(", ") || "none"}`)

      if (args.resume) {
        log(`[audit_task] Resuming session: ${args.resume}`)
        if (runInBackground) {
          try {
            const task = await manager.resume({
              sessionId: args.resume,
              prompt: args.prompt,
              parentSessionID: ctx.sessionID,
              parentMessageID: ctx.messageID,
              parentModel,
              parentAgent,
            })

            ctx.metadata?.({
              title: `Resume: ${task.description}`,
              metadata: { sessionId: task.sessionID },
            })

            return `Background task resumed.

Task ID: ${task.id}
Session ID: ${task.sessionID}
Description: ${task.description}
Agent: ${task.agent}
Status: ${task.status}

Use \`background_output\` with task_id="${task.id}" to check progress.`
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            return `❌ Failed to resume task: ${message}`
          }
        }

        const toastManager = getTaskToastManager()
        const taskId = `resume_sync_${args.resume.slice(0, 8)}`
        const startTime = new Date()

        if (toastManager) {
          toastManager.addTask({
            id: taskId,
            description: `Resume: ${args.description}`,
            agent: agentToUse,
            isBackground: false,
            skills: args.skills,
          })
        }

        ctx.metadata?.({
          title: `Resume: ${args.description}`,
          metadata: { sessionId: args.resume, sync: true },
        })

        try {
          await client.session.prompt({
            path: { id: args.resume },
            body: {
              tools: auditToolConfig,
              parts: [{ type: "text", text: args.prompt }],
            },
          })
        } catch (promptError) {
          if (toastManager) {
            toastManager.removeTask(taskId)
          }
          const errorMessage = promptError instanceof Error ? promptError.message : String(promptError)
          return `❌ Failed to send resume prompt: ${errorMessage}\n\nSession ID: ${args.resume}`
        }

        const messagesResult = await client.session.messages({
          path: { id: args.resume },
        })

        if (messagesResult.error) {
          if (toastManager) {
            toastManager.removeTask(taskId)
          }
          return `❌ Error fetching result: ${messagesResult.error}\n\nSession ID: ${args.resume}`
        }

        const messages = ((messagesResult as { data?: unknown }).data ?? messagesResult) as Array<{
          info?: { role?: string; time?: { created?: number } }
          parts?: Array<{ type?: string; text?: string }>
        }>

        const assistantMessages = messages
          .filter((m) => m.info?.role === "assistant")
          .sort((a, b) => (b.info?.time?.created ?? 0) - (a.info?.time?.created ?? 0))
        const lastMessage = assistantMessages[0]

        if (toastManager) {
          toastManager.removeTask(taskId)
        }

        const textParts = lastMessage?.parts?.filter((p) => p.type === "text") ?? []
        const textContent = textParts.map((p) => p.text ?? "").filter(Boolean).join("\n")
        const duration = formatDuration(startTime)

        return `Task resumed and completed in ${duration}.

Session ID: ${args.resume}

---

${textContent || "(No text output)"}`
      }

      const systemContent = buildSystemContent(skillContent)

      if (runInBackground) {
        try {
          const task = await manager.launch({
            description: args.description,
            prompt: args.prompt,
            agent: agentToUse,
            parentSessionID: ctx.sessionID,
            parentMessageID: ctx.messageID,
            parentModel,
            parentAgent,
            skills: args.skills,
            skillContent: systemContent,
          })

          ctx.metadata?.({
            title: args.description,
            metadata: { sessionId: task.sessionID },
          })

          return `Background audit task launched.

Task ID: ${task.id}
Session ID: ${task.sessionID}
Description: ${task.description}
Agent: ${task.agent}
Status: ${task.status}

System notifies on completion. Use \`background_output\` with task_id="${task.id}" to check.`
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          return `❌ Failed to launch audit task: ${message}`
        }
      }

      const toastManager = getTaskToastManager()
      let taskId: string | undefined
      let syncSessionID: string | undefined

      try {
        const createResult = await client.session.create({
          body: {
            parentID: ctx.sessionID,
            title: `Audit: ${args.description}`,
          },
        })

        if (createResult.error) {
          return `❌ Failed to create session: ${createResult.error}`
        }

        const sessionID = createResult.data.id
        syncSessionID = sessionID
        subagentSessions.add(sessionID)
        taskId = `audit_sync_${sessionID.slice(0, 8)}`
        const startTime = new Date()

        log(`[audit_task] Created session: ${sessionID} for agent: ${agentToUse}`)

        if (toastManager) {
          toastManager.addTask({
            id: taskId,
            description: args.description,
            agent: agentToUse,
            isBackground: false,
            skills: args.skills,
          })
        }

        ctx.metadata?.({
          title: args.description,
          metadata: { sessionId: sessionID, sync: true },
        })

        let promptError: Error | undefined
        let promptResponse: unknown
        let promptRetries = 0
        const MAX_PROMPT_RETRIES = 2

        while (promptRetries <= MAX_PROMPT_RETRIES) {
          try {
            promptResponse = await client.session.promptAsync({
              path: { id: sessionID },
              body: {
                agent: agentToUse,
                system: systemContent,
                tools: auditToolConfig,
                parts: [{ type: "text", text: args.prompt }],
              },
            })
            break
          } catch (error) {
            promptError = error instanceof Error ? error : new Error(String(error))
            promptRetries++
            
            if (promptRetries <= MAX_PROMPT_RETRIES) {
              log(`[audit_task] Prompt failed (attempt ${promptRetries}/${MAX_PROMPT_RETRIES}), retrying in 1s...`)
              await new Promise(resolve => setTimeout(resolve, 1000))
            } else {
              log(`[audit_task] Prompt failed after ${MAX_PROMPT_RETRIES} retries`)
            }
          }
        }

        if (promptError) {
          if (toastManager && taskId !== undefined) {
            toastManager.removeTask(taskId)
          }
          const errorMessage = promptError.message
          if (errorMessage.includes("agent.name") || errorMessage.includes("undefined")) {
            return `❌ Agent "${agentToUse}" not found. Make sure the agent is registered.\n\nSession ID: ${sessionID}`
          }
          return `❌ Failed to send prompt: ${errorMessage}\n\nSession ID: ${sessionID}`
        }

        const POLL_INTERVAL_MS = 500
        const MAX_POLL_TIME_MS = 10 * 60 * 1000
        const MAX_RETRIES = 2
        const pollStart = Date.now()

        let lastStatus: string | undefined
        let isStarted = false
        let retryCount = 0

        while (Date.now() - pollStart < MAX_POLL_TIME_MS) {
          await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))

          try {
            const statusResult = await client.session.status()
            const allStatuses = (statusResult.data ?? {}) as Record<string, { type: string; error?: string }>
            const sessionStatus = allStatuses[sessionID]

            if (sessionStatus?.type !== lastStatus) {
              lastStatus = sessionStatus?.type
              log(`[audit_task] Session ${sessionID} status changed to: ${lastStatus}`)
            }

            // Mark as started once we see a running state
            if (sessionStatus?.type === "running" || sessionStatus?.type === "queued") {
              isStarted = true
            }

            // If we haven't seen it start yet, and it's idle, it might be too fast or just created.
            // But if promptAsync succeeded, it should transition.
            // We wait at least 2 seconds before accepting "idle" if we haven't seen "running" to avoid race conditions.
            if (!isStarted && Date.now() - pollStart < 2000) {
              continue
            }

            if (!sessionStatus || sessionStatus.type === "idle" || sessionStatus.type === "error" || sessionStatus.type === "failed") {
               if (sessionStatus?.type === "error" || sessionStatus?.type === "failed") {
                 log(`[audit_task] Session ${sessionID} failed with status: ${sessionStatus.type}`)
               }
               break
            }
          } catch (error) {
            log(`[audit_task] Status check failed for ${sessionID}: ${error}`)
            retryCount++
            if (retryCount > MAX_RETRIES) {
              log(`[audit_task] Max retries (${MAX_RETRIES}) exceeded for status check`)
              break
            }
          }
        }
        const messagesResult = await client.session.messages({
          path: { id: sessionID },
        })

        if (messagesResult.error) {
          return `❌ Error fetching result: ${messagesResult.error}\n\nSession ID: ${sessionID}`
        }

        const messages = ((messagesResult as { data?: unknown }).data ?? messagesResult) as Array<{
          info?: { role?: string; time?: { created?: number } }
          parts?: Array<{ type?: string; text?: string }>
        }>

        const assistantMessages = messages
          .filter((m) => m.info?.role === "assistant")
          .sort((a, b) => (b.info?.time?.created ?? 0) - (a.info?.time?.created ?? 0))
        const lastMessage = assistantMessages[0]

        if (!lastMessage) {
           // Debug: Check if there are ANY messages
           const userMessages = messages.filter(m => m.info?.role === "user");
           const statusDebug = lastStatus || "unknown";
           
          return `❌ No assistant response found.\n\nThis typically means the agent failed to execute or timed out.\n\nSession ID: ${sessionID}\nLast Status: ${statusDebug}\nUser Messages: ${userMessages.length}\nDebug info:\n- Total messages: ${messages.length}\n- Message roles: ${Array.from(new Set(messages.map(m => m.info?.role))).join(", ")}`
        }

        const textParts = lastMessage?.parts?.filter((p) => p.type === "text") ?? []
        const textContent = textParts.map((p) => p.text ?? "").filter(Boolean).join("\n")
        const duration = formatDuration(startTime)

        if (toastManager) {
          toastManager.removeTask(taskId)
        }

        subagentSessions.delete(sessionID)

        return `Audit task completed in ${duration}.

Agent: ${agentToUse}
Session ID: ${sessionID}

---

${textContent || "(No text output)"}`
      } catch (error) {
        if (toastManager && taskId !== undefined) {
          toastManager.removeTask(taskId)
        }
        if (syncSessionID) {
          subagentSessions.delete(syncSessionID)
        }
        const message = error instanceof Error ? error.message : String(error)
        return `❌ Audit task failed: ${message}`
      }
    },
  })
}
