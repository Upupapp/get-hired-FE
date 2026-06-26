# GETHIRED Dashboard Test Coverage Matrix
**Component:** `CompanyDashboardComponent`  
**Spec file:** `src/app/company/company-dashboard/company-dashboard.component.spec.ts`  
**Generated:** 2026-06-26

---

## Coverage Matrix

| Method / Section | Current Coverage | Recommended Test | Priority | Status |
|---|---|---|---|---|
| `brandingScore(company)` | 0% (no prior spec) | Unit: all 6 fields present; 0 fields; each field individually missing; null input; industryId=0 edge case | P1 | Written (9 tests) |
| `_buildJobGroups(items)` | 0% | Unit: empty array; null/undefined; single item; 3 same job; multiple diff jobs; sort desc; jobTitle taken from first item | P1 | Written (8 tests) |
| `subscriptionUsagePct(used, limit)` | 0% | Unit: limit=0; limit=null; used=0; 50%; 100%; used>limit caps at 100; rounding up; rounding down; large limits | P1 | Written (11 tests) |
| `subscriptionDaysLeft(endAt)` | 0% | Unit: null; undefined; empty string; past date returns 0; future date returns positive; 1 day ahead = 1; partial day ceiling | P1 | Written (7 tests) |
| `needsReviewCount` (property derived in `loadPipelineOverview`) | 0% | Unit: empty byStage = 0; status1 only; status3 only; status1+3 sum; other statuses not counted | P1 | Written (6 tests) |
| `companyProfileMissingFields(company)` | 0% | Unit: null; all fields; missing logo; missing desc; missing city; all missing | P2 | Written (6 tests) |
| Template — hero section | 0% | Smoke: company name renders; fallback text; subtitle KPI text | P1 | Written |
| Template — loading skeleton | 0% | Smoke: skeleton shows when loading$=true; hidden when false | P1 | Written |
| Template — action center urgent card | 0% | Smoke: urgent card visible when needsReviewCount>0; hidden when 0 | P1 | Written |
| Template — KPI strip | 0% | Smoke: kpi cards present; count matches | P1 | Written |
| Template — pipeline section | 0% | Smoke: stages render when byStage non-empty; error state when pipeline fails | P1 | Written |
| Template — subscription section | 0% | Smoke: renders when subsRestrictions$ emits; hidden when null | P1 | Written |
| Template — branding health section | 0% | Smoke: section renders when company data present | P2 | Written |
| `goToCreateJob()` | 0% | Unit: router.navigate called with correct path | P2 | Written |
| `goToJobsList()` | 0% | Unit: router.navigate | P2 | Written |
| `goToApplicants(jobId?)` | 0% | Unit: with jobId adds queryParams; without jobId goes to list | P2 | Written |
| `goToCompanyProfile()` | 0% | Unit: router.navigate | P2 | Written |
| `goToMessages()` | 0% | Unit: router.navigate to /recruiter/messages | P2 | Written |
| `goToSubscription()` | 0% | Unit: router.navigate | P2 | Written |
| `retryPipelineOverview()` | 0% | Integration: re-invokes service; error clears on success | P2 | Written |
| `onboardingSteps(company, charts)` | 0% | Unit: all done returns []; each step condition; step 3 depends on byStage | P2 | Not written |
| `_refreshOnboardingCache()` | 0% | Integration: cache updated after dashboard$ emit; after pipeline loads | P3 | Not written (called indirectly) |
| `trackByStageId()` | 0% | Unit: returns statusId | P3 | Not written (trivial) |
| `trackByApplicationId()` | 0% | Unit: returns applicationId | P3 | Not written (trivial) |
| `trackOnboardingStep()` | 0% | Unit: returns index | P3 | Not written (trivial) |
| `asyncLocalStorage.getItem('user')` path | 0% | Integration: mock localStorage with companyId; verify getCompanySubscription dispatched | P2 | Not written (requires localStorage mock) |
| NgRx error path for `companyDashboard` | 0% | Integration: error action → template shows error / stays loading | P1 | Not written |
| NgRx error path for `getCompanySubscription` | 0% | Integration: error → subscription section stays hidden (current behavior) | P2 | Not written |
| `charts.interviews` (BE SQL bug) | N/A — BE bug | Manual test / BE unit test for current-month filter | P2 | Bug documented; FE test not applicable |

---

## Coverage Summary by Priority

| Priority | Total methods/sections | Written | Not written |
|---|---|---|---|
| P1 | 11 | 9 | 2 (NgRx error paths) |
| P2 | 14 | 10 | 4 (onboarding steps, localStorage path, NgRx subs error, BE bug) |
| P3 | 4 | 0 | 4 (trivial trackBy functions, cache internals) |
| **Total** | **29** | **19** | **10** |

**Tests written:** 69 across 9 suites  
**Estimated coverage after running spec:** ~65% line coverage for `company-dashboard.component.ts`  
**Highest risk uncovered:** NgRx effect error path for main dashboard data load (infinite skeleton bug)

---

## Files Written

| File | Purpose |
|---|---|
| `get-hired-FE/src/app/company/company-dashboard/company-dashboard.component.spec.ts` | Main spec: 69 tests across 9 suites |
| `get-hired-FE/GETHIRED_DASHBOARD_SWEEP_REPORT.md` | Full sweep report (§1–§10) |
| `get-hired-FE/GETHIRED_DASHBOARD_TEST_REPORT.md` | Test plan, API contract risks, release gate |
| `get-hired-FE/GETHIRED_DASHBOARD_TEST_COVERAGE_MATRIX.md` | This file |
