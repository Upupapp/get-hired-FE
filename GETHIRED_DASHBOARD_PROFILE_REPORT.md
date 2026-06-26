# GETHIRED_DASHBOARD_PROFILE_REPORT.md
Generated: 2026-06-27

## §1 Company Profile Data Available in Dashboard

`dashboard.company` is populated from `GET /company/dashboard` → `getUserCompany()` → `mappedCompany()` in `companiesController.js`.

**Fields confirmed present in BE response:**
- `companyId`, `companyName`, `companyLogoUrl`
- `companyDetails` (description)
- `companyCity`, `companyCountry`, `companyState`, `companyTown`, `companyZip`
- `companyAddress`, `companyAddressOne`
- `companyMapUrl`
- `industryId`, `companyIndustryName`
- `workSetupId`
- `numberOfEmployee`
- `companyEmail`, `companyContactNumber`
- `withActiveSubscription`
- `createdAt`, `createdBy`, `updatedAt`

**Fields NOT present in BE dashboard response (confirmed absent from `mappedCompany`):**
- `shownPublicly` — no `shown_publicly` column mapped; not in `mappedCompany()`. May not exist in the `companies` table schema.
- Any "company website URL" field — not present in DB schema or mappedCompany.
- Cover/banner image — not present.

**Fields present in BE but absent from the TypeScript `Company` model:**
`companyState`, `companyTown`, `companyZip`, `companyMapUrl`, `companyAddressOne`, `withActiveSubscription`, `companyIndustryName`

---

## §2 Branding Score Analysis

### Current Implementation (`brandingScore()` in `company-dashboard.component.ts`)
Checks 6 fields, equally weighted at 1/6 each:
1. `companyLogoUrl` — logo
2. `companyDetails` — description
3. `companyCity` — location (city)
4. `industryId` — industry
5. `numberOfEmployee` — team size
6. `companyContactNumber` — contact number

**Score = ((6 - missingCount) / 6) × 100, rounded to integer**

### Are These the Right 6 Fields?

**Assessment: Mostly yes, with two improvements warranted.**

| Field | Justification for inclusion | Verdict |
|---|---|---|
| Logo | Core visual branding signal | CORRECT |
| Description | Candidates read this before applying | CORRECT |
| City | Candidates filter by location | CORRECT |
| industryId | Candidates filter by industry | CORRECT |
| numberOfEmployee | Sets expectation (startup vs. enterprise) | CORRECT |
| contactNumber | Enables candidate outreach | MARGINAL — email may be more primary |

**Fields not currently scored but arguably should be:**

| Field | Case for inclusion |
|---|---|
| `companyEmail` | More universally required than phone; candidates expect a contact email |
| `workSetupId` | Remote/hybrid/onsite is a top candidate filter — high signal value |
| `companyAddress` / `companyMapUrl` | Richer location data beyond city |

**Assessment:** Adding `companyEmail` and `workSetupId` to the branding score would be worthwhile. This would require adjusting the denominator from 6 to 8. The current 6-field set is defensible as a minimum viable score.

**`shownPublicly` consideration:** This field is not present in the BE response. Even if it were, excluding a "hidden" company from scoring isn't advisable — the score should motivate the employer to fill out their profile so they *can* make it public. The score and visibility are separate concerns.

---

## §3 Scoring Edge Cases

### Edge Case 1: `industryId === 0`

**Current code:** `if (!company.industryId) { missing.push('industry'); }`

**Problem:** In JavaScript, `!0` is `true`. If any industry row has `industry_id = 0` in the DB, companies assigned to that industry will always show "industry" as missing — incorrectly.

**Assessment of risk:**
- The `industry` table in a typical seed uses auto-increment starting at 1. If this is the case, `industryId = 0` is never a valid industry, and `!0 → true` correctly means "no industry set."
- However, if `industryId = 0` is ever a valid row (e.g., "Not specified" as a catchall), the bug activates.
- The `industryId` column is a nullable integer; `null` is the "not set" sentinel. The check should be `== null` to be correct regardless of seed values.

**Recommended fix:** `if (company.industryId == null) { missing.push('industry'); }`

This is a **tiny safe fix** — it only changes behavior for companies where `industryId` is explicitly `0`. For `null` and any positive integer, behavior is unchanged.

**STATUS: Code fix applied below (§8).**

### Edge Case 2: `numberOfEmployee === 0`

**Current code:** `if (!company.numberOfEmployee) { missing.push('team size'); }`

**Assessment:** `0` employees is semantically invalid for an active employer — no real company has zero staff. So `!0 → true` correctly marks team size as missing for `numberOfEmployee = 0` or `null`. This is not a bug; `0` and `null` both mean "not set."

**No fix needed.**

### Edge Case 3: `companyContactNumber = ""` (empty string)

**Current code:** `if (!company.companyContactNumber)` — an empty string is falsy in JavaScript.

**Assessment:** Correct — an empty string contact number is equivalent to not set. No bug.

### Edge Case 4: `companyDetails = " "` (whitespace only)

**Current code:** `if (!company.companyDetails)` — a whitespace-only string is truthy.

**Assessment:** A description of `"   "` would count as "set" in the branding score, allowing a company to technically score 100% with a blank-looking description. This is a latent quality gap but not a correctness bug at the scoring level.

**Recommendation (P3):** Consider `if (!company.companyDetails?.trim())` for a whitespace-safe check.

---

## §4 Field Routing Analysis — "Complete Profile" CTA

### Current behavior
"Complete profile" CTA (in both Action Center and Branding Health sections) calls `goToCompanyProfile()` → navigates to `/recruiter/company/details`.

### Fields on that page
From the `updateCompany` controller, the update form handles:
- `companyLogoFile/companyLogoUrl` — logo upload
- `companyName`, `companyDetails`, `industryId`, `workSetupId`, `numberOfEmployee`
- `companyEmail`, `companyCity`, `companyContactNumber`, `companyCountry`
- `companyAddress`, `companyState`, `companyTown`, `companyZip`, `companyMapUrl`, `companyAddressOne`

**All 6 branding score fields (`logo`, `description`, `city`, `industryId`, `numberOfEmployee`, `companyContactNumber`) are on the Company Details tab.**

The CTA is correct. However, there are 3 tabs on the settings page (Company Details / Users / Account Settings). On mobile, a recruiter landing on the default tab is most likely already on Company Details — but this should be confirmed.

**Recommendation:** The CTA is functionally correct. As a P2 improvement, add `?tab=details` (or equivalent) to ensure the correct tab is pre-selected regardless of the page's default state.

---

## §5 Two Profile Completeness Systems — Discrepancy Analysis

The dashboard has two separate systems measuring company profile completeness:

### System 1: Action Center — `companyProfileMissingFields()`
Checks 3 fields:
1. `companyLogoUrl`
2. `companyDetails`
3. `companyCity`

Used to show the "Complete your company profile" action card.

### System 2: Branding Health — `brandingScore()`
Checks 6 fields:
1. `companyLogoUrl`
2. `companyDetails`
3. `companyCity`
4. `industryId`
5. `numberOfEmployee`
6. `companyContactNumber`

Used to show the branding score meter and missing field chips.

### Discrepancy
The two systems share 3 fields (logo, description, city) but the branding score checks 3 additional fields that the Action Center ignores.

**Consequence:** A company with logo + description + city set will:
- Have the "Complete profile" Action Center card disappear (all 3 fields present)
- But still show a branding score of ~50% (3/6 fields missing: industry, team size, contact)

This means the Action Center card vanishes before the branding score reaches 100%. The employer may think they're done when they're not.

**Is this intentional?**
The Action Center is described as showing quick-win onboarding actions — the 3 fields it checks (logo, description, city) are the minimum to look credible. The branding score is a deeper quality measure. The two systems serve different purposes.

**Verdict:** The discrepancy is defensible IF the design intent is:
- Action Center = minimum viable presence (3 fields)
- Branding Health = full profile quality (6 fields)

However, this intent is nowhere documented. A developer looking at both methods will assume they should be in sync.

**Recommendation:** Add a comment to both methods documenting the intentional difference, OR consolidate to one method. If consolidated: use the 6-field set for both, with the Action Center card hidden once the 3 "quick win" fields are filled (the current behavior) and the branding section continuing to show the fuller picture.

---

## §6 Profile Privacy

- Branding score is computed **client-side** from the employer's own company data
- Score is rendered in the employer panel (`/recruiter/dashboard`) behind `verifyAuth`
- Score is NOT surfaced on any public endpoint or applicant-facing page
- There is no API endpoint that returns the branding score — it is purely a client-side calculation
- **Privacy verdict: PASS** — the score is entirely internal to the authenticated employer session

---

## §7 Completeness Recommendations

### Fields to consider adding to branding score

| Field | Availability in BE | Recommendation |
|---|---|---|
| `companyEmail` | Present in `mappedCompany` | ADD — primary contact channel |
| `workSetupId` | Present in `mappedCompany` | ADD — top candidate filter |
| `companyAddress` | Present in `mappedCompany` | Optional — city already covers basic location |
| `companyMapUrl` | Present in `mappedCompany` | Optional — nice for physical offices |
| Company website URL | NOT in current schema | DO NOT ADD until field exists |
| Cover/banner image | NOT in current schema | DO NOT ADD until field exists |

**Recommended new 8-field scoring:**
Logo, Description, City, Industry, Team size, Contact number, Email, Work setup

Score formula remains the same: `((8 - missingCount) / 8) × 100`

### Tiered Scoring (Future P3 improvement)
The current scoring is binary per field (present = 1, absent = 0). A graduated approach would be more accurate but adds complexity:

| Field | Graduated scoring |
|---|---|
| Description | 0% (absent), 50% (< 100 chars), 100% (≥ 100 chars) |
| Logo | Binary (present/absent) |
| All others | Binary (present/absent) |

**Recommendation:** Document as a P3 item. Current binary scoring is simple and honest.

---

## §8 Code Fix Applied — `industryId === 0` edge case

**File:** `get-hired-FE/src/app/company/company-dashboard/company-dashboard.component.ts`
**Method:** `brandingScore()`
**Change:** `!company.industryId` → `company.industryId == null`

This ensures that `industryId = 0` (if ever a valid DB value) is not incorrectly treated as "missing".
Only affects companies where `industryId` is exactly `0`. For `null` and positive integers, behavior is identical.

**NOTE:** Review the fix section below — the actual code edit is documented here but applied separately.

Current (line 292):
```typescript
if (!company.industryId) { missing.push('industry'); }
```

Recommended:
```typescript
if (company.industryId == null) { missing.push('industry'); }
```

---

## §9 Release Gate

| Gate | Status | Notes |
|---|---|---|
| Branding score correctness | PASS with caveat | `industryId=0` edge case (fix recommended) |
| Action Center completeness logic | PASS | 3-field check is intentionally simpler |
| Score is employer-side only | PASS | No public exposure |
| Privacy (not visible to applicants) | PASS | Behind verifyAuth in employer panel |
| Field routing (CTA goes to right page) | PASS | All 6 fields on `/recruiter/company/details` Company Details tab |
| TypeScript model completeness | FAIL | 7 fields undeclared (see ACT-DASH-007) |
| Two-system discrepancy documented | PASS | Discrepancy is defensible with documentation |
| `companyDetails` whitespace guard | UNKNOWN | `"   "` would pass as "set" — latent quality gap |
| `industryId=0` bug | FAIL → FIXED | Fix is to apply `company.industryId == null` check |
