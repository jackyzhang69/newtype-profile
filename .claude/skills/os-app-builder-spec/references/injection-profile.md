# Injection Profile Standard Format

Location: `{app-type}-knowledge-injection/references/injection_profile.json`

```json
{
  "version": "{app-type}-v3",
  "description": "{App Type} knowledge injection profile with output constraints",
  "skills": {
    "{app-type}-audit-rules": {
      "description": "Risk patterns, eligibility rules",
      "inject_to": ["detective", "strategist", "gatekeeper"],
      "priority": 1
    },
    "{app-type}-doc-analysis": {
      "description": "Document analysis rules and evidence standards",
      "inject_to": ["detective", "strategist"],
      "priority": 2
    },
    "{app-type}-immicore-mcp": {
      "description": "Caselaw and operation manual query patterns",
      "inject_to": ["detective"],
      "priority": 3
    },
    "{app-type}-workflow": {
      "description": "Internal workflow templates",
      "inject_to": ["strategist", "gatekeeper"],
      "priority": 4
    },
    "{app-type}-client-guidance": {
      "description": "Client-facing guides",
      "inject_to": ["gatekeeper"],
      "priority": 5
    },
    "learned-guardrails": {
      "description": "Semantic verification rules (shared)",
      "inject_to": ["gatekeeper"],
      "priority": 6
    },
    "audit-report-output": {
      "description": "Report format (shared)",
      "inject_to": ["reporter"],
      "priority": 7
    },
    "core-reporter": {
      "description": "Cross-app Reporter rules (shared)",
      "inject_to": ["reporter"],
      "priority": 8
    },
    "{app-type}-reporter": {
      "description": "App-specific Reporter templates",
      "inject_to": ["reporter"],
      "priority": 9
    }
  },
  "injection_order": [
    "{app-type}-audit-rules",
    "{app-type}-doc-analysis",
    "{app-type}-immicore-mcp",
    "{app-type}-workflow",
    "{app-type}-client-guidance",
    "learned-guardrails",
    "audit-report-output",
    "core-reporter",
    "{app-type}-reporter"
  ],
  "agent_skill_mapping": {
    "detective": {
      "skills": ["{app-type}-immicore-mcp", "{app-type}-audit-rules", "{app-type}-doc-analysis"],
      "prompt_file": "detective_prompt.md",
      "focus": "case_law_search"
    },
    "strategist": {
      "skills": ["{app-type}-audit-rules", "{app-type}-doc-analysis", "{app-type}-workflow"],
      "prompt_file": "strategist_prompt.md",
      "focus": "risk_assessment"
    },
    "gatekeeper": {
      "skills": ["{app-type}-audit-rules", "{app-type}-workflow", "{app-type}-client-guidance", "learned-guardrails"],
      "prompt_file": "gatekeeper_prompt.md",
      "focus": "compliance_check"
    },
    "reporter": {
      "skills": ["{app-type}-reporter", "core-reporter", "audit-report-output"],
      "prompt_file": "reporter_prompt.md",
      "focus": "report_synthesis"
    }
  },
  "tags": {
    "skill": "Skill_References",
    "risk": "Risk_Patterns",
    "doc": "Document_Analysis",
    "caselaw": "Caselaw_Patterns",
    "template": "Output_Templates",
    "guidance": "Client_Guidance"
  },
  "stability": {
    "allow_rename": false,
    "preserve_manifest": true
  },
  "_metadata": {
    "created": "YYYY-MM-DD",
    "last_updated": "YYYY-MM-DD",
    "status": "active",
    "version_notes": "Initial creation"
  }
}
```

> **CRITICAL**: injection_profile.json should **NOT** contain `files` field!
> `loader.ts` doesn't read files field from injection_profile. Actual loaded files are determined by each skill's `manifest.json` `references` array.

## Key Points

1. **9 skills mapping** (7 app-specific + 3 shared)
2. **injection_order MUST be complete**
3. **priority determines injection order** (lower number = earlier)
4. **inject_to specifies target agents**
5. **agent_skill_mapping provides clear agent-to-skill mapping**
6. **DO NOT write files field** - controlled by each skill's manifest.json

## Loading Mechanism

Understanding the separation of responsibilities:

```
+---------------------------------------------------------------------+
|  injection_profile.json Responsibilities (Routing Layer)            |
|  +-- Determine which skills inject to which agent (inject_to)       |
|  +-- Determine injection order (priority, injection_order)          |
|  +-- Does NOT control which files are actually loaded               |
+---------------------------------------------------------------------+
|  Each skill's manifest.json Responsibilities (Content Layer)        |
|  +-- Determine which files are actually loaded (references array)   |
|  +-- Define skill metadata (name, version, description)             |
|  +-- Declare dependencies (depends_on)                              |
+---------------------------------------------------------------------+
```

## loader.ts Loading Flow

```
1. Read injection_profile.json
   +-- Get skills list and inject_to mapping

2. For each skill:
   +-- Read .claude/skills/{skill-name}/references/manifest.json
       +-- Read manifest.references array (line 191)
           +-- Load each referenced file's content

3. Sort by priority and inject to corresponding agent
```

## Common Errors

- Writing `files` field in injection_profile -> not read
- Using `files` instead of `references` in manifest -> empty content (0 chars)
- Including manifest.json itself in manifest.references -> circular reference
