# GETHIRED COMPANY TAB — BRAND REPORT
**Scope:** Employer Portal › Company Tab
**Date:** 2026-06-26

---

## Motion & States Inventory

### Tab Transitions
- **Entry:** `[@animate]="{value:'*', params:{ y:'12px', delay:'40ms' }}"` on each `cp-tab-panel` — slide-up + fade on tab switch ✅
- **Subtab underline:** `transform: scaleX(0→1)` + `opacity: 0→1` via `.cp-subtab-btn--active .cp-subtab-underline` ✅
- **Tab press:** `transform: scale(0.97)` on `:active` ✅
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables underline transition + subtab btn transition ✅

### Empty States
- **Pattern:** Icon (emoji) → heading → hint text → optional action link
- **Animation:** `cp-reveal` keyframe (translateY(8px) → 0, opacity 0→1, 0.35s ease) ✅
- **Reduced motion:** `animation: none !important` on `.cp-empty-state--reveal` ✅
- **Coverage:** All 7 "coming soon" / "not set" states have empty state components

### Skeleton Loading
- **Pattern:** `cp-skeleton-shimmer` gradient sweep (400px → 400px, 1.5s infinite)
- **Coverage:** Brand tab and Benefits tab have loading skeletons ✅
- **Profile tab:** Uses a separate `custom-profile-loader` (shared component) ✅
- **Reduced motion:** `animation: none; background: #eee` ✅

---

## Applied Brand Fixes

### BRD-01 — WCAG Touch Target on Subtab Buttons
Added `min-height: 44px` to `.cp-subtab-btn`. Previous heights varied by padding and were below the 44px threshold on some viewport sizes.

### BRD-02 — Keyboard Navigation (Roving Tabindex)
Added `Arrow` / `Home` / `End` key handling for subtab navigation. This brings the tab component in line with ARIA `role="tablist"` specification.

---

## Brand Gaps (open)

| ID | Gap | Severity | Recommendation |
|---|---|---|---|
| B-01 | Profile tab form: no save-button loading state (spinner during submit) | Medium | Show spinner in button during `this.loading` |
| B-02 | Profile tab form: success/error communicated via modal dialog, not inline | Medium | Switch to SnackbarService + button state |
| B-03 | Company logo preview is a static `<img>` — no hover or expand action | Low | Add subtle border glow on hover |
| B-04 | Benefit chips (Work Setup, Team Size) have no icon — look sparse | Low | Add small icon per chip type |
| B-05 | "Coming soon" sections use `⭐📅📚❤️` emoji — inconsistent with rest of GetHired icon system | Low | Replace with SVG icons from GetHired icon set when available |

---

## Token Audit

| Token | Value | Used Correctly? |
|---|---|---|
| `$cp-tab-active` | `$color-global-red` | ✅ Consistent with global red |
| `$cp-text-primary` | `#03011A` | ✅ Matches global text |
| `$cp-text-muted` | `#868686` | ✅ |
| `$cp-shadow` | `0 4px 22px rgba(0,0,0,.07)` | ✅ Matches card shadow system |
| `$cp-chip-bg` / `$cp-chip-color` | `#f0f4ff` / `#0C264C` | ✅ |
| `$cp-bg-backlog` | `#fafafa` | ✅ Clear visual delineation for "coming soon" |

---

## Microinteraction Score

| Area | Score | Notes |
|---|---|---|
| Tab switching | 9/10 | Slide + underline works well |
| Form save | 5/10 | Modal-only feedback, no inline state |
| Empty states | 8/10 | Good icons, clear copy, reveal animation |
| Touch targets | 8/10 | Fixed this session (was 5/10) |
| Keyboard UX | 8/10 | Fixed this session (was 2/10) |
