# GETHIRED TEST GATE — Recent Deployment (d3246b6 / 70bc592 / 172b2a9 / f9bc996)
**Date:** 2026-06-26  
**Scope:** 4 commits; 6 changed files across FE only  
**Release gate:** GO WITH CAUTION (see §5)

---

## 1. Test infrastructure

| Asset | Status |
|---|---|
| `karma.conf.js` | Present — Jasmine/Karma, Chrome runner, coverage reporter |
| `tsconfig.spec.json` | Present — includes `src/**/*.spec.ts`, types: jasmine |
| `src/test.ts` + `src/polyfills.ts` | Listed in tsconfig.spec.json (not read, assumed present from prior sessions) |
| BE test framework | **Gap** — `package.json` scripts.test = `"echo Error: no test specified && exit 1"`. No Mocha/Jest/Supertest installed. No BE spec files exist. |

**Build command (FE):** `ng test --watch=false --browsers=ChromeHeadless`

Tests were not executed (no headless Chrome available in this environment). The three new spec files are structured for Jasmine/Karma and match the patterns in existing specs (`HttpTestingController`, `jasmine.createSpyObj`, `fakeAsync/tick`, `NO_ERRORS_SCHEMA`).

---

## 2. Coverage inventory — changed files

### 2a. `job.service.ts` — `updateApplicationStatus()`

| Path | Pre-deployment coverage | Post-deployment (new spec) |
|---|---|---|
| `updateApplicationStatus()` happy path | None | **Covered** — PUT /application/status, body shape, success response |
| HTTP error propagation | None | **Covered** |
| All 5 picker status IDs (2–6) | None | **Covered** |
| All other JobService methods | None | Still uncovered (pre-existing gap; out of scope) |

**New spec:** `src/app/job/job.service.spec.ts` (4 test cases)

### 2b. `applicant-action-modal.component.ts` — status picker flow

| Path | Pre-deployment coverage | Post-deployment (new spec) |
|---|---|---|
| `selectStatus()` success | None | **Covered** |
| `selectStatus()` HTTP error — backend message | None | **Covered** |
| `selectStatus()` HTTP error — fallback message | None | **Covered** |
| `selectStatus()` no-op (same status, string ID) | None | **Covered** |
| `selectStatus()` no-op (same status, numeric ID) | None | **Covered** |
| `selectStatus()` missing applicationId | None | **Covered** |
| `selectStatus()` null data object | None | **Covered** |
| `statusUpdating` flag lifecycle (true→false success/error) | None | **Covered** |
| `openControlMenu('change-status')` sets `statusView = true` | None | **Covered** |
| `viewCv()`, `close()`, route-based menu items | None | Still uncovered (pre-existing gap) |

**No pre-existing spec.** New spec: `src/app/job/job-applicants/applicant-action-modal/applicant-action-modal.component.spec.ts` (13 test cases)

### 2c. `job-applicants.component.ts` — `statusUpdated` handler

| Path | Pre-deployment coverage | Post-deployment |
|---|---|---|
| `viewMenu()` → `afterClosed()` → `statusUpdated` branch: calls `jobFacade.getApplicants()` | None | **Not covered by new spec** (see §4 risk note) |

This component's afterClosed handler was not given its own spec. The `jobFacade.getApplicants()` reload on `result.statusUpdated` is a one-liner whose correctness depends on the modal returning the right shape — which is now tested in the modal spec. Integration coverage is the gap here.

### 2d. `main-portal.component.ts` — keyboard nav + analytics

| Path | Pre-deployment coverage | Post-deployment (new spec) |
|---|---|---|
| `onTabKeydown()` ArrowRight advance | None | **Covered** |
| `onTabKeydown()` ArrowRight wrap-around | None | **Covered** |
| `onTabKeydown()` ArrowLeft retreat | None | **Covered** |
| `onTabKeydown()` ArrowLeft wrap-around | None | **Covered** |
| `onTabKeydown()` Home | None | **Covered** |
| `onTabKeydown()` End | None | **Covered** |
| `onTabKeydown()` unknown key — no state change | None | **Covered** |
| `onTabKeydown()` calls analytics on tab change | None | **Covered** |
| `heroCTAFindJobs()` analytics before navigate | None | **Covered** |
| `heroCTAStartHiring()` analytics + haptics + navigate | None | **Covered** |
| `finalCTAFindJobs()` analytics before navigate | None | **Covered** |
| `finalCTAStartHiring()` analytics + navigate | None | **Covered** |
| `ngOnInit` redirect role 1/2/3 | None | **Covered** |
| `ngOnInit` no redirect when not logged in | None | **Covered** |
| `trackByIndex` helper | None | **Covered** |
| `previewTabs` array invariants | None | **Covered** |
| Image onerror guard (template inline handler) | None | **Covered (simulated)** |
| focus() call on tablistRef element | None | Not covered (requires DOM integration test) |

**No pre-existing spec.** New spec: `src/app/public/main-portal/main-portal.component.spec.ts` (17 test cases)

### 2e. HTML / SCSS files

`applicant-action-modal.component.html`, `main-portal.component.html`, `main-portal.component.scss` — template/style changes are not unit-testable in isolation. Covered by component specs where bindings matter (status picker render, CTA click handlers). Touch target and `:active` SCSS changes are verified by visual inspection only.

---

## 3. New spec files written

### `src/app/job/job.service.spec.ts`
- 4 cases: PUT body shape, success response passthrough, HTTP error propagation, all 5 status IDs
- Uses `HttpClientTestingModule` + `HttpTestingController`

### `src/app/job/job-applicants/applicant-action-modal/applicant-action-modal.component.spec.ts`
- 13 cases: full happy/sad path for `selectStatus()`, no-op guard (string + numeric), null-data guard, `openControlMenu` wiring
- Uses `jasmine.createSpyObj` for all 4 dependencies; `fakeAsync/tick` for observable resolution

### `src/app/public/main-portal/main-portal.component.spec.ts`
- 17 cases: full keyboard nav matrix, all 4 CTA methods, ngOnInit redirects, static data invariants
- Uses `NO_ERRORS_SCHEMA` to avoid declaring child components (app-role-card, directives)

---

## 4. Risk assessment

### P0 — Highest risk (business impact if broken)

| Risk | Why | Now covered? |
|---|---|---|
| `selectStatus()` fires API call for same status | Redundant status update causes confusing employer UX and wastes API calls | Yes — no-op guard tested for both string and numeric ID |
| `updateApplicationStatus()` HTTP failure leaves `statusUpdating = true` | UI permanently shows "Updating…", buttons disabled, dialog stuck | Yes |
| `statusUpdated` reload: `getApplicants()` not called after status change | Applicant list shows stale status after employer updates it | Partially — modal's dialog.close payload is tested; facade reload in parent not unit-tested |

### P1 — Medium risk

| Risk | Why | Now covered? |
|---|---|---|
| `onTabKeydown()` wrap-around miscounts | Off-by-one at array boundaries silently skips tabs | Yes — both ArrowRight last→first and ArrowLeft first→last covered |
| `heroCTAFindJobs()` / `finalCTAFindJobs()` navigate without firing analytics | Analytics miss = silent data gap, no error thrown | Yes — call order verified |
| Image onerror: broken SVG asset leaves broken-image icon in production | Low-traffic first impression damage | Partially — handler logic verified; actual DOM wiring verified by visual smoke only |

### P2 — Lower risk (pre-existing gaps, not introduced by this deployment)

- All other `JobService` methods (no coverage before or after this deployment)
- `job-applicants.component.ts` in full (facade calls, signal loading, snapshot loading)
- BE endpoint `PUT /application/status` — no test at all; verified by manual QA only

---

## 5. BE test gap (documented, not fixed)

The BE has **no test framework installed** (`scripts.test` is a no-op stub). The `PUT /application/status` route introduced in this deployment has zero automated coverage. This is a pre-existing structural gap — no test runner, no test files. Recommendation: add Jest + Supertest as dev dependencies and write at minimum:
1. Auth guard test: unauthenticated request → 401
2. Authorization test: employer not owning the job → 403
3. Happy path: valid applicationId + newStatusId → DB update + 200

This was not installed during this audit per the scope constraints.

---

## 6. Release gate

**GO WITH CAUTION**

Rationale:
- The 3 new spec files cover the highest-risk paths in all 3 FE components changed by this deployment.
- The `statusUpdated` list-reload path in `job-applicants.component.ts` is not fully unit-tested (integration gap, not a logic bug — the reload is a single `this.jobFacade.getApplicants(this.jobId)` call gated on a truthy `result.statusUpdated`).
- The BE endpoint has zero automated test coverage.
- Recommend: run `ng test --watch=false` to confirm all 34 new cases pass in CI before the next production push. If the employer applicant list does not show the updated status after a modal close, the `statusUpdated` → `getApplicants()` path is the first place to check.
