/**
 * Audit Workflow Enforcer Hook
 * Main enforcement hook for workflow orchestration
 * Validates stage transitions, enforces tier limits, and enables auto-continuation
 */

import { CheckpointValidator } from "./checkpoint"
import { TierEnforcer } from "./tier-enforcer"
import { WorkflowEngine } from "../../audit-core/workflow/engine"

const DELEGATION_REQUIRED_MESSAGE = `
❌ **Delegation Required**

This tool is restricted in audit workflows. You cannot modify the codebase or execute arbitrary commands during workflow execution.

**Why?** The workflow manager strictly controls the sequence of operations. Modifications would break the audit workflow state.

**What to do:**
1. Dispatch the appropriate agent using \`audit_task\`
2. Let the agent complete its work
3. Call \`workflow_complete\` to mark the stage done
4. Move to the next stage

**Current Status:**
- Use \`workflow_status\` to check progress
- Use \`workflow_next\` to see what's next
`

/**
 * Create the audit workflow enforcer hook
 */
export function createAuditWorkflowEnforcer() {
  // Track per-session state
  const sessionStates = new Map<string, { checkpoint: CheckpointValidator; tierEnforcer: TierEnforcer | null }>()

  const getSessionState = (sessionId: string) => {
    if (!sessionStates.has(sessionId)) {
      const checkpoint = new CheckpointValidator(sessionId)
      let tierEnforcer: TierEnforcer | null = null

      if (checkpoint.exists()) {
        const state = checkpoint.getState()
        if (state) {
          tierEnforcer = new TierEnforcer(sessionId, state.tier)
        }
      }

      sessionStates.set(sessionId, { checkpoint, tierEnforcer })
    }

    return sessionStates.get(sessionId)!
  }

  return {
    name: "audit-workflow-enforcer",

    /**
     * Pre-execution validation
     * Block forbidden tools, validate stage transitions, check tier limits
     */
    "tool.execute.before": async (
      input: { tool: string; sessionID: string; callID: string },
      output: any
    ) => {
      const { sessionID } = input
      const { checkpoint } = getSessionState(sessionID)

      // 1. Block forbidden tools except in audit checkpoint directory
      if (["write", "edit", "bash"].includes(input.tool)) {
        // Allow writes/edits to audit checkpoint files
        const isCheckpointFile =
          output.args?.file_path?.includes?.(".audit-checkpoints") ||
          output.args?.file_path?.includes?.("audit_session") ||
          output.args?.file_path?.includes?.("audit_output")

        if (!isCheckpointFile) {
          output.output = DELEGATION_REQUIRED_MESSAGE
          return
        }
      }

      // 2. Validate audit_task matches expected stage
      if (input.tool === "audit_task") {
        const nextStageInfo = checkpoint.getProgress()
        const state = checkpoint.getState()

        if (state && nextStageInfo.completed < nextStageInfo.total) {
          const engine = new WorkflowEngine(state.workflowType, state.tier, sessionID)
          const nextStage = engine.getNextStage()

          if (nextStage && nextStage.agent !== output.args.subagent_type) {
            throw new Error(
              `❌ **Wrong Agent for Current Stage**\n\n` +
              `Expected: ${nextStage.agent} agent\n` +
              `Got: ${output.args.subagent_type} agent\n\n` +
              `**Current Stage**: ${nextStage.stage}\n` +
              `**Description**: ${nextStage.description}\n\n` +
              `Use \`workflow_status\` to check current progress:\n` +
              `- Current: ${nextStageInfo.completed}/${nextStageInfo.total}\n` +
              `- Progress: ${Math.round((nextStageInfo.completed / nextStageInfo.total) * 100)}%`
            )
          }
        }
      }

      // 3. Check tier limits
      if (input.tool === "audit_task") {
        let { tierEnforcer } = getSessionState(sessionID)

        if (!tierEnforcer && checkpoint.exists()) {
          const state = checkpoint.getState()
          if (state) {
            tierEnforcer = new TierEnforcer(sessionID, state.tier)
            sessionStates.set(sessionID, { checkpoint, tierEnforcer })
          }
        }

        if (tierEnforcer) {
          const limit = tierEnforcer.checkAgentCallLimit()
          if (!limit.allowed) {
            throw new Error(`❌ **Agent Call Limit Exceeded**\n\n${limit.reason}\n\nCurrent Usage:\n${JSON.stringify(tierEnforcer.getUsageStats(), null, 2)}`)
          }
          tierEnforcer.incrementAgentCall(output.args.subagent_type)
        }
      }
    },

    /**
     * Post-execution actions
     * Update checkpoints, inject progress messages, validate outputs
     */
    "tool.execute.after": async (
      input: { tool: string; sessionID: string; callID: string },
      output: { title: string; output: string }
    ) => {
      const { sessionID } = input
      const { checkpoint } = getSessionState(sessionID)

      // 1. Auto-update checkpoint on workflow tool calls
      if (input.tool === "workflow_complete") {
        const args = output as any
        try {
          checkpoint.markStageComplete(args.stage_id, args.output)
        } catch (error) {
          console.warn("Failed to update checkpoint:", error)
        }
      }

      // 2. Inject progress reminder after audit_task completion
      if (input.tool === "audit_task") {
        const progress = checkpoint.getProgress()
        const currentStage = checkpoint.getCurrentStage()

        if (output.output) {
          output.output += `\n\n---\n**[Workflow Progress]** Stage: ${currentStage || "awaiting next"} | Complete: ${progress.completed}/${progress.total} (${progress.percentage}%)`
        }
      }

      // 3. Log workflow state transitions
      if (input.tool === "workflow_next" || input.tool === "workflow_complete") {
        const state = checkpoint.getState()
        if (state) {
          console.log(`[Workflow] Session: ${sessionID}, Type: ${state.workflowType}, Stage: ${state.currentStage}, Completed: ${state.completedStages.length}`)
        }
      }
    },

    /**
     * Handle session idle events
     * Check if workflow is complete and auto-inject continuation if needed
     */
    event: async ({ event }: { event: any }) => {
      if (event.type === "session.idle") {
        const sessionId = event.properties?.id
        if (!sessionId) return

        const { checkpoint } = getSessionState(sessionId)
        const state = checkpoint.getState()

        if (!state) {
          return // No workflow in progress
        }

        // Check if workflow is complete
        const engine = new WorkflowEngine(state.workflowType, state.tier, sessionId)
        if (engine.isWorkflowComplete()) {
          return // Workflow done, no need to continue
        }

        // Workflow incomplete and session idle - provide recovery info
        const recovery = checkpoint.getRecoveryContext()
        console.log(`[Audit Workflow] Session ${sessionId} interrupted. Status: ${recovery.recoveryInstructions}`)
      }
    },
  }
}

/**
 * Export helper classes
 */
export { CheckpointValidator, TierEnforcer }
