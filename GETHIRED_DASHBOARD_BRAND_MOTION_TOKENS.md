# GETHIRED DASHBOARD BRAND — Motion Tokens

**Scope:** Motion token usage and additions for `/recruiter/dashboard`

---

## Existing Token Source

All motion tokens are defined in:
```
C:\Users\paulg\OneDrive\Desktop\Gethired\get-hired-FE\src\assets\styles\_motion.scss
```

Imported at the top of `company-dashboard.component.scss`:
```scss
@import "src/assets/styles/motion";
```

---

## Existing Tokens Used on Dashboard

| Token | Value (from _motion.scss) | Usage on Dashboard |
|-------|--------------------------|-------------------|
| `$motion-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | All card reveals, button transitions, bar transitions, bar grow animations |
| `$motion-duration-micro` | typically `150ms` | KPI card hover transition, inbox card hover transition, button background transition |
| `.gh-pressable` | active-scale rule | All CTA buttons, KPI cards, inbox cards, job table review buttons |
| `.gh-success-pulse` | keyframe pulse animation | Available but not yet used on dashboard — deferred |

---

## New Motion Specifications Added (this pass)

These are defined directly in `company-dashboard.component.scss` as anonymous keyframes (not yet promoted to global tokens):

### `gh-ring-hero-fill`
```scss
@keyframes gh-ring-hero-fill {
  from { stroke-dashoffset: 188.5; }
}
```
- **Applied to:** `.gh-profile-ring svg circle:last-child`
- **Duration:** 900ms
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — spring decelerate (not from the standard token set — local override for premium ring feel)
- **Fill mode:** `both`

### `gh-ring-comp-fill`
```scss
@keyframes gh-ring-comp-fill {
  from { stroke-dashoffset: 213.6; }
}
```
- **Applied to:** `.gh-profile-comp-ring svg circle:last-child`
- **Duration:** 900ms (same as hero ring)
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)`

### `gh-bar-grow`
```scss
@keyframes gh-bar-grow {
  from { width: 0; }
}
```
- **Applied to:** pipeline bars (600ms), branding bar (700ms), subscription meters (650ms), insight bars (600ms)
- **Easing:** `$motion-ease-standard`
- **Fill mode:** `both`

---

## Stagger Delays (Hardcoded — not tokens)

| Usage | Values |
|-------|--------|
| KPI card stagger | 0, 30, 60, 90, 120, 150, 180, 210ms (30ms steps) |
| Inbox card stagger | 50, 100, 150, 200ms (50ms steps) |

**Recommended future tokens** (if added to `_motion.scss`):
```scss
$motion-stagger-step-sm:    30ms;  // KPI cards
$motion-stagger-step-md:    50ms;  // Inbox cards
$motion-duration-ring:      900ms; // SVG ring fill
$motion-duration-bar-grow:  650ms; // Progress bar grow (average)
$motion-ease-spring:        cubic-bezier(0.16, 1, 0.3, 1); // Ring spring
```

---

## Animation Duration Summary

| Animation | Duration | Easing | Element |
|-----------|----------|--------|---------|
| Hero enter | 450ms | `$motion-ease-standard` | `.gh-hero` |
| Card enter | 400ms | `$motion-ease-standard` | `.gh-card`, `.gh-inbox-main`, `.gh-inbox-card`, `.gh-kpi-card` |
| Error panel enter | 400ms | `$motion-ease-standard` | `.gh-dash-error-panel` |
| KPI card stagger | +0–210ms delay | — | `.gh-kpi-strip > *` |
| Inbox card stagger | +50–200ms delay | — | `.gh-inbox-cards .gh-inbox-card` |
| Ring fill | 900ms | spring `cubic-bezier(0.16, 1, 0.3, 1)` | SVG circles |
| Pipeline bar grow | 600ms | `$motion-ease-standard` | `.gh-pipeline-bar-fill--active` |
| Branding bar grow | 700ms | `$motion-ease-standard` | `.gh-branding-bar` |
| Subscription meter grow | 650ms | `$motion-ease-standard` | `.gh-sub-meter-fill` |
| Insight bar grow | 600ms | `$motion-ease-standard` | `.gh-insight-bar` |
| Button hover | `$motion-duration-micro` | `$motion-ease-standard` | `.gh-btn-coral`, KPI hover, inbox hover |
| Skeleton shimmer | 1400ms | `ease-in-out` | `@keyframes gh-shimmer` |

---

## Reduced Motion Overrides

Under `@media (prefers-reduced-motion: reduce)`:
- Global: `animation-duration: 0.001ms !important; transition-duration: 0.001ms !important`
- Ring/bar/error panel: `animation: none !important` (explicit disabling)
- Stagger delays: `animation-delay: 0ms !important` (ensures no delay if other animation properties are inherited)
- Skeleton: `animation: none; background: #f0edf8` (solid colour, no shimmer)
