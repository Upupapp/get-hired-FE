# GetHired Dashboard V5 — Test Report
**Date:** 2026-06-27 | **Component:** `company-dashboard`

---

## What Exists (pre-session)

The pre-existing `company-dashboard.component.spec.ts` (826 lines) contained:

| Suite | Tests | State |
|-------|-------|-------|
| `brandingScore()` | 10 cases | Valid but missing `industryId=0` edge case |
| `_buildJobGroups()` | 6 cases | Valid, comprehensive |
| `subscriptionUsagePct()` | 11 cases | Valid and complete |
| `subscriptionDaysLeft()` | 8 cases | Valid |
| `needsReviewCount derivation` | 5 cases | Valid |
| Template smoke tests | 13 cases | **Stale** — used V4 CSS class names (`.emp-dash-*`) not V5 (`.gh-*`) |
| Navigation methods | 7 cases | Valid |
| `companyProfileMissingFields()` | 6 cases | **Stale** — expected only 3 fields, now checks 6 |
| `retryPipelineOverview()` | 1 case | Valid |

---

## What Changed (this session)

The spec was rewritten to align with V5:

1. **`companyProfileMissingFields()` tests** — expanded to cover all 6 fields (logo, company description, location, industry, team size, contact number). Old tests expected max 3 missing — now test up to 6.
2. **Added `_buildRecommendedStep()` suite** (§5) — tests all 6 priority branches:
   - `missingCount >= 2` → `complete_company_profile` (high)
   - `activeJobs === 0` → `post_first_job` (high)
   - `needsReviewCount > 0` → `review_applicants` (high)
   - `interviews > 0` → `review_video_answers` (medium)
   - `score < 80` → `improve_employer_brand` (low)
   - All clear → `all_caught_up` (success)
3. **Added `_computeJobViewsCache()` suite** (§6) — tests null/empty/current-month/prior-month filtering and conversion rate computation.
4. **Added `_computeCitiesCache()` suite** (§7) — tests null stat, flat array, nested object, and unrecognized shape.
5. **Removed V4 template smoke tests** — class selectors like `.emp-dash-hero-skeleton` no longer exist in V5 template. Replaced with structural smoke tests that don't depend on CSS class names.
6. **Added `SeoService` mock** — `ngOnInit` calls `setPageMeta()` so the mock is required.
7. **Clarified `industryId == null` semantics** — added test confirming `industryId: 0` does NOT trigger the "industry missing" flag (uses loose `== null`, not `=== null`).

---

## Coverage Assessment

| Area | Coverage | Notes |
|------|----------|-------|
| `brandingScore()` | High | All 6 fields, null guard, empty string edge cases |
| `companyProfileMissingFields()` | High | All 6 fields, combinations |
| `subscriptionDaysLeft()` | High | null/invalid/past/future/ceil behavior |
| `subscriptionUsagePct()` | High | Zero limit, over limit, rounding |
| `_buildRecommendedStep()` | High | All 6 branches |
| `_computeJobViewsCache()` | Medium | Null, empty, current/prior month, conversion rate |
| `_computeCitiesCache()` | High | Null, flat, nested, unknown shapes |
| `_buildJobGroups()` | High | Empty, null, grouping, sorting |
| `needsReviewCount` | High | Status 1+3 sum, exclusion of other statuses |
| Navigation methods | High | All 7 navigate calls |
| Template integration | Low | Smoke tests avoided; class names are unstable |
| `_buildSupportingActions()` | None | Not covered; should be added in next pass |
| Error states (subsError, pipelineError) | Partial | `pipelineError` retry tested; `subsError` not |
| `cachedHiringHealth` computation | None | Not directly tested; covered indirectly via needsReviewCount |

---

## Gaps Remaining

1. `_buildSupportingActions()` — no direct tests
2. `cachedHiringHealth` state transitions (good/attention/unknown)
3. `retrySubscription()` flow
4. `dashboard$` tap side effects (cachedBrandingScore, cachedProfilePct, cachedJobViewsThisMonth) via full observable integration test
5. Template integration tests — need E2E or Cypress to reliably test V5 class names
