# PDF Generation with CJK Font Support

## Overview

The `document-maker` agent uses the official `document-skills:pdf` from `~/.claude/skills/document-generator/scripts/generate_pdf.py` to generate professional PDFs with full CJK (Chinese/Japanese/Korean) font support using ReportLab's built-in `STSong-Light` CID font.

## Architecture

```
User Request
    ↓
document-maker agent
    ↓
markdown_to_pdf_reportlab.py (wrapper)
    ↓
generate_pdf.py (skill script)
    ↓
ReportLab + STSong-Light CID Font
    ↓
PDF Output (with Judicial Authority theme)
```

## Environment Setup

### Step 1: Install Dependencies

```bash
pip3 install --break-system-packages reportlab markdown2
```

**Dependencies:**
- `reportlab`: PDF generation with CID font support
- `markdown2`: Markdown parsing with extras (tables, code blocks)

### Step 2: Verify CID Font Registration

```bash
python3 -c "from reportlab.pdfbase.cidfonts import UnicodeCIDFont; \
font = UnicodeCIDFont('STSong-Light'); print('✓ STSong-Light available')"
```

Expected output: `✓ STSong-Light available`

**Note:** The `STSong-Light` CID font is built into ReportLab. No additional font files or system fonts need to be installed.

### Step 3: Verify Script Location

```bash
ls ~/.claude/skills/document-generator/scripts/generate_pdf.py
ls /path/to/immi-os/scripts/markdown_to_pdf_reportlab.py
```

Both scripts should exist.

## Usage

### Direct Script Invocation

```bash
python3 /path/to/immi-os/scripts/markdown_to_pdf_reportlab.py \
  input.md \
  output.pdf \
  "Optional Title"
```

### Via document-maker Agent

When you request PDF generation from markdown with Chinese content, document-maker will automatically use the CJK-capable wrapper.

## Font Configuration

### CID Font Stack

The script uses ReportLab's CID fonts for Chinese:

| Font Name | Type | Purpose |
|-----------|------|---------|
| **STSong-Light** | CID | Default serif font (Chinese newspapers/formal documents) |
| **HeiseiMin-W3** | CID | Alternative serif (Japanese) |
| **HeiseiKakuGo-W5** | CID | Alternative sans-serif (Japanese) |

Fallback order (automatic):
1. Try `STSong-Light` (Chinese formal)
2. Try `HeiseiMin-W3` (Japanese serif)
3. Try `HeiseiKakuGo-W5` (Japanese sans-serif)
4. Fall back to `Helvetica` (English-only mode)

### Theme Configuration

Default Judicial Authority theme:

```json
{
  "primary": "#0A192F",      // Navy - headers, authority
  "accent": "#C5A059",       // Gold - highlights, prestige
  "secondary": "#64748B",    // Slate - supporting elements
  "background": "#FDFBF7",   // Paper - main background
  "text": "#1a1a1a",         // Ink - main text
  "success": "#047857",      // Go - approval
  "warning": "#B45309",      // Caution - review needed
  "danger": "#BE123C",       // No-Go - critical
  "headerFont": "STSong-Light",
  "bodyFont": "STSong-Light"
}
```

## Markdown Parsing

The wrapper supports:

| Element | Support | Example |
|---------|---------|---------|
| **Headings** | ✅ | `# Title`, `## Section`, `### Subsection` |
| **Paragraphs** | ✅ | Regular text with line breaks |
| **Lists** | ✅ | `- bullet` and `1. numbered` |
| **Tables** | ✅ | Markdown table syntax with `\|` |
| **Code** | ✅ | ` ```python ` code ` ``` ` |
| **Dividers** | ✅ | `---` creates horizontal line |
| **Emphasis** | ✅ | **bold** and *italic* |

## Troubleshooting

### Issue: "STSong-Light not available"

**Cause:** ReportLab version is too old.

**Solution:**
```bash
pip3 install --upgrade --break-system-packages reportlab
```

### Issue: Chinese characters render as squares

**Cause:** CID font registration failed, fallback to Helvetica (English-only).

**Solution:**
1. Verify ReportLab installation: `python3 -c "import reportlab; print(reportlab.__version__)"`
2. Test CID font: `python3 -c "from reportlab.pdfbase.cidfonts import UnicodeCIDFont; UnicodeCIDFont('STSong-Light')"`
3. If error, reinstall: `pip3 install --force-reinstall --break-system-packages reportlab`

### Issue: PDF output is empty or very small

**Cause:** Markdown parsing failed or sections were empty.

**Solution:**
1. Verify markdown file is valid UTF-8: `file -i input.md`
2. Check markdown syntax (proper heading levels, table formatting)
3. Test with simple markdown first

## File Locations

- **Wrapper Script**: `immi-os/scripts/markdown_to_pdf_reportlab.py`
- **Skill Script**: `~/.claude/skills/document-generator/scripts/generate_pdf.py`
- **Config**: `~/.claude/agents/document-maker.md`
- **Documentation**: `immi-os/docs/pdf-generation-setup.md` (this file)

## Quality Standards

All PDFs generated follow the Judicial Authority theme:

- ✅ Navy headers with consistent typography
- ✅ Gold accent dividers and highlights
- ✅ Professional tables with proper styling
- ✅ Full Chinese character support (no corruption)
- ✅ Pagination with headers/footers
- ✅ Cover page with metadata

---

**Last Updated:** 2026-01-17  
**Status:** ✅ Production Ready  
**Tested on:** macOS, Python 3.11+, ReportLab 4.0+
