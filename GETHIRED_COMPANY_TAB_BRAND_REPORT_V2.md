# GETHIRED COMPANY TAB — BRAND REPORT V2 (Post-Fix)
**Scope:** Employer Portal › Company Tab
**Date:** 2026-06-26
**Previous:** GETHIRED_COMPANY_TAB_BRAND_REPORT.md (V1)

---

## Fixes Applied Since V1

| Item | V1 | V2 |
|---|---|---|
| Subtab keyboard navigation | ❌ Missing | ✅ Fixed — ArrowLeft/Right/Home/End (6b25780) |
| Touch targets on subtab buttons | ❌ 26px | ✅ 44px min-height (6b25780) |
| Mobile scroll fade mask | ❌ Missing | ✅ `mask-image` gradient + hidden scrollbar (6b25780) |
| Roving tabindex | ❌ Missing | ✅ `tabindex="-1"` on inactive tabs (6b25780) |
| Char counter feedback on description | ❌ Missing | ✅ Live counter with danger state at 950/1000 (6b25780) |

---

## Current Brand Score

| Area | Score | Notes |
|---|---|---|
| Tab switching motion | 9/10 | Slide + underline works well |
| Form save feedback | 5/10 | Modal-only, no inline state |
| Empty states | 8/10 | Good icons, reveal animation, copy clean |
| Touch targets | 9/10 | All subtab buttons now 44px ✅ |
| Keyboard UX | 9/10 | Arrow key nav + roving tabindex ✅ |
| Mobile scroll | 8/10 | Fade mask + hidden scrollbar ✅ |
| Content feedback | 8/10 | Char counter + better placeholder ✅ |

---

## Remaining Brand Gaps

| ID | Gap | Severity |
|---|---|---|
| B-01 | Profile tab form: save button has no loading state (spinner during submit) | Medium |
| B-02 | Profile tab form: success/error via modal dialog, not inline — SnackbarService preferred | Medium |
| B-03 | Company logo preview: no hover/focus state | Low |
| B-04 | Benefit chips (Work Setup, Team Size) have no icon | Low |
| B-05 | "Coming soon" sections use emoji — inconsistent with GetHired icon system | Low |

---

## Motion & State Inventory (current)

### Animations in place ✅
- `cp-reveal` keyframe: empty states slide-up on entry
- `cp-subtab-btn--active .cp-subtab-underline`: scaleX(0→1) with opacity
- Tab panel: `[@animate]` slide-up on tab switch
- `cp-skeleton-shimmer`: Brand and Benefits loading skeleton
- `prefers-reduced-motion` guards on all of the above

### Keyboard Flow (fixed this session)
- Arrow Right / Left: move between Profile / Brand / Benefits
- Home: jump to Profile tab
- End: jump to Benefits tab
- Roving tabindex: Tab key skips to the active tab button; arrows navigate within the group

---

## ARIA Compliance (current)

| Attribute | Status |
|---|---|
| `role="tablist"` on nav | ✅ |
| `role="tab"` on each button | ✅ |
| `role="tabpanel"` on each panel | ✅ |
| `aria-selected="true/false"` | ✅ |
| `aria-controls="cp-tabpanel-X"` | ✅ |
| `[attr.tabindex]="active ? 0 : -1"` | ✅ (fixed this session) |
| Arrow key navigation | ✅ (fixed this session) |
| `aria-live="polite"` on char counter | ✅ (fixed this session) |
