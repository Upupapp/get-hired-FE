# GETHIRED BRAND — Effects Library (Phase 12)
**BRAND v6 · 2026-06-27**

---

## Principles

- All effects mapped to REAL data states — never fire on fake data.
- All effects tokenised — use `--gh-motion-*` and `--gh-ease-*` tokens.
- All effects accessible — text equivalent for every visual-only state.
- All effects performance-safe — `opacity` + `transform` only for GPU-composited animations; avoid `box-shadow` loops, large animated gradients, JS animation loops.
- Reduced-motion: static fallback always provided.

---

## 1. Job Signal Scan (CV Doctor)
- **What:** Signal rings (from `match-signal-rings.svg`) pulse outward as analysis progresses.
- **Implementation:** CSS `@keyframes` on SVG `<circle>` elements: opacity 1→0 + scale 1→1.3 over 600ms, staggered.
- **Trigger:** Only during active CV analysis step. Stops when step completes.
- **Reduced motion:** Static SVG only; no animation.
- **A11y:** Step description updated via `aria-live="polite"`.

## 2. Application Pipeline Line
- **What:** Connecting line draws across pipeline stages as applicant progresses.
- **From:** `application-status-path.svg`
- **Implementation:** SVG `stroke-dashoffset` animation from full-path to 0 over 500ms `--gh-ease-scan`.
- **Trigger:** On stage change (not on page load).
- **Reduced motion:** Line appears fully drawn immediately.

## 3. Profile Readiness Orb
- **What:** Circular progress ring fills to real completeness percentage.
- **Implementation:** SVG circle `stroke-dashoffset` from 0→real value over 720ms `--gh-ease-scan`.
- **Trigger:** On profile load or after user completes a section.
- **Reduced motion:** Ring appears at final value immediately.
- **Never:** Animate to a fake completeness value.

## 4. Match Signal Chips
- **What:** Skill/match chips appear with a soft spring pop.
- **Implementation:** `scale(0.85 → 1) + opacity(0→1)` over 200ms `--gh-ease-spring-soft`.
- **Trigger:** On result reveal only (not on hover).
- **Reduced motion:** Instant appear.

## 5. Recruiter Publish Pulse
- **What:** Brief coral glow on the Publish button when a job successfully goes live.
- **Implementation:** `box-shadow: 0 0 0 0 rgba(#FF7062, 0.5)` → `0 0 0 8px rgba(#FF7062, 0)` over 400ms (one-shot, not loop).
- **Trigger:** After API confirms publish. Fires once.
- **Reduced motion:** No glow; success text only.

## 6. Dashboard Command-Hero Mesh (Public Portal)
- **What:** Slow, subtle gradient mesh movement in public portal hero background.
- **From:** `portal-gradient-mesh.svg`
- **Implementation:** `transform: translateX` oscillation over 8s `--gh-motion-ambient` linear infinite.
- **Trigger:** Page load (ambient).
- **Reduced motion:** Static mesh, no movement.
- **Brightness:** ≤20% opacity overlay — never obscures text.
- **Non-distracting:** Very slow; barely perceptible.

## 7. Dashboard Action Card Glow (High Priority Only)
- **What:** Subtle coral left border accent on high-priority action cards.
- **Implementation:** CSS `border-left: 3px solid rgba(#FF7062, 0.8)`. No animation/pulse.
- **Trigger:** Conditional on `isHighPriority` data flag only.
- **Never:** Pulsing glow loop; never on all cards.
- **Reduced motion:** Same — border-left is static, no animation impact.

## 8. Subscription Plan Meter
- **What:** Usage meter bar animates from 0 to real usage percentage once on reveal.
- **Implementation:** CSS `animation: gh-meter-fill 600ms --gh-ease-scan` (class `.gh-plan-meter`).
- **Trigger:** On plan health section reveal.
- **Reduced motion:** Meter appears at final value immediately.
- **Never:** Animate to fake usage; never animate on hover.
- **Near-limit:** Meter fill colour changes to amber (`$color-warning-amber`) at ≥80%, red at ≥100%. Colour change is instant, not animated.

## 9. Employer Brand Health Sparkline
- **What:** If employer branding score history is available (real data), a small sparkline chart shows trend.
- **Implementation:** SVG polyline or canvas; animate path draw on reveal (500ms) if data is real.
- **Never:** Show sparkline without real historical score data.
- **Reduced motion:** Static at final position.

## 10. Empty State Illustrations
- **What:** Static SVG illustrations from `gethired-wow/` folder.
- **Default:** Static — no animation.
- **Optional hover animation:** On `hover: hover` + `prefers-reduced-motion: no-preference`: subtle float `translateY(0 → -4px → 0)` over 4s ease-in-out infinite.
- **A11y:** `aria-hidden="true"` on all decorative SVGs.

## 11. Error Lost-Signal Visual
- **What:** For section errors, a subtle disconnected-signal icon (static).
- **No animation on error visuals** — static icon only. Motion on errors is anxiety-inducing.

## 12. Success Confirmation Card
- **What:** Full success state card after major action.
- **Animation:** Checkmark SVG draws in (stroke-dashoffset 200ms) + card fades in (250ms).
- **Haptic:** Paired with appropriate method.
- **Reduced motion:** Card appears immediately; no draw animation.

## 13. Skeleton Shimmer (Global)
- **What:** Loading state shimmer across skeleton blocks.
- **Implementation:** `@keyframes gh-shimmer-v6` (added in `_motion.scss`). Classes: `.gh-dashboard-skeleton`, `.gh-plan-health-skeleton`, `.gh-skeleton` (from `styles.scss`).
- **Gradient:** `linear-gradient(90deg, #f0edf8 25%, #e6e2f2 50%, #f0edf8 75%)` — purple-tinted neutral, matches dashboard skin tone.
- **A11y:** `aria-hidden="true"` on skeleton containers; `aria-busy="true"` on parent region.

## 14. Top Progress Line
- **What:** Thin coral progress bar at top of viewport during route transitions.
- **Class:** `.gh-top-progress`
- **Implementation:** Angular router events drive width 0% → 100% → hide.
- **Reduced motion:** Progress indicator transitions instantly to complete; no animation.
- **A11y:** `role="progressbar"` with `aria-valuetext="Page loading"`.

## 15. Upload Dropzone Glow
- **What:** On drag-over, dropzone border changes to coral + soft coral glow.
- **Implementation:** `box-shadow: 0 0 0 3px rgba(#FF7062, 0.2)` + border colour change.
- **Duration:** 160ms ease.
- **Reduced motion:** Border change only; no glow.

## 16. Field Focus Glow
- **What:** On input focus, field gets coral `box-shadow: 0 0 0 3px rgba(#FF7062, 0.15)`.
- **Duration:** 150ms ease.
- **Reduced motion:** Border colour change only; no glow.

---

## Performance Notes

| Effect | GPU-safe? | Risk |
|---|---|---|
| Skeleton shimmer | Yes (background-position) | Medium — avoid on large number of simultaneous skeletons |
| Card entrance translate/opacity | Yes | Low |
| Plan meter fill (width) | No (triggers layout) | Use `scaleX` instead of `width` if reflow is observed |
| Publish pulse glow (one-shot) | Medium (box-shadow) | Low — fires once |
| Dashboard mesh animation (ambient) | Yes (transform) | Low — very slow, low repaint |
| SVG stroke animations | Yes | Low |

**`box-shadow` warning:** Animated `box-shadow` causes GPU compositing issues at scale. All `box-shadow` animations in this spec fire once (not loop) or are static. The skeleton shimmer uses `background-position` (no reflow, no box-shadow).
