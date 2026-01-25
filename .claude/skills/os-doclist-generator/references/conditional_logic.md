# Conditional Logic Rules

How document requirements are evaluated based on client variables.

## Logic Types

### ALL_REQUIRED

Every item in the group must be provided.

```json
{
  "group_id": "required_forms",
  "logic": "ALL_REQUIRED",
  "items": [
    { "doc_id": "imm5533", "name": "Document Checklist" },
    { "doc_id": "imm1344", "name": "Application to Sponsor" },
    { "doc_id": "imm0008", "name": "Generic Application Form" }
  ]
}
```

### ONE_OF

Exactly one item from the group is required. Used when multiple documents can satisfy the same requirement.

```json
{
  "group_id": "sponsor_identity",
  "logic": "ONE_OF",
  "items": [
    { "doc_id": "citizenship_cert", "name": "Citizenship Certificate" },
    { "doc_id": "passport", "name": "Canadian Passport" },
    { "doc_id": "birth_certificate", "name": "Birth Certificate" }
  ]
}
```

**Display guidance**: Show as "Choose ONE of the following:"

### AT_LEAST_N

Minimum N items from the group are required.

```json
{
  "group_id": "cohabitation_proof",
  "logic": "AT_LEAST_N",
  "minimum_required": 2,
  "items": [
    { "doc_id": "joint_lease", "name": "Joint Lease Agreement" },
    { "doc_id": "joint_bank", "name": "Joint Bank Account" },
    { "doc_id": "joint_utilities", "name": "Joint Utility Bills" },
    { "doc_id": "govt_docs", "name": "Government Documents Same Address" }
  ]
}
```

**Display guidance**: Show as "Provide at least 2 of the following:"

### CONDITIONAL

The entire group or specific items only apply when condition is met.

```json
{
  "group_id": "divorce_documents",
  "logic": "CONDITIONAL",
  "condition": "sponsor.marital_history == 'divorced'",
  "applies": true,
  "items": [
    { "doc_id": "divorce_certificate", "name": "Final Divorce Certificate" }
  ]
}
```

## Condition Expression Syntax

Conditions are evaluated against the client profile using JavaScript-like syntax.

### Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `==` | Equals | `sponsor.status == 'citizen'` |
| `!=` | Not equals | `applicant.marital_history != 'never_married'` |
| `&&` | AND | `relationship.cohabiting && relationship.has_shared_children` |
| `||` | OR | `sponsor.status == 'citizen' || sponsor.status == 'permanent_resident'` |
| `<`, `>`, `<=`, `>=` | Comparison | `dependent.age < 18` |

### Field Paths

```javascript
// Sponsor fields
sponsor.status                    // 'citizen' | 'permanent_resident' | 'indian_status'
sponsor.marital_history           // 'never_married' | 'divorced' | 'widowed' | 'annulled'
sponsor.is_overseas               // boolean
sponsor.province                  // 'BC' | 'ON' | etc.

// Applicant fields
applicant.nationality             // Country code or name
applicant.current_status_in_canada // 'visitor' | 'worker' | 'student' | 'none'
applicant.marital_history         // Same as sponsor
applicant.has_dependent_children  // boolean

// Relationship fields
relationship.type                 // 'marriage' | 'common_law' | 'conjugal'
relationship.cohabiting           // boolean
relationship.has_shared_children  // boolean
relationship.both_first_marriage  // boolean
relationship.married_over_2_years // boolean

// Dependent fields (use in loops)
dependent.age                     // number
dependent.accompanying            // boolean
dependent.biological_parent_is_sponsor // boolean
```

## Evaluation Order

1. **Group-level condition**: Check if entire group applies
2. **Item-level condition**: Check if specific item applies
3. **Logic type**: Determine how many items needed

```
For each document group:
  1. Evaluate group.condition
     → If false: skip entire group (applies = false)
     → If true: continue
  
  2. For each item in group:
     Evaluate item.condition
     → Set item.applies = result
  
  3. Based on group.logic:
     → ALL_REQUIRED: All items with applies=true are required
     → ONE_OF: User picks one from items with applies=true
     → AT_LEAST_N: User picks N from items with applies=true
     → CONDITIONAL: Already filtered by step 1
```

## Spousal-Specific Rules

### Simplified Requirements (Spousal Only)

```javascript
const simplified = 
  relationship.cohabiting &&
  relationship.has_shared_children &&
  relationship.both_first_marriage &&
  relationship.married_over_2_years

if (simplified) {
  // Reduced photo requirements
  // Reduced relationship evidence
}
```

### Identity Document Selection

```javascript
// Sponsor identity (ONE_OF)
if (sponsor.status === 'citizen') {
  // Accept: citizenship_cert OR passport OR birth_certificate
}
else if (sponsor.status === 'permanent_resident') {
  // Accept: pr_card OR copr
}
else if (sponsor.status === 'indian_status') {
  // Accept: indian_status_card OR citizenship_cert
}
```

### Children-Related Documents

```javascript
// For each dependent
for (const dep of dependents) {
  if (dep.age < 18 && !dep.biological_parent_is_sponsor) {
    // Require: IMM 5604, custody agreement
  }
  if (dep.age >= 22) {
    // Require: dependency proof (medical/mental condition)
  }
}
```

## Example: Full Evaluation

Given client profile:
```json
{
  "sponsor": { "status": "citizen", "marital_history": "divorced" },
  "applicant": { "has_dependent_children": true },
  "relationship": { "cohabiting": true },
  "dependents": [
    { "age": 12, "biological_parent_is_sponsor": false }
  ]
}
```

Evaluation results:
```
✓ sponsor_identity: ONE_OF [citizenship_cert, passport, birth_certificate]
✓ sponsor_marital_history: divorce_certificate REQUIRED (divorced)
✓ cohabitation_proof: AT_LEAST_N(2) from [lease, bank, utilities, govt_docs]
✓ children_documents: IMM 5604 + custody_agreement REQUIRED (age<18, not biological)
```
