# GETHIRED MOBILEVIEW REPORT — SEC-01 V1
Generated: 2026-06-25
Scope: SEC-01 BOLA fix deployment — mobile compatibility audit

---

## SUMMARY

All 7 SEC-01 CSS effects are safe on mobile. One critical mobile bug was found and fixed (Login button hidden on mobile via `d-lg-flex`). Three additional safe fixes applied to button touch targets and banner overflow.

---

## 1. SEC-01 SCSS — MOBILE COMPATIBILITY AUDIT

File: `src/app/applicant-panel/applicant-profile/applicant-profile-details/applicant-profile-details.component.scss`

### 1a. Skeleton Shimmer (`gh-profile-skeleton`)

**Status: PASS with one note.**

- The shimmer uses `background-size: 800px 100%` with a fixed-pixel keyframe sweep (`-400px → +400px`).
- On narrow mobile viewports (320–375px) the 800px sweep still works because the gradient covers the full element width via `background-size: 800px 100%` — no fixed-width issue. The element itself is fluid (width set on modifier classes like `w-60`/`w-40`/`w-80` which are percentage values).
- `@include ambient-motion-safe` correctly suppresses the animation under `prefers-reduced-motion`.
- Avatar skeleton is `80px x 80px` — safe, fits in any mobile viewport.
- **No fix needed.**

### 1b. Card Reveal Animation (`gh-profile-card`)

**Status: PASS.**

- Uses `opacity + translateY(8px)` — this is a vertical-only micro-shift of 8px. No horizontal movement, so no horizontal scroll jank on mobile.
- Duration: `$motion-duration-card` = 220ms — within the safe microinteraction range.
- `@include motion-safe` suppresses under reduced-motion.
- No `will-change` or compositor-unfriendly properties.
- **No fix needed. No scroll jank risk.**

### 1c. Error Banner (`gh-profile-error-banner`)

**Status: PASS after fix.**

- Banner uses `display: flex; align-items: flex-start` with icon + message columns — stacks fine at any width.
- No fixed width. Padding 12px/16px — sufficient breathing room at 320px.
- `font-size: 14px` — readable.
- **Fix applied:** Added `word-break: break-word; overflow-wrap: break-word; hyphens: auto` inside `@media (max-width: 767px)` to prevent long error message strings from causing horizontal overflow on narrow phones.

### 1d. Session-Expired Banner (`gh-session-expired-banner`)

**Status: PASS after fix.**

- Banner is a block element — full-width by default, no overflow risk from layout.
- `padding: 14px 18px` — fine at 320px.
- **Fix applied:** Same `word-break/overflow-wrap/hyphens` guard as error banner. Long token/session strings in message content could overflow without this.

### 1e. Retry Button and Sign-in CTA (`gh-profile-retry-btn`, `gh-profile-cta-btn`, `gh-signin-cta`)

**Status: FAIL → FIXED.**

- Original: no explicit height/min-height set. Actual rendered height depends on font-size + padding of the consuming element, which was not guaranteed to hit 44px.
- WCAG 2.5.5 requires 44×44px minimum touch target on mobile.
- **Fix applied:** Added `min-height: 44px; padding-left: 20px; padding-right: 20px` to both `.gh-profile-cta-btn` / `.gh-profile-retry-btn` and `.gh-signin-cta`.
- Also added `@media (max-width: 767px)` rule stacking these buttons to `width: 100%; justify-content: center` for single-column layout on mobile.

### 1f. Mobile Tap Feedback (`@media (hover: none)`)

**Status: PASS (already corrected in SCSS).**

- The file already uses `@media (hover: none) and (pointer: coarse)` which correctly targets only touch screens — avoids falsely triggering on laptops that report `hover: none` (some hybrid devices).

---

## 2. LOGIN BUTTON MOBILE AUDIT

### Finding: CRITICAL BUG — Login button hidden on mobile viewports

**File:** `src/app/core/header/header.component.html`
**Line 47 (original):**
```html
<div class="dropdown d-lg-flex ms-4" *ngIf="!isUserLoggedIn">
```

**Root cause:** Bootstrap's `d-lg-flex` applies `display: flex` only at breakpoints ≥992px (Bootstrap `lg`). Below 992px, the class reverts to the default `display` (which Bootstrap normalizes to `display: none` for `d-lg-*` utilities). This means on all mobile and tablet screens (up to 991px), the Login button is completely hidden — even when the hamburger menu is expanded.

The hamburger toggler reveals the `collapse navbar-collapse` div (which contains the full nav list), so other nav items appear when the menu is opened — but the Login button wrapper's own `d-lg-flex` class makes it invisible regardless of the hamburger state.

**Impact:** Any guest/unauthenticated visitor on a mobile or tablet device (up to 991px wide) cannot see or tap the Login button. This is a hard blocker for mobile auth.

**Fix applied:**
```html
<!-- Before -->
<div class="dropdown d-lg-flex ms-4" *ngIf="!isUserLoggedIn">
<!-- After -->
<div class="dropdown d-flex ms-4" *ngIf="!isUserLoggedIn">
```
`d-flex` is always `display: flex` regardless of breakpoint. The button is now visible on all screen sizes.

**Touch target fix also applied:**  
`src/app/core/header/header.component.scss` — `.btn-nav-gradient` had `height: 38px !important` which is below the 44px WCAG minimum. Added `min-height: 44px !important` to override on mobile.

---

## 3. PUBLIC LANDING PAGES — LOGIN/SIGN-IN AUDIT

### main-portal.component.html

- Hero section contains a `(click)="goToSignin()"` inline "Sign in" `btn-link-cta` button — visible above the fold in the `portal-hero-copy` block.
- Another "Sign in" appears in the final CTA section.
- Both are plain `<button>` elements with `btn-link-cta` class.
- `btn-link-cta` in `_portal-common.scss` has `padding: 4px 8px` — touch target is below 44px height. However these are **secondary** ghost links (not the primary CTA), and they appear inside `portal-hero-secondary` which on mobile (≤575px breakpoint) has `text-align: center` and is visible within the scroll viewport.
- Primary mobile CTAs ("Find jobs", "Start hiring") have `min-height: 44px` enforced by the `@media (max-width: 575px)` block in `main-portal.component.scss`.
- **No new fix applied to btn-link-cta** — these secondary links are intentionally low-prominence and increasing their size would change visual design.

### employer-portal.component.html

- Hero contains `(click)="goToSignin()"` as a `btn-cta-outline` button ("Sign in") — this has `padding: 10px 22px` which renders at ~42px height, borderline.
- Primary "Start hiring" button is above the fold.
- Sign-in button is within the hero CTA group, visible on first scroll position.

### job-seeker-portal.component.html

- Hero contains `(click)="goToSignin()"` as `btn-link-cta`.
- Also has "Create free account" and "Browse jobs" as primary actions.

---

## 4. APPLICANT PROFILE PAGE READABILITY — POST SEC-01

**Overall: READABLE on mobile.**

The actual profile content (`profile-details.component.html` → `preview.component.html`) uses the existing card layout with `class="card card-body"` and Bootstrap's fluid container. The SEC-01 changes are additive overlay states (skeleton/error/session-expired banners) that sit above the content — they do not alter the profile's content layout.

The base profile SCSS (`src/app/applicant/profile-details/profile-details.component.scss`) has no fixed widths that would cause overflow. Existing card/layout patterns use Bootstrap responsive classes.

---

## 5. FIXES APPLIED (3 files)

| File | Change | Reason |
|---|---|---|
| `applicant-profile-details.component.scss` | Added `min-height: 44px` + padding to `.gh-profile-cta-btn`, `.gh-profile-retry-btn`, `.gh-signin-cta` | WCAG 2.5.5 touch target |
| `applicant-profile-details.component.scss` | Added `@media (max-width: 767px)` block: word-break + overflow-wrap on banners, full-width stacking for CTAs | Banner overflow prevention + mobile layout |
| `header.component.html` | `d-lg-flex` → `d-flex` on Login button wrapper | Critical: Login button invisible on all mobile viewports |
| `header.component.scss` | Added `min-height: 44px !important` to `.btn-nav-gradient` | WCAG 2.5.5: button was hardcoded at 38px |

---

## 6. ITEMS NOT FIXED (intentional)

- `btn-link-cta` secondary link buttons on public pages — below 44px touch target but intentionally ghost/secondary. Enlarging would change design intent.
- `btn-cta-outline` "Sign in" on employer-portal — borderline at ~42px, close enough for secondary action.
- No security logic was touched. All changes are pure CSS/HTML layout.

---

## 7. SECURITY PERIMETER

No security logic was modified. The SEC-01 BOLA guard (ownership check, 403 detection, token validation) is in TypeScript/interceptor files and was not touched. All changes are CSS and a single HTML class attribute change on a purely visual container.
