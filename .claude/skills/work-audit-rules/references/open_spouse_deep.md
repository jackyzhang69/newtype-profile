# Open Spouse Work Permit Deep Dive

**Source**: MCP Help Centre, Federal Court Case Law, IRCC Policy
**Last Updated**: January 2026
**Version**: 1.0.0

---

## 1. Overview: Open Work Permit Categories for Spouses

### 1.1 Three Main Categories

| Category | Code | Principal Applicant | Key Requirement |
|----------|------|---------------------|-----------------|
| Spouse of Skilled Worker | C41 | Worker in NOC TEER 0/1/2/3 | Principal has valid work permit |
| Spouse of Student | C42 | Full-time student at DLI | Principal has valid study permit |
| Sponsored Spouse | C46 | PR sponsor in Canada | Sponsorship application complete |

### 1.2 Eligibility Summary (Help Centre qnum 177)

Open work permit eligible if:
- Family member of certain foreign workers in Canada
- Spouse or common-law partner of international student
- Being sponsored as spouse/common-law partner/conjugal partner in Canada
- Spouse of Atlantic Immigration Program applicant

---

## 2. Spouse of Skilled Worker (C41)

### 2.1 Eligibility Requirements

**Principal Applicant Must:**
- Hold valid work permit
- Work in occupation classified as NOC TEER 0, 1, 2, or 3
- Be authorized to work for at least 6 months

**Spouse/Partner Must:**
- Be in genuine relationship with principal
- Have valid temporary resident status (or apply concurrently)
- Not be inadmissible

### 2.2 NOC TEER Classification

| TEER Level | Description | Examples |
|------------|-------------|----------|
| TEER 0 | Management | Managers, executives |
| TEER 1 | Professional (university degree) | Engineers, doctors, lawyers |
| TEER 2 | Technical (college/apprenticeship) | Technicians, trades |
| TEER 3 | Intermediate (high school + training) | Administrative, clerical |
| TEER 4/5 | NOT ELIGIBLE | Entry-level, labourers |

### 2.3 Duration

**From Help Centre (qnum 1522):**
> "Normally, your work permit is valid for the same amount of time that your spouse or common-law partner's work permit or study permit is valid."

**Important**: Work permit remains valid even if:
- Spouse loses their job
- Spouse completes studies early
- Couple divorces or separates after permit issued

---

## 3. Spouse of Student (C42)

### 3.1 Eligibility Requirements

**Principal Student Must:**
- Hold valid study permit
- Be enrolled full-time at Designated Learning Institution (DLI)
- Be in eligible program (graduate degree or professional program)

**Spouse/Partner Must:**
- Be in genuine relationship with principal
- Have valid temporary resident status

### 3.2 Program Eligibility Changes (2024)

**As of March 19, 2024:**
- Spouses of master's/doctoral students: ELIGIBLE
- Spouses of professional degree students (law, medicine, etc.): ELIGIBLE
- Spouses of undergraduate students: NOT ELIGIBLE (policy change)
- Spouses of college diploma students: NOT ELIGIBLE

### 3.3 Duration

Work permit validity tied to student's study permit duration.

---

## 4. Sponsored Spouse in Canada (C46)

### 4.1 Eligibility Requirements

**From Help Centre (qnum 1163):**

Sponsored spouse can apply for open work permit if:
1. Living with sponsor in Canada
2. Sponsorship application confirmed as **complete** (AOR received)

**While Processing:**
- Must maintain legal status as temporary resident
- Must wait for work permit approval before starting work
- Cannot benefit from maintained status if on TRP

### 4.2 Key Distinction from Spousal Sponsorship

| Aspect | Spousal Sponsorship (PR) | Spousal Open Work Permit |
|--------|--------------------------|--------------------------|
| Purpose | Permanent residence | Work authorization |
| Processing | 12+ months | 2-4 months |
| Relationship Assessment | Comprehensive | Preliminary |
| Outcome | PR status | Work permit only |

---

## 5. Relationship Genuineness Assessment

### 5.1 Cross-Reference with Spousal Sponsorship

**CRITICAL**: Open spouse work permit applications are assessed for relationship genuineness using similar criteria as spousal sponsorship.

**From Sharma v. Canada, 2009 FC 1131:**
- Marriage not genuine if entered primarily for immigration purposes
- Officer assesses totality of circumstances
- Timing of marriage relative to immigration status is relevant

### 5.2 Risk Factors (Aligned with Spousal App)

| Risk Factor | Indicator | Severity |
|-------------|-----------|----------|
| Timing | Marriage shortly before/after immigration issue | HIGH |
| Duration | Very short relationship before marriage | HIGH |
| Knowledge | Limited knowledge of each other | HIGH |
| Cohabitation | No evidence of living together | MEDIUM |
| Communication | Limited communication evidence | MEDIUM |
| Family | No family involvement/awareness | MEDIUM |

### 5.3 Evidence Requirements

**Same as Spousal Sponsorship:**
- Relationship timeline documentation
- Cohabitation evidence
- Communication records
- Photos (different times/places)
- Joint financial documents
- Third-party declarations

---

## 6. Common Refusal Patterns

### 6.1 Relationship Genuineness Issues

**From Case Law Analysis:**

| Pattern | Description | Mitigation |
|---------|-------------|------------|
| Convenience Marriage | Marriage timed to immigration need | Strong relationship history evidence |
| Minimal Contact | Limited communication/visits | Comprehensive communication logs |
| Inconsistent Statements | Discrepancies in relationship details | Consistent, detailed statements |
| No Cohabitation | Never lived together | Explanation + future plans |

### 6.2 Principal Applicant Issues

| Issue | Impact | Solution |
|-------|--------|----------|
| Principal permit expiring | Spouse permit denied | Ensure principal extends first |
| Principal NOC ineligible | Spouse not eligible for C41 | Verify NOC classification |
| Principal not full-time student | Spouse not eligible for C42 | Confirm enrollment status |

### 6.3 Status Issues

| Issue | Impact | Solution |
|-------|--------|----------|
| Spouse out of status | Application refused | Restore status first |
| Principal out of status | Spouse loses eligibility | Principal must maintain status |
| Implied status expired | Cannot work | Apply before status expires |

---

## 7. Integration with Spousal App Skills

### 7.1 Shared Risk Patterns

The following risk patterns from `spousal-audit-rules` apply directly:

- `rushed_relationship` - Short courtship before marriage
- `lack_cohabitation_evidence` - No proof of living together
- `immigration_motive` - Timing suggests immigration purpose
- `testimony_contradiction` - Inconsistent statements
- `lack_mutual_knowledge` - Don't know basic facts about each other

### 7.2 Shared Evidence Standards

From `spousal-doc-analysis`:

| Evidence Type | Weight | Notes |
|---------------|--------|-------|
| Joint lease/mortgage | HIGH | A-level evidence |
| Joint bank accounts | HIGH | B-level evidence |
| Communication records | MEDIUM | C-level evidence |
| Photos | LOW | D-level evidence |
| Third-party letters | LOW | D-level evidence |

### 7.3 Cross-Document Consistency

From `spousal-doc-analysis/consistency_rules.md`:

- Relationship dates must match across all documents
- Names/addresses must be consistent
- Timeline must be coherent
- No unexplained gaps

---

## 8. Audit Checklist for Open Spouse Applications

### 8.1 Principal Applicant Verification

- [ ] Valid work/study permit
- [ ] NOC TEER 0/1/2/3 (for C41)
- [ ] Full-time enrollment at DLI (for C42)
- [ ] Permit valid for 6+ months
- [ ] Status maintained

### 8.2 Relationship Evidence

- [ ] Marriage/common-law certificate
- [ ] Relationship timeline documented
- [ ] Cohabitation evidence (2+ types)
- [ ] Communication records
- [ ] Photos (different times/places)
- [ ] Joint financial documents
- [ ] Third-party declarations

### 8.3 Genuineness Assessment

- [ ] Relationship duration reasonable
- [ ] Timing not suspicious
- [ ] Mutual knowledge demonstrated
- [ ] Consistent statements
- [ ] No red flags from spousal patterns

### 8.4 Status Verification

- [ ] Spouse has valid status (or concurrent application)
- [ ] No inadmissibility issues
- [ ] Biometrics valid (if required)

---

## 9. MCP Search Patterns

### 9.1 Case Law Searches

```
# Relationship genuineness
caselaw_keyword_search(query="spousal open work permit refusal relationship genuineness", court="fc")

# Marriage of convenience
caselaw_keyword_search(query="open work permit spouse marriage convenience", court="fc")

# Status issues
caselaw_keyword_search(query="work permit spouse status maintained", court="fc")
```

### 9.2 Help Centre Searches

```
# Eligibility
help_centre_search(query="open work permit spouse partner", lang="en")

# Sponsored spouse
help_centre_search(query="sponsored spouse work permit processing", lang="en")

# Duration
help_centre_search(query="spouse work permit validity duration", lang="en")
```

---

## 10. Key Takeaways

### 10.1 Fatal Issues

1. **Principal ineligible** - Wrong NOC, not full-time student, etc.
2. **Relationship not genuine** - Marriage of convenience finding
3. **Inadmissibility** - Criminal, security, health grounds
4. **Out of status** - No valid temporary resident status

### 10.2 High-Risk but Mitigable

1. **Short relationship** - Comprehensive evidence package
2. **Limited cohabitation** - Explanation + communication evidence
3. **Timing concerns** - Strong relationship history pre-dating immigration need
4. **Principal permit expiring** - Concurrent extension application

### 10.3 Best Practices

1. **Apply early** - Before principal's permit expires
2. **Document relationship thoroughly** - Same standards as spousal sponsorship
3. **Verify NOC classification** - Confirm TEER 0/1/2/3 eligibility
4. **Maintain status** - Both principal and spouse
5. **Consistent information** - All documents must align
6. **Address red flags proactively** - Explanation letters for any concerns

---

## 11. Relationship to Spousal Sponsorship App

### 11.1 When to Cross-Reference

| Scenario | Action |
|----------|--------|
| Open spouse + concurrent PR sponsorship | Use full spousal-audit-rules |
| Open spouse only (no PR) | Use relationship genuineness subset |
| Sponsored spouse OWP (C46) | Full spousal-audit-rules apply |

### 11.2 Skill Injection

For work permit audits involving spouse/partner:
- Inject `spousal-audit-rules/risk_patterns.json` (genuineness patterns only)
- Inject `spousal-doc-analysis/evidence_standards.md`
- Inject `spousal-doc-analysis/consistency_rules.md`

---

## Sources

- IRCC Help Centre: qnum 177, 199, 679, 841, 1163, 1522
- Federal Court: Sharma v. Canada, 2009 FC 1131
- IRCC Policy: Open work permits for family members of foreign workers
- IRCC Policy: Open work permits for sponsored spouses
- Cross-reference: spousal-audit-rules, spousal-doc-analysis
