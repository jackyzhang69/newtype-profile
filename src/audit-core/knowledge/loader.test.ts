import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import fs from "node:fs"
import path from "node:path"
import { tmpdir } from "node:os"
import {
  loadInjectionProfile,
  getSkillsForAgent,
  resolveSkillWithDependencies,
} from "./loader"

describe("Skill Dependency Resolution", () => {
  let tempDir: string
  let originalCwd: string

  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = fs.mkdtempSync(path.join(tmpdir(), "skill-deps-"))
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  function createSkill(name: string, dependsOn: string[] = [], references: string[] = []) {
    const skillDir = path.join(tempDir, ".claude", "skills", name)
    const refsDir = path.join(skillDir, "references")
    fs.mkdirSync(refsDir, { recursive: true })

    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      `---\nname: ${name}\n---\nSkill body for ${name}`
    )

    fs.writeFileSync(
      path.join(refsDir, "manifest.json"),
      JSON.stringify({
        name,
        references,
        depends_on: dependsOn.length > 0 ? dependsOn : undefined,
      })
    )

    for (const ref of references) {
      fs.writeFileSync(path.join(refsDir, ref), `Content of ${ref}`)
    }
  }

  it("resolves skill dependencies in topological order", () => {
    createSkill("skill-c", [], ["c-ref.md"])
    createSkill("skill-b", ["skill-c"], ["b-ref.md"])
    createSkill("skill-a", ["skill-b"], ["a-ref.md"])

    process.chdir(tempDir)
    const resolved = resolveSkillWithDependencies("skill-a")

    expect(resolved).toEqual(["skill-c", "skill-b", "skill-a"])
  })

  it("handles circular dependencies gracefully", () => {
    createSkill("skill-a", ["skill-b"], ["a-ref.md"])
    createSkill("skill-b", ["skill-a"], ["b-ref.md"])

    process.chdir(tempDir)
    const resolved = resolveSkillWithDependencies("skill-a")

    expect(resolved.length).toBeLessThanOrEqual(2)
  })

  it("deduplicates shared dependencies", () => {
    createSkill("skill-c", [], ["c-ref.md"])
    createSkill("skill-a", ["skill-c"], ["a-ref.md"])
    createSkill("skill-b", ["skill-c"], ["b-ref.md"])

    process.chdir(tempDir)
    const visited = new Set<string>()
    const result: string[] = []
    result.push(...resolveSkillWithDependencies("skill-a", visited))
    result.push(...resolveSkillWithDependencies("skill-b", visited))

    const cCount = result.filter(s => s === "skill-c").length
    expect(cCount).toBe(1)
  })
})

describe("Injection Profile", () => {
  it("returns skills for specific agent based on inject_to", () => {
    const profile = {
      version: "test-v1",
      description: "Test profile",
      skills: {
        "skill-a": { description: "A", inject_to: ["detective", "gatekeeper"], priority: 1 },
        "skill-b": { description: "B", inject_to: ["gatekeeper"], priority: 2 },
        "skill-c": { description: "C", inject_to: ["detective"], priority: 3 },
      },
      injection_order: ["skill-a", "skill-b", "skill-c"],
    }

    const gatekeeperSkills = getSkillsForAgent(profile, "gatekeeper")
    const detectiveSkills = getSkillsForAgent(profile, "detective")

    expect(gatekeeperSkills).toEqual(["skill-a", "skill-b"])
    expect(detectiveSkills).toEqual(["skill-a", "skill-c"])
  })

  it("sorts skills by priority", () => {
    const profile = {
      version: "test-v1",
      description: "Test profile",
      skills: {
        "skill-high": { description: "H", inject_to: ["agent"], priority: 5 },
        "skill-low": { description: "L", inject_to: ["agent"], priority: 1 },
        "skill-mid": { description: "M", inject_to: ["agent"], priority: 3 },
      },
      injection_order: [],
    }

    const skills = getSkillsForAgent(profile, "agent")

    expect(skills).toEqual(["skill-low", "skill-mid", "skill-high"])
  })
})

describe("Integration", () => {
  let tempDir: string
  let originalCwd: string

  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = fs.mkdtempSync(path.join(tmpdir(), "integration-test-"))
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it("buildAuditPrompt automatically discovers skills via injection profile", () => {
    const skillsDir = path.join(tempDir, ".claude", "skills")
    
    const mainSkillDir = path.join(skillsDir, "test-knowledge-injection")
    fs.mkdirSync(path.join(mainSkillDir, "references"), { recursive: true })
    fs.writeFileSync(path.join(mainSkillDir, "SKILL.md"), "---\nname: test-knowledge-injection\n---\n")
    
    const profile = {
      version: "1.0",
      description: "Test",
      skills: {
        "target-skill": { 
          description: "Target", 
          inject_to: ["test-agent"], 
          priority: 1 
        }
      },
      injection_order: []
    }
    fs.writeFileSync(
      path.join(mainSkillDir, "references", "injection_profile.json"),
      JSON.stringify(profile)
    )

    const targetSkillDir = path.join(skillsDir, "target-skill")
    fs.mkdirSync(path.join(targetSkillDir, "references"), { recursive: true })
    fs.writeFileSync(path.join(targetSkillDir, "SKILL.md"), "---\nname: target-skill\n---\n")
    fs.writeFileSync(
      path.join(targetSkillDir, "references", "manifest.json"),
      JSON.stringify({ name: "target-skill", references: ["content.md"] })
    )
    fs.writeFileSync(path.join(targetSkillDir, "references", "content.md"), "TARGET_SKILL_CONTENT")

    const appsDir = path.join(tempDir, "apps", "test", "agents")
    fs.mkdirSync(appsDir, { recursive: true })
    fs.writeFileSync(path.join(appsDir, "test-agent.md"), "AGENT_PROMPT")

    process.chdir(tempDir)
    
    const loadedProfile = loadInjectionProfile("test")
    expect(loadedProfile).not.toBeNull()
    
    const skills = getSkillsForAgent(loadedProfile!, "test-agent")
    expect(skills).toContain("target-skill")
  })
})
