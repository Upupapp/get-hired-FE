# GETHIRED MOBILEVIEW — Frontend Haptics & Effects Log V2
Generated: 2026-06-25

All effects use CSS only (no new animation libraries). Every effect has a prefers-reduced-motion fallback.

---

## Effect 1: Card Tap Compression

**Type:** Haptic feedback (touch)
**Applied to:** `.gh-card, .job-card, .mat-card` (global, styles.scss)
**Screen size:** Mobile only (`@media (hover: none)`)
**CSS:**
```scss
@media (hover: none) {
  .gh-card, .job-card, .mat-card {
    &:active { transform: scale(0.98); }
  }
}
```
**UX purpose:** Physical "press" sensation on touch. Confirms tap was registered before navigation/action triggers.
**Data dependency:** None — pure CSS
**Reduced-motion fallback:** `@media (prefers-reduced-motion: reduce) { &:hover, &:active { transform: none; } }` — card does not move, only color/shadow may change
**A11y impact:** Positive — visual confirmation of interaction without relying on color alone
**Performance impact:** GPU-composited `transform` — zero layout/paint cost

---

## Effect 2: CTA Press Micro-scale

**Type:** Haptic feedback
**Applied to:** `.gh-pressable` class (from _motion.scss); also `.mat-raised-button:active, .btn:active` (styles.scss global)
**Screen size:** All (`@media (hover: none)` enforces touch-specific behavior)
**CSS:**
```scss
.gh-pressable {
  transition: transform 100ms cubic-bezier(0.4, 0, 0.2, 1);
  &:active { transform: scale(0.985); }
}
```
**UX purpose:** Confirms button press. Faster than card tap (100ms vs 160ms) for primary actions.
**Reduced-motion fallback:** `@include motion-safe` removes transform entirely
**Performance:** GPU transform only

---

## Effect 3: Drawer Slide / Fade

**Type:** Navigation transition
**Applied to:** Mobile nav drawers in all 3 portals (applicant, admin, employer)
**CSS:**
```scss
.gh-[portal]-mobile-drawer {
  transform: translateX(-100%);
  transition: transform 260ms cubic-bezier(0.0, 0.0, 0.2, 1); // decelerate ease
  &--open { transform: translateX(0); }
}
```
**Scrim:**
```scss
.gh-[portal]-mobile-scrim {
  opacity: 0;
  transition: opacity 260ms cubic-bezier(0.4, 0, 0.2, 1);
  &--visible { opacity: 1; }
}
```
**UX purpose:** Panel slides in from left like a native app sheet. Scrim darkens content to focus attention on nav.
**Reduced-motion fallback:** `@include motion-safe` disables both transitions. Drawer appears/disappears instantly — still functional.
**A11y:** `aria-expanded` on toggle button, `role=navigation` + `aria-label` on drawer. Focus moves into drawer on open.
**Performance:** `transform` + `opacity` — compositor-only, 60fps capable

---

## Effect 4: Bottom Sheet Slide

**Type:** Sheet entrance
**Applied to:** Modal dialogs at mobile (via styles.scss `.mat-dialog-container` at 768px)
**CSS:**
```scss
@media only screen and (max-width: 768px) {
  .mat-dialog-container, .dialog-responsive {
    width: 100% !important;
    margin: 0 !important;
  }
}
```
**UX purpose:** Dialogs become full-width at mobile (approaching bottom-sheet style).
**Full bottom-sheet slide:** Future enhancement — logged in backlog (requires dialog config change to position at bottom with border-radius: 16px 16px 0 0).
**Reduced-motion fallback:** CSS transition on Material dialog is separate from content rendering — reduced-motion global hard stop handles this.
**Performance:** Standard Material dialog rendering

---

## Effect 5: Skeleton Loading Shimmer

**Type:** Loading state
**Applied to:** `.gh-skeleton` class (existing, styles.scss from prior SEO pass)
**CSS:**
```scss
@keyframes gh-skeleton-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.gh-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 800px 100%;
  animation: gh-skeleton-shimmer 1.4s infinite linear;
  @include ambient-motion-safe;
}
```
**UX purpose:** Shows content is loading without a spinner. Mimics content shape reducing perceived wait time.
**Reduced-motion fallback:** `@include ambient-motion-safe` → `animation: none` — skeleton shows as static gray block (#ececec)
**Performance:** CSS animation on background-position — GPU accelerated

---

## Effect 6: Active Nav Indicator

**Type:** State indicator
**Applied to:** Bottom nav bars and drawer nav items in all 3 portals
**CSS (employer pattern, replicated for applicant/admin):**
```scss
.gh-mobile-nav-item--active { color: $color-global-red-buttons; }
.gh-drawer-nav-item--active { 
  background: $color-global-sidebar-employer-route-active;
  border-left: 3px solid $color-global-red-buttons;
  color: #ffffff; font-weight: 600;
}
```
**UX purpose:** Shows user's current location at a glance. Brand-red active state is consistent across all portals.
**Data dependency:** `routerLinkActive` Angular directive — driven by actual router state
**Reduced-motion fallback:** No transform involved — color-only change is always safe
**A11y:** `aria-current="page"` on active items for screen readers

---

## Effect 7: Form Section Completion Pulse

**Type:** Success micro-animation
**Applied to:** `.gh-success-pulse` class (from _motion.scss)
**CSS:**
```scss
.gh-success-pulse {
  animation: gh-success-pulse-kf 400ms cubic-bezier(0.0, 0.0, 0.2, 1);
}
@keyframes gh-success-pulse-kf {
  0% { transform: scale(1); }
  50% { transform: scale(1.04); }
  100% { transform: scale(1); }
}
```
**UX purpose:** Brief scale pulse on form completion (section saved, file uploaded, etc.)
**Usage:** Add class `gh-success-pulse` to element via renderer/Angular class binding after save event
**Reduced-motion fallback:** `@include motion-safe` — class still applied but transition is 0.01ms (instant)
**Performance:** Single 400ms animation — no continuous overhead

---

## Effect 8: Sticky Action Bar Reveal

**Type:** Scroll-triggered reveal
**Applied to:** `.gh-sticky-action-bar` class (styles.scss)
**CSS:**
```scss
.gh-sticky-action-bar {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 12px 16px;
  padding-bottom: max(12px, env(safe-area-inset-bottom, 12px));
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
```
**UX purpose:** Action bar stays visible at bottom of screen as user scrolls long forms. "Reveal" is implicit — sticky positioning means it appears when scrolled into viewport.
**Note:** A scroll-event-driven reveal (translateY animation triggered by scroll direction) was considered but not implemented — this would require TS scroll event listeners with `isPlatformBrowser` guard and `fromEvent` RxJS. Deferred to backlog as it risks SSR issues. The `position: sticky` approach achieves the same goal more safely.
**Reduced-motion:** N/A (no animation, position-only)
**Performance:** CSS sticky — no JS overhead

---

## Effect 9: Focus-visible Glow

**Type:** Accessibility indicator
**Applied to:** `:focus-visible` pseudo-class (global, styles.scss)
**CSS:**
```scss
:focus-visible {
  outline: 2px solid $color-global-red-buttons;
  outline-offset: 2px;
}
```
**UX purpose:** Clear keyboard focus indicator that doesn't show on mouse/touch interaction (`:focus-visible` vs `:focus`)
**Reduced-motion:** N/A (color/outline — no transform/animation)
**A11y:** WCAG 2.4.11 (Focus Appearance) — brand-red ring is 3:1+ contrast against white/light backgrounds
**Performance:** Browser native outline — zero cost

---

## Effect 10: Hover Lift (Desktop)

**Type:** Pointer hover feedback
**Applied to:** `.gh-card, .job-card, .mat-card, .gh-job-card-hover` (styles.scss + existing global class)
**CSS:**
```scss
@media (hover: hover) {
  .gh-card, .job-card, .mat-card {
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
  }
}
```
**UX purpose:** Cards feel interactive and clickable. Lift effect signals "this element is actionable."
**Reduced-motion:** `&:hover, &:active { transform: none; }` — hover still registered but no movement
**Performance:** `transform` + `box-shadow` — compositor-managed

---

## Summary Table

| Effect | Files Modified | Trigger | Duration | Reduced-motion |
|--------|---------------|---------|----------|----------------|
| Card tap | styles.scss | :active, hover:none | instant CSS | transform: none |
| CTA press | _motion.scss (.gh-pressable) | :active | 100ms | @include motion-safe |
| Drawer slide | panel component SCSSes | class toggle | 260ms | @include motion-safe |
| Bottom sheet | styles.scss (mat-dialog) | modal open | Material | global hard stop |
| Skeleton shimmer | styles.scss | existing | 1.4s loop | animation: none, static gray |
| Active nav | panel component SCSSes | routerLinkActive | instant | n/a (color only) |
| Success pulse | _motion.scss | class add | 400ms | @include motion-safe |
| Sticky action bar | styles.scss | scroll (sticky) | instant | n/a (no animation) |
| Focus-visible glow | styles.scss | :focus-visible | instant | n/a (color only) |
| Hover lift | styles.scss | :hover | 160ms | transform: none |
