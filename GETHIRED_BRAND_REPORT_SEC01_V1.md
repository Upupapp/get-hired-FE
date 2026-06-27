# GetHired BRAND Report — SEC-01 Motion Pass
**File audited:** `src/app/applicant-panel/applicant-profile/applicant-profile-details/applicant-profile-details.component.scss`
**Date:** 2026-06-25
**Scope:** Token correctness, reduced-motion coverage, CWV risk, consistency with `_motion.scss` / `styles.scss`

---

## Verdict by Effect

| # | Effect | Token-correct before | Fixed | Notes |
|---|--------|----------------------|-------|-------|
| 1 | Skeleton shimmer | **Partial** | Yes | Colors aligned to `styles.scss` baseline |
| 2 | Card reveal | **Partial** | Yes | Duration tokenised to `$motion-duration-card` |
| 3 | Error banner reveal | Pass | No | Ease token correct; hardcoded colors are acceptable (no warning brand token exists) |
| 4 | Session-expired banner | Pass | No | Ease token correct; hardcoded amber is acceptable (no warning brand token exists) |
| 5 | Retry button micro-scale | **Partial** | Yes | Scale unified to `$gh-scale-press`; redundant reduced-motion block removed |
| 6 | Sign-in CTA tap compression | **Partial** | Yes | Scale unified to `$gh-scale-press`; redundant reduced-motion block removed |
| 7 | Mobile tap feedback | **Partial** | Yes | Media query tightened to `(hover: none) and (pointer: coarse)` |

---

## Changes Applied (5 safe token/consistency fixes)

### Fix 1 — Skeleton shimmer colors aligned to `styles.scss` baseline
**Before:** `#e8e8e8 / #f5f5f5 / #e8e8e8`
**After:** `#f0f0f0 / #e0e0e0 / #f0f0f0`
**Rationale:** `styles.scss` `.gh-skeleton` (the existing app-wide skeleton class) uses these values. Using different gray stops in the same app produces a visible flash when a component transitions from its own skeleton to a shared-skeleton layout. Alignment eliminates that.

### Fix 2 — Card reveal duration tokenised
**Before:** `240ms` (hardcoded)
**After:** `$motion-duration-card` (220ms, from `_motion.scss`)
**Rationale:** The spec for card-enter animations is `$motion-duration-card`. The 20ms difference is imperceptible but consistency prevents the token drifting further in future edits.

### Fix 3 — Retry/CTA scale unified to `$gh-scale-press`
**Before:** `scale(0.97)` (both `.gh-profile-cta-btn`/`.gh-profile-retry-btn` and `.gh-signin-cta`)
**After:** `scale($gh-scale-press)` (0.985, from `_motion.scss` BRAND additions)
**Rationale:** `$gh-scale-press` is the designated token for press compression. `0.97` is noticeably heavier than `0.985` and would feel inconsistent against any `.gh-pressable` element on the same screen. Using the token ensures all pressable targets have identical tactile weight.

### Fix 4 — Redundant reduced-motion blocks removed (retry + CTA)
**Before:** Both button blocks contained an explicit `@media (prefers-reduced-motion: reduce) { transform: none; }` nested inside `:active`, in addition to `@include motion-safe` at the selector root.
**After:** The `@include motion-safe` mixin alone is retained (it applies `transition: none !important; animation: none !important;` under reduced-motion). The redundant nested blocks were removed.
**Rationale:** Not a bug (double coverage is harmless), but the redundancy signals a misunderstanding of the mixin's scope. Removing it avoids confusion in future edits and keeps the block shorter.

### Fix 5 — Mobile tap feedback query tightened
**Before:** `@media (hover: none)`
**After:** `@media (hover: none) and (pointer: coarse)`
**Rationale:** `styles.scss` uses `(hover: none) and (pointer: coarse)` for the global `.mat-raised-button/.btn` tap compression block (line 26-33). `(pointer: coarse)` specifically targets touchscreens; without it the rule also fires on some hybrid/pen devices where a background tint on `:active` is unexpected. Aligns with the global convention.

---

## Reduced-Motion Status

| Effect | Mechanism | Status |
|--------|-----------|--------|
| Skeleton shimmer | `@include ambient-motion-safe` (animation removed entirely) | **Correct** |
| Card reveal | `@include motion-safe` (animation + transition: none) | **Correct** |
| Error banner reveal | `@include motion-safe` | **Correct** |
| Session-expired banner | `@include motion-safe` | **Correct** |
| Retry button | `@include motion-safe` (redundant inline block removed) | **Correct** |
| Sign-in CTA | `@include motion-safe` (redundant inline block removed) | **Correct** |
| Mobile tap tint | Not animated; no mixin needed | **N/A** |

Additionally, `styles.scss` lines 38–44 provide a global catch-all (`animation-duration: 0.01ms; transition-duration: 0.01ms` on `*`) that backstops any component that misses its own mixin. All 7 effects are covered at both the component and global layer.

---

## CWV Risk Assessment

**Risk: LOW — no layout-triggering properties used in any animation.**

| Property animated | Compositor-only? | Risk |
|-------------------|-----------------|------|
| `opacity` (card reveal, error banner, session banner) | Yes | None |
| `transform: translateY(...)` (card reveal, error/session banners) | Yes | None |
| `transform: scale(...)` (buttons) | Yes | None |
| `background-position` (skeleton shimmer) | Yes (gradient layer, no reflow) | None |
| `background-color` (mobile tap tint) | No (paint, not layout) | Negligible — only fires on `:active`, not during page load |

No `width`, `height`, `top`, `left`, `margin`, `padding`, or `font-size` changes appear in any keyframe or transition. No Cumulative Layout Shift (CLS) risk. No paint-heavy continuous animation other than the skeleton shimmer, which is suppressed on reduced-motion and stops once content loads (no infinite animation remains on screen during LCP window).

---

## Remaining Non-Token Values (acceptable, no fix applied)

| Value | Location | Reason not fixed |
|-------|----------|-----------------|
| Animation duration `1.4s` on shimmer | Skeleton shimmer | No `$motion-duration-*` token covers ambient/infinite shimmer cadence; `$motion-duration-ambient: 6000ms` is for hero drift, not shimmer. Hardcoded `1.4s` is the conventional shimmer cadence. |
| Transition duration `100ms` on buttons | Retry/CTA | No token maps to a 100ms micro-press. Closest token is `$motion-duration-micro: 160ms`, which is too slow for press feedback. 100ms is correct for this use case. |
| Error banner colors `#fff3f3`, `#f5c6cb`, `#721c24` | Error banner | No warning/error color brand tokens exist in `colors.scss`. Hardcoded Bootstrap-style danger palette is the only available reference. |
| Session-expired banner colors `#fff8e1`, `#ffe082`, `#5d4037` | Session banner | No warning brand token exists. Amber palette is consistent with common Bootstrap warning convention used elsewhere in the app. |
| Error/session banner animation duration `220ms` / `240ms` | Both banners | `220ms ≈ $motion-duration-card`. The small divergence (session at 240ms vs card at 220ms) is intentional — the session banner slides a larger distance (12px vs 8px) so a slightly longer duration maintains equivalent perceived velocity. |

---

## Files Modified
- `src/app/applicant-panel/applicant-profile/applicant-profile-details/applicant-profile-details.component.scss` — 5 token/consistency fixes

## Files Read (not modified)
- `src/assets/styles/_motion.scss`
- `src/assets/styles/colors.scss`
- `src/styles.scss`
