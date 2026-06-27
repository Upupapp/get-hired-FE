# GETHIRED BRAND — Motion Tokens (Phase 11)
**BRAND v6 · 2026-06-27**

---

## Token Reference

### Duration Tokens (CSS custom properties)

| Token | Value | Use |
|---|---|---|
| `--gh-motion-instant` | 80ms | Press/select feedback |
| `--gh-motion-micro` | 160ms | Hover, focus, chip select |
| `--gh-motion-card` | 220ms | Card enter, card hover lift |
| `--gh-motion-drawer` | 260ms | Drawer, dialog, sidebar open |
| `--gh-motion-page` | 300ms | Page-level transitions |
| `--gh-motion-meter` | 600ms | Meter fill, ring fill |
| `--gh-motion-reveal` | 400ms | Panel/section reveal |
| `--gh-motion-analysis` | 720ms | CV Health ring fill |
| `--gh-motion-countup` | 900ms | KPI number countup |

### SCSS Variables (existing, extended)

| Variable | Value |
|---|---|
| `$motion-duration-micro` | 160ms |
| `$motion-duration-card` | 220ms |
| `$motion-duration-drawer` | 260ms |
| `$motion-duration-meter-fill` | 650ms |
| `$motion-duration-ambient` | 6000ms |

### Easing Tokens

| Token | Value | Use |
|---|---|---|
| `--gh-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | General transitions |
| `--gh-ease-enter` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Elements entering |
| `--gh-ease-exit` | `cubic-bezier(0.4, 0.0, 1, 1)` | Elements leaving |
| `--gh-ease-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | Emphasized enter (modals, hero) |
| `--gh-ease-scan` | `cubic-bezier(0.16, 1, 0.3, 1)` | CV Doctor scan, signal reveals |
| `--gh-ease-spring-soft` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Chip pop, badge reveal |

### Scale Tokens

| Token | Value | Use |
|---|---|---|
| `--gh-scale-press` | 0.985 | Button/card press |
| `--gh-scale-chip-press` | 0.97 | Filter chip press |
| `--gh-scale-card-enter` | 0.985 | Card entrance scale-from |

### Distance / Lift Tokens

| Token | Value | Use |
|---|---|---|
| `--gh-motion-shift-xs` | 2px | KPI hover lift, subtle shift |
| `--gh-motion-shift-sm` | 4px | Standard micro shift |
| `--gh-motion-shift-md` | 8px | Card entrance translateY |
| `--gh-motion-shift-lg` | 12px | Section entrance translateY |
| `--gh-motion-lift` | -2px | Global card hover lift |
| `--gh-motion-lift-strong` | -4px | Job card hover lift |

---

## Core Utility Classes

### `.gh-pressable`
Button/card press scale. Already defined in `_motion.scss`. Preserved.

### `.gh-card` (entrance)
On-load card entrance: fade + translateY(-8px) → 0 over 220ms.

### `.gh-dashboard-card`
Dashboard card entrance: fade + translateY(-10px) → 0 over 300ms `--gh-ease-emphasized`.
Stagger via nth-child delay (0, 40, 80ms etc.).

### `.gh-dashboard-kpi`
KPI card entrance: fade + scale(0.985 → 1) over 220ms `--gh-ease-standard`.
Countup animation on KPI numbers controlled by JS (not CSS).

### `.gh-plan-meter`
Plan usage meter: width animates from 0 to real `%` value once on reveal (600ms `--gh-ease-scan`).
`prefers-reduced-motion`: instant to final value.

### `.gh-brand-health-card`
Employer branding health section entrance: fade + translateY(-8px) → 0 over 300ms.

### `.gh-dashboard-skeleton`
Dashboard loading skeleton with shimmer. See Loading System doc.

### `.gh-plan-health-skeleton`
Plan health skeleton (badge + meters). See Loading System doc.

### `.gh-success-pulse`
Success micro-animation. Already defined in `_motion.scss`. Preserved.

---

## Implementation in `_motion.scss`

See the extended `_motion.scss` file (updated in BRAND v6). New additions appended under `// ── BRAND v6 additions ─────────────────────`.

---

## `prefers-reduced-motion` Global Contract

The global `@media (prefers-reduced-motion: reduce)` block in `styles.scss` disables ALL animation/transition durations to `0.01ms` globally. This means all CSS classes naturally respect it without per-class override — any `animation` or `transition` is suppressed.

Component-level `@include motion-safe` provides redundant per-element suppression for clarity and specificity safety.

---

## Adoption Status

| Class | Adopted | Location |
|---|---|---|
| `.gh-pressable` | Yes | Global `_motion.scss` + `styles.scss` |
| `.gh-success-pulse` | Yes | Global `_motion.scss` |
| `.gh-error-panel`, `.gh-fallback-page` | Reserved | `_motion.scss` (no-op, styles TBD per screen) |
| `.gh-dashboard-card` | v6 — Added to `_motion.scss` | Adopted in company-dashboard.component.scss |
| `.gh-dashboard-kpi` | v6 — Added to `_motion.scss` | Adopted in company-dashboard.component.scss |
| `.gh-plan-meter` | v6 — Added to `_motion.scss` | Available; not yet applied to plan meter |
| `.gh-brand-health-card` | v6 — Added to `_motion.scss` | Available; not yet applied |
| `.gh-dashboard-skeleton` | v6 — Added to `_motion.scss` | Available; aligned with existing emp-dash-hero-skeleton |
| `.gh-plan-health-skeleton` | v6 — Added to `_motion.scss` | Available; not yet applied |
