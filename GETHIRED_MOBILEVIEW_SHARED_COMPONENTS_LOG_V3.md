# GETHIRED MOBILEVIEW — Shared Components Log V3
Generated: 2026-06-26

---

## Reusable Table (shared/components/reusable-table)

**Mobile card system — FULLY AUDITED:**

### #table-container (desktop)
- mat-table with mat-sort, overflow-x:auto
- Collapses to 600px wide at 1200px screen — requires horizontal scroll (intended)
- Hidden on mobile via `d-none d-md-block` (Bootstrap)

### #table-container-mobile (mobile card list)
- Visible on mobile via `d-block d-md-none` (Bootstrap)
- `.gh-mobile-card` per row:
  - White card, border-radius:10px, box-shadow
  - gh-card-reveal animation (reduced-motion: animation:none)
  - Tap compression on :active (reduced-motion: transform:none)
  - Selected state: blue tint
- `.gh-mobile-card__action-btn` — min 44×44px, focus-visible ring, tap compression

### Pagination
- BL-013: `.pagination-info` and `.pagination-controls` stack at 575px — CONFIRMED
- `.dataTables_info`, `.dataTables_paginate` also stacked

---

## App Header (shared)

Not deeply audited this round. The header component appears before the portal-specific
shells and handles user avatar + logout. Assumed to use Bootstrap navbar collapse.

---

## Empty Section (app-empty-section)

Used in job list when filter results are empty. Not audited in detail.
Expected to have basic text + icon layout.

---

## Error / Not Found Page (views/error-page)

- Connected to wildcard `**` route in app.routing.module.ts
- Not audited for mobile in V3 — deferred

---

## Portal Common SCSS (_portal-common.scss)

**Key mobile-relevant rules (from V2 audit):**
- `.btn-cta-primary`: min-height: 44px, padding:12px 24px — PASS
- `.btn-link-cta`: min-height: 44px, display:inline-flex — PASS
- `.portal-quick-search`: flex-direction:column at 575px — PASS
- `.portal-hero-title`: font-size:24px at 575px — PASS
- `.portal-bento-grid`: repeat(2, 1fr) at 991px

---

## Skeleton Components (gh-skeleton-card)

- `.gh-skeleton`: shimmer animation, @include ambient-motion-safe — CONFIRMED
- Reduced motion: animation:none, static bg #ececec
- `.gh-skeleton-card`: white card, border-radius:12px, padding:20px

---

## Focus Ring Contract

Global `:focus-visible` in styles.scss:
```scss
:focus-visible {
  outline: 2px solid $color-global-red-buttons;
  outline-offset: 2px;
}
```

Component-level overrides use same `rgba($color-global-red-buttons, 0.85)` — consistent.

---

## Motion Contract

`.gh-pressable` class from `_motion.scss`:
```scss
.gh-pressable {
  transition: transform 100ms $motion-ease-standard;
  @include motion-safe;
  &:active { transform: scale($gh-scale-press); }
}
```

Applied in: signin CTA button, job list cards.

---

## Issues Found

| ID | Component | Issue | Severity | Status |
|----|-----------|-------|----------|--------|
| SHR-01 | app-header | Mobile nav behavior not audited | Low | Deferred V4 |
| SHR-02 | error-page | Mobile layout not audited | Low | Deferred V4 |
| SHR-03 | app-empty-section | Mobile layout not audited | Low | Deferred V4 |
