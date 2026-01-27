/**
 * Checkpoint Validator for Workflow State Management
 * Tracks and validates workflow state consistency
 */

import * as fs from "fs"
import * as path from "path"
import { WorkflowEngine } from "../../audit-core/workflow/engine"
import type { WorkflowState, ValidationResult, RecoveryContext } from "../../audit-core/workflow/types"

export class CheckpointValidator {
  private checkpointPath: string
  private sessionId: string
  private checkpointDir: string

  constructor(sessionId: string, checkpointDir: string = "cases/.audit-checkpoints") {
    this.sessionId = sessionId
    this.checkpointDir = checkpointDir
    this.checkpointPath = path.join(checkpointDir, `${sessionId}.json`)
  }

  /**
   * Validate stage transition
   */
  validateStageTransition(fromStage: string | null, toStage: string): ValidationResult {
    const state = this.loadCheckpoint()
    if (!state) {
      return {
        valid: false,
        reason: "No checkpoint found for session",
      }
    }

    try {
      const engine = new WorkflowEngine(state.workflowType, state.tier, this.sessionId, this.checkpointDir)
      return engine.validateStageTransition(fromStage, toStage)
    } catch (error) {
      return {
        valid: false,
        reason: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  /**
   * Mark stage as complete
   */
  markStageComplete(stageId: string, output: unknown): void {
    const state = this.loadCheckpoint()
    if (!state) {
      throw new Error(`No checkpoint found for session ${this.sessionId}`)
    }

    const engine = new WorkflowEngine(state.workflowType, state.tier, this.sessionId, this.checkpointDir)
    engine.markStageComplete(stageId, output)
  }

  /**
   * Get recovery context for interrupted workflow
   */
  getRecoveryContext(): RecoveryContext {
    const state = this.loadCheckpoint()
    if (!state) {
      return {
        sessionId: this.sessionId,
        workflowType: "unknown",
        currentStage: null,
        completedStages: [],
        nextStage: null,
        recoveryInstructions: "Session not found. Start a new audit.",
      }
    }

    const engine = new WorkflowEngine(state.workflowType, state.tier, this.sessionId, this.checkpointDir)
    return engine.getRecoveryContext()
  }

  /**
   * Check if checkpoint exists
   */
  exists(): boolean {
    return fs.existsSync(this.checkpointPath)
  }

  /**
   * Load checkpoint from file
   */
  private loadCheckpoint(): WorkflowState | null {
    if (!fs.existsSync(this.checkpointPath)) {
      return null
    }

    try {
      return JSON.parse(fs.readFileSync(this.checkpointPath, "utf-8")) as WorkflowState
    } catch (error) {
      console.error(`Failed to load checkpoint from ${this.checkpointPath}:`, error)
      return null
    }
  }

  /**
   * Get current state from checkpoint
   */
  getState(): WorkflowState | null {
    return this.loadCheckpoint()
  }

  /**
   * Get current stage
   */
  getCurrentStage(): string | null {
    const state = this.loadCheckpoint()
    return state?.currentStage ?? null
  }

  /**
   * Get completed stages
   */
  getCompletedStages(): string[] {
    const state = this.loadCheckpoint()
    return state?.completedStages ?? []
  }

  /**
   * Get progress
   */
  getProgress(): { completed: number; total: number; percentage: number } {
    const state = this.loadCheckpoint()
    if (!state) {
      return { completed: 0, total: 0, percentage: 0 }
    }

    const engine = new WorkflowEngine(state.workflowType, state.tier, this.sessionId, this.checkpointDir)
    const progress = engine.getProgress()

    return {
      completed: progress.completed,
      total: progress.total,
      percentage: progress.percentage,
    }
  }
}
