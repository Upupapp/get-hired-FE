# GETHIRED DASHBOARD BRAND — Benchmark Research

**Scope:** Industry patterns applied to the GetHired employer dashboard

---

## IBM Carbon Design System

**Skeleton screens:**  
Carbon mandates skeleton placeholders for all data-heavy views to eliminate layout shift and blank screens. GetHired dashboard applies this: hero skeleton, KPI skeleton strip, inbox skeleton, pipeline skeleton, jobperf skeleton, subscription skeleton — all present before this pass.

**Inline loading:**  
Carbon's inline loading pattern (spinner within the section, not a full-page overlay) is followed by the pipeline card and job performance card using `pipelineLoading` independently of the main dashboard load.

**Error states:**  
Carbon's inline error pattern ("couldn't load content" + retry link in context) maps to GetHired's `gh-error-sm` (pipeline, subscription) and `gh-error-banner` (action inbox). The new `gh-dash-error-panel` (added this pass) follows Carbon's full-page inline error: centred, human copy, single retry CTA.

---

## Material Design 3 (Google)

**Motion — enter transitions:**  
MD3 specifies that entering elements should use an Emphasized Decelerate easing (`cubic-bezier(0.05, 0.7, 0.1, 1)`) for elements entering from off-screen, and Standard easing for elements already in the DOM. GetHired uses `$motion-ease-standard` from `_motion.scss` for all entrance animations — appropriate for in-place reveals.

**Motion — duration guidance:**  
MD3 recommends 200–500ms for component-level transitions. GetHired uses 400ms for card reveals (within spec), 600–700ms for bars (slightly longer, intentional for progress-fill drama), 900ms for rings (intentional premium feel).

**Stagger pattern:**  
MD3's "stagger" guidance: lists of entering items use 15–30ms per item. GetHired KPI stagger uses 30ms steps (8 cards = 0–210ms total), within spec.

---

## Shopify Polaris

**Empty states:**  
Polaris empty states include: illustration/icon, heading, body copy, primary action. GetHired maps to this: pipeline empty (body + CTA), job performance empty (body + CTA), cities empty (body only — no CTA needed), chart empty (body + CTA), inbox all-caught-up state (icon + body).

**Skeleton design:**  
Polaris skeletons use shimmer (`background-position` animation). GetHired's `@keyframes gh-shimmer` with `background-position: -800px → 800px` matches this pattern exactly.

---

## Atlassian Design System

**Motion tokens:**  
Atlassian formalises `duration-entering` (220ms), `duration-leaving` (110ms), `easing-enter` (decelerate), `easing-exit` (accelerate). GetHired uses `$motion-ease-standard` and `$motion-duration-micro` from `_motion.scss` — analogous approach. Ring and bar animation timings (600–900ms) exceed Atlassian defaults intentionally for "wow" on first data load.

**Reduced motion:**  
Atlassian explicitly recommends setting `animation: none` (not just shortening duration) for users who prefer reduced motion. GetHired's `prefers-reduced-motion` block uses `animation: none !important` for specific critical selectors — matches Atlassian's recommendation.

---

## WCAG 2.1 / 2.2

**SC 2.3.3 — Animation from Interactions (AAA):**  
Any motion triggered by interaction should be disableable. GetHired: all animations are passive (load-triggered), not interaction-triggered. The `prefers-reduced-motion` guard covers these.

**SC 1.4.3 — Contrast:**  
Muted grey (`#6b6887`) on white: ~4.5:1 (AA). Coral on white: ~3.9:1 (AA large text). Dark navy on white: 14:1 (AAA). Error panel text (`$gh-text` on white): AAA.

**SC 4.1.3 — Status Messages:**  
`role="alert"` on error panels ensures screen readers announce errors without focus movement. Used on: `gh-error-banner`, `gh-error-sm`, `gh-dash-error-panel` (new).

**SC 2.4.7 — Focus Visible:**  
All interactive elements have `outline: 2px solid` on `:focus-visible`. Verified across buttons, KPI cards, inbox cards, trend tabs.

---

## Apple Human Interface Guidelines (haptics)

**Haptic taxonomy:**  
Apple defines: Selection (light), Success (medium notch), Warning (medium), Error (heavy). GetHired's pending haptic spec (documented in `GETHIRED_DASHBOARD_BRAND_HAPTICS_SPEC.md`) maps:
- Inbox card tap → `selection` (light, navigation)
- Subscription CTA tap → `impactLight` (action initiation)

**Progressive enhancement:**  
Apple HIG stresses haptics as enhancement, never as the sole indicator. GetHired haptic calls are fire-and-forget with silent failure — visual feedback is always primary.

---

## Nielsen Norman Group — Error Message Guidelines

**NN/g 5-point error message checklist:**
1. Clearly state that something went wrong — ✓ "We couldn't load your dashboard"
2. Explain what the problem is (if known) — ✓ "There was a problem loading your hiring data"
3. Avoid blaming the user — ✓ "This is usually temporary"
4. Provide a recovery action — ✓ "Retry" button
5. Write in plain language — ✓ No technical jargon

The `gh-dash-error-panel` added in this pass satisfies all 5 criteria.
