---
name: refugee-workflow
description: Output templates and report formats for refugee audit workflow stages
category: audit
app_type: refugee
version: 1.0.0
---

# Refugee Workflow Templates

Internal workflow templates for refugee protection claim audits.

## Workflow Stages

### Stage 1: Initial Assessment

Quick viability screening for refugee claims.

**Key questions**:
1. Is the claimant eligible to make a claim (A101)?
2. Are there obvious exclusion grounds (Article 1F)?
3. Is there a prima facie case for protection?

**Output**: GO / CAUTION / NO-GO with rationale

### Stage 2: Deep Analysis

Comprehensive analysis of claim elements.

**Analyze**:
1. Credibility of narrative
2. Strength of evidence
3. Nexus to Convention ground
4. State protection rebuttal
5. IFA considerations

**Output**: Detailed risk assessment

### Stage 3: Final Review

Pre-hearing quality check.

**Verify**:
1. All eligibility requirements confirmed
2. Documentation complete
3. Narrative consistent
4. Strategy developed

**Output**: APPROVE / REVISE recommendation

## Assessment Templates

### Eligibility Checklist

```markdown
## Eligibility Assessment

### Step 1: Ineligibility Screening (A101)

| Ground | Status | Evidence |
|--------|--------|----------|
| A101(1)(a) - Other country protection | ☐ CLEAR / ☐ CONCERN | |
| A101(1)(b) - Protected status in Canada | ☐ CLEAR / ☐ CONCERN | |
| A101(1)(c) - Prior ineligible claim | ☐ CLEAR / ☐ CONCERN | |
| A101(1)(c.1) - Prior rejected claim | ☐ CLEAR / ☐ CONCERN | |
| A101(1)(d) - Other country claim | ☐ CLEAR / ☐ CONCERN | |
| A101(1)(e) - STCA applies | ☐ CLEAR / ☐ CONCERN | |
| A101(2)(a-d) - Inadmissibility | ☐ CLEAR / ☐ CONCERN | |

### Step 2: STCA Assessment (if applicable)

Entry from US: ☐ Yes / ☐ No

If yes:
- Entry point: _____________
- Date of entry: _____________
- Date of claim: _____________
- Days between: _____________

Exception applicable: ☐ Family member / ☐ Unaccompanied minor / ☐ Document holder / ☐ Other: _____________

### Step 3: Exclusion Screening

| Ground | Assessment |
|--------|------------|
| Article 1F(a) | ☐ No concern / ☐ Requires review |
| Article 1F(b) | ☐ No concern / ☐ Requires review |
| Article 1F(c) | ☐ No concern / ☐ Requires review |

### Eligibility Conclusion

☐ ELIGIBLE - Proceed with claim assessment
☐ INELIGIBLE - [Ground]: _____________
☐ UNCERTAIN - Requires further investigation
```

### Protection Analysis Template

```markdown
## Protection Analysis

### Convention Refugee (A96)

Convention ground claimed: ☐ Race / ☐ Religion / ☐ Nationality / ☐ Political opinion / ☐ Particular social group

**Well-Founded Fear Assessment**

Subjective fear:
- Evidence of genuine fear: _____________
- Behavior consistent with fear: ☐ Yes / ☐ No / ☐ Concerns

Objective basis:
- Documentary evidence of risk: _____________
- Country conditions support: ☐ Strong / ☐ Moderate / ☐ Weak

**Nexus to Convention Ground**

- Clear connection: ☐ Yes / ☐ No
- Evidence of nexus: _____________
- Mixed motives analysis: _____________

### Person in Need of Protection (A97)

Applicable ground: ☐ Torture / ☐ Risk to life / ☐ Cruel/unusual treatment

- Evidence of risk: _____________
- Personal vs. general risk: _____________

### State Protection

Presumption applies: ☐ Yes (democratic state) / ☐ No

Rebuttal evidence:
- Efforts to seek protection: _____________
- Result of efforts: _____________
- Why futile (if not sought): _____________
- Country conditions on state response: _____________

Assessment: ☐ Rebutted / ☐ Not rebutted / ☐ Partially rebutted

### Internal Flight Alternative

IFA proposed: _____________

Prong 1 - Safety:
- Agent's reach in IFA: _____________
- State protection in IFA: _____________
Assessment: ☐ Safe / ☐ Not safe

Prong 2 - Reasonableness:
- Personal circumstances: _____________
- Support available: _____________
- Conditions in IFA: _____________
Assessment: ☐ Reasonable / ☐ Not reasonable

### Protection Conclusion

☐ Strong case for protection
☐ Moderate case - issues to address
☐ Weak case - significant concerns
☐ Case unlikely to succeed
```

### Risk Assessment Template

```markdown
## Risk Assessment

### Risk Badges

| Badge | Severity | Assigned | Rationale |
|-------|----------|----------|-----------|
| CREDIBILITY_CONCERN | HIGH | ☐ Yes / ☐ No | |
| INSUFFICIENT_PERSECUTION | HIGH | ☐ Yes / ☐ No | |
| IFA_AVAILABLE | HIGH | ☐ Yes / ☐ No | |
| STATE_PROTECTION_AVAILABLE | MED-HIGH | ☐ Yes / ☐ No | |
| STCA_BAR | CRITICAL | ☐ Yes / ☐ No | |
| EXCLUSION_GROUND | CRITICAL | ☐ Yes / ☐ No | |
| IDENTITY_UNESTABLISHED | CRITICAL | ☐ Yes / ☐ No | |
| CESSATION_RISK | HIGH | ☐ Yes / ☐ No | |

### Defensibility Score

| Element | Score (0-100) | Weight | Weighted |
|---------|---------------|--------|----------|
| Identity | | 15% | |
| Eligibility | | 15% | |
| Credibility | | 25% | |
| Protection grounds | | 25% | |
| Evidence strength | | 20% | |
| **TOTAL** | | 100% | |

### Score Interpretation

- 80-100: Strong case - proceed with confidence
- 60-79: Moderate case - address weaknesses
- 40-59: Weak case - significant concerns
- 0-39: Very weak - reconsider strategy
```
