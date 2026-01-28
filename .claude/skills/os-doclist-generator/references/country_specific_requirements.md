# Country-Specific Requirements

Handling country-specific document requirements in IRCC checklists.

## Overview

IRCC requires additional documents based on applicant's nationality. These requirements are:
1. Listed in the main checklist PDF (Part F or similar)
2. Available on country-specific instruction pages
3. Subject to change - always verify with IRCC website

## IRCC Country-Specific Pages

### URL Pattern

```
https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/guide-{form_number}-{country}.html
```

**Examples**:
- Study Permit from China: `.../guide-5269-china.html`
- Visitor Visa from India: `.../guide-5256-india.html`

### Discovery Method

```javascript
// Search for country-specific guides
async function findCountryGuide(formNumber, country) {
  const searchUrl = `${IRCC_FORMS_URL}?search=${formNumber}+${country}`
  // Or use the forms table filter
}
```

## High-Volume Countries

### China (CHN)

| Document | Chinese Name | When Required |
|----------|--------------|---------------|
| Hukou (Household Register) | 户口本 | All applications |
| Education Verification | 学历认证 | Study/Work permits |
| Employment Certificate | 在职证明 | Work permits, Visitor |
| Bank Statements (6 months) | 银行流水 | Financial proof |
| Property Ownership | 房产证 | Ties to home country |
| Marriage Certificate (notarized) | 结婚证公证 | Spousal applications |

**Condition**:
```json
{
  "condition": "applicant.nationality == 'China' || applicant.nationality == 'CHN'",
  "additional_docs": [
    { "doc_id": "hukou", "name": "Household Register (Hukou)", "name_zh": "户口本" },
    { "doc_id": "education_verification", "name": "Education Verification", "name_zh": "学历认证" }
  ]
}
```

### India (IND)

| Document | When Required |
|----------|---------------|
| Aadhaar Card | Identity verification |
| PAN Card | Financial documents |
| Birth Registration Certificate | If birth certificate unavailable |
| Police Clearance Certificate (PCC) | All PR applications |
| Educational Transcripts (attested) | Study/Work permits |

**Condition**:
```json
{
  "condition": "applicant.nationality == 'India' || applicant.nationality == 'IND'",
  "additional_docs": [
    { "doc_id": "aadhaar", "name": "Aadhaar Card" },
    { "doc_id": "pan_card", "name": "PAN Card" }
  ]
}
```

### Philippines (PHL)

| Document | When Required |
|----------|---------------|
| PSA Birth Certificate | All applications |
| CENOMAR (Certificate of No Marriage) | Spousal applications |
| NBI Clearance | Police certificate |
| POEA/OWWA documents | Work permits |

**Condition**:
```json
{
  "condition": "applicant.nationality == 'Philippines' || applicant.nationality == 'PHL'",
  "additional_docs": [
    { "doc_id": "psa_birth", "name": "PSA Birth Certificate" },
    { "doc_id": "cenomar", "name": "CENOMAR", "condition": "relationship.type != null" }
  ]
}
```

### Pakistan (PAK)

| Document | When Required |
|----------|---------------|
| NADRA CNIC | Identity |
| NADRA Family Registration Certificate | Family applications |
| Police Character Certificate | All applications |
| Nikah Nama (Marriage Certificate) | Spousal applications |

### Nigeria (NGA)

| Document | When Required |
|----------|---------------|
| National ID Card | Identity |
| Birth Certificate (NPC) | All applications |
| Police Clearance (NPF) | All applications |
| WAEC/NECO Certificates | Study permits |

### Iran (IRN)

| Document | When Required |
|----------|---------------|
| Shenasnameh (Birth Certificate) | All applications |
| National ID Card | Identity |
| Military Service Card | Male applicants |
| Marriage Certificate (notarized) | Spousal applications |

## Application Type Specific

### Study Permit Country Requirements

| Country | Additional Requirements |
|---------|------------------------|
| China | Hukou, Education verification, Study plan in Chinese |
| India | Mark sheets, Degree certificates (attested) |
| Vietnam | Notarized academic records |
| Brazil | CPF, Academic transcripts (sworn translation) |

### Work Permit Country Requirements

| Country | Additional Requirements |
|---------|------------------------|
| China | Employment certificate, Social insurance records |
| India | Experience letters, Salary slips |
| Philippines | POEA clearance, OWWA membership |

### Spousal Sponsorship Country Requirements

| Country | Additional Requirements |
|---------|------------------------|
| China | Hukou showing marital status, Marriage certificate (notarized + translated) |
| India | Marriage registration certificate |
| Philippines | CENOMAR, PSA marriage certificate |
| Pakistan | Nikah Nama (attested) |

## Implementation

### Schema Extension

```json
{
  "country_specific": {
    "CHN": {
      "country_name": "China",
      "additional_docs": [
        {
          "doc_id": "hukou",
          "name": "Household Register",
          "name_zh": "户口本",
          "priority": "mandatory",
          "notes": "All pages with applicant's information"
        }
      ],
      "special_instructions": [
        "All Chinese documents must be notarized",
        "Translations must be certified"
      ]
    }
  }
}
```

### Condition Evaluation

```javascript
function getCountrySpecificDocs(clientProfile, appType) {
  const nationality = clientProfile.applicant.nationality
  const countryCode = normalizeCountryCode(nationality)
  
  // Load country-specific requirements
  const countryReqs = COUNTRY_REQUIREMENTS[countryCode]
  if (!countryReqs) return []
  
  // Filter by application type
  const appReqs = countryReqs.filter(req => 
    !req.app_types || req.app_types.includes(appType)
  )
  
  // Apply additional conditions
  return appReqs.filter(req => 
    !req.condition || evaluateCondition(req.condition, clientProfile)
  )
}
```

### Country Code Normalization

```javascript
const COUNTRY_ALIASES = {
  'China': 'CHN',
  'People\'s Republic of China': 'CHN',
  'PRC': 'CHN',
  'India': 'IND',
  'Republic of India': 'IND',
  'Philippines': 'PHL',
  'Republic of the Philippines': 'PHL',
  // ... etc
}

function normalizeCountryCode(input) {
  // If already ISO code
  if (/^[A-Z]{3}$/.test(input)) return input
  
  // Check aliases
  return COUNTRY_ALIASES[input] || input.toUpperCase().slice(0, 3)
}
```

## Extraction from IRCC

### Detecting Country-Specific Sections

In PDF parsing, look for:

```javascript
const countryPatterns = [
  /Part [A-Z]: Country[- ]Specific Requirements/i,
  /Additional documents for (.+) applicants/i,
  /If you are applying from (.+)/i,
  /For applicants from (.+)/i
]
```

### Scraping Country Guide Pages

```javascript
async function scrapeCountryGuide(formNumber, countryCode) {
  const guideUrl = `${IRCC_BASE}/guide-${formNumber}-${countryCode.toLowerCase()}.html`
  
  try {
    await browser_navigate({ url: guideUrl })
    const snapshot = await browser_snapshot()
    return parseCountryGuide(snapshot)
  } catch (e) {
    // Country guide may not exist
    return null
  }
}
```

## Output Integration

Final checklist includes country-specific section:

```json
{
  "meta": { ... },
  "forms": [ ... ],
  "supporting_documents": { ... },
  "country_specific": {
    "applies": true,
    "country_code": "CHN",
    "country_name": "China",
    "documents": [
      {
        "doc_id": "hukou",
        "name": "Household Register (Hukou)",
        "name_zh": "户口本",
        "priority": "mandatory",
        "notes": "All pages showing applicant's information, notarized"
      },
      {
        "doc_id": "education_verification",
        "name": "Education Verification Report",
        "name_zh": "学历认证报告",
        "priority": "mandatory",
        "condition": "appType == 'study' || appType == 'work'",
        "notes": "From CDGDC or CHSI"
      }
    ],
    "special_instructions": [
      "All Chinese documents must be notarized by a Chinese notary public",
      "Translations must be certified by a certified translator",
      "Hukou must show current marital status"
    ],
    "source": "IRCC country-specific guide",
    "last_verified": "2026-01-28"
  }
}
```

## Maintenance

### Update Frequency

Country-specific requirements change periodically. Recommended:
- Check IRCC website monthly for updates
- Cache results for 7 days
- Log extraction date for audit trail

### Fallback Strategy

If country-specific page not found:
1. Use generic requirements from main checklist
2. Add note: "Check IRCC website for country-specific requirements"
3. Provide link to IRCC country-specific page search
