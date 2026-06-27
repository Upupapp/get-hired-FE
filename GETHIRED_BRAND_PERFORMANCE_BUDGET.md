# GETHIRED BRAND — Performance Budget (Phase 17)
**BRAND v6 · 2026-06-27**

---

## Budget Principles

1. No heavy animation library (Lottie, Rive, GSAP) without explicit justification and bundle-size sign-off.
2. All animations use CSS `transform` and `opacity` (GPU-composited; no layout/paint triggers).
3. Avoid animating `width`, `height`, `top`, `left`, `margin`, `padding` on large or frequently-updated elements.
4. Avoid `box-shadow` animation loops on large surfaces.
5. Avoid `background-color` transitions on large surfaces (triggers repaint).
6. Skeleton shimmer: `background-position` animation only (GPU-safe with correct `will-change: background-position` where needed).
7. No JS animation loops (`setInterval`, `requestAnimationFrame` at 60fps) unless critical.
8. Haptic service adds negligible bundle cost (~1KB minified).
9. New SCSS token file (`_tokens.scss`) adds minimal CSS bundle cost.
10. Must not worsen Core Web Vitals on: `/jobs` (public), `/jobs/:id` (job detail), applicant dashboard, employer dashboard.

---

## New Dependencies Introduced (BRAND v6)

| Item | Size impact | Justification |
|---|---|---|
| `_motion.scss` extensions | +~2KB CSS | CSS custom properties + new classes; acceptable |
| `_tokens.scss` (new file) | +~3KB CSS | Design token system; reduces per-component hardcoding |
| HapticFeedbackService additions | +~500B JS | `dashboardAction()`, `planAction()`, `respectReducedMotion()` added |
| **Total** | **~5.5KB** | Well within budget |

No new npm packages. No Lottie. No Rive. No GSAP. No heavy icon library added.

---

## Animation Performance Analysis

| Effect | CSS Property | GPU? | Risk Level | Notes |
|---|---|---|---|---|
| Card entrance (`.gh-dashboard-card`) | `opacity` + `transform: translateY` | Yes | Low | GPU-composited; safe |
| KPI reveal (`.gh-dashboard-kpi`) | `opacity` + `transform: scale` | Yes | Low | GPU-composited; safe |
| Skeleton shimmer | `background-position` | Partial | Medium | May trigger repaint on many simultaneous skeletons; limit to 6 max visible |
| Plan meter (`.gh-plan-meter`) | `width` | No | Medium | Triggers layout; consider `transform: scaleX` alternative if reflow observed |
| Match signal rings | SVG opacity + transform | Yes | Low | SVG animations are contained |
| CV Health ring fill | SVG `stroke-dashoffset` | Yes | Low | SVG; safe |
| Hover lift on cards | `transform: translateY` + `box-shadow` | Partial | Low | `box-shadow` change on hover is non-loop; acceptable |
| Publish glow (one-shot) | `box-shadow` keyframe | Partial | Low | One-shot; not a loop |
| Offline banner | `opacity` + `translateY` | Yes | Low | — |

---

## Deferred / Future Effects (Not Implemented This Pass)

| Effect | Reason deferred | Priority |
|---|---|---|
| Dashboard hero animated gradient mesh (subtle) | Requires perf testing on low-power devices | P3 |
| JS-driven KPI countup | Requires manual `prefers-reduced-motion` JS check; defer until pattern standardised | P2 |
| Sparkline chart animation | No real historical data available yet | P3 |
| Public portal animated entrance sequence | Safe but low ROI vs. current GIF spinner problem | P2 |
| CV Doctor step indicator with real step states | Requires BE step event API | P1 (blocked on BE) |
| Confetti on application submission (optional) | Product decision required; default is off | P3 |

---

## Performance Monitoring Checklist

- [ ] Run Lighthouse on `/jobs` before and after BRAND CSS additions — CLS must not increase.
- [ ] Run Lighthouse on employer dashboard — LCP must not increase.
- [ ] Verify skeleton shimmer doesn't cause jank on mobile (Android Chrome DevTools trace).
- [ ] Confirm `_tokens.scss` doesn't duplicate existing SCSS variables (would bloat CSS bundle).
- [ ] Check Angular bundle diff after adding token file.

---

## CSS Bundle Notes

Current style architecture:
- `styles.scss` (global) — large (500+ lines); acceptable for global styles
- `_motion.scss` — ~150 lines after v6 additions
- `_tokens.scss` — new, ~100 lines
- `colors.scss` — ~35 lines (SCSS variables only; no output CSS unless referenced)

Total estimated CSS addition from BRAND v6: **~5KB unminified / ~3KB gzipped** — acceptable.

---

## Must Not Degrade

| Page | Metric | Threshold |
|---|---|---|
| Public `/jobs` | LCP | ≤2.5s |
| Public `/jobs/:id` | LCP | ≤2.5s |
| Applicant dashboard | FID/INP | ≤100ms |
| Employer dashboard | LCP | ≤3s (authenticated; more data-heavy) |
| All pages | CLS | ≤0.1 |

Animation additions in this pass use GPU-composited properties only (transform/opacity) and do not affect layout metrics.
