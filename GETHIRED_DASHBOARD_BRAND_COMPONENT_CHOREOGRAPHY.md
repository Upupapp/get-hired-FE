# GETHIRED DASHBOARD BRAND — Component Choreography

**Scope:** Load sequence, state transition timeline, and error path for `/recruiter/dashboard`

---

## Primary Load Sequence

### T=0ms — Navigation to `/recruiter/dashboard`

`ngOnInit()` fires:
1. `companyFacade.getCompanyDashboard()` dispatched → `loading$` → true
2. `loadPipelineOverview()` called → `pipelineLoading = true`
3. `getCompanySubscription(companyId)` dispatched (async, after localStorage read)

**What renders:** `*ngIf="!(loading$ | async); else ghDashSkeleton"` → skeleton branch:
- `.gh-hero-skeleton` (220px shimmer)
- `.gh-inbox-skeleton` (main + 3 cards shimmer)
- `.gh-kpi-skeleton-strip` (8 shimmer KPI cards)

---

### T=~300–800ms — Main Dashboard API Resolves

`dashboard$` emits non-null value → `loading$` → false → `ng-container` with `dashboard` local variable mounts.

**Reveal sequence:**
1. `.gh-hero` reveals: `gh-reveal 0.45s 0ms` (first element, full hero block)
2. `.gh-inbox-main` reveals: `gh-reveal 0.4s 0ms`
3. `.gh-card` elements reveal in parallel: `gh-reveal 0.4s 0ms`
4. `.gh-kpi-strip` KPI cards cascade: 8 cards, `gh-reveal 0.4s`, delays 0/30/60/90/120/150/180/210ms
5. `.gh-profile-ring svg circle:last-child` fills: `gh-ring-hero-fill 900ms spring`
6. `.gh-profile-comp-ring svg circle:last-child` fills: `gh-ring-comp-fill 900ms spring`
7. `.gh-branding-bar` grows: `gh-bar-grow 700ms standard`
8. V5 cache computed: `cachedBrandingScore`, `cachedProfilePct`, `cachedHiringHealth`, `cachedRecommendedStep`, `cachedSupportingActions`
9. Hero chips populate (hiring health chip, plan chip)
10. Candidate insights populate

**Total hero-to-complete:** ~0.45s (hero) + 0.9s (rings) + 0.7s (branding bar) = rings finish last at ~1.35s after data arrival.

---

### T=~300–1200ms (parallel) — Pipeline API Resolves

Independent of main dashboard. Earlier of pipeline/dashboard wins.

**Reveal sequence:**
1. `pipelineLoading = false`
2. `.gh-inbox-grid` (action inbox) mounts — action cards animate in with stagger: 4 cards × 50ms steps
3. `.gh-pipeline-stages` pipeline bars grow: `gh-bar-grow 600ms standard` per active bar
4. `.gh-jobperf-table` job performance table renders
5. `cachedPipelineTotal`, `cachedInterviewsScheduled`, `cachedRecommendedStep`, `cachedSupportingActions` refresh
6. Action Inbox recommended step updates with pipeline-aware data
7. KPI "Needs review" count populates

---

### T=~200–1500ms (parallel) — Subscription API Resolves

**Reveal sequence:**
1. `subsRestrictions$` emits
2. `tap()` caches `cachedJobPostPct`, `cachedAdminPct`, `cachedVideoPct`
3. Subscription card skeleton hides
4. 3 meter fills grow: `gh-bar-grow 650ms standard` each
5. Hero plan chip populates (if not yet shown)

---

## Error Path — Main Dashboard

**T=0ms:** Skeleton renders (same as above)

**T=timeout:** `dashboard$` emits null → `loading$` false

**Render:**
- Skeleton destroyed
- `.gh-dash` mounts
- `ng-container *ngIf` fails (null)
- `#ghDashMissing` template renders: `gh-dash-error-panel` with `gh-reveal 0.4s`
- `role="alert"` announces to screen readers

**Recovery:** User clicks "Retry" → `retryDashboard()` → `loading$` true → skeleton re-renders → (success path above)

---

## Error Path — Pipeline

**T=0ms:** Main dashboard skeleton renders

**T=~Xms:** Main dashboard resolves → hero, KPI strip, health grid reveal

**T=~Yms:** Pipeline API fails → `pipelineError = true`

**Render:**
- `.gh-inbox-skeleton` replaced by `.gh-error-banner` with retry
- `.gh-skeleton--pipeline` replaced by `.gh-error-sm` in pipeline card
- `.gh-skeleton--jobperf` replaced by `.gh-error-sm` in job perf card
- All other sections unaffected

---

## Empty Path

Same as success path up to the point where sections render their content. Instead of data:
- Pipeline stages → `.gh-pipeline-empty`
- Job groups → `.gh-jobperf-empty`
- Cities → `#noCities` empty text
- Inbox supporting actions → `.gh-inbox-all-clear`
- KPI numbers → `0` or `—`

The recommended step card is never empty — `_buildRecommendedStep()` always produces one of 6 states including `all_caught_up`.

---

## Visual Timeline Summary

```
0ms      ──── Skeleton renders ────────────────────────────────────────────┐
300ms    ──── Hero + KPI + Health Grid reveal (400–450ms animations) ───┐  │
300ms    ──── Rings begin filling (900ms spring) ──────────────────┐    │  │
650ms    ──── Pipeline data arrives → Inbox + Pipeline reveal ──┐  │    │  │
1200ms   ──── Rings finish filling ──────────────────────────────│──┘    │  │
Xms      ──── Subscription arrives → Meters grow ───────────────┘        │  │
         ─────────────────────────────────────────────────────────────────┘  │
         ─────────────────────────────────────────────────────────────────────┘
```
