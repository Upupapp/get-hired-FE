# GETHIRED DASHBOARD BRAND — State Experience System

**Scope:** All UI states on `/recruiter/dashboard`

---

## State Taxonomy

The dashboard has three independent data streams, each with its own state machine:

| Stream | Observable | States |
|--------|------------|--------|
| Main dashboard | `dashboard$` (via `loading$`) | Loading → Success / Error |
| Pipeline + pipeline actions | `pipelineLoading`, `pipelineError` | Loading → Success / Empty / Error |
| Subscription | `subsRestrictions$`, `subsError` | Loading → Success / Error |

---

## PRIMARY DASHBOARD API

**Loading state:**  
`loading$` is true → `*ngIf="!(loading$ | async); else ghDashSkeleton"` → renders `#ghDashSkeleton`.  
Skeleton contains: hero block (220px shimmer), inbox skeleton (main card + 3 small cards), KPI strip (8 shimmer cards).  
Duration: until `GET /company/dashboard` resolves.

**Success state:**  
`loading$` false, `dashboard$` emits non-null → full dashboard renders.  
Sequence: hero animates in (`gh-reveal 0.45s`), `ng-container` shows, all sections render and animate.

**Error state (NEW — this pass):**  
`loading$` false, `dashboard$` emits null (API failed) → `ng-container` condition fails → `#ghDashMissing` renders.  
Shows: `gh-dash-error-panel` with `role="alert"`, warning icon, human-language copy, "Retry" button calling `retryDashboard()`.  
Panel animates in with `gh-reveal 0.4s`.

---

## PIPELINE + ACTION INBOX

**Loading state:**  
`pipelineLoading = true` → inbox section shows `gh-inbox-skeleton` (main + 3 cards), pipeline card shows `gh-skeleton--pipeline`, job performance card shows `gh-skeleton--jobperf`.  
Note: pipeline loading is independent of main dashboard loading.

**Success state:**  
`pipelineLoading = false`, `pipelineError = false`, `byStage.length > 0` → stages render with purple bar fills; `cachedJobGroups.length > 0` → job table renders.  
Bar fills animate with `gh-bar-grow 600ms` (new this pass).

**Empty state — no pipeline stages:**  
`byStage.length === 0` → `gh-pipeline-empty` with "Applicants will appear here once candidates start applying" + "Post a job" link.

**Empty state — no job groups:**  
`cachedJobGroups.length === 0` → `gh-jobperf-empty` with "No jobs are currently awaiting applicant review" + "View all jobs" link.

**Empty state — Action Inbox (All caught up):**  
`cachedSupportingActions.length === 0` → `gh-inbox-all-clear` with green checkmark icon + "You're all caught up. No urgent actions right now."  
`cachedRecommendedStep.type === 'all_caught_up'` → recommended step card shows green border, success priority styling.

**Error state:**  
`pipelineError = true` → `gh-error-banner` in inbox section + `gh-error-sm` in pipeline card + `gh-error-sm` in job performance card, all with "Retry" buttons calling `retryPipelineOverview()`.

---

## SUBSCRIPTION / PLAN HEALTH

**Loading state:**  
`subsRestrictions$ | async` has not emitted yet → `gh-sub-loading` with head skeleton + 3 meter skeletons (`gh-skeleton--sub-meter`).

**Success state:**  
`subs` emitted → plan chip, renew date, 3 usage meters. Meters animate from 0 with `gh-bar-grow 650ms` (new this pass). Cached pct values drive all meter bindings.

**Warning sub-state:**  
Any meter `cachedXxxPct >= 80` → `gh-sub-meter-fill--warn` (amber fill).  
Any meter `cachedJobPostPct >= 100` → `gh-sub-meter-fill--danger` (red fill).

**Error state:**  
`subsError = true` → `gh-error-sm` with "Couldn't load subscription details" + Retry calling `retrySubscription()`.

---

## SUCCESS / COMPLETION STATES

The dashboard is read-only (no forms, no mutations). "Success" is expressed as:
- Hero "Profile complete!" ring sub-text (coral → green, `gh-profile-ring-sub--done`)
- Branding health card "Your employer profile is complete" with `gh-branding-done` (green text)
- Profile completeness card "View profile →" CTA (instead of "Complete profile →")
- Subscription "Manage plan →" always visible (neutral success)
- Action inbox "All caught up" state when no urgent actions

No post-mutation success toasts originate from this page.

---

## STATE PRIORITY RULES

When multiple stream states overlap:
1. If `loading$` true → show skeleton (overrides everything)
2. If `loading$` false + `dashboard$` null → show error panel (overrides KPI strip, health grid, etc.)
3. Pipeline loading/error is always isolated to its card — never affects hero or KPI strip
4. Subscription loading/error is always isolated to the subscription card — never affects hero
