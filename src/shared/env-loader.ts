import { existsSync, readFileSync } from "fs"
import { join } from "path"

export function loadEnvFile(directory: string): void {
  const envPath = join(directory, ".env")
  
  if (!existsSync(envPath)) {
    return
  }

  try {
    const content = readFileSync(envPath, "utf-8")
    const lines = content.split("\n")
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      if (!trimmed || trimmed.startsWith("#")) {
        continue
      }
      
      const eqIndex = trimmed.indexOf("=")
      if (eqIndex === -1) {
        continue
      }
      
      const key = trimmed.slice(0, eqIndex).trim()
      let value = trimmed.slice(eqIndex + 1).trim()
      
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      
      if (key && process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  } catch {
  }
}
