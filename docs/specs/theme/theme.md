# Judicial Authority

A professional and authoritative theme inspired by legal documents and court proceedings. Designed for immigration consultants and lawyers who need to convey credibility, expertise, and trustworthiness.

## Color Palette

- **Navy**: `#0A192F` - Primary color for headers and key elements
- **Gold**: `#C5A059` - Accent color for emphasis, highlights, and authority markers
- **Slate**: `#64748B` - Secondary text and supporting elements
- **Paper**: `#FDFBF7` - Background color, evokes quality document paper
- **Paper Dark**: `#F7F5F0` - Alternate background for sections
- **Ink**: `#1a1a1a` - Primary text color

## Verdict Colors (Semantic)

- **Go (Approved)**: `#047857` - Positive outcomes, approvals
- **Caution (Review)**: `#B45309` - Warnings, items needing attention
- **No-Go (Denied)**: `#BE123C` - Rejections, critical issues

## Risk Level Colors

- **High Risk**: `#9F1239` - Critical risk indicators
- **Medium Risk**: `#92400E` - Moderate risk indicators
- **Low Risk**: `#475569` - Minor risk indicators

## Typography

### Design Philosophy

"serif headers + sans-serif body" - Headers use serif fonts for tradition and authority, body text uses sans-serif for modern readability.

### Typography - English

| Usage | Primary Font | Type | ReportLab Equivalent |
|-------|--------------|------|---------------------|
| **Headers** | Georgia | serif | Times-Bold |
| **Body Text** | Arial | sans-serif | Helvetica |
| **Code/Monospace** | Courier New | monospace | Courier |

### Typography - Chinese (CJK)

| Usage | Primary Font | Type | macOS System Font |
|-------|--------------|------|-------------------|
| **Headers** | Songti SC (宋体) | serif | /System/Library/Fonts/Supplemental/Songti.ttc |
| **Body Text** | Hiragino Sans GB | sans-serif | /System/Library/Fonts/Hiragino Sans GB.ttc |
| **Code/Monospace** | Menlo | monospace | /System/Library/Fonts/Menlo.ttc |

**Note**: PingFang SC uses PostScript outlines which are not supported by ReportLab. Hiragino Sans GB is used as the sans-serif alternative.

### Typography - PDF Generation (ReportLab)

The PDF generator supports language-aware font selection:

#### English PDF (`--language en`)
```
headerFont: "Times-Bold"     # ReportLab built-in serif
bodyFont: "Helvetica"        # ReportLab built-in sans-serif
codeFont: "Courier"          # ReportLab built-in monospace
```

#### Chinese PDF (`--language zh`)
```
headerFont: "Songti-SC"        # Registered TTF: /System/Library/Fonts/Supplemental/Songti.ttc
bodyFont: "Hiragino-Sans-GB"   # Registered TTF: /System/Library/Fonts/Hiragino Sans GB.ttc
codeFont: "Menlo"              # Registered TTF: /System/Library/Fonts/Menlo.ttc
```

#### Fallback (CID fonts, no serif/sans-serif distinction)
```
headerFont: "STSong-Light"   # ReportLab CID font (built-in)
bodyFont: "STSong-Light"     # ReportLab CID font (built-in)
codeFont: "STSong-Light"     # ReportLab CID font (built-in)
```

**Note**: `STSong-Light` is a CID font built into ReportLab. It supports CJK characters but NOT box-drawing characters (─│┌┐└┘├┤┬┴┼).

### Box-Drawing Character Handling

The `markdown_to_pdf_reportlab.py` wrapper script automatically converts box-drawing characters to ASCII equivalents:

| Box Character | ASCII Replacement |
|---------------|-------------------|
| `┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼` | `+` |
| `─ ═` | `-` |
| `│ ║` | `\|` |

This ensures full compatibility with CID fonts while preserving the visual structure of diagrams.

### Legacy Specifications

- **Headers**: Georgia / Merriweather Bold - Serif font conveying tradition and authority
- **Body Text**: Arial / Inter - Clean sans-serif for readability
- **Section Labels**: Arial Bold, 11px, uppercase, letter-spacing 0.15em
- **Citations**: Georgia Italic, 14px

## Visual Elements

- **Accent Bar**: 3-4px gold vertical bar for margin annotations
- **Document Card**: Paper background with subtle shadow
- **Verdict Badge**: Bold uppercase with semantic color background
- **Header Bar**: Navy full-width with gold left accent

## Shadows

- **Document**: `inset 0 1px 4px rgba(10, 25, 47, 0.08)`
- **Card**: `0 1px 3px rgba(10, 25, 47, 0.06), 0 4px 12px rgba(10, 25, 47, 0.04)`
- **Elevated**: `0 4px 20px rgba(10, 25, 47, 0.12), 0 1px 4px rgba(10, 25, 47, 0.08)`

## Best Used For

- Judicial defensibility assessment reports
- Immigration case analysis documents
- Federal Court precedent summaries
- Risk evaluation presentations
- Client-facing legal briefs
- Compliance audit reports

## Design Philosophy

"Inner Hawk, Outer Dove" - The theme projects calm professionalism externally while supporting rigorous analytical work internally. The combination of traditional serif headers with modern sans-serif body text bridges legal tradition with contemporary accessibility.
