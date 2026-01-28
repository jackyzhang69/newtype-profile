# PGWP Deep Dive: Post-Graduation Work Permit

**Source**: MCP Help Centre, Federal Court Case Law, IRCC Policy
**Last Updated**: January 2026
**Version**: 1.0.0

---

## 1. Core Eligibility Requirements

### 1.1 Program Requirements

**From Help Centre (qnum 513, 507):**

| Requirement | Details | Risk Level |
|-------------|---------|------------|
| DLI Status | Must graduate from Designated Learning Institution | FATAL if not met |
| Program Length | Minimum 8 months | FATAL if < 8 months |
| Full-Time Study | Must maintain full-time status during all semesters | HIGH |
| Program Type | Academic, professional, or vocational training | HIGH |

**Ineligible Programs (qnum 497):**
- ESL/FSL (English/French as Second Language)
- General interest courses
- Preparatory courses
- Programs where work > 50% of total program

### 1.2 Application Timeline

**From Help Centre (qnum 755, 508):**

| Deadline | Details | Consequence |
|----------|---------|-------------|
| 180 Days | From final marks issuance | FATAL - application refused |
| Study Permit Validity | Must be valid at some point during 180-day window | FATAL |
| Study Permit Expiry | Expires on permit date OR 90 days after completion (whichever first) | Status loss |

**Critical Rule**: Study permit must have been valid at some point during the 180-day application window.

### 1.3 PGWP Validity Duration

**From Help Centre (qnum 509):**

| Program Length | PGWP Duration |
|----------------|---------------|
| 8 months - < 2 years | Equal to program length |
| 2+ years | 3 years |
| Master's degree (< 2 years) | 3 years (special rule) |

---

## 2. High-Risk Patterns from Case Law

### 2.1 Full-Time Study Requirement Violations

**Singh v. Canada (Citizenship and Immigration), 2022 FC 855**

**Facts:**
- Applicant studied at Langara College (May 2016 - August 2019)
- Program had scheduled break (September 2018 - December 2018)
- PGWP denied: "had not studied full time for at least eight months"

**Key Issues:**
- Scheduled breaks may not count toward full-time study
- Graduation letter must clearly explain any gaps
- Officer discretion on interpreting "continuous full-time"

**Risk Indicators:**
- Program with multiple breaks
- Part-time semesters (even one)
- Co-op/internship periods exceeding 50%
- Reduced course load without medical documentation

### 2.2 DLI De-Designation Risk

**From Help Centre (qnum 1632):**

If DLI loses designation while studying:
- Can continue until current study permit expires
- CANNOT extend study permit at that DLI
- Must transfer to new DLI for continued studies
- PGWP eligibility may be affected

**Risk Mitigation:**
- Verify DLI status before enrollment
- Monitor DLI status throughout program
- Have backup plan if DLI loses designation

### 2.3 Application Timing Failures

**Common Refusal Patterns:**

| Scenario | Outcome | Prevention |
|----------|---------|------------|
| Applied after 180 days | REFUSED | Calendar reminder at graduation |
| Study permit expired before application | REFUSED (unless restored) | Apply early in 180-day window |
| Applied at port of entry after June 21, 2024 | REFUSED | Apply online only |

**From Help Centre (qnum 508):**
> "As of June 21, 2024, you can no longer apply for a PGWP at a port of entry (airport, land or marine border) when entering Canada."

---

## 3. Status Restoration Scenarios

### 3.1 Expired Study Permit

**From Help Centre (qnum 508):**

If study permit expired before PGWP application:
1. Submit PGWP application within 90 days of losing status
2. Pay restoration fee ($350) separately online
3. Attach receipt to PGWP application
4. Continue meeting requirements for stay
5. Meet all remaining permit conditions

**Critical**: No separate restoration application needed - just pay fee and attach receipt.

### 3.2 PGWP Renewal Limitations

**From Help Centre (qnum 676):**

> "Post-graduation work permits (PGWP) are a one-time opportunity for international students."

**Exception - Passport Expiry:**
- If PGWP was shortened due to passport expiry
- Can extend with new passport
- Include letter of explanation

**Alternative - Bridging Open Work Permit:**
- If waiting for PR decision under Express Entry
- Current work permit expires in 4 months or less
- Valid status on work permit
- Currently in Canada

---

## 4. Co-op and Internship Considerations

### 4.1 Co-op Work Permit Requirements

**From Help Centre (qnum 497):**

| Requirement | Details |
|-------------|---------|
| Separate Work Permit | Required for co-op/internship |
| Proof Required | Letter from school OR curriculum copy |
| Work Limit | Cannot exceed 50% of total program |
| Ineligible | ESL/FSL students, general interest courses |

### 4.2 Impact on PGWP

**Risk Factors:**
- Co-op period may not count toward "study" time
- Must maintain full-time study status during academic terms
- Work experience portion scrutinized for PGWP eligibility

---

## 5. Off-Campus Work Rules

### 5.1 Current Rules

**From Help Centre (qnum 496):**

| Condition | Hours Allowed |
|-----------|---------------|
| Class in session | Up to 24 hours/week |
| Scheduled breaks | Unlimited |

**Requirements:**
- Study permit must authorize off-campus work
- Must be enrolled full-time at DLI
- Academic, professional, or vocational program

### 5.2 Work Authorization on Study Permit

**Risk**: If study permit doesn't include off-campus work authorization:
- Cannot work off-campus
- Working without authorization = violation
- May affect PGWP eligibility

---

## 6. Audit Checklist for PGWP Applications

### 6.1 Pre-Application Verification

- [ ] DLI status confirmed (check IRCC DLI list)
- [ ] Program length ≥ 8 months
- [ ] Full-time study maintained throughout
- [ ] No ESL/FSL or preparatory courses
- [ ] Co-op/internship ≤ 50% of program
- [ ] Study permit valid during 180-day window

### 6.2 Application Timing

- [ ] Final marks issued date documented
- [ ] Application submitted within 180 days
- [ ] Study permit status verified
- [ ] Online application (not port of entry)

### 6.3 Documentation

- [ ] Official completion letter from school
- [ ] Official transcript (or copy from school website)
- [ ] Both fees paid (open work permit + standard)
- [ ] Restoration fee if applicable ($350)

### 6.4 Red Flags to Address

| Red Flag | Mitigation |
|----------|------------|
| Part-time semester | Medical documentation, school letter |
| Program break | Explanation letter, school confirmation |
| DLI status change | Transfer documentation |
| Late application | Restoration application if within 90 days |

---

## 7. MCP Search Patterns for PGWP Cases

### 7.1 Case Law Searches

```
# Full-time requirement issues
caselaw_keyword_search(query="PGWP full-time study requirement", court="fc")

# DLI eligibility
caselaw_keyword_search(query="post-graduation work permit designated learning institution", court="fc")

# Application timing
caselaw_keyword_search(query="PGWP 180 days application deadline", court="fc")
```

### 7.2 Help Centre Searches

```
# Core eligibility
help_centre_search(query="PGWP eligible programs", lang="en")

# Application process
help_centre_search(query="PGWP application deadline 180 days", lang="en")

# Status issues
help_centre_search(query="PGWP study permit expired", lang="en")
```

---

## 8. Key Takeaways

### 8.1 Fatal Eligibility Issues

1. **Non-DLI graduation** - No remedy
2. **Program < 8 months** - No remedy
3. **Application > 180 days** - Restoration possible if within 90 days
4. **ESL/FSL program** - No remedy

### 8.2 High-Risk but Mitigable

1. **Part-time semester** - Medical documentation, school letter
2. **Program breaks** - Explanation with school confirmation
3. **Expired study permit** - Restoration within 90 days
4. **DLI de-designation** - Transfer to new DLI

### 8.3 Best Practices

1. Apply early in 180-day window (don't wait)
2. Verify DLI status before and during program
3. Maintain full-time status documentation
4. Keep all transcripts and completion letters
5. Apply online only (not at port of entry)

---

## Sources

- IRCC Help Centre: qnum 507, 508, 509, 513, 676, 755, 496, 497, 1632
- Federal Court: Singh v. Canada, 2022 FC 855
- IRCC Policy: Post-graduation work permit eligibility requirements
