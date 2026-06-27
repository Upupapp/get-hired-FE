# GETHIRED DASHBOARD BRAND — Backlog

**Pass:** BRAND v5 — Dashboard scope  
**Date:** 2026-06-27

Items deferred from this pass. Sorted by priority.

---

## P1 — Must Fix Before Next Feature Release

*(All P1 items were fixed in this pass. No P1 items deferred.)*

---

## P2 — High Value, Low Risk

### BACKLOG-1: Trend tabs wired to chart data

**Description:** The 7d/30d/90d trend tabs exist and update `trendRange` state, but the chart component (`app-dashboard-charts`) does not react to this value. The tab UI changes (active state) but no data filtering occurs.

**Required:** Pass `trendRange` as an input to `app-dashboard-charts` and implement date-range filtering in the chart component or via an API parameter.

**File:** `company-dashboard.component.html` line ~268; `app-dashboard-charts` component.

**Note in HTML:** A `title="Date range filtering is coming soon"` hint is on the trend-tabs container — remove this once wired.

---

### BACKLOG-2: Messages KPI unread count

**Description:** The "Messages" KPI card shows "—" because no API endpoint exists to fetch unread message count. This has been flagged in previous sessions.

**Required:** BE endpoint to return unread message count for the authenticated company. Then bind to KPI card.

**Known blocker:** No `is_read` column/all-threads endpoint on BE (from session checkpoint notes).

---

### BACKLOG-3: Subscription upgrade CTA at 100% usage

**Description:** When any subscription meter reaches 100%, a prompt to upgrade the plan should appear inline in the subscription card (e.g., "You've used all your job slots — upgrade your plan").

**Required:** Conditional block in subscription card when `cachedJobPostPct >= 100` (or other meters). CTA → `/recruiter/subscription`.

---

## P3 — Nice to Have

### BACKLOG-4: `takeUntil` on subscriptions

**Description:** The component uses `async` pipe for `dashboard$` and `subsRestrictions$` (which auto-unsubscribes), but the `companyService.getDashboardPipelineOverview()` in `loadPipelineOverview()` uses `.subscribe()` without a `takeUntil`. If the component is destroyed while the request is in flight, there could be a subscription leak.

**Required:** Add `takeUntil(this._destroy$)` to the pipeline subscribe. `_destroy$` already exists.

---

### BACKLOG-5: HapticFeedbackService implementation

**Description:** Haptic patterns are fully specified in `GETHIRED_DASHBOARD_BRAND_HAPTICS_SPEC.md` but not implemented. Service structure not yet confirmed.

**Required:** Verify/create `HapticFeedbackService`, add silent-fail `navigator.vibrate()` calls on inbox card tap and primary CTA tap.

---

### BACKLOG-6: `ChangeDetectionStrategy.OnPush`

**Description:** The component uses default change detection. Switching to `OnPush` would reduce unnecessary CD cycles significantly.

**Required:** Add `changeDetection: ChangeDetectionStrategy.OnPush` to `@Component`. Verify all template inputs and observables are compatible with immutable patterns. The subscription usage cache (this pass) is a prerequisite — function calls in templates block OnPush adoption.

---

### BACKLOG-7: KPI count-up animation

**Description:** KPI number values appear instantly when data loads. A count-up effect (0 → actual value over ~600ms) would increase perceived quality.

**Required:** JavaScript counter animation on the `cachedXxx` and `dashboard.charts.xxx` values. Needs a shared `CountUpDirective` or pipe. Not a pure CSS solution — deferred.

---

### BACKLOG-8: Hero mesh ambient transition

**Description:** The `.gh-hero-mesh` radial gradient is static. A subtle CSS animation (breathing, slow drift) could enhance the premium feel of the hero on initial load.

**Required:** CSS `@keyframes` on `background-size` or a pseudo-element with `transform`. Must be disabled under `prefers-reduced-motion`. Very low priority — cosmetic only.

---

### BACKLOG-9: Stale data badge (offline scenario)

**Description:** No offline/stale-data experience. If the dashboard API fails but localStorage has a cached company profile, the hero could show a stale-data chip.

**Required:** Service worker or localStorage caching strategy for dashboard API response. Complex — deferred indefinitely.

---

### BACKLOG-10: Screen reader loading announcement

**Description:** The skeleton has no `aria-live` announcement. Screen reader users get no feedback that the page is loading.

**Required:** Add `<p class="gh-visually-hidden" aria-live="polite">Loading your hiring command center…</p>` to `#ghDashSkeleton`.

Low impact (skeleton duration is short), but correct practice.
