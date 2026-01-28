# Provincial Nominee Program (PNP) Work Permits Audit Rules

**Source**: MCP Help Centre, Federal Court Case Law, IRCC Policy
**Last Updated**: January 2026

---

## 1. Definition & Overview

Provincial Nominee Program work permits are issued to foreign workers who have received a provincial nomination from a Canadian province as part of the PNP immigration pathway. These permits allow applicants to work in the nominated role while their permanent residence application processes. PNP work permits bridge temporary work status to permanent residence pathway.

### 1.1 Two-Stage Process

```
Stage 1: Provincial Nomination
├── Apply to province/territory
├── Meet provincial criteria
├── Receive Provincial Nominee Certificate
└── Province sets deadline for federal application

Stage 2: Federal PR Application
├── Express Entry stream OR Non-Express Entry stream
├── IRCC reviews for admissibility
├── Medical, security, background checks
└── PR visa issued
```

### 1.2 Key Distinction (Help Centre qnum 736)

| Stream | Process | Timeline |
|--------|---------|----------|
| Express Entry PNP | 600 CRS points boost, faster processing | 6-8 months |
| Non-Express Entry PNP | Paper-based application | 12-18 months |

---

## 2. Core Eligibility Criteria (Hard Requirements)

### 2.1 Valid Provincial Nomination

- Received provincial nomination from designated PNP province
- Nomination is current and valid (not expired or revoked)
- Applicant is named in nomination letter
- Nomination specifies:
  - Province and program stream
  - Occupational category
  - Nominated role
  - Employment or study-based pathway
- Nomination letter provided by IRCC-authorized provincial program

### 2.2 Eligible Occupation/Role

- Occupation matches provincial priority list
- Occupation classified under National Occupational Classification (NOC) code
- Occupational skill level meets province requirements (typically A/B or B/C)
- Role aligns with provincial economic needs
- Not on prohibited occupation list
- Experience level meets program requirements

### 2.3 Employer Relationship (Employment-Based PNP)

- Valid job offer from Canadian employer
- Employer located in nominating province
- Employer authorized by province
- Job duties match nominated role
- Wages meet provincial requirements
- Employment terms documented

### 2.4 Educational Requirements (Study-Based PNP)

- Degree/diploma from designated Canadian educational institution
- Program level meets requirements (typically post-secondary)
- Graduated within specified timeframe
- Relevant to nominated occupation
- Institution recognized by province

### 2.5 Work Experience Requirements

- Specified duration of relevant work experience:
  - Typically 1-3 years depending on program stream
  - May require Canadian experience or international
  - Experience must align with nominated role
  - Experience requirements met at time of nomination application

### 2.6 Admissibility

- No grounds for inadmissibility
- Security clearance
- Criminality assessment
- Medical examination if required
- No misrepresentation

---

## 3. Provincial Programs Overview

### 3.1 Major Provincial Programs

| Province | Program | Key Streams |
|----------|---------|-------------|
| **BC** | BC PNP | Skills Immigration, Express Entry BC |
| **Ontario** | OINP | Human Capital, Employer Job Offer |
| **Alberta** | AAIP | Alberta Opportunity, Alberta Express Entry |
| **Manitoba** | MPNP | Skilled Worker, International Education |
| **Saskatchewan** | SINP | International Skilled Worker, Experience |

### 3.2 Common Eligibility Requirements

| Requirement | Description |
|-------------|-------------|
| Job Offer | Valid offer from provincial employer |
| NOC Classification | Usually TEER 0/1/2/3 |
| Language | CLB 4-7 depending on stream |
| Education | Varies by stream |
| Work Experience | 1-3 years in relevant occupation |
| Settlement Funds | Proof of financial ability |

---

## 4. PNP Work Permit (Bridging)

### 4.1 Open Work Permit for PNP Nominees

**From Help Centre (qnum 176):**
> "If you have an open work permit under the provincial nominee class, you may only be able to work in a specific province."

**Key Features:**
- LMIA-exempt
- Province-restricted (must work in nominating province)
- Valid until PR decision or nomination expiry
- Allows work for any employer in the province

### 4.2 Eligibility for PNP Work Permit

| Requirement | Details |
|-------------|---------|
| Valid nomination | Provincial Nominee Certificate active |
| PR application submitted | Federal application in progress |
| Temporary status | Valid status in Canada (or concurrent application) |

---

## 5. Risk Assessment Framework

### 5.1 Category-Specific Risk Patterns

#### Pattern: NOMINATION_INVALID_OR_EXPIRED
- **Severity**: CRITICAL
- **Definition**: Provincial nomination is not valid or has expired
- **Indicators**:
  - Nomination letter expired
  - Nomination revoked by province
  - Nomination suspended
  - Applicant named on nomination but position filled by other
  - Nomination for different applicant
  - Province no longer accepts nominations
  - Nomination issued to different person with same name
- **Assessment Method**:
  - Nomination letter date verification
  - Provincial program verification
  - IRCC nomination database check
  - Applicant name verification on nomination
- **Recovery**: None if nomination expired; must reapply to provincial program

#### Pattern: OCCUPATION_NOT_ELIGIBLE
- **Severity**: CRITICAL
- **Definition**: Nominated occupation does not meet provincial eligibility requirements
- **Indicators**:
  - Occupation not on provincial priority list
  - NOC code changed/not eligible
  - Skill level insufficient (C/D level when A/B required)
  - Occupation on prohibited list
  - Applicant qualifications below occupational requirements
  - Experience does not match occupation
- **Assessment Method**:
  - Provincial occupation eligibility list verification
  - NOC code assessment
  - Skill level determination
  - Occupational requirements review
  - Applicant background against requirements
- **Recovery**: None if truly ineligible; must wait for eligible occupation

#### Pattern: PROVINCIAL_EMPLOYER_MISMATCH
- **Severity**: HIGH
- **Definition**: Employer is not located in nominated province or not authorized
- **Indicators**:
  - Job offer from employer in different province
  - Employer not registered with nominating province
  - Employer not authorized to hire through PNP
  - Work location in different province from nomination
  - Applicant will work remotely outside province
  - Employer previously denied PNP participation
- **Assessment Method**:
  - Employer location verification
  - Provincial employer registry check
  - Job offer location confirmation
  - Employer authorization status
- **Recovery**: Obtain job offer from authorized employer in nominated province, or provincial resubmission

#### Pattern: WORK_EXPERIENCE_INSUFFICIENT
- **Severity**: HIGH
- **Definition**: Applicant's work experience does not meet program requirements
- **Indicators**:
  - Experience < required threshold (e.g., < 1 year when 2 required)
  - Experience in unrelated field
  - Experience not at claimed level (entry-level when intermediate required)
  - Experience duration calculation error
  - Full-time status not met (part-time experience not counted)
  - Experience break/gap not explained
- **Assessment Method**:
  - Employment history verification
  - Work experience timeline analysis
  - Experience level assessment
  - Job duty alignment with nominated role
  - Reference letter verification
- **Recovery**: If recently met, reapply to provincial program; if persistent gap, work toward requirement

#### Pattern: EDUCATION_CREDENTIAL_NOT_RECOGNIZED
- **Severity**: HIGH
- **Definition**: Educational credential does not meet PNP requirements
- **Indicators**:
  - Degree/diploma from non-designated institution
  - Educational institution not recognized by province
  - Program does not meet program requirements
  - Credential level insufficient (certificate vs. diploma required)
  - International credential not assessed/recognized
  - Institution delisted from eligible institutions
  - Applicant did not complete program despite nomination
- **Assessment Method**:
  - Institutional eligibility verification
  - Credential assessment (WES, EVA)
  - Program relevance to nomination
  - Credentials recognition in province
- **Recovery**: Obtain assessment of international credentials, or complete additional education

#### Pattern: WAGE_BELOW_PROVINCIAL_REQUIREMENT
- **Severity**: MEDIUM-HIGH
- **Definition**: Job offer wage does not meet provincial minimum for nominated occupation
- **Indicators**:
  - Wage below provincial prevailing rate
  - Wage below skills-based requirement
  - Wage below regional minimum for occupation
  - Wage decrease from provincial standard
  - No benefits offset
  - Wage documentation fabricated or inflated
- **Assessment Method**:
  - Provincial wage requirement verification
  - Job offer wage comparison
  - Industry wage surveys
  - Benefits analysis
  - Wage documentation authentication
- **Recovery**: Employer increases wage offer to meet provincial minimum, resubmit

#### Pattern: PERMANENT_RESIDENCE_PATH_CONCERN
- **Severity**: MEDIUM
- **Definition**: Applicant appears to be using PNP work permit as permanent residence bridge without actual nomination pathway
- **Indicators**:
  - PNP work permit issued but PR application not filed concurrently
  - Significant delay between work permit issue and PR application
  - Multiple PNP work permits with no PR advancement
  - Nomination appears temporary or procedural only
  - Applicant pursuing other PR pathways while on PNP permit
  - Evidence of visa program stacking
- **Assessment Method**:
  - Nomination-to-PR pathway verification
  - PR application status check
  - Timeline analysis
  - Program requirements review
- **Recovery**: File PR application concurrently if available, or document pathway progression

#### Pattern: PROVINCIAL_PROGRAM_REQUIREMENTS_NOT_MET
- **Severity**: HIGH
- **Definition**: Applicant fails to meet specific provincial PNP stream requirements
- **Indicators**:
  - Language requirement not met (IELTS/TOEFL inadequate)
  - Educational attainment below requirement
  - Age requirement exceeded or not met
  - Adaptability factors insufficient
  - Points system score below threshold (if used)
  - Work authorization from origin country required but not provided
  - Background check issues specific to program
- **Assessment Method**:
  - Program-specific requirement verification
  - Language test score assessment
  - Educational qualification verification
  - Adaptability factors review
  - Background assessment
- **Recovery**: Improve qualifications (language testing, education) and reapply to program

#### Pattern: NOMINATION_OBTAINED_FRAUDULENTLY
- **Severity**: CRITICAL
- **Definition**: Provincial nomination obtained through fraud, misrepresentation, or bribery
- **Indicators**:
  - Nomination details inconsistent with applicant background
  - False credentials used in nomination application
  - Forged documents submitted to province
  - Bribery or corruption in nomination process
  - Applicant did not actually meet requirement at nomination
  - Phantom employer in nomination
  - Applicant information fabricated in nomination
- **Assessment Method**:
  - Nomination documentation verification
  - Document authenticity assessment
  - Applicant background investigation
  - Provincial review of nomination file
  - Reference verification
- **Recovery**: None if fraud established; work permit refused/revoked; potential fraud referral

---

## 6. High-Risk Patterns from Case Law

### 6.1 Baniya v. Canada, 2022 FC 18 - Job Offer Misrepresentation

**Facts:**
- Iraqi citizen applied under BC PNP
- Job offer from Vision Glass LTD (construction supervisor)
- LMIA approved November 2016
- BC PNP nomination May 2017
- PR application January 2018

**Investigation Findings:**
- Vision Glass not operating from listed address since 2016
- Website inactive since 2016
- No social media presence
- Applicant had no contact with employer for years
- Did not apply for work permit despite stated need

**Outcome:**
- BC PNP cancelled nomination
- IRCC found misrepresentation under s.40 IRPA
- 5-year inadmissibility

**Key Lessons:**
1. Job offer must be **genuine at time of PR application**
2. Maintain contact with employer throughout process
3. Company must be actively operating
4. Consider applying for work permit to demonstrate intent

### 6.2 Asanova v. Canada, 2020 FC 1173 - Procedural Fairness

**Facts:**
- Russian citizen applied under PEI PNP and AIPP
- Employment reference letters questioned
- Procedural fairness letter sent but vague

**Key Issue:**
- PF letter stated "information does not appear to be genuine"
- Did not specify which aspects were concerning
- Applicant couldn't meaningfully respond

**Outcome:**
- Decision set aside for procedural fairness breach
- Matter remitted for reconsideration

**Key Lessons:**
1. Procedural fairness letters must be specific
2. Applicant must know the case to meet
3. Vague concerns = unfair process

---

## 7. Provincial-Specific Risk Factors

### 7.1 BC PNP

| Risk Factor | Description | Mitigation |
|-------------|-------------|------------|
| Tech sector scrutiny | High volume of applications | Strong documentation |
| Employer verification | BC PNP investigates employers | Verify employer legitimacy |
| Salary requirements | Must meet prevailing wage | Document wage compliance |

**BC PNP Investigation Process:**
- Site visits to employer
- Verification of business operations
- Cross-reference with IRCC EVH

### 7.2 Ontario OINP

| Risk Factor | Description | Mitigation |
|-------------|-------------|------------|
| Job offer genuineness | Employer must demonstrate need | Business case documentation |
| NOC classification | Duties must match NOC | Detailed job description |
| Employer compliance | Must meet OINP requirements | Verify employer eligibility |

### 7.3 Alberta AAIP

| Risk Factor | Description | Mitigation |
|-------------|-------------|------------|
| Labour market need | Must demonstrate shortage | LMIA or exemption documentation |
| Settlement intent | Must intend to live in Alberta | Ties to Alberta evidence |
| Occupation demand | Must be in-demand occupation | Check Alberta occupation list |

### 7.4 Manitoba MPNP

| Risk Factor | Description | Mitigation |
|-------------|-------------|------------|
| Connection to Manitoba | Strong ties required | Family, education, work history |
| Settlement plan | Detailed plan required | Comprehensive settlement plan |
| Language requirements | CLB 5+ for most streams | Language test results |

### 7.5 Saskatchewan SINP

| Risk Factor | Description | Mitigation |
|-------------|-------------|------------|
| In-demand occupation | Must be on occupation list | Verify occupation eligibility |
| Points threshold | Must meet minimum points | Calculate points accurately |
| Work experience | Must be relevant | Document experience thoroughly |

---

## 8. Federal Stage Risk Factors

### 8.1 Admissibility Issues

| Issue | Impact | Frequency |
|-------|--------|-----------|
| Criminality | PR refused | Common |
| Medical inadmissibility | PR refused or conditional | Moderate |
| Security concerns | PR refused | Rare |
| Misrepresentation | 5-year ban | Increasing |

### 8.2 Job Offer Verification at Federal Stage

**IRCC Employment Verification Hub (EVH):**
- Investigates genuineness of job offers
- Cross-references with provincial investigations
- Can lead to misrepresentation findings

**From Baniya 2022 FC 18:**
> "The EVH concluded that it was highly probable that the employment offer with Vision Glass was not genuine."

### 8.3 Nomination Withdrawal/Cancellation

| Scenario | Impact |
|----------|--------|
| Province cancels nomination | PR application refused |
| Applicant no longer meets criteria | Nomination may be withdrawn |
| Employer issues discovered | Nomination cancelled |

---

## 9. Misrepresentation in PNP Context

### 9.1 Legal Framework

**IRPA s.40(1)(a):**
> "A permanent resident or a foreign national is inadmissible for misrepresentation for directly or indirectly misrepresenting or withholding material facts relating to a relevant matter that induces or could induce an error in the administration of this Act."

### 9.2 Common Misrepresentation Patterns

| Pattern | Description | Consequence |
|---------|-------------|-------------|
| Fake job offer | Job doesn't exist or not genuine | 5-year ban |
| Inflated experience | Overstated work history | 5-year ban |
| False documents | Forged reference letters | 5-year ban |
| Undisclosed facts | Hidden criminal history | 5-year ban |

### 9.3 Evidence Standard

**From Baniya 2022 FC 18:**
> "Findings of misrepresentation must be made on the basis of clear and convincing evidence."

**Factors Considered:**
- Results of IRCC/provincial investigations
- Employer verification findings
- Applicant's response to PF letter
- Documentary evidence

---

## 10. Common Refusal Patterns

### PNP Work Permit Refusal Decision Codes

1. **Invalid provincial nomination**
   - Nomination expired
   - Nomination revoked
   - Applicant not identified in nomination
   - Nomination issued to different applicant

2. **Occupation ineligibility**
   - Occupation not on provincial list
   - Occupational requirements not met
   - Applicant qualifications insufficient
   - Experience mismatch

3. **Employer ineligibility**
   - Employer not authorized
   - Employer location not in nominated province
   - Employer not recognized
   - Employment terms not approved

4. **Work experience inadequacy**
   - Experience below requirements
   - Experience not in nominated field
   - Experience duration incorrect
   - Experience level insufficient

5. **Educational requirement not met**
   - Credential not recognized
   - Educational institution not designated
   - Credential level insufficient
   - International credential not assessed

6. **Admissibility concerns**
   - Security issues
   - Criminality issues
   - Health examination required but not completed
   - Misrepresentation in PNP application

---

## 11. Document Checklist

### 11.1 Baseline Documents (Required)
- Valid passport
- Provincial nomination letter (original)
- Nomination confirmation from IRCC
- Medical examination (if required)
- Police certificate (if applicable)
- Job offer letter (employment-based PNP):
  - From authorized provincial employer
  - Signed by authorized representative
  - Job details matching nomination
- Educational credential (study-based PNP):
  - Official diploma/degree from designated institution
  - Official transcript
  - Graduation certificate
- Work experience documentation:
  - Employment letters
  - Pay stubs
  - Tax records (T4 or foreign equivalent)
  - Reference letters
- NOC code classification verification
- Language test results (if applicable)

### 11.2 Province-Specific Documents

**Alberta PNP**:
- Alberta Immigrant Nominee Program (AINP) approval letter
- Proof of Alberta job offer
- Employer authorization documentation

**British Columbia PNP**:
- BC Provincial Nominee Program approval letter
- BC employer authorization
- Job location in BC verification

**Ontario PNP**:
- Ontario Immigrant Nominee Program (OINP) approval letter
- Ontario employer information
- Skills matching documentation

**Manitoba PNP**:
- Manitoba Provincial Nominee Program approval letter
- Manitoba job offer
- Employer authorization

**Saskatchewan PNP**:
- Saskatchewan Immigrant Nominee Program (SINP) approval letter
- Saskatchewan employment details
- Employer authorization

**Quebec PNP**:
- Quebec Parrainage (sponsorship) approval
- Quebec employer validation
- French language requirement documentation

### 11.3 Live Documents (Obtainable)
- Updated passport if close to expiration
- Current employment contract confirmation
- Updated work experience documentation
- Updated language test results (if expiring)
- Medical exam (if expiring)
- Police certificate (if expiring)
- Employer confirmation of continued employment

### 11.4 Strategic Documents
- Letter from employer confirming:
  - Genuine employment opportunity
  - Position matching nomination
  - Commitment to provincial employer standards
  - Permanent residence sponsorship (if applicable)
  - Wage and benefits documentation
  - Job security/long-term prospects
- Provincial program compliance letter:
  - Confirmation of program requirements met
  - Adaptability factors if applicable
  - Community ties (if required)
  - Housing plan documentation
- Education documentation (study-based):
  - Official transcript showing successful completion
  - Diploma/degree certificate
  - Educational credential assessment (WES, EVA) for international credentials
  - Proof of relevance to occupation
- Work experience documentation:
  - Detailed employment letters showing duties, level, wage
  - Reference letters from supervisors
  - Performance evaluations
  - Professional association memberships
- Proof of ties:
  - Job permanence indicators
  - Housing in province
  - Family ties (if any)
  - Community involvement documentation
  - Language proficiency (if required)
- Permanent residence application (if concurrent):
  - PR application receipt
  - Processing timeline documentation
  - Proof of PNP pathways to permanent residence

---

## 12. Audit Checklist for PNP Applications

### 12.1 Provincial Stage

- [ ] Valid job offer from eligible employer
- [ ] Employer meets provincial requirements
- [ ] NOC classification correct
- [ ] Salary meets prevailing wage
- [ ] Work experience documented
- [ ] Language test results valid
- [ ] Education credentials assessed

### 12.2 Federal Stage

- [ ] Provincial nomination valid and active
- [ ] Job offer still genuine
- [ ] Employer still operating
- [ ] Contact maintained with employer
- [ ] No admissibility issues
- [ ] Medical exam completed
- [ ] Police certificates obtained

### 12.3 Red Flags to Address

| Red Flag | Mitigation |
|----------|------------|
| Employer not responding | Document attempts to contact |
| Business address changed | Verify new location |
| Long processing time | Maintain employer relationship |
| Employer under investigation | Consider alternative options |

---

## 13. MCP Search Patterns for PNP Cases

### 13.1 Case Law Searches

```
# Job offer genuineness
caselaw_keyword_search(query="provincial nominee program PNP work permit refusal", court="fc")

# Misrepresentation
caselaw_keyword_search(query="provincial nominee misrepresentation job offer genuine", court="fc")

# Nomination cancellation
caselaw_keyword_search(query="PNP nomination cancelled withdrawn", court="fc")
```

### 13.2 Help Centre Searches

```
# PNP process
help_centre_search(query="provincial nominee program PNP work permit", lang="en")

# Express Entry PNP
help_centre_search(query="provincial nominee Express Entry", lang="en")
```

---

## 14. Case Law References

### Key Federal Court Jurisprudence

**Nomination Validity - Verification Mandatory (High Confidence)**
- Officer must verify nomination with provincial program
- Nomination is gateway; if invalid, work permit must be refused
- Expired nomination is absolute bar to work permit
- Nomination cannot be substituted by other eligibility criteria

**Occupational Eligibility - Strict Construction (High Confidence)**
- NOC code requirement strictly applied
- Occupational mismatch is refusal ground even if similar skills
- Provincial occupation priority list is determinative
- Applicant must meet, not nearly meet, occupational requirements

**Employer Authorization - Mandatory Verification (High Confidence)**
- Officer must verify employer authorization with province
- Unauthorized employer makes work permit ineligible
- Location requirement in province strictly enforced
- Telecommuting outside province defeats eligibility

**Permanent Residence Pathway - Not Discretionary (Medium Confidence)**
- PNP work permit is pathway to permanent residence
- Applicant must proceed with PR application within reasonable time
- Delays may indicate misuse of program
- Officer may assess whether permanent residence pathway genuine

**Work Experience Assessment - Objective Standard (High Confidence)**
- Work experience duration requirement is objective and mandatory
- Applicant must document years worked
- Full-time equivalence required for part-time experience
- Field of work must match or be recognized as equivalent

### Risk Assessment Impact

**High Risk Thresholds**
- Nomination approaching expiry = timeline verification required
- Recent nomination (< 6 months) = early stage of process, higher scrutiny
- Employer new to PNP (< 1 year) = employer verification enhanced
- Wage at provincial minimum threshold = documentation required

**Medium Risk Thresholds**
- Work experience barely meeting requirement = documentation required
- Transition from study to employment-based = pathway verification
- International credential assessment pending = timeline confirmation
- PR application not yet filed = pathway confirmation required

---

## 15. Policy Code Mapping

### IRPA/IRPR References
- **R200(1)**: Base work permit eligibility
- **R206**: Provincial nominee work permits
- **R206(1)**: Nomination requirement
- **R206(2)**: Nomination validity
- **R205**: Conditions on work permit validity

### Operational Manual (IP 16)
- **Chapter 16.6**: Provincial Nominee Program
- **Section 16.6.1**: PNP work permit eligibility
- **Section 16.6.2**: Nomination verification
- **Section 16.6.3**: Occupation and experience assessment
- **Section 16.6.4**: Employment-based vs. study-based streams
- **Section 16.6.5**: Provincial program requirements
- **Section 16.6.6**: Assessment procedures

### Provincial Program References
- **Alberta Immigrant Nominee Program (AINP)**
  - Occupational priority list
  - Employer authorization requirements
  - Work experience criteria

- **British Columbia Provincial Nominee Program (BC PNP)**
  - Occupational category requirements
  - BC employer standards
  - Regional variations

- **Ontario Immigrant Nominee Program (OINP)**
  - Occupational qualification standards
  - Employer verification procedures
  - Educational credential requirements

- **Manitoba Provincial Nominee Program (MPNP)**
  - Occupational priority categories
  - Employer eligibility
  - Community ties requirements

- **Saskatchewan Immigrant Nominee Program (SINP)**
  - Occupation-specific requirements
  - Employer authorization
  - Language requirements

- **Quebec Parrainage (Sponsorship)**
  - French language requirement
  - Employer validation procedures
  - Occupational classification

### Risk Badge System
- `PNP_NOMINATION_INVALID_EXPIRED` - Nomination not valid
- `PNP_OCCUPATION_INELIGIBLE` - Occupational requirements not met
- `PNP_EMPLOYER_NOT_AUTHORIZED` - Employer not PNP-authorized
- `PNP_PROVINCIAL_MISMATCH` - Employer/work location not in province
- `PNP_WORK_EXPERIENCE_INSUFFICIENT` - Experience below requirement
- `PNP_EDUCATION_NOT_RECOGNIZED` - Credential not recognized
- `PNP_WAGE_INADEQUATE` - Wage below provincial minimum
- `PNP_NOMINATION_FRAUDULENT` - Fraud in nomination process

---

## 16. Key Takeaways

### 16.1 Fatal Issues

1. **Nomination cancelled** - No basis for PR application
2. **Job offer not genuine** - Misrepresentation finding
3. **Employer not operating** - Job offer invalid
4. **Inadmissibility** - Criminal, security, health grounds

### 16.2 High-Risk but Mitigable

1. **Long processing time** - Maintain employer contact
2. **Employer changes** - Document and update IRCC
3. **Provincial investigation** - Cooperate fully
4. **Documentation gaps** - Provide comprehensive evidence

### 16.3 Best Practices

1. **Verify employer legitimacy** - Before accepting job offer
2. **Maintain contact** - Regular communication with employer
3. **Document everything** - Keep records of all interactions
4. **Consider work permit** - Apply for bridging work permit
5. **Monitor nomination** - Ensure it remains valid
6. **Respond promptly** - To any IRCC/provincial requests

---

## 17. Provincial Comparison Table

| Aspect | BC PNP | OINP | AAIP | MPNP | SINP |
|--------|--------|------|------|------|------|
| Express Entry | Yes | Yes | Yes | No | Yes |
| Job Offer Required | Most streams | Most streams | Most streams | Some streams | Some streams |
| Min Language | CLB 4-7 | CLB 6-7 | CLB 4-5 | CLB 5-7 | CLB 4-7 |
| Processing Time | 2-3 months | 2-4 months | 3-6 months | 6-12 months | 2-3 months |
| Investigation Risk | HIGH | MEDIUM | MEDIUM | LOW | LOW |

---

## 18. Verification Checklist

**Must Verify Before Approving**:
- [ ] Provincial nomination: Valid nomination letter from authorized program
- [ ] Nomination not expired: Issue date within validity period
- [ ] Applicant identified: Applicant name matches nomination exactly
- [ ] Occupation eligible: Nominated occupation on provincial list
- [ ] Employer authorized: Employment-based nominates must verify employer
- [ ] Provincial location: Work location in nominated province
- [ ] Work experience: Experience meets provincial requirements
- [ ] Education: Credential recognized by province (if study-based)
- [ ] Admissibility: Security, criminality, health, misrepresentation cleared
- [ ] Wage compliance: Wage meets provincial minimum for occupation

**High-Confidence Indicators of Legitimacy**:
- Original provincial nomination letter with government seal
- IRCC confirmation of nomination receipt
- Employer authorization document from provincial program
- Employment contract clearly showing provincial location
- Work experience letters on employer letterhead with specific duties/dates
- Educational credential from institution on provincial approved list
- Official transcript with graduation confirmation
- Provincial employer documentation confirming job offer terms

---

## 19. Provincial Variation Notes

Each province has specific requirements that may vary:

### Stream Types
- **Express Entry-linked streams** (AB, BC, ON, MB, SK): Points-based, experience-based
- **Direct occupancy programs** (all provinces): Direct application to province
- **Study-to-immigration streams** (most provinces): Pathway for graduates
- **Employer-sponsored streams** (all provinces): Job-specific nomination

### Timeline Considerations
- Nomination validity: Typically 12-18 months
- Work permit duration: Typically aligned with PR processing timeline
- PR application window: Must be filed within nomination validity period

### Language Requirements
- English/French minimum: Typically IELTS 6.0 or CLB 6
- Quebec requirement: French language higher standard
- Occupational language needs: Some professions require higher proficiency

---

## Sources

- IRCC Help Centre: qnum 176, 449, 736
- Federal Court: Baniya v. Canada, 2022 FC 18
- Federal Court: Asanova v. Canada, 2020 FC 1173
- IRPA Section 40 (Misrepresentation)
- Provincial program websites (BC PNP, OINP, AAIP, MPNP, SINP)

## See Also

- [hard_eligibility.md](hard_eligibility.md) - General work permit requirements
- [LMIA.md](LMIA.md) - LMIA-based work permits (alternative pathway)
- [fraud_risk_flags.md](fraud_risk_flags.md) - Document and employment fraud indicators
- [refusal_patterns.md](refusal_patterns.md) - Historical refusal reasons
- [risk_badges.json](risk_badges.json) - Risk classification system
