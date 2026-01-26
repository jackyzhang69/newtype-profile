#!/usr/bin/env python3
"""
Comprehensive Markdown to PDF converter using ReportLab.

Supports:
- Headings (# ## ### ####)
- Paragraphs with inline formatting (**bold**, *italic*, `code`, ~~strikethrough~~)
- Bullet lists (- item) and numbered lists (1. item)
- Checkboxes (- [ ] unchecked, - [x] checked)
- Tables (| col1 | col2 |)
- Code blocks (```language ... ```)
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
import re
from pathlib import Path

# Box drawing characters to ASCII
BOX_CHAR_MAP = {
    "┌": "+",
    "┐": "+",
    "└": "+",
    "┘": "+",
    "├": "+",
    "┤": "+",
    "┬": "+",
    "┴": "+",
    "┼": "+",
    "─": "-",
    "│": "|",
    "═": "=",
    "║": "|",
    "╔": "+",
    "╗": "+",
    "╚": "+",
    "╝": "+",
    "╠": "+",
    "╣": "+",
    "╦": "+",
    "╩": "+",
    "╬": "+",
}

# Emoji to text replacements
EMOJI_MAP = {
    "🔴": "[!]",
    "🟡": "[?]",
    "🟢": "[OK]",
    "⚠️": "[!]",
    "⚠": "[!]",
    "✅": "[v]",
    "❌": "[x]",
    "⬜": "[ ]",
    "✓": "[v]",
    "✗": "[x]",
    "☐": "[ ]",
    "☑": "[v]",
    "☒": "[x]",
    "🔶": "[!]",
    "🔵": "[i]",
    "⭐": "[*]",
    "📌": "[>]",
    "📝": "[#]",
    "📋": "[=]",
    "🚨": "[!!]",
    "💡": "[i]",
    "⏰": "[T]",
    "📅": "[D]",
    "→": "->",
    "←": "<-",
    "↔": "<->",
    "•": "-",
}


def sanitize_for_cid_font(text):
    """Replace box drawing characters and emojis with ASCII equivalents."""
    for box_char, replacement in BOX_CHAR_MAP.items():
        text = text.replace(box_char, replacement)
    for emoji, replacement in EMOJI_MAP.items():
        text = text.replace(emoji, replacement)
    return text


def convert_markdown_formatting(text):
    """Convert markdown inline formatting to ReportLab HTML-like tags.

    ReportLab Paragraph supports: <b>, <i>, <u>, <br/>, <font>
    """
    # Escape XML special characters first (except those we use for tags)
    text = text.replace("&", "&amp;")
    # Don't escape < and > yet, we need them for our tags

    # ~~strikethrough~~ → <strike>text</strike> (ReportLab doesn't support, use <font color>)
    # Actually ReportLab doesn't have strikethrough, simulate with different styling
    text = re.sub(r"~~(.+?)~~", r"<font color='#888888'>[REMOVED: \1]</font>", text)

    # **bold** → <b>bold</b>
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)

    # __bold__ → <b>bold</b>
    text = re.sub(r"__(.+?)__", r"<b>\1</b>", text)

    # `code` → <font name="Courier" color="#c7254e" backColor="#f9f2f4">code</font>
    text = re.sub(r"`([^`]+)`", r'<font name="Courier" color="#c7254e">\1</font>', text)

    # *italic* → <i>italic</i> (避免匹配已转换的标签)
    text = re.sub(r"(?<![<>/])\*([^*]+?)\*(?![<>/])", r"<i>\1</i>", text)

    # _italic_ → <i>italic</i>
    text = re.sub(r"(?<![a-zA-Z0-9])_([^_]+?)_(?![a-zA-Z0-9])", r"<i>\1</i>", text)

    # [text](url) → <u><font color="blue">text</font></u>
    text = re.sub(
        r"\[([^\]]+)\]\([^\)]+\)", r'<u><font color="#0066cc">\1</font></u>', text
    )

    # Escape remaining < and > that aren't part of tags
    # This is tricky - we need to not break our HTML tags
    # For now, let's leave it as is since ReportLab will handle it

    return text


def is_separator_line(line):
    """Check if line is a separator (=== or ---)."""
    stripped = line.strip()
    if len(stripped) < 3:
        return False
    # All equals signs
    if all(c == "=" for c in stripped):
        return True
    # All dashes (but not table separator |---|)
    if all(c == "-" for c in stripped) and "|" not in line:
        return True
    return False


def is_ascii_art_box_line(line):
    """Check if line is part of an ASCII art box."""
    stripped = line.strip()
    # Check for box drawing patterns
    box_patterns = [
        r"^[+\-=|┌┐└┘├┤┬┴┼─│═║╔╗╚╝╠╣╦╩╬\s]+$",  # Box characters only
        r"^\+[\-=]+\+$",  # +----+
        r"^\|.*\|$",  # | text |
    ]
    for pattern in box_patterns:
        if re.match(pattern, stripped):
            return True
    return False


def extract_ascii_art_box_content(lines, start_idx):
    """Extract content from ASCII art box and return (content_lines, end_idx)."""
    content = []
    i = start_idx

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # End of box (bottom border or empty line)
        if stripped.startswith("+") and stripped.endswith("+") and "-" in stripped:
            if content:  # We already have content, this is the bottom
                return content, i
        elif stripped.startswith("|") and stripped.endswith("|"):
            # Extract content between | ... |
            inner = stripped[1:-1].strip()
            if inner and not all(c in "-=" for c in inner):
                content.append(inner)
        elif not stripped:
            # Empty line might end the box
            if content:
                return content, i - 1
        elif not is_ascii_art_box_line(line):
            # Non-box line ends the box
            return content, i - 1

        i += 1

    return content, i - 1


def parse_blockquote(lines, start_idx):
    """Parse a blockquote block starting at start_idx."""
    quote_lines = []
    i = start_idx

    while i < len(lines):
        line = lines[i]
        if line.strip().startswith(">"):
            # Remove the > prefix
            quote_text = line.strip()[1:].strip()
            quote_lines.append(quote_text)
            i += 1
        else:
            break

    return " ".join(quote_lines), i - 1


def parse_checkbox_list(lines, start_idx):
    """Parse checkbox list items."""
    items = []
    i = start_idx

    while i < len(lines):
        line = lines[i].strip()
        # Match - [ ] or - [x] or - [X]
        match = re.match(r"^-\s*\[([ xX])\]\s*(.+)$", line)
        if match:
            checked = match.group(1).lower() == "x"
            text = convert_markdown_formatting(match.group(2))
            prefix = "[v] " if checked else "[ ] "
            items.append(prefix + text)
            i += 1
        else:
            break

    return items, i - 1


def parse_markdown_to_sections(md_content):
    """Parse markdown to generate_pdf.py sections format.

    Comprehensive parser supporting all common Markdown elements.
    """
    sections = []
    lines = md_content.split("\n")
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Skip empty lines
        if not stripped:
            i += 1
            continue

        # Skip separator lines (=== or --- at top level)
        if is_separator_line(line):
            # Convert to divider only if it's a standalone ---
            if stripped == "---" or all(c == "-" for c in stripped):
                sections.append({"divider": True})
            # Skip === lines entirely (often decorative)
            i += 1
            continue

        # Headings
        if line.startswith("# "):
            heading = convert_markdown_formatting(line[2:].strip())
            sections.append({"heading": heading, "level": 1})
            i += 1
            continue
        elif line.startswith("## "):
            heading = convert_markdown_formatting(line[3:].strip())
            sections.append({"heading": heading, "level": 2})
            i += 1
            continue
        elif line.startswith("### "):
            heading = convert_markdown_formatting(line[4:].strip())
            sections.append({"heading": heading, "level": 3})
            i += 1
            continue
        elif line.startswith("#### "):
            heading = convert_markdown_formatting(line[5:].strip())
            sections.append({"heading": heading, "level": 4})
            i += 1
            continue

        # Blockquotes (> text)
        if stripped.startswith(">"):
            quote_text, end_idx = parse_blockquote(lines, i)
            if quote_text:
                sections.append(
                    {
                        "quote": {
                            "text": convert_markdown_formatting(quote_text),
                            "author": "",
                        }
                    }
                )
            i = end_idx + 1
            continue

        # ASCII art boxes - convert to verdict or styled box
        if is_ascii_art_box_line(line) and (
            stripped.startswith("+") or stripped.startswith("|")
        ):
            box_content, end_idx = extract_ascii_art_box_content(lines, i)
            if box_content:
                # Check if it looks like a verdict box
                combined = " ".join(box_content)
                # Look for score patterns like "SCORE: 82/100" or "RISK LEVEL: LOW"
                score_match = re.search(
                    r"(?:SCORE|RATING)[:\s]*(\d+)/(\d+)", combined, re.IGNORECASE
                )
                risk_match = re.search(
                    r"(?:RISK|LEVEL)[:\s]*(LOW|MEDIUM|HIGH|CRITICAL)",
                    combined,
                    re.IGNORECASE,
                )
                recommend_match = re.search(
                    r"(?:RECOMMENDATION|VERDICT)[:\s]*(\w+)", combined, re.IGNORECASE
                )

                if score_match or risk_match or recommend_match:
                    # Create verdict badges
                    if score_match:
                        score = f"{score_match.group(1)}/{score_match.group(2)}"
                        sections.append(
                            {
                                "verdict": {
                                    "label": "Defensibility Score",
                                    "value": score,
                                }
                            }
                        )
                    if risk_match:
                        risk_level = risk_match.group(1).upper()
                        verdict_value = (
                            "GO"
                            if risk_level == "LOW"
                            else ("CAUTION" if risk_level == "MEDIUM" else "NO-GO")
                        )
                        sections.append(
                            {"verdict": {"label": "Risk Level", "value": verdict_value}}
                        )
                    if recommend_match:
                        rec = recommend_match.group(1).upper()
                        verdict_value = (
                            "GO"
                            if rec in ["SUBMIT", "APPROVE", "YES", "PASS"]
                            else ("CAUTION" if rec in ["REVIEW", "MAYBE"] else "NO-GO")
                        )
                        sections.append(
                            {
                                "verdict": {
                                    "label": "Recommendation",
                                    "value": verdict_value,
                                }
                            }
                        )
                else:
                    # Generic box - convert to styled content
                    sections.append(
                        {"content": "<b>" + " | ".join(box_content) + "</b>"}
                    )
            i = end_idx + 1
            continue

        # Checkbox lists (- [ ] or - [x])
        if re.match(r"^-\s*\[[ xX]\]", stripped):
            items, end_idx = parse_checkbox_list(lines, i)
            if items:
                sections.append({"bullets": items})
            i = end_idx + 1
            continue

        # Regular bullet lists (- item)
        if stripped.startswith("- ") and not stripped.startswith("- ["):
            bullets = []
            while (
                i < len(lines)
                and lines[i].strip().startswith("- ")
                and not re.match(r"^-\s*\[[ xX]\]", lines[i].strip())
            ):
                bullet_text = lines[i].strip()[2:].strip()
                bullet_text = convert_markdown_formatting(bullet_text)
                bullets.append(bullet_text)
                i += 1
            if bullets:
                sections.append({"bullets": bullets})
            continue

        # Numbered lists (1. 2. 3.)
        if re.match(r"^\d+\.\s", stripped):
            numbered = []
            while i < len(lines) and re.match(r"^\d+\.\s", lines[i].strip()):
                item_text = re.sub(r"^\d+\.\s*", "", lines[i].strip())
                item_text = convert_markdown_formatting(item_text)
                numbered.append(item_text)
                i += 1
            if numbered:
                sections.append({"numbered": numbered})
            continue

        # Tables (| col1 | col2 |)
        if stripped.startswith("|"):
            table_rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                row_line = lines[i].strip()
                # Remove leading and trailing |
                if row_line.endswith("|"):
                    row_line = row_line[:-1]
                if row_line.startswith("|"):
                    row_line = row_line[1:]

                cells = [
                    convert_markdown_formatting(cell.strip())
                    for cell in row_line.split("|")
                ]

                # Skip separator rows (|---|---|)
                if cells and not all(re.match(r"^[-:]+$", c) for c in cells):
                    table_rows.append(cells)
                i += 1

            if table_rows and len(table_rows) > 1:
                sections.append(
                    {"table": {"headers": table_rows[0], "rows": table_rows[1:]}}
                )
            continue

        # Code blocks (```language ... ```)
        if stripped.startswith("```"):
            language = stripped[3:].strip() or "text"
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            if code_lines:
                sections.append(
                    {
                        "code": {
                            "language": language,
                            "content": "\n".join(code_lines).rstrip(),
                        }
                    }
                )
            i += 1  # Skip closing ```
            continue

        # Regular paragraph
        # Collect continuous lines until we hit a special element
        content_parts = []
        while i < len(lines):
            current = lines[i]
            current_stripped = current.strip()

            # Stop if we hit any special element
            if not current_stripped:
                break
            if current.startswith("#"):
                break
            if current_stripped.startswith(">"):
                break
            if current_stripped.startswith("- "):
                break
            if current_stripped.startswith("|"):
                break
            if current_stripped.startswith("```"):
                break
            if is_separator_line(current):
                break
            if re.match(r"^\d+\.\s", current_stripped):
                break
            if is_ascii_art_box_line(current):
                break

            content_parts.append(current_stripped)
            i += 1

        if content_parts:
            content = " ".join(content_parts)
            content = convert_markdown_formatting(content)
            sections.append({"content": content})
        continue

    return sections


def detect_language(text):
    """Detect if text contains significant Chinese characters."""
    chinese_count = 0
    total_chars = 0
    for char in text:
        if char.strip():
            total_chars += 1
            if "\u4e00" <= char <= "\u9fff":
                chinese_count += 1

    if total_chars > 0 and chinese_count / total_chars > 0.1:
        return "zh"
    return "en"


def markdown_to_pdf(input_md, output_pdf, title=None, theme=None, language=None):
    """Convert Markdown file to PDF."""
    with open(input_md, "r", encoding="utf-8") as f:
        md_content = f.read()

    md_content = sanitize_for_cid_font(md_content)
    sections = parse_markdown_to_sections(md_content)

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
