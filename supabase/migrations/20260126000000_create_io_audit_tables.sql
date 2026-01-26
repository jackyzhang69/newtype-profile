-- Migration: Create io_audit_* tables for Immi-OS
-- Date: 2026-01-26
-- Description: Audit workflow persistence with RLS multi-tenant support

-- ============================================
-- Helper Function: Auto-update updated_at
-- ============================================
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================
-- Table 1: io_audit_sessions (Main session table)
-- ============================================
create table if not exists io_audit_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Case identification
  case_id text not null,
  case_slot text not null,
  
  -- Configuration
  tier text not null check (tier in ('guest', 'pro', 'ultra')),
  app_type text not null check (app_type in ('spousal', 'study', 'work', 'family', 'other')),
  
  -- Status tracking
  status text default 'pending' check (status in ('pending', 'intake', 'investigation', 'strategy', 'review', 'verification', 'judgment', 'reporting', 'completed', 'failed')),
  current_stage text,
  stages_completed text[] default '{}',
  
  -- Result summary
  verdict text check (verdict in ('GO', 'CAUTION', 'NO-GO')),
  score int check (score >= 0 and score <= 100),
  score_with_mitigation int check (score_with_mitigation >= 0 and score_with_mitigation <= 100),
  recommendation text check (recommendation in ('PROCEED', 'REVISE', 'HIGH-RISK')),
  
  -- Metadata
  error_message text,
  verify_iterations int default 0,
  
  -- Multi-tenant: user reference
  user_id uuid
);

create index if not exists idx_io_audit_sessions_case_id on io_audit_sessions(case_id);
create index if not exists idx_io_audit_sessions_status on io_audit_sessions(status);
create index if not exists idx_io_audit_sessions_created_at on io_audit_sessions(created_at desc);
create index if not exists idx_io_audit_sessions_user_id on io_audit_sessions(user_id);

-- RLS
alter table io_audit_sessions enable row level security;

create policy "io_audit_sessions_user_access"
on io_audit_sessions for all to authenticated
using (user_id = auth.uid());

-- Allow service role full access
create policy "io_audit_sessions_service_access"
on io_audit_sessions for all to service_role
using (true);

-- Trigger for updated_at
create trigger update_io_audit_sessions_updated_at
before update on io_audit_sessions
for each row execute function update_updated_at();

-- ============================================
-- Table 2: io_case_profiles (Case profile data)
-- ============================================
create table if not exists io_case_profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Foreign key to session
  session_id uuid not null references io_audit_sessions(id) on delete cascade,
  
  -- Core profile data (JSONB for CaseProfile interface)
  profile_data jsonb not null,
  
  -- Denormalized for common queries
  application_type text not null,
  sponsor_name text,
  applicant_name text,
  applicant_nationality text,
  relationship_type text,
  
  -- Document stats
  total_files int default 0,
  extracted_count int default 0,
  failed_count int default 0,
  
  -- Completeness
  is_complete boolean default false,
  missing_documents text[] default '{}',
  warnings text[] default '{}'
);

create unique index if not exists idx_io_case_profiles_session_id on io_case_profiles(session_id);

-- RLS
alter table io_case_profiles enable row level security;

create policy "io_case_profiles_user_access"
on io_case_profiles for all to authenticated
using (session_id in (select id from io_audit_sessions where user_id = auth.uid()));

create policy "io_case_profiles_service_access"
on io_case_profiles for all to service_role
using (true);

-- Trigger for updated_at
create trigger update_io_case_profiles_updated_at
before update on io_case_profiles
for each row execute function update_updated_at();

-- ============================================
-- Table 3: io_stage_results (Agent stage outputs)
-- ============================================
create table if not exists io_stage_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  
  -- Foreign key
  session_id uuid not null references io_audit_sessions(id) on delete cascade,
  
  -- Stage identification
  stage text not null check (stage in ('intake', 'detective', 'strategist', 'gatekeeper', 'verifier', 'reporter')),
  iteration int default 1,
  
  -- Agent execution metadata
  agent_model text,
  temperature numeric(3, 2),
  duration_ms int,
  
  -- Output (JSONB for flexible agent outputs)
  output_data jsonb not null,
  
  -- Summary for quick access
  status text check (status in ('success', 'partial', 'failed')),
  summary text,
  
  constraint uq_io_stage_results_session_iteration unique (session_id, stage, iteration)
);

create index if not exists idx_io_stage_results_session_id on io_stage_results(session_id);
create index if not exists idx_io_stage_results_stage on io_stage_results(stage);

-- RLS
alter table io_stage_results enable row level security;

create policy "io_stage_results_user_access"
on io_stage_results for all to authenticated
using (session_id in (select id from io_audit_sessions where user_id = auth.uid()));

create policy "io_stage_results_service_access"
on io_stage_results for all to service_role
using (true);

-- ============================================
-- Table 4: io_citations (Legal citation tracking)
-- ============================================
create table if not exists io_citations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  
  -- Foreign key
  session_id uuid not null references io_audit_sessions(id) on delete cascade,
  
  -- Citation info
  citation text not null,
  source_stage text,
  
  -- Verification
  verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'unverified', 'failed', 'bad_law')),
  verified_at timestamptz,
  
  -- Authority/validity (from KG)
  authority_score numeric(5, 2),
  validity_status text,
  
  -- Additional context
  relevance_note text,
  case_url text
);

create index if not exists idx_io_citations_session_id on io_citations(session_id);
create index if not exists idx_io_citations_verification_status on io_citations(verification_status);

-- RLS
alter table io_citations enable row level security;

create policy "io_citations_user_access"
on io_citations for all to authenticated
using (session_id in (select id from io_audit_sessions where user_id = auth.uid()));

create policy "io_citations_service_access"
on io_citations for all to service_role
using (true);

-- ============================================
-- Table 5: io_documents (Document metadata)
-- ============================================
create table if not exists io_documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  
  -- Foreign key
  session_id uuid not null references io_audit_sessions(id) on delete cascade,
  
  -- File identification
  filename text not null,
  original_path text,
  file_type text,
  file_size int,
  
  -- Storage (S3 path)
  storage_path text,
  storage_bucket text default 'audit-documents',
  
  -- Extraction status
  extraction_status text default 'pending' check (extraction_status in ('pending', 'processing', 'success', 'failed', 'unsupported')),
  extraction_error text,
  
  -- Document classification
  document_type text,
  form_type text,
  
  -- XFA fields (if form)
  xfa_fields jsonb,
  page_count int
);

create index if not exists idx_io_documents_session_id on io_documents(session_id);
create index if not exists idx_io_documents_extraction_status on io_documents(extraction_status);

-- RLS
alter table io_documents enable row level security;

create policy "io_documents_user_access"
on io_documents for all to authenticated
using (session_id in (select id from io_audit_sessions where user_id = auth.uid()));

create policy "io_documents_service_access"
on io_documents for all to service_role
using (true);

-- ============================================
-- Table 6: io_reports (Audit report versions)
-- ============================================
create table if not exists io_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  
  -- Foreign key
  session_id uuid not null references io_audit_sessions(id) on delete cascade,
  
  -- Version tracking
  version int default 1,
  is_final boolean default false,
  
  -- Report content
  verdict text not null check (verdict in ('GO', 'CAUTION', 'NO-GO')),
  score int not null check (score >= 0 and score <= 100),
  
  -- Storage paths (S3)
  markdown_path text,
  pdf_path text,
  json_path text,
  
  -- Template info
  tier text not null,
  theme text default 'judicial-authority',
  
  constraint uq_io_reports_session_version unique (session_id, version)
);

create index if not exists idx_io_reports_session_id on io_reports(session_id);
create index if not exists idx_io_reports_is_final on io_reports(is_final) where is_final = true;

-- RLS
alter table io_reports enable row level security;

create policy "io_reports_user_access"
on io_reports for all to authenticated
using (session_id in (select id from io_audit_sessions where user_id = auth.uid()));

create policy "io_reports_service_access"
on io_reports for all to service_role
using (true);

-- ============================================
-- Table 7: io_audit_log (Operation log)
-- ============================================
create table if not exists io_audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  
  session_id uuid references io_audit_sessions(id) on delete set null,
  
  event_type text not null,
  event_data jsonb,
  
  -- Context
  stage text,
  agent_name text,
  
  -- Error tracking
  error_code text,
  error_message text
);

create index if not exists idx_io_audit_log_session_id on io_audit_log(session_id);
create index if not exists idx_io_audit_log_event_type on io_audit_log(event_type);
create index if not exists idx_io_audit_log_created_at on io_audit_log(created_at desc);

-- RLS
alter table io_audit_log enable row level security;

create policy "io_audit_log_user_access"
on io_audit_log for all to authenticated
using (session_id in (select id from io_audit_sessions where user_id = auth.uid()));

create policy "io_audit_log_service_access"
on io_audit_log for all to service_role
using (true);

-- ============================================
-- Done
-- ============================================
-- To apply: Run this SQL in Supabase Studio or via CLI
-- supabase db push (if using Supabase CLI)
