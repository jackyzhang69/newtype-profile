# Category-Specific Search Strategies for Work Permits

## Overview

This document extends the issue_codes.md and search_strategies.md with category-specific search logic for six work permit categories: PGWP, LMIA, IMP, ICT, Open Work Permit, and PNP.

## Detection Logic: Determining Work Permit Category

Before searching, the Detective agent must identify which category applies:

```
IF graduation certificate AND DLI institution
  → PGWP

ELSE IF LMIA document present
  → LMIA

ELSE IF IMP authorization letter
  → IMP

ELSE IF Intra-company transfer + corporate documentation
  → ICT

ELSE IF spouse of work permit holder OR refugee status OR caregiver authorization
  → Open Work Permit

ELSE IF provincial nomination letter
  → PNP

ELSE
  → Requires initial investigation to categorize
```

## Category-Specific Issue Codes

### PGWP Category (Post-Graduation Work Permit)

**Primary Issue Codes**:
- `WORK_PGWP_DLI_STATUS`: Institution not on DLI list at graduation
- `WORK_PGWP_FAKE_GRADUATION`: Graduation not verified by institution
- `WORK_PGWP_INELIGIBLE_PROGRAM`: Program type not eligible (ESL, part-time)
- `WORK_PGWP_PROGRAM_DURATION`: Program < 8 months or insufficient credits
- `WORK_PGWP_GRADUATION_TIMING`: Application > 180 days post-graduation
- `WORK_PGWP_STATUS_LAPSE`: Study permit expired before graduation
- `WORK_PGWP_WORK_VIOLATION`: Unauthorized work during study

**Detective Search Strategy**:
```javascript
if (category === 'PGWP') {
  queries = [
    "kg_search(issue_code='WORK_PGWP_DLI_STATUS', court='FC')",
    "kg_search(issue_code='WORK_PGWP_GRADUATION_TIMING', court='FC')",
    "caselaw_topic('DLI verification', 'graduation fraud')",
    "operation_manual('PGWP eligibility', 'R205 requirements')"
  ];
}
```

**Strategist Search Strategy**:
```javascript
if (category === 'PGWP') {
  // Focus on defending:
  // 1. DLI status at graduation time (not current)
  // 2. Program duration calculation methods
  // 3. 180-day application timeline rationale

  queries = [
    "kg_top_authorities(issue_code='WORK_PGWP_DLI_STATUS', court='FC')",
    "caselaw_citation('DLI database lookup timing', 'historical status')",
    "help_centre('PGWP program duration calculator')"
  ];
}
```

---

### LMIA Category (Labour Market Opinion)

**Primary Issue Codes**:
- `WORK_LMIA_NOT_OBTAINED`: No LMIA provided
- `WORK_LMIA_NEGATIVE`: LMIA negative assessment
- `WORK_LMIA_EXPIRED`: LMIA past validity date
- `WORK_LMIA_MISMATCH_EMPLOYER`: LMIA issued to different employer
- `WORK_LMIA_MISMATCH_POSITION`: Job duties differ from LMIA
- `WORK_LMIA_WAGE_ISSUE`: Wage below LMIA or prevailing rate
- `WORK_LMIA_RECRUITMENT_INADEQUATE`: Canadian recruitment insufficient
- `WORK_LMIA_CANADIAN_DISPLACEMENT`: Evidence of worker displacement

**Detective Search Strategy**:
```javascript
if (category === 'LMIA') {
  queries = [
    "kg_search(issue_code='WORK_L_NOT_OBTAINED', court='FC')",
    "kg_search(issue_code='WORK_E_LEGITIMACY', court='FC')",
    "kg_search(issue_code='WORK_A_CREDENTIALS_INSUFFICIENT', court='FC')",
    "operation_manual('Labour market assessment', 'ESDC verification')",
    "caselaw_topic('genuine employment', 'LMIA compliance')"
  ];
}
```

**Strategist Search Strategy**:
```javascript
if (category === 'LMIA') {
  // Defend against:
  // 1. Wage adequacy - show market comparison
  // 2. Recruitment sufficiency - show effort
  // 3. Canadian worker displacement - show genuine need
  // 4. Position genuineness - show actual role

  queries = [
    "kg_top_authorities(issue_code='WORK_L_WAGE_DISCREPANCY', court='FC')",
    "kg_top_authorities(issue_code='WORK_E_GENUINE_POSITION', court='FC')",
    "caselaw_citation('Canadian labour market assessment', 'skills gap')",
    "operation_manual('Prevailing wage determination', 'wage standards')"
  ];
}
```

---

### IMP Category (International Mobility Program)

**Primary Issue Codes**:
- `WORK_IMP_AUTHORIZATION_INVALID`: Employer not authorized for IMP
- `WORK_IMP_CATEGORY_MISMATCH`: Applicant doesn't qualify for category
- `WORK_IMP_SIGNIFICANT_BENEFIT_ABSENT`: No benefit to Canada demonstrated
- `WORK_IMP_TRADE_AGREEMENT_INVALID`: Professional not from designated country
- `WORK_IMP_ICT_REQUIREMENTS_UNMET`: ICT requirements not satisfied
- `WORK_IMP_RELIGIOUS_WORKER_INVALID`: Position not ministerial/religious
- `WORK_IMP_POSITION_NOT_SPECIALIZED`: Work not specialized enough

**Detective Search Strategy**:
```javascript
if (category === 'IMP') {
  const subtype = determineIMPSubtype(case_documents);

  if (subtype === 'significant_benefits') {
    queries = [
      "kg_search(issue_code='WORK_IMP_SIGNIFICANT_BENEFIT_ABSENT', court='FC')",
      "caselaw_topic('economic benefit assessment', 'Canada advantage')"
    ];
  } else if (subtype === 'intra_company') {
    queries = [
      "kg_search(issue_code='WORK_ICT_CORPORATE_RELATIONSHIP', court='FC')",
      "caselaw_topic('corporate group verification', 'ownership structure')"
    ];
  } else if (subtype === 'trade_agreement') {
    queries = [
      "kg_search(issue_code='WORK_IMP_TRADE_AGREEMENT_INVALID', court='FC')",
      "operation_manual('Trade agreement professionals', 'country designations')"
    ];
  }
}
```

**Strategist Search Strategy**:
```javascript
if (category === 'IMP') {
  const subtype = determineIMPSubtype(case_documents);

  // For each subtype, search for successful defenses
  queries = [
    `kg_top_authorities(issue_code='WORK_IMP_${subtype.toUpperCase()}', court='FC')`,
    "caselaw_citation('IMP discretion', 'significant benefit standard')",
    "operation_manual('IMP assessment criteria', 'category-specific requirements')"
  ];
}
```

---

### ICT Category (Intra-Company Transfer)

**Primary Issue Codes**:
- `WORK_ICT_CORPORATE_RELATIONSHIP`: Corporate group relationship not proven
- `WORK_ICT_EMPLOYMENT_NOT_CONTINUOUS`: Employment <12 months or interrupted
- `WORK_ICT_POSITION_NOT_MANAGERIAL_SPECIALIST`: Position not qualified
- `WORK_ICT_KNOWLEDGE_NOT_SPECIALIZED`: Specialized knowledge claim invalid
- `WORK_ICT_CANADIAN_ENTITY_SUSPECT`: Canadian entity legitimacy questioned
- `WORK_ICT_INTERNATIONAL_POSITION_UNVERIFIED`: International position cannot be verified
- `WORK_ICT_INTENT_CONCERN`: Evidence of permanent settlement intent

**Detective Search Strategy**:
```javascript
if (category === 'ICT') {
  queries = [
    "kg_search(issue_code='WORK_ICT_CORPORATE_RELATIONSHIP', court='FC')",
    "kg_search(issue_code='WORK_ICT_EMPLOYMENT_NOT_CONTINUOUS', court='FC')",
    "caselaw_topic('intra-company transfer', 'corporate structure verification')",
    "operation_manual('ICT requirements', '12-month continuous employment')"
  ];
}
```

**Strategist Search Strategy**:
```javascript
if (category === 'ICT') {
  // Defend against:
  // 1. Corporate relationship - provide ownership docs
  // 2. Continuous employment - show unbroken service
  // 3. Specialized knowledge - demonstrate employer-specific expertise
  // 4. Managerial role - show supervisory responsibility

  queries = [
    "kg_top_authorities(issue_code='WORK_ICT_CORPORATE_RELATIONSHIP', court='FC')",
    "kg_top_authorities(issue_code='WORK_ICT_KNOWLEDGE_NOT_SPECIALIZED', court='FC')",
    "caselaw_citation('multinational enterprise', 'corporate integration')",
    "operation_manual('Specialized knowledge assessment', 'proprietary expertise')"
  ];
}
```

---

### Open Work Permit Category

**Spouse/Common-Law Variant Issue Codes**:
- `WORK_OPEN_MARRIAGE_OF_CONVENIENCE`: Fraudulent marriage detected
- `WORK_OPEN_PRINCIPAL_INELIGIBLE`: Principal applicant ineligible
- `WORK_OPEN_RELATIONSHIP_NOT_GENUINE`: Relationship authenticity questioned
- `WORK_OPEN_COMMON_LAW_INVALID`: Common-law requirements not met

**Refugee/Protected Person Variant Issue Codes**:
- `WORK_OPEN_REFUGEE_STATUS_FRAUDULENT`: Refugee claim fraudulent
- `WORK_OPEN_REFUGEE_STATUS_LAPSED`: Refugee status no longer valid
- `WORK_OPEN_PROTECTED_PERSON_INVALID`: Protected person status invalid

**Caregiver Variant Issue Codes**:
- `WORK_OPEN_CAREGIVER_NOT_AUTHORIZED`: Employment not authorized caregiver role
- `WORK_OPEN_CAREGIVER_EXPLOITATION`: Workplace exploitation concerns

**Detective Search Strategy**:
```javascript
if (category === 'OPEN_WORK_PERMIT') {
  const variant = determineOpenVariant(case_documents);

  if (variant === 'spouse') {
    queries = [
      "kg_search(issue_code='WORK_OPEN_MARRIAGE_OF_CONVENIENCE', court='FC')",
      "kg_search(issue_code='WORK_OPEN_PRINCIPAL_INELIGIBLE', court='FC')",
      "caselaw_topic('marriage authenticity', 'conjugal relationship')"
    ];
  } else if (variant === 'refugee') {
    queries = [
      "kg_search(issue_code='WORK_OPEN_REFUGEE_STATUS_FRAUDULENT', court='FC')",
      "operation_manual('Refugee status verification')"
    ];
  } else if (variant === 'caregiver') {
    queries = [
      "kg_search(issue_code='WORK_OPEN_CAREGIVER_EXPLOITATION', court='FC')",
      "operation_manual('Caregiver program standards')"
    ];
  }
}
```

**Strategist Search Strategy**:
```javascript
if (category === 'OPEN_WORK_PERMIT' && variant === 'spouse') {
  // Defend genuine marriage:
  // 1. Show cohabitation history
  // 2. Demonstrate financial interdependence
  // 3. Provide witness testimony
  // 4. Show couple photos/travel

  queries = [
    "kg_top_authorities(issue_code='WORK_OPEN_MARRIAGE_OF_CONVENIENCE', court='FC')",
    "caselaw_citation('conjugal relationship', 'common-law partnership')",
    "caselaw_citation('marriage of convenience', 'spousal credibility')"
  ];
}
```

---

### PNP Category (Provincial Nominee Program)

**Primary Issue Codes**:
- `WORK_PNP_NOMINATION_INVALID_EXPIRED`: Provincial nomination not valid
- `WORK_PNP_OCCUPATION_INELIGIBLE`: Occupation not on provincial list
- `WORK_PNP_EMPLOYER_NOT_AUTHORIZED`: Employer not authorized in province
- `WORK_PNP_PROVINCIAL_MISMATCH`: Work location not in nominated province
- `WORK_PNP_WORK_EXPERIENCE_INSUFFICIENT`: Experience below requirement
- `WORK_PNP_EDUCATION_NOT_RECOGNIZED`: Credential not recognized
- `WORK_PNP_WAGE_INADEQUATE`: Wage below provincial minimum
- `WORK_PNP_NOMINATION_FRAUDULENT`: Nomination obtained through fraud

**Detective Search Strategy**:
```javascript
if (category === 'PNP') {
  const province = extractNominatingProvince(case_documents);

  queries = [
    "kg_search(issue_code='WORK_PNP_NOMINATION_INVALID_EXPIRED', court='FC')",
    "kg_search(issue_code='WORK_PNP_OCCUPATION_INELIGIBLE', court='FC')",
    `operation_manual('${province} PNP requirements', 'program streams')`,
    "operation_manual('Provincial nominee assessment', 'IRCC verification')"
  ];
}
```

**Strategist Search Strategy**:
```javascript
if (category === 'PNP') {
  // Defend against:
  // 1. Nomination validity - confirm with province
  // 2. Occupational eligibility - prove occupation match
  // 3. Employer authorization - show active status
  // 4. Experience - document years worked

  queries = [
    "kg_top_authorities(issue_code='WORK_PNP_OCCUPATION_INELIGIBLE', court='FC')",
    "kg_top_authorities(issue_code='WORK_PNP_WORK_EXPERIENCE_INSUFFICIENT', court='FC')",
    `operation_manual('${province} provincial requirements')`,
    "caselaw_citation('provincial nominee legitimacy', 'nomination assessment')"
  ];
}
```

---

## Search Strategy by Agent Type

### Detective Agent Workflow

1. **Categorize the case** (using detection logic above)
2. **Search category-specific issue codes** (critical path issues first)
3. **Search general work permit issues** (employer legitimacy, applicant credentials)
4. **Search settlement intent issues** (for any work permit type)
5. **Search admissibility issues** (separate concern but critical)

**Sample Detective Search Sequence for LMIA**:
```javascript
// Step 1: Categorize
category = 'LMIA';

// Step 2: Category-specific critical issues
kg_search(issue_code='WORK_LMIA_NOT_OBTAINED', court='FC');
kg_search(issue_code='WORK_LMIA_MISMATCH_POSITION', court='FC');

// Step 3: Employer legitimacy
kg_search(issue_code='WORK_E_LEGITIMACY', court='FC');
kg_search(issue_code='WORK_E_FRAUD_HISTORY', court='FC');

// Step 4: Applicant capability
kg_search(issue_code='WORK_A_CREDENTIALS_INSUFFICIENT', court='FC');

// Step 5: Intent assessment
kg_search(issue_code='WORK_I_SETTLE', court='FC');

// Step 6: Admissibility
kg_search(issue_code='WORK_AD_CRIMINAL_RECORD', court='FC');
```

### Strategist Agent Workflow

1. **Identify key risks** for the category
2. **Search for successful defense precedents**
3. **Find evidence that rebuts key concerns**
4. **Build mitigation strategy** around top authorities

**Sample Strategist Defense Strategy for ICT**:
```javascript
// Key risks identified:
// 1. Corporate relationship unclear
// 2. Specialized knowledge not proven
// 3. Managerial role ambiguous

// Search for top authorities defending each:
kg_top_authorities(issue_code='WORK_ICT_CORPORATE_RELATIONSHIP', limit=5);
kg_top_authorities(issue_code='WORK_ICT_KNOWLEDGE_NOT_SPECIALIZED', limit=5);

// Find cases where corporate integration was successfully defended
caselaw_topic('corporate group structure', 'ownership documentation');

// Find cases where specialized knowledge was accepted
caselaw_topic('employer-specific expertise', 'knowledge transfer');
```

---

## Operation Manual References by Category

| Category | Key Operation Manual Sections |
|----------|-------------------------------|
| PGWP | IP 16.2.1-16.2.5 (DLI, duration, timing, assessment) |
| LMIA | IP 16.3.1-16.3.6 (LMIA, employer, wage, recruitment) |
| IMP | IP 16.4.1-16.4.6 (categories, significant benefits, ICT, professional) |
| ICT | IP 16.4.3 (corporate relationship, employment, role) |
| Open | IP 16.5.1-16.5.4 (spouse, refugee, caregiver, assessment) |
| PNP | IP 16.6.1-16.6.6 (nomination, occupation, experience, assessment) |

---

## See Also

- issue_codes.md - Complete issue code reference
- search_strategies.md - General search methodology
- PGWP.md, LMIA.md, IMP.md, ICT.md, open-work-permit.md, PNP-work-permit.md - Category-specific audit rules
