#!/usr/bin/env python3
"""
Comprehensive Markdown to PDF converter using ReportLab.

Supports:
- Headings (# ## ### ####)
- Paragraphs with inline formatting (**bold**, *italic*, `code`, ~~strikethrough~~)
- Bullet lists (- item) and numbered lists (1. item)
- Checkboxes (- [ ] unchecked, - [x] checked)
- Tables (| col1 | col2 |)
- Code blocks (```language ... ```) with verdict box detection
- Blockquotes (> text)
- Horizontal rules (--- or ===)
- ASCII art boxes (┌─────┐ style) converted to styled verdict boxes
- Links [text](url) - text with underline
- Images ![alt](path)

Usage:
    python3 markdown_to_pdf_reportlab.py input.md output.pdf --title "Title"
"""

import sys
import json
import subprocess
from pathlib import Path

# Import the comprehensive markdown parser from document-generator skill
SKILL_SCRIPTS_PATH = (
    Path.home() / ".claude" / "skills" / "document-generator" / "scripts"
)
sys.path.insert(0, str(SKILL_SCRIPTS_PATH))

try:
    from markdown_to_sections import parse_markdown_text, detect_language
except ImportError:
    # Fallback: define minimal versions if import fails
    import re

    def detect_language(text):
        """Detect if text contains significant Chinese characters."""
        chinese_count = sum(1 for c in text if "\u4e00" <= c <= "\u9fff")
        total_chars = sum(1 for c in text if c.strip())
        if total_chars > 0 and chinese_count / total_chars > 0.1:
            return "zh"
        return "en"

    def parse_markdown_text(md_content):
        """Minimal fallback parser - returns basic content sections."""
        sections = []
        for line in md_content.split("\n"):
            stripped = line.strip()
            if not stripped:
                continue
            if stripped.startswith("# "):
                sections.append({"heading": stripped[2:], "level": 1})
            elif stripped.startswith("## "):
                sections.append({"heading": stripped[3:], "level": 2})
            else:
                sections.append({"content": stripped})
        return sections


def markdown_to_pdf(input_md, output_pdf, title=None, theme=None, language=None):
    """Convert Markdown file to PDF."""
    with open(input_md, "r", encoding="utf-8") as f:
        md_content = f.read()

    # Parse markdown to sections (sanitization is handled inside parse_markdown_text)
    sections = parse_markdown_text(md_content)

    if not title:
        # Try to extract title from first H1
        for section in sections:
            if section.get("heading") and section.get("level") == 1:
                title = section["heading"]
                break
        if not title:
            title = "Report"

    # Auto-detect language if not specified
    if not language:
        language = detect_language(md_content)

    if not theme:
        theme = {
            "primary": "#0A192F",
            "accent": "#C5A059",
            "secondary": "#64748B",
            "background": "#FDFBF7",
            "backgroundAlt": "#F7F5F0",
            "text": "#1a1a1a",
            "textLight": "#FFFFFF",
            "success": "#047857",
            "warning": "#B45309",
            "danger": "#BE123C",
        }

    script_path = (
        Path.home()
        / ".claude"
        / "skills"
        / "document-generator"
        / "scripts"
        / "generate_pdf.py"
    )

    if not script_path.exists():
        print(f"Error: {script_path} not found")
        return None

    cmd = [
        "python3",
        str(script_path),
        output_pdf,
        "--title",
        title,
        "--cover",
        "--theme",
        json.dumps(theme, ensure_ascii=False),
        "--sections",
        json.dumps(sections, ensure_ascii=False),
        "--language",
        language,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return None

    print(result.stdout)

    if Path(output_pdf).exists():
        size_kb = Path(output_pdf).stat().st_size / 1024
        print(f"✓ PDF generated: {output_pdf} ({size_kb:.1f}KB) [language={language}]")
        return output_pdf

    return None


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Convert Markdown to PDF using ReportLab with CJK support"
    )
    parser.add_argument("input_md", help="Input Markdown file")
    parser.add_argument("output_pdf", help="Output PDF file")
    parser.add_argument("--title", "-t", help="Document title")
    parser.add_argument(
        "--language",
        "-l",
        choices=["en", "zh", "auto"],
        default="auto",
        help="Language for font selection: en (English), zh (Chinese), auto (detect)",
    )

    args = parser.parse_args()

    if not Path(args.input_md).exists():
        print(f"Error: {args.input_md} not found")
        sys.exit(1)

    language = args.language if args.language != "auto" else None
    result = markdown_to_pdf(
        args.input_md, args.output_pdf, args.title, language=language
    )
    sys.exit(0 if result else 1)
