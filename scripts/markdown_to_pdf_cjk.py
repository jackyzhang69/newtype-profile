#!/usr/bin/env python3
import sys
import re
from pathlib import Path
from markdown2 import markdown
from xhtml2pdf import pisa
from io import BytesIO

def markdown_to_pdf(input_md, output_pdf):
    """Convert markdown to PDF with CJK (Chinese) font support"""
    
    with open(input_md, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    html_content = markdown(md_content)
    
    html_with_css = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @font-face {{
                font-family: 'ChineseFont';
                src: local('STHeiti'), local('PingFang SC'), local('Noto Sans CJK SC'), sans-serif;
            }}
            
            body {{
                font-family: 'ChineseFont', Arial, sans-serif;
                line-height: 1.6;
                color: #1a1a1a;
                background: #FDFBF7;
                margin: 0.75in;
            }}
            
            h1, h2, h3, h4 {{
                font-family: 'ChineseFont', Georgia, serif;
                color: #0A192F;
                margin-top: 1em;
                margin-bottom: 0.5em;
            }}
            
            h1 {{ font-size: 28pt; text-align: center; }}
            h2 {{ font-size: 18pt; border-bottom: 2px solid #C5A059; padding-bottom: 0.5em; }}
            h3 {{ font-size: 14pt; }}
            h4 {{ font-size: 12pt; }}
            
            p {{ margin: 0.5em 0; }}
            
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 1em 0;
            }}
            
            th, td {{
                border: 1px solid #64748B;
                padding: 8px;
                text-align: left;
            }}
            
            th {{
                background: #0A192F;
                color: white;
                font-weight: bold;
            }}
            
            tr:nth-child(even) {{
                background: #F7F5F0;
            }}
            
            .verdict {{
                padding: 1em;
                border-left: 4px solid #C5A059;
                background: #FEF3C7;
                margin: 1em 0;
            }}
            
            .success {{ border-left-color: #047857; background: #ECFDF5; }}
            .warning {{ border-left-color: #B45309; background: #FEF3C7; }}
            .danger {{ border-left-color: #BE123C; background: #FFE4E6; }}
            
            ul, ol {{ margin: 0.5em 0; padding-left: 2em; }}
            li {{ margin: 0.25em 0; }}
            
            code {{
                font-family: 'Courier New', monospace;
                background: #F7F5F0;
                padding: 0.2em 0.4em;
                border-radius: 3px;
            }}
            
            pre {{
                background: #F7F5F0;
                padding: 1em;
                border-radius: 5px;
                overflow: auto;
            }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    with open(output_pdf, 'wb') as f:
        pisa.CreatePDF(html_with_css, f, encoding='UTF-8')
    
    print(f"✓ PDF generated: {output_pdf}")
    return output_pdf

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 markdown_to_pdf_cjk.py <input.md> <output.pdf>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not Path(input_file).exists():
        print(f"Error: {input_file} not found")
        sys.exit(1)
    
    markdown_to_pdf(input_file, output_file)
