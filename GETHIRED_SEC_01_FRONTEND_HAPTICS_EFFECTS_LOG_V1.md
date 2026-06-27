# GETHIRED_SEC_01_FRONTEND_HAPTICS_EFFECTS_LOG_V1

**Mission:** BOLA/IDOR fix — Frontend Haptics & Effects
**Date:** 2026-06-25

---

## File Changed

`get-hired-FE/src/app/applicant-panel/applicant-profile/applicant-profile-details/applicant-profile-details.component.scss`

All effects are CSS-only. No animation libraries added.

---

## Effects Implemented

### 1. Profile Skeleton Shimmer (loading state)

**Class:** `.gh-profile-skeleton`, `.gh-profile-skeleton--avatar`, `.gh-profile-skeleton--line`

**Implementation:** Keyframe animation `gh-skeleton-shimmer` — gradient sweep from left to right at 1.4s infinite.

**Reduced-motion:** `@include ambient-motion-safe` — animation: none under `prefers-reduced-motion: reduce`. The skeleton placeholder still renders visually (static color); only the movement is removed.

```scss
@keyframes gh-skeleton-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.gh-profile-skeleton {
  animation: gh-skeleton-shimmer 1.4s ease-in-out infinite;
  @include ambient-motion-safe;
}
```

**Usage:** Apply `.gh-profile-skeleton.gh-profile-skeleton--avatar` for the avatar placeholder, `.gh-profile-skeleton.gh-profile-skeleton--line.w-60` for name line, etc., while `loading$` is true.

---

### 2. Profile Card Reveal (success state)

**Class:** `.gh-profile-card`

**Implementation:** Keyframe animation `gh-profile-reveal` — fade in + translateY(8px → 0) at 240ms `cubic-bezier(0, 0, 0.2, 1)` (decelerate). Applied `both` fill-mode.

**Reduced-motion:** `@include motion-safe` — `transition: none; animation: none` under `prefers-reduced-motion: reduce`. Card appears instantly.

```scss
@keyframes gh-profile-reveal {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.gh-profile-card {
  animation: gh-profile-reveal 240ms $motion-ease-decelerate both;
  @include motion-safe;
}
```

---

### 3. Error Banner Reveal (error states)

**Class:** `.gh-profile-error-banner`

**Implementation:** Keyframe animation `gh-error-reveal` — fade in + translateY(-6px → 0) at 220ms. Styled with light red background, border, and appropriate color for 403/generic errors.

**Reduced-motion:** `@include motion-safe` — animation suppressed.

**Copy mapping:**
- 401 (session expired): shown in `.gh-session-expired-banner` (amber)
- 403 (mismatch): shown in `.gh-profile-error-banner` (red-tinted)
- Generic: shown in `.gh-profile-error-banner`

---

### 4. Session-Expired Banner (slide + fade)

**Class:** `.gh-session-expired-banner`

**Implementation:** Keyframe animation `gh-session-banner-slide` — fade in + translateY(-12px → 0) at 240ms. Styled with amber background for warning severity.

**Reduced-motion:** `@include motion-safe` — animation suppressed.

---

### 5. Retry Button Micro-scale

**Class:** `.gh-profile-retry-btn`

**Implementation:** `transform: scale(0.97)` on `:active`, with 100ms transition. No keyframe — pure CSS transition.

**Reduced-motion:**
```scss
&:active {
  transform: scale(0.97);
  @media (prefers-reduced-motion: reduce) {
    transform: none;
  }
}
```

**Focus:** `outline: 2px solid rgba($color-global-red-buttons, 0.85); outline-offset: 2px` on `:focus-visible` (aligned with global focus token).

---

### 6. Sign-in CTA Tap Compression

**Class:** `.gh-signin-cta`

**Implementation:** Same `scale(0.97)` active micro-press, 100ms transition. Reduced-motion guard inline.

**Focus:** Same `:focus-visible` outline as retry button.

---

### 7. Profile CTA Button Micro-scale

**Class:** `.gh-profile-cta-btn`

Same pattern as retry + signin CTA. Includes both transform and box-shadow transition for visual affordance.

---

### 8. Mobile Tap Feedback

**Implementation:**
```scss
@media (hover: none) {
  .gh-profile-cta-btn:active,
  .gh-profile-retry-btn:active,
  .gh-signin-cta:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
}
```

Only activates on touch devices (`hover: none`). Provides background tint feedback when tap is held.

---

### 9. Focus-Visible Glow

All interactive elements (retry btn, CTA, signin CTA) carry:
```scss
&:focus-visible {
  outline: 2px solid rgba($color-global-red-buttons, 0.85);
  outline-offset: 2px;
}
```

This aligns with the global focus token already in use across the applicant panel (verified in `applicant-panel.component.scss`). No additional global change needed.

---

## Reduced-Motion Compliance Summary

| Effect | Under prefers-reduced-motion: reduce |
|---|---|
| Skeleton shimmer | No animation — static placeholder |
| Card reveal | No animation — card appears immediately at full opacity |
| Error banner reveal | No animation — banner appears immediately |
| Session banner slide | No animation — banner appears immediately |
| Retry micro-scale | No transform — button press has no visual movement |
| CTA compression | No transform — button press has no visual movement |
| Mobile tap feedback | Background tint only (no motion) — unaffected |
| Focus glow | Not animated — static outline, always on |

All animations use `@include motion-safe` (which applies `transition: none; animation: none`) or explicit `@media (prefers-reduced-motion: reduce) { transform: none; }`. The `ambient-motion-safe` mixin applies to the shimmer (continuous) animation.

---

## Motion Token Alignment

All durations and easings use tokens from `_motion.scss`:
- `$motion-ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1)` — reveal animations
- `$motion-ease-standard: cubic-bezier(0.4, 0, 0.2, 1)` — micro-press transitions
- Durations: 220–240ms for reveals (within the card-enter 180-280ms spec), 100ms for micro-press (within microinteraction 120-200ms spec, lower end intentional for press responsiveness)

---

## CSS Library Dependencies

NONE. All CSS is native keyframes + transitions. No GSAP, Animate.css, or other animation library added.
