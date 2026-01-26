---
name: core-data-privacy
description: |
  Data privacy and PII management for audit workflows.
  Handles PII extraction, anonymization, and knowledge base population.
---

# Core Data Privacy

## Scope
- PII extraction from CaseProfile
- Text anonymization for training data
- Knowledge base entry creation
- TTL management for sensitive data

## Injection Target
- Reporter agent (for dual-output generation)

## Privacy Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| `minimal` | Names only replaced | Internal review |
| `conservative` | Names, IDs, dates replaced with numbered placeholders | Default for KB |
| `aggressive` | All PII replaced with generic placeholders | Public sharing |

## Workflow Integration

### At Intake Stage
1. Extract PII from CaseProfile using `extractPIIFromProfile()`
2. Store in `io_case_pii` table with 30-day TTL
3. Track raw document paths for later cleanup

### At Reporter Stage
1. Generate standard report (with PII)
2. Generate anonymized version using `sanitizeReport()`
3. Extract abstract features using `extractFeaturesFromProfile()`
4. Create knowledge base entry

## API Reference

### PII Extraction
```typescript
import { extractPIIFromProfile } from "src/audit-core/privacy"

const pii = extractPIIFromProfile(sessionId, profile, userId)
await createCasePII(pii)
```

### Text Sanitization
```typescript
import { sanitizeReport, sanitizeReasoningChain } from "src/audit-core/privacy"

const { text, piiCount } = sanitizeReport(report, {
  sponsorName: profile.sponsor.name,
  applicantName: profile.applicant.name,
}, "conservative")
```

### Feature Extraction
```typescript
import { extractFeaturesFromProfile, extractRiskFactors } from "src/audit-core/privacy"

const features = extractFeaturesFromProfile(profile, sessionId)
features.risk_factors = extractRiskFactors(profile)
features.vulnerabilities = extractVulnerabilities(profile)
features.strengths = extractStrengths(profile)

await createKnowledgeBaseEntry(features)
```

## TTL Management

### Default Retention
- PII data: 30 days (configurable via `io_config.pii_retention_days`)
- Knowledge base: Permanent (anonymized)

### Extending Retention
```typescript
import { extendPIIRetention } from "src/audit-core/persistence"

await extendPIIRetention(sessionId, 30) // Add 30 more days
```

### Manual Cleanup
```typescript
import { deleteCasePII } from "src/audit-core/persistence"

await deleteCasePII(sessionId) // Immediate deletion
```

## Compliance Notes

### PIPEDA Compliance
- PII stored separately from analysis results
- Automatic TTL cleanup
- User can request immediate deletion
- Anonymized data retained for legitimate business purpose (AI training)

### Data Minimization
- Only essential PII fields extracted
- Raw documents tracked for coordinated deletion
- Knowledge base contains no directly identifying information

## Output Artifacts

### Standard Report
- Full PII preserved
- For client delivery
- Stored in `io_reports` with `is_anonymized = false`

### Anonymized Report
- All PII replaced
- For knowledge base
- Stored with `is_anonymized = true`, `anonymize_level = 'conservative'`

### Knowledge Base Entry
- Abstract features only (age ranges, country codes)
- Anonymized analysis text
- Verdict and score for supervised learning
