import * as fs from "fs";
import * as path from "path";
import { OhMyOpenCodeConfigSchema, type OhMyOpenCodeConfig } from "./config";
import {
  log,
  deepMerge,
  getUserConfigDir,
  addConfigLoadError,
  parseJsonc,
  detectConfigFile,
  migrateConfigFile,
} from "./shared";

import { getImmicoreMcpConfigs, getImmicorePath } from "./audit-core/mcp-bridge";
import { validateAuditKnowledge } from "./audit-core/knowledge/validator";
import { validateAuditSkills } from "./audit-core/skills/validator";

export function loadConfigFromPath(
  configPath: string,
  ctx: unknown
): OhMyOpenCodeConfig | null {
  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");
      const rawConfig = parseJsonc<Record<string, unknown>>(content);

      migrateConfigFile(configPath, rawConfig);

      const result = OhMyOpenCodeConfigSchema.safeParse(rawConfig);

      if (!result.success) {
        const errorMsg = result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", ");
        log(`Config validation error in ${configPath}:`, result.error.issues);
        addConfigLoadError({
          path: configPath,
          error: `Validation error: ${errorMsg}`,
        });
        return null;
      }

      log(`Config loaded from ${configPath}`, { 
        agents: result.data.agents,
        mcp: result.data.mcp,
        google_auth: result.data.google_auth,
      });
      return result.data;
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    log(`Error loading config from ${configPath}:`, err);
    addConfigLoadError({ path: configPath, error: errorMsg });
  }
  return null;
}

export function mergeConfigs(
  base: OhMyOpenCodeConfig,
  override: OhMyOpenCodeConfig
): OhMyOpenCodeConfig {
  return {
    ...base,
    ...override,
    agents: deepMerge(base.agents, override.agents),
    disabled_agents: [
      ...new Set([
        ...(base.disabled_agents ?? []),
        ...(override.disabled_agents ?? []),
      ]),
    ],
    disabled_mcps: [
      ...new Set([
        ...(base.disabled_mcps ?? []),
        ...(override.disabled_mcps ?? []),
      ]),
    ],
    disabled_hooks: [
      ...new Set([
        ...(base.disabled_hooks ?? []),
        ...(override.disabled_hooks ?? []),
      ]),
    ],
    disabled_commands: [
      ...new Set([
        ...(base.disabled_commands ?? []),
        ...(override.disabled_commands ?? []),
      ]),
    ],
    disabled_skills: [
      ...new Set([
        ...(base.disabled_skills ?? []),
        ...(override.disabled_skills ?? []),
      ]),
    ],
    claude_code: deepMerge(base.claude_code, override.claude_code),
    mcp: deepMerge(base.mcp, override.mcp),
  };
}

export function loadPluginConfig(
  directory: string,
  ctx: unknown
): OhMyOpenCodeConfig {
  // User-level config path (OS-specific) - prefer .jsonc over .json
  const userBasePath = path.join(
    getUserConfigDir(),
    "opencode",
    "oh-my-opencode"
  );
  const userDetected = detectConfigFile(userBasePath);
  const userConfigPath =
    userDetected.format !== "none"
      ? userDetected.path
      : userBasePath + ".json";

  // Project-level config path - prefer .jsonc over .json
  const projectBasePath = path.join(directory, ".opencode", "oh-my-opencode");
  const projectDetected = detectConfigFile(projectBasePath);
  const projectConfigPath =
    projectDetected.format !== "none"
      ? projectDetected.path
      : projectBasePath + ".json";

  // Load user config first (base)
  let config: OhMyOpenCodeConfig =
    loadConfigFromPath(userConfigPath, ctx) ?? {};

  // Override with project config
  const projectConfig = loadConfigFromPath(projectConfigPath, ctx);
  if (projectConfig) {
    config = mergeConfigs(config, projectConfig);
  }

  if (config.audit_app) {
    process.env.AUDIT_APP = config.audit_app
  }

  if (config.search_policy) {
    process.env.AUDIT_SEARCH_POLICY = config.search_policy
  }

  if (config.web_whitelist) {
    process.env.AUDIT_WEB_WHITELIST = JSON.stringify(config.web_whitelist)
  }

  if (config.audit_kg_base_url) {
    process.env.AUDIT_KG_BASE_URL = config.audit_kg_base_url
  }

  if (config.audit_mcp_transport) {
    process.env.AUDIT_MCP_TRANSPORT = config.audit_mcp_transport
  }

  if (config.audit_mcp_host) {
    process.env.AUDIT_MCP_HOST = config.audit_mcp_host
  }

  const validateEnv = process.env.AUDIT_VALIDATE_KNOWLEDGE?.trim()
  const shouldValidate = validateEnv === undefined
    ? config.audit_validate_knowledge !== false
    : validateEnv !== "false"

  if (shouldValidate) {
    const issues = validateAuditKnowledge()
    if (issues.length > 0) {
      log("Audit knowledge validation issues", issues)
    }

    const skillIssues = validateAuditSkills()
    if (skillIssues.length > 0) {
      log("Audit skill validation issues", skillIssues)
    }
  }

  log("Final merged config", {
    agents: config.agents,
    disabled_agents: config.disabled_agents,
    disabled_mcps: config.disabled_mcps,
    disabled_hooks: config.disabled_hooks,
    claude_code: config.claude_code,
    mcp: config.mcp,
    audit_app: config.audit_app,
    search_policy: config.search_policy,
  });

  // Merge Immicore MCP configs if available
  try {
    const immicorePath = getImmicorePath();
    if (fs.existsSync(immicorePath)) {
      const immicoreConfigs = getImmicoreMcpConfigs();
      config.mcp = deepMerge(immicoreConfigs as any, config.mcp || {});
      log("Merged Immicore MCP configs", Object.keys(immicoreConfigs));
    }
  } catch (err) {
    log("Failed to load Immicore MCP configs", err);
  }

  return config;
}
