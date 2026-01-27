/**
 * End-to-End Workflow Tests
 * Comprehensive tests for full audit workflow execution
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import * as fs from "fs"
import * as path from "path"
import { WorkflowEngine } from "./engine"
import { CheckpointValidator } from "../../hooks/audit-workflow-enforcer/checkpoint"
import { TierEnforcer } from "../../hooks/audit-workflow-enforcer/tier-enforcer"

const TEST_CHECKPOINT_DIR = "/tmp/test-e2e-checkpoints"

function setupTestEnv() {
  if (!fs.existsSync(TEST_CHECKPOINT_DIR)) {
    fs.mkdirSync(TEST_CHECKPOINT_DIR, { recursive: true })
  }
}

function cleanupTestEnv() {
  if (fs.existsSync(TEST_CHECKPOINT_DIR)) {
    const files = fs.readdirSync(TEST_CHECKPOINT_DIR)
    files.forEach((file) => {
      fs.unlinkSync(path.join(TEST_CHECKPOINT_DIR, file))
    })
  }
}

describe("Full Audit Workflow E2E", () => {
  beforeEach(() => {
    setupTestEnv()
  })

  afterEach(() => {
    cleanupTestEnv()
  })

  describe("RISK_AUDIT Workflow", () => {
    it("should execute all 6 stages in correct order", () => {
      const sessionId = "test_e2e_1"
      const engine = new WorkflowEngine("risk_audit", "pro", sessionId, TEST_CHECKPOINT_DIR)

      const executedStages: string[] = []

      // Simulate workflow execution
      let stage = engine.getNextStage()
      while (stage) {
        executedStages.push(stage.stage)
        engine.markStageComplete(stage.stage, { data: `output_${stage.stage}` })
        stage = engine.getNextStage()
      }

      expect(executedStages).toEqual([
        "intake",
        "detective",
        "strategist",
        "gatekeeper",
        "verifier",
        "judge",
        "reporter",
      ])
    })

    it("should prevent skipping stages", () => {
      const sessionId = "test_e2e_2"
      const engine = new WorkflowEngine("risk_audit", "pro", sessionId, TEST_CHECKPOINT_DIR)

      // First stage should be intake
      const first = engine.getNextStage()
      expect(first?.stage).toBe("intake")

      // Cannot skip to strategist without completing intake and detective
      const validation = engine.validateStageTransition("intake", "strategist")
      expect(validation.valid).toBe(false)
    })

    it("should persist state across engine instances", () => {
      const sessionId = "test_e2e_3"

      // Create first engine, complete intake
      const engine1 = new WorkflowEngine("risk_audit", "pro", sessionId, TEST_CHECKPOINT_DIR)
      let stage = engine1.getNextStage()
      engine1.markStageComplete(stage!.stage, { fact_data: "test" })

      // Load with new engine
      const engine2 = new WorkflowEngine("risk_audit", "pro", sessionId, TEST_CHECKPOINT_DIR)
      const nextStage = engine2.getNextStage()

      expect(nextStage?.stage).toBe("detective")
      expect(engine2.getCompletedStages()).toContain("intake")
    })

    it("should track progress correctly", () => {
      const sessionId = "test_e2e_4"
      const engine = new WorkflowEngine("risk_audit", "pro", sessionId, TEST_CHECKPOINT_DIR)

      let progress = engine.getProgress()
      expect(progress.completed).toBe(0)
      expect(progress.total).toBe(7)
      expect(progress.percentage).toBe(0)

      const requiredStages = ["intake", "detective", "strategist"]
      for (const s of requiredStages) {
        engine.markStageComplete(s, {})
      }

      progress = engine.getProgress()
      expect(progress.completed).toBe(3)
      expect(progress.percentage).toBe(Math.round((3 / 7) * 100))
    })

    it("should support retry logic with limits", () => {
      const sessionId = "test_e2e_5"
      const engine = new WorkflowEngine("risk_audit", "pro", sessionId, TEST_CHECKPOINT_DIR)

      // Get intake stage (retry_limit: 2)
      const stage = engine.getNextStage()
      expect(stage?.stage).toBe("intake")

      // Can retry twice
      expect(engine.canRetryStage("intake")).toBe(true)
      engine.incrementRetry("intake")

      expect(engine.canRetryStage("intake")).toBe(true)
      engine.incrementRetry("intake")

      // Third retry not allowed
      expect(engine.canRetryStage("intake")).toBe(false)
    })
  })

  describe("DOCUMENT_LIST Workflow", () => {
    it("should execute 2-stage checklist workflow", () => {
      const sessionId = "test_e2e_6"
      const engine = new WorkflowEngine("document_list", "pro", sessionId, TEST_CHECKPOINT_DIR)

      const stages: string[] = []
      let stage = engine.getNextStage()

      while (stage) {
        stages.push(stage.stage)
        engine.markStageComplete(stage.stage, {})
        stage = engine.getNextStage()
      }

      expect(stages).toEqual(["intake", "gatekeeper", "judge"])
    })
  })

  describe("CLIENT_GUIDANCE Workflow", () => {
    it("should execute 2-stage guidance workflow", () => {
      const sessionId = "test_e2e_7"
      const engine = new WorkflowEngine("client_guidance", "pro", sessionId, TEST_CHECKPOINT_DIR)

      const stages: string[] = []
      let stage = engine.getNextStage()

      while (stage) {
        stages.push(stage.stage)
        engine.markStageComplete(stage.stage, {})
        stage = engine.getNextStage()
      }

      expect(stages).toEqual(["intake", "guidance", "judge"])
    })
  })

  describe("Tier-Based Enforcement", () => {
    it("should enforce guest tier limits", () => {
      const sessionId = "test_e2e_8"
      const enforcer = new TierEnforcer(sessionId, "guest")

      // Guest: max 4 agent calls
      for (let i = 0; i < 4; i++) {
        const check = enforcer.checkAgentCallLimit()
        expect(check.allowed).toBe(true)
        enforcer.incrementAgentCall("intake")
      }

      // 5th call blocked
      const check = enforcer.checkAgentCallLimit()
      expect(check.allowed).toBe(false)
    })

    it("should enforce pro tier limits", () => {
      const sessionId = "test_e2e_9"
      const enforcer = new TierEnforcer(sessionId, "pro")

      // Pro: max 6 agent calls
      for (let i = 0; i < 6; i++) {
        expect(enforcer.checkAgentCallLimit().allowed).toBe(true)
        enforcer.incrementAgentCall("detective")
      }

      expect(enforcer.checkAgentCallLimit().allowed).toBe(false)
    })

    it("should enable verifier only for pro and ultra tiers", () => {
      const guestEnforcer = new TierEnforcer("guest", "guest")
      expect(guestEnforcer.isFeatureEnabled("verifier")).toBe(false)

      const proEnforcer = new TierEnforcer("pro", "pro")
      expect(proEnforcer.isFeatureEnabled("verifier")).toBe(true)

      const ultraEnforcer = new TierEnforcer("ultra", "ultra")
      expect(ultraEnforcer.isFeatureEnabled("verifier")).toBe(true)
    })

    it("should track usage statistics", () => {
      const sessionId = "test_e2e_10"
      const enforcer = new TierEnforcer(sessionId, "pro")

      enforcer.incrementAgentCall("intake")
      enforcer.incrementAgentCall("detective")
      enforcer.incrementAgentCall("detective")

      const stats = enforcer.getUsageStats()
      expect(stats.agentCallsUsed).toBe(3)
      expect(stats.agentBreakdown["intake"]).toBe(1)
      expect(stats.agentBreakdown["detective"]).toBe(2)
    })
  })

  describe("Checkpoint Recovery", () => {
    it("should provide recovery context for interrupted workflow", () => {
      const sessionId = "test_e2e_11"
      const engine = new WorkflowEngine("risk_audit", "pro", sessionId, TEST_CHECKPOINT_DIR)

      // Complete first two stages
      const stage1 = engine.getNextStage()
      engine.markStageComplete(stage1!.stage, {})

      const stage2 = engine.getNextStage()
      engine.markStageComplete(stage2!.stage, {})

      // Get recovery context
      const recovery = engine.getRecoveryContext()

      expect(recovery.sessionId).toBe(sessionId)
      expect(recovery.completedStages).toContain("intake")
      expect(recovery.completedStages).toContain("detective")
      expect(recovery.nextStage).toBe("strategist")
      expect(recovery.recoveryInstructions).toContain("Resume with stage: strategist")
    })

    it("should indicate completion in recovery context", () => {
      const sessionId = "test_e2e_12"
      const engine = new WorkflowEngine("risk_audit", "pro", sessionId, TEST_CHECKPOINT_DIR)

      // Complete all stages
      const requiredStages = ["intake", "detective", "strategist", "gatekeeper", "verifier", "judge", "reporter"]
      for (const stage of requiredStages) {
        engine.markStageComplete(stage, {})
      }

      const recovery = engine.getRecoveryContext()
      expect(recovery.nextStage).toBeNull()
      expect(recovery.recoveryInstructions).toContain("complete")
    })

    it("should validate checkpoint consistency", () => {
      const sessionId = "test_e2e_13"
      const checkpoint = new CheckpointValidator(sessionId, TEST_CHECKPOINT_DIR)

      // Initially no checkpoint
      expect(checkpoint.exists()).toBe(false)

      // Create workflow and mark stage complete
      const engine = new WorkflowEngine("risk_audit", "pro", sessionId, TEST_CHECKPOINT_DIR)
      const stage = engine.getNextStage()
      engine.markStageComplete(stage!.stage, {})

      // Now checkpoint exists
      expect(checkpoint.exists()).toBe(true)
      expect(checkpoint.getCurrentStage()).toBeNull()
      expect(checkpoint.getCompletedStages()).toContain("intake")
    })
  })

  describe("State Validation", () => {
    it("should track current stage correctly", () => {
      const sessionId = "test_e2e_14"
      const engine = new WorkflowEngine("risk_audit", "pro", sessionId, TEST_CHECKPOINT_DIR)

      const stage = engine.getNextStage()
      expect(engine.getState().currentStage).toBe(stage!.stage)

      engine.markStageComplete(stage!.stage, {})
      expect(engine.getState().currentStage).toBeNull()
    })

    it("should retrieve all stage outputs", () => {
      const sessionId = "test_e2e_15"
      const engine = new WorkflowEngine("risk_audit", "pro", sessionId, TEST_CHECKPOINT_DIR)

      engine.markStageComplete("intake", { profile: "data" })
      engine.markStageComplete("detective", { citations: ["1", "2"] })

      const outputs = engine.getAllOutputs()
      expect(outputs.intake).toEqual({ profile: "data" })
      expect(outputs.detective).toEqual({ citations: ["1", "2"] })
    })

    it("should mark workflow as complete only when all required stages done", () => {
      const sessionId = "test_e2e_16"
      const engine = new WorkflowEngine("risk_audit", "pro", sessionId, TEST_CHECKPOINT_DIR)

      expect(engine.isWorkflowComplete()).toBe(false)

      // Complete all required stages
      const requiredStages = ["intake", "detective", "strategist", "gatekeeper", "verifier", "judge", "reporter"]
      for (const stage of requiredStages) {
        engine.markStageComplete(stage, {})
      }

      expect(engine.isWorkflowComplete()).toBe(true)
    })
  })
})
