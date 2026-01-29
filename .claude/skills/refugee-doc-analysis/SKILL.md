---
name: refugee-doc-analysis
description: Document extraction and summarization for refugee protection claim evidence
category: audit
app_type: refugee
version: 1.0.0
---

# Refugee Document Analysis

Document extraction and analysis rules for refugee protection claim evidence.

## Primary Forms

### Basis of Claim (BOC) Form - RPD.02.01

**Issuer**: Immigration and Refugee Board (IRB)
**Purpose**: Primary form detailing persecution fear and supporting narrative
**Critical sections**:
- Personal particulars (identity establishment)
- Narrative of persecution (central to credibility)
- Evidence list (supporting documentation)
- Declaration (claimant's signature)

**Extraction priority**: CRITICAL
- Full narrative text
- All dates mentioned
- Named individuals and organizations
- Geographic locations
- Claimed Convention ground

### Use of Representative - IMM 5476

**Issuer**: IRCC
**Purpose**: Authorization for representative
**Extract**: Representative details, authorization scope

## Supporting Documents Categories

### Identity Documents (CRITICAL)

| Document Type | Extraction Focus | Weight |
|---------------|-----------------|--------|
| Passport | All pages, stamps, visas | HIGH |
| National ID | Photo, details, validity | HIGH |
| Birth certificate | Name, DOB, parents | HIGH |
| Driver's license | Photo, address | MEDIUM |
| Education certificates | Name, dates, institution | MEDIUM |

### Persecution Evidence (CRITICAL)

| Document Type | Extraction Focus | Weight |
|---------------|-----------------|--------|
| Police reports | Incident details, dates, response | HIGH |
| Medical reports | Injuries, treatment, causation | HIGH |
| Arrest warrants | Charges, dates, issuing authority | HIGH |
| Threat letters | Content, origin, dates | HIGH |
| Photos of injuries | Date, injuries visible | HIGH |
| News articles | Events mentioned, dates | MEDIUM |

### Country Conditions Evidence

| Document Type | Extraction Focus | Weight |
|---------------|-----------------|--------|
| UNHCR reports | Relevant country conditions | HIGH |
| Human Rights Watch | Persecution patterns | HIGH |
| Amnesty International | Human rights situation | HIGH |
| US State Dept reports | Country assessment | MEDIUM |
| News articles | Current conditions | MEDIUM |
| Expert affidavits | Specific risk analysis | HIGH |

### Membership/Affiliation Evidence

| Document Type | Extraction Focus | Weight |
|---------------|-----------------|--------|
| Organization membership cards | Organization, dates | HIGH |
| Political party documents | Role, activities | HIGH |
| Religious institution letters | Affiliation, activities | HIGH |
| Union membership | Organization, role | MEDIUM |
| Photos at events | Events, dates, presence | MEDIUM |

## Extraction Schema

### BOC Narrative Analysis

```json
{
  "narrative_elements": {
    "claimed_persecution": "Description of harm suffered",
    "agents_of_persecution": ["List of persecutors"],
    "convention_ground": "Primary ground claimed",
    "timeline": [
      {"date": "YYYY-MM-DD", "event": "Description"}
    ],
    "protection_sought": "Efforts to seek state protection",
    "flight_reason": "Immediate trigger for leaving",
    "return_risk": "What claimant fears upon return"
  }
}
```

### Identity Verification Matrix

| Source | Identity Element | Consistency Check |
|--------|-----------------|-------------------|
| Passport | Name, DOB, nationality | Cross-reference all docs |
| BOC | Claimed identity | Match to documents |
| Interview | Stated identity | Consistency with BOC |
| Prior records | FOSS/GCMS entries | Any discrepancies |

## Document Authenticity Indicators

### Red Flags

- Documents appear newly created despite old dates
- Inconsistent fonts or formatting within document
- Stamps or seals appear irregular
- Information conflicts with country practices
- Documents from unavailable/destroyed sources
- Sequential certificate numbers for unrelated events

### Verification Considerations

- Some countries cannot verify documents
- Conflict zones make authentication impossible
- Destroyed records common for refugees
- Lack of documents NOT necessarily fraud

## Narrative Consistency Analysis

### Cross-Reference Points

1. **BOC vs. Port of Entry notes**: Initial account
2. **BOC vs. Hearing testimony**: Consistency over time
3. **BOC vs. Documentary evidence**: Dates, names, places
4. **BOC vs. Country conditions**: Plausibility

### Consistency Scoring

| Issue | Impact |
|-------|--------|
| Minor date discrepancy | LOW - may be trauma-related |
| Name spelling variation | LOW - transliteration issues |
| Event sequence change | MEDIUM - needs explanation |
| Fundamental fact change | HIGH - credibility concern |
| New persecution claim | HIGH - why not in BOC? |

## Evidence Weight Framework

### Strong Evidence

- Authenticated government documents
- Medical reports with clear causation
- Multiple corroborating sources
- Expert country conditions opinion
- Consistent, detailed narrative

### Weak Evidence

- Self-authored letters
- Undated photographs
- Generic country conditions without personal nexus
- Documents with authenticity concerns
- Vague or inconsistent testimony

## Document Checklist by Claim Type

### Political Persecution

- [ ] Party membership evidence
- [ ] Photos at political events
- [ ] Arrest records/warrants
- [ ] News coverage of activities
- [ ] Threat documentation
- [ ] Country conditions on political treatment

### Religious Persecution

- [ ] Religious institution membership
- [ ] Photos of religious activities
- [ ] Conversion documentation (if applicable)
- [ ] Evidence of religious restrictions in country
- [ ] Specific incidents of religious persecution

### Gender-Based Persecution

- [ ] Police reports (if any)
- [ ] Medical/psychological reports
- [ ] Evidence of country conditions for women
- [ ] Expert evidence on gender persecution
- [ ] Support organization documentation

### LGBTQ+ Persecution

- [ ] Relationship evidence
- [ ] Community membership
- [ ] Country conditions for LGBTQ+ individuals
- [ ] Expert evidence on treatment
- [ ] Specific incident documentation
