# Client Variables Reference

Complete field definitions for client profile input.

## Client Profile Schema

```typescript
interface ClientProfile {
  sponsor: SponsorProfile
  applicant: ApplicantProfile
  relationship: RelationshipProfile
  dependents: DependentProfile[]
}
```

## Sponsor Profile

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `name` | string | Any | Sponsor's full legal name |
| `status` | enum | `citizen`, `permanent_resident`, `indian_status` | Immigration status in Canada |
| `is_overseas` | boolean | `true`, `false` | Whether sponsor is currently outside Canada |
| `marital_history` | enum | `never_married`, `divorced`, `widowed`, `annulled` | Previous marriage status |
| `province` | enum | See below | Province/territory of residence |

### Province Values

```
BC, AB, SK, MB, ON, QC, NB, NS, PE, NL, YT, NT, NU
```

### Status Impact on Documents

| Status | Identity Documents (ONE_OF) |
|--------|----------------------------|
| `citizen` | Citizenship cert, Canadian passport, Birth certificate |
| `permanent_resident` | PR card (front+back), CoPR/eCoPR |
| `indian_status` | Indian Status card, Citizenship cert |

## Applicant Profile

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `name` | string | Any | Applicant's full legal name |
| `nationality` | string | Country name or ISO code | Current citizenship |
| `current_status_in_canada` | enum | `visitor`, `worker`, `student`, `none` | Current immigration status in Canada |
| `marital_history` | enum | `never_married`, `divorced`, `widowed`, `annulled` | Previous marriage status |
| `has_dependent_children` | boolean | `true`, `false` | Whether applicant has children to include |

### Nationality Considerations

Certain nationalities may require additional documents:
- **China**: Hukou, household registration
- **India**: Birth registration, Aadhaar
- **Philippines**: NSO birth certificate, CENOMAR

## Relationship Profile

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `type` | enum | `marriage`, `common_law`, `conjugal` | Relationship category |
| `cohabiting` | boolean | `true`, `false` | Currently living together |
| `has_shared_children` | boolean | `true`, `false` | Have children together |
| `both_first_marriage` | boolean | `true`, `false` | Neither party previously married |
| `married_over_2_years` | boolean | `true`, `false` | Marriage duration 2+ years |

### Relationship Type Impact

| Type | Required Forms | Required Evidence |
|------|---------------|-------------------|
| `marriage` | IMM 5532 | Marriage certificate, ceremony photos |
| `common_law` | IMM 5532, IMM 5409 | 12+ months cohabitation proof |
| `conjugal` | IMM 5532 | Barrier to marriage explanation, relationship proof |

### Simplified Requirements Eligibility

All four conditions must be TRUE:

```javascript
const simplified = 
  relationship.cohabiting === true &&
  relationship.has_shared_children === true &&
  relationship.both_first_marriage === true &&
  relationship.married_over_2_years === true
```

Benefits of simplified requirements:
- Reduced photo evidence (photos optional)
- Reduced relationship documentation

## Dependent Profile

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `name` | string | Any | Dependent's full legal name |
| `age` | number | 0-99 | Current age |
| `accompanying` | boolean | `true`, `false` | Included in this application |
| `biological_parent_is_sponsor` | boolean | `true`, `false` | Sponsor is biological parent |

### Age-Based Requirements

| Age | Documents Required |
|-----|-------------------|
| < 18 | Birth certificate, IMM 5604 (if other parent exists) |
| 18-21 | Student status proof (if claiming dependency) |
| 22+ | Proof of financial/physical/mental dependency |

### Non-Biological Parent Requirements

If `biological_parent_is_sponsor === false` and `age < 18`:
- IMM 5604 (Declaration from Non-Accompanying Parent)
- Custody agreement or court order
- Other parent's identity document

## Example Profiles

### Simple Case

```json
{
  "sponsor": {
    "name": "John Smith",
    "status": "citizen",
    "is_overseas": false,
    "marital_history": "never_married",
    "province": "ON"
  },
  "applicant": {
    "name": "Maria Chen",
    "nationality": "China",
    "current_status_in_canada": "none",
    "marital_history": "never_married",
    "has_dependent_children": false
  },
  "relationship": {
    "type": "marriage",
    "cohabiting": false,
    "has_shared_children": false,
    "both_first_marriage": true,
    "married_over_2_years": false
  },
  "dependents": []
}
```

### Complex Case

```json
{
  "sponsor": {
    "name": "Robert Johnson",
    "status": "permanent_resident",
    "is_overseas": false,
    "marital_history": "divorced",
    "province": "BC"
  },
  "applicant": {
    "name": "Li Wei",
    "nationality": "China",
    "current_status_in_canada": "visitor",
    "marital_history": "widowed",
    "has_dependent_children": true
  },
  "relationship": {
    "type": "common_law",
    "cohabiting": true,
    "has_shared_children": false,
    "both_first_marriage": false,
    "married_over_2_years": false
  },
  "dependents": [
    {
      "name": "Li Xiaoming",
      "age": 12,
      "accompanying": true,
      "biological_parent_is_sponsor": false
    },
    {
      "name": "Li Xiaohong",
      "age": 8,
      "accompanying": true,
      "biological_parent_is_sponsor": false
    }
  ]
}
```

This complex case requires:
- Sponsor: PR card + Final divorce certificate
- Applicant: Death certificate (widowed)
- Relationship: IMM 5409 (common-law) + 12 months cohabitation proof
- Children: IMM 5604 x2 + custody agreements + birth certificates
