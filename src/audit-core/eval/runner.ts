import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const baseAppsPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "apps"
)

type EvalRecord = {
  case_id?: string
  profile?: Record<string, unknown>
  expected?: Record<string, unknown>
}

function loadJson(filePath: string): EvalRecord {
  const raw = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(raw) as EvalRecord
}

function validateRecord(record: EvalRecord, filePath: string): string[] {
  const errors: string[] = []
  if (!record.case_id) errors.push(`${filePath} missing case_id`)
  if (!record.profile) errors.push(`${filePath} missing profile`)
  if (!record.expected) errors.push(`${filePath} missing expected`)
  return errors
}

export function runEvalChecks(): string[] {
  const errors: string[] = []
  const appDirs = fs
    .readdirSync(baseAppsPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

  for (const appId of appDirs) {
    const evalDir = path.join(baseAppsPath, appId, "eval")
    if (!fs.existsSync(evalDir)) {
      errors.push(`[${appId}] missing eval directory`)
      continue
    }

    const files = fs.readdirSync(evalDir).filter((name) => name.endsWith(".json"))
    if (files.length === 0) {
      errors.push(`[${appId}] eval directory has no json cases`)
      continue
    }

    for (const file of files) {
      const record = loadJson(path.join(evalDir, file))
      errors.push(...validateRecord(record, path.join(evalDir, file)))
    }
  }

  return errors
}

if (import.meta.main) {
  const errors = runEvalChecks()
  if (errors.length > 0) {
    console.error("Eval check failed")
    for (const error of errors) console.error(error)
    process.exit(1)
  }
  console.log("Eval check passed")
}
