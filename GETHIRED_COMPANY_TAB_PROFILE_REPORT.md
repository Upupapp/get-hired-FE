# GETHIRED COMPANY TAB — PROFILE REPORT
**Scope:** Employer Portal › Company Tab — employer-side company profile completeness
**Date:** 2026-06-26
**Note:** PROFILE command is primarily applicant-side intelligence. This report covers the employer-profile equivalent — company profile completeness and its downstream effect on applicant-facing signals.

---

## Company Profile Completeness Model

### Fields Available in DB

| Field | UI Label | Completeness Weight | Currently Tracked? |
|---|---|---|---|
| `company_name` | Company Name | Required | ✅ (form required) |
| `company_email` | Email | Required | ✅ (form required, Validators.email) |
| `company_logo` | Logo | High | ❌ Not tracked |
| `company_details` | Company Overview | High | ❌ Not tracked |
| `industry_id` | Industry | Medium | ❌ Not tracked |
| `work_setup_id` | Work Arrangement | Medium | ❌ Not tracked |
| `number_of_employee` | Team Size | Low | ❌ Not tracked |
| `company_address` | Address | Low | ❌ Not tracked |
| `company_email` | Contact Email | Medium | ❌ Not tracked |
| `company_contact_number` | Work Phone | Low | ❌ Not tracked |

### Fields NOT in DB (blocked)

| Field | Impact on Candidate Decisions | Status |
|---|---|---|
| Mission & Values | High — differentiation | Planned |
| Why Work With Us | High — conversion | Planned |
| Company Website | Medium — trust signal | Not planned |
| LinkedIn URL | Medium — credibility | Not planned |
| Founded Year | Low | Not planned |
| Perks & Benefits (structured) | High — offer comparison | Planned |

---

## Company Profile Score (Proposed)

A simple formula to show recruiters how complete their company profile is, as a percentage visible on the Company Tab:

```
Score = (filled fields / total weighted fields) × 100

Weights:
  companyName:       required (excluded from score, always present)
  companyLogo:       20 pts
  companyDetails:    25 pts
  industryId:        15 pts
  workSetupId:       15 pts
  companyEmail:      10 pts
  numberOfEmployee:   5 pts
  companyAddress:     5 pts
  companyContactNumber: 5 pts

Max: 100 pts
```

### Signal Downstream Chain

```
Company Profile Score
  └→ Public job card: shows company logo + overview snippet (if score > 60)
  └→ Candidate trust: companies with logos get 3× more applicant click-throughs (industry benchmark)
  └→ Match signals: companyDetails used in SEO + industry classification
  └→ Video badge: not gated on profile score
```

---

## Implementation Recommendation

Add a lightweight `CompanyProfileScoreComponent` inside the `cp-workspace`:
- Shows `X% complete` with a progress bar
- Lists what's missing with direct jump links to the relevant field
- Lives at the top of the Company Profile tab, hidden when score is 100%
- No new API calls — reads from the existing `company$` observable

This is the single highest-value UX improvement for the Company Tab (ACT-10 in ACTIONS report, RICE score 8).

---

## Applicant-Facing Impact

| Company Tab Action | Applicant Experience Impact |
|---|---|
| Logo uploaded | Job card shows logo → +trust |
| Overview filled | Company page shows description → candidates understand who's hiring |
| Industry set | Filters and match signals use this → better relevance |
| Work setup set | Job card work-setup badge → +candidate filter match |
| Address filled + shownPublicly | Location shown on job detail → candidates assess commute |
