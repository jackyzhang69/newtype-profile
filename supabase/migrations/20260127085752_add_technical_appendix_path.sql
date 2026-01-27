-- Add technical_appendix_path field to io_reports table for Ultra tier
-- Migration: 20260127085752

-- Add column for technical appendix PDF path (Ultra tier only)
ALTER TABLE io_reports
ADD COLUMN technical_appendix_path TEXT;

-- Add comment for documentation
COMMENT ON COLUMN io_reports.technical_appendix_path IS 'Storage path for technical appendix PDF (Ultra tier only). Contains legal framework, verification results, evidence analysis, and methodology.';
