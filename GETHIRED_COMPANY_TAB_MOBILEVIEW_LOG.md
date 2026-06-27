# GETHIRED COMPANY TAB — MOBILEVIEW LOG
**Scope:** Employer Portal › Company Tab
**Date:** 2026-06-26

---

## Applied Fixes

### MOB-01 — Subtab Button Touch Targets (WCAG 2.5.5)
**File:** `src/app/employer-panel/employer-company/employer-company.component.scss`
**Added:** `min-height: 44px` to `.cp-subtab-btn`
**Why:** WCAG 2.5.5 requires 44×44px minimum touch target. Previous padding (14px top + 12px bottom = 26px) didn't reach 44px for users with thick thumbs.

### MOB-02 — Scrollable Subtab Nav — Visual Indicator
**File:** same SCSS
**Added:** `mask-image: linear-gradient(to right, transparent 0%, black 4%, black 92%, transparent 100%)` + `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` on `.cp-subtab-nav` at ≤576px
**Why:** Without the fade mask, horizontal scrollability is invisible — users don't know there are more tabs.

### MOB-03 — Roving Tabindex on Subtab Nav
**File:** `employer-company.component.html` + `.component.ts`
**Added:** `[attr.tabindex]="activeTab === tab.id ? 0 : -1"` on each tab button + `onTabKeydown` handler (ArrowLeft/ArrowRight/Home/End)
**Why:** WCAG 2.1.1 — keyboard users couldn't navigate between Company Profile / Employer Brand / Benefits tabs without a mouse.

---

## Existing Mobile Support (already in place)

| Feature | Status |
|---|---|
| `.cp-subtab-nav` overflow-x: auto at 576px | ✅ Already existed |
| `.cp-subtab-btn` font-size: 13px + reduced padding at 576px | ✅ Already existed |
| `.cp-tab-panel` padding: 0 12px at 576px | ✅ Already existed |
| `.card` padding: 16px at 576px | ✅ Already existed |
| `prefers-reduced-motion` for subtab + skeleton animations | ✅ Already existed |

## Deferred

| ID | Item | Why deferred |
|---|---|---|
| MOB-04 | CompanyDetailsForm has dense column layout (col-lg-6) — collapses ok but input order could be better on mobile | Product decision |
| MOB-05 | Google address widget behavior on mobile | Third-party, out of scope |
| MOB-06 | Company users table (`app-reusable-table`) mobile column collapsing | Shared component |
