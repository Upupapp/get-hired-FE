# GETHIRED MOBILEVIEW — Responsive Design System Contract V3
Generated: 2026-06-26

This document is the authoritative contract for responsive design in GetHired FE.
All future responsive work must follow these established patterns.

---

## Breakpoints

| Name | Value | Meaning |
|------|-------|---------|
| stress | 280px | minimum stress test |
| compact | 360px | primary compact baseline |
| iPhone | 390px | iPhone 14 |
| tablet | 768px | tablet portrait / md breakpoint |
| laptop | 1024px | laptop transition |
| desktop | 1440px | desktop baseline |

Bootstrap breakpoints used: xs (<576px), sm (576px), md (768px), lg (992px), xl (1200px).
The primary mobile breakpoint used throughout is `max-width: 767px` (one pixel below md).

---

## Global Baseline (styles.scss)

The following global rules are in place and MUST NOT be removed:

```scss
*, *::before, *::after { box-sizing: border-box; }
body { overflow-x: hidden; }
img, video, iframe { max-width: 100%; height: auto; }
```

These prevent the three most common mobile layout failures: box model overflow, horizontal
scroll, and media element overflow.

---

## Touch Target Contract (WCAG 2.5.5)

All interactive elements MUST meet 44px minimum on both axes.

| Selector | Current Compliance | Location |
|----------|-------------------|----------|
| .btn-primary | PASS — min-height: 44px | styles.scss |
| .btn-outline-primary | PASS — min-height: 44px | styles.scss |
| .mat-icon-button, .icon-btn | PASS — 44×44px | styles.scss |
| .mat-option (mobile) | PASS — min-height: 48px | styles.scss @767px |
| .dropdown-item (mobile) | PASS — padding-top/bottom: 12px | styles.scss @767px |
| .form-control (mobile) | PASS — min-height: 44px | styles.scss @767px |
| .mat-select-trigger (mobile) | PASS — min-height: 44px | styles.scss @767px |
| .gh-mobile-menu-btn | PASS — 44×44px | employer-panel.component.scss |
| .gh-ap-mobile-menu-btn | PASS — 44×44px | applicant-panel.component.scss |
| .gh-admin-mobile-menu-btn | PASS — 44×44px | admin-panel.component.scss |
| .gh-drawer-close-btn | PASS — 44×44px | employer-panel.component.scss |
| .gh-ap-drawer-close-btn | PASS — 44×44px | applicant-panel.component.scss |
| .gh-admin-drawer-close-btn | PASS — 44×44px | admin-panel.component.scss |
| .gh-drawer-nav-item | PASS — height: 52px | employer-panel.component.scss |
| .gh-ap-drawer-nav-item | PASS — height: 52px | applicant-panel.component.scss |
| .gh-mobile-nav-item | PASS — min-height: 44px | employer-panel.component.scss |
| .gh-ap-mobile-nav-item | PASS — min-height: 44px | applicant-panel.component.scss |
| .gh-admin-mobile-nav-item | PASS — min-height: 44px | admin-panel.component.scss |
| .gh-mobile-card__action-btn | PASS — 44×44px | reusable-table.component.scss |
| .btn-apply-now | PASS — min-height: 44px | job-posts-details.component.scss |
| .btn-cta-primary | PASS — min-height: 44px | _portal-common.scss |
| .btn-link-cta | PASS — min-height: 44px | _portal-common.scss |
| .btn-find-jobs | PASS — height: 44px !important | banner.component.scss |
| .btn-take-interview | AT RISK — height: 40px, no min-height | recorder.component.scss |
| .btn-save-draft (job-create) | AT RISK — padding: 7px 25px, no min-height | job-create.component.scss |

---

## Reduced Motion Contract

Global rule in styles.scss:
```scss
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

All component-level animations also use `@include motion-safe` from `_motion.scss`.
Animations explicitly removed per reduced-motion in:
- All portal drawers (--open transform)
- Card reveal animations (@keyframes gh-card-reveal, emp-card-reveal)
- Skeleton shimmer (@keyframes gh-skeleton-shimmer, emp-shimmer)
- Portal hero reveal (portal-hero-reveal)
- Recorder pulse (gh-recorder-recording-pulse)
- Dialog bottom-sheet reveal (gh-sheet-reveal)

---

## Safe Area Insets

Bottom navigation bars and drawer footers use:
```scss
padding-bottom: env(safe-area-inset-bottom, 0px);
```

Signin form column uses:
```scss
padding-bottom: env(safe-area-inset-bottom, 16px);
```

Billing bar uses:
```scss
bottom: calc(56px + env(safe-area-inset-bottom, 0px));
```

---

## Mobile Navigation Pattern

Three portals each have their own mobile nav system:

| Portal | Top bar class | Drawer class | Bottom nav class |
|--------|--------------|-------------|-----------------|
| Employer/Recruiter | .gh-mobile-topbar | .gh-mobile-drawer | .gh-mobile-nav |
| Applicant | .gh-ap-mobile-topbar | .gh-ap-mobile-drawer | .gh-ap-mobile-nav |
| Admin | .gh-admin-mobile-topbar | .gh-admin-mobile-drawer | .gh-admin-mobile-nav |

All three use:
- d-flex d-md-none to show only on mobile
- cdkTrapFocus + cdkTrapFocusAutoCapture for keyboard trapping
- @ViewChild #mobileMenuBtn + setTimeout focus return on close (WCAG 2.4.3)
- aria-expanded, aria-label, aria-controls on hamburger button
- aria-current="page" on active nav items
- Escape key handler via @HostListener

---

## Dialog Pattern

On mobile (max-width: 767px), all MatDialogs convert to bottom-sheet style:
- border-radius: 16px 16px 0 0
- positioned at flex-end (bottom of viewport)
- max-height: 90vh with overflow-y: auto
- Entry animation: gh-sheet-reveal (disabled under reduced-motion)

---

## Motion Tokens (from _motion.scss)

| Token | Value |
|-------|-------|
| $motion-duration-micro | 160ms |
| $motion-duration-card | 220ms |
| $motion-duration-drawer | 260ms |
| $motion-ease-standard | cubic-bezier(0.4, 0, 0.2, 1) |
| $motion-ease-decelerate | cubic-bezier(0.0, 0.0, 0.2, 1) |
| $gh-scale-press | 0.985 |
| $gh-lift | -2px |
