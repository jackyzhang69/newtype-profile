export const FILE_CONTENT_EXTRACT_DESCRIPTION = `Extract text content from multiple files using ImmiCore FileContentService.

Supports: PDF (text/scanned/XFA forms), DOCX, XLSX, PPTX, HTML, TXT, MD, JSON, CSV.

Features:
- Automatic PDF type detection (text-based vs scanned vs XFA forms)
- XFA form field extraction with labels and values
- OCR for scanned documents via Vision API
- Batch processing with progress tracking
- Async task queue to avoid timeout issues

Returns extracted content with metadata. Use for batch file processing before audit analysis.

Example usage: Extract content from visa application documents (IMM forms, bank statements, etc.)`
