# GETHIRED DASHBOARD BRAND — Offline & Degraded System

**Scope:** Partial-data and offline scenarios for `/recruiter/dashboard`

---

## Degraded Architecture

The dashboard uses three independently-scoped data fetches. Each can fail independently. The UI is designed so that failure of one stream does not blank the others.

---

## Scenario 1 — Primary Dashboard API Offline

**Trigger:** `GET /company/dashboard` network failure or 5xx. `loading$` becomes false, `dashboard$` emits null.

**What shows:**
- `.gh-dash` renders (loading is false)
- `#ghDashMissing` error panel renders (NEW — this pass) with "Retry" button
- Hero: NOT rendered (inside `ng-container` which hides when `dashboard$` null)
- KPI Strip: NOT rendered (inside `ng-container`)
- Health Grid: NOT rendered
- Candidate Insights: NOT rendered

**What is hidden:** All data-driven content. Only the error panel is visible inside `.gh-dash`.

**Recovery:** User clicks "Retry" → `retryDashboard()` → `companyFacade.getCompanyDashboard()` → `loading$` toggles true → skeleton shows again → on success, full dashboard renders.

**Pipeline and Subscription:** These load independently, so even if the main API fails:
- Pipeline cards may succeed (rendered within the now-hidden `ng-container`, so they're not visible)
- Subscription card is also inside `ng-container` — not visible during main API failure

**Note:** The error panel is the primary recovery surface. No auto-retry is implemented.

---

## Scenario 2 — Pipeline API Offline

**Trigger:** `getDashboardPipelineOverview()` fails. `pipelineError = true`.

**What shows:**
- Hero: fully rendered ✓
- KPI Strip: fully rendered ✓ (KPI values come from `dashboard$`, not pipeline)
- Action Inbox: shows `gh-error-banner` with "Couldn't load action items right now." + Retry
- Hiring Pipeline Health card: shows `gh-error-sm` with "Couldn't load pipeline data." + Retry
- Job Performance card: shows `gh-error-sm` with "Couldn't load job data." + Retry
- Health Grid: fully rendered (branding, profile, subscription unaffected) ✓
- Candidate Insights: fully rendered ✓

**What is hidden:** Pipeline stages, job groups, needs-review count-based KPI (`needsReviewCount` stays at 0), action inbox grid.

**V5 cache impact:** `cachedPipelineTotal`, `cachedInterviewsScheduled`, `cachedRecommendedStep`, `cachedSupportingActions` — `_refreshV5Cache()` is called on pipeline error, so these compute with `byStage = []` and `needsReviewCount = 0`. Recommended step falls back to profile/jobs logic.

**Recovery:** Retry button in each affected section calls `retryPipelineOverview()`.

---

## Scenario 3 — Subscription API Offline / Slow

**Trigger:** `subsRestrictions$` errors → `catchError` emits null, sets `subsError = true`.

**What shows:**
- Hero: fully rendered ✓ (plan chip in hero hides since `subsRestrictions$ | async as subsHero` emits null)
- All other sections: unaffected ✓
- Subscription card: shows `gh-error-sm` with "Couldn't load subscription details." + Retry

**What is hidden:** Plan chip in hero, subscription card content.

**Recovery:** `retrySubscription()` resets flag and re-dispatches `getCompanySubscription()`.

---

## Scenario 4 — Slow Dashboard (Partial Load)

**Trigger:** Dashboard API takes >2s. Pipeline resolves faster.

**Sequence:**
1. `loading$` true → skeleton renders
2. Pipeline resolves → `pipelineLoading = false`, `byStage` populated, but still inside skeleton (not visible yet)
3. Dashboard API resolves → `loading$` false → skeleton destroyed → full dashboard renders
4. Pipeline data is already cached, so pipeline card renders immediately without its own loading state

**User experience:** Smooth — only one loading phase visible. Pipeline skeleton inside the main skeleton is the first thing users see.

---

## Scenario 5 — No Network at All (Complete Offline)

All three streams fail. Result:
- Main dashboard API fails → error panel shows
- Pipeline fails silently (not visible due to error panel)
- Subscription fails silently (not visible due to error panel)

User sees only the error panel. This is correct — showing partial sections while the main container is empty would be confusing.

---

## No Service Worker / Offline Cache

The GetHired FE does not implement a service worker or IndexedDB cache for the dashboard API responses. There is no "stale data" display mode. If offline, the user always sees the error panel.

This is acceptable given the employer dashboard is always used in an active session (hiring is an online-first workflow). A future enhancement could cache the last-known dashboard state in `localStorage` and show it with a "stale data" badge — deferred to backlog.
