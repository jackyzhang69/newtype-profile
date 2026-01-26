-- Migration: Add optimistic locking to io_audit_sessions
-- Date: 2026-01-26
-- Description: Add version column for concurrent update protection

-- Add version column with default 1
ALTER TABLE io_audit_sessions 
ADD COLUMN IF NOT EXISTS version int DEFAULT 1 NOT NULL;

-- Create index for version queries
CREATE INDEX IF NOT EXISTS idx_io_audit_sessions_version 
ON io_audit_sessions(id, version);

-- Function to increment version on update
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$;

-- Trigger to auto-increment version
DROP TRIGGER IF EXISTS increment_io_audit_sessions_version ON io_audit_sessions;
CREATE TRIGGER increment_io_audit_sessions_version
BEFORE UPDATE ON io_audit_sessions
FOR EACH ROW EXECUTE FUNCTION increment_version();

-- Function for optimistic update (returns NULL if version mismatch)
CREATE OR REPLACE FUNCTION update_session_optimistic(
  p_session_id uuid,
  p_expected_version int,
  p_updates jsonb
)
RETURNS io_audit_sessions
LANGUAGE plpgsql
AS $$
DECLARE
  result io_audit_sessions;
BEGIN
  UPDATE io_audit_sessions
  SET 
    status = COALESCE((p_updates->>'status')::text, status),
    current_stage = COALESCE((p_updates->>'current_stage')::text, current_stage),
    verdict = COALESCE((p_updates->>'verdict')::text, verdict),
    score = COALESCE((p_updates->>'score')::int, score),
    score_with_mitigation = COALESCE((p_updates->>'score_with_mitigation')::int, score_with_mitigation),
    recommendation = COALESCE((p_updates->>'recommendation')::text, recommendation),
    error_message = COALESCE((p_updates->>'error_message')::text, error_message),
    verify_iterations = COALESCE((p_updates->>'verify_iterations')::int, verify_iterations)
  WHERE id = p_session_id AND version = p_expected_version
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;
