-- Migration: Add privacy/desensitization tables for Immi-OS
-- Date: 2026-01-27
-- Description: PII extraction, TTL cleanup, knowledge base for AI training
-- Depends on: 20260126000000_create_io_audit_tables.sql

-- ============================================
-- Table: io_config (System configuration)
-- ============================================
create table if not exists io_config (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamptz default now()
);

insert into io_config (key, value, description) values 
  ('pii_retention_days', '30', 'Days to retain PII data before automatic deletion'),
  ('default_anonymize_level', 'conservative', 'Default anonymization level: minimal, conservative, aggressive')
on conflict (key) do nothing;

-- ============================================
-- Table: io_case_pii (PII hot data with TTL)
-- ============================================
create table if not exists io_case_pii (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  delete_at timestamptz not null,
  
  session_id uuid not null references io_audit_sessions(id) on delete cascade,
  
  -- Sponsor PII
  sponsor_full_name text,
  sponsor_family_name text,
  sponsor_given_name text,
  sponsor_dob date,
  sponsor_passport text,
  sponsor_uci text,
  sponsor_contact jsonb,
  
  -- Applicant PII
  applicant_full_name text,
  applicant_family_name text,
  applicant_given_name text,
  applicant_dob date,
  applicant_passport text,
  applicant_uci text,
  applicant_contact jsonb,
  
  -- Dependents PII
  dependents_pii jsonb,
  
  -- Original document paths (for S3 cleanup)
  raw_document_paths text[],
  
  -- Ownership
  user_id uuid,
  
  constraint uq_io_case_pii_session unique (session_id)
);

create index if not exists idx_io_case_pii_session_id on io_case_pii(session_id);
create index if not exists idx_io_case_pii_delete_at on io_case_pii(delete_at);
create index if not exists idx_io_case_pii_user_id on io_case_pii(user_id);

-- RLS
alter table io_case_pii enable row level security;

create policy "io_case_pii_user_access"
on io_case_pii for all to authenticated
using (user_id = auth.uid());

create policy "io_case_pii_service_access"
on io_case_pii for all to service_role
using (true);

-- ============================================
-- Table: io_knowledge_base (Anonymized training data)
-- ============================================
create table if not exists io_knowledge_base (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  
  -- References (nullable after PII deletion)
  pii_ref_id uuid,
  session_id uuid references io_audit_sessions(id) on delete set null,
  
  -- Abstract Features (no PII)
  application_type text not null,
  country_code text,
  sponsor_country_code text,
  
  -- Ranges (not exact values)
  applicant_age_range text,
  sponsor_age_range text,
  funds_range text,
  
  -- Categorical features
  education_level text,
  relationship_type text,
  relationship_duration_months int,
  has_children boolean,
  has_previous_refusal boolean,
  
  -- Extended features (flexible JSON)
  profile_features jsonb,
  
  -- Anonymized Outputs (for training)
  audit_report_anonymized text,
  reasoning_chain_anonymized text,
  executive_summary_anonymized text,
  
  -- Structured analysis (no PII)
  risk_factors jsonb,
  vulnerabilities jsonb,
  strengths jsonb,
  
  -- Results
  verdict text check (verdict in ('GO', 'CAUTION', 'NO-GO')),
  score int check (score >= 0 and score <= 100),
  score_with_mitigation int check (score_with_mitigation >= 0 and score_with_mitigation <= 100),
  tier text check (tier in ('guest', 'pro', 'ultra')),
  
  -- Human annotation (for supervised learning)
  actual_outcome text check (actual_outcome in ('approved', 'refused', 'withdrawn', 'unknown')),
  outcome_date date,
  annotator_notes text,
  
  -- Quality flags
  is_verified boolean default false,
  quality_score numeric(3,2)
);

create index if not exists idx_io_kb_application_type on io_knowledge_base(application_type);
create index if not exists idx_io_kb_country_code on io_knowledge_base(country_code);
create index if not exists idx_io_kb_verdict on io_knowledge_base(verdict);
create index if not exists idx_io_kb_score on io_knowledge_base(score);
create index if not exists idx_io_kb_created_at on io_knowledge_base(created_at desc);
create index if not exists idx_io_kb_session_id on io_knowledge_base(session_id);

-- Composite index for similarity search
create index if not exists idx_io_kb_similarity on io_knowledge_base(
  application_type, 
  country_code, 
  applicant_age_range, 
  education_level
);

-- RLS: service_role ONLY (Few-Shot API access)
alter table io_knowledge_base enable row level security;

create policy "io_kb_service_read"
on io_knowledge_base for select to service_role
using (true);

create policy "io_kb_service_insert"
on io_knowledge_base for insert to service_role
with check (true);

create policy "io_kb_service_update"
on io_knowledge_base for update to service_role
using (true);

-- ============================================
-- Alter existing tables: Add TTL and anonymization fields
-- ============================================

-- io_case_profiles: Add TTL column
alter table io_case_profiles 
add column if not exists delete_at timestamptz;

create index if not exists idx_io_case_profiles_delete_at 
on io_case_profiles(delete_at) 
where delete_at is not null;

-- io_reports: Add anonymization fields
alter table io_reports 
add column if not exists is_anonymized boolean default false;

alter table io_reports 
add column if not exists anonymize_level text 
check (anonymize_level in ('minimal', 'conservative', 'aggressive'));

create index if not exists idx_io_reports_is_anonymized 
on io_reports(is_anonymized);

-- ============================================
-- TTL Cleanup Function
-- ============================================
create or replace function cleanup_expired_pii()
returns jsonb
language plpgsql
security definer
as $$
declare
  deleted_pii int := 0;
  deleted_profiles int := 0;
  deleted_documents int := 0;
  expired_sessions uuid[];
begin
  -- Get sessions with expired PII
  select array_agg(session_id) into expired_sessions
  from io_case_pii 
  where delete_at < now();
  
  -- Delete expired PII records
  with deleted as (
    delete from io_case_pii 
    where delete_at < now()
    returning id
  )
  select count(*) into deleted_pii from deleted;
  
  -- Delete expired CaseProfiles
  with deleted as (
    delete from io_case_profiles 
    where delete_at is not null and delete_at < now()
    returning id
  )
  select count(*) into deleted_profiles from deleted;
  
  -- Delete document metadata for expired sessions
  if expired_sessions is not null and array_length(expired_sessions, 1) > 0 then
    with deleted as (
      delete from io_documents
      where session_id = any(expired_sessions)
      returning id
    )
    select count(*) into deleted_documents from deleted;
  end if;
  
  -- Log the cleanup
  insert into io_audit_log (event_type, event_data)
  values ('pii_cleanup', jsonb_build_object(
    'deleted_pii', deleted_pii,
    'deleted_profiles', deleted_profiles,
    'deleted_documents', deleted_documents,
    'expired_sessions', expired_sessions,
    'timestamp', now()
  ));
  
  return jsonb_build_object(
    'success', true,
    'deleted_pii', deleted_pii,
    'deleted_profiles', deleted_profiles,
    'deleted_documents', deleted_documents
  );
end;
$$;

-- ============================================
-- Helper Functions
-- ============================================

-- Get current PII retention period
create or replace function get_pii_retention_days()
returns int
language sql
security definer
stable
as $$
  select coalesce(
    (select value::int from io_config where key = 'pii_retention_days'),
    30
  );
$$;

-- Set PII retention period
create or replace function set_pii_retention_days(days int)
returns void
language plpgsql
security definer
as $$
begin
  insert into io_config (key, value, description, updated_at)
  values ('pii_retention_days', days::text, 'Days to retain PII data before automatic deletion', now())
  on conflict (key) do update set value = days::text, updated_at = now();
end;
$$;

-- Calculate delete_at timestamp based on retention config
create or replace function calculate_pii_delete_at()
returns timestamptz
language sql
security definer
stable
as $$
  select now() + (get_pii_retention_days() || ' days')::interval;
$$;

-- ============================================
-- pg_cron Job (if extension available)
-- ============================================
-- Note: Run this manually if pg_cron is available
-- select cron.schedule(
--   'cleanup-expired-pii',
--   '0 2 * * *',
--   'select cleanup_expired_pii()'
-- );

-- ============================================
-- Knowledge Base Statistics Function
-- ============================================
create or replace function get_knowledge_stats()
returns jsonb
language sql
security definer
stable
as $$
  select jsonb_build_object(
    'total_cases', (select count(*) from io_knowledge_base),
    'by_application_type', (
      select jsonb_object_agg(application_type, cnt)
      from (
        select application_type, count(*) as cnt 
        from io_knowledge_base 
        group by application_type
      ) t
    ),
    'by_verdict', (
      select jsonb_object_agg(verdict, cnt)
      from (
        select verdict, count(*) as cnt 
        from io_knowledge_base 
        where verdict is not null
        group by verdict
      ) t
    ),
    'by_country', (
      select jsonb_object_agg(country_code, cnt)
      from (
        select country_code, count(*) as cnt 
        from io_knowledge_base 
        where country_code is not null
        group by country_code
        order by cnt desc
        limit 10
      ) t
    ),
    'verified_count', (select count(*) from io_knowledge_base where is_verified = true),
    'avg_score', (select round(avg(score)::numeric, 1) from io_knowledge_base where score is not null)
  );
$$;

-- ============================================
-- Done
-- ============================================
-- To apply: Run this SQL in Supabase Studio
-- Or use: supabase db push
--
-- To schedule pg_cron cleanup (run manually after migration):
-- select cron.schedule('cleanup-expired-pii', '0 2 * * *', 'select cleanup_expired_pii()');
