export interface AuditTaskArgs {
  description: string
  prompt: string
  subagent_type: string
  run_in_background: boolean
  resume?: string
  skills: string[]
}

export interface AuditTaskToolOptions {
  manager: import("../../features/background-agent").BackgroundManager
  client: import("@opencode-ai/plugin").PluginInput["client"]
}
