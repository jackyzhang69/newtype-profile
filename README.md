# Immi-OS (Immigration Audit System)

> Formerly known as `newtype-profile`.

**Immi-OS** is a specialized AI Agent system designed for **Immigration Application Audit**. Built on top of the powerful `oh-my-opencode` framework, it orchestrates a team of specialized agents to simulate the workflow of immigration lawyers and officers.

## Core Features

- **Automated Audit Workflow**: Orchestrates multiple agents (`AuditManager`, `Detective`, `Strategist`, `Gatekeeper`) to review applications.
- **Defensibility Score**: Calculates a risk score based on historical Federal Court jurisprudence.
- **Knowledge Base Injection**: Dynamically loads business rules and guides based on the application type (e.g., Spousal Sponsorship, Study Permit).
- **MCP & KG Integration**: Connects to external legal databases (Case Law, Operation Manuals) via Model Context Protocol (MCP) and Knowledge Graph (KG).

## Architecture

The system uses a "Separation of Planning and Execution" philosophy inherited from `oh-my-opencode`:

- **Prometheus (Planner)**: Analyzes the request and creates a detailed audit plan.
- **Sisyphus (Executor)**: Orchestrates the execution of the plan, delegating tasks to specialized agents.
- **Audit Core**: Located in `src/audit-core`, containing the business logic for immigration audits.

## Getting Started

### Prerequisites

- Node.js 20+
- Bun (recommended) or npm
- OpenCode CLI

### Installation

```bash
git clone https://github.com/jackyzhang69/immi-os.git
cd immi-os
bun install
```

### Configuration

Ensure your `.opencode/opencode.json` points to this plugin:

```json
{
  "plugin": ["/path/to/immi-os"]
}
```

Configure your audit settings in `.opencode/oh-my-opencode.json`:

```json
{
  "audit_app": "spousal",
  "search_policy": "mcp_first"
}
```

### Running an Audit

Start an OpenCode session and simply ask:

> "Audit this spousal sponsorship application for applicant [Name]..."

The system will automatically:

1.  Detect the intent.
2.  Activate the `AuditManager`.
3.  Decompose the task into checks (Identity, Relationship, Admissibility).
4.  Dispatch `Detective` to search for risks.
5.  Dispatch `Strategist` to formulate arguments.
6.  Dispatch `Gatekeeper` to review the final report.

## Documentation

- [Audit Guide](docs/immigration-audit-guide.md)
- [Architecture Plan](docs/audit-architecture-plan.md)
- [CLI Guide](docs/cli-guide.md)

## License

SUL-1.0
