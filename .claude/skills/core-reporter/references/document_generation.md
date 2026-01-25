# Document Generation

Integration with Anthropic pdf skill and project theme for report output.

## Architecture

```
Reporter Agent
    │
    ├── Synthesize content from agents
    │
    ├── Apply tier template
    │
    ├── Generate Markdown report
    │
    └── Call Anthropic pdf skill with theme
            │
            ▼
        PDF Output (cases/{caseSlot}/report.pdf)
```

## Anthropic PDF Skill Integration

The Anthropic `pdf` skill (installed at `~/.claude/plugins/cache/anthropic-agent-skills/document-skills/`) provides PDF generation capabilities using:
- **pypdf**: Basic operations (merge, split, metadata)
- **pdfplumber**: Text and table extraction
- **reportlab**: PDF creation with styling

### Calling the PDF Skill

To generate a PDF report:

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor

# Judicial Authority Theme Colors
THEME = {
    "primary": HexColor("#0A192F"),      # Navy
    "accent": HexColor("#C5A059"),        # Gold
    "secondary": HexColor("#64748B"),     # Slate
    "background": HexColor("#FDFBF7"),    # Paper
    "text": HexColor("#1a1a1a"),          # Ink
    "go": HexColor("#047857"),            # Emerald
    "caution": HexColor("#B45309"),       # Amber
    "no_go": HexColor("#BE123C"),         # Crimson
}

# Create document
doc = SimpleDocTemplate(
    f"cases/{case_slot}/report.pdf",
    pagesize=letter,
    topMargin=72,
    bottomMargin=72
)

# Build content with theme styles
story = []
# ... add paragraphs, tables, etc.
doc.build(story)
```

## Theme Application

### Judicial Authority Theme

**Color Palette:**
| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Primary | Navy | `#0A192F` | Headers, key elements |
| Accent | Gold | `#C5A059` | Emphasis, authority markers |
| Secondary | Slate | `#64748B` | Supporting elements |
| Background | Paper | `#FDFBF7` | Page background |
| Text | Ink | `#1a1a1a` | Body text |
| Go | Emerald | `#047857` | Positive outcomes |
| Caution | Amber | `#B45309` | Items needing review |
| No-Go | Crimson | `#BE123C` | Critical issues |

**Typography:**
- Headers: Georgia Bold (serif) - conveys authority
- Body: Arial (sans-serif) - accessibility
- Citations: Georgia Italic

### Verdict Badges

Visual indicators for risk levels:

```
[GO]      - Green badge (#047857) with checkmark
[CAUTION] - Amber badge (#B45309) with warning icon
[NO-GO]   - Red badge (#BE123C) with X icon
```

## Output Files

For each audit, Reporter generates:

```
cases/{caseSlot}/
├── report.md           # Markdown version (human-readable)
├── report.pdf          # PDF version (formal document)
└── report_content.json # Structured content (for regeneration)
```

## Multi-Language Support

Reports support:
- **English** (default): All content in English
- **Chinese**: Headers and body in Chinese, citations in English

Font selection:
- English: Georgia/Arial
- Chinese: Songti SC (headers), Hiragino Sans GB (body)

## Quality Standards

All generated reports must meet:
- WCAG AA Accessibility (7:1 contrast minimum)
- Consistent Judicial Authority branding
- Key findings visible within 5-second scan
- Professional legal terminology
- No AI artifacts or placeholder text
