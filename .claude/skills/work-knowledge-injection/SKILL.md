---
name: work-knowledge-injection
description: Inject work permit audit knowledge and agent prompts into audit workflows
category: audit
app_type: work
version: 1.0.0
---

# Work Permit Knowledge Injection

Dynamic knowledge injection system for work permit audit agents.

## Overview

This skill defines how work permit-specific knowledge is injected into agents during audit execution. Each agent receives targeted prompts and skill references based on their role.

## Agent Injection Targets

### Detective Agent
**Purpose**: Search case law and policy for applicable precedents

**Skills Injected**:
- `work-immicore-mcp` - MCP search guidance
- `work-audit-rules` - Risk patterns for case law targeting

**Injection Profile**: `detective_prompt.md`
- Task: Research legal precedents on key issues
- Focus areas: LMIA requirements, employer legitimacy, credential assessment, immigrant intent
- Output: Landmark cases and policy baseline

### Strategist Agent
**Purpose**: Assess risks and develop defense strategy

**Skills Injected**:
- `work-audit-rules` - Hard eligibility and risk badges
- `work-doc-analysis` - Document assessment for evidence gathering

**Injection Profile**: `strategist_prompt.md`
- Task: Identify risk factors and develop mitigation strategies
- Focus areas: Strength/weakness assessment, evidence gaps, defense arguments
- Output: Risk analysis and strategic recommendations

### Gatekeeper Agent
**Purpose**: Validate compliance and identify refusal triggers

**Skills Injected**:
- `work-audit-rules` - Refusal patterns and compliance rules

**Injection Profile**: `gatekeeper_prompt.md`
- Task: Assess compliance with R200 and identify refusal risks
- Focus areas: Documentation completeness, admissibility, basic eligibility
- Output: Compliance review and issue identification

### Reporter Agent
**Purpose**: Generate final audit report

**Skills Injected**:
- `work-workflow` - Audit workflow and report structure
- `work-client-guidance` - Client-facing recommendations

**Injection Profile**: `reporter_prompt.md`
- Task: Synthesize findings into professional audit report
- Focus areas: Executive summary, risk defensibility, next steps
- Output: Final audit report with disclaimers and recommendations

## Injection Profile Structure

Each `injection_profile.json` defines:

```json
{
  "app_type": "work",
  "version": "1.0.0",
  "injection_targets": {
    "detective": {
      "skills": ["work-immicore-mcp", "work-audit-rules"],
      "prompt_file": "detective_prompt.md",
      "priority": "case_law_search"
    },
    "strategist": {
      "skills": ["work-audit-rules", "work-doc-analysis"],
      "prompt_file": "strategist_prompt.md",
      "priority": "risk_assessment"
    },
    "gatekeeper": {
      "skills": ["work-audit-rules"],
      "prompt_file": "gatekeeper_prompt.md",
      "priority": "compliance_check"
    },
    "reporter": {
      "skills": ["work-workflow", "work-client-guidance"],
      "prompt_file": "reporter_prompt.md",
      "priority": "report_synthesis"
    }
  }
}
```

## Dynamic Prompt Files

### detective_prompt.md
Agent instructions for case law and policy research:
- Search patterns for LMIA, employer, credential, intent issues
- Case law evaluation criteria
- Policy baseline establishment

### strategist_prompt.md
Agent instructions for risk assessment and strategy:
- Risk badge identification methodology
- Evidence gap analysis
- Defense strategy formulation
- Strength/weakness assessment

### gatekeeper_prompt.md
Agent instructions for compliance validation:
- R200 requirement checklist
- Refusal pattern identification
- Admissibility assessment
- Issue flagging procedures

### reporter_prompt.md
Agent instructions for report generation:
- Report structure and sections
- Disclaimer requirements
- Defensibility scoring methodology
- Evidence synthesis approach

## Knowledge Injection Process

### Phase 1: Agent Initialization
1. AuditManager loads case profile
2. Identifies app_type as "work"
3. Looks up `APP_SKILL_MAP["work"]`
4. Loads all 7 work-* skills

### Phase 2: Agent Assignment
1. When Detective agent dispatched:
   - Load `injection_profile.json`
   - Find "detective" target
   - Inject `detective_prompt.md`
   - Inject skills: work-immicore-mcp, work-audit-rules

2. When Strategist agent dispatched:
   - Find "strategist" target
   - Inject `strategist_prompt.md`
   - Inject skills: work-audit-rules, work-doc-analysis

3. When Gatekeeper agent dispatched:
   - Find "gatekeeper" target
   - Inject `gatekeeper_prompt.md`
   - Inject skills: work-audit-rules

4. When Reporter agent dispatched:
   - Find "reporter" target
   - Inject `reporter_prompt.md`
   - Inject skills: work-workflow, work-client-guidance

### Phase 3: Agent Execution
Agent executes with injected knowledge context visible in system prompt

### Phase 4: Output Generation
Agent produces output aligned with injected guidance

## Skills Reference

### work-immicore-mcp
- **When**: Detective phase
- **Purpose**: Guide case law and policy searches
- **Content**: Search strategies, MCP tool usage, issue codes
- **Value**: Enables targeted legal research

### work-audit-rules
- **When**: All phases
- **Purpose**: Define hard eligibility and risk patterns
- **Content**: R200 requirements, refusal patterns, risk badges
- **Value**: Shared knowledge baseline for all agents

### work-doc-analysis
- **When**: Strategist phase
- **Purpose**: Guide document assessment and evidence gathering
- **Content**: Document types, extraction schema, validation rules
- **Value**: Enables evidence-based risk assessment

### work-workflow
- **When**: Reporter phase
- **Purpose**: Structure audit workflow and final report
- **Content**: Workflow definitions, report format, submission guidance
- **Value**: Ensures consistent audit outputs

### work-client-guidance
- **When**: Reporter phase
- **Purpose**: Provide client-facing recommendations
- **Content**: Document checklists, preparation guidance, common mistakes
- **Value**: Enables professional client advisory

## See Also

- [injection_profile.json](references/injection_profile.json) - Target skill mapping
- [detective_prompt.md](references/detective_prompt.md) - Detective instructions
- [strategist_prompt.md](references/strategist_prompt.md) - Strategist instructions
- [gatekeeper_prompt.md](references/gatekeeper_prompt.md) - Gatekeeper instructions
- [reporter_prompt.md](references/reporter_prompt.md) - Reporter instructions
