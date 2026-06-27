# GetHired Dashboard V5 — Profile (Employer Profile Completeness) Report
**Date:** 2026-06-27 | **Component:** `company-dashboard`

---

## The 6-Field Profile Model

Both `brandingScore()` and (now) `companyProfileMissingFields()` check the same 6 fields in the same order:

| # | Field | Model key | Missing label (brandingScore) | Missing label (companyProfileMissingFields) |
|---|-------|-----------|-------------------------------|----------------------------------------------|
| 1 | Logo | `companyLogoUrl` | `'company logo'` | `'logo'` |
| 2 | Description | `companyDetails` | `'description'` | `'company description'` |
| 3 | Location | `companyCity` | `'location'` | `'location'` |
| 4 | Industry | `industryId` | `'industry'` | `'industry'` |
| 5 | Team size | `numberOfEmployee` | `'team size'` | `'team size'` |
| 6 | Contact number | `companyContactNumber` | `'contact number'` | `'contact number'` |

Note: the label strings differ between the two methods (e.g., `'company logo'` vs `'logo'`). This is intentional — `brandingScore().missing` is shown as chip labels in the branding card, while `companyProfileMissingFields()` output is shown in the Action Inbox "Missing: …" text. The difference is presentational.

---

## Pre-Fix State (Bug)

**Before this session**, `companyProfileMissingFields()` only checked 3 fields:

```typescript
// OLD — only 3 fields
if (!company.companyLogoUrl) { missing.push('logo'); }
if (!company.companyDetails) { missing.push('company description'); }
if (!company.companyCity) { missing.push('location'); }
```

This caused a discrepancy:

**Scenario:** Company has logo + description + city but no industry, team size, or contact number.

| Element | Result |
|---------|--------|
| `brandingScore()` | score = 50%, missing = `['industry', 'team size', 'contact number']` |
| Profile ring | Shows 50% ← correct |
| Profile checklist | Shows 3 unchecked items ← correct |
| **Action Inbox "Missing:" text** | **Shows nothing** (all 3 companyProfileMissingFields fields were present) ← wrong |
| **Recommended step** | Could show `post_first_job` instead of `complete_company_profile` (missingCount was 0, not ≥ 2) ← wrong priority |

The missing industry/team size/contact number were invisible to the Action Inbox and the recommended step engine.

---

## Post-Fix State ✓

```typescript
// NEW — all 6 fields
if (!company.companyLogoUrl) { missing.push('logo'); }
if (!company.companyDetails) { missing.push('company description'); }
if (!company.companyCity) { missing.push('location'); }
if (company.industryId == null) { missing.push('industry'); }
if (!company.numberOfEmployee) { missing.push('team size'); }
if (!company.companyContactNumber) { missing.push('contact number'); }
```

Now all three display surfaces (branding score, profile ring/checklist, action inbox) are derived from the same 6-field assessment. The recommended step engine correctly identifies when profile completion should be the top priority (`missingCount >= 2`).

---

## Profile Display Surfaces

| Surface | Source | Fields checked |
|---------|--------|---------------|
| Profile ring % (`cachedProfilePct`) | `brandingScore().score` | 6 fields |
| Branding card missing chips | `brandingScore().missing` | 6 fields |
| Profile checklist checkmarks | `dashboard.company.*` directly in template | 6 fields (hardcoded in HTML) |
| Action Inbox "Missing: …" desc | `cachedProfileMissingFields.join(', ')` | **Now 6 fields** (was 3) |
| Recommended step engine `missingCount` | `cachedProfileMissingFields.length` | **Now 6 fields** (was 3) |

All surfaces now consistently use a 6-field model.

---

## Edge Cases

| Case | Behavior |
|------|----------|
| `industryId = 0` | `0 == null` is `false` in JS → NOT treated as missing. If 0 is a valid "no industry" sentinel, the check is wrong. Currently no evidence 0 is used; DB column is nullable. |
| `numberOfEmployee = 0` | `!0` is `true` → treated as missing. If 0 employees is valid (solo founder), this may flag incorrectly. Recommend BE validation to enforce min 1 for this field. |
| `companyContactNumber = ''` | `!''` is `true` → treated as missing. Correct. |
| All 6 fields null | `missingCount = 6`, score = 0%, recommended step = `complete_company_profile` (high priority). Correct. |
| All 6 fields present | `missingCount = 0`, score = 100%, ring shows 100%, recommended step skips profile branch. Correct. |
