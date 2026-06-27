# GETHIRED_COMPANY_SETTINGS_MOBILEVIEW_REPORT
**Command:** MOBILEVIEW — Scoped to `/recruiter/company/settings` Company Details Form + GhFeedbackModal  
**FE commit:** 5db2363  
**Date:** 2026-06-27  
**Devices in scope:** Phone 360px–430px · Tablet 768px–1024px  
**Audience:** Recruiter / employer (desktop-primary, but mobile must work)

---

## 1. Executive Summary

**Mobile Readiness Score: 6.5 / 10**

The page has a solid mobile navigation shell — sticky top bar, animated hamburger drawer, 5-tab bottom nav with safe-area insets, and a billing bar — all of which are well-implemented. The GhFeedbackModal has a correct bottom-sheet animation on ≤560px. Global `box-sizing: border-box` and `overflow-x: hidden` prevent most overflow scenarios.

The weak points are concentrated in the **company-details form component** itself: the fixed submit footer has no `env(safe-area-inset-bottom)` guard, the `.btn-save` button is below 44px WCAG touch target, inputs lack `font-size: 16px` (will trigger iOS keyboard zoom), there is no `@media` breakpoint inside the form SCSS for phones, the `:has()` CSS selector used for modal bottom anchoring has a Safari 15.3 and earlier regression path, and the inline validation errors at 12px are technically below accessible body-text size at mobile scale.

### Top 5 Wins
1. Mobile navigation shell is complete: top bar, animated drawer, 5-tab bottom nav, billing bar, scrim, focus trap, `env(safe-area-inset-bottom)` in drawer footer.
2. GhFeedbackModal bottom-sheet implemented: `border-radius: 20px 20px 0 0`, `ghfm-slide-up` animation, `width: 100%` at ≤560px.
3. Global `form { padding-bottom: 80px }` prevents the fixed footer from permanently obscuring the last field.
4. `.ghfm-btn` height is exactly 44px — meets WCAG 2.5.5 inside the modal.
5. `prefers-reduced-motion` is respected throughout: modal animations, skeleton shimmer, and chip stagger all disable cleanly.

### Top 5 Gaps
1. `.btn-save` padding-based height is ~41px (7px top + 27px line-height + 7px bottom) — fails WCAG 2.5.5 by 3px. No `min-height: 44px` is present on this class.
2. `input, select` in the form component SCSS have no `font-size` override. The global `body { font-size: 14px }` inherited value will trigger iOS automatic keyboard zoom (iOS zooms in when input `font-size < 16px`).
3. The `:has()` selector in `styles.scss` (used to anchor `.gh-feedback-modal-panel` to the bottom on mobile) has no graceful fallback for Safari < 15.4, Firefox < 121, or Samsung Internet < 23. On unsupported browsers the modal will centre-screen instead of bottom-sheeting, which is merely a degraded experience rather than a break — but it is untested.
4. The `.submit-container` fixed footer has `padding: 12px 28px` with no `env(safe-area-inset-bottom)` guard. On iPhone models with a home indicator (iPhone X and later), the footer content can be visually clipped by the system home indicator.
5. The `cdf-field-error` message text is `font-size: 12px`. On a 360px screen with browser default zoom, this may read at approximately 10–11 CSS px after device pixel ratio scaling, which is below the practical readability floor for error messages.

---

## 2. Breakpoint Analysis

### Breakpoints in use across the company settings stack

| File | Breakpoint | Rule |
|------|-----------|------|
| `employer-panel.component.scss` | `min-width: 768px` | Sidebar appears; main gets `margin-left: 252px` |
| `employer-panel.component.scss` | `max-width: 767px` | Mobile top bar padding-top 56px; bottom padding `calc(72px + env(safe-area-inset-bottom))` |
| `employer-settings.component.scss` | `max-width: 768px` | `.ebc-page` padding reduced 24/28→16/16; `.ebc-card` padding reduced; hero stacks vertically |
| `company-details-form.component.scss` | `max-width: 1280px` | `.bg-gray` margin-top; `.avatar-image` max-size |
| `gh-feedback-modal.component.scss` | `max-width: 560px` | Bottom-sheet shape + slide-up animation |
| `styles.scss` | `max-width: 767px` | Global touch targets, mat-tab overflow, snackbar margin |
| `styles.scss` | `max-width: 560px` | `cdk-overlay-pane:has(.gh-feedback-modal-panel)` positioning |
| `styles.scss` | `max-width: 800px` | Scrollbar hidden |

**Gap:** The `company-details-form.component.scss` has **no breakpoints for phones (360px–767px)**. The only form-level breakpoints are `max-width: 1280px` for logo image sizing. All form layout on phone relies entirely on Bootstrap's `col-12` / `col-lg-*` grid system. This works for column collapsing but misses form-specific adjustments (font-size, padding, input height).

### Sidebar behaviour on mobile
- The `#sidebar-container` is `d-none d-md-block` — correctly hidden below 768px. No sidebar on phone/tablet portrait. Confirmed in HTML.
- A 280px animated drawer slides in from the left when the hamburger is tapped. It has `cdkTrapFocus` and returns focus to the hamburger on close. This is well-implemented.
- The mobile bottom nav (`gh-mobile-nav`) provides persistent access to Dashboard / Jobs / Candidates / Messages / Company.
- Company > Settings is accessible via: drawer footer link (gear icon) and avatar menu (desktop only). On mobile there is no dedicated bottom-nav "Settings" tab — the recruiter must go via the drawer footer.

### Tablet (768px–1024px)
At 768px the layout crosses into "desktop mode": the 252px sidebar appears and `main-company-component` gets `margin-left: 252px`. On a 768px tablet this leaves the form area only ~516px wide, which is tight but workable. The `employer-settings.component.scss` `max-width: 768px` breakpoint uses `≤` semantics (it fires at exactly 768px due to `max-width`), so there is a 1px overlap where both the desktop sidebar and the mobile-padding styles apply. This is a minor edge case.

---

## 3. Company Details Form Mobile Audit

### 3.1 Form Layout

**Column collapse:** The form uses Bootstrap's `col-12 col-lg-*` grid. On phones all fields stack single-column. There are no custom two-column grids that could overflow. Bootstrap's `container-fluid` / `row` pattern is safe.

**Specific column combinations:**
- Company name: `col-12 col-lg-6` — collapses to full width on phone. OK.
- Industry: `col-12 col-lg-6` — collapses. OK.
- Work Setup: `col-12 col-lg-4` — collapses. OK.
- Number of Employees: `col-12 col-lg-2` — collapses. OK.
- Email / Work Phone: both `col-12 col-lg-6` inside a `.row` — collapses to full width each. OK.
- Address checkbox row: `col-12 col-lg-6` and `col-12 col-lg-6` — collapses. The `form-check` inner layout uses `row` + `col-12 col-lg-8 / col-lg-4`, so on phone both the checkbox and its label stack into `col-12` each. The label has `text-end` which right-aligns on all screens. Acceptable.

**Horizontal overflow risk:** The `.card { padding: 30px 30px !important }` gives 60px total horizontal padding to the card. On a 360px screen the usable card interior is 300px. Bootstrap `col-12` fields inside this card will still fill 100% of the card interior, so no overflow. However the card's outer 30px padding is aggressive — at 360px it leaves very little breathing room visually. No overflow, but dense.

**Textarea:** `rows="4"` with `form-control` — inherits `min-height: 50px` from component SCSS, but `rows="4"` will naturally make it taller. Width is `100%`. OK.

**Number input `type="number"`:** No `min`, `max`, or `step` attributes. On iOS, `type="number"` shows a decimal keyboard rather than integer keypad. For "Number of Employees" an integer `type="number" inputmode="numeric"` pattern is better UX on mobile.

### 3.2 Touch Targets

| Element | Actual Height | WCAG 2.5.5 (44px) | Status |
|---------|--------------|-------------------|--------|
| `.btn-save` | ~41px (7px + 27px line-height + 7px, no min-height) | 44px | FAIL — 3px short |
| `input.form-control` | `min-height: 50px` (component SCSS) | 44px | PASS |
| `select.form-select` | `height: 50px` | 44px | PASS |
| `textarea.form-control` | `min-height: 50px` | 44px | PASS |
| `input[type=checkbox]` (Publicly Shown) | Inherits `form-check-input` + `padding-bottom: 15px` | 44px | FAIL — checkbox default is ~18px; the padding-bottom is on the input itself which doesn't reliably expand the tap zone |
| Logo upload `app-file-upload` | Unknown — depends on component internals | 44px | UNKNOWN — not audited here |
| `app-google-address-search` | Unknown — depends on component internals | 44px | UNKNOWN |

**`.btn-save` fix:** The global `.btn-primary { min-height: 44px }` in `styles.scss` was applied, but `.btn-save` is a custom class, not `.btn-primary`. The fix must be applied directly to `.btn-save` in `company-details-form.component.scss`.

### 3.3 Fixed Submit Footer

`.submit-container` rules:
```scss
position: fixed;
bottom: 0;
left: 0;
right: 0;
z-index: 99;
padding: 12px 28px;
```

**iOS home indicator:** On iPhones with Face ID (iPhone X and later — the large majority of active iPhones as of 2026), the system home indicator is 34px tall and sits at the very bottom of the screen. The footer has no `padding-bottom: env(safe-area-inset-bottom)` guard. On these devices the save button and the "All changes saved" label are rendered directly behind the home indicator.

**Software keyboard:** When the user taps an input and the iOS/Android soft keyboard opens, the browser viewport shrinks. With `position: fixed`, the footer stays pinned relative to the visual viewport (on iOS) or may be pushed upward (on Android Chrome). In Safari on iOS, `position: fixed` elements reflow with the visual viewport — the footer will appear above the keyboard. This is the correct behavior for a save bar and does not require a fix. However, the 80px `padding-bottom` on `form` may not be sufficient on all keyboards: Samsung Internet on Android with the emoji keyboard can be 300px+ tall, but the fixed footer itself handles the CTA visibility correctly.

**Content obscured by footer:** `form { padding-bottom: 80px }` is present in component SCSS. The footer is 12+27+12 = 51px total height. 80px bottom padding is sufficient to clear the footer on all screen sizes. Pass.

**Z-index competition:** The fixed footer is `z-index: 99`. The mobile top bar is `z-index: 1001`. The mobile drawer is `z-index: 1001`. The billing bar is `z-index: 999`. The bottom nav is `z-index: 999`. The GhFeedbackModal `mat-dialog-container` is `z-index: 99999`. No conflict with the form's z-index: 99. However, note that `z-index: 99` is below the mobile billing bar and bottom nav (`z-index: 999`). This is correct — the billing bar and bottom nav should appear above the form's save bar. The actual stacking at the bottom on mobile is: bottom nav (z:999) → billing bar (z:999) → form save footer (z:99). Since the save footer is `position: fixed; bottom: 0`, and the billing bar is `position: fixed; bottom: calc(56px + env(...))` and the bottom nav is `position: fixed; bottom: 0`, the save footer at `z-index: 99` will be rendered **behind** the bottom nav at `z-index: 999`. This means the save footer is **hidden under the bottom nav on mobile**.

**This is the most critical layout bug found:** The company-details form's fixed submit footer (z-index: 99) will render underneath the mobile bottom nav (z-index: 999). The save button will not be visible or tappable while the bottom nav is present. The form also has `padding-bottom: 80px` which is designed for the footer, but on mobile the relevant "footer" that must be cleared is the stacked billing bar + bottom nav (~116px total on iPhone with notch), not the form's own 51px save bar.

### 3.4 Scroll Behaviour

- `#sub-company-component { overflow-x: hidden; overflow-y: hidden }` — this `overflow-y: hidden` on a parent container can clip the form scroll. The mobile fix at `max-width: 767px` sets `padding-bottom: calc(72px + env(safe-area-inset-bottom))` on `#sub-company-component`, but `overflow-y: hidden` will still prevent scrolling within that div if content is taller than the visible area. The `router-outlet` renders form content inside `#sub-company-component`. This is a potential scroll-blocking bug on all screens, masked on desktop by the sidebar's independent scroll. On mobile, if `overflow-y: hidden` prevents the form from scrolling, the recruiter cannot reach fields below the fold.

- `focusFirstInvalidField()`: Not visible in this SCSS/HTML audit. Assume it uses `element.focus()` or `element.scrollIntoView()`. The latter is needed on mobile for validation UX. Not a CSS concern — flagged for TypeScript review.

- `.avatar-image { height: 200px; width: 200px }` — fixed 200×200px circle. At max `max-width: 150px; max-height: 150px` it shrinks to 150px on screen ≤1280px. On a 360px phone the `col-12 col-lg-3` column is 300px wide (card interior) so 150px fits. No overflow. But the image is inside `.bg-gray { padding: 20px }` — so total column content width is 300 - 40 = 260px; the 150px image is centered — acceptable.

---

## 4. GhFeedbackModal Mobile Audit

### 4.1 Bottom-Sheet Behaviour

**Shape:** `border-radius: 20px 20px 0 0` on `.ghfm-wrap` at ≤560px. Correct bottom-sheet visual.

**Animation:** `ghfm-slide-up` is defined inside the `@media (max-width: 560px)` block:
```scss
@keyframes ghfm-slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
```
This is the correct pattern. Duration is `0.3s` with `cubic-bezier(0.16, 1, 0.3, 1)` — a fast spring. `prefers-reduced-motion` overrides to `animation: none`. Correct.

**Width:** `width: 100%; max-width: 100%` at ≤560px. The `.ghfm-wrap` will fill the full viewport width. Correct.

**Positioning:** The `.cdk-overlay-pane:has(.gh-feedback-modal-panel)` rule anchors the pane to `bottom: 0; left: 0; right: 0`. The `mat-dialog-container` has `border-radius: 0 !important` at ≤560px (overriding the component's 20px radius so the component SCSS's own border-radius takes effect via the inner `.ghfm-wrap`). Correct layering.

### 4.2 Max-Height / Overflow

**No `max-height` is set on `.ghfm-wrap`.**

The global `styles.scss` `max-height: 90vh !important` applies to `.mat-dialog-container` on mobile. Since the mat-dialog-container wraps the component, and it has `overflow-y: auto !important`, tall content (e.g. many validation errors) will scroll within the dialog container. This is the correct safety net, but it is a global rule, not a component-specific one.

**Success state content inventory (360px screen):**
- Header: orbit ring SVG (72px icon) + title — approximately 150px
- Body: body text + sync note + chips (e.g. 3 chips) — approximately 100px
- Actions: primary button 44px + optional secondary 44px + padding — approximately 110px
- Total estimate: ~360px

At 360px viewport height (short devices like iPhone SE 2020 in portrait = 667px, but older 360×640 Androids), 360px modal + system bars = tight. The `max-height: 90vh` from global styles = ~576px on a 640px screen, so the modal should fit. No overflow on success state.

**Validation state with many errors (5+ field errors):**
Each `.ghfm-field-error` item is approximately 28–36px tall (13px font, 1.5 line-height, 8px gap). Five errors add ~180px to the body. The total modal height could reach 480px+, at which point the 90vh cap and `overflow-y: auto` kicks in. The user can scroll to see all errors. Acceptable, but the CTA buttons (fixed at bottom of `.ghfm-body` + `.ghfm-actions`) are NOT sticky inside the modal — they scroll with content. On a very tall validation list the user must scroll to see "Fix errors" button. This is a gap, not a blocker.

### 4.3 `:has()` Selector Browser Support

The `:has()` selector is used in `styles.scss`:
```scss
.cdk-overlay-pane:has(.gh-feedback-modal-panel) {
  position: fixed !important;
  bottom: 0 !important;
  ...
}
```

Browser support matrix (as of 2026-06):
- Chrome: supported since 105 (August 2022). Current Chrome is 125+. Well covered.
- Safari: supported since 15.4 (March 2022). iPhone running iOS 15.3 or earlier: NOT supported. iOS 15.3 is edge-case in 2026 but still present on older iPads.
- Firefox: supported since 121 (December 2023). Firefox ESR 115 (widely deployed in enterprise): NOT supported.
- Samsung Internet: supported since 23 (2023). Samsung Internet 22 and earlier: NOT supported.

**Fallback behaviour on unsupported browsers:** The `:has()` rule is silently ignored. The CDK overlay pane uses its default positioning strategy, which for MatDialog is centre-of-viewport. The `.ghfm-wrap`'s `border-radius: 20px 20px 0 0` still applies, but the modal will appear centred rather than at the bottom. This is a degraded-but-functional experience. No content is lost.

**Mitigation options (not required to ship, but recommended):**
1. Add `panelClass: ['gh-feedback-modal-panel', 'gh-feedback-modal-mobile-anchor']` in TypeScript and add a `.gh-feedback-modal-mobile-anchor .mat-dialog-container` rule that does not rely on `:has()`.
2. Or use Angular CDK `Overlay` with a custom position strategy in the TypeScript, bypassing the CSS hack entirely.

### 4.4 Auto-Dismiss Timer

4000ms auto-dismiss is implemented in the TypeScript component (not visible in HTML/SCSS). The SCSS does not interfere with this. On mobile, if the user taps elsewhere during the 4000ms window (which would close the modal via `close('primary')`), the timer and the close event may both fire. This should be handled in the TypeScript with `clearTimeout` on close. Not auditable from CSS alone — flagged for TypeScript review.

### 4.5 Modal Actions Layout

```scss
.ghfm-actions {
  padding: 4px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

`flex-direction: column` means all buttons stack vertically. At 360px this is correct — buttons are `width: 100%`, each 44px tall. No side-by-side layout that could overflow. Good.

`padding-bottom: 32px` inside `@media (max-width: 560px)` adds extra bottom padding for safe area clearance. However `env(safe-area-inset-bottom)` is not used — the 32px is a fixed estimate. On iPhone 15 Pro the safe area inset is 34px. This is fine. On future devices with larger insets it could clip. Recommendation: replace `padding-bottom: 32px` with `padding-bottom: max(32px, env(safe-area-inset-bottom, 32px))`.

---

## 5. Logo Upload Mobile UX

The logo upload uses `app-file-upload` component (a reusable component not in scope for this SCSS audit). Observations from the HTML:
- `<app-file-upload ... label="Select Profile Photo" [labelTop]="false">` — label-based upload.
- No drag-and-drop zone markup visible in the wrapper component template — whether the child component implements drag-drop is not auditable here.
- On mobile, `<input type="file">` triggered by a button label will open the native file picker, which on iOS includes Camera, Photo Library, and Files options. This is the correct mobile behaviour.
- Logo preview (`[src]="profileImage"`) displays inside `.text-center.bg-gray` with the avatar-image class. The image is 200px×200px (capped at 150px on ≤1280px screens). On a 360px phone card interior (~300px), the 150px circular image will be centred within `text-center`. No overflow.
- The background container `.bg-gray { padding: 20px }` — if the image is 150px and the container is within `col-12 col-lg-3` that collapses to `col-12` on phone, the image will be centred on the full form width. Looks correct.

---

## 6. Address Autocomplete Mobile UX

`app-google-address-search` is a child component not directly in scope. From the form HTML:
```html
<app-google-address-search [rawAddress]="rawAddress"
  (addressChange)="addressChange($event)"
  (isValid)="isAddressFormValid($event)">
</app-google-address-search>
```

Known considerations for Google Places Autocomplete on mobile:
- The autocomplete dropdown typically renders in a `pac-container` div that Google appends to `<body>`. This can conflict with `overflow: hidden` on parent elements.
- `#sub-company-component { overflow-y: hidden }` may clip the autocomplete dropdown on some mobile browsers.
- Keyboard appears on focus — standard behaviour.
- The `shownPublicly` checkbox and its label are in a separate `row` above the autocomplete component. The checkbox is `col-12 col-lg-8` collapsing to full-width on phone. The label is `col-12 col-lg-4` with `text-end`. On phone, both will be `col-12` stacked — label appears below checkbox, right-aligned. Slightly awkward on mobile (expected: checkbox + label side by side). Minor visual issue.

---

## 7. Mobile Accessibility

### Font Size / iOS Zoom Prevention

**Critical gap:** The global `body { font-size: 14px }` and the component-level `input, select { ... }` rules do not set `font-size` on inputs. iOS Safari triggers automatic zoom when `font-size < 16px` on input focus. The form's `input` and `select` elements inherit the 14px body font-size. On iPhone, tapping any text input will zoom the page in. This disrupts the fixed footer layout and forces the user to double-tap to zoom back out.

**Fix:** Add `font-size: 16px` to `input, select, textarea` in either the component SCSS or the global `@media (max-width: 767px)` block in `styles.scss`.

### Validation Error Font Size

`.cdf-field-error { font-size: 12px }` — at 12px on mobile this renders at approximately 12 CSS px (device-pixel-ratio does not affect CSS pixel size). WCAG 1.4.4 Resize Text requires text to be resizable to 200% without loss of content. At 12px × 200% = 24px that is readable. However, the practical floor for body error text at normal zoom is 13–14px. 12px is a minor a11y concern, not a blocker.

### VoiceOver / TalkBack

Positive signals in the HTML:
- `aria-busy`, `aria-label` on submit button — correct
- `role="alert"` on field error divs — screen reader will announce validation errors immediately
- `aria-describedby` linking inputs to their error elements — correct
- `aria-live="polite"` on character counter — correct

Gap: The form itself has no `aria-label` or `role="form"`. Minor but worth noting.

### Focus Order

`focusFirstInvalidField()` in the TypeScript will call `.focus()` on the first invalid input. On mobile this triggers the keyboard and scrolls the element into view (default browser behaviour). The fixed save footer at `z-index: 99` will be visible above the keyboard (iOS visual viewport behaviour). No SCSS fix needed here.

### Zoom at 200%

At 200% browser zoom, a 360px screen becomes effectively 180px. Bootstrap's `col-12` fields will still be single-column. The card `padding: 30px` would remain 30px, leaving only 120px for the input field content. This is problematic — inputs would be very narrow. However, 200% zoom on a phone is an extreme scenario and WCAG 1.4.4 applies to desktop viewports primarily. No action recommended but worth noting.

---

## 8. Tablet Audit (768px–1024px)

### 768px (iPad mini portrait, tablet portrait)
- Layout switches to desktop mode: 252px sidebar visible, `margin-left: 252px` on main.
- Main content area width: 768 − 252 = 516px. This is narrow but functional.
- Bootstrap `col-lg-6` on a 516px container = 258px per column. Inputs fit.
- `col-lg-3` (logo column) = ~129px — the 150px avatar-image overflows this column at max-width. The image has `max-width: 150px` but the column is only ~129px wide at this viewport. Potential 21px horizontal overflow within the column. This is inside a Bootstrap column with no `overflow: hidden` so it will push the adjacent column. **Minor layout bug at 768px.**

### 1024px (iPad landscape, small laptop)
- 252px sidebar + 772px content area. `col-lg-6` = ~386px per column. Comfortable.
- `col-lg-3` = ~193px for logo column. 150px avatar fits.

### Topbar on tablet
- `gh-employer-topbar` has `d-none d-md-flex` — appears at 768px+.
- `padding: 0 28px; height: 68px` — no responsive adjustment. At 768px this is fine.
- Three action buttons ("Post a job", "Review applicants", icon) in a row. At 768px these could overflow if company name in `gh-topbar-title` is long. No `overflow: hidden` or `flex-shrink` on the title element. Minor risk.

### Tabs (employer-settings)
- `.ebc-tabs { overflow-x: auto; scrollbar-width: none }` — horizontally scrollable tab bar. On tablet, the 4 tabs (Company Profile | Branding & Media | Team & Access | Account) should fit in 516px+. Safe.

---

## 9. Safe Mobile Fixes

The following CSS-only fixes are safe to apply. Each is backward-compatible with desktop.

| ID | File | Current | Proposed Fix | Why Safe | Risk |
|----|------|---------|-------------|---------|------|
| MF-001 | `company-details-form.component.scss` | `.btn-save { padding: 7px 20px }` — ~41px tall | Add `min-height: 44px;` to `.btn-save` | Forces touch-target compliance; does not change visual on desktop because padding already produces similar height | None |
| MF-002 | `styles.scss` `@media (max-width: 767px)` block | `.form-control, .mat-form-field-infix input` has `min-height: 44px` but no `font-size` | Add `font-size: 16px !important;` to the same rule (for `input, select, textarea`) | Prevents iOS auto-zoom on input focus; 16px is imperceptible visually at mobile zoom levels | None — 16px is LARGER than body text, so slightly more prominent in form fields |
| MF-003 | `company-details-form.component.scss` | `.submit-container { padding: 12px 28px }` | Add `padding-bottom: max(12px, env(safe-area-inset-bottom, 12px));` | Clears iPhone home indicator; `env()` resolves to 0px on non-notched devices | None |
| MF-004 | `gh-feedback-modal.component.scss` | `.ghfm-actions { padding-bottom: 32px }` (mobile only) | Change to `padding-bottom: max(32px, env(safe-area-inset-bottom, 32px));` | Future-proofs against larger insets on next-gen devices | None |
| MF-005 | `company-details-form.component.scss` | Form has `padding-bottom: 80px` | On mobile, change to `@media (max-width: 767px) { form { padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); } }` | Prevents last field from being obscured on notched iPhones | None |
| MF-006 | `company-details-form.component.scss` | No mobile breakpoint for `.card { padding: 30px 30px }` | Add `@media (max-width: 767px) { .card { padding: 16px 16px !important; } }` | Reduces aggressive padding on 360px screens; more breathing room | Low — visual only, no layout impact |
| MF-007 | `company-details-form.component.scss` | No `type` attribute for number input UX | Not a CSS fix — recommend adding `inputmode="numeric"` to the employees `type="number"` input in HTML | Better mobile keyboard (numeric pad, no decimal) | None |
| MF-008 | `styles.scss` | Submit footer z-index 99 is below mobile nav z-index 999 | Add to the `@media (max-width: 767px)` block: `.company-details-form-host .submit-container { z-index: 1000 !important; }` OR raise `.submit-container`'s z-index to 1000 | Makes save button visible above the mobile bottom nav | Low — ensure z-index does not conflict with mat-select dropdowns (z: 1001+) |

**Note on MF-008 (critical):** The save button being hidden under the mobile nav is the most impactful fix. The cleanest approach is to increase `.submit-container`'s `z-index` to `1000` (just below the mobile drawer at `1001`). Alternatively, the form's bottom padding should account for the mobile nav stack (bottom nav ~56px + billing bar ~36px = ~92px on mobile) so that the last field is always above both bars, and the fixed save footer's `z-index` needs to stack correctly above the nav.

---

## 10. Mobile Fix Log

| ID | Status | Description |
|----|--------|-------------|
| MF-001 | RECOMMENDED | Add `min-height: 44px` to `.btn-save` |
| MF-002 | RECOMMENDED (critical) | Add `font-size: 16px` to inputs on mobile |
| MF-003 | RECOMMENDED | `env(safe-area-inset-bottom)` on submit footer padding |
| MF-004 | RECOMMENDED | `env(safe-area-inset-bottom)` on modal actions padding |
| MF-005 | RECOMMENDED | Extend form bottom padding with safe-area inset |
| MF-006 | OPTIONAL | Reduce card padding on mobile |
| MF-007 | RECOMMENDED | `inputmode="numeric"` on employees input (HTML change) |
| MF-008 | CRITICAL | Raise submit footer z-index to 1000 so it appears above mobile nav |

---

## 11. Mobile QA Checklist

Use this checklist for manual device testing. Test on: iPhone SE (375px), iPhone 14 (390px), Samsung Galaxy A53 (360px), iPad mini (768px).

### Layout
- [ ] Form loads correctly at 375px (iPhone SE) — no horizontal scrollbar
- [ ] Form loads correctly at 360px (Android) — no horizontal scrollbar
- [ ] Card padding not excessively tight on 360px
- [ ] Avatar image (150px) fits within its column on tablet (768px)
- [ ] Employee number input: mobile keyboard is numeric (after inputmode="numeric" fix)

### Touch Targets
- [ ] Submit Changes button: measures ≥44px height in browser devtools
- [ ] All text inputs tappable: keyboard appears on first tap
- [ ] `select` dropdowns open correctly on iOS and Android
- [ ] "Publicly Shown" checkbox is tappable (verify tap zone is adequate)
- [ ] Logo upload button opens native file picker
- [ ] Camera option available in file picker (iOS)

### Fixed Footer
- [ ] Submit Changes button is fully visible above the mobile bottom nav
- [ ] Submit Changes button is not clipped by iPhone home indicator
- [ ] Last form field (address search) is not obscured by the fixed footer
- [ ] After tapping an input and keyboard opens, submit button is still visible

### iOS Zoom Prevention
- [ ] Tapping any text input does NOT zoom the page in (requires font-size: 16px fix)
- [ ] After keyboard dismissal, page returns to correct zoom level

### Navigation
- [ ] Hamburger button opens drawer
- [ ] Drawer closes on scrim tap
- [ ] Drawer closes on Escape key
- [ ] Settings link in drawer footer navigates to `/recruiter/company/settings`
- [ ] Bottom nav: "Company" tab navigates correctly
- [ ] Billing bar link visible above bottom nav
- [ ] After navigating away and back, form data is not lost (if applicable)

### Success Modal
- [ ] Saving triggers GhFeedbackModal
- [ ] Modal appears as bottom-sheet (slides up from bottom) at 375px
- [ ] Modal appears centred on tablet (768px+)
- [ ] Success state: orbit ring animation visible (if reduced-motion off)
- [ ] Success state: orbit ring animation suppressed (if reduced-motion on)
- [ ] Changed-field chips wrap correctly, no horizontal overflow
- [ ] Auto-dismiss fires at ~4 seconds
- [ ] "Got it" button closes modal and returns focus to form
- [ ] After modal closes, form is in clean state (dirty reset)

### Validation Modal
- [ ] Invalid submit triggers validation modal
- [ ] Modal slides up from bottom at ≤375px
- [ ] Field error list is visible and scrollable if >4 errors
- [ ] "Fix errors" button is reachable (scroll if needed)
- [ ] Tapping "Fix errors" closes modal and focuses first invalid field

### Network Error Modal
- [ ] Network error triggers error modal
- [ ] Modal slides up from bottom
- [ ] "Try again" button retriggers submit
- [ ] Request ID visible and legible at 375px

### Address Autocomplete
- [ ] Autocomplete opens correctly on mobile
- [ ] Dropdown is not clipped by overflow-y: hidden on parent container
- [ ] Selecting an address fills all relevant fields

### Accessibility
- [ ] VoiceOver (iOS): form fields announced with label on focus
- [ ] VoiceOver (iOS): validation errors announced when touched
- [ ] VoiceOver (iOS): modal title announced when modal opens
- [ ] TalkBack (Android): equivalent behaviour
- [ ] Focus returns to form after modal closes

---

## 12. Breakpoint Recommendations

The company settings page would benefit from explicit breakpoints in `company-details-form.component.scss`:

```scss
// Phone (portrait) — single-column, reduced card padding, iOS zoom fix
@media (max-width: 767px) {
  .card {
    padding: 16px 16px !important;
  }

  .submit-container {
    padding-bottom: max(12px, env(safe-area-inset-bottom, 12px));
    z-index: 1000; // above mobile bottom nav (999)
  }

  form {
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }

  input, select, textarea {
    font-size: 16px; // prevent iOS auto-zoom
  }
}

// Tablet portrait (sidebar appears, narrow content area)
@media (min-width: 768px) and (max-width: 1024px) {
  .avatar-image {
    max-width: 120px;
    max-height: 120px;
  }
}
```

Current breakpoints referenced:
- **360px:** Not explicitly defined in form SCSS. Bootstrap `col-12` handles column collapse. Explicit font-size and padding adjustments should be added.
- **560px:** GhFeedbackModal bottom-sheet. Already implemented. Correct.
- **768px:** Sidebar/desktop mode boundary. Already in employer-panel SCSS. Correct.
- **1024px:** No explicit breakpoint currently. No critical issues found here — tablet landscape is comfortable at this width.
- **1280px:** Logo image sizing. Present. Correct.

---

## 13. Release Gate

| Gate | Description | Result | Detail |
|------|-------------|--------|--------|
| **A — No Horizontal Overflow** | No element overflows the viewport width on 360px | **PASS** | `overflow-x: hidden` on body and containers; Bootstrap col-12 collapses correctly; card padding is tight but not overflow-producing |
| **B — Touch Targets ≥44px** | All interactive elements meet WCAG 2.5.5 | **FAIL** | `.btn-save` is ~41px (3px short); checkbox tap zone inadequate; logo upload UNKNOWN |
| **C — Modal Bottom-Sheet** | GhFeedbackModal slides up from bottom on ≤560px | **PASS** | Shape, animation, and positioning all correct; `max-height: 90vh` from global styles provides scroll fallback |
| **D — Keyboard/Scroll Safety** | Fixed footer visible above keyboard; content not obscured; no iOS zoom | **FAIL** | Submit footer (z:99) is hidden under mobile nav (z:999); no `font-size: 16px` on inputs causes iOS zoom; `overflow-y: hidden` on parent container may block form scroll |
| **E — `:has()` Fallback** | Modal positioning degrades gracefully on browsers without `:has()` | **PARTIAL** | Degraded to centre-modal on Safari < 15.4 / Firefox ESR 115 / Samsung Internet 22 — functional but not bottom-sheet; no crash |

**Gate result summary:** 2 PASS, 2 FAIL, 1 PARTIAL. Gates B and D must be resolved before this can be considered mobile-ready. The fixes are all CSS-level and are listed in Section 9.

---

## 14. Recommended Next Command

After applying the Safe Mobile Fixes from Section 9 (MF-001 through MF-008), the recommended next step is:

**`/verify`** — Run the app at 375px in browser devtools device mode and manually confirm:
1. Submit button is visible above the bottom nav (MF-008 resolved)
2. Tapping an input does not zoom the page (MF-002 resolved)
3. iPhone home indicator does not clip the submit footer (MF-003 resolved)
4. GhFeedbackModal slides up from bottom correctly on ≤560px

After verification, if the company settings page is part of an active sprint:

**`/code-review --effort high`** — Review the TypeScript changes in `company-details-form.component.ts` to verify:
- `focusFirstInvalidField()` calls `scrollIntoView()` not just `focus()`
- Auto-dismiss timer is cleared on manual modal close
- The `4000ms` delay is appropriate for all modal states (validation modals should NOT auto-dismiss)

---

*Report generated by MOBILEVIEW command, scoped to company settings page. Files audited: `company-details-form.component.html`, `company-details-form.component.scss`, `gh-feedback-modal.component.html`, `gh-feedback-modal.component.scss`, `employer-panel.component.html`, `employer-panel.component.scss`, `employer-settings.component.scss`, `styles.scss`.*
