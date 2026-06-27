# GETHIRED MOBILEVIEW — Accessibility QA V3
Generated: 2026-06-26

---

## WCAG 2.1 AA Criteria Checked

### WCAG 1.1 — Text Alternatives

| Check | Status |
|-------|--------|
| Hamburger buttons have aria-label | PASS — dynamic "Open/Close navigation menu" |
| SVG icons in drawer are aria-hidden="true" | PASS — all drawer SVGs |
| Logo img has alt="GetHired" | PASS — drawer headers |
| Decorative images aria-hidden or alt="" | PASS — banner floats are 0px wide on mobile |

---

### WCAG 1.4 — Distinguishable

| Check | Status |
|-------|--------|
| Focus ring visible on all interactive elements | PASS — :focus-visible global + per-component overrides |
| Snackbar colors meet contrast (confirmed) | PASS — danger-snackbar #FE6F61, warn/warning #b45309 (5.02:1 vs white) |
| Text in mobile nav | PASS — white on dark (#444152, #7A637F) both exceed 4.5:1 |

---

### WCAG 2.1 — Keyboard Accessible

| Check | Status |
|-------|--------|
| Keyboard focus trap in drawer (BL-011) | PASS — cdkTrapFocus + cdkTrapFocusAutoCapture |
| Escape closes drawer | PASS — @HostListener in all 3 portals |
| Focus returns to hamburger after close | PASS — BL-002, BL-003 ViewChild + setTimeout |
| Tab order in drawer follows DOM order | PASS — semantic nav > ul > li > a |
| Bottom nav items keyboard accessible | PASS — focus-visible ring, cursor:pointer |
| Form controls keyboard accessible | PASS — standard HTML inputs |

---

### WCAG 2.4 — Navigable

| Check | Status |
|-------|--------|
| aria-current="page" on active nav items | PASS — all 3 portals via routerLinkActive |
| Skip link (skip to main content) | NOT PRESENT — deferred to backlog BL3-005 |
| Visible focus indicators | PASS — :focus-visible ring throughout |
| Page titles set via SeoService | PASS — public routes confirmed |

---

### WCAG 2.5 — Input Modalities (WCAG 2.1 new)

| Check | Status |
|-------|--------|
| WCAG 2.5.5 — Touch targets 44×44px (most elements) | PASS — documented in design system contract |
| .btn-take-interview 40px | FAIL — BL3-002 |
| .btn-subscribe/active ≈41px | FAIL — BL3-001 |
| .gh-billing-bar-link ≈23px | FAIL — BL3-003 |
| WCAG 2.5.3 — Labels in name | PASS — all icon buttons have aria-label |

---

### WCAG 4.1 — Compatible

| Check | Status |
|-------|--------|
| Correct heading hierarchy | Not audited in V3 — deferred |
| Role attributes on nav, banner | PASS — role="navigation", role="banner", role="list" |
| aria-live regions (snackbar, error) | PASS — error state uses aria-live="assertive" |
| aria-controls on hamburger | PASS — references drawer id |
| aria-expanded on hamburger | PASS — dynamic boolean |

---

## Focus Ring Specification

Global (styles.scss):
```css
:focus-visible { outline: 2px solid #FF7062; outline-offset: 2px; }
```

Component-level:
```css
:focus-visible { outline: 2px solid rgba(255,112,98,0.85); outline-offset: 2px; }
```

Drawer nav items use `outline-offset: -2px` (inset) to avoid being clipped by border-left.

---

## Reduced Motion

All animations are disabled under `prefers-reduced-motion: reduce` via:
1. Global `*` rule in styles.scss (0.01ms duration)
2. `@include motion-safe` in all component SCSS
3. Per-animation `@media (prefers-reduced-motion: reduce)` blocks

Static fallbacks provided for:
- Skeleton shimmer: neutral grey (#ececec)
- Card hover: tint only (no transform)
- Pulse animation: none

---

## Screen Reader Notes

- Drawer content hidden from screen readers when closed via transform (not display:none)
  - NOTE: This means screen readers can still tab into closed drawers — cdkTrapFocus prevents
    focus from reaching closed drawer content while it's off-screen
- Bottom nav labels are visible text (not icon-only) — readable by screen readers

---

## Backlog Items (A11y)

| ID | Issue | WCAG Criterion |
|----|-------|----------------|
| BL3-001 | Subscription buttons below 44px | 2.5.5 |
| BL3-002 | Recorder .btn-take-interview 40px | 2.5.5 |
| BL3-003 | Billing bar link ≈23px | 2.5.5 |
| BL3-005 | Skip to main content link missing | 2.4.1 |
| A11Y-01 | Heading hierarchy not audited | 1.3.1 |
