/**
 * Workflow Manager Tools
 * Tools for orchestrating audit workflows
 */

import { tool } from "@opencode-ai/plugin"
import { WorkflowEngine } from "../../audit-core/workflow/engine"

/**
 * workflow_next - Get the next stage to execute
 * Returns stage info when there's a next stage
 * Returns { status: "complete" } when workflow is complete
 */
export const workflow_next = tool({
  description:
    "Get the next stage in the workflow. Returns stage info and progress. Returns status:complete if workflow is complete.",
  args: {
    session_id: tool.schema.string().describe("The audit session ID"),
  },
  execute: async (args: { session_id: string }) => {
    try {
      const state = WorkflowEngine.loadState(args.session_id)
      if (!state) {
        throw new Error(`Session not found: ${args.session_id}`)
      }

      const engine = new WorkflowEngine(state.workflowType, state.tier, args.session_id)
      const stage = engine.getNextStage()

      if (!stage) {
        return JSON.stringify({
          status: "complete",
          message: "Workflow complete. Generate final report.",
        })
      }

      return JSON.stringify(stage)
    } catch (error) {
      throw new Error(`Failed to get next workflow stage: ${error instanceof Error ? error.message : String(error)}`)
    }
  },
})

/**
 * workflow_complete - Mark a stage as complete and advance workflow
 */
export const workflow_complete = tool({
  description: "Mark a stage as complete and advance to the next stage in the workflow",
  args: {
    session_id: tool.schema.string().describe("The audit session ID"),
    stage_id: tool.schema.string().describe("The stage ID that completed"),
    output: tool.schema.any().describe("The output/result from the completed stage"),
  },
  execute: async (args: { session_id: string; stage_id: string; output: unknown }) => {
    try {
      const state = WorkflowEngine.loadState(args.session_id)
      if (!state) {
        throw new Error(`Session not found: ${args.session_id}`)
      }

      const engine = new WorkflowEngine(state.workflowType, state.tier, args.session_id)
      engine.markStageComplete(args.stage_id, args.output)

      const next = engine.getNextStage()

      return JSON.stringify({
        completed: args.stage_id,
        next_stage: next?.stage ?? null,
        progress: engine.getProgress(),
      })
    } catch (error) {
      throw new Error(`Failed to complete workflow stage: ${error instanceof Error ? error.message : String(error)}`)
    }
  },
})

/**
 * workflow_status - Get current workflow status and progress
 */
export const workflow_status = tool({
  description: "Get the current status and progress of a workflow",
  args: {
    session_id: tool.schema.string().describe("The audit session ID"),
  },
  execute: async (args: { session_id: string }) => {
    try {
      const state = WorkflowEngine.loadState(args.session_id)
      if (!state) {
        return JSON.stringify({ status: "not_initialized" })
      }

      const engine = new WorkflowEngine(state.workflowType, state.tier, args.session_id)

      return JSON.stringify({
        current: state.currentStage,
        completed: state.completedStages,
        progress: engine.getProgress(),
        is_complete: engine.isWorkflowComplete(),
      })
    } catch (error) {
      throw new Error(`Failed to get workflow status: ${error instanceof Error ? error.message : String(error)}`)
    }
  },
})
