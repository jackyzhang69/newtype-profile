export const FILE_CONTENT_EXTRACT_DESCRIPTION = `Extract text content from multiple files using ImmiCore FileContentService.

Supports: PDF (text/scanned/XFA forms), DOCX, XLSX, PPTX, HTML, TXT, MD, JSON, CSV.

Features:
- Automatic PDF type detection (text-based vs scanned vs XFA forms)
- XFA form field extraction with labels and values
- OCR for scanned documents via Vision API
- Batch processing with progress tracking
- Async task queue to avoid timeout issues

IMPORTANT: Use save_to_file parameter to avoid large output:
- When set, full content is saved to the specified file path
- Returns summary only (filename, char_count, page_count per file)
- Recommended for case audits with many documents

Example:
  file_content_extract({
    file_paths: [...],
    save_to_file: "/path/to/case/extracted_docs.json"
  })
  // Returns summary, full content saved to file
  // Use read tool to access specific files from saved JSON`
