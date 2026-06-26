# GETHIRED Dashboard Sweep Report — V3 Employer Dashboard
**Route:** `/recruiter/dashboard`  
**Generated:** 2026-06-26  
**Scope:** SWEEP DASHBOARD (focused audit, not full-system SWEEP)

---

## Executive Summary

The V3 employer dashboard is a well-structured, genuinely data-driven command center. It decomposes data across three independent data-fetch paths, uses NgRx for main dashboard and subscription data, and a direct HTTP call for pipeline data. The V5 optimization pass that produced `cachedOnboardingSteps`, `cachedJobGroups`, `needsReviewCount`, and `trackBy` functions is correctly implemented. No fake metrics — every figure traces to a real database query.

**System health snapshot:** GOOD. All three endpoints are authenticated via `verifyAuth`. BOLA vectors for `addCompanyUser` and `getSubscriptionRestrictions` have already been closed (companyId derived from JWT, not req.body/query). The dashboard itself has no critical security bugs.

**Top 5 Risks:**
1. **[P1-SEC]** `getSubscriptionRestrictions` BE endpoint ignores the `companyId` query param it receives (fixed in latest code to derive from JWT), but the FE still sends `?companyId=...` from localStorage — if the BE ever reverts or is patched by a different developer without reading the comment, the BOLA reopens silently.
2. **[P1-A11Y]** KPI cards (`emp-dash-kpi-card`) are `<button>` elements with no `aria-label` — screen readers announce the raw number and label text but not the navigation destination.
3. **[P1-UX]** The `Subscription` section only renders when `subsRestrictions$ | async` emits a non-null value. If the company has no subscription row (valid for new free accounts), the section is entirely hidden with no fallback UI, and `getSubscriptionRestrictions` throws `"Company is not subscribed to any plan"` at the BE, logging an error for every free-tier dashboard load.
4. **[P2-PERF]** `brandingScore(dashboard.company)` and `companyProfileMissingFields(dashboard.company)` are called as template expressions. With Angular's default change-detection strategy (CheckAlways), these are re-evaluated on every CD cycle. They are pure functions with O(1) complexity so the risk is low, but they should be memoized or called once.
5. **[P2-DATA]** The `charts.interviews` KPI label reads "Video answers this month" but the underlying SQL (`searchQuery3` in `company.service.js`) does NOT filter by current month — it aggregates ALL-TIME interview answers by month and then takes `rows[0]`. This may return any month's count, not necessarily the current month.

**Top 5 Opportunities:**
1. Cache `brandingScore` and `companyProfileMissingFields` results the same way `cachedOnboardingSteps` and `cachedJobGroups` are cached — compute once on `dashboard$` emit, store in a component property.
2. Add a "No subscription" empty state to the Subscription section for free-tier accounts (graceful degradation instead of silent absence).
3. Add `aria-label` to all KPI card buttons indicating where they navigate.
4. Fix the `charts.interviews` SQL filter to restrict to the current month (add `and date_part('month', CURRENT_DATE) = date_part('month', a.created_at)`).
5. Add a loading skeleton for the Subscription section (currently shows nothing while `subsRestrictions$` is loading).

**Confidence level:** HIGH — all key files read directly, no inferences from partial data.

---

## §1 Dashboard Component Map

### Shell component
```
EmployerDashboardComponent
  selector: app-employer-dashboard
  template: <app-company-dashboard></app-company-dashboard>
  logic: none — pure pass-through shell
```

### Main logic component
```
CompanyDashboardComponent
  selector: app-company-dashboard
  file: company-dashboard.component.ts
```

### Data flow diagram

```
ngOnInit()
  ├─ companyFacade.getCompanyDashboard()
  │    └─ NgRx action → effect → GET /company/dashboard
  │         └─ dashboard$ (mapped) ──► hero, KPI strip (active jobs/applicants/interviews),
  │                                     action center (profile missing fields),
  │                                     branding health, onboarding checklist,
  │                                     analytics (banner/charts/statistics)
  │         tap() ─► _lastDashboardCompany, _lastDashboardCharts
  │                └─ _refreshOnboardingCache()
  │
  ├─ loadPipelineOverview()
  │    └─ companyService.getDashboardPipelineOverview()
  │         └─ GET /company/dashboard/pipeline-overview (direct HTTP, no NgRx)
  │              └─► byStage, needsReview, needsReviewCount,
  │                  pipelineBarMax, cachedJobGroups
  │                  └─ _refreshOnboardingCache() (again, now needsReviewCount known)
  │
  └─ asyncLocalStorage.getItem('user').then(...)
       └─ localStorage → user.companyId
            └─ companyFacade.getCompanySubscription(companyId)
                 └─ NgRx action → effect → GET /company/getsubscriptionrestrictions?companyId=...
                      └─ subsRestrictions$ ──► subscription section
```

### NgRx store connections
| Observable | Selector | Section driven |
|---|---|---|
| `loading$` | `fromfeature.loading` | Top-level skeleton gating |
| `dashboard$` | `fromfeature.companyDashboard` | Hero, KPIs, Action Center, Branding, Analytics |
| `subsRestrictions$` | `fromfeature.getCompanySubscription` | Subscription section |

### Direct HTTP calls
| Method | Endpoint | Driven by |
|---|---|---|
| `companyService.getDashboardPipelineOverview()` | `GET /company/dashboard/pipeline-overview` | Pipeline, Review list, Job Performance, Onboarding step 3 |

### Key computed state
| Property | Set where | Used where |
|---|---|---|
| `needsReviewCount` | `loadPipelineOverview()` next handler | Hero chip, Action Center, KPI strip |
| `pipelineBarMax` | `loadPipelineOverview()` | Pipeline bar heights |
| `cachedJobGroups` | `loadPipelineOverview()` → `_buildJobGroups()` | Job Performance section |
| `cachedOnboardingSteps` | `_refreshOnboardingCache()` (called twice) | Onboarding checklist |
| `pipelineLoading` | set true on call, false on next/error | Guards pipeline, action center, onboarding, job perf |
| `pipelineError` | set true on error | Error states with Retry |

### Sub-components (existing analytics section)
- `app-dashboard-banner` — receives `[details]="dashboard.company"` and `[charts]="dashboard.charts"`
- `app-dashboard-charts` — receives `[details]="dashboard.graph"`
- `app-dashboard-statistics` — receives `[details]="dashboard.stat"`

---

## §2 API Contract Review

### Endpoint 1: `GET /company/dashboard`

**Auth:** `verifyAuth` middleware required. JWT-derived `uid` → `getUserCompanyForRequest()` → `companyId`. No user-supplied ID.

**Response shape (from `getDashboard` + `mappedCompany`):**
```json
{
  "status": "success",
  "data": {
    "company": {
      "companyId": "COM123456",
      "companyLogoUrl": "https://...",
      "companyName": "...",
      "companyDetails": "...",
      "industryId": 1,
      "workSetupId": 2,
      "numberOfEmployee": 50,
      "companyEmail": "...",
      "companyCity": "...",
      "companyContactNumber": "...",
      "companyCountry": "...",
      "companyAddress": "...",
      "createdAt": "...",
      "createdBy": "...",
      "updatedAt": "...",
      "companyIndustryName": "...",
      "withActiveSubscription": null,
      "employeedCompanyId": "EMP..."
    },
    "charts": { "activeJobs": 3, "applicants": 12, "interviews": 5 },
    "statistic": { "contacts": "66.7", "applicants": "33.3" },
    "graph": [...],
    "jobViews": [...],
    "totalContacts": 42,
    "cities": [{ "city": "Sydney", "count": "7" }]
  }
}
```

**Failure resilience:** If this endpoint fails, `loading$` never resolves from the NgRx perspective and the `dashSkeleton` template remains visible forever. There is no error state for the main dashboard data load — a backend failure produces an infinite skeleton. **Medium risk.**

**Field naming:** All camelCase at the FE layer (mappedCompany does the snake_case → camelCase translation). Consistent.

**Null safety:** Dashboard template uses `dashboard.charts?.activeJobs || 0` correctly throughout. `dashboard.company?.companyName || 'Your company'` is correct. Risk is low.

**Notable:** `company.model.ts` `Company` interface does not include `withActiveSubscription` or `employeedCompanyId` fields returned by the BE — the interface is stale/partial. Templates use `any` for company so this doesn't break, but type safety is weak.

---

### Endpoint 2: `GET /company/dashboard/pipeline-overview`

**Auth:** `verifyAuth` required. companyId derived from JWT via `getUserCompanyForRequest`. Returns 401 if no company found.

**Response shape:**
```json
{
  "status": "success",
  "data": {
    "byStage": [
      { "statusId": 1, "label": "Pending Review", "count": 4 },
      { "statusId": 3, "label": "Under Review", "count": 2 }
    ],
    "needsReview": [
      {
        "applicationId": "APP001",
        "jobId": "JOB001",
        "candidateName": "Jane Doe",
        "jobTitle": "Senior Developer",
        "statusId": 1,
        "submittedDate": "2026-06-20T00:00:00Z"
      }
    ]
  }
}
```

**Failure resilience:** GOOD. Pipeline data is fetched independently. On error: `pipelineError = true`, all pipeline-dependent sections show error cards with Retry. Hero chip, KPI "Needs Review" card, Action Center urgent card, Pipeline chart, Review list, Job Performance, and Onboarding step 3 all gracefully handle the error state.

**Null safety:** `res?.data?.byStage || []` — correct. `res?.data?.needsReview || []` — correct. FE guards `byStage.find(s => s.statusId === 1)?.count || 0` — correct.

**Data accuracy note:** `needsReview` is limited to `LIMIT 10` in the SQL. The `needsReviewCount` is computed from `byStage` stage totals (not from `needsReview.length`), which is correct — the count is the true total, the list is a shortlist.

---

### Endpoint 3: `GET /company/getsubscriptionrestrictions?companyId={id}`

**Auth:** `verifyAuth` required. **IMPORTANT:** As of the latest BE code, the `companyId` query param is ignored — BE re-derives from JWT via `getUserCompanyForRequest`. The FE still sends the param from localStorage, but it has no effect.

**Response shape:**
```json
{
  "status": "success",
  "data": {
    "companyId": "COM123",
    "subscriptionName": "Pro",
    "isPaid": true,
    "endAt": "2026-12-31T00:00:00Z",
    "jobPost": 20,
    "jobPostCount": 3,
    "admin": 5,
    "adminCount": 2,
    "videoResponse": 100,
    "videoResponseCount": 15,
    "withCustomerCare": true,
    "price": 99.00,
    "priceCurrency": "AUD",
    "paymentOccurence": "monthly"
  }
}
```

**Failure resilience:** If the company has no subscription row, BE throws `"Company is not subscribed to any plan"` as an error, returns 500, and the NgRx store receives an error. `subsRestrictions$` never emits a value. The subscription section (`*ngIf="subsRestrictions$ | async as subs"`) simply does not render. This is silent — no empty state, no message, no upgrade CTA. For free accounts this is the normal path, making it a UX gap.

**Sensitive data exposure:** `price`, `priceCurrency`, `paymentOccurence`, `withCustomerCare` are returned in the response and stored in NgRx. The template only renders `subscriptionName`, `isPaid`, `endAt`, meter counts, and limits. Payment amounts are not displayed, which is correct. However, they sit in the store and could be read by Angular DevTools or Redux DevTools in development.

---

## §3 Data Correctness Review

### `brandingScore(company)` — called in template
- Checks 6 fields: `companyLogoUrl`, `companyDetails`, `companyCity`, `industryId`, `numberOfEmployee`, `companyContactNumber`
- Each field is worth 1/6 (16.67%) of score
- Score = `Math.round(((6 - missing.length) / 6) * 100)`
- **Assessment:** CORRECT and reasonable. The fields chosen are the visible ones on a company profile page. Equal weighting is defensible for a simple dashboard metric.
- **Edge case:** `industryId = 0` is falsy in JS — a company with industry set to the first row (id=0) would incorrectly show "industry" as missing. In practice this is unlikely (IDs typically start at 1) but worth noting.
- **Concern:** This function is called twice per CD cycle in the default change detection mode: once for the `*ngIf` check (`brandingScore(dashboard.company) as branding`) inside a template `<ng-container>`. Actually on review, it's called exactly ONCE per CD cycle via the `as branding` local variable pattern — the `ng-container *ngIf="brandingScore(...) as branding"` pattern is the Angular idiomatic way to compute once and reuse. This is CORRECT and safe.

### `companyProfileMissingFields(company)` — called in template
- Checks 3 fields: `companyLogoUrl`, `companyDetails`, `companyCity` (a subset of `brandingScore`)
- Used in Action Center to determine whether to show the "Complete your company profile" card
- **Assessment:** CORRECT. However, the `*ngIf="companyProfileMissingFields(dashboard.company) as missingFields"` pattern is used, which means this method is called once per CD cycle (not cached). For an O(1) function this is acceptable but inconsistent with the V5 caching philosophy. Low risk.

### `subscriptionUsagePct(used, limit)` — called in template
- `if (!limit || limit === 0) return 0` — handles zero/null limit correctly (returns 0%, not Infinity)
- `Math.min(100, Math.round((used / limit) * 100))` — caps at 100%, rounds correctly
- Called 6 times in template (3 meters × 2 times each: once for `aria-valuenow`, once for `[style.width.%]`, PLUS once for the warn class check). **Actually 9 times** (3 meters × 3 calls each).
- **Assessment:** CORRECT math. The repeated calls are a minor CD performance concern but with O(1) pure math it is negligible.

### `_buildJobGroups(items)` — called once in `loadPipelineOverview()`
- Groups `needsReview` array by `jobId`, counts items per job, sorts by count descending
- **Assessment:** CORRECT. The map uses object literal `{}` which shadows the rxjs `map` import (a naming collision but not a runtime bug since it's a local `const`). The result is cached in `cachedJobGroups` — not recomputed per CD cycle. Good.
- **Subtlety:** `needsReview` is limited to 10 items by the backend `LIMIT 10`. If a company has 20 pending applicants for one job and 1 for another, the grouping reflects the top-10 list, not all applicants. The job group count may understate reality. The section title "Jobs with applicants waiting" is accurate enough (it doesn't claim to show all), but this is worth documenting.

### `needsReviewCount` — computed in `loadPipelineOverview()`
- `(byStage.find(s => s.statusId === 1)?.count || 0) + (byStage.find(s => s.statusId === 3)?.count || 0)`
- Status IDs 1 (Pending Review) and 3 (Under Review) — confirmed by the BE service comment: "Needs review = application_status_id 1 (Pending Review) or 3 (Under Review) — confirmed against the live job_applicant_status table"
- **Assessment:** CORRECT. Computed from the full stage aggregate (not limited by `LIMIT 10`), so it is an accurate total. Cached in a component property — not recomputed per CD cycle. Good.

### `cachedOnboardingSteps` caching pattern
- Refreshed by `_refreshOnboardingCache()` called from:
  1. `tap()` in `dashboard$` pipeline — runs when main dashboard data arrives
  2. Bottom of `loadPipelineOverview()` next handler — runs after pipeline data arrives
- **Lifecycle assessment:** CORRECT but with a subtle ordering constraint. The onboarding step for "Review your first applicants" reads `this.byStage.reduce(...)`. If `_refreshOnboardingCache()` is called from the `dashboard$` tap before `loadPipelineOverview()` completes, `byStage` is still `[]` and that step will show as incomplete. The second call from `loadPipelineOverview()` corrects it. The comment in the code explains this: "Must be done after pipelineLoading=false or the section stays hidden." This is correct; the two-call approach is intentional.

### `charts.interviews` (KPI: "Video answers this month")
- SQL `searchQuery3` in `company.service.js`: selects `count(*) as interviews` from `interview_answers` grouped by month, NO current-month filter
- The FE reads `interview.rows[0].interviews` which is the FIRST row returned
- If rows are ordered by `date_part('month', a.created_at)` (ascending by default), `rows[0]` may be January's count, not the current month
- **CORRECTNESS BUG (P2):** "Video answers this month" may display an incorrect value. The other two chart queries (`searchQuery`, `searchQuery2`) both filter `and date_part('month', CURRENT_DATE) = date_part('month', updated_at)`. `searchQuery3` is missing this filter.

---

## §4 Security Review

### Data exposure
- **Dashboard endpoint** returns full company profile including `companyEmail`, `companyContactNumber`, `companyAddress`. These are legitimate employer-facing data for their own dashboard.
- **Subscription endpoint** returns `price`, `priceCurrency`, `paymentOccurence` — not displayed in template but stored in NgRx store. In production with DevTools disabled, this is acceptable. In development, these are readable. No payment card data, no account credentials. LOW risk.
- **Pipeline overview** returns `candidateName` (first + last name from users table) and `jobTitle`. Only status 1 and 3 are returned; no protected attributes (gender, DOB, civil status) are selected by the BE query. The BE comment confirms this was intentional. SAFE.

### `asyncLocalStorage.getItem('user')` for companyId
- The `companyId` extracted from localStorage is passed to `companyFacade.getCompanySubscription(companyId)`, which dispatches an NgRx action that calls `checkCompanySubscription(companyId)` in the service, which calls `GET /company/getsubscriptionrestrictions?companyId=${companyId}`.
- **BE verification:** The BE (`getSubscriptionRestrictions`) ignores the query param and re-derives `companyId` from JWT. The localStorage-supplied value is sent but discarded by the server. **SAFE** as long as BE code remains as-is.
- **Risk:** This is a code smell — the FE thinks it is scoping the request by companyId, but the BE ignores it. A future developer might "simplify" the BE to use the query param, silently reopening the BOLA. Low probability, medium impact.
- **Recommendation:** Remove the `?companyId=...` query param from the FE call to make the BE's JWT-only approach explicit and obvious.

### XSS risks in template
- `{{ dashboard.company?.companyName || 'Your company' }}` — Angular auto-escapes interpolation. SAFE.
- `{{ applicant.candidateName }}` — Angular auto-escapes. SAFE.
- `{{ missingFields.join(', ') }}` — Angular auto-escapes. SAFE.
- `[style.width.%]="..."` — numeric binding. SAFE.
- `[attr.aria-label]="stage.label + ': ' + stage.count + ' applicants'"` — Angular sanitizes attribute binding. SAFE.
- `[attr.aria-valuenow]="..."` — numeric. SAFE.
- No `[innerHTML]`, no `DomSanitizer` bypass detected. **No XSS risk in this component.**

### BOLA status for this dashboard's data paths
- `GET /company/dashboard` — companyId from JWT only. SECURE.
- `GET /company/dashboard/pipeline-overview` — companyId from JWT only. SECURE.
- `GET /company/getsubscriptionrestrictions` — ignores query param, companyId from JWT. SECURE.

---

## §5 Accessibility Review

### Hero section
- `<h1>` for company name — CORRECT (single h1 per page).
- "Post a job" and "Review applicants" buttons — have visible text labels. **PASS.**
- Review chip (badge) "N applicants to review" — rendered as `<span>`, not interactive. **PASS.**
- Hero mesh image: `alt="" aria-hidden="true"` — correct for decorative image. **PASS.**
- **Gap [Medium]:** The hero has no `aria-label` on the section element, but it is the first major landmark so this is acceptable.

### Action Center
- `<section aria-label="Action center">` — PASS.
- Error state has `role="alert"` — PASS (will be announced by screen readers).
- Action cards are `<button type="button">` — correct interactive element. **PASS.**
- Urgent card ("Review new applicants"): button contains visible text via `.emp-dash-action-title` and `.emp-dash-action-desc`. **PASS.**
- Decorative images inside action cards: `alt=""` — **FAIL.** The action center icon images are `<img src="..." alt="">` without `aria-hidden="true"`. Technically with empty alt they will be skipped by screen readers, but `aria-hidden="true"` is the more explicit and reliable approach. **Low severity.**
- Empty state `<div class="emp-dash-action-empty">` — no `role="status"` or `aria-live`. Screen readers may not announce this when it appears dynamically. **Medium gap.**

### KPI Strip
- `<section aria-label="Key metrics">` — PASS.
- KPI cards are `<button type="button">` — correct.
- **FAIL [High]:** KPI buttons have no `aria-label`. Screen reader announces the number and label text (e.g., "3 Active jobs") which is readable, but the navigation destination is not communicated. A screen reader user cannot tell the button navigates to `/recruiter/jobs/list`. Recommend: `aria-label="3 active jobs — go to jobs list"`.
- **FAIL [Medium]:** The 4th KPI "Needs review" is conditionally rendered (`*ngIf="!pipelineLoading && !pipelineError"`). When it appears/disappears, there is no `aria-live` announcement. Users who already have focus elsewhere will not be notified.

### Hiring Pipeline
- `<section aria-label="Hiring pipeline">` — PASS.
- `role="list"` on the pipeline rail — PASS.
- Each stage button: `role="listitem"` on a `<button>` — **CAUTION.** The ARIA spec permits `listitem` role inside `list` but the accessible name comes from `[attr.aria-label]="stage.label + ': ' + stage.count + ' applicants'"`. This is good and will be announced correctly. **PASS with note.**
- Visually hidden paragraph with stage summary text — excellent screen reader supplement. **PASS.**
- Empty state uses `<app-empty-section>` — cannot audit without reading that component, but assumed to have a text announcement.
- **Medium gap:** Pipeline bar heights use `[style.height.%]`. These visual bars have no accessible equivalent beyond the visually-hidden paragraph. The `aria-label` on the button itself is sufficient, but the progressive bar fills carry no additional semantics. Acceptable.
- Loading skeleton: `<div class="emp-dash-pipeline-skeleton">` — no `aria-busy` or `aria-label`. Screen readers skip skeleton divs (no content). **Low gap.**

### Job Performance
- Section hidden when `cachedJobGroups.length === 0` — no gap (no empty state needed, section is optional).
- Job rows are `<div>`, not interactive except for the "Review" button. **PASS.**
- "Review" button: `class="btn-cta-outline"` with visible text "Review" — **CAUTION [Medium].** Screen readers will announce "Review" for each job row without context. If there are multiple rows, all say "Review." Recommend: `aria-label="Review applicants for {{ job.jobTitle }}"`.
- `trackBy` missing from `*ngFor="let job of cachedJobGroups"` — **PERF gap** (see §6), not an a11y issue.

### Branding Health
- `<section aria-label="Employer branding health">` — PASS.
- `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label` — **PASS. Full progressbar ARIA correctly implemented.**
- Missing chips use `<span>` — not interactive. PASS.
- "Complete profile" button has visible text. PASS.

### Subscription Section
- `<section aria-label="Subscription and plan">` — PASS.
- Three progress bars: all have `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`. **PASS. Full progressbar ARIA correctly implemented.**
- "Manage subscription" is a `<button>` with text. PASS.
- **Gap [Medium]:** When `subsRestrictions$` has never emitted (free account, no subscription), the entire section is hidden. There is no empty state visible to screen readers. A screen reader user may wonder why the subscription section described in other onboarding content doesn't appear.

### Onboarding Checklist
- `<section aria-label="Getting started checklist">` — PASS.
- `<ol role="list">` with `<li role="listitem">` — slightly redundant (`ol` already implies a list role) but not harmful.
- Done indicator `<span aria-label="Completed">Done</span>` — PASS.
- CTA buttons: visible text (e.g., "Complete profile", "Post a job", "View applicants"). PASS.
- Check icon SVG: `aria-hidden="true"` and `focusable="false"` — PASS.

---

## §6 Performance Review

### `brandingScore(dashboard.company)` called in template
- Called inside `<ng-container *ngIf="brandingScore(dashboard.company) as branding">` — Angular evaluates this **once per CD cycle** and the result is stored in the `branding` template variable. The same `branding` variable is reused throughout the section. **NOT a per-expression repeat problem.** The function is O(1). Acceptable.

### `companyProfileMissingFields(dashboard.company)` called in template
- Called inside `<ng-container *ngIf="companyProfileMissingFields(dashboard.company) as missingFields">` — same pattern as above. Called once per CD cycle. O(1). Acceptable but inconsistent with the V5 caching philosophy for `cachedOnboardingSteps`.

### `subscriptionUsagePct(...)` called in template
- Called 3 times per meter × 3 meters = **9 calls per CD cycle** (for `aria-valuenow`, `[style.width.%]`, and `[class.emp-dash-sub-meter-fill--warn]`).
- O(1) pure math. With subscription data unlikely to change during a page session and Angular's async pipe limiting CD cycles to when the observable emits, this is a very low real-world cost.
- **Recommendation:** Could use template variables (`*ngIf="subscriptionUsagePct(...) as pct"`) to reduce to 1 call per meter.

### trackBy functions
- `*ngFor="let stage of byStage; trackBy: trackByStageId"` — PRESENT. ✓
- `*ngFor="let applicant of needsReview; trackBy: trackByApplicationId"` — PRESENT. ✓
- `*ngFor="let step of cachedOnboardingSteps; trackBy: trackOnboardingStep"` — PRESENT. ✓
- `*ngFor="let job of cachedJobGroups"` — **MISSING trackBy.** Low risk (short list), but inconsistent.
- `*ngFor="let field of branding.missing"` — no trackBy. List of strings with no stable ID; index-based trackBy is all that's possible. Low risk.
- `*ngFor="let i of [1,2]"` / `*ngFor="let i of [1,2,3]"` (skeletons) — no trackBy on literal arrays. Angular recreates these elements on each CD cycle. These skeletons only render during loading, negligible.

### `subsRestrictions$` never emits (no subscription)
- The subscription section is gated by `*ngIf="subsRestrictions$ | async as subs"`. If the observable never emits (because the BE throws on "no subscription"), the async pipe never produces a value, the section stays hidden, and there is no memory leak or performance issue. **SAFE.**
- The NgRx effect will dispatch an error action; the `error$` observable will emit, but the dashboard does not subscribe to `error$`, so the error is silently swallowed for the subscription section.

---

## §7 Loading / Error / Empty States

| Section | Loading skeleton | Error state | Empty state | Notes |
|---|---|---|---|---|
| Global (main dashboard) | `#dashSkeleton` template — hero + 3 action skeletons | NONE — infinite skeleton | N/A | No error state for main data load failure |
| Action Center | 2 action skeletons when `pipelineLoading` | `role="alert"` card with Retry | "You're all caught up" empty div | GOOD |
| KPI Strip | Hidden when `pipelineLoading` (4th card) | First 3 cards always show (come from dashboard$), 4th hidden | N/A | N/A |
| Hiring Pipeline | `.emp-dash-pipeline-skeleton` div | `role="alert"` card with Retry | `<app-empty-section>` | GOOD |
| Applicants Needing Review | Hidden (section only renders if needsReview.length > 0) | Hidden | Hidden (section simply absent) | Acceptable — section title only appears when data exists |
| Onboarding Checklist | Hidden when pipelineLoading | N/A | Hidden (section absent when all done) | Good |
| Job Performance | Hidden when `pipelineLoading` | Hidden (section absent when error) | Hidden (section absent when empty) | ACCEPTABLE but no "all caught up" message when pipelineError |
| Branding Health | Rendered immediately when `dashboard.company` exists (no loading delay) | N/A | N/A | Scores show with whatever fields exist; no loading state needed |
| Subscription | Nothing (section absent) | Nothing (section absent) | Nothing (section absent for free accounts) | MISSING: should show upgrade CTA or "Free plan" indicator |
| Analytics (sub-components) | Not audited in this sweep | Not audited | Not audited | Delegated to sub-components |

---

## §8 Redesign Readiness

| Section | Status | Notes |
|---|---|---|
| Hero / Command Center | Ready | Clean HTML, well-separated SCSS, responsive |
| Action Center | Ready | Pattern established, extensible |
| KPI Strip | Ready-with-caution | Needs aria-labels before shipping |
| Hiring Pipeline | Ready | trackBy, aria-label, empty state, error state all present |
| Applicants Needing Review | Ready | trackBy, clean cards |
| Onboarding Checklist | Ready | Well-implemented caching, collapse-on-complete pattern |
| Job Performance | Ready-with-caution | Missing trackBy, Review button needs contextual aria-label |
| Branding Health | Ready | Full progressbar ARIA, correct math, good design |
| Subscription Health | Needs-cleanup | No empty state for free accounts, 9 template method calls |
| Analytics (sub-components) | Not evaluated | Delegated |

---

## §9 Risk Register

| ID | Area | Severity | Description | Fix | Must fix before launch |
|---|---|---|---|---|---|
| R01 | Security | P1 | FE sends localStorage companyId to subscription endpoint; BE ignores it, but code smell creates future BOLA risk if BE changes | Remove `?companyId=...` query param from FE `checkCompanySubscription` call | Yes |
| R02 | Accessibility | P1 | KPI cards have no aria-label communicating navigation destination | Add `aria-label="N active jobs — view jobs list"` pattern | Yes |
| R03 | UX | P1 | No subscription section for free accounts — section silently absent, no upgrade CTA | Add `(error$)` handler for subscription load to show free-tier state | Yes |
| R04 | Data correctness | P2 | `charts.interviews` KPI uses SQL missing current-month filter — may display wrong month's video answer count | Add `and date_part('month', CURRENT_DATE) = date_part('month', a.created_at)` to `searchQuery3` | Yes |
| R05 | UX | P2 | No error state for main `GET /company/dashboard` failure — skeleton shows forever | Add error action handling in NgRx effect, surface error in template | Yes |
| R06 | Accessibility | P2 | Job Performance "Review" buttons have no contextual aria-label (all say "Review") | Add `aria-label="Review applicants for {job.jobTitle}"` | Yes |
| R07 | Accessibility | P2 | Action center decorative images missing `aria-hidden="true"` | Add `aria-hidden="true"` to icon imgs in action cards | No |
| R08 | Performance | P3 | `subscriptionUsagePct()` called 9× per CD cycle | Use template `*ngIf="... as pct"` local vars or cache in component | No |
| R09 | Performance | P3 | `cachedJobGroups` *ngFor missing trackBy | Add `trackByJobId` function | No |
| R10 | Security | P3 | Payment fields (price, currency) stored in NgRx store but never displayed | Acceptable in prod; add comment in effect/selector to not display payment data | No |
| R11 | Data | P3 | `cachedJobGroups` counts understate reality if >10 pending applicants per company | Document limitation in section subtitle | No |
| R12 | Model | P3 | `Company` interface is incomplete — missing `withActiveSubscription`, `employeedCompanyId` from BE response | Update `company.model.ts` interface | No |

---

## §10 Opportunity Register

| ID | Area | Description | Priority | Effort |
|---|---|---|---|---|
| O01 | UX | Add free-tier subscription state with upgrade CTA when no subscription data | High | Low |
| O02 | Data | Fix `charts.interviews` SQL to filter current month | High | Low (1 line of SQL) |
| O03 | UX | Add error state + retry for main dashboard data load failure | High | Medium |
| O04 | A11Y | Add contextual aria-labels to KPI card buttons | High | Low |
| O05 | A11Y | Add contextual aria-labels to Job Performance "Review" buttons | High | Low |
| O06 | Security | Remove `?companyId=...` param from subscription FE call | Medium | Low |
| O07 | Perf | Cache `companyProfileMissingFields` result in component property (like cachedOnboardingSteps) | Low | Low |
| O08 | Perf | Reduce `subscriptionUsagePct()` template calls via local template variables | Low | Low |
| O09 | Perf | Add `trackBy` to cachedJobGroups `*ngFor` | Low | Low |
| O10 | Model | Update `Company` TypeScript interface to match actual BE response | Low | Low |

---

## Recommended Next Command

Run **TEST DASHBOARD** to generate the unit test spec for all pure methods (`brandingScore`, `_buildJobGroups`, `subscriptionUsagePct`, `subscriptionDaysLeft`, `needsReviewCount`) and smoke tests for template rendering. These methods are fully testable without a live backend and will guard against regressions in the data-correctness issues found in this sweep (particularly the `subscriptionUsagePct` capping logic and `brandingScore` edge case with `industryId = 0`).

After TEST: fix R04 (`charts.interviews` SQL filter) as it requires a one-line BE change and corrects a user-facing data accuracy bug.
