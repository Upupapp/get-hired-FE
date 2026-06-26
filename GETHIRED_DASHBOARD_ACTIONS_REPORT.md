# GETHIRED_DASHBOARD_ACTIONS_REPORT.md
Generated: 2026-06-27

## Overview

This report converts all known employer dashboard findings into a structured backlog.
Source findings: STITCH DASHBOARD report (ST-01 through ST-06) + in-code audit + prior session findings.

No code changes are made in this document. All items are documentation only.

---

## Roadmap Stages

**Stage 0 — Security & Correctness (ship-blocking)**
Fix any remaining BOLA or data-integrity gaps. The subscription BOLA is already closed,
but the FE still sends a dead `?companyId=` param that could confuse future developers.

**Stage 1 — Resilience (pre-launch quality bar)**
Add missing error states, fix BE type inconsistencies, clean dead code.

**Stage 2 — UX Improvements (post-launch polish)**
Upgrade CTA flows, add missing context (job dates, subscription upgrade nudge).

**Stage 3 — Future Features (backlog, no timeline)**
Analytics, candidate insights, activity feed, notification badges.

---

## P0 — Security / Correctness

### ACT-DASH-001
**Title:** Dead `?companyId=` query param in subscription service call  
**Category:** Security / Code hygiene  
**Problem:** `CompanyService.checkCompanySubscription(companyId)` appends `?companyId=${companyId}` to the URL. The BE controller (`getSubscriptionRestrictions`) ignores this param and derives `companyId` from the JWT. The param is dead but its presence implies that the BE trusts it — a future BE developer could re-introduce the BOLA bug by reading the route and expecting the param to be used.  
**User impact:** None currently (BOLA is closed at BE). Risk is future regression.  
**Technical impact:** Misleading API contract; dead code in service layer.  
**Scope:** FE only  
**Affected files:** `get-hired-FE/src/app/company/company.service.ts` line 20  
**Risk level:** LOW (no current user impact)  
**Priority:** P0 (preventive — avoids future security regression)  
**MoSCoW:** Must  
**Effort:** XS  
**Owner:** FE  
**Dependencies:** None  
**Acceptance criteria:** `checkCompanySubscription()` calls `GET /company/getsubscriptionrestrictions` with no query params. BE still derives companyId from JWT. Subscription section still renders correctly.  
**Suggested command:** Direct fix in `company.service.ts`

---

## P1 — Resilience / Quality

### ACT-DASH-002
**Title:** No user-facing error state when `GET /company/dashboard` fails  
**Category:** Resilience / UX  
**Problem:** The main dashboard data flow (`companyDashboard$ NgRx effect`) catches the HTTP error and dispatches `companyDashboardFail`. The `dashboard$` observable emits `null`. The template's `*ngIf="dashboard$ | async as dashboard"` silently renders nothing — no error message, no retry button. The loading skeleton also disappears (because `loading$` presumably resolves). The user sees a blank page with no explanation.  
**User impact:** A recruiter hitting a transient BE error sees a blank dashboard with no way to retry. They may think the app is broken.  
**Technical impact:** Silent failure; no observability for the user.  
**Scope:** FE only  
**Affected files:** `company-dashboard.component.html`, `company-dashboard.component.ts`  
**Risk level:** LOW (additive change, no breaking)  
**Priority:** P1  
**MoSCoW:** Should  
**Effort:** S  
**Owner:** FE  
**Dependencies:** Requires `error$` from `companyFacade.error$` (selector already exists in facade)  
**Acceptance criteria:** When `GET /company/dashboard` returns a 5xx error, the template shows an error card with a "Retry" button that re-dispatches `getCompanyDashboard()`. The retry card appears below the skeleton when loading is done and `dashboard$` is null.  
**Suggested command:** Inline fix — add `dashError$` property bound to `companyFacade.error$` and add error template block.

### ACT-DASH-003
**Title:** BE `graph()` and `cities()` return numeric `0` instead of `[]` when no rows  
**Category:** Bug / Contract  
**Problem:** In `company.service.js`, `graph()` returns `{ graph: applicants.rows ? applicants.rows : 0, jobViews: jobView.rows ? jobView.rows : 0 }` and `cities()` returns `{ cities: city.rows ? city.rows : 0 }`. When there are no rows, the value is the number `0`, not an empty array. Child components `<app-dashboard-charts>` and `<app-dashboard-statistics>` receive `details.graph = 0` or `details.jobViews = 0`. If either child uses `ngFor` or `.length`, it will fail silently or throw.  
**User impact:** Possible silent render failure in chart/statistics widgets for new companies with no data.  
**Technical impact:** Type inconsistency; `Rows` is always an array (even empty), so `? rows : 0` should be `? rows : []`.  
**Scope:** BE only  
**Affected files:** `get-hired-BE/services/company.service.js` lines 284-285, 311  
**Risk level:** LOW (fix is replacing `0` with `[]`)  
**Priority:** P1  
**MoSCoW:** Should  
**Effort:** XS  
**Owner:** BE  
**Dependencies:** None  
**Acceptance criteria:** `graph()` returns `{ graph: [], jobViews: [] }` and `cities()` returns `{ cities: [] }` when no DB rows. All existing behavior for non-empty results unchanged.  
**Suggested command:** Direct BE fix in `company.service.js`

### ACT-DASH-004
**Title:** Subscription section silently disappears on API failure — no error state  
**Category:** Resilience / UX  
**Problem:** When `getCompanySubscription` fails (e.g., no subscription, 500 error), `subsRestrictions$` emits nothing and `*ngIf="subsRestrictions$ | async as subs"` hides the entire section with no explanation. On a free plan without any subscription row, the section simply doesn't exist on the page.  
**User impact:** A recruiter on a free plan or during a subscription API outage sees no subscription section at all — they cannot navigate to the subscription page from the dashboard.  
**Technical impact:** Silent failure; "Manage subscription" link is completely absent.  
**Scope:** FE  
**Affected files:** `company-dashboard.component.html` lines 273-335  
**Risk level:** LOW  
**Priority:** P1  
**MoSCoW:** Should  
**Effort:** S  
**Owner:** FE  
**Dependencies:** None  
**Acceptance criteria:** If `subsRestrictions$` emits null/undefined (error case) OR if the company has no subscription, show a minimal "Subscription" section with a "Manage subscription" link and optionally a "No active plan" state indicator. The section must always render for authenticated users.  
**Suggested command:** Inline FE fix

### ACT-DASH-005
**Title:** `industryId` branding score check fails for industry ID of `0`  
**Category:** Bug / Edge case  
**Problem:** `brandingScore()` checks `!company.industryId` — if `industryId` is `0` (falsy in JavaScript), this evaluates to `true` (missing), even if `0` is a valid industry ID in the DB. Same issue in `onboardingSteps()` which is not affected (doesn't check industryId), but any future code using `!company.industryId` to gate on industry presence will have this bug.  
**User impact:** If industry ID 0 is a valid industry (e.g., "Not specified" as a real row), an employer who set their industry to 0 would see "industry" listed as missing in their branding score — incorrectly.  
**Technical impact:** The bug depends on whether industry ID 0 is a valid row in the DB. If the seed data starts IDs at 1, this is a latent (not currently triggered) bug. If any admin inserts an industry at ID 0, the branding score breaks for those companies.  
**Scope:** FE  
**Affected files:** `company-dashboard.component.ts` line 292  
**Risk level:** LOW (latent, depends on DB seed data)  
**Priority:** P1  
**MoSCoW:** Should  
**Effort:** XS  
**Owner:** FE  
**Dependencies:** Clarify whether industry_id=0 is valid in the DB seed  
**Acceptance criteria:** `brandingScore()` uses `company.industryId == null` (or `=== null || === undefined`) instead of `!company.industryId` for the industry check. The score changes only for companies with `industryId = 0`.  
**Suggested command:** Direct fix in `company-dashboard.component.ts`

### ACT-DASH-006
**Title:** All 4 KPI cards navigate to the same jobs list route  
**Category:** UX / Navigation mismatch  
**Problem:** All four KPI cards (`Active jobs`, `Applicants this month`, `Video answers this month`, `Needs review`) call `goToJobsList()` on click, navigating to `/recruiter/jobs/list`. "Video answers" should arguably navigate to a video responses view or at least to the interview hub. "Needs review" should navigate to `/recruiter/jobs/applicants` filtered to pending status.  
**User impact:** Clicking "Video answers" card takes the recruiter to the job list, not a video answers view — navigation intent mismatch.  
**Technical impact:** Minor — current route exists and loads without error.  
**Scope:** FE  
**Affected files:** `company-dashboard.component.html` lines 106-122, `company-dashboard.component.ts`  
**Risk level:** LOW  
**Priority:** P1  
**MoSCoW:** Should  
**Effort:** S  
**Owner:** FE  
**Dependencies:** Need to confirm which route shows video answers (interview hub?)  
**Acceptance criteria:** KPI card click routes are: `Active jobs` → `/recruiter/jobs/list`, `Applicants this month` → `/recruiter/jobs/list`, `Video answers` → `/recruiter/interview` (or `/recruiter/jobs/list` if no better route exists — document the decision), `Needs review` → `/recruiter/jobs/applicants`.  
**Suggested command:** Inline FE fix

### ACT-DASH-007
**Title:** TypeScript `Company` model missing 7 fields present in BE response  
**Category:** Type safety  
**Problem:** `company.model.ts` `Company` interface does not declare: `companyState`, `companyTown`, `companyZip`, `companyMapUrl`, `companyAddressOne`, `withActiveSubscription`, `companyIndustryName`. These fields are returned by `GET /company/dashboard` (via `mappedCompany`) and `GET /company/usercompany`. Any template access to these fields produces an Angular compiler warning (or error in strict mode).  
**User impact:** None currently (fields not used in dashboard template directly).  
**Technical impact:** Loss of type checking; future template access to these fields will not be caught by TypeScript.  
**Scope:** FE  
**Affected files:** `get-hired-FE/src/app/company/company.model.ts`  
**Risk level:** LOW  
**Priority:** P1  
**MoSCoW:** Should  
**Effort:** XS  
**Owner:** FE  
**Dependencies:** None  
**Acceptance criteria:** `Company` interface declares all 7 missing fields with correct types (string/number/boolean as appropriate). Optional (`?`) where the field may not be present (e.g., `companyIndustryName?: string`).  
**Suggested command:** Direct model update

---

## P2 — UX / Improvements

### ACT-DASH-008
**Title:** Subscription section has no upgrade CTA when limit is reached  
**Category:** UX / Business  
**Problem:** When `subscriptionUsagePct(subs.jobPostCount, subs.jobPost) >= 100`, the meter bar turns warning color but there is no call-to-action to upgrade. A recruiter who has used all their job post slots sees a red bar but no guidance.  
**User impact:** Missed conversion opportunity; recruiter doesn't know how to get more slots.  
**Technical impact:** None  
**Scope:** FE  
**Affected files:** `company-dashboard.component.html` lines 286-334  
**Risk level:** LOW  
**Priority:** P2  
**MoSCoW:** Could  
**Effort:** XS  
**Owner:** FE  
**Dependencies:** Subscription/upgrade route must exist  
**Acceptance criteria:** When any usage meter reaches 100%, show a "Upgrade plan" link/button that navigates to `/recruiter/subscription` (same as "Manage subscription").

### ACT-DASH-009
**Title:** Job Performance section title says "Jobs with applicants waiting" but doesn't show job status  
**Category:** UX / Context  
**Problem:** The "Jobs with applicants waiting" section shows job title and applicant count but not whether the job is still published/active. A recruiter might be confused seeing applicants on an expired job.  
**User impact:** Minor confusion if the job is expired — applicants are waiting but the job can't accept new ones.  
**Technical impact:** `cachedJobGroups` is derived from `needsReview` which is already fetched; job status would require either adding it to the pipeline query or a separate fetch.  
**Scope:** BE + FE  
**Affected files:** `get-hired-BE/services/company.service.js` (`needsReviewQuery`), `company-dashboard.component.html`  
**Risk level:** LOW  
**Priority:** P2  
**MoSCoW:** Could  
**Effort:** S  
**Owner:** BE + FE  
**Dependencies:** Requires adding `job_status_id` to `needsReviewQuery`  
**Acceptance criteria:** Each job row shows a status badge (Published / Expired / Draft). Jobs with expired status show a distinct style.

### ACT-DASH-010
**Title:** "Complete profile" branding CTA not specific about which tab contains missing fields  
**Category:** UX  
**Problem:** The branding health section's "Complete profile" CTA navigates to `/recruiter/company/details` which is the company settings page. There are 3 tabs: Company Details, Users, Account Settings. All 6 branding score fields (logo, description, city, industryId, numberOfEmployee, companyContactNumber) are on the Company Details tab. However, if a user visits the page without the tab pre-selected, they may not see immediately where to go on a mobile viewport.  
**User impact:** Minor — the CTA works but isn't maximally helpful.  
**Technical impact:** Route may support a fragment or query param to pre-select the tab.  
**Scope:** FE  
**Affected files:** `company-dashboard.component.ts` `goToCompanyProfile()` method  
**Risk level:** LOW  
**Priority:** P2  
**MoSCoW:** Could  
**Effort:** XS  
**Owner:** FE  
**Dependencies:** Confirm whether `/recruiter/company/details` accepts a tab fragment  
**Acceptance criteria:** "Complete profile" CTA navigates to the correct tab directly, or adds a `?tab=profile` query param that the settings component reads.

### ACT-DASH-011
**Title:** Pipeline bar chart has no y-axis labels or scale  
**Category:** UX / Accessibility  
**Problem:** The hiring pipeline section renders bars with heights proportional to `stage.count / pipelineBarMax`. The count is shown as a number above each bar, but there is no y-axis scale or baseline gridlines. The bar height is purely visual.  
**User impact:** Bars are hard to compare at a glance without a scale. The count labels mitigate this.  
**Technical impact:** None — the counts are shown numerically; the bars are a visual aid only.  
**Scope:** FE (CSS/HTML)  
**Affected files:** `company-dashboard.component.html`, `company-dashboard.component.scss`  
**Risk level:** LOW  
**Priority:** P2  
**MoSCoW:** Could  
**Effort:** S  
**Owner:** FE  
**Dependencies:** None  
**Acceptance criteria:** Pipeline bar chart has at minimum a thin baseline (zero line) and optionally 2-3 horizontal gridlines with count labels.

### ACT-DASH-012
**Title:** `subscriptionDaysLeft()` will silently return NaN if `endAt` is unexpected format  
**Category:** Robustness  
**Problem:** `subscriptionDaysLeft(endAt)` calls `new Date(endAt)`. If `endAt` is a non-parseable string, `new Date()` returns `Invalid Date` and the arithmetic produces `NaN`. The template would then show `NaN days remaining`.  
**User impact:** Rare — only if BE returns a malformed date. The `endAt` is computed by the BE from `created_at + N days` so it should always be a valid Date object serialized as ISO string.  
**Technical impact:** Silent display bug.  
**Scope:** FE  
**Affected files:** `company-dashboard.component.ts` `subscriptionDaysLeft()` method  
**Risk level:** LOW  
**Priority:** P2  
**MoSCoW:** Could  
**Effort:** XS  
**Owner:** FE  
**Dependencies:** None  
**Acceptance criteria:** `subscriptionDaysLeft()` returns `0` (not `NaN`) if `new Date(endAt)` produces an invalid date.

### ACT-DASH-013
**Title:** Getting Started Checklist collapses silently when all steps are complete  
**Category:** UX  
**Problem:** When all 3 onboarding steps are done, `onboardingSteps()` returns `[]` and the section hides. There is no "Congratulations" moment or confirmation that setup is complete. The section simply disappears.  
**User impact:** Minor. New employers completing setup may feel disoriented when the section vanishes.  
**Technical impact:** None  
**Scope:** FE  
**Affected files:** `company-dashboard.component.html` lines 184-211, `company-dashboard.component.ts` `onboardingSteps()`  
**Risk level:** LOW  
**Priority:** P2  
**MoSCoW:** Could  
**Effort:** XS  
**Owner:** FE  
**Dependencies:** None  
**Acceptance criteria:** When all steps are done, show a brief "You're all set up!" banner for one render cycle (or use localStorage to show it once then dismiss permanently).

---

## P3 — Future Features

### ACT-DASH-014
**Title:** Per-job view analytics on dashboard  
**Category:** Feature  
**Problem:** The `graph()` BE service already fetches `logs.activity_name = 'Job View'` but the dashboard template does not expose per-job view counts. The data exists but isn't surfaced.  
**User impact:** Recruiters can't see which specific jobs are getting the most views from the dashboard.  
**Priority:** P3 | Effort: M | MoSCoW: Won't (now)

### ACT-DASH-015
**Title:** Candidate city/geography section  
**Category:** Feature  
**Problem:** The BE returns `cities` data (top 5 applicant cities) but the FE passes it to `<app-dashboard-statistics>` without a dedicated display in the main dashboard.  
**User impact:** Recruiters can't quickly see where their applicants are located from the command-center dashboard.  
**Priority:** P3 | Effort: S | MoSCoW: Won't (now)

### ACT-DASH-016
**Title:** Recent activity feed on dashboard  
**Category:** Feature  
**Problem:** Interview hub data is available via `GET /interview/hub` but not surfaced on the dashboard. An activity feed showing "Candidate X submitted a video answer" would improve recruiter engagement.  
**Priority:** P3 | Effort: L | MoSCoW: Won't (now)

### ACT-DASH-017
**Title:** Unread message count badge  
**Category:** Feature  
**Problem:** The Messages action card always shows without an unread count. The `is_read` column is absent from the messages schema (known deferred item). Once that column exists, a badge could show unread count.  
**Priority:** P3 | Effort: M | MoSCoW: Won't (now) — blocked by schema gap

### ACT-DASH-018
**Title:** Trend arrows on KPI metrics  
**Category:** Feature  
**Problem:** KPI cards show current month counts but no comparison to previous month. A "↑ 12%" or "↓ 3%" indicator would add value.  
**Priority:** P3 | Effort: L (requires BE change for month-over-month data) | MoSCoW: Won't (now)

### ACT-DASH-019
**Title:** Export/share dashboard summary  
**Category:** Feature  
**Problem:** No way for a recruiter to export a snapshot of their hiring dashboard for reporting or sharing with management.  
**Priority:** P3 | Effort: XL | MoSCoW: Won't (now)
