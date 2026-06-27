# GetHired Brand Implementation Log — SEO V3 Recent Audit
**Date:** 2026-06-25
**Type:** Safe brand polish pass (no new features, no template changes)

---

## Changes Made

### 1. `src/styles.scss` — Motion token + mixin consistency fixes

**What changed:**

**Skeleton `.gh-skeleton`:**
- Replaced inline `@media (prefers-reduced-motion: reduce) { animation: none; background: #ececec; }` block with `@include ambient-motion-safe` mixin (from `_motion.scss`) + a separate reduced-motion block just for the static background fallback
- Reason: `@include ambient-motion-safe` is the established pattern for continuous/ambient animations (see `_motion.scss` comment). The inline media query was functionally equivalent but inconsistent with the codebase pattern.
- Behaviour is unchanged for end users.

**Hover lift `.gh-job-card-hover`:**
- Replaced hardcoded `160ms` with `$motion-duration-micro` token
- Replaced hardcoded `cubic-bezier(0.4, 0, 0.2, 1)` with `$motion-ease-standard` token
- Replaced hardcoded `-2px` translateY with `$gh-lift` token
- Added `@include motion-safe` mixin (replaces the partial inline reduced-motion block)
- Fixed the reduced-motion tint fallback: added actual `background-color` values for both the normal hover state and the reduced-motion hover state (previously the transition was declared but the colour property was absent — a no-op)
- Added a very subtle `background-color: rgba(0,0,0,0.02)` on normal hover (in addition to the lift) so the hover communicates slightly even if the lift is imperceptible on some monitors
- Updated comments for accuracy

**Net result:** Behaviour is equivalent or slightly improved. All new values reference tokens. The utility class is now consistent with `job-card.component.scss`'s mixin usage.

---

## Changes NOT Made (and why)

### Skeleton wiring to public job list
**Deferred.** Would require modifying `job-posts-list.component.html` to conditionally render `N` skeleton cards instead of `<app-inline-loading>`, and removing/bypassing the `<app-inline-loading>` component. This is a meaningful template change, not a safe CSS tweak. Tracked as R2 in the brand report.

### OG image creation
**Deferred.** Needs a 1200x630px PNG designed/exported. Path: `src/assets/brand/gethired-og-default.png`. The `SeoService` constant and `angular.json` assets config both need to include this path. This is a P1 brand asset creation task, not a code fix. Tracked as R1 in the brand report.

### 404 button colour inconsistency
**Deferred.** The `.btn-primary` override in `error-not-found.component.scss` sets the colour to `$color-blue-primary` (blue), while the global `.btn-primary` uses `$color-global-red-buttons` (coral/red). Resolving this requires a design decision (should 404 use the blue theme or align with brand red?). Not a safe no-op change.

### OG/Twitter description copy improvement
**Deferred.** Index.html copy changes are editorial, not a code fix. Current description is functional. Flag for a future copy pass.

---

## Files modified

| File | Change type |
|---|---|
| `src/styles.scss` | Safe refactor — token reference + mixin consistency |

## Files created (reports only)

| File | Purpose |
|---|---|
| `GETHIRED_BRAND_REPORT_RECENT_V2.md` | Full audit findings |
| `GETHIRED_MICROINTERACTIONS_AUDIT_RECENT_V1.md` | Hover + skeleton quality detail |
| `GETHIRED_BRAND_IMPLEMENTATION_LOG_RECENT_V1.md` | This file |
