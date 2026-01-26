import { createClient, SupabaseClient } from "@supabase/supabase-js"

let supabaseClient: SupabaseClient | null = null

function getEnvVar(name: string, required = true): string {
  const value = process.env[name]
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value ?? ""
}

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  const url = getEnvVar("SUPABASE_URL")
  const serviceRoleKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY")

  supabaseClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseClient
}

export function resetSupabaseClient(): void {
  supabaseClient = null
}

export function getStorageBucket(): string {
  return getEnvVar("SUPABASE_STORAGE_BUCKET", false) || "audit-documents"
}
