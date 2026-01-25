# IRCC Forms Catalog

Official Immigration, Refugees and Citizenship Canada form numbers.

## Anti-Hallucination Rule

**CRITICAL**: Only use form numbers listed in this catalog. Do not invent form numbers.

Common hallucination patterns to avoid:
- `IMM 5533 Part A` - Does NOT exist. IMM 5533 is a single document.
- `IMM 5533A`, `IMM 5533B` - Do NOT exist.
- Forms with 5+ digits - Most IMM forms are 4 digits.

## Spousal/Family Sponsorship Forms

| Form Number | Name | Name (ZH) | When Required |
|-------------|------|-----------|---------------|
| IMM 5533 | Document Checklist (Spouse) | 文件清单 | Always |
| IMM 1344 | Application to Sponsor | 担保申请表 | Always (sponsor) |
| IMM 0008 | Generic Application Form | 通用申请表 | Always (applicant) |
| IMM 5406 | Additional Family Information | 额外家庭信息 | Always |
| IMM 5669 | Schedule A - Background/Declaration | 背景声明 | Always |
| IMM 5532 | Relationship Information and Sponsorship Evaluation | 关系信息问卷 | Always (spousal) |
| IMM 5476 | Use of a Representative | 代理人授权 | If using RCIC/lawyer |
| IMM 5475 | Authority to Release Personal Information | 信息披露授权 | Optional |
| IMM 5604 | Declaration from Non-Accompanying Parent | 非随行父母声明 | Minor children with other parent |
| IMM 1283 | Financial Evaluation | 财务评估 | Sponsor has children from other relationship |

## Study Permit Forms

| Form Number | Name | Name (ZH) | When Required |
|-------------|------|-----------|---------------|
| IMM 1294 | Application for Study Permit | 学习许可申请表 | Always |
| IMM 5645 | Family Information Form | 家庭信息表 | Always |
| IMM 5257 | Application for Temporary Resident Visa | 临时居民签证申请 | If visa required |
| IMM 5476 | Use of a Representative | 代理人授权 | If using representative |
| IMM 5409 | Statutory Declaration of Common-Law Union | 同居声明 | If common-law accompanying |

## Work Permit Forms

| Form Number | Name | Name (ZH) | When Required |
|-------------|------|-----------|---------------|
| IMM 1295 | Application for Work Permit | 工作许可申请表 | Always |
| IMM 5645 | Family Information Form | 家庭信息表 | Always |
| IMM 5257 | Application for Temporary Resident Visa | 临时居民签证申请 | If visa required |
| IMM 5476 | Use of a Representative | 代理人授权 | If using representative |

## Permanent Residence Forms

| Form Number | Name | Name (ZH) | When Required |
|-------------|------|-----------|---------------|
| IMM 0008 | Generic Application Form | 通用申请表 | Always |
| IMM 5406 | Additional Family Information | 额外家庭信息 | Always |
| IMM 5669 | Schedule A | 背景声明 | Always |
| IMM 0008 Schedule 3 | Economic Classes | 经济类别附表 | Economic immigration |

## Common Supporting Documents (Not Forms)

These are document types, NOT IMM form numbers:

| Document Type | Description |
|---------------|-------------|
| Passport | Valid travel document |
| Birth Certificate | Proof of identity/citizenship |
| Marriage Certificate | Proof of marriage |
| Divorce Certificate | Proof of previous marriage termination |
| Police Certificate | Criminal record check |
| Medical Exam | IMD-designated physician exam |
| Photos | Passport-style photographs |
| Bank Statements | Financial proof |
| Employment Letter | Income verification |

## Form Validation Rules

```javascript
function isValidFormNumber(formNumber) {
  // Pattern: "IMM " followed by 4 digits
  const pattern = /^IMM [0-9]{4}$/
  return pattern.test(formNumber)
}

// Valid examples
isValidFormNumber("IMM 5533")  // true
isValidFormNumber("IMM 1344")  // true
isValidFormNumber("IMM 0008")  // true

// Invalid examples
isValidFormNumber("IMM 5533A") // false - no suffix allowed
isValidFormNumber("IMM5533")   // false - missing space
isValidFormNumber("IMM 55331") // false - 5 digits
```
