/**
 * Audit Core Configuration
 * 
 * Centralized configuration exports for audit system
 */

export {
  SERVER_CONFIG,
  SERVICE_PORTS,
  SERVICE_CONFIGS,
  resolveServiceUrls,
  getServiceUrl,
  getServiceUrlsWithFallback,
  getKgBaseUrl,
  getFileContentBaseUrl,
  type ServiceUrlConfig,
} from "./service-urls"
