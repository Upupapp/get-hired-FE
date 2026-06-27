# GetHired Dashboard V5 — Mobile View Report
**Date:** 2026-06-27 | **Component:** `company-dashboard`

---

## Hero Section

### Hero Ring SVG Overflow (FIXED) ✓
**Before:** `<svg viewBox="0 0 72 72" width="96" height="96">` — HTML attributes overrode CSS `position: absolute; inset: 0` at 900px breakpoint, causing the 96px ring to overflow its 64px CSS container.

**After:** `<svg viewBox="0 0 72 72">` — width/height removed. The SVG now inherits its size from the absolutely-positioned parent container. The CSS `position: absolute; inset: 0; width: 100%; height: 100%` rule takes full control at all breakpoints.

### Hero Body Layout ✓
The `.gh-hero-body` uses flexbox. At the 900px breakpoint it should stack vertically (left identity above, right profile ring below). The ring at 64×64 is appropriate for mobile.

### Hero CTAs ✓
Three CTA buttons in `.gh-hero-ctas`. On narrow screens, they should wrap or stack — depends on SCSS flex-wrap settings. Not audited at source but visually expected to be acceptable.

---

## KPI Strip

### Strip at 767px ✓
8 KPI cards in `.gh-kpi-strip`. On desktop these spread horizontally; on mobile they should wrap. Expected to use CSS `flex-wrap: wrap` with each card having a `min-width`. No overflow issue found in the template — defensive `|| 0` fallbacks prevent NaN from breaking the layout.

---

## Insight Grid (Chart | Pipeline | Job Performance)

### Grid Responsiveness ✓
`.gh-insight-grid` is expected to use CSS Grid. The layout should be 3-column on desktop, 2-column at medium, 1-column on mobile. This is defined in SCSS (not audited at source), but the template has no hardcoded widths that would prevent responsive collapse.

---

## Chart Card

### Chart Height on Mobile (OPEN ISSUE)
**Problem:** `.gh-chart-wrap` has `min-height: 180px` in the dashboard SCSS, but the inner `<app-dashboard-charts>` component has `.chart-container { height: 300px }` in its own SCSS. On mobile the outer min-height is irrelevant because the chart always forces 300px.

**Impact:** On a 375px-wide phone, the chart card will be taller than expected (300px for chart + padding + header + summary text ≈ ~360px minimum). Users on small phones must scroll past a tall chart card. This is non-blocking but affects UX.

**Recommendation:** In `dashboard-charts.component.scss`, change `.chart-container { height: 300px }` to use `min-height: 200px` and `max-height: 300px`, or add a `@media (max-width: 767px) { height: 220px }` rule. Alternatively, add `height: 220px` override from the parent via CSS custom property or ViewChild.

---

## Health Grid

### Three Cards Side by Side on Desktop, Stack on Mobile ✓
`.gh-health-grid` should collapse to 1-column on mobile. The subscription card with 3 meters may be tall on mobile (~300px+) but each meter is compact and the stacking is acceptable.

---

## Employer Branding Card

### Missing-Fields Chip Overflow
On very narrow screens (<375px), the missing-field chips in `.gh-miss-chips` could overflow if there are 4–6 missing fields (long chip labels like "contact number"). SCSS should set `flex-wrap: wrap` on `.gh-miss-chips`. Not audited at source — visual review recommended.

---

## Pipeline Section

### Stage Labels ✓
Stage labels come from the BE (`stage.label`) and are rendered as text. Long stage names could overflow on mobile. The bar-fill percentage is visual-only and safe.

---

## Summary Table

| Area | Status | Notes |
|------|--------|-------|
| Hero ring SVG overflow at 900px | Fixed ✓ | width/height attributes removed |
| Hero body stacking | Expected OK | Depends on SCSS flex-direction breakpoint |
| KPI strip wrap | Expected OK | 8 cards need flex-wrap |
| Insight grid responsiveness | Expected OK | 3→2→1 col via CSS Grid |
| Chart height on mobile | Open | 300px forces tall card; consider responsive height |
| Health grid stacking | Expected OK | 3→1 col on mobile |
| Missing-field chips overflow | Potential | flex-wrap needed on .gh-miss-chips |
| Mini ring SVG (80×80 attributes) | Minor | Container is fixed 80×80 so no overflow; consistent with parent |

**1 confirmed fix (SVG ring), 1 open issue (chart height), 1 potential issue (chip wrap) for mobile.**
