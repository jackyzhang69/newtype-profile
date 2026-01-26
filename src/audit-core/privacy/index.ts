export {
  extractPIIFromProfile,
  hasPII,
  extractPIIEntities,
} from "./extract-pii"

export {
  calculateAgeRange,
  calculateFundsRange,
  calculateRelationshipDurationMonths,
  extractFeaturesFromProfile,
  extractRiskFactors,
  extractVulnerabilities,
  extractStrengths,
} from "./extract-features"

export {
  sanitizeText,
  sanitizeReport,
  sanitizeReasoningChain,
  createAnonymizedSummary,
  batchSanitize,
  type SanitizeOptions,
  type SanitizeResult,
} from "./sanitize"

export {
  processIntakePII,
  processReportForPrivacy,
  generateDualReports,
  type PrivacyProcessResult,
  type ProcessReportOptions,
} from "./privacy.service"
