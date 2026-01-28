# Provincial Differences for Work Permits

> **Version**: 1.0.0  
> **Last Updated**: 2026-01-28  
> **Source**: IRCC Operation Manuals, Provincial Government Websites

## Critical Rule

**ALL provincial-specific information MUST be verified via MCP tools at runtime.**

This document provides a framework for understanding provincial differences. Detective agent MUST use `operation_manual_semantic_search` and `help_centre_search` to verify current requirements before making assessments.

---

## 1. Provincial Nominee Program (PNP) Differences

### 1.1 Overview of Provincial Streams

| Province | Key Streams | Processing Priority | Notes |
|----------|-------------|---------------------|-------|
| **Ontario (OINP)** | Employer Job Offer, Masters Graduate, PhD Graduate, Human Capital Priorities | High volume | Largest PNP program |
| **British Columbia (BC PNP)** | Skills Immigration, Express Entry BC, Tech | Tech-focused | Tech Pilot popular |
| **Alberta (AINP)** | Alberta Opportunity Stream, Alberta Express Entry | Oil & gas focus | Economic conditions affect |
| **Saskatchewan (SINP)** | International Skilled Worker, Entrepreneur | Agriculture focus | Lower thresholds |
| **Manitoba (MPNP)** | Skilled Worker in Manitoba, Skilled Worker Overseas | Settlement focus | Strong retention |
| **Quebec** | Not PNP - CSQ required | Separate system | French language priority |
| **Atlantic Provinces** | Atlantic Immigration Program (AIP) | Employer-driven | Retention challenges |
| **Territories** | Limited programs | Case-by-case | Small quotas |

### 1.2 Key Provincial Differences

#### Ontario (OINP)

```yaml
streams:
  employer_job_offer:
    - Foreign Worker Stream
    - International Student Stream
    - In-Demand Skills Stream
  human_capital:
    - Masters Graduate Stream
    - PhD Graduate Stream
    - Human Capital Priorities (EE-linked)
    
key_requirements:
  - Job offer must be permanent, full-time
  - Wage must meet or exceed median for NOC
  - Employer must be in good standing
  
unique_features:
  - Expression of Interest (EOI) system
  - Points-based selection for some streams
  - Tech draws for specific NOCs
  
_detective_query: "operation_manual_semantic_search(query='Ontario PNP OINP requirements streams', size=5)"
```

#### British Columbia (BC PNP)

```yaml
streams:
  skills_immigration:
    - Skilled Worker
    - International Graduate
    - Entry Level and Semi-Skilled
  express_entry_bc:
    - Skilled Worker
    - International Graduate
    - Healthcare Professional
  tech:
    - BC PNP Tech (29 eligible occupations)
    
key_requirements:
  - Valid job offer from BC employer
  - Meet minimum wage thresholds by region
  - Language requirements vary by stream
  
unique_features:
  - Regional priorities (outside Vancouver)
  - Tech Pilot with faster processing
  - Healthcare professional priority
  
_detective_query: "operation_manual_semantic_search(query='British Columbia BC PNP requirements tech pilot', size=5)"
```

#### Alberta (AINP)

```yaml
streams:
  - Alberta Opportunity Stream
  - Alberta Express Entry Stream
  - Rural Renewal Stream
  - Tourism and Hospitality Stream
  
key_requirements:
  - Must be working in Alberta
  - Valid work permit or post-graduation work permit
  - Meet occupation and wage requirements
  
unique_features:
  - Economic conditions affect processing
  - Oil & gas sector considerations
  - Rural community priorities
  
_detective_query: "operation_manual_semantic_search(query='Alberta AINP opportunity stream requirements', size=5)"
```

#### Saskatchewan (SINP)

```yaml
streams:
  international_skilled_worker:
    - Employment Offer
    - Occupation In-Demand
    - Saskatchewan Express Entry
  entrepreneur:
    - Entrepreneur Stream
    - Farm Owner/Operator
    
key_requirements:
  - Points-based assessment (60/100 minimum)
  - Job offer or occupation in-demand
  - Settlement funds requirements
  
unique_features:
  - In-Demand Occupation List
  - Lower language requirements for some streams
  - Agricultural sector priorities
  
_detective_query: "operation_manual_semantic_search(query='Saskatchewan SINP skilled worker requirements', size=5)"
```

#### Manitoba (MPNP)

```yaml
streams:
  skilled_worker_in_manitoba:
    - Manitoba Work Experience Pathway
    - Employer Direct Recruitment Pathway
  skilled_worker_overseas:
    - Manitoba Express Entry Pathway
    - Human Capital Pathway
  international_education:
    - Career Employment Pathway
    - Graduate Internship Pathway
    
key_requirements:
  - Strong Manitoba connection preferred
  - Settlement Plan required
  - Language requirements (CLB 5-7 depending on stream)
  
unique_features:
  - Strategic Recruitment Initiative
  - Strong focus on retention
  - Community support letters valued
  
_detective_query: "operation_manual_semantic_search(query='Manitoba MPNP skilled worker requirements', size=5)"
```

#### Atlantic Immigration Program (AIP)

```yaml
participating_provinces:
  - New Brunswick
  - Nova Scotia
  - Prince Edward Island
  - Newfoundland and Labrador
  
streams:
  - Atlantic High-Skilled Program
  - Atlantic Intermediate-Skilled Program
  - Atlantic International Graduate Program
  
key_requirements:
  - Designated employer required
  - Settlement plan and needs assessment
  - Commitment to live in Atlantic Canada
  
unique_features:
  - Employer designation required
  - Settlement support mandatory
  - Retention focus
  
_detective_query: "operation_manual_semantic_search(query='Atlantic Immigration Program AIP requirements designated employer', size=5)"
```

---

## 2. LMIA Provincial Differences

### 2.1 Wage Requirements by Province

| Province | Median Hourly Wage (2024) | High-Wage Threshold | Low-Wage Threshold |
|----------|---------------------------|---------------------|-------------------|
| Ontario | ~$28.00 | >= Median | < Median |
| British Columbia | ~$28.85 | >= Median | < Median |
| Alberta | ~$29.50 | >= Median | < Median |
| Quebec | ~$26.00 | >= Median | < Median |
| Saskatchewan | ~$27.00 | >= Median | < Median |
| Manitoba | ~$25.00 | >= Median | < Median |
| Atlantic Provinces | ~$23-25 | >= Median | < Median |

**Note**: Wage thresholds change annually. Detective MUST verify current rates via Job Bank.

```
_detective_query: "help_centre_search(query='LMIA wage threshold provincial median 2024 2025', lang='en', top_k=5)"
```

### 2.2 Provincial LMIA Processing Differences

#### High-Wage vs Low-Wage Stream

```yaml
high_wage_stream:
  threshold: ">= provincial/territorial median hourly wage"
  requirements:
    - Transition Plan required
    - No cap on TFWs
    - 3-year LMIA validity possible
  
low_wage_stream:
  threshold: "< provincial/territorial median hourly wage"
  requirements:
    - Cap on TFWs (10-20% of workforce)
    - Transportation and housing requirements
    - 1-year LMIA validity maximum
    - Recruitment requirements stricter
```

### 2.3 Quebec-Specific Requirements

```yaml
quebec_differences:
  - CAQ (Certificat d'acceptation du Québec) required
  - LMIA processed by ESDC but CAQ by MIFI
  - French language considerations
  - Separate immigration agreement with federal government
  
process:
  1. Employer obtains positive LMIA from ESDC
  2. Worker applies for CAQ from Quebec
  3. Worker applies for work permit from IRCC
  
unique_requirements:
  - French language ability may be assessed
  - Quebec values and integration
  - Different selection criteria for permanent residence
  
_detective_query: "operation_manual_semantic_search(query='Quebec CAQ work permit LMIA requirements', size=5)"
```

---

## 3. Regional Pilot Programs

### 3.1 Rural and Northern Immigration Pilot (RNIP)

```yaml
participating_communities:
  - North Bay, ON
  - Sudbury, ON
  - Timmins, ON
  - Thunder Bay, ON
  - Sault Ste. Marie, ON
  - Brandon, MB
  - Altona/Rhineland, MB
  - Moose Jaw, SK
  - Claresholm, AB
  - West Kootenay, BC
  - Vernon, BC
  
requirements:
  - Job offer from employer in participating community
  - Community recommendation
  - Intent to live in community
  - Meet work experience and education requirements
  
_detective_query: "operation_manual_semantic_search(query='Rural Northern Immigration Pilot RNIP community requirements', size=5)"
```

### 3.2 Agri-Food Pilot

```yaml
eligible_industries:
  - Meat processing
  - Mushroom production
  - Greenhouse crop production
  - Livestock raising
  
eligible_occupations:
  - Retail butchers (NOC 63201)
  - Industrial butchers (NOC 94141)
  - Farm supervisors (NOC 82030)
  - General farm workers (NOC 85100)
  - Harvesting labourers (NOC 85101)
  
provincial_considerations:
  - Most positions in Ontario, Quebec, Alberta, BC
  - Provincial nominee streams may also apply
  
_detective_query: "operation_manual_semantic_search(query='Agri-Food Pilot work permit requirements NOC', size=5)"
```

---

## 4. Provincial Occupation Lists

### 4.1 In-Demand Occupations by Province

Each province maintains its own in-demand occupation list. Detective MUST verify current lists.

```yaml
verification_sources:
  ontario: "OINP In-Demand Skills occupation list"
  bc: "BC PNP eligible occupations list"
  alberta: "AINP eligible occupations"
  saskatchewan: "SINP In-Demand Occupation List"
  manitoba: "MPNP In-Demand Occupations"
  
_detective_query: "help_centre_search(query='provincial nominee in-demand occupation list 2024 2025', lang='en', top_k=5)"
```

### 4.2 Regulated Occupations

| Occupation Type | Provincial Regulation | Notes |
|-----------------|----------------------|-------|
| Healthcare (nurses, doctors) | Provincial licensing required | Each province has own college |
| Engineers | Provincial engineering association | P.Eng designation |
| Lawyers | Provincial law society | Must article in province |
| Teachers | Provincial certification | Varies significantly |
| Trades | Provincial apprenticeship | Red Seal for interprovincial |

---

## 5. Risk Assessment Considerations

### 5.1 Provincial Risk Factors

```yaml
risk_factors_by_province:
  ontario:
    - High competition for OINP spots
    - EOI score thresholds fluctuate
    - Tech sector saturation in GTA
    
  british_columbia:
    - High cost of living affecting wage compliance
    - Regional score differences
    - Tech Pilot occupation restrictions
    
  alberta:
    - Economic volatility (oil prices)
    - Processing delays during downturns
    - Occupation restrictions during high unemployment
    
  quebec:
    - CAQ processing adds time
    - French language requirements
    - Different immigration framework
    
  atlantic:
    - Retention concerns
    - Limited employer pool
    - Smaller quotas
```

### 5.2 Detective Query Templates

```yaml
provincial_verification_queries:
  pnp_requirements: |
    operation_manual_semantic_search(
      query='[PROVINCE] PNP requirements eligibility criteria',
      size=5
    )
    
  wage_thresholds: |
    help_centre_search(
      query='LMIA wage threshold [PROVINCE] median hourly',
      lang='en',
      top_k=5
    )
    
  occupation_list: |
    help_centre_search(
      query='[PROVINCE] in-demand occupation list eligible NOC',
      lang='en',
      top_k=5
    )
    
  processing_times: |
    help_centre_search(
      query='[PROVINCE] PNP processing time work permit',
      lang='en',
      top_k=5
    )
```

---

## 6. Integration with Audit Workflow

### 6.1 Intake Stage

- Identify province of intended work
- Flag if Quebec (CAQ required)
- Note if rural/northern community (pilot eligibility)

### 6.2 Detective Stage

- Verify provincial requirements via MCP
- Check current wage thresholds
- Confirm occupation eligibility for province

### 6.3 Strategist Stage

- Assess provincial-specific risks
- Consider alternative provinces if applicable
- Factor in processing time differences

### 6.4 Gatekeeper Stage

- Validate provincial documentation requirements
- Confirm provincial licensing if regulated occupation
- Check provincial nomination validity

---

## 7. Update Protocol

This document provides a framework only. All specific requirements MUST be verified at runtime because:

1. Provincial programs change frequently
2. Wage thresholds update annually
3. Occupation lists are revised regularly
4. Processing priorities shift based on economic conditions

**Detective agent MUST use MCP tools to verify current provincial requirements before making any assessment.**
