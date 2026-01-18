#!/usr/bin/env python3
import sys
import json
import subprocess
import re
from pathlib import Path

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
    for box_char, replacement in BOX_CHAR_MAP.items():
        text = text.replace(box_char, replacement)
    for emoji, replacement in EMOJI_MAP.items():
        text = text.replace(emoji, replacement)
    return text


def convert_markdown_formatting(text):
    """Convert markdown inline formatting to ReportLab HTML-like tags.

    ReportLab Paragraph supports: <b>, <i>, <u>, <br/>, <font>
    Markdown uses: **bold**, *italic*, __bold__, _italic_, `code`
    """
    # **bold** → <b>bold</b> (处理双星号，使用非贪婪匹配)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    # __bold__ → <b>bold</b>
    text = re.sub(r"__(.+?)__", r"<b>\1</b>", text)
    # *italic* → <i>italic</i> (处理单星号，避免匹配已转换的标签)
    text = re.sub(r"(?<![<>/])\*([^*]+?)\*(?![<>/])", r"<i>\1</i>", text)
    # _italic_ → <i>italic</i> (避免匹配下划线变量名)
    text = re.sub(r"(?<![a-zA-Z0-9])_([^_]+?)_(?![a-zA-Z0-9])", r"<i>\1</i>", text)
    return text


def convert_markdown_line_breaks(text):
    """Convert markdown line breaks to ReportLab <br/> tags.

    Markdown line break syntax:
    1. Two trailing spaces before newline: "text  \\n" → "text<br/>"
    2. Backslash before newline: "text\\\\n" → "text<br/>"
    3. Explicit <br> or <br/> tags are preserved
    """
    # Convert trailing two spaces + newline → <br/>
    text = re.sub(r"  \n", r"<br/>", text)
    # Convert backslash + newline → <br/>
    text = re.sub(r"\\\n", r"<br/>", text)
    # Normalize <br> to <br/> for ReportLab
    text = re.sub(r"<br\s*/?>", r"<br/>", text)
    return text


def parse_markdown_to_sections(md_content):
    """Parse markdown to generate_pdf.py sections format"""
    sections = []
    lines = md_content.split("\n")
    i = 0

    while i < len(lines):
        line = lines[i]

        if line.startswith("# "):
            heading = convert_markdown_formatting(line[2:].strip())
            sections.append({"heading": heading, "level": 1})
        elif line.startswith("## "):
            heading = convert_markdown_formatting(line[3:].strip())
            sections.append({"heading": heading, "level": 2})
        elif line.startswith("### "):
            heading = convert_markdown_formatting(line[4:].strip())
            sections.append({"heading": heading, "level": 3})
        elif line.startswith("#### "):
            heading = convert_markdown_formatting(line[5:].strip())
            sections.append({"heading": heading, "level": 4})
        elif line.strip().startswith("- "):
            bullets = []
            while i < len(lines) and lines[i].strip().startswith("- "):
                bullet_text = lines[i].strip()[2:].strip()
                bullet_text = convert_markdown_formatting(bullet_text)
                bullets.append(bullet_text)
                i += 1
            if bullets:
                sections.append({"bullets": bullets})
            i -= 1
        elif re.match(r"^\d+\.\s", line.strip()):
            # Numbered list (1. 2. 3. etc)
            numbered = []
            while i < len(lines) and re.match(r"^\d+\.\s", lines[i].strip()):
                # Extract text after "N. "
                item_text = re.sub(r"^\d+\.\s*", "", lines[i].strip())
                item_text = convert_markdown_formatting(item_text)
                numbered.append(item_text)
                i += 1
            if numbered:
                sections.append({"numbered": numbered})
            i -= 1
        elif line.strip().startswith("| "):
            table_rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                row_text = lines[i].strip()[1:-1]
                cells = [convert_markdown_formatting(cell.strip()) for cell in row_text.split("|")]
                if cells and any(c.strip() for c in cells):
                    if "-" not in cells[0]:
                        table_rows.append(cells)
                i += 1
            if table_rows and len(table_rows) > 1:
                sections.append(
                    {"table": {"headers": table_rows[0], "rows": table_rows[1:]}}
                )
            i -= 1
        elif line.strip() == "---":
            sections.append({"divider": True})
        elif line.strip().startswith("```"):
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            if code_lines:
                sections.append(
                    {
                        "code": {
                            "language": "text",
                            "content": "\n".join(code_lines).strip(),
                        }
                    }
                )
        elif line.strip():
            # Check if current line has trailing double spaces (Markdown line break)
            has_line_break = line.rstrip('\n').endswith('  ') or line.rstrip('\n').endswith('\\')
            content = line.strip()
            if has_line_break:
                content += "<br/>"

            while (
                i + 1 < len(lines)
                and lines[i + 1].strip()
                and not lines[i + 1].startswith(("#", "- ", "| ", "```", "---"))
            ):
                i += 1
                next_line = lines[i]
                # Check if next line has trailing double spaces or backslash
                has_line_break = next_line.rstrip('\n').endswith('  ') or next_line.rstrip('\n').endswith('\\')
                content += next_line.strip()
                if has_line_break:
                    content += "<br/>"

            if content:
                content = convert_markdown_formatting(content)
                sections.append({"content": content})

        i += 1

    return sections


def detect_language(text):
    """Detect if text contains significant Chinese characters"""
    chinese_count = 0
    total_chars = 0
    for char in text:
        if char.strip():  # Skip whitespace
            total_chars += 1
            # CJK Unified Ideographs range
            if '\u4e00' <= char <= '\u9fff':
                chinese_count += 1

    # If more than 10% Chinese characters, treat as Chinese
    if total_chars > 0 and chinese_count / total_chars > 0.1:
        return "zh"
    return "en"


def markdown_to_pdf(input_md, output_pdf, title=None, theme=None, language=None):
    with open(input_md, "r", encoding="utf-8") as f:
        md_content = f.read()

    md_content = sanitize_for_cid_font(md_content)

    sections = parse_markdown_to_sections(md_content)

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
        # Note: Fonts are now set by generate_pdf.py based on --language parameter

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

    # Handle language=auto
    language = args.language if args.language != "auto" else None

    result = markdown_to_pdf(args.input_md, args.output_pdf, args.title, language=language)
    sys.exit(0 if result else 1)
