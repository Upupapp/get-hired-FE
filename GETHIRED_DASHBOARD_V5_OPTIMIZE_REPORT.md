# GetHired Dashboard V5 — Optimize Report
**Date:** 2026-06-27 | **Component:** `company-dashboard`

---

## Change Detection (CD) Issues

### OPT-01 — subscriptionUsagePct() called 9× per CD cycle (P2)
**Location:** `company-dashboard.component.html` — subscription card (3 meters)
**Problem:** Each meter calls `subscriptionUsagePct()` three times:
  1. `[attr.aria-valuenow]="subscriptionUsagePct(...)"`
  2. `[class.gh-sub-meter-fill--warn]="subscriptionUsagePct(...) >= 80"`
  3. `[style.width.%]="subscriptionUsagePct(...)"`

That is 9 pure-function calls per CD cycle for 3 meters. The function is cheap (a divide + Math.min), but the pattern is fragile — if the function ever becomes expensive, 9 CD calls will amplify it.
**Fix:** Pre-compute `jobPct`, `adminPct`, `videoPct` in the `subsRestrictions$` tap (or create a computed object), then bind to template variables.

### OPT-02 — _refreshV5Cache() / _buildRecommendedStep() / _buildSupportingActions() all fire on every pipeline and dashboard$ emit
**Location:** `.ts` — `_refreshV5Cache()` called from both `loadPipelineOverview()` success/error and `dashboard$` tap.
**Problem:** When `dashboard$` emits and pipeline data has already loaded, `_refreshV5Cache()` recomputes all V5 caches with stale pipeline data (the pipeline already loaded; `dashboard$` now fires again unnecessarily recalculating). This is a mild over-computation, not a bug.
**Fix:** Add a dirty flag — only recompute if either chart or pipeline data actually changed.

### OPT-03 — dashboard$ tap with no OnPush
**Location:** `.ts` — component uses default `ChangeDetectionStrategy.Default`.
**Fix (deferred):** Switch to `ChangeDetectionStrategy.OnPush`. All state is either async pipe (handles markForCheck) or cached properties updated in tap (would need manual markForCheck). Medium effort, high benefit.

---

## Animation Performance

### OPT-04 — No will-change on animated elements
The `.gh-pipeline-bar-fill` and `.gh-branding-bar` elements animate width on data load. Without `will-change: width` or `transform`-based animation, each resize triggers layout.
**Fix:** Add `will-change: width` to bar-fill elements, or switch to `transform: scaleX()` animation (GPU-composited).

### OPT-05 — SVG ring dashoffset animation has no CSS transition
The profile ring `stroke-dashoffset` binding changes instantly when `cachedProfilePct` updates. A CSS `transition: stroke-dashoffset 0.6s $motion-ease-standard` would make the fill animation smooth.
**Fix (deferred):** Add transition to `_motion.scss` under `.gh-profile-ring circle`.

### OPT-06 — Reduced-motion guard absent for ring/bar animations
The `_motion.scss` defines `@media (prefers-reduced-motion: reduce)` patterns, but the profile ring SVG stroke-dashoffset transitions (once added) and bar-fill transitions should be wrapped in this guard.

---

## Bundle Size Notes

- The component imports `map, tap, catchError, of, Subject, takeUntil` from RxJS — all tree-shaken, no issue.
- `asyncLocalStorage` inline object wraps `localStorage.getItem` — could be extracted to a shared service to avoid duplication across company components.
- No heavy third-party imports detected in this component.

---

## Mobile Performance

### OPT-07 — app-dashboard-charts fixed height conflicts with gh-chart-wrap min-height
`gh-chart-wrap` has `min-height: 180px` in `company-dashboard.component.scss`, but `dashboard-charts.component.scss` sets `.chart-container { height: 300px }`. On mobile the outer wrap min-height is irrelevant because the inner chart always forces 300px. The 180px rule adds no value and may confuse future developers.
**Fix:** Remove `min-height: 180px` from `gh-chart-wrap` or add a comment explaining it's a fallback for no-chart state only.

---

## Summary Table

| ID | Area | Severity | Status |
|----|------|----------|--------|
| OPT-01 | `subscriptionUsagePct` called 9×/cycle | P2 | Open |
| OPT-02 | V5 cache recomputes on every emit | P3 | Open |
| OPT-03 | No OnPush strategy | P3 | Deferred |
| OPT-04 | No will-change on bar fills | P3 | Open |
| OPT-05 | No ring transition | P3 | Deferred |
| OPT-06 | No reduced-motion guard for ring | P3 | Deferred |
| OPT-07 | Chart-wrap min-height is dead CSS | P3 | Open |
