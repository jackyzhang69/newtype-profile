/**
 * WorkflowEngine - State Machine for Audit Workflow Orchestration
 * Manages workflow state, stage navigation, and validation
 */

import * as fs from "fs"
import * as path from "path"
import type {
  WorkflowDefinition,
  WorkflowState,
  WorkflowStage,
  AuditTier,
  StageInfo,
  WorkflowProgress,
  ValidationResult,
  RecoveryContext,
} from "./types"

/**
 * In-memory cache for workflow definitions
 */
const definitionCache = new Map<string, WorkflowDefinition>()

export class WorkflowEngine {
  private state: WorkflowState
  private definition: WorkflowDefinition
  private checkpointDir: string

  constructor(
    workflowType: string,
    tier: AuditTier,
    sessionId: string,
    checkpointDir: string = "cases/.audit-checkpoints"
  ) {
    this.checkpointDir = checkpointDir
    this.definition = this.loadDefinition(workflowType)

    // Try to load existing state
    const existingState = this.loadStateFromFile(sessionId)
    if (existingState) {
      this.state = existingState
    } else {
      // Create new state
      this.state = {
        sessionId,
        workflowType,
        tier,
        currentStage: null,
        completedStages: [],
        outputs: {},
        retries: {},
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
  }

  /**
   * Load workflow definition from cache or file
   */
  private loadDefinition(workflowType: string): WorkflowDefinition {
    if (definitionCache.has(workflowType)) {
      return definitionCache.get(workflowType)!
    }

    // Convert underscores to hyphens for file lookup (risk_audit -> risk-audit)
    const fileName = workflowType.replace(/_/g, "-")

    // Try multiple possible locations for the definitions
    const possiblePaths = [
      path.join(__dirname, "defs", `${fileName}.json`),
      path.join(process.cwd(), "src", "audit-core", "workflow", "defs", `${fileName}.json`),
      path.join(process.cwd(), "audit-core", "workflow", "defs", `${fileName}.json`),
    ]

    let defPath: string | null = null
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        defPath = p
        break
      }
    }

    if (!defPath) {
      throw new Error(
        `Workflow definition not found: ${workflowType} (looking for ${fileName}.json). Tried: ${possiblePaths.join(", ")}`
      )
    }

    const definition = JSON.parse(
      fs.readFileSync(defPath, "utf-8")
    ) as WorkflowDefinition

    definitionCache.set(workflowType, definition)
    return definition
  }

  /**
   * Load existing workflow state from checkpoint file
   */
  private loadStateFromFile(sessionId: string): WorkflowState | null {
    const statePath = path.join(this.checkpointDir, `${sessionId}.json`)

    if (!fs.existsSync(statePath)) {
      return null
    }

    try {
      return JSON.parse(
        fs.readFileSync(statePath, "utf-8")
      ) as WorkflowState
    } catch (error) {
      console.error(
        `Failed to load workflow state from ${statePath}:`,
        error
      )
      return null
    }
  }

  /**
   * Save current state to checkpoint file
   */
  saveState(): void {
    // Ensure checkpoint directory exists
    if (!fs.existsSync(this.checkpointDir)) {
      fs.mkdirSync(this.checkpointDir, { recursive: true })
    }

    const statePath = path.join(
      this.checkpointDir,
      `${this.state.sessionId}.json`
    )

    // Atomic write: write to temp, then rename
    const tempPath = `${statePath}.tmp`

    this.state.updatedAt = new Date().toISOString()
    fs.writeFileSync(tempPath, JSON.stringify(this.state, null, 2))
    fs.renameSync(tempPath, statePath)
  }

  /**
   * Get the current stage being executed
   */
  getCurrentStage(): WorkflowStage | null {
    if (!this.state.currentStage) {
      return null
    }

    return this.definition.stages.find((s) => s.id === this.state.currentStage) || null
  }

  /**
   * Get next stage to execute
   * Returns null if workflow is complete
   */
  getNextStage(): StageInfo | null {
    // If we have a current stage, continue with it
    if (this.state.currentStage) {
      const current = this.definition.stages.find((s) => s.id === this.state.currentStage)
      if (current) {
        return {
          stage: current.id,
          agent: current.agent,
          description: current.description,
          progress: this.getProgress(),
        }
      }
    }

    // Find the next incomplete, executable stage
    for (const stage of this.definition.stages) {
      // Skip if already completed
      if (this.state.completedStages.includes(stage.id)) {
        continue
      }

      // Skip if tier condition says to skip
      if (stage.tier_skip?.[this.state.tier]) {
        this.state.completedStages.push(stage.id)
        continue
      }

      // Skip if not required and dependencies not met
      if (!stage.required) {
        const depsComplete = stage.depends_on.every((dep) =>
          this.state.completedStages.includes(dep)
        )
        if (!depsComplete) {
          continue
        }
      }

      // Check dependencies
      const depsMet = stage.depends_on.every((dep) =>
        this.state.completedStages.includes(dep)
      )
      if (!depsMet) {
        // Return error information
        const missingDeps = stage.depends_on.filter(
          (dep) => !this.state.completedStages.includes(dep)
        )
        throw new Error(
          `Cannot execute stage ${stage.id}: missing dependencies: ${missingDeps.join(", ")}`
        )
      }

      // Set as current stage and return
      this.state.currentStage = stage.id
      this.saveState()

      return {
        stage: stage.id,
        agent: stage.agent,
        description: stage.description,
        progress: this.getProgress(),
      }
    }

    // No more stages - workflow complete
    this.state.currentStage = null
    this.saveState()
    return null
  }

  /**
   * Mark a stage as complete
   */
  markStageComplete(stageId: string, output: unknown): void {
    this.validateStageId(stageId)

    if (!this.state.completedStages.includes(stageId)) {
      this.state.completedStages.push(stageId)
    }

    this.state.outputs[stageId] = output
    this.state.currentStage = null
    this.state.retries[stageId] = 0

    this.saveState()
  }

  /**
   * Increment retry count for a stage
   */
  incrementRetry(stageId: string): number {
    this.validateStageId(stageId)

    if (!this.state.retries[stageId]) {
      this.state.retries[stageId] = 0
    }

    this.state.retries[stageId]++
    this.saveState()

    return this.state.retries[stageId]
  }

  /**
   * Check if a stage can be retried
   */
  canRetryStage(stageId: string): boolean {
    const stage = this.definition.stages.find((s) => s.id === stageId)
    if (!stage) {
      return false
    }

    const retryCount = this.state.retries[stageId] || 0
    return retryCount < stage.retry_limit
  }

  /**
   * Get list of completed stages
   */
  getCompletedStages(): string[] {
    return [...this.state.completedStages]
  }

  /**
   * Check if workflow is complete
   */
  isWorkflowComplete(): boolean {
    // Collect required and non-skipped stages
    const requiredStages = this.definition.stages.filter(
      (s) => s.required && !s.tier_skip?.[this.state.tier]
    )

    return requiredStages.every((s) => this.state.completedStages.includes(s.id))
  }

  /**
   * Get workflow progress
   */
  getProgress(): WorkflowProgress {
    // Count required and non-skipped stages
    const requiredStages = this.definition.stages.filter(
      (s) => s.required && !s.tier_skip?.[this.state.tier]
    )

    const completed = this.state.completedStages.filter((s) =>
      requiredStages.some((r) => r.id === s)
    ).length

    const total = requiredStages.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      current: this.state.currentStage,
      completed,
      total,
      percentage,
    }
  }

  /**
   * Validate stage transition
   */
  validateStageTransition(_fromStageId: string | null, toStageId: string): ValidationResult {
    const toStage = this.definition.stages.find((s) => s.id === toStageId)

    if (!toStage) {
      return {
        valid: false,
        reason: `Stage not found: ${toStageId}`,
      }
    }

    // Check if stage is skipped for this tier
    if (toStage.tier_skip?.[this.state.tier]) {
      return {
        valid: false,
        reason: `Stage ${toStageId} is not available for tier: ${this.state.tier}`,
      }
    }

    // Check dependencies
    const depsMet = toStage.depends_on.every((dep) =>
      this.state.completedStages.includes(dep)
    )

    if (!depsMet) {
      const missingDeps = toStage.depends_on.filter(
        (dep) => !this.state.completedStages.includes(dep)
      )
      return {
        valid: false,
        reason: `Cannot transition to ${toStageId}: missing completed stages: ${missingDeps.join(", ")}`,
      }
    }

    return { valid: true }
  }

  /**
   * Get recovery context for interrupted workflow
   */
  getRecoveryContext(): RecoveryContext {
    const nextStage = this.getNextStage()

    let instructions = ""
    if (this.state.currentStage) {
      const stage = this.definition.stages.find((s) => s.id === this.state.currentStage)
      if (stage) {
        instructions = `Resume with stage: ${stage.id} (${stage.agent} agent)`
      }
    } else if (nextStage) {
      instructions = `Continue with stage: ${nextStage.stage} (${nextStage.agent} agent)`
    } else {
      instructions = "Workflow is complete. Finalize the report."
    }

    return {
      sessionId: this.state.sessionId,
      workflowType: this.state.workflowType,
      currentStage: this.state.currentStage,
      completedStages: this.state.completedStages,
      nextStage: nextStage?.stage || null,
      recoveryInstructions: instructions,
    }
  }

  /**
   * Get stage output
   */
  getStageOutput(stageId: string): unknown {
    return this.state.outputs[stageId]
  }

  /**
   * Get all outputs
   */
  getAllOutputs(): Record<string, unknown> {
    return { ...this.state.outputs }
  }

  /**
   * Validate stage ID exists in workflow
   */
  private validateStageId(stageId: string): void {
    if (!this.definition.stages.find((s) => s.id === stageId)) {
      throw new Error(`Invalid stage ID: ${stageId}`)
    }
  }

  /**
   * Static method to load existing workflow state
   */
  static loadState(
    sessionId: string,
    checkpointDir: string = "cases/.audit-checkpoints"
  ): WorkflowState | null {
    const statePath = path.join(checkpointDir, `${sessionId}.json`)

    if (!fs.existsSync(statePath)) {
      return null
    }

    try {
      return JSON.parse(
        fs.readFileSync(statePath, "utf-8")
      ) as WorkflowState
    } catch (error) {
      console.error(
        `Failed to load workflow state from ${statePath}:`,
        error
      )
      return null
    }
  }

  /**
   * Static method to create or load engine
   */
  static createOrLoad(
    workflowType: string,
    tier: AuditTier,
    sessionId: string,
    checkpointDir: string = "cases/.audit-checkpoints"
  ): WorkflowEngine {
    return new WorkflowEngine(workflowType, tier, sessionId, checkpointDir)
  }

  /**
   * Get current state (for testing/debugging)
   */
  getState(): WorkflowState {
    return { ...this.state }
  }
}
