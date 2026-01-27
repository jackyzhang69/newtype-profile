/**
 * Workflow Engine Type Definitions
 * Defines the structure for workflow orchestration and state management
 */

export type AuditTier = "guest" | "pro" | "ultra"

export interface TierSkip {
  guest?: boolean
  pro?: boolean
  ultra?: boolean
}

/**
 * Definition of a single stage in a workflow
 */
export interface WorkflowStage {
  id: string // e.g., "intake", "detective", "strategist", "gatekeeper", "verifier", "reporter"
  agent: string // Agent name to dispatch (e.g., "intake", "detective")
  description: string // Human-readable description
  required: boolean // If false, can be skipped
  depends_on: string[] // Stage IDs that must complete first
  retry_limit: number // Max retries for this stage
  tier_skip?: TierSkip // Skip conditions by tier
}

/**
 * Complete workflow definition
 */
export interface WorkflowDefinition {
  workflow_id: string // e.g., "risk_audit", "document_list", "client_guidance"
  stages: WorkflowStage[]
}

/**
 * Current state of a workflow execution
 */
export interface WorkflowState {
  sessionId: string
  workflowType: string // e.g., "risk_audit"
  tier: AuditTier // Current audit tier
  currentStage: string | null // e.g., "detective" or null if complete
  completedStages: string[]
  outputs: Record<string, unknown> // Stores output from each stage
  retries: Record<string, number> // Track retry count per stage
  startedAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
}

/**
 * Information about the next stage to execute
 */
export interface StageInfo {
  stage: string
  agent: string
  description: string
  progress?: WorkflowProgress
}

/**
 * Progress tracking information
 */
export interface WorkflowProgress {
  current: string | null
  completed: number
  total: number
  percentage: number
}

/**
 * Result of stage completion
 */
export interface StageCompletionResult {
  completed: string
  next_stage: string | null
  progress: WorkflowProgress
}

/**
 * Workflow status snapshot
 */
export interface WorkflowStatus {
  current: string | null
  completed: string[]
  progress: WorkflowProgress
  is_complete: boolean
}

/**
 * Validation result for stage transitions
 */
export interface ValidationResult {
  valid: boolean
  reason?: string
}

/**
 * Recovery context for interrupted workflows
 */
export interface RecoveryContext {
  sessionId: string
  workflowType: string
  currentStage: string | null
  completedStages: string[]
  nextStage: string | null
  recoveryInstructions: string
}
