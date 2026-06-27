# GETHIRED DASHBOARD BRAND — Performance Budget

**Scope:** Performance impact of BRAND v5 changes on `/recruiter/dashboard`

---

## Animation Performance

### All Animations are Pure CSS
No JavaScript animation loops, no `requestAnimationFrame`, no GSAP or other animation libraries added. All new animations (`gh-ring-hero-fill`, `gh-ring-comp-fill`, `gh-bar-grow`) are CSS `@keyframes` declarations.

**GPU-composited properties:**
- `opacity` (in `gh-reveal`) — GPU composited ✓
- `transform: translateY` (in `gh-reveal`) — GPU composited ✓

**Non-composited properties (potential jank):**
- `stroke-dashoffset` — SVG property, typically CPU-rendered. Acceptable: only 2 ring elements total; both are small SVGs (72px and 80px viewBox). No repaint cost after animation completes.
- `width` (bar grow) — triggers layout. Acceptable: bars are in isolated `overflow: hidden` containers with no flex/grid impact. After animation, width is static. `will-change` not added (only 4 bar classes, not a hot path).

---

## Change Detection — subscriptionUsagePct Reduction

**Before (GAP 3):** `subscriptionUsagePct()` called 9 times per Angular change detection cycle:
- 3 subscriptions meters × 3 bindings each (`aria-valuenow`, `class.warn`, `style.width.%`)

**After (this pass):** `subscriptionUsagePct()` called **0 times per CD cycle**. The 3 values are computed once inside the `tap()` callback on `subsRestrictions$` emit.

**Improvement:** 9 function calls per CD cycle → 1 per subscription emit.
Typical CD frequency on an active dashboard: 10–30 cycles/second (every user interaction, every observable emit). On a slow device, this is 90–270 fewer function calls per second.

`subscriptionUsagePct()` is not expensive (3 arithmetic operations), but eliminating unnecessary calls in the template is correct Angular hygiene. At scale, unnecessary template function calls compound.

---

## CSS Size Impact

### New CSS Added (~1.2KB uncompressed)

```
@keyframes gh-ring-hero-fill     ~30 bytes
@keyframes gh-ring-comp-fill     ~30 bytes
@keyframes gh-bar-grow           ~25 bytes
.gh-profile-ring svg circle:last-child animation rule    ~65 bytes
.gh-profile-comp-ring svg circle:last-child animation rule ~65 bytes
.gh-kpi-strip > *:nth-child(1-8) stagger rules          ~180 bytes
.gh-inbox-cards .gh-inbox-card:nth-child(1-4)           ~100 bytes
.gh-pipeline-bar-fill--active animation property        ~60 bytes
.gh-branding-bar animation property                     ~55 bytes
.gh-sub-meter-fill animation property                   ~55 bytes
.gh-insight-bar animation property                      ~55 bytes
.gh-dash-error-panel + sub-classes                      ~350 bytes
prefers-reduced-motion additions                        ~200 bytes
```

**Total added:** ~1.27KB uncompressed, ~420 bytes gzipped (estimated).

**Relative to current:** Angular build shows employer panel JS chunk at 499KB (largest chunk). CSS is bundled separately. Dashboard SCSS is one file among many. Impact is negligible.

---

## Build Output Comparison

| Metric | Before | After |
|--------|--------|-------|
| Build result | PASS | PASS |
| Build errors | 0 | 0 |
| Build warnings | 2 (pre-existing autoprefixer) | 2 (same pre-existing) |
| New dependencies | 0 | 0 |
| CSS added | — | ~1.27KB uncompressed |
| JS changed | ~0 bytes (small TS additions) | ~200 bytes (3 properties + 1 method) |
| Bundle size impact | — | Negligible |

---

## No New Dependencies

This pass adds zero new npm packages. All CSS animations use browser-native features:
- `@keyframes` — universal
- `animation-fill-mode: both` — universal
- `stroke-dashoffset` CSS property — all modern browsers
- `:nth-child()` pseudo-class — universal

---

## Skeleton Performance

The shimmer animation (`gh-shimmer`) uses `background-position` which is GPU-composited. This was already present — not changed. Under `prefers-reduced-motion`, shimmer is disabled entirely (`animation: none; background: #f0edf8`).

---

## Future Performance Opportunities (Backlog)

1. **`OnPush` change detection** — switching the component to `ChangeDetectionStrategy.OnPush` would further reduce CD cycles. Deferred — requires verifying all inputs use immutable patterns.
2. **`takeUntil` on subscriptions** — the `subsRestrictions$` async pipe is auto-unsubscribed by Angular. But the `dashboard$` and `subsRestrictions$` property pipes (not used with `| async` directly in constructor) should be verified for proper completion. Deferred.
3. **SVG `will-change: transform`** on ring circles — would hint GPU composition for `stroke-dashoffset`. Low value for 2 small elements; not added.
