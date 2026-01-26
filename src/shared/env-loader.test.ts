import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { loadEnvFile } from "./env-loader"
import { mkdirSync, writeFileSync, rmSync, existsSync } from "fs"
import { join } from "path"

describe("loadEnvFile", () => {
  const testDir = join(import.meta.dir, "__test_env__")

  beforeEach(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
  })

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
    delete process.env.TEST_VAR_1
    delete process.env.TEST_VAR_2
    delete process.env.TEST_VAR_3
  })

  it("#given .env file exists #when loading #then sets process.env variables", () => {
    writeFileSync(join(testDir, ".env"), "TEST_VAR_1=hello\nTEST_VAR_2=world")

    loadEnvFile(testDir)

    expect(process.env.TEST_VAR_1).toBe("hello")
    expect(process.env.TEST_VAR_2).toBe("world")
  })

  it("#given .env file with quotes #when loading #then strips quotes", () => {
    writeFileSync(join(testDir, ".env"), 'TEST_VAR_1="quoted value"\nTEST_VAR_2=\'single quoted\'')

    loadEnvFile(testDir)

    expect(process.env.TEST_VAR_1).toBe("quoted value")
    expect(process.env.TEST_VAR_2).toBe("single quoted")
  })

  it("#given .env file with comments #when loading #then ignores comments", () => {
    writeFileSync(join(testDir, ".env"), "# comment\nTEST_VAR_1=value\n# another comment")

    loadEnvFile(testDir)

    expect(process.env.TEST_VAR_1).toBe("value")
  })

  it("#given env var already set #when loading #then does not override", () => {
    process.env.TEST_VAR_1 = "existing"
    writeFileSync(join(testDir, ".env"), "TEST_VAR_1=new_value")

    loadEnvFile(testDir)

    expect(process.env.TEST_VAR_1).toBe("existing")
  })

  it("#given no .env file #when loading #then does nothing", () => {
    loadEnvFile(testDir)
    expect(process.env.TEST_VAR_1).toBeUndefined()
  })
})
