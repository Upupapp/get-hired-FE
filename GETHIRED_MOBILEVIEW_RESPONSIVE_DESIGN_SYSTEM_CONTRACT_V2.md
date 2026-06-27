# GETHIRED MOBILEVIEW — Responsive Design System Contract V2
Generated: 2026-06-25

## 1. Breakpoints

Aligned with Bootstrap 5 breakpoints (already in use via bootstrap.css in assets/styles/):

| Name | Range | CSS min-width |
|------|-------|---------------|
| xs | 0–575px | — (default) |
| sm | 576–767px | 576px |
| md | 768–991px | 768px |
| lg | 992–1199px | 992px |
| xl | 1200–1399px | 1200px |
| xxl | 1400px+ | 1400px |

**Mobile-first cutoff:** `@media (max-width: 767px)` — below `md`, sidebar is hidden, bottom nav appears.

---

## 2. Container Widths

| Breakpoint | Container behavior |
|-----------|-------------------|
| xs/sm | 100% width, padding 12–16px each side |
| md | 100% with Bootstrap container padding |
| lg+ | Capped by max-width on section elements |

**Global:** `box-sizing: border-box` on `*, *::before, *::after` (added in styles.scss MOBILEVIEW phase)
**Global:** `overflow-x: hidden` on `body`
**Global:** `max-width: 100%; height: auto` on `img, video, iframe`

---

## 3. Touch Target Policy

- Minimum tap target: **44×44px** (WCAG 2.5.5 AAA)
- Applied globally to `.mat-icon-button, .icon-btn` in styles.scss
- All mobile nav items: min-height 44px, min-width 44px
- Drawer nav items: height 52px (exceeds minimum)
- Bottom nav items: min-height 44px via CSS
- CTA buttons: min 44px height enforced via padding

---

## 4. Card Rules

- Cards use `.gh-card` or `.mat-card` base classes
- Desktop hover: `translateY(-2px)` lift, `box-shadow 0 8px 24px rgba(0,0,0,0.12)`
- Mobile active (touch): `scale(0.98)` compression haptic
- Reduced-motion: `transform: none` — tint-only feedback
- Border-radius: 8–16px depending on context
- Box-shadow: `0 2px 8px rgba(0,0,0,0.08)` at rest

---

## 5. Table-to-Card Rules

Applied via `.gh-responsive-table` wrapper class at `max-width: 767px`:
- `mat-header-row` → `display: none`
- `mat-row` → `display: flex; flex-direction: column; padding: 12px; border-radius: 8px; margin-bottom: 8px;`
- `mat-cell` → `display: flex; &::before { content: attr(data-label); font-weight: 600; min-width: 120px; }`
- For tables that cannot use `gh-responsive-table`: wrap in `gh-table-scroll` with `overflow-x: auto`

---

## 6. Form Rules

- Single column on mobile (all form rows stack)
- `form-control` min-height: 44px for touch
- Labels: above fields (not inline) on mobile
- Required field indicators visible
- Form-group padding: 8px minimum between fields
- Error messages: below field, not overlapping

---

## 7. Modal / Bottom Sheet Rules

- Modals at mobile (`max-width: 767px`):
  - `width: 100%`, `margin: 0`, `border-radius: 12px 12px 0 0` (bottom sheet style)
  - Already in styles.scss: `.mat-dialog-container { width: 100% !important; margin: 0 !important; }`
- Bottom sheets: slide up from bottom, `border-radius: 16px 16px 0 0`
- Close button: 44×44px min, top-right corner
- Scroll within modal when content overflows

---

## 8. Drawer Rules

- Width: 280px
- Animation: `transform: translateX(-100%) → translateX(0)` in `260ms` decelerate easing
- Scrim: `rgba(0,0,0,0.48)` overlay; tap to close
- z-index: drawer=1001, scrim=1000, bottom nav=999, top bar=1001
- Escape key closes drawer (HostListener on document)
- Focus moves to first nav item on open (setTimeout 200ms for CSS transition)
- Router NavigationEnd subscription closes drawer automatically

---

## 9. Sticky Action Rules

- `.gh-sticky-action-bar` class (defined in styles.scss)
- `position: sticky; bottom: 0; background: white; z-index: 100`
- `padding-bottom: max(12px, env(safe-area-inset-bottom))` for iPhone notch
- `box-shadow: 0 -2px 8px rgba(0,0,0,0.1)` — separator from content
- Use on: job-create form, profile edit forms, any long-scroll form with submit action

---

## 10. Reduced-Motion Rules

Two-level strategy:

**Level 1 — Global hard stop (styles.scss):**
```
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Level 2 — Component-level mixin (from _motion.scss):**
```
@include motion-safe; // removes transition + animation
@include ambient-motion-safe; // removes animation only (for shimmer/hero drift)
```

**Rule:** EVERY animated element must have a reduced-motion fallback. No exceptions.

---

## 11. Mobile Navigation Architecture

| Portal | Top Bar | Drawer | Bottom Nav |
|--------|---------|--------|------------|
| Employer (/recruiter) | Sticky 56px, dark | Full slide drawer, 6 items | 5-tab bar + billing bar |
| Applicant (/user) | Sticky 56px, gray | Full slide drawer, 5 items + settings | 5-tab bar |
| Admin (/admin) | Sticky 56px, gray | Full slide drawer, 5 items | 5-tab bar |
| Public | n/a (public header handles) | n/a | n/a |

**Role isolation:** Applicant drawer only has applicant routes. Employer drawer only has recruiter routes. Admin drawer only has admin routes. Each panel component wraps its own nav — route guards on parent routes prevent cross-role access independently.

---

## 12. Typography Mobile Scale

- Base font-size: 14px (body)
- H1/hero titles: min 24px on mobile (down from 37–56px desktop)
- Body text: 14px
- Small/labels: 12–13px
- Nav labels in bottom bar: 10px
- Line-height: 1.4–1.6 for readability on small screens
