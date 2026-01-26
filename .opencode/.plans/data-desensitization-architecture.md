# Data Desensitization Architecture Plan

**Created:** 2026-01-26
**Updated:** 2026-01-26
**Status:** Planning → Ready for Implementation
**Priority:** High
**Prerequisite:** Supabase Persistence Migration (Phase 4 完成)

---

## 1. Executive Summary

### 1.1 Business Requirements

| Requirement | Description |
|-------------|-------------|
| **Training Data** | Anonymized audit data for permanent AI training |
| **Client Delivery** | Real client information for professional delivery |
| **Demo Mode** | Anonymized reports for presentations and demos |
| **Data Retention** | Real data: Configurable TTL (default 30 days), Anonymized: Permanent |

### 1.2 Current State (Post-Supabase Migration)

| Aspect | Status | Notes |
|--------|--------|-------|
| **Supabase Connection** | ✅ Configured | `.env` with all credentials |
| **7 Core Tables** | ✅ Deployed | `io_audit_sessions`, `io_case_profiles`, etc. |
| **Repository Layer** | ✅ Implemented | 7 repositories with tests |
| **Workflow Service** | ✅ Implemented | `AuditSessionService` with stateless API |
| **Agent Tools** | ✅ Implemented | 6 persistence tools |
| **S3 Storage** | ✅ Designed | `audit-documents` bucket structure |

### 1.3 What This Plan Adds

| Component | Status | Notes |
|-----------|--------|-------|
| `io_case_pii` table | ❌ To Create | PII hot data with configurable TTL |
| `io_knowledge_base` table | ❌ To Create | Permanent anonymized training data |
| `sanitizeText()` function | ❌ To Implement | PII replacement logic |
| `extractFeatures()` function | ❌ To Implement | Feature extraction for training |
| `core-data-privacy` skill | ❌ To Create | Rules for Agent understanding |
| TTL cleanup (pg_cron) | ❌ To Configure | Automatic PII deletion |
| Reporter dual-output | ❌ To Implement | Real + Demo reports |

---

## 2. Confirmed Design Decisions

| # | Decision | Confirmed Choice | Notes |
|---|----------|------------------|-------|
| 1 | Implementation Approach | **Full dual-table architecture** | 5-6 days, one-time investment |
| 2 | Development Timeline | **5-6 days** | Acceptable vs 2-3 day minimal |
| 3 | Knowledge Base Access | **service_role only** | API provides Few-Shot access |
| 4 | TTL Cleanup | **Automatic (pg_cron)** | Configurable retention period |
| 5 | Default Retention | **30 days** | Configurable via env var |
| 6 | Export Feature | **Phase 6 (future)** | Core functionality first |

---

## 3. Architecture Design

### 3.1 Data Flow Overview (WITH Supabase)

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 0-5: Audit Workflow (Uses Real PII)                      │
│                                                                 │
│  Intake → AuditManager → Detective → Strategist →               │
│  Gatekeeper → Verifier → AuditManager (Judgment)                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  io_case_profiles    │ ← Complete CaseProfile JSON
              │  (Contains Real PII) │   (Temporary, for audit process)
              │  + delete_at column  │   (TTL: configurable, default 30d)
              └──────────┬───────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 5.5: REPORTER (Desensitization Fork Point)               │
│                                                                 │
│  ┌─────────────────────────┐    ┌─────────────────────────────┐│
│  │  REAL DATA PATH         │    │  ANONYMIZED DATA PATH       ││
│  │  (For Client Delivery)  │    │  (For Training/Demo)        ││
│  └───────────┬─────────────┘    └───────────┬─────────────────┘│
│              │                               │                  │
│              ▼                               ▼                  │
│  ┌─────────────────────────┐    ┌─────────────────────────────┐│
│  │ 1. Extract PII fields   │    │ 1. Extract abstract features││
│  │    → io_case_pii        │    │    extractFeatures()        ││
│  │                         │    │                             ││
│  │ 2. Generate real report │    │ 2. Sanitize all text        ││
│  │    report.pdf           │    │    sanitizeText()           ││
│  │                         │    │                             ││
│  │ 3. Upload to S3         │    │ 3. Save to knowledge base   ││
│  │    reports/v{N}/        │    │    → io_knowledge_base      ││
│  │    report.pdf           │    │                             ││
│  │                         │    │ 4. Generate demo report     ││
│  │ 4. Record in io_reports │    │    report_demo.pdf          ││
│  │    is_anonymized=false  │    │                             ││
│  │                         │    │ 5. Upload to S3             ││
│  │                         │    │    reports/v{N}/            ││
│  │                         │    │    report_demo.pdf          ││
│  │                         │    │                             ││
│  │                         │    │ 6. Record in io_reports     ││
│  │                         │    │    is_anonymized=true       ││
│  └─────────────────────────┘    └─────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │  AUTOMATIC CLEANUP (pg_cron)       │
        │  Runs daily at 02:00              │
        │                                    │
        │  DELETE WHERE delete_at < NOW():   │
        │  • io_case_pii                     │
        │  • io_case_profiles                │
        │  • S3: real reports (via webhook)  │
        └────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │  PERMANENT STORAGE                 │
        │                                    │
        │  • io_knowledge_base (anonymized)  │
        │  • S3: demo reports                │
        │  • io_audit_sessions (metadata)    │
        │  • io_stage_results (no PII)       │
        └────────────────────────────────────┘
```

### 3.2 Table Relationships

```
io_audit_sessions (永久,元数据)
    │
    ├──► io_case_profiles (TTL, 包含PII JSON)
    │        │
    │        └──► io_case_pii (TTL, 提取的PII字段)
    │
    ├──► io_stage_results (永久, Agent输出无PII)
    │
    ├──► io_citations (永久, 法律引用)
    │
    ├──► io_documents (TTL, 文档元数据)
    │
    ├──► io_reports (混合: 真实报告TTL, 脱敏报告永久)
    │
    └──► io_knowledge_base (永久, 脱敏训练数据)
```

---

## 4. Database Schema

### 4.1 New Table: io_case_pii (PII Hot Data)

```sql
-- Stores extracted PII fields for easy sanitization lookup
-- TTL: Configurable via AUDIT_PII_RETENTION_DAYS env var (default: 30)

create table io_case_pii (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  delete_at timestamptz not null,  -- Calculated: now() + retention_days
  
  session_id uuid not null references io_audit_sessions(id) on delete cascade,
  
  -- Sponsor PII
  sponsor_full_name text,
  sponsor_family_name text,
  sponsor_given_name text,
  sponsor_dob date,
  sponsor_passport text,
  sponsor_uci text,
  sponsor_contact jsonb,  -- {email, phone, address: {street, city, province, country, postal}}
  
  -- Applicant PII
  applicant_full_name text,
  applicant_family_name text,
  applicant_given_name text,
  applicant_dob date,
  applicant_passport text,
  applicant_uci text,
  applicant_contact jsonb,
  
  -- Dependents PII (array of names/DOBs)
  dependents_pii jsonb,  -- [{name, dob, passport}, ...]
  
  -- Original document paths in S3 (for TTL cleanup)
  raw_document_paths text[],
  
  -- Ownership
  user_id uuid,
  
  constraint uq_case_pii_session unique (session_id)
);

-- Indexes
create index idx_io_case_pii_session_id on io_case_pii(session_id);
create index idx_io_case_pii_delete_at on io_case_pii(delete_at);
create index idx_io_case_pii_user_id on io_case_pii(user_id);

-- RLS: Users can only access their own PII
alter table io_case_pii enable row level security;

create policy "Users can access own PII"
on io_case_pii for all to authenticated
using (user_id = auth.uid());

create policy "Service role has full access to PII"
on io_case_pii for all to service_role
using (true);
```

### 4.2 New Table: io_knowledge_base (Permanent Training Data)

```sql
-- Stores anonymized audit data for AI training
-- Access: service_role ONLY (Few-Shot via API)

create table io_knowledge_base (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  
  -- References (nullable after PII deletion)
  pii_ref_id uuid,  -- References io_case_pii.id (kept for traceability, not FK)
  session_id uuid references io_audit_sessions(id) on delete set null,
  
  -- Abstract Features (Input for training)
  application_type text not null,  -- spousal, study, work, etc.
  country_code text,  -- ISO 3166-1 alpha-2
  sponsor_country_code text,
  
  -- Ranges (not exact values)
  applicant_age_range text,  -- "20-25", "25-30", "30-35", etc.
  sponsor_age_range text,
  funds_range text,  -- "0-50k", "50k-100k", "100k-200k", etc.
  
  -- Categorical features
  education_level text,  -- high_school, bachelor, master, phd
  relationship_type text,  -- marriage, common_law
  relationship_duration_months int,
  has_children boolean,
  has_previous_refusal boolean,
  
  -- Extended features (flexible JSON)
  profile_features jsonb,
  
  -- Anonymized Outputs (for training)
  audit_report_anonymized text,  -- Full report with PII replaced
  reasoning_chain_anonymized text,  -- Strategist's thinking (anonymized)
  executive_summary_anonymized text,  -- Short summary
  
  -- Structured analysis (no PII)
  risk_factors jsonb,  -- [{category, severity, description}, ...]
  vulnerabilities jsonb,  -- From Strategist output
  strengths jsonb,  -- From Strategist output
  
  -- Results
  verdict text check (verdict in ('GO', 'CAUTION', 'NO-GO')),
  score int check (score >= 0 and score <= 100),
  score_with_mitigation int,
  tier text check (tier in ('guest', 'pro', 'ultra')),
  
  -- Human annotation (optional, for supervised learning)
  actual_outcome text check (actual_outcome in ('approved', 'refused', 'withdrawn', 'unknown')),
  outcome_date date,
  annotator_notes text,
  
  -- Quality flags
  is_verified boolean default false,  -- Human-reviewed
  quality_score numeric(3,2)  -- 0.00-1.00
);

-- Indexes for search and analytics
create index idx_io_kb_application_type on io_knowledge_base(application_type);
create index idx_io_kb_country_code on io_knowledge_base(country_code);
create index idx_io_kb_verdict on io_knowledge_base(verdict);
create index idx_io_kb_score on io_knowledge_base(score);
create index idx_io_kb_created_at on io_knowledge_base(created_at desc);
create index idx_io_kb_session_id on io_knowledge_base(session_id);

-- Composite index for similarity search
create index idx_io_kb_similarity on io_knowledge_base(
  application_type, 
  country_code, 
  applicant_age_range, 
  education_level
);

-- RLS: service_role ONLY (no authenticated user access)
alter table io_knowledge_base enable row level security;

-- Only service_role can read (for Few-Shot API)
create policy "Service role can read knowledge base"
on io_knowledge_base for select to service_role
using (true);

-- Only service_role can write
create policy "Service role can write knowledge base"
on io_knowledge_base for insert to service_role
with check (true);

create policy "Service role can update knowledge base"
on io_knowledge_base for update to service_role
using (true);
```

### 4.3 Modifications to Existing Tables

```sql
-- Add TTL column to io_case_profiles
alter table io_case_profiles 
add column delete_at timestamptz;

-- Update existing rows (optional, for migration)
update io_case_profiles 
set delete_at = created_at + interval '30 days'
where delete_at is null;

-- Add index for TTL cleanup
create index idx_io_case_profiles_delete_at on io_case_profiles(delete_at);

-- Add anonymization fields to io_reports
alter table io_reports 
add column is_anonymized boolean default false,
add column anonymize_level text check (anonymize_level in ('minimal', 'conservative', 'aggressive'));

-- Add index for filtering
create index idx_io_reports_is_anonymized on io_reports(is_anonymized);
```

### 4.4 TTL Cleanup Functions

```sql
-- Configuration table for retention settings
create table if not exists io_config (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamptz default now()
);

-- Insert default retention period
insert into io_config (key, value, description) 
values ('pii_retention_days', '30', 'Number of days to retain PII data before automatic deletion')
on conflict (key) do nothing;

-- Cleanup function
create or replace function cleanup_expired_pii()
returns jsonb
language plpgsql
security definer
as $$
declare
  deleted_pii int := 0;
  deleted_profiles int := 0;
  deleted_documents int := 0;
begin
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
  
  -- Delete expired document metadata (actual S3 files handled separately)
  with deleted as (
    delete from io_documents d
    using io_audit_sessions s
    where d.session_id = s.id
      and s.id in (
        select session_id from io_case_pii where delete_at < now()
      )
    returning d.id
  )
  select count(*) into deleted_documents from deleted;
  
  -- Log the cleanup
  insert into io_audit_log (event_type, event_data)
  values ('pii_cleanup', jsonb_build_object(
    'deleted_pii', deleted_pii,
    'deleted_profiles', deleted_profiles,
    'deleted_documents', deleted_documents,
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

-- Schedule cleanup to run daily at 02:00
-- Note: Requires pg_cron extension
select cron.schedule(
  'cleanup-expired-pii',
  '0 2 * * *',
  'select cleanup_expired_pii()'
);

-- Helper function to update retention period
create or replace function set_pii_retention_days(days int)
returns void
language plpgsql
security definer
as $$
begin
  update io_config 
  set value = days::text, updated_at = now()
  where key = 'pii_retention_days';
end;
$$;

-- Helper function to get current retention period
create or replace function get_pii_retention_days()
returns int
language sql
security definer
as $$
  select value::int from io_config where key = 'pii_retention_days';
$$;
```

---

## 5. PII Categories and Replacement Strategy

### 5.1 PII Detection Patterns

```typescript
// src/audit-core/privacy/patterns.ts

export const PII_PATTERNS = {
  // Passport numbers (international formats)
  passport: /\b[A-Z]{1,2}\d{6,9}\b/gi,
  
  // Email addresses (RFC 5322 simplified)
  email: /[\w.-]+@[\w.-]+\.\w{2,}/gi,
  
  // Phone numbers (international)
  phone: /\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
  
  // Dates (various formats)
  dateYMD: /\b\d{4}[-/]\d{2}[-/]\d{2}\b/g,  // 2023-05-15
  dateDMY: /\b\d{2}[-/]\d{2}[-/]\d{4}\b/g,  // 15/05/2023
  
  // UCI (Unique Client Identifier)
  uci: /\b\d{4}[-\s]?\d{4}\b/g,
  
  // Street addresses (partial)
  streetNumber: /\b\d{1,5}\s+[\w\s]+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Crt|Court|Cres|Crescent)\b/gi,
  
  // Postal codes
  postalCodeCA: /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/gi,  // Canadian
  postalCodeUS: /\b\d{5}(-\d{4})?\b/g,  // US ZIP
}
```

### 5.2 Replacement Strategy (Conservative Level)

| PII Type | Detection Method | Replacement | Preserve |
|----------|------------------|-------------|----------|
| **Sponsor Name** | From CasePii | `SPONSOR` | - |
| **Applicant Name** | From CasePii | `APPLICANT` | - |
| **Dependent Names** | From CasePii | `DEPENDENT_1`, `DEPENDENT_2` | - |
| **Passport Number** | Regex + CasePii | `PASSPORT_XXX` | - |
| **Email** | Regex | `REDACTED@EMAIL.COM` | - |
| **Phone** | Regex | `+X-XXX-XXX-XXXX` | - |
| **DOB** | CasePii | `YYYY-XX-XX` | Year |
| **Street Address** | Regex | `[Street Redacted]` | - |
| **City** | From CasePii | Keep | ✅ Yes |
| **Province/State** | From CasePii | Keep | ✅ Yes |
| **Country** | From CasePii | Keep | ✅ Yes |
| **Postal Code** | Regex | `XXX XXX` | - |
| **UCI** | Regex + CasePii | `XXXX-XXXX` | - |

### 5.3 Anonymization Levels

```typescript
type AnonymizeLevel = "minimal" | "conservative" | "aggressive"

const LEVEL_CONFIG: Record<AnonymizeLevel, LevelConfig> = {
  minimal: {
    // Only replace direct identifiers
    replace: ["names", "passport", "uci"],
    redactDates: false,
    redactContact: false,
    redactAddress: false,
  },
  
  conservative: {  // DEFAULT - Recommended
    // Replace identifiers + contact, keep geographic context
    replace: ["names", "passport", "uci", "email", "phone", "streetAddress", "postalCode"],
    redactDates: true,  // YYYY-XX-XX (keep year)
    redactContact: true,
    redactAddress: "street_only",  // Keep city/province/country
  },
  
  aggressive: {
    // Replace everything except country
    replace: ["names", "passport", "uci", "email", "phone", "streetAddress", "postalCode", "city"],
    redactDates: true,
    redactContact: true,
    redactAddress: "full",  // Only keep country
  }
}
```

### 5.4 Feature Extraction for Training

```typescript
// src/audit-core/privacy/extract-features.ts

interface ProfileFeatures {
  application_type: string
  country_code: string
  sponsor_country_code: string
  applicant_age_range: string
  sponsor_age_range: string
  funds_range: string
  education_level: string
  relationship_type: string
  relationship_duration_months: number
  has_children: boolean
  has_previous_refusal: boolean
  profile_features: Record<string, unknown>  // Extended features
}

function calculateAgeRange(dob: string | Date): string {
  const age = calculateAge(dob)
  if (age < 20) return "under_20"
  if (age < 25) return "20-25"
  if (age < 30) return "25-30"
  if (age < 35) return "30-35"
  if (age < 40) return "35-40"
  if (age < 50) return "40-50"
  if (age < 60) return "50-60"
  return "60_plus"
}

function calculateFundsRange(funds: number): string {
  if (funds < 10000) return "0-10k"
  if (funds < 25000) return "10k-25k"
  if (funds < 50000) return "25k-50k"
  if (funds < 100000) return "50k-100k"
  if (funds < 200000) return "100k-200k"
  if (funds < 500000) return "200k-500k"
  return "500k_plus"
}
```

---

## 6. Code Architecture

### 6.1 Directory Structure

```
.claude/skills/core-data-privacy/
├── SKILL.md                    # Rules for Agent understanding
└── references/
    ├── manifest.json
    ├── pii_patterns.json       # Regex patterns
    ├── sanitization_rules.md   # Detailed replacement rules
    └── feature_extraction.md   # How features are abstracted

src/audit-core/privacy/
├── index.ts                    # Public exports
├── types.ts                    # Type definitions
├── patterns.ts                 # PII regex patterns
├── sanitize.ts                 # sanitizeText() implementation
├── extract-features.ts         # extractFeatures() implementation
├── extract-pii.ts              # extractPii() from CaseProfile
└── __tests__/
    ├── sanitize.test.ts
    ├── extract-features.test.ts
    └── extract-pii.test.ts

src/audit-core/persistence/repositories/
├── case-pii.repository.ts      # NEW
└── knowledge-base.repository.ts # NEW
```

### 6.2 Core Functions

```typescript
// src/audit-core/privacy/sanitize.ts

export interface SanitizeOptions {
  pii: CasePii
  level?: AnonymizeLevel
}

export function sanitizeText(text: string, options: SanitizeOptions): string {
  const { pii, level = "conservative" } = options
  let sanitized = text
  
  // 1. Replace names (exact match, case-insensitive)
  if (pii.sponsor_full_name) {
    sanitized = replaceAll(sanitized, pii.sponsor_full_name, 'SPONSOR')
  }
  if (pii.applicant_full_name) {
    sanitized = replaceAll(sanitized, pii.applicant_full_name, 'APPLICANT')
  }
  // Also replace partial names
  if (pii.sponsor_given_name) {
    sanitized = replaceAll(sanitized, pii.sponsor_given_name, 'SPONSOR')
  }
  // ... more name replacements
  
  // 2. Replace passport numbers
  if (pii.applicant_passport) {
    sanitized = replaceAll(sanitized, pii.applicant_passport, 'PASSPORT_XXX')
  }
  sanitized = sanitized.replace(PII_PATTERNS.passport, 'PASSPORT_XXX')
  
  // 3. Level-dependent replacements
  const config = LEVEL_CONFIG[level]
  
  if (config.redactContact) {
    sanitized = sanitized.replace(PII_PATTERNS.email, 'REDACTED@EMAIL.COM')
    sanitized = sanitized.replace(PII_PATTERNS.phone, '+X-XXX-XXX-XXXX')
  }
  
  if (config.redactDates) {
    // Keep year, redact month and day
    sanitized = sanitized.replace(/\b(\d{4})-\d{2}-\d{2}\b/g, '$1-XX-XX')
  }
  
  // 4. Address handling
  if (config.redactAddress === "street_only" || config.redactAddress === "full") {
    sanitized = sanitized.replace(PII_PATTERNS.streetNumber, '[Street Redacted]')
    sanitized = sanitized.replace(PII_PATTERNS.postalCodeCA, 'XXX XXX')
    sanitized = sanitized.replace(PII_PATTERNS.postalCodeUS, 'XXXXX')
  }
  
  if (config.redactAddress === "full" && pii.applicant_contact?.address?.city) {
    sanitized = replaceAll(sanitized, pii.applicant_contact.address.city, 'CITY_X')
  }
  
  // 5. UCI
  sanitized = sanitized.replace(PII_PATTERNS.uci, 'XXXX-XXXX')
  
  return sanitized
}

function replaceAll(text: string, search: string, replacement: string): string {
  return text.replace(new RegExp(escapeRegex(search), 'gi'), replacement)
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
```

```typescript
// src/audit-core/privacy/extract-pii.ts

export function extractPii(profile: CaseProfile): CasePiiInput {
  return {
    // Sponsor
    sponsor_full_name: profile.sponsor?.name,
    sponsor_family_name: profile.sponsor?.family_name,
    sponsor_given_name: profile.sponsor?.given_name,
    sponsor_dob: profile.sponsor?.dob,
    sponsor_passport: profile.sponsor?.passport?.number,
    sponsor_uci: profile.sponsor?.uci,
    sponsor_contact: profile.sponsor?.address ? {
      email: profile.sponsor.email,
      phone: profile.sponsor.phone,
      address: profile.sponsor.address
    } : undefined,
    
    // Applicant
    applicant_full_name: profile.applicant?.name,
    applicant_family_name: profile.applicant?.family_name,
    applicant_given_name: profile.applicant?.given_name,
    applicant_dob: profile.applicant?.dob,
    applicant_passport: profile.applicant?.passport?.number,
    applicant_uci: profile.applicant?.uci,
    applicant_contact: profile.applicant?.address ? {
      email: profile.applicant.email,
      phone: profile.applicant.phone,
      address: profile.applicant.address
    } : undefined,
    
    // Dependents
    dependents_pii: profile.dependents?.map(d => ({
      name: d.name,
      dob: d.dob,
      passport: d.passport?.number
    }))
  }
}
```

### 6.3 Repository Layer

```typescript
// src/audit-core/persistence/repositories/case-pii.repository.ts

export class CasePiiRepository {
  constructor(private client: SupabaseClient) {}
  
  async savePii(sessionId: string, pii: CasePiiInput, userId?: string): Promise<CasePii> {
    const retentionDays = await this.getRetentionDays()
    const deleteAt = new Date()
    deleteAt.setDate(deleteAt.getDate() + retentionDays)
    
    const { data, error } = await this.client
      .from('io_case_pii')
      .upsert({
        session_id: sessionId,
        delete_at: deleteAt.toISOString(),
        user_id: userId,
        ...pii
      }, { onConflict: 'session_id' })
      .select()
      .single()
    
    if (error) throw new PersistenceError('Failed to save PII', error)
    return data
  }
  
  async getPii(sessionId: string): Promise<CasePii | null> {
    const { data, error } = await this.client
      .from('io_case_pii')
      .select('*')
      .eq('session_id', sessionId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw new PersistenceError('Failed to get PII', error)
    return data
  }
  
  async deletePii(sessionId: string): Promise<void> {
    const { error } = await this.client
      .from('io_case_pii')
      .delete()
      .eq('session_id', sessionId)
    
    if (error) throw new PersistenceError('Failed to delete PII', error)
  }
  
  private async getRetentionDays(): Promise<number> {
    // Check env var first, then config table, then default
    const envDays = process.env.AUDIT_PII_RETENTION_DAYS
    if (envDays) return parseInt(envDays, 10)
    
    const { data } = await this.client
      .from('io_config')
      .select('value')
      .eq('key', 'pii_retention_days')
      .single()
    
    return data?.value ? parseInt(data.value, 10) : 30
  }
}
```

```typescript
// src/audit-core/persistence/repositories/knowledge-base.repository.ts

export class KnowledgeBaseRepository {
  constructor(private client: SupabaseClient) {}
  
  async saveKnowledge(data: KnowledgeInput): Promise<Knowledge> {
    const { data: result, error } = await this.client
      .from('io_knowledge_base')
      .insert(data)
      .select()
      .single()
    
    if (error) throw new PersistenceError('Failed to save knowledge', error)
    return result
  }
  
  async findSimilarCases(criteria: SimilaritySearchCriteria, limit = 5): Promise<Knowledge[]> {
    let query = this.client
      .from('io_knowledge_base')
      .select('*')
    
    if (criteria.application_type) {
      query = query.eq('application_type', criteria.application_type)
    }
    if (criteria.country_code) {
      query = query.eq('country_code', criteria.country_code)
    }
    if (criteria.applicant_age_range) {
      query = query.eq('applicant_age_range', criteria.applicant_age_range)
    }
    if (criteria.education_level) {
      query = query.eq('education_level', criteria.education_level)
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw new PersistenceError('Failed to search knowledge base', error)
    return data || []
  }
  
  async getStatistics(): Promise<KnowledgeStats> {
    const { data, error } = await this.client
      .rpc('get_knowledge_stats')
    
    if (error) throw new PersistenceError('Failed to get stats', error)
    return data
  }
}
```

### 6.4 Reporter Integration

```typescript
// src/audit-core/agents/reporter.ts (modification sketch)

interface ReporterConfig {
  sessionId: string
  auditJudgment: AuditJudgment
  tier: Tier
  outputPath: string
  anonymize?: boolean | "dual"  // Default: "dual"
  anonymizeLevel?: AnonymizeLevel  // Default: "conservative"
}

async function generateReport(config: ReporterConfig): Promise<ReportOutput> {
  const {
    sessionId,
    auditJudgment,
    tier,
    outputPath,
    anonymize = "dual",
    anonymizeLevel = "conservative"
  } = config
  
  const persistence = getAuditPersistence()
  
  // 1. Extract and save PII
  const pii = extractPii(auditJudgment.caseProfile)
  await persistence.casePii.savePii(sessionId, pii)
  
  // 2. Generate real report
  const realReportContent = synthesizeReport(auditJudgment, tier)
  
  // 3. Save real report
  const realPdfPath = `${sessionId}/reports/v1/report.pdf`
  await persistence.storage.upload(realPdfPath, await generatePdf(realReportContent))
  await persistence.reports.save({
    session_id: sessionId,
    version: 1,
    is_final: true,
    is_anonymized: false,
    verdict: auditJudgment.verdict,
    score: auditJudgment.score,
    pdf_path: realPdfPath,
    tier
  })
  
  // Also save to local filesystem for immediate access
  await writeFile(`${outputPath}/report.pdf`, await generatePdf(realReportContent))
  await writeFile(`${outputPath}/report.md`, realReportContent)
  
  let demoReportPath: string | undefined
  
  // 4. Generate anonymized version if requested
  if (anonymize === true || anonymize === "dual") {
    // 4.1 Extract features
    const features = extractFeatures(auditJudgment.caseProfile)
    
    // 4.2 Sanitize report text
    const demoReportContent = sanitizeText(realReportContent, { pii, level: anonymizeLevel })
    
    // 4.3 Sanitize reasoning chain (from Strategist)
    const reasoningChain = auditJudgment.agentOutputs?.strategist?.reasoning || ''
    const sanitizedReasoning = sanitizeText(reasoningChain, { pii, level: anonymizeLevel })
    
    // 4.4 Save to Knowledge Base
    await persistence.knowledgeBase.saveKnowledge({
      pii_ref_id: pii.id,
      session_id: sessionId,
      ...features,
      audit_report_anonymized: demoReportContent,
      reasoning_chain_anonymized: sanitizedReasoning,
      executive_summary_anonymized: sanitizeText(
        auditJudgment.summary || '',
        { pii, level: anonymizeLevel }
      ),
      risk_factors: auditJudgment.agentOutputs?.strategist?.risk_factors,
      vulnerabilities: auditJudgment.agentOutputs?.strategist?.vulnerabilities,
      strengths: auditJudgment.agentOutputs?.strategist?.strengths,
      verdict: auditJudgment.verdict,
      score: auditJudgment.score,
      score_with_mitigation: auditJudgment.scoreWithMitigation,
      tier
    })
    
    // 4.5 Save demo report
    const demoPdfPath = `${sessionId}/reports/v1/report_demo.pdf`
    await persistence.storage.upload(demoPdfPath, await generatePdf(demoReportContent))
    await persistence.reports.save({
      session_id: sessionId,
      version: 1,
      is_final: true,
      is_anonymized: true,
      anonymize_level: anonymizeLevel,
      verdict: auditJudgment.verdict,
      score: auditJudgment.score,
      pdf_path: demoPdfPath,
      tier
    })
    
    // Local filesystem
    await writeFile(`${outputPath}/report_demo.pdf`, await generatePdf(demoReportContent))
    await writeFile(`${outputPath}/report_demo.md`, demoReportContent)
    
    demoReportPath = `${outputPath}/report_demo.pdf`
  }
  
  return {
    realReport: `${outputPath}/report.pdf`,
    demoReport: demoReportPath
  }
}
```

---

## 7. CLI Integration

### 7.1 Command Parameters

```bash
# Default: dual output (both real and demo)
/audit <case-dir> --tier ultra --app spousal

# Explicit dual output
/audit <case-dir> --tier ultra --app spousal --anonymize=dual

# Real report only (no demo)
/audit <case-dir> --tier ultra --app spousal --anonymize=false

# Demo report only (no real)
/audit <case-dir> --tier ultra --app spousal --anonymize=true

# With specific anonymization level
/audit <case-dir> --tier ultra --app spousal --anonymize-level=aggressive
```

### 7.2 Environment Variables

```bash
# .env additions

# PII retention period in days (default: 30)
AUDIT_PII_RETENTION_DAYS=30

# Default anonymization behavior (dual | true | false)
AUDIT_DEFAULT_ANONYMIZE=dual

# Default anonymization level (minimal | conservative | aggressive)
AUDIT_DEFAULT_ANONYMIZE_LEVEL=conservative
```

---

## 8. Skill Definition

### 8.1 SKILL.md

```yaml
---
name: core-data-privacy
description: |
  Data desensitization and privacy protection for immigration audit reports.
  Provides PII detection, text sanitization, and feature extraction.
  
  Use when:
  - Generating anonymized reports for demos
  - Extracting training data for AI
  - Implementing data retention policies
  
  Triggers: "anonymize", "desensitize", "demo report", "training data", "privacy"
---
```

```markdown
# Core Data Privacy Skill

## Purpose

Protect client Personally Identifiable Information (PII) while preserving 
analytical value for AI training and demo presentations.

## Capabilities

1. **PII Extraction** - Extract PII fields from CaseProfile
2. **Text Sanitization** - Replace PII with safe placeholders
3. **Feature Extraction** - Convert PII to abstract features for training
4. **Dual Output** - Generate both real and anonymized reports

## Usage in Reporter

When generating reports, the Reporter agent:

1. Extracts PII fields → saves to `io_case_pii` (TTL: 30 days)
2. Generates real report → saves to S3 + `io_reports`
3. If anonymize enabled:
   - Extracts abstract features (age_range, funds_range, etc.)
   - Sanitizes report text (replaces names, passports, etc.)
   - Saves to `io_knowledge_base` (permanent)
   - Generates demo report → saves to S3 + `io_reports`

## Anonymization Levels

| Level | What's Replaced | What's Kept |
|-------|-----------------|-------------|
| **minimal** | Names, Passport, UCI | Dates, Contact, Address |
| **conservative** (default) | Names, Passport, UCI, Email, Phone, Street | Year, City, Province, Country |
| **aggressive** | All above + City | Only Province, Country |

## PII Replacement Table

| PII Type | Replacement |
|----------|-------------|
| Sponsor Name | `SPONSOR` |
| Applicant Name | `APPLICANT` |
| Dependent Names | `DEPENDENT_1`, `DEPENDENT_2`, ... |
| Passport | `PASSPORT_XXX` |
| Email | `REDACTED@EMAIL.COM` |
| Phone | `+X-XXX-XXX-XXXX` |
| DOB | `YYYY-XX-XX` (year kept) |
| Street Address | `[Street Redacted]` |
| Postal Code | `XXX XXX` |
| UCI | `XXXX-XXXX` |

## Data Retention

- **Real Data (PII)**: Configurable TTL, default 30 days
- **Anonymized Data**: Permanent (for AI training)
- **Cleanup**: Automatic via pg_cron daily at 02:00

## References

See `references/` for detailed patterns and rules.
```

---

## 9. Implementation Checklist

### Phase 1: Database Schema (Day 1)

- [ ] Create migration file: `supabase/migrations/20260127000000_add_privacy_tables.sql`
  - [ ] Create `io_config` table
  - [ ] Create `io_case_pii` table with TTL
  - [ ] Create `io_knowledge_base` table
  - [ ] Alter `io_case_profiles` add `delete_at`
  - [ ] Alter `io_reports` add `is_anonymized`, `anonymize_level`
  - [ ] Create `cleanup_expired_pii()` function
  - [ ] Schedule pg_cron job
  
- [ ] Execute migration in Supabase Studio
- [ ] Verify tables and RLS policies

### Phase 2: Repository Layer (Day 2)

- [ ] Create `src/audit-core/persistence/repositories/case-pii.repository.ts`
  - [ ] `savePii()`
  - [ ] `getPii()`
  - [ ] `deletePii()`
  - [ ] `getRetentionDays()`
  
- [ ] Create `src/audit-core/persistence/repositories/knowledge-base.repository.ts`
  - [ ] `saveKnowledge()`
  - [ ] `findSimilarCases()`
  - [ ] `getStatistics()`
  
- [ ] Update `src/audit-core/persistence/index.ts` exports
- [ ] Write unit tests

### Phase 3: Privacy Functions (Day 3)

- [ ] Create `src/audit-core/privacy/` directory
- [ ] Implement `types.ts`
- [ ] Implement `patterns.ts`
- [ ] Implement `sanitize.ts` with TDD
- [ ] Implement `extract-features.ts` with TDD
- [ ] Implement `extract-pii.ts` with TDD
- [ ] Create `index.ts` exports
- [ ] Write comprehensive tests

### Phase 4: Skill Creation (Day 4)

- [ ] Create `.claude/skills/core-data-privacy/SKILL.md`
- [ ] Create `references/manifest.json`
- [ ] Create `references/pii_patterns.json`
- [ ] Create `references/sanitization_rules.md`
- [ ] Create `references/feature_extraction.md`

### Phase 5: Reporter Integration (Day 5)

- [ ] Modify `src/audit-core/agents/reporter.ts`
  - [ ] Add `anonymize` parameter
  - [ ] Add `anonymizeLevel` parameter
  - [ ] Integrate PII extraction
  - [ ] Integrate sanitization
  - [ ] Implement dual output
  - [ ] Save to Knowledge Base
  
- [ ] Update CLI parameter parsing
- [ ] Add environment variable support

### Phase 6: Verification (Day 6)

- [ ] End-to-end test with sample case
- [ ] Verify TTL cleanup (manual trigger)
- [ ] Verify Knowledge Base queries
- [ ] Verify demo report quality
- [ ] Update documentation
- [ ] Update AGENTS.md knowledge index

---

## 10. Environment Configuration

### Required Environment Variables

```bash
# Existing (from Supabase migration)
SUPABASE_URL=http://192.168.1.98:8002
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# New for Privacy
AUDIT_PII_RETENTION_DAYS=30              # Default: 30
AUDIT_DEFAULT_ANONYMIZE=dual             # Default: dual (true|false|dual)
AUDIT_DEFAULT_ANONYMIZE_LEVEL=conservative  # Default: conservative
```

---

## 11. Testing Strategy

### Unit Tests

```typescript
// src/audit-core/privacy/__tests__/sanitize.test.ts

describe("sanitizeText", () => {
  const mockPii: CasePii = {
    sponsor_full_name: "Zhang Wei",
    sponsor_given_name: "Wei",
    applicant_full_name: "Wang Fang",
    applicant_passport: "G12345678",
    applicant_dob: "1990-05-15",
    // ...
  }
  
  test("replaces sponsor full name", () => {
    const text = "Sponsor Zhang Wei submitted the application."
    const result = sanitizeText(text, { pii: mockPii })
    expect(result).toBe("Sponsor SPONSOR submitted the application.")
    expect(result).not.toContain("Zhang Wei")
  })
  
  test("replaces passport number", () => {
    const text = "Passport: G12345678"
    const result = sanitizeText(text, { pii: mockPii })
    expect(result).toBe("Passport: PASSPORT_XXX")
  })
  
  test("redacts dates but keeps year in conservative mode", () => {
    const text = "DOB: 1990-05-15"
    const result = sanitizeText(text, { pii: mockPii, level: "conservative" })
    expect(result).toBe("DOB: 1990-XX-XX")
  })
  
  test("keeps city in conservative mode", () => {
    const text = "Lives in Toronto, Ontario, Canada"
    const result = sanitizeText(text, { pii: mockPii, level: "conservative" })
    expect(result).toContain("Toronto")
    expect(result).toContain("Ontario")
    expect(result).toContain("Canada")
  })
  
  test("redacts city in aggressive mode", () => {
    const mockPiiWithCity = {
      ...mockPii,
      applicant_contact: { address: { city: "Toronto" } }
    }
    const text = "Lives in Toronto, Ontario, Canada"
    const result = sanitizeText(text, { pii: mockPiiWithCity, level: "aggressive" })
    expect(result).toContain("CITY_X")
    expect(result).toContain("Ontario")
  })
})
```

### Integration Tests

```typescript
// src/audit-core/privacy/__tests__/integration.test.ts

describe("Privacy Integration", () => {
  test("full pipeline: extract → sanitize → save", async () => {
    const caseProfile = createMockCaseProfile()
    
    // Extract PII
    const pii = extractPii(caseProfile)
    expect(pii.sponsor_full_name).toBe(caseProfile.sponsor.name)
    
    // Sanitize text
    const report = "Sponsor Zhang Wei is sponsoring Wang Fang."
    const sanitized = sanitizeText(report, { pii })
    expect(sanitized).toBe("Sponsor SPONSOR is sponsoring APPLICANT.")
    
    // Extract features
    const features = extractFeatures(caseProfile)
    expect(features.application_type).toBe("spousal")
    expect(features.applicant_age_range).toMatch(/\d+-\d+/)
  })
})
```

---

## 12. Related Documents

| Document | Purpose |
|----------|---------|
| `docs/system/data-privacy-architecture.md` | Original design (pseudocode) |
| `.opencode/.plans/supabase-persistence-migration.md` | Prerequisite migration plan |
| `src/audit-core/types/case-profile.ts` | PII field definitions |
| `.claude/skills/core-reporter/` | Report formatting rules |

---

## Appendix: Quick Reference

### Output Files After Audit

```
cases/{caseSlot}/
├── report.pdf          # Real client data (for delivery)
├── report.md           # Markdown source (real)
├── report_demo.pdf     # Anonymized (for demo/sharing)
└── report_demo.md      # Markdown source (anonymized)

S3: audit-documents/{sessionId}/
├── source/             # Original uploaded files (TTL)
├── reports/v1/
│   ├── report.pdf      # Real (TTL)
│   └── report_demo.pdf # Anonymized (permanent)
└── agent-outputs/      # Stage results (permanent, no PII)
```

### Database Tables Summary

| Table | TTL | Contains PII | Purpose |
|-------|-----|--------------|---------|
| `io_audit_sessions` | Permanent | No | Session metadata |
| `io_case_profiles` | 30 days | Yes (JSON) | Full CaseProfile |
| `io_case_pii` | 30 days | Yes (fields) | Extracted PII for sanitization |
| `io_stage_results` | Permanent | No | Agent outputs |
| `io_citations` | Permanent | No | Legal references |
| `io_documents` | 30 days | Yes (paths) | Document metadata |
| `io_reports` | Mixed | No | Report metadata |
| `io_knowledge_base` | Permanent | No | Anonymized training data |
| `io_audit_log` | Permanent | No | Audit trail |
| `io_config` | Permanent | No | System configuration |

### Commands

```bash
# Standard audit (dual output by default)
/audit <case-dir> --tier ultra --app spousal

# Real report only
/audit <case-dir> --anonymize=false

# Demo report only
/audit <case-dir> --anonymize=true

# With aggressive anonymization
/audit <case-dir> --anonymize-level=aggressive

# Set retention period (days)
AUDIT_PII_RETENTION_DAYS=60 /audit <case-dir>
```

### PII Replacement Quick Reference

| Original | Replacement |
|----------|-------------|
| Zhang Wei | SPONSOR |
| Wang Fang | APPLICANT |
| G12345678 | PASSPORT_XXX |
| 1990-05-15 | 1990-XX-XX |
| zhang@email.com | REDACTED@EMAIL.COM |
| +1-416-555-1234 | +X-XXX-XXX-XXXX |
| 123 Main St | [Street Redacted] |
| M5V 2T6 | XXX XXX |
| 1234-5678 (UCI) | XXXX-XXXX |
