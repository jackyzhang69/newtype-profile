# Audit Tiers Reference

> Detailed documentation for the tiered audit system.

---

## Overview

The audit system uses a tiered architecture to provide differentiated service levels based on user subscriptions. This aligns with the commercial pricing strategy.

## Tier Definitions

| Tier | Target User | Monthly Fee | AI Level |
|------|-------------|-------------|----------|
| **Guest** | DIY applicants / Unpaid | $0 | Basic |
| **Pro** | Licensed consultants (B2B) | $99 CAD | Standard |
| **Ultra** | High-volume consultants | $299 CAD | Premium |

---

## Model Configuration

| Agent | Guest | Pro | Ultra |
|-------|-------|-----|-------|
| **AuditManager** | gemini-3-flash | claude-sonnet-4-5 | claude-opus-4-5 |
| **Detective** | gemini-3-flash | gemini-3-pro-high | claude-sonnet-4-5 |
| **Strategist** | gemini-3-flash | claude-sonnet-4-5 | claude-sonnet-4-5 |
| **Gatekeeper** | gemini-3-flash | claude-sonnet-4-5 | claude-sonnet-4-5 |
| **Verifier** | gemini-3-flash | gemini-3-flash | claude-haiku-4-5 |

---

## Temperature Settings

| Agent | Guest | Pro | Ultra |
|-------|-------|-----|-------|
| AuditManager | 0.3 | 0.2 | 0.2 |
| Detective | 0.2 | 0.1 | 0.1 |
| Strategist | 0.4 | 0.3 | 0.3 |
| Gatekeeper | 0.2 | 0.1 | 0.1 |
| Verifier | 0.0 | 0.0 | 0.0 |

---

## Feature Matrix

| Feature | Guest | Pro | Ultra |
|---------|-------|-----|-------|
| **Verifier** (citation check) | Yes | Yes | Yes |
| **Max Verify Iterations** | 1 | 2 | 3 |
| **KG Search** (similar cases) | No | Yes | Yes |
| **Deep Analysis** (L2 MCP) | No | No | Yes |
| **Multi-Round** review | No | No | Yes |
| **Max Citations** | 3 | 10 | 20 |
| **Max Agent Calls** | 4 | 6 | 12 |

---

## Cost & Time Estimates

| Tier | Est. Cost/Case | Est. Time |
|------|----------------|-----------|
| Guest | ~$0.5 | 30s |
| Pro | ~$2-3 | 2-3min |
| Ultra | ~$5-8 | 5-8min |

---

## Configuration

### Environment Variable
```bash
export AUDIT_TIER=pro  # guest | pro | ultra
```

### Config File
```json
// .opencode/oh-my-opencode.json
{
  "audit_tier": "pro"
}
```

### Priority
Environment variable > Config file > Default (`guest`)

---

## Implementation

### Type Definitions
```typescript
// src/audit-core/tiers/types.ts
export type AuditTier = "guest" | "pro" | "ultra"

export interface TierConfig {
  models: TierModelConfig
  temperatures: TierTemperatures
  features: TierFeatures
  limits: TierLimits
}
```

### Loading Tier Config
```typescript
// src/audit-core/tiers/loader.ts
import { getTierConfig, getAuditTier } from "./loader"

const tier = getAuditTier()         // Returns current tier
const config = getTierConfig(tier)  // Returns full config
```

### Using in Agents
```typescript
// src/audit-core/agents/audit-manager.ts
import { getAuditManagerModel, getAuditManagerTemperature } from "../types"

const model = getAuditManagerModel()           // Tier-aware
const temperature = getAuditManagerTemperature() // Tier-aware
```

---

## Single-Purchase Option

Guest users can:
- **Single purchase** $397 for one Pro-level audit
- **Upgrade subscription** to Pro/Ultra

This is implemented via `audit_tier_override` which temporarily elevates the tier for a single session.

---

## Related Files

- `src/audit-core/tiers/types.ts` - Type definitions
- `src/audit-core/tiers/config.ts` - Tier configurations
- `src/audit-core/tiers/loader.ts` - Loading functions
- `src/audit-core/types.ts` - Dynamic model getters
