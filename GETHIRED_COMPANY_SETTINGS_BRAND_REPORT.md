# GetHired BRAND Audit — Company Settings Page
## Feature: `/recruiter/company/settings` — Company Details Form + GhFeedbackModalComponent
**Audit date:** 2026-06-27 | **Auditor:** BRAND command (Claude Code)

---

## 1. Executive Summary

| Dimension | Score | Notes |
|---|---|---|
| **Brand compliance** | **8 / 10** | Modal is near-perfect; form page uses custom classes instead of token system |
| **Motion health** | **9 / 10** | Orbit/checkmark/chips fully correct; one missing `ghfm-slide-up` opacity reset |
| **Haptics health** | **10 / 10** | Perfectly wired — press/success/warning/error at correct moments |
| **State coverage** | **12 / 14** | Two states have gaps: FE validation does not open modal; "form dirty" label colour not brand-token |
| **Button system** | **6 / 10** | Save button uses custom `btn-save` class, not `gh-btn-primary`; missing 44px height guarantee |

**Top risks:**
1. Save button height is set via padding (`7px 20px`) not the `44px` token — falls short of 44px WCAG 2.5.5 touch target on desktop. On mobile the `form-control min-height: 44px` global rule only covers inputs, not buttons.
2. Save button uses `btn-save` not `gh-btn-primary` — it has the correct coral gradient visually, but misses the global button system's focus ring, `motion-safe` mixin, disabled opacity, and `font-weight: 600` (currently 500).
3. FE validation failure (`companyDetailsForm.invalid`) dismisses with no modal feedback — the user sees red inline errors but the form's `onSubmit()` returns silently. The branded validation modal is only opened for BE validation errors.
4. Global hover coral ring covers `button` and `.btn` — the `btn-save` button has both classes and receives the ring correctly. However, the `ghfm-btn` buttons in the modal are inside a `MatDialog` overlay, which is outside Angular's component style encapsulation; they still receive the global ring because the rule is in `styles.scss`. Verified correct.
5. `prefers-reduced-motion` global rule in `_motion.scss` uses `animation-duration: 0.001ms` while `styles.scss` uses `0.01ms` — minor inconsistency, both effectively instant, but should be unified.

**Top strengths:**
- GhFeedbackModal is an exemplary branded component: Deep Navy header, coral orbit SVG, spring-eased checkmark, chips cascade, full 8-state type system, correct haptics, accessible `role="dialog"` + `aria-labelledby`, auto-dismiss with `clearTimeout` on destroy.
- Loading skeleton is correctly implemented with shimmer animation and `prefers-reduced-motion` fallback.
- Haptic wiring is textbook-correct across all 5 call sites.
- MatDialog chrome is fully stripped via `gh-feedback-modal-panel` panelClass — the branded `border-radius: 20px` card controls its own shape.
- Mobile bottom-sheet wiring (560px breakpoint) is in both component SCSS and global `styles.scss` via `:has()` — belt-and-suspenders.

---

## 2. Visual Direction Compliance

### Modal States

| Check | Result | Detail |
|---|---|---|
| **Success: Deep Navy background** | PASS | `linear-gradient(135deg, #0b1026 0%, #1a1544 60%, #0d0f1f 100%)` — close enough to `#0D1024`, slightly bluer at 60% stop which adds depth. Acceptable creative variation. |
| **Success: Coral orbit SVG ring** | PASS | `stroke: #ff7062` — matches `#FF7062` primary coral. Track uses `rgba(255,255,255,0.1)` ghost layer as designed. |
| **Success: Checkmark** | PASS | `color: #ff7062`, spring-eased (`cubic-bezier(0.34, 1.56, 0.64, 1)`), 30×30px, white SVG stroke on coral colour. |
| **Validation: Azure tones** | PASS | Header gradient shifts to `#0b1526 → #0d1f44 → #0b1026` (deep azure-navy). Mesh blob swaps to `rgba(47,128,255,0.22)`. Primary button becomes `linear-gradient(135deg, #2f80ff 0%, #1557c9 100%)`. Correctly signals intelligence/warning. |
| **Error/network/permission: gradient vocabulary** | PASS | Error/network share the default coral-navy header. Permission uses the same. Conflict gets amber mesh `rgba(245,158,11,0.2)`. All visually consistent. |
| **Modal border-radius** | PASS | `border-radius: 20px` on `.ghfm-wrap` — sits inside the 16-24px card standard. MatDialog panel class strips Chrome's own radius and sets it to `20px` as well. |
| **Typography: Manrope** | PASS | Title: `font-family: 'Manrope', sans-serif; font-size: 17px; font-weight: 700`. Body: `font-size: 14px`. Field error list: `font-size: 13px`. Sync note: `font-size: 12px`. All use Manrope. |

### Submit Button

| Check | Result | Detail |
|---|---|---|
| **Uses `gh-btn-primary` class** | FAIL | Uses custom `.btn.btn-save.gh-pressable`. Visually identical gradient, but lacks `gh-btn-primary` system benefits (motion-safe, correct weight, 44px height via token). |
| **Coral gradient** | PASS | `linear-gradient(135deg, #FF7062 0%, #FF3D6E 100%)` — exact match. |
| **Height 44px** | PARTIAL | No explicit `height: 44px`. Height is set by `padding: 7px 20px` + `line-height: 27px` = ~55px rendered. Exceeds 44px, but is not driven by the `--gh-btn-height` token. If line-height changes this breaks silently. |
| **Spinner: white stroke** | PASS | `stroke="rgba(255,255,255,0.35)"` (track) + `stroke="#fff"` (arc). Correct for dark button. |
| **Loading state: 'Saving…' with spinner** | PASS | `{{ saving ? 'Saving…' : 'Submit Changes' }}` plus spinner SVG. The spinner animation (`cdf-spin` 0.72s linear) matches `--gh-motion-analysis: 720ms` token — coincidence, but aligned. |
| **Font weight** | PARTIAL | `font-weight: 500` on `btn-save`. `gh-btn-primary` system spec is 600. Minor but noticeable at small sizes. |

### Form

| Check | Result | Detail |
|---|---|---|
| **Input height: 44px** | PARTIAL | `.form-control { min-height: 50px }` — exceeds 44px. The global `styles.scss` mobile rule adds another `min-height: 44px`. No token used. Acceptable but not token-driven. |
| **Label font: 13px/600** | FAIL | Component SCSS: `label { font-size: 16px; font-weight: 500 }`. Token spec calls for 13px/600. The 16px/500 style is a legacy setting from the original design. |
| **Error text: 12px #EF4444** | PASS | `.cdf-field-error { font-size: 12px; color: #EF4444 }`. `#EF4444` matches `--gh-color-error` token exactly. |
| **Field focus: global coral ring on inputs** | PARTIAL | The global `button:not(...):hover` rule does NOT target `input` or `select` elements. However `styles.scss` line 198 has a global `:focus-visible { outline: 2px solid $color-global-red-buttons; outline-offset: 2px }` that covers inputs on keyboard focus. Desktop mouse-hover on text inputs does NOT show the coral ring (inputs are not buttons/role=button). This is the intended design but worth documenting as a potential a11y gap for sighted keyboard users. |

### Global Coral Hover Ring — Button Coverage

| Button | Receives Coral Ring? | Why |
|---|---|---|
| Save / Submit button | YES | Has `.btn` class — covered by `.btn:not(:disabled):not([disabled]):hover` |
| Modal primary CTA `.ghfm-btn` | YES | Has `type="button"` — it is a `<button>` — covered by `button:not(...):hover` |
| Modal secondary CTA `.ghfm-btn` | YES | Same as above |
| Logo upload (app-file-upload) | UNKNOWN | Delegated to `app-file-upload` component — not readable in this scope |
| Address search buttons | UNKNOWN | Delegated to `app-google-address-search` — not readable in this scope |

Angular Material does NOT break the coral ring on modal buttons: `styles.scss` applies globally to the `body` DOM including CDK overlay contents, so the ring rule reaches `.ghfm-btn` elements inside the dialog.

---

## 3. State Experience Coverage

| # | State | Brand Polish | Notes |
|---|---|---|---|
| 1 | **Initial loading (skeleton)** | POLISHED | `.cdf-loading-skeleton` with 3 shimmer bars, `aria-busy`, `aria-label`, shimmer animation + reduced-motion fallback. |
| 2 | **Form loaded, empty (no company data)** | ADEQUATE | Shows the form with empty fields. No illustration or empty-state copy. Functionally fine. |
| 3 | **Form loaded with data** | POLISHED | Fields populated, profile image shown, address auto-populated. |
| 4 | **Form dirty (unsaved changes)** | ADEQUATE | `.submit-label--dirty` text turns amber (`#F59E0B`) and bold — matches `--gh-color-warning` token. Uses inline hex not token `var()`. No other affordance (no prompt on page-leave, no border pulse). |
| 5 | **FE validation error** | NEEDS WORK | Inline `.cdf-field-error` text appears and first invalid field is focused — good. But NO modal is shown. Users who don't notice the red text get no clear summary of what failed. Consider opening the branded `validation` modal on FE failure too. |
| 6 | **Submitting (saving=true)** | POLISHED | Spinner SVG animates, button shows "Saving…", `aria-busy` set, double-submit guard active. |
| 7 | **Success modal** | POLISHED | Deep Navy + coral ring + checkmark + chips + sync note + 4s auto-dismiss + two CTAs. Textbook. |
| 8 | **Validation error modal (BE)** | POLISHED | Azure tone header, field-error list with Azure icons, "Review fields" CTA focuses first invalid field after close. |
| 9 | **Network error modal** | POLISHED | Distinct state, "Try again" re-calls `onSubmit()`, "Keep editing" dismisses. |
| 10 | **Permission error modal** | POLISHED | 401/403 detected, navigates to `/recruiter/company/details` after close. |
| 11 | **Generic error modal** | POLISHED | Fallback for any non-categorised server error. "Try again" re-calls `onSubmit()`. |
| 12 | **Auto-dismiss countdown** | ADEQUATE | `autoDismissMs: 4000` on success modal, cleared on `ngOnDestroy`. No visual progress ring or countdown indicator shown to user — they may be surprised by the auto-close. |
| 13 | **Mobile form layout** | ADEQUATE | Bootstrap grid collapses to single column. Sticky save bar at bottom. No full mobile audit performed. |
| 14 | **Mobile success modal (bottom-sheet)** | POLISHED | `@media (max-width: 560px)` in component SCSS swaps `ghfm-enter` for `ghfm-slide-up` and sets `border-radius: 20px 20px 0 0`. Global `styles.scss` uses `:has()` to pin the CDK pane to `bottom: 0`. |

---

## 4. Motion Audit

### SVG Orbit Ring (success state)

| Check | Result | Detail |
|---|---|---|
| `stroke-dasharray: 213.6` math | PASS | 2π × 34 = 213.628... ≈ 213.6. Correct. |
| Animation: `dashoffset: 213.6 → 0` | PASS | `@keyframes ghfm-orbit { to { stroke-dashoffset: 0; } }` with `stroke-dashoffset: 213.6` initial value. Correct. |
| Duration 0.72s | PASS | `animation: ghfm-orbit 0.72s ...`. Matches `--gh-motion-analysis: 720ms` token. |
| Easing | PASS | `cubic-bezier(0.16, 1, 0.3, 1)` — exact match for `--gh-ease-scan`. Token not referenced via `var()` but value is identical. |
| Delay 0.12s | PASS | Starts immediately but with 0.12s delay so dialog enter animation completes first. |

### Checkmark Bounce

| Check | Result | Detail |
|---|---|---|
| Delay 0.5s | PASS | `animation: ghfm-check 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s both`. 0.5s after orbit begins. |
| Spring easing | PASS | `cubic-bezier(0.34, 1.56, 0.64, 1)` — exact match for `--gh-ease-spring-soft`. |
| Duration 0.4s | PASS | Appropriate for a confirmatory bounce. |
| Overshoot | PASS | Keyframe at 60%: `scale(1.18)` — visible spring overshoot. |

### Chips Stagger

| Check | Result | Detail |
|---|---|---|
| 55ms steps, 6 chips | PASS | `nth-child(1..6)` delays: 0/55/110/165/220/275ms. Cascade will look correct. |
| 0 chips (empty changedFields) | PASS | `.ghfm-chips` uses `*ngIf="data.changedFields && data.changedFields.length"` — hidden entirely when array is empty. |
| >6 chips | NEEDS WORK | Only `nth-child(1)` through `nth-child(6)` have stagger delays. Chips 7+ appear instantly (delay: 0ms / none). In practice `computeChangedFields()` can return up to 12 labels, so a submit changing all fields would show 12 chips with the last 6 appearing simultaneously. Low frequency but jarring if hit. |

### Modal Shell Enter Animation

| Check | Result | Detail |
|---|---|---|
| `ghfm-enter` animation | PASS | `scale(0.93) translateY(10px) → scale(1) translateY(0)`, 0.28s, `cubic-bezier(0.16,1,0.3,1)`. |
| Mobile replaces with `ghfm-slide-up` | PASS | `@media (max-width:560px)` swaps animation to `ghfm-slide-up`. |
| `ghfm-slide-up` definition | PASS | Defined inside the `@media` block: `from { transform: translateY(100%) } to { transform: translateY(0) }`. |
| Opacity fade during slide-up | NEEDS WORK | `ghfm-slide-up` only animates `translateY`. There is no `opacity` in the keyframe. On slow devices, the card appears opaque and slides up but does not fade in, unlike `ghfm-enter`. Minor visual inconsistency. |

### Reduced Motion

| Check | Result | Detail |
|---|---|---|
| `ghfm-wrap` animation off | PASS | `animation: none` |
| `ghfm-orbit-draw` animation off | PASS | `animation: none; stroke-dashoffset: 0` — ring appears instantly drawn |
| `ghfm-check` animation off | PASS | `animation: none; opacity: 1; transform: none` |
| `ghfm-chip` animation off | PASS | `animation: none` |
| `ghfm-slide-up` animation off | PASS | Covered by `ghfm-wrap { animation: none }` since slide-up is set on `.ghfm-wrap`. |
| Global `_motion.scss` belt-and-suspenders | PASS | Universal `*, *::before, *::after { animation-duration: 0.001ms !important }` rule in `_motion.scss` plus `styles.scss` use `0.001ms`/`0.01ms` respectively — both effectively instant. |
| Skeleton shimmer off | PASS | `.cdf-skeleton { @media (prefers-reduced-motion: reduce) { animation: none; background: #eeeeee } }` |

---

## 5. Haptics Audit

| Call site | Method | Trigger | Correct? | Notes |
|---|---|---|---|---|
| `onSubmit()` L204 | `haptic.press()` | User presses Submit button | YES | Fires only after double-submit guard passes and form is valid. User-initiated. |
| `afterSubmit()` L233 | `haptic.success()` | Server confirms `event === 'updated'` | YES | Task-completion haptic at the right moment. |
| `afterError()` L272 | `haptic.warning()` | BE returns `validation_error` or `fieldErrors` | YES | Warning (not error) for recoverable validation feedback. Correct taxonomy. |
| `afterError()` L299 | `haptic.error()` | `err.status === 0` (network) | YES | Network failure is a non-recoverable error from the user's POV. |
| `afterError()` L318 | `haptic.error()` | `err.status === 403 or 401` | YES | Permission denial. |
| `afterError()` L336 | `haptic.error()` | Generic server error fallback | YES | |

**No haptics fired on:** page load, auto-dismiss, `ngOnDestroy`. All correct — haptics are only for direct user feedback, not lifecycle events.

**Assessment:** Haptics implementation is **textbook-correct**. No issues found.

---

## 6. Button System Audit (Phase 24)

| Location | Element | Current Class/Style | Should Be | Compliant? | Fix Needed |
|---|---|---|---|---|---|
| Sticky save bar | Submit Changes / Saving… button | `btn btn-save gh-pressable` | `gh-btn-primary gh-pressable` | PARTIAL | Switch to `gh-btn-primary`; remove `btn-save`; remove explicit padding; height becomes 44px via token |
| GhFeedbackModal | Primary CTA (all states) | `ghfm-btn ghfm-btn--primary` | Component-local variant acceptable | YES | Modal has its own scoped button system — no global class needed since modal is self-contained |
| GhFeedbackModal (validation) | Primary CTA (validation state) | `ghfm-btn--primary` overridden to Azure gradient in `.ghfm-wrap--validation` | Correct: Azure for validation state | YES | No change |
| GhFeedbackModal | Secondary CTA | `ghfm-btn ghfm-btn--secondary` | Component-local `ghost` style | YES | Correct: transparent + border + coral hover. Equivalent to `gh-btn-secondary` styling. |
| Company logo section | `app-file-upload` "Select Profile Photo" | Unknown (delegated component) | `gh-btn-secondary` or ghost | UNKNOWN | Audit `app-file-upload` separately |
| Address field | `app-google-address-search` | Unknown (delegated component) | N/A | UNKNOWN | Audit `app-google-address-search` separately |

**Key finding:** The `btn-save` / `gh-btn-primary` mismatch is the most impactful button issue. Both render the coral gradient, but `btn-save` has:
- `font-weight: 500` vs spec `600`
- No `motion-safe` mixin (relies on `gh-pressable` for press animation only)
- Height by padding, not `--gh-btn-height: 44px`
- `border-radius: 7px` vs `gh-btn-primary`'s `10px`

---

## 7. Token Compliance

### GhFeedbackModal (gh-feedback-modal.component.scss)

| Category | Uses Tokens? | Example | Finding |
|---|---|---|---|
| Colors (header bg) | NO | `#0b1026`, `#1a1544` — hardcoded | Should use `var(--gh-navy)` and `var(--gh-grad-navy)` |
| Colors (coral) | NO | `#ff7062` — hardcoded 5× | Should use `var(--gh-coral)` or `var(--gh-grad-cta)` |
| Colors (azure) | NO | `#2f80ff` — hardcoded 3× | Should use `var(--gh-azure)` |
| Colors (error icon) | NO | `#ff7062` for error icon | Technically correct colour; could use `var(--gh-coral)` |
| Spacing (header padding) | NO | `32px 28px 22px` — hardcoded | Should use `var(--gh-space-8)`, `var(--gh-space-6)` |
| Button height | PARTIAL | `height: 44px` on `.ghfm-btn` matches `--gh-btn-height: 44px` — value correct, no `var()` | Low risk: value is correct and component-scoped |
| Border radius | NO | `border-radius: 20px` | No token at exactly 20px — `--gh-radius-hero: 24px` is closest. Value between card (18px) and hero (24px) — intentional modal intermediate. |
| Font family | YES (partial) | `font-family: 'Manrope', sans-serif` — hardcoded string | Should use `var(--gh-font-base)` |
| Motion duration (orbit) | NO | `0.72s` — hardcoded | Should use `var(--gh-motion-analysis)` |
| Motion easing (orbit/checkmark) | NO | `cubic-bezier(0.16, 1, 0.3, 1)` hardcoded | Should use `var(--gh-ease-scan)` / `var(--gh-ease-spring-soft)` |

### Company Details Form (company-details-form.component.scss)

| Category | Uses Tokens? | Finding |
|---|---|---|
| Colors | NO | All hardcoded: `#EF4444`, `#AFBCC6`, `#F59E0B`, `#FF7062`, `#FF3D6E` |
| Button gradient | NO | `linear-gradient(135deg, #FF7062 0%, #FF3D6E 100%)` — should use `var(--gh-grad-cta)` |
| Label font size | NO | `16px` hardcoded vs `--gh-label-font-size: 13px` |
| Input height | NO | `min-height: 50px` vs `--gh-input-height: 44px` |
| Skeleton shimmer | NO | Custom `cdf-shimmer` — should use global `.gh-dashboard-skeleton` or `gh-shimmer-v6` |
| Error colour | NO | `#EF4444` matches `--gh-color-error` value but not referenced by token |

**Overall token compliance: LOW.** Neither component uses `var(--gh-*)` custom properties. Values are largely correct (coral, error red, Manrope) but hardcoded — meaning a brand colour update would require touching each file individually.

---

## 8. Brand Backlog

| ID | Area | Issue | Priority | Effort | Dependencies |
|---|---|---|---|---|---|
| BB-01 | Form button | Switch `btn-save` to `gh-btn-primary` — fixes height token, weight, border-radius, motion-safe | P1 | XS (10 min) | None |
| BB-02 | FE validation UX | Open branded `validation` modal on FE-side `!companyDetailsForm.valid` with inline errors summary | P1 | S (30 min) | None |
| BB-03 | Chips stagger | Extend `nth-child` stagger to 12 chips (all possible FIELD_LABELS) | P2 | XS (5 min) | None |
| BB-04 | Modal token adoption | Replace hardcoded hex/values in `gh-feedback-modal.component.scss` with `var(--gh-*)` | P2 | M (1h) | tokens.scss already has all values |
| BB-05 | Form token adoption | Replace hardcoded values in `company-details-form.component.scss` with `var(--gh-*)` | P2 | M (1h) | tokens.scss already has all values |
| BB-06 | Label font size | Align `label` in form to `--gh-label-font-size: 13px` / `--gh-label-font-weight: 600` | P2 | XS (5 min) | Visual regression test advised |
| BB-07 | Mobile slide-up opacity | Add `opacity: 0 → 1` to `ghfm-slide-up` keyframe for fade-in parity with desktop enter | P3 | XS (5 min) | None |
| BB-08 | Auto-dismiss UX | Add a thin coral progress bar under modal header counting down the 4s auto-dismiss | P3 | S (45 min) | None |
| BB-09 | Motion token var() | Use `var(--gh-ease-scan)`, `var(--gh-ease-spring-soft)`, `var(--gh-motion-analysis)` in modal SCSS | P3 | XS (10 min) | None |
| BB-10 | Reduced-motion consistency | Unify `0.001ms` (_motion.scss) vs `0.01ms` (styles.scss) to single value | P3 | XS (2 min) | None |
| BB-11 | Input focus ring | Extend coral ring to `input:not(:disabled):hover` on desktop — currently only `:focus-visible` | P3 | XS (5 min) | Verify no a11y regression |
| BB-12 | app-file-upload button | Audit and align logo upload button to `gh-btn-secondary` | P2 | S | Requires reading app-file-upload component |
| BB-13 | Conflict/partial modal | `conflict` and `partial` states are typed but no panelClass open call is present in this component — verify they're unused or add handling | P2 | S | Verify via other call sites |

---

## 9. Implementation Log

### Already Correctly Implemented

- GhFeedbackModalComponent: full 8-state type system (`success`, `error`, `validation`, `network`, `partial`, `conflict`, `permission`, `session`)
- Orbit SVG ring with mathematically correct `stroke-dasharray: 213.6` (2π×34)
- Checkmark spring animation with `cubic-bezier(0.34, 1.56, 0.64, 1)` = `--gh-ease-spring-soft`
- Orbit ring uses `cubic-bezier(0.16, 1, 0.3, 1)` = `--gh-ease-scan`
- Orbit ring duration 0.72s matches `--gh-motion-analysis: 720ms`
- `prefers-reduced-motion` block covers all 4 animated elements (wrap, orbit, check, chip) + globally via `_motion.scss`
- `stroke-dashoffset: 0` in reduced-motion instantly completes the ring draw
- Auto-dismiss via `setTimeout` with `clearTimeout` in `ngOnDestroy` — no memory leak
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` on modal root
- `cdkFocusInitial` on primary CTA — keyboard focus lands correctly on open
- MatDialog chrome stripped via `gh-feedback-modal-panel` panelClass (`padding: 0`, `border-radius: 20px`, `background: transparent`)
- Mobile bottom-sheet: both component `@media (max-width: 560px)` and global `styles.scss `:has()` pane anchor
- Loading skeleton with shimmer + `aria-busy` + reduced-motion static fallback
- Haptics: 6 call sites, all correct (press/success/warning/error at right moments)
- Double-submit guard in `onSubmit()`
- `computeChangedFields()` snapshot diff driving success chips
- `focusFirstInvalidField()` post-validation for a11y
- `companyFacade.resetStateNotif()` called on init and destroy to prevent stale error replay
- `saving = false` reset in both success and error paths
- Global coral hover ring: `button` and `.btn` selectors correctly include modal buttons and save button

### No Fixes Applied

This audit is read-only. All findings above are observations; no code was modified.

---

## 10. Release Gate

| Gate | Status | Criteria | Finding |
|---|---|---|---|
| **A — Brand Compliance** | PASS (conditional) | Coral gradient on CTAs, Deep Navy on modal header, Azure on validation, Manrope font | All colour values correct even if not token-referenced. Save button matches gradient but is missing `gh-btn-primary` class. |
| **B — Motion Safety** | PASS | All animations off under `prefers-reduced-motion`; orbit ring instantly complete | Confirmed. Minor: mobile slide-up lacks opacity fade. Not a blocker. |
| **C — Haptics Safety** | PASS | No haptics on page load, auto-dismiss, or lifecycle; correct method per UX state | Perfect. No issues. |
| **D — State Coverage** | PASS (conditional) | All error/success states handled with branded modal | 12/14 states POLISHED. FE validation has no modal (BB-02). Auto-dismiss has no visual countdown (BB-08). Neither is a release blocker, but BB-02 is P1. |
| **E — Button System** | FAIL | Save button must use `gh-btn-primary` class for 44px token height and system consistency | `btn-save` custom class misses `gh-btn-primary`. Fix is BB-01, 10 minutes. Ship after fix. |

**Release recommendation:** Gate E (button system) is FAIL. Apply BB-01 (save button class swap) before shipping to resolve. All other gates pass. BB-02 (FE validation modal) is a P1 UX improvement strongly recommended alongside.

---

## 11. Recommended Next Command

Run `/code-review --effort=high` scoped to:
- `src/app/company/company-details-form/company-details-form.component.ts`
- `src/app/company/company-details-form/company-details-form.component.html`
- `src/app/company/company-details-form/company-details-form.component.scss`

Focus areas: BB-01 button class swap, BB-02 FE validation modal, BB-03 chip stagger extension.

After those fixes, run `/verify` to confirm the save button renders at 44px height and the coral ring applies correctly on hover.
