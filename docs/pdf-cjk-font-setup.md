# PDF CJK Font Setup Guide

## Problem
Document-maker agent was generating PDFs with corrupted Chinese characters (rendered as squares ■).

## Root Cause Analysis

| Tool | Issue |
|------|-------|
| **ReportLab** | Cannot load macOS system fonts (TTC format). Only supports TTF/OTF directly. |
| **xhtml2pdf** | Supports HTML/CSS but does NOT properly embed system CJK fonts into PDF. |
| **WeasyPrint** | ✅ **SOLUTION**: Properly handles system font fallback chains and embeds them correctly. |

## Solution: WeasyPrint + Markdown

### Installation
```bash
# WeasyPrint CLI (via Homebrew)
brew install weasyprint

# Python dependencies
pip3 install markdown2
```

### Usage
```bash
python3 /path/to/immi-os/scripts/markdown_to_pdf_weasyprint.py input.md output.pdf
```

### How It Works
1. Parse markdown to HTML using `markdown2`
2. Inject CSS with CJK font stack:
   ```css
   font-family: 'STHeiti', 'PingFang SC', 'Songti SC', 'Arial', sans-serif;
   ```
3. Use WeasyPrint CLI to render HTML → PDF with proper font embedding
4. Clean up temporary HTML file

### Font Fallback Chain
System tries fonts in order, uses first available:
1. STHeiti (Apple system font)
2. PingFang SC (Apple system font)
3. Songti SC (Apple system font)
4. Arial (universal fallback)

## Verification

**Before (xhtml2pdf):**
```
❌ Chinese characters → ■ ■ ■ (corrupted)
✓ English characters → normal
✓ Layout preserved
```

**After (WeasyPrint):**
```
✅ Chinese characters → 正确显示 (correct display)
✅ English characters → normal
✅ Layout + styling preserved
✅ File size: 1.2MB (proper font embedding)
```

## Files

- **Script**: `scripts/markdown_to_pdf_weasyprint.py`
- **Config**: `.claude/agents/document-maker.md`
- **Verified Output**: `tmp/王晓帅-张美丽-配偶担保-Ultra模式报告.pdf` (1.2MB, ✅ no corruption)

## Document-Maker Integration

The `document-maker` agent will automatically use WeasyPrint for any Markdown to PDF conversion with Chinese content. No additional configuration needed.

---
**Last Verified:** 2026-01-17
**Status:** ✅ Production Ready
