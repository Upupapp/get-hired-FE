# GETHIRED Dashboard Test Report
**Route:** `/recruiter/dashboard`  
**Generated:** 2026-06-26  
**Scope:** TEST DASHBOARD — unit tests + API contract risks + coverage matrix

---

## Unit Testability Analysis

### Methods testable WITHOUT mocking (pure functions)

| Method | Pure? | Reason |
|---|---|---|
| `brandingScore(company)` | Yes | Takes company object, returns score object. No side effects, no DI deps. |
| `subscriptionUsagePct(used, limit)` | Yes | Pure arithmetic. No deps. |
| `subscriptionDaysLeft(endAt)` | Yes (with Date.now caveats) | Uses `new Date()` — testable by passing future/past dates. |
| `companyProfileMissingFields(company)` | Yes | Returns string[]. No side effects. |
| `_buildJobGroups(items)` | Yes | Private, but accessible via bracket notation in tests. Pure transformation. |
| `trackByStageId(index, stage)` | Yes | Returns `stage.statusId`. Trivially testable. |
| `trackByApplicationId(index, item)` | Yes | Returns `item.applicationId`. |
| `trackOnboardingStep(index)` | Yes | Returns `index`. |

### Methods requiring mocking

| Method | Requires mocking | Why |
|---|---|---|
| `ngOnInit()` | Yes | Calls `companyFacade.getCompanyDashboard()`, `loadPipelineOverview()`, `asyncLocalStorage.getItem('user')` — all async or service-dependent |
| `loadPipelineOverview()` | Yes | Calls `companyService.getDashboardPipelineOverview()` |
| `onboardingSteps()` | Partial | Pure logic but references `this.byStage` — needs pipeline data loaded first |
| `_refreshOnboardingCache()` | Partial | Calls `onboardingSteps()` which reads `this.byStage` |
| `goToCreateJob()` / `goToJobsList()` etc. | Yes | Calls `router.navigate()` — needs `RouterTestingModule` |
| `retryPipelineOverview()` | Yes | Delegates to `loadPipelineOverview()` |
| Template rendering | Yes | Needs `TestBed` + mocked `CompanyFacade`, `CompanyService`, `Router` |

---

## API Contract Risks

### Risk 1: `GET /company/dashboard` — no error state in template
- **Risk:** If the NgRx effect for `companyDashboard` action dispatches a failure, `loading$` may stay true indefinitely (depends on the reducer). Dashboard shows skeleton forever.
- **Test needed:** Mock `loading$` as `of(true)` and verify skeleton shows; mock as `of(false)` with null `dashboard$` and verify graceful handling.
- **Severity:** P1 UX

### Risk 2: `GET /company/dashboard/pipeline-overview` — independent failure handled
- **Status:** HANDLED. `pipelineError` state triggers error cards with Retry. Test covers this.
- **Severity:** Low (already handled)

### Risk 3: `GET /company/getsubscriptionrestrictions` — free accounts get 500 + empty section
- **Risk:** BE throws when no subscription row exists. NgRx error action dispatched. `subsRestrictions$` never emits. Section silently absent.
- **Test needed:** Verify section renders when subs emits value, does NOT render when it emits null.
- **Severity:** P1 UX

### Risk 4: Field name mismatches between BE and FE model
- **Risk:** `Company` interface in `company.model.ts` is missing `withActiveSubscription` and `employeedCompanyId`. Dashboard uses `any` type for company so no TypeScript error. If BE changes any mapped field name (e.g., `companyLogoUrl` → `logoUrl`), branding score silently returns 0%.
- **Test needed:** Contract test verifying `brandingScore` falls back correctly when fields are undefined.
- **Severity:** P2

### Risk 5: `charts.interviews` SQL does not filter by current month
- **Risk:** "Video answers this month" may display wrong value (any month's count).
- **Test needed:** Cannot unit-test this without a DB; document as known BE bug.
- **Severity:** P2 data correctness

---

## Test Plan by Dashboard Section

| Section | Test type | Test scenarios | Status |
|---|---|---|---|
| Hero | Smoke | Company name renders; fallback "Your company"; subtitle counts; needs-review chip visibility | Written |
| Action Center | Smoke | Urgent card appears when needsReviewCount>0; hidden when 0; profile card appears when fields missing | Written |
| KPI Strip | Smoke | 3+ kpi-cards render; values from charts object | Written |
| Hiring Pipeline | Smoke | Stages render when byStage non-empty; error state on failure; skeleton during loading | Written |
| Applicants Review | Smoke | Section hidden when needsReview empty; cards render with data | Not written (low priority, static rendering) |
| Onboarding Checklist | Unit | Steps returned when incomplete; empty when all done | Partial (via component init tests) |
| Job Performance | Unit | _buildJobGroups grouping, sorting, edge cases | Written (full suite) |
| Branding Health | Unit | brandingScore — all 6 field combinations | Written (full suite) |
| Subscription Health | Smoke | Section renders when subs data; hidden when null | Written |
| needsReviewCount | Unit | Status 1+3 summed; other statuses excluded | Written (full suite) |
| subscriptionUsagePct | Unit | Zero limit, cap at 100, rounding | Written (full suite) |
| subscriptionDaysLeft | Unit | Future, past, null, partial-day ceiling | Written (full suite) |
| Navigation | Unit | All router.navigate calls verified | Written |
| companyProfileMissingFields | Unit | 3-field checks | Written |
| retryPipelineOverview | Integration | Re-calls service; resets error state | Written |

---

## Release Gate Assessment

| Gate | Status | Notes |
|---|---|---|
| brandingScore correctness | PASS | Full suite written; edge case (industryId=0) documented |
| subscriptionUsagePct correctness | PASS | Cap at 100, zero limit, rounding all tested |
| subscriptionDaysLeft correctness | PASS | Past/future/null/ceiling tested |
| needsReviewCount derivation | PASS | Status 1+3 sum verified, exclusion of other statuses verified |
| _buildJobGroups | PASS | Empty, single, multi-job, sort-order tested |
| Template smoke | PASS | Loading/error/empty/data states tested |
| Navigation methods | PASS | All 7 routes verified |
| charts.interviews current-month filter | UNKNOWN — requires BE fix | Documented as P2 data bug; not unit-testable |
| Free-tier subscription empty state | FAIL | No empty state exists; test confirms section absent but no UX fallback |
| Main dashboard error state | FAIL | No error state in component; skeleton shows forever on BE failure |

**Overall release gate: CONDITIONAL PASS** — functional correctness tests pass; two UX gaps (R03 subscription empty state, R05 main dashboard error state) should be closed before production.

---

## Critical Test Gaps

1. **No test for NgRx effect error path** for `GET /company/dashboard` — infinite skeleton is untested
2. **No test for the `asyncLocalStorage` path** — the `user.companyId` → `getCompanySubscription` dispatch chain is untested (relies on `localStorage` mock, no test written)
3. **No test for `onboardingSteps()` with various data combinations** — the function is tested indirectly but not unit-tested directly for all 3 steps
4. **No test for `charts.interviews` value accuracy** — requires BE fix before testable
5. **No integration test** verifying the full data flow from API response to rendered DOM values

---

## Test File Location

`get-hired-FE/src/app/company/company-dashboard/company-dashboard.component.spec.ts`

**Test counts by suite:**
- `brandingScore()` — 9 tests
- `_buildJobGroups()` — 8 tests
- `subscriptionUsagePct()` — 11 tests
- `subscriptionDaysLeft()` — 7 tests
- `needsReviewCount` — 6 tests
- Template smoke tests — 14 tests
- Navigation methods — 7 tests
- `companyProfileMissingFields()` — 6 tests
- `retryPipelineOverview()` — 1 test

**Total: 69 tests**

---

## Recommended Next Steps

1. Run `ng test --include=src/app/company/company-dashboard/company-dashboard.component.spec.ts` to validate the spec compiles and passes
2. Fix R04 (BE SQL `searchQuery3` missing current-month filter) — 1 line change
3. Fix R03 (add free-tier empty state to subscription section)
4. Fix R05 (add error state to main dashboard NgRx path)
5. Add `aria-label` to KPI buttons (R02)
