# BL-012 — Sign-In Carousel Mobile Fix Log
**Date:** 2026-06-25
**Status:** COMPLETE — build passes

---

## Phase 1 — Audit Findings

### Carousel Type and Library
- **Library:** Bootstrap 5 native carousel — pure HTML/CSS, no third-party JS library (no Owl Carousel, no Swiper, no ngb-carousel, no Angular Material carousel)
- **Trigger:** `data-bs-ride="carousel"` on the container div — this activates Bootstrap's default 5000 ms autoplay interval
- **Slides:** 3 slides with product marketing copy and placeholder images
- **Indicators:** 3 Bootstrap `.carousel-indicators` buttons (focusable, keyboard-navigable)

### Layout Analysis
The template used a two-column Bootstrap row:
- Left column: `col-12 col-md-12 col-lg-6` — carousel + `.bg-left` background image, `min-height: 100vh`
- Right column: `col-12 col-md-12 col-lg-6` — login form

At `lg+` (≥992px): columns sit side by side (carousel left, form right).
Below `lg`: both columns become `col-12` and stack vertically. The carousel column (with `min-height: 100vh`) occupies the **entire viewport** before the form column. The form is below the fold and unreachable without scrolling.

### Content Assessment
No fake content found:
- No fake testimonials, no fake user counts, no fake company logos
- Content is legitimate product description: "Bring all your applicants in ONE PLATFORM in just 3 clicks", automated interviews, hiring tagline
- Slides are safe to show on desktop

### SSR Risk Assessment
- Carousel HTML is pure Bootstrap 5 markup — no `window.*` or `document.*` calls at module load
- Pre-existing `localStorage.getItem()` calls at class property initialization (lines 21-22 in signin.component.ts) are an existing SSR risk unrelated to this task — not touched
- `window.scroll(0, 0)` in `showError()` is called inside a method (not at module init) — acceptable, runs only in browser event handlers
- No new SSR risk introduced by this fix

### Reduced-Motion Assessment
- Angular `@animate` trigger (`mainAnimations`) fires `600ms` translate/opacity animation on slide entry via `useAnimation(reusable)`
- Global `styles.scss` already includes the universal reduced-motion contract: `animation-duration: 0.01ms !important; transition-duration: 0.01ms !important` under `@media (prefers-reduced-motion: reduce)`
- `_motion.scss` provides `@mixin motion-safe` (imported into this component's SCSS as part of this fix)
- Bootstrap's carousel slide transition is also zeroed by the global rule

---

## Phase 2 — Risk Assessment

| Risk | Severity | Notes |
|------|----------|-------|
| Form below fold on mobile | HIGH | Carousel's `min-height: 100vh` pushes form off-screen on all screens < 992px |
| Carousel indicator buttons focusable on mobile | MEDIUM | Decorative slides with focusable buttons add unnecessary tab stops |
| Bootstrap autoplay (5000ms) with no `prefers-reduced-motion` guard | LOW | Suppressed by global CSS rule already in place |
| No `aria-hidden` on decorative column | LOW | Screen readers traverse decorative content |

---

## Phase 3 — Treatment Chosen: Option A (Hide on Mobile)

**Rationale:** The carousel content is legitimate product marketing and has no interactivity the user needs to complete login. The form is the sole required element. Hiding the decorative column below `lg` eliminates the overflow risk with zero JS and zero SSR exposure. Desktop layout is completely unchanged.

Option B (static trust card) was unnecessary — the carousel content is genuine, not fake, so there's nothing to replace.
Option C (disable autoplay only) would not fix the form-push-down since `min-height: 100vh` still applies.

---

## Changes Made

### `signin.component.html`
**Structural changes:**
1. **Form column moved first in DOM** — `col-12 col-lg-6 order-first order-lg-last bg-form gh-signin-form-col` — ensures form is the first focusable element on all screen sizes and the primary visible element on mobile
2. **Carousel column hidden on mobile** — `d-none d-lg-block` on the carousel `div`; column also gains `aria-hidden="true"` since all content is decorative
3. **Carousel column order** — `order-lg-first` places it visually on the left at desktop, matching the original design
4. **Submit button** — added `gh-pressable` class for mobile tap compression (scale 0.985 on `:active`), defined in `_motion.scss` with `@include motion-safe`
5. **Container** — changed `vh-100` to `min-vh-100` to allow the form to grow on very small screens without clipping

**All form fields preserved:**
- Email input (type="email", formControlName="email")
- Password input (type="password"/"text" toggle, formControlName="password")
- Show/hide password toggle
- Error alert panel
- Forgot Password link
- Remember Me checkbox
- Sign In submit button
- "Don't have an account? Register" link

### `signin.component.scss`
1. **Imported `_motion.scss`** — makes `@mixin motion-safe` available for component-local use
2. **`.gh-signin-form-col`** — `min-height: 100vh`, `overflow-x: hidden`, flex centering, 16px side padding + safe-area-inset-bottom on `max-width: 575px`
3. **`.carousel-item`** — `@include motion-safe` applied as belt-and-suspenders for Bootstrap slide transitions
4. **`@keyframes gh-trust-reveal`** — `opacity 0→1`, `translateY 8px→0`, `0.3s ease-out` as specified
5. **`.gh-signin-form-col .card`** — `animation: gh-trust-reveal 0.3s ease-out both` + `@include motion-safe` (animation removed for reduced-motion users; card appears immediately at rest)

---

## Before/After Behavior

### Mobile (< 992px)
| Aspect | Before | After |
|--------|--------|-------|
| What's above fold | Carousel panel (full viewport height) | Sign-in form (immediately visible) |
| Form accessibility | Below fold, requires scroll | First visible element, no scroll needed |
| Carousel | Rendered, pushes form down | Not rendered (d-none) |
| Tab order | Carousel indicators first, form below | Form inputs are first tab stops |
| Overflow | bg-left min-height:100vh blocked form | Resolved |

### Desktop (≥ 992px)
| Aspect | Before | After |
|--------|--------|-------|
| Layout | Carousel left, form right | Carousel left (order-lg-first), form right (order-lg-last) — unchanged visually |
| Carousel | Auto-plays every 5 seconds | Auto-plays every 5 seconds — unchanged |
| Form | Right side with card | Right side with card — unchanged |
| Animations | @animate on slide entry | @animate on slide entry — unchanged |

---

## Auth Preservation Verification

No auth logic was modified:
- `loginAdmin()` method unchanged
- `loggedIn()` routing logic unchanged
- `showError()` unchanged
- `FormGroup` definition (`email` + `password` validators) unchanged
- `AuthFacade.signIn()` call unchanged
- Forget Password `routerLink` unchanged
- Signup `routerLink` unchanged
- `UnauthGuard` on the route unchanged

---

## SSR Safety

- No new `window.*` / `document.*` / `localStorage.*` calls introduced
- No new `isPlatformBrowser` guards needed — all changes are HTML structure and pure CSS
- Carousel column hidden via Bootstrap utility class (`d-none`) — CSS only, evaluated server-side safely

---

## Reduced-Motion Handling

Three layers of reduced-motion protection:
1. **Global** (`styles.scss`): `animation-duration: 0.01ms; transition-duration: 0.01ms` under `@media (prefers-reduced-motion: reduce)` — covers Bootstrap carousel transitions and any other animation
2. **Component SCSS** (`signin.component.scss`): `.carousel-item { @include motion-safe }` — explicit guard on Bootstrap slide items
3. **Component SCSS** (`signin.component.scss`): `.gh-signin-form-col .card { @include motion-safe }` — `gh-trust-reveal` animation removed entirely for reduced-motion users; card appears at final state immediately

---

## Build Result

```
npm run build-dev  →  ng build --configuration=staging

√ Browser application bundle generation complete.
√ Copying assets complete.
√ Index html generation complete.

Build at: 2026-06-25T15:12:44.030Z — Hash: 3dacddc0e1d1ccfe — Time: 41724ms
```

**PASS — no errors. Two pre-existing autoprefixer warnings in `add-contact-group.component.scss` (unrelated to BL-012).**

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/auth/signin/signin.component.html` | Reordered columns (form first in DOM), carousel column hidden below lg, `aria-hidden` on carousel column, `gh-pressable` on submit button, `min-vh-100` on container |
| `src/app/auth/signin/signin.component.scss` | Added `@import motion`, `.gh-signin-form-col` styles, `@keyframes gh-trust-reveal`, card animation, `.carousel-item` reduced-motion guard |

No other files modified.
