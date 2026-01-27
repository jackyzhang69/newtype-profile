/**
 * Service URL Configuration
 * 
 * Centralized configuration for all ImmiCore service URLs.
 * Provides fallback chain: ENV -> LAN -> Public -> Default
 */

import { getEnvVar } from "../http-client"

/**
 * Service URL configuration with fallback chain
 */
export interface ServiceUrlConfig {
  /** Service name for logging */
  name: string
  /** Port number */
  port: number
  /** Environment variable name for explicit URL override */
  envVar?: string
  /** LAN IP address (192.168.1.98) */
  lanIp: string
  /** Public domain (es_search.jackyzhang.app) */
  publicDomain?: string
  /** API path suffix */
  apiPath: string
}

/**
 * Default server configuration
 */
export const SERVER_CONFIG = {
  /** LAN IP address for ImmiCore services */
  LAN_IP: "192.168.1.98",
  
  /** Public domain for ImmiCore services */
  PUBLIC_DOMAIN: "es_search.jackyzhang.app",
  
  /** Default API path */
  API_PATH: "/api/v1",
} as const

/**
 * Service port mapping
 */
export const SERVICE_PORTS = {
  FILE_CONTENT: 3104,
  CASELAW: 3105,
  EMAIL_KG: 3106,
  OPERATION_MANUAL: 3107,
  NOC: 3108,
  HELP_CENTRE: 3109,
} as const

/**
 * Service configurations
 */
export const SERVICE_CONFIGS: Record<string, ServiceUrlConfig> = {
  fileContent: {
    name: "File Content Extraction",
    port: SERVICE_PORTS.FILE_CONTENT,
    envVar: "FILE_CONTENT_BASE_URL",
    lanIp: SERVER_CONFIG.LAN_IP,
    publicDomain: SERVER_CONFIG.PUBLIC_DOMAIN,
    apiPath: SERVER_CONFIG.API_PATH,
  },
  knowledgeGraph: {
    name: "Knowledge Graph API",
    port: SERVICE_PORTS.FILE_CONTENT, // KG uses same port as file-content
    envVar: "AUDIT_KG_BASE_URL",
    lanIp: SERVER_CONFIG.LAN_IP,
    publicDomain: SERVER_CONFIG.PUBLIC_DOMAIN,
    apiPath: SERVER_CONFIG.API_PATH,
  },
  caselaw: {
    name: "Caselaw MCP",
    port: SERVICE_PORTS.CASELAW,
    lanIp: SERVER_CONFIG.LAN_IP,
    apiPath: SERVER_CONFIG.API_PATH,
  },
  operationManual: {
    name: "Operation Manual MCP",
    port: SERVICE_PORTS.OPERATION_MANUAL,
    lanIp: SERVER_CONFIG.LAN_IP,
    apiPath: SERVER_CONFIG.API_PATH,
  },
  helpCentre: {
    name: "Help Centre MCP",
    port: SERVICE_PORTS.HELP_CENTRE,
    lanIp: SERVER_CONFIG.LAN_IP,
    apiPath: SERVER_CONFIG.API_PATH,
  },
} as const

/**
 * Build URL from config
 */
function buildUrl(config: ServiceUrlConfig, protocol: "http" | "https", useDomain: boolean): string {
  const host = useDomain && config.publicDomain 
    ? config.publicDomain 
    : config.lanIp
  
  return `${protocol}://${host}:${config.port}${config.apiPath}`
}

/**
 * Resolve service URL with fallback chain
 * 
 * Priority order:
 * 1. Explicit environment variable (if configured)
 * 2. LAN IP (http://192.168.1.98:PORT/api/v1)
 * 3. Public domain HTTPS (https://es_search.jackyzhang.app:PORT/api/v1)
 * 4. Public domain HTTP (http://es_search.jackyzhang.app:PORT/api/v1)
 * 
 * @param serviceName - Service name from SERVICE_CONFIGS
 * @returns Array of URLs in priority order
 */
export function resolveServiceUrls(serviceName: keyof typeof SERVICE_CONFIGS): string[] {
  const config = SERVICE_CONFIGS[serviceName]
  if (!config) {
    throw new Error(`Unknown service: ${serviceName}`)
  }

  const urls: string[] = []

  // 1. Explicit environment variable
  if (config.envVar) {
    const explicit = getEnvVar(config.envVar)
    if (explicit) {
      urls.push(explicit.replace(/\/$/, ""))
    }
  }

  // 2. LAN IP (HTTP only for internal network)
  urls.push(buildUrl(config, "http", false))

  // 3. Public domain (HTTPS preferred, then HTTP)
  if (config.publicDomain) {
    urls.push(buildUrl(config, "https", true))
    urls.push(buildUrl(config, "http", true))
  }

  return urls
}

/**
 * Get primary service URL (first in priority chain)
 * 
 * @param serviceName - Service name from SERVICE_CONFIGS
 * @returns Primary URL
 */
export function getServiceUrl(serviceName: keyof typeof SERVICE_CONFIGS): string {
  const urls = resolveServiceUrls(serviceName)
  return urls[0]
}

/**
 * Get all service URLs for fallback attempts
 * 
 * @param serviceName - Service name from SERVICE_CONFIGS
 * @returns All URLs in priority order
 */
export function getServiceUrlsWithFallback(serviceName: keyof typeof SERVICE_CONFIGS): string[] {
  return resolveServiceUrls(serviceName)
}

/**
 * Legacy compatibility: Get base URL for KG API
 * @deprecated Use getServiceUrl('knowledgeGraph') instead
 */
export function getKgBaseUrl(): string {
  return getServiceUrl("knowledgeGraph")
}

/**
 * Legacy compatibility: Get base URL for File Content service
 * @deprecated Use getServiceUrl('fileContent') instead
 */
export function getFileContentBaseUrl(): string {
  return getServiceUrl("fileContent")
}
