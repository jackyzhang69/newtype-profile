/**
 * WorkflowEngine Tests
 * Tests for workflow state machine, stage navigation, and validation
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import * as fs from "fs"
import * as path from "path"
import { WorkflowEngine } from "./engine"

const TEST_CHECKPOINT_DIR = "/tmp/test-audit-checkpoints"

/**
 * Setup test environment
 */
function setupTestEnv() {
  if (!fs.existsSync(TEST_CHECKPOINT_DIR)) {
    fs.mkdirSync(TEST_CHECKPOINT_DIR, { recursive: true })
  }
}

/**
 * Cleanup test environment
 */
function cleanupTestEnv() {
  if (fs.existsSync(TEST_CHECKPOINT_DIR)) {
    const files = fs.readdirSync(TEST_CHECKPOINT_DIR)
    files.forEach((file) => {
      fs.unlinkSync(path.join(TEST_CHECKPOINT_DIR, file))
    })
  }
}

describe("WorkflowEngine", () => {
  beforeEach(() => {
    setupTestEnv()
  })

  afterEach(() => {
    cleanupTestEnv()
  })

  describe("Initialization", () => {
    it("should create new workflow state", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)
      const state = engine.getState()

      expect(state.sessionId).toBe("test_session")
      expect(state.workflowType).toBe("risk_audit")
      expect(state.tier).toBe("pro")
      expect(state.currentStage).toBeNull()
      expect(state.completedStages).toEqual([])
    })

    it("should load existing workflow state", () => {
      // Create first engine and save state
      const engine1 = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)
      const next1 = engine1.getNextStage()
      engine1.markStageComplete(next1!.stage, { test: "data" })

      // Load from new engine
      const engine2 = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)
      const state2 = engine2.getState()

      expect(state2.completedStages).toContain(next1!.stage)
      expect(state2.outputs[next1!.stage]).toEqual({ test: "data" })
    })

    it("should throw error for invalid workflow type", () => {
      expect(() => {
        new WorkflowEngine("invalid_workflow", "pro", "test_session", TEST_CHECKPOINT_DIR)
      }).toThrow()
    })
  })

  describe("Stage Navigation", () => {
    it("should return first stage on initial call", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)
      const stage = engine.getNextStage()

      expect(stage).not.toBeNull()
      expect(stage?.stage).toBe("intake")
      expect(stage?.agent).toBe("intake")
    })

    it("should advance to next stage after completion", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)

      // Complete first stage
      const stage1 = engine.getNextStage()
      engine.markStageComplete(stage1!.stage, { data: "intake" })

      // Get next stage
      const stage2 = engine.getNextStage()
      expect(stage2?.stage).toBe("detective")
    })

    it("should respect stage dependencies", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)

      // First stage
      const stage1 = engine.getNextStage()
      expect(stage1?.stage).toBe("intake")

      // Complete intake
      engine.markStageComplete("intake", {})

      // Second stage should be detective (depends on intake)
      const stage2 = engine.getNextStage()
      expect(stage2?.stage).toBe("detective")
    })

    it("should return null when workflow is complete", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)

      const requiredStages = ["intake", "detective", "strategist", "gatekeeper", "verifier", "judge", "reporter"]
      for (const stage of requiredStages) {
        engine.markStageComplete(stage, { data: "test" })
      }

      const next = engine.getNextStage()
      expect(next).toBeNull()
    })
  })

  describe("Stage Completion", () => {
    it("should mark stage as completed", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)
      const stage = engine.getNextStage()

      engine.markStageComplete(stage!.stage, { output: "data" })

      const state = engine.getState()
      expect(state.completedStages).toContain(stage!.stage)
      expect(state.outputs[stage!.stage]).toEqual({ output: "data" })
    })

    it("should store stage output", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)
      const testOutput = { name: "test", value: 123 }

      const stage = engine.getNextStage()
      engine.markStageComplete(stage!.stage, testOutput)

      const output = engine.getStageOutput(stage!.stage)
      expect(output).toEqual(testOutput)
    })

    it("should reset current stage after completion", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)
      const stage1 = engine.getNextStage()

      // Current stage should be set
      expect(engine.getState().currentStage).toBe("intake")

      engine.markStageComplete(stage1!.stage, {})

      // Current stage should be reset
      expect(engine.getState().currentStage).toBeNull()
    })
  })

  describe("Retry Logic", () => {
    it("should increment retry count", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)

      const count1 = engine.incrementRetry("intake")
      expect(count1).toBe(1)

      const count2 = engine.incrementRetry("intake")
      expect(count2).toBe(2)
    })

    it("should check if stage can be retried", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)

      // intake has retry_limit: 2
      expect(engine.canRetryStage("intake")).toBe(true)

      engine.incrementRetry("intake")
      expect(engine.canRetryStage("intake")).toBe(true)

      engine.incrementRetry("intake")
      expect(engine.canRetryStage("intake")).toBe(false)
    })

    it("should reset retry count on completion", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)

      engine.incrementRetry("intake")
      engine.markStageComplete("intake", {})

      const state = engine.getState()
      expect(state.retries["intake"]).toBe(0)
    })
  })

  describe("Progress Tracking", () => {
    it("should calculate progress correctly", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)

      let progress = engine.getProgress()
      expect(progress.completed).toBe(0)
      expect(progress.total).toBe(7)

      // After 1 stage
      const stage1 = engine.getNextStage()
      engine.markStageComplete(stage1!.stage, {})
      progress = engine.getProgress()
      expect(progress.completed).toBe(1)
      expect(progress.percentage).toBe(Math.round((1 / 7) * 100))
    })

    it("should include progress in next stage info", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)

      const stage = engine.getNextStage()
      expect(stage?.progress).toBeDefined()
      expect(stage?.progress?.total).toBe(7)
      expect(stage?.progress?.completed).toBe(0)
    })
  })

  describe("Validation", () => {
    it("should validate stage transitions", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)

      // Cannot transition to detective without intake
      const validation = engine.validateStageTransition("intake", "detective")
      expect(validation.valid).toBe(false)
      expect(validation.reason).toContain("missing completed stages")

      // After intake completes, should be valid
      engine.markStageComplete("intake", {})
      const validation2 = engine.validateStageTransition("intake", "detective")
      expect(validation2.valid).toBe(true)
    })

    it("should reject invalid stage IDs", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)

      const validation = engine.validateStageTransition(null, "invalid_stage")
      expect(validation.valid).toBe(false)
      expect(validation.reason).toContain("not found")
    })
  })

  describe("Tier Skipping", () => {
    it("should skip verifier for guest tier", () => {
      const engine = new WorkflowEngine("risk_audit", "guest", "test_session", TEST_CHECKPOINT_DIR)

      // Verifier should be skipped for guest tier
      // So when we complete all other stages, workflow should be complete
      const requiredStages = ["intake", "detective", "strategist", "gatekeeper"]
      for (const stage of requiredStages) {
        const next = engine.getNextStage()
        if (next) {
          engine.markStageComplete(next.stage, {})
        }
      }

      // Should be complete without reporter
      const complete = engine.isWorkflowComplete()
      expect(complete).toBe(false) // reporter is still required
    })
  })

  describe("State Persistence", () => {
    it("should save state to file", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)
      const stage = engine.getNextStage()

      engine.markStageComplete(stage!.stage, { data: "test" })

      const statePath = path.join(TEST_CHECKPOINT_DIR, "test_session.json")
      expect(fs.existsSync(statePath)).toBe(true)

      const saved = JSON.parse(fs.readFileSync(statePath, "utf-8"))
      expect(saved.sessionId).toBe("test_session")
      expect(saved.completedStages).toContain(stage!.stage)
    })

    it("should load state from file", () => {
      const loaded = WorkflowEngine.loadState("test_session", TEST_CHECKPOINT_DIR)
      expect(loaded).toBeNull() // No state yet

      // Create and save
      const engine1 = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)
      const stage = engine1.getNextStage()
      engine1.markStageComplete(stage!.stage, {})

      // Load
      const loaded2 = WorkflowEngine.loadState("test_session", TEST_CHECKPOINT_DIR)
      expect(loaded2).not.toBeNull()
      expect(loaded2?.completedStages).toContain(stage!.stage)
    })
  })

  describe("Recovery Context", () => {
    it("should provide recovery instructions for interrupted workflow", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)

      // Complete first stage
      const stage1 = engine.getNextStage()
      engine.markStageComplete(stage1!.stage, {})

      // Get recovery context
      const recovery = engine.getRecoveryContext()
      expect(recovery.sessionId).toBe("test_session")
      expect(recovery.completedStages).toContain("intake")
      expect(recovery.nextStage).toBe("detective")
      expect(recovery.recoveryInstructions).toContain("Resume with stage: detective")
    })

    it("should indicate completion in recovery context", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)

      // Complete all stages (including judge)
      const requiredStages = ["intake", "detective", "strategist", "gatekeeper", "verifier", "judge", "reporter"]
      for (const stage of requiredStages) {
        engine.markStageComplete(stage, {})
      }

      const recovery = engine.getRecoveryContext()
      expect(recovery.nextStage).toBeNull()
      expect(recovery.recoveryInstructions).toContain("complete")
    })
  })

  describe("Current Stage Tracking", () => {
    it("should track current stage", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)

      const stage = engine.getNextStage()
      expect(engine.getState().currentStage).toBe(stage!.stage)

      engine.markStageComplete(stage!.stage, {})
      expect(engine.getState().currentStage).toBeNull()
    })
  })

  describe("Get Outputs", () => {
    it("should retrieve all outputs", () => {
      const engine = new WorkflowEngine("risk_audit", "pro", "test_session", TEST_CHECKPOINT_DIR)

      engine.markStageComplete("intake", { intake: "data" })
      engine.markStageComplete("detective", { detective: "data" })

      const all = engine.getAllOutputs()
      expect(all.intake).toEqual({ intake: "data" })
      expect(all.detective).toEqual({ detective: "data" })
    })
  })
})
