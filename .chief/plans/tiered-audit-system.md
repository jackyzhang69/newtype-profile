# Immi-OS 多层级审计系统方案 (Tiered Audit System)

**Created**: 2026-01-18
**Status**: Implemented (2026-01-16)
**Author**: Planning Session
**Reference**: `~/audit/docs/specs/platform/03_payment_billing.md`

---

## 一、商业目标

实现基于用户订阅层级的差异化审计服务，与 `~/audit` 项目的定价策略保持一致。

### 1.1 层级定义 (与 audit 项目对齐)

| 层级 | 定位 | 订阅费 | 月度额度 | AI 审计层级 |
|------|------|--------|----------|-------------|
| **Guest** | DIY 申请人 / 未付费 | $0 | 0 Credits | `guest` (基础) |
| **Pro** | 独立持牌顾问 (B2B) | $99 CAD/月 | 5 Credits | `pro` (标准) |
| **Ultra** | 高产出顾问 / Max 用户 | $299 CAD/月 | 20 Credits | `ultra` (高级) |

### 1.2 服务消耗规则

| 服务产品 | Guest (单次付费) | Pro/Ultra (用 Credit) |
|----------|------------------|----------------------|
| **Tier 1: AI Judicial Audit** | $397 CAD | 1 Credit |
| **Tier 2: Certified Review** (含签字) | $1,297 CAD | $800 CAD (Wholesale) |
| **Tier 3: Refusal Rescue** | $897 CAD | $500 CAD (Wholesale) |

### 1.3 单次付费场景

Guest 用户可以：
- **单次购买** $397 获得一次 `pro` 级别的 AI 审计
- **升级订阅** 成为 Pro/Ultra 用户

这对应 immi-os 的 `audit_tier_override` 功能。

---

## 二、模型配置矩阵

### 2.1 各层级模型分配

| Agent | Guest (基础) | Pro (标准) | Ultra (高级) |
|-------|-------------|------------|--------------|
| **AuditManager** | gemini-3-flash | claude-sonnet-4-5 | **claude-opus-4-5** |
| **Detective** | gemini-3-flash | gemini-3-pro-high | claude-sonnet-4-5 |
| **Strategist** | gemini-3-flash | claude-sonnet-4-5 | claude-sonnet-4-5 |
| **Gatekeeper** | gemini-3-flash | claude-sonnet-4-5 | claude-sonnet-4-5 |
| **Verifier** | N/A | gemini-3-flash | claude-haiku-4-5 |

### 2.2 Temperature 配置

| Agent | Guest | Pro | Ultra |
|-------|-------|-----|-------|
| AuditManager | 0.3 | 0.2 | 0.2 |
| Detective | 0.2 | 0.1 | 0.1 |
| Strategist | 0.4 | 0.3 | 0.3 |
| Gatekeeper | 0.2 | 0.1 | 0.1 |
| Verifier | - | 0.0 | 0.0 |

---

## 三、功能差异

| 特性 | FREE | STANDARD | PREMIUM |
|------|---------|-------------|------------|
| **Verifier (引用验证)** | No | Yes | Yes |
| **KG 搜索 (相似案例)** | No | Yes | Yes |
| **L2 深度分析 (MCP)** | No | No | Yes |
| **多轮验证** | No | No | Yes |
| **最大引用数** | 3 | 10 | 20 |
| **最大 Agent 调用** | 4 | 6 | 12 |

---

## 四、成本与时间预估

| 层级 | 预估成本/案件 | 预估时间 |
|------|--------------|----------|
| FREE | ~$0.5 | 30s |
| STANDARD | ~$2-3 | 2-3min |
| PREMIUM | ~$5-8 | 5-8min |

---

## 五、实现任务清单

### Phase 1: 配置层 (Config) ✅
- [x] 新增 `AuditTierSchema` 到 `src/config/schema.ts`
- [x] 新增 `audit_tier` 字段到 `OhMyOpenCodeConfigSchema`
- [x] 运行 `bun run build:schema` 更新 JSON Schema

### Phase 2: Tier 配置 (Tier Config) ✅
- [x] 创建 `src/audit-core/tiers/` 目录
- [x] 创建 `src/audit-core/tiers/types.ts` - 类型定义
- [x] 创建 `src/audit-core/tiers/config.ts` - 层级配置常量
- [x] 创建 `src/audit-core/tiers/loader.ts` - 配置加载函数
- [x] 创建 `src/audit-core/tiers/index.ts` - 导出

### Phase 3: Agent 重构 ✅
- [x] 修改 `src/audit-core/types.ts` - 动态获取模型和温度
- [x] 修改 `src/audit-core/agents/audit-manager.ts` - 使用 tier config
- [x] 修改 `src/audit-core/agents/detective.ts` - 使用 tier config
- [x] 修改 `src/audit-core/agents/strategist.ts` - 使用 tier config
- [x] 修改 `src/audit-core/agents/gatekeeper.ts` - 使用 tier config
- [x] 创建 `src/audit-core/agents/verifier.ts` - 新增 Verifier Agent

### Phase 4: Agent 注册 ✅
- [x] 修改 `src/agents/index.ts` - 条件注册 Verifier
- [x] 修改 `src/agents/types.ts` - 添加 "verifier" 类型
- [x] 更新 `src/config/schema.ts` - BuiltinAgentNameSchema 添加 verifier

### Phase 5: 测试 ✅
- [x] 创建 `src/audit-core/tiers/config.test.ts` - 配置测试 (27 tests)
- [x] 创建 `src/audit-core/tiers/loader.test.ts` - 加载测试

### Phase 6: 文档
- [ ] 更新 `docs/immigration-audit-guide.md` - 添加 tier 说明
- [ ] 更新 `README.md` - 添加 tier 配置示例

---

## 六、关键代码片段

### 6.1 Tier 类型定义

```typescript
// src/audit-core/tiers/types.ts

export type AuditTier = "guest" | "pro" | "ultra"

export interface TierModelConfig {
  auditManager: string
  detective: string
  strategist: string
  gatekeeper: string
  verifier?: string
}

export interface TierFeatures {
  verifier: boolean
  kgSearch: boolean
  deepAnalysis: boolean
  multiRound: boolean
}

export interface TierLimits {
  maxCitations: number
  maxAgentCalls: number
}

export interface TierConfig {
  models: TierModelConfig
  temperatures: Record<string, number>
  features: TierFeatures
  limits: TierLimits
}
```

### 6.2 层级配置常量

```typescript
// src/audit-core/tiers/config.ts

import type { AuditTier, TierConfig } from "./types"

export const TIER_CONFIGS: Record<AuditTier, TierConfig> = {
  guest: {
    models: {
      auditManager: "google/gemini-3-flash",
      detective: "google/gemini-3-flash",
      strategist: "google/gemini-3-flash",
      gatekeeper: "google/gemini-3-flash",
    },
    temperatures: {
      auditManager: 0.3,
      detective: 0.2,
      strategist: 0.4,
      gatekeeper: 0.2,
    },
    features: {
      verifier: false,
      kgSearch: false,
      deepAnalysis: false,
      multiRound: false,
    },
    limits: {
      maxCitations: 3,
      maxAgentCalls: 4,
    },
  },
  
  pro: {
    models: {
      auditManager: "anthropic/claude-sonnet-4-5",
      detective: "google/gemini-3-pro-high",
      strategist: "anthropic/claude-sonnet-4-5",
      gatekeeper: "anthropic/claude-sonnet-4-5",
      verifier: "google/gemini-3-flash",
    },
    temperatures: {
      auditManager: 0.2,
      detective: 0.1,
      strategist: 0.3,
      gatekeeper: 0.1,
      verifier: 0.0,
    },
    features: {
      verifier: true,
      kgSearch: true,
      deepAnalysis: false,
      multiRound: false,
    },
    limits: {
      maxCitations: 10,
      maxAgentCalls: 6,
    },
  },
  
  ultra: {
    models: {
      auditManager: "anthropic/claude-opus-4-5",
      detective: "anthropic/claude-sonnet-4-5",
      strategist: "anthropic/claude-sonnet-4-5",
      gatekeeper: "anthropic/claude-sonnet-4-5",
      verifier: "anthropic/claude-haiku-4-5",
    },
    temperatures: {
      auditManager: 0.2,
      detective: 0.1,
      strategist: 0.3,
      gatekeeper: 0.1,
      verifier: 0.0,
    },
    features: {
      verifier: true,
      kgSearch: true,
      deepAnalysis: true,
      multiRound: true,
    },
    limits: {
      maxCitations: 20,
      maxAgentCalls: 12,
    },
  },
}
```

### 6.3 Tier 加载函数

```typescript
// src/audit-core/tiers/loader.ts

import type { AuditTier, TierConfig } from "./types"
import { TIER_CONFIGS } from "./config"

export function getAuditTier(): AuditTier {
  const envTier = process.env.AUDIT_TIER?.toLowerCase()
  if (envTier && isValidTier(envTier)) {
    return envTier
  }
  return "guest"
}

export function isValidTier(tier: string): tier is AuditTier {
  return ["guest", "pro", "ultra"].includes(tier)
}

export function getTierConfig(tier?: AuditTier): TierConfig {
  const resolvedTier = tier ?? getAuditTier()
  return TIER_CONFIGS[resolvedTier]
}

export function getTierFeature(feature: keyof TierConfig["features"]): boolean {
  const config = getTierConfig()
  return config.features[feature]
}
```

### 6.4 Verifier Agent

```typescript
// src/audit-core/agents/verifier.ts

import type { AgentConfig } from "@opencode-ai/sdk"
import { createAgentToolRestrictions } from "../../shared/permission-compat"
import { getTierConfig, getAuditTier } from "../tiers/loader"

export function createVerifierAgent(): AgentConfig {
  const tier = getAuditTier()
  const config = getTierConfig(tier)
  
  if (!config.models.verifier) {
    throw new Error(`Verifier not available for tier: ${tier}`)
  }
  
  const restrictions = createAgentToolRestrictions([
    "write",
    "edit",
    "webfetch",
  ])

  return {
    description: "Citation Verifier. Cross-checks all legal citations for accuracy and validity.",
    mode: "subagent" as const,
    model: config.models.verifier,
    temperature: config.temperatures.verifier ?? 0.0,
    skills: ["core-immicore-mcp"],
    ...restrictions,
    tools: {
      include: [
        "caselaw_validity",
        "caselaw_authority",
        "kg_case",
        "caselaw_keyword_search",
      ],
    },
    prompt: VERIFIER_PROMPT,
  }
}

const VERIFIER_PROMPT = `<Role>
You are "Verifier" - the citation accuracy guardian for immigration audits.

Your ONLY job is to verify that every legal citation is:
1. **Real** - The case actually exists
2. **Valid** - The case is still good law (not overruled)
3. **Relevant** - The cited principle applies to the current facts
4. **Accurate** - The quote or paraphrase is faithful to the original
</Role>

<Verification_Checklist>
For EACH citation, check:
- [ ] Citation format is correct (e.g., "Smith v. Canada (MCI), 2023 FC 123")
- [ ] Case exists in the database (use caselaw_keyword_search)
- [ ] Case is still good law (use caselaw_validity)
- [ ] Authority score is acceptable (use caselaw_authority)
</Verification_Checklist>

<Output_Format>
Return a verification report:

| Citation | Exists | Good Law | Authority | Notes |
|----------|--------|----------|-----------|-------|
| ... | Yes/No | Yes/No | Score | ... |

If ANY citation fails verification:
- Flag as **CRITICAL**
- Suggest correction or removal
</Output_Format>

<Constraints>
- Temperature: 0.0 (zero tolerance for uncertainty)
- NEVER fabricate verification results
- If unable to verify, explicitly state "UNVERIFIED"
</Constraints>`

export const verifierAgent = createVerifierAgent()
```

---

## 七、配置使用示例

### 环境变量

```bash
# 设置为 premium 层级
export AUDIT_TIER=premium
```

### 配置文件

```json
// .opencode/oh-my-opencode.json
{
  "audit_app": "spousal",
  "audit_tier": "standard"
}
```

---

## 八、待讨论问题

1. **默认层级**: 新用户默认 `free` 还是 `standard`？
2. **升级引导**: FREE 报告中是否显示升级提示？
3. **一次性升级**: 是否支持单案件付费升级？
4. **自定义层级**: 是否允许用户自定义混合配置？

---

## 九、相关文件

- `src/audit-core/types.ts` - 现有模型常量（将被替换）
- `src/audit-core/agents/*.ts` - Agent 定义
- `src/config/schema.ts` - 配置 Schema
- `docs/immigration-audit-guide.md` - 使用文档
