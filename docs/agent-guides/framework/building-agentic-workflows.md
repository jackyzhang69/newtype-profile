# Building Agentic Workflows with OpenCode/OMO

> Guide for building custom multi-agent systems using the oh-my-opencode (OMO) framework.
> 
> **Note**: Legacy agent names (sisyphus, prometheus, omo) are auto-migrated to current names. See [migration.ts](../../../src/shared/migration.ts) for mapping.

---

## Overview

This guide demonstrates how to build domain-specific agentic workflows using `oh-my-opencode` (OMO) as the orchestration framework. The **Immi-OS** immigration audit system serves as a reference implementation.

## Architecture Philosophy

OMO follows **"Separation of Planning and Execution"**:

```
┌─────────────────────────────────────────────────────────────────┐
│  User Request                                                    │
├─────────────────────────────────────────────────────────────────┤
│  Audit-Manager (Orchestrator)                                   │
│  └── Analyzes request, creates plan, delegates to specialists   │
├─────────────────────────────────────────────────────────────────┤
│  Deputy (Executor)                                              │
│  └── Executes delegated tasks via chief_task                    │
├─────────────────────────────────────────────────────────────────┤
│  Domain Agents (Your Custom Agents)                             │
│  └── Specialized agents for your business domain                │
│  └── e.g., Detective, Strategist, Gatekeeper, Verifier          │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Name Migration

Legacy oh-my-opencode names are auto-migrated:

| Legacy Name | Current Name | Role |
|-------------|--------------|------|
| chief, omo, sisyphus, prometheus | `audit-manager` | Primary orchestrator |
| oracle, explore | `researcher` | Research/exploration |
| librarian | `archivist` | Documentation/archives |
| build | `deputy` | Task execution |

## Step 1: Define Your Agent Architecture

### Agent Roles

Design agents with clear, non-overlapping responsibilities:

| Agent Type | Role | Example (Immi-OS) |
|------------|------|-------------------|
| **Orchestrator** | Coordinates workflow, produces final output | AuditManager |
| **Researcher** | Gathers information from external sources | Detective |
| **Analyst** | Evaluates data, produces assessments | Strategist |
| **Reviewer** | Quality control, compliance check | Gatekeeper |
| **Validator** | Verifies citations and facts | Verifier |

### Example Agent Definition

```typescript
// src/your-domain/agents/researcher.ts
// Note: "researcher" is the current name for legacy "oracle"/"explore" agents
import { createAgent } from "oh-my-opencode"

export const createResearcherAgent = () => {
  const basePrompt = `
# Role: Domain Researcher

You are a specialized researcher for [your domain].

## Responsibilities
- Search knowledge bases for relevant information
- Map findings to evidence
- Report with confidence levels

## Output Format
[Define structured output]
`

  return createAgent({
    name: "researcher",
    mode: "subagent",
    prompt: basePrompt,
    model: "anthropic/claude-sonnet-4-5",
    temperature: 0.1,
    tools: {
      include: ["mcp_*", "read", "grep"],  // Restrict tools
      exclude: ["write", "bash"],           // No modifications
    },
  })
}
```

## Step 2: Create a Tiered System (Optional)

For different service levels or complexity:

```typescript
// src/your-domain/tiers/config.ts
export const TIER_CONFIGS = {
  basic: {
    models: {
      orchestrator: "google/gemini-3-flash",
      researcher: "google/gemini-3-flash",
    },
    features: {
      deepAnalysis: false,
      externalSearch: false,
    },
    limits: {
      maxAgentCalls: 4,
    },
  },
  professional: {
    models: {
      orchestrator: "anthropic/claude-sonnet-4-5",
      researcher: "anthropic/claude-sonnet-4-5",
    },
    features: {
      deepAnalysis: true,
      externalSearch: true,
    },
    limits: {
      maxAgentCalls: 8,
    },
  },
}
```

## Step 3: Knowledge Injection

Dynamically inject domain knowledge into agent prompts:

```typescript
// src/your-domain/knowledge/loader.ts
export function buildDomainPrompt(
  basePrompt: string,
  domainId: string,
  agentRole: string,
  skills: string[]
): string {
  const skillContent = skills
    .map(s => loadSkillContent(s))
    .join("\n\n")

  return `
${basePrompt}

## Domain Context: ${domainId}

${skillContent}

## Agent-Specific Rules
${getAgentRules(agentRole)}
`
}
```

## Step 4: Integrate External Services (MCP)

Connect to external knowledge bases via Model Context Protocol:

```typescript
// Define MCP tools for your domain
const domainMCPTools = {
  "domain_search": {
    description: "Search domain knowledge base",
    handler: async (query) => {
      // Connect to your MCP service
      return await mcpClient.call("search", { query })
    }
  },
  "domain_lookup": {
    description: "Lookup specific records",
    handler: async (id) => {
      return await mcpClient.call("lookup", { id })
    }
  },
}
```

## Step 5: Define Workflow Stages

Structure your workflow with clear phases:

```typescript
// src/your-domain/workflow.ts
export const WORKFLOW_STAGES = [
  {
    stage: "intake",
    agent: "intake",
    description: "Document extraction and initial classification",
  },
  {
    stage: "research",
    agent: "researcher",
    description: "Gather relevant information",
    dependsOn: ["intake"],
  },
  {
    stage: "analysis",
    agent: "analyst",
    description: "Evaluate findings and assess risks",
    dependsOn: ["research"],
  },
  {
    stage: "review",
    agent: "reviewer",
    description: "Quality control and compliance",
    dependsOn: ["analysis"],
  },
  {
    stage: "output",
    agent: "orchestrator",
    description: "Generate final deliverable",
    dependsOn: ["review"],
  },
]
```

## Step 6: Create Domain Skills

Package domain knowledge as reusable skills:

```
.claude/skills/
├── your-domain-rules/
│   ├── SKILL.md              # Main skill definition (<500 lines)
│   └── references/
│       ├── manifest.json     # Index of all reference files
│       ├── rule-framework.json
│       └── checklist.md
├── your-domain-workflow/
│   ├── SKILL.md
│   └── references/
│       ├── manifest.json
│       └── templates/
└── your-domain-knowledge/
    ├── SKILL.md
    └── references/
        ├── manifest.json
        └── guides/
```

### Skill Structure

```yaml
# .claude/skills/your-domain-rules/SKILL.md
---
name: your-domain-rules
description: |
  Business rules and risk framework for [your domain].
  Use for eligibility checks and risk assessment.
---

# Domain Rules

## Scope
- Hard eligibility checks
- Risk pattern detection

## Inputs
- Case profile
- Evidence documents

## Outputs
- Eligibility flags
- Risk badges with severity
```

## Best Practices

### 1. Tool Restrictions

Limit agent capabilities to prevent misuse:

```typescript
// Researcher: read-only, no file modifications
tools: {
  include: ["mcp_*", "read", "grep", "glob"],
  exclude: ["write", "edit", "bash"],
}

// Analyst: internal tools only
tools: {
  include: ["read", "grep"],
  exclude: ["mcp_*", "webfetch", "websearch"],
}
```

### 2. Temperature Settings

| Agent Type | Temperature | Rationale |
|------------|-------------|-----------|
| Researcher | 0.1 | Factual accuracy |
| Analyst | 0.3 | Balanced reasoning |
| Reviewer | 0.1 | Strict compliance |
| Orchestrator | 0.2 | Consistent output |

### 3. Output Constraints

Define clear output limits per agent:

```typescript
outputConstraints: {
  maxLines: 500,
  agentLimits: {
    researcher: 150,
    analyst: 200,
    reviewer: 100,
  },
}
```

### 4. Error Handling

Implement graceful degradation:

```typescript
// If service unavailable, continue with available data
try {
  const results = await mcpService.search(query)
  return { success: true, data: results }
} catch (error) {
  logger.warn(`MCP service unavailable: ${error.message}`)
  return { success: false, fallback: "local", data: localCache }
}
```

## Reference Implementation

See **Immi-OS** (`src/audit-core/`) for a complete example:

| Component | Location | Description |
|-----------|----------|-------------|
| Agents | `src/audit-core/agents/` | 7 specialized audit agents |
| Tiers | `src/audit-core/tiers/` | 3-tier configuration system |
| Knowledge | `src/audit-core/knowledge/` | Dynamic injection loader |
| Skills | `.claude/skills/` | 16+ domain-specific skills |
| Migration | `src/shared/migration.ts` | Legacy name compatibility |

## Further Reading

- [OMO Framework Guide](./opencode-omo.md)
- [Agent/Skill Selection](./agent-skill-selection.md)
- [Tools Reference](./tools.md)
- [Hooks Reference](./hooks.md)
- [Audit Architecture](../audit/architecture.md) - Immi-OS building blocks design
