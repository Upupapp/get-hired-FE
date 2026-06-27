# GetHired Dashboard V5 — Brand Report
**Date:** 2026-06-27 | **Component:** `company-dashboard`

---

## Motion System

### Motion Tokens (from `src/assets/styles/_motion.scss`)
- `$motion-duration-micro: 160ms`
- `$motion-ease-standard: cubic-bezier(0.4, 0, 0.2, 1)`
- `.gh-pressable` — scale/opacity press animation defined here

### Usage in Dashboard V5

| Element | Motion | Token used | Assessment |
|---------|--------|------------|------------|
| KPI cards | `gh-pressable` class on all button-type KPI cards | ✓ | Consistent |
| Hero CTAs | `gh-pressable` on all three buttons | ✓ | Consistent |
| Inbox main card CTA | `gh-pressable` | ✓ | Consistent |
| Inbox supporting cards | `gh-pressable` on each action button | ✓ | Consistent |
| Health card CTAs | `gh-pressable` | ✓ | Consistent |
| Job performance "Review" buttons | `gh-pressable` | ✓ | Consistent |
| Profile ring arc | No transition on `stroke-dashoffset` | Missing | Should animate on data load |
| Pipeline bar fills | No `transition` or `will-change` | Missing | Snaps on load |
| Branding score bar | No `transition` or `will-change` | Missing | Snaps on load |

**`gh-pressable` coverage: 100%** — every interactive element has the press token. 
**Entrance animations: 0%** — no entrance animations for cards or sections.

---

## Brand Wow Assets

All three brand wow assets confirmed present at `src/assets/brand/gethired-wow/`:

| Asset | Used in | Condition |
|-------|---------|-----------|
| `candidate-profile-card.svg` | Inbox main card | type = `review_applicants` or `review_video_answers` |
| `hiring-pipeline-lines.svg` | Inbox main card | type = `post_first_job` |
| `trust-shield-glow.svg` | Inbox main card | type = `complete_company_profile` or `improve_employer_brand` |

`all_caught_up` type shows no brand image — this is the one case where the main card has no illustration. Consider adding a "celebration" SVG for the all-clear state.

---

## Hero Gradient

The `.gh-hero-mesh` div with `aria-hidden="true"` provides the decorative background mesh. This correctly uses `aria-hidden` so screen readers skip it. The gradient is defined in SCSS (not audited here but referenced in the SCSS file).

---

## Profile Ring — SVG Consistency

**Before fix:** `width="96" height="96"` HTML attributes overrode CSS sizing on mobile. At 900px breakpoint, the SCSS container was 64×64 but the SVG attribute forced 96×96, causing overflow.

**After fix:** Attributes removed. The SVG now inherits its size from the CSS `position: absolute; inset: 0` rule, scaling correctly with the parent container at all breakpoints.

The mini profile ring in the health section (line 472) still has `width="80" height="80"` attributes on its `<svg>` element. This ring is inside a fixed-width container (`.gh-profile-comp-ring`) with explicit width/height set in SCSS — the mismatch is benign here because the container explicitly sizes to 80×80 at all breakpoints. However, for consistency, consider removing those attributes too.

---

## Entrance Animations

No entrance animations are currently implemented. Cards appear instantly. For a dashboard of this density, staggered entrance would increase perceived quality.

**Recommendation (deferred):** Add a CSS class `gh-card--enter` applied on first render, with `@keyframes` using `opacity: 0 → 1` and `translateY(8px → 0)` at 160ms duration (`$motion-duration-micro`). Stagger by 50ms per card row. Guard with `@media (prefers-reduced-motion: reduce) { .gh-card--enter { animation: none; } }`.

---

## Reduced-Motion Guard

`src/assets/styles/_motion.scss` includes a `@media (prefers-reduced-motion: reduce)` block for `.gh-pressable`. This correctly disables scale transforms for accessibility.

The SVG ring transition (once added) and bar-fill transitions must also be wrapped in this guard. Currently not implemented because transitions haven't been added yet.

---

## Summary

| Area | Status |
|------|--------|
| `.gh-pressable` on all interactive elements | ✓ Complete |
| Brand wow assets wired | ✓ Complete |
| `aria-hidden` on decorative elements | ✓ Complete |
| Hero SVG ring responsive sizing | ✓ Fixed |
| Entrance animations | Missing — deferred |
| Bar/ring CSS transitions | Missing — deferred |
| Reduced-motion guard (future transitions) | Planned |
| Mini ring SVG attribute consistency | Minor — not fixed |
