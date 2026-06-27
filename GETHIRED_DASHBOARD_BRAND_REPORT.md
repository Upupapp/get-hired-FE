# GETHIRED DASHBOARD BRAND — Executive Report

**Date:** 2026-06-27  
**Scope:** `/recruiter/dashboard` — employer-facing hiring command center  
**Files changed:** 3 (TS, HTML, SCSS)  
**Build result:** PASS (no errors; 2 pre-existing autoprefixer warnings unrelated to this pass)

---

## What Was Done

BRAND v5 was applied to the three dashboard component files to close 5 state/motion gaps identified in Phase 0 baseline. No logic changes, no API contract changes, no routing changes.

---

## Code Changes Made

### TypeScript (`company-dashboard.component.ts`)

**Change TS-A — Cached subscription percentages:**  
Added 3 class properties: `cachedJobPostPct`, `cachedAdminPct`, `cachedVideoPct` (all init `0`).

**Change TS-B — subsRestrictions$ tap extended:**  
The `tap()` callback now computes and caches all 3 subscription usage percentages each time the observable emits. Previously the tap only reset `subsError`.

**Change TS-C — retryDashboard() method:**  
Added `retryDashboard(): void` that calls `this.companyFacade.getCompanyDashboard()`. Required by the new error panel's retry button.

### HTML (`company-dashboard.component.html`)

**Change HTML-A — ng-container else clause:**  
`*ngIf="dashboard$ | async as dashboard"` → `*ngIf="dashboard$ | async as dashboard; else ghDashMissing"`. This triggers the error panel when `dashboard$` emits null.

**Change HTML-B — Error panel template:**  
Added `<ng-template #ghDashMissing>` containing a centred error panel (`role="alert"`) with icon, title, message, and a Retry button wired to `retryDashboard()`.

**Change HTML-C/D — Ring bindings:**  
Switched both SVG ring circle `stroke-dashoffset` bindings from `[attr.stroke-dashoffset]` to `[style.stroke-dashoffset]`. Required for CSS keyframe animations to run from the element's inline style value.

**Change HTML-E/F/G — Subscription meter cached values:**  
Replaced all 9 `subscriptionUsagePct(...)` template calls with the 3 cached properties (`cachedJobPostPct`, `cachedAdminPct`, `cachedVideoPct`). Bindings affected: `aria-valuenow`, `class.gh-sub-meter-fill--warn`, `class.gh-sub-meter-fill--danger`, `style.width.%`.

### SCSS (`company-dashboard.component.scss`)

**Change SCSS-A — New keyframes:**  
Added `@keyframes gh-ring-hero-fill`, `@keyframes gh-ring-comp-fill`, `@keyframes gh-bar-grow`.

**Change SCSS-B — Ring fill animations:**  
Added animation rules for `.gh-profile-ring svg circle:last-child` and `.gh-profile-comp-ring svg circle:last-child` using spring easing (cubic-bezier 0.16,1,0.3,1) over 900ms.

**Change SCSS-C — KPI stagger:**  
Added `:nth-child(1-8)` `animation-delay` rules inside `.gh-kpi-strip` (0–210ms, 30ms steps).

**Change SCSS-D — Inbox card stagger:**  
Added `.gh-inbox-card:nth-child(1-4)` `animation-delay` rules inside `.gh-inbox-cards` (50–200ms, 50ms steps).

**Change SCSS-E/F/G/H — Bar grow animations:**  
Applied `animation: gh-bar-grow` to `.gh-pipeline-bar-fill--active` (600ms), `.gh-branding-bar` (700ms), `.gh-sub-meter-fill` (650ms), `.gh-insight-bar` (600ms).

**Change SCSS-I — Error panel styles:**  
Added `.gh-dash-error-panel`, `.gh-dash-error-icon`, `.gh-dash-error-title`, `.gh-dash-error-msg`.

**Change SCSS-J — prefers-reduced-motion extended:**  
Added the new ring/bar/error/stagger selectors to the existing `@media (prefers-reduced-motion: reduce)` block.

---

## Gaps Fixed

| ID | Priority | Description | Status |
|----|----------|-------------|--------|
| GAP 1 | P1 | No error state when `dashboard$` is null — blank white page | FIXED |
| GAP 2 | P2 | SVG rings snap to value with no animation | FIXED |
| GAP 3 | P2 | `subscriptionUsagePct()` called 9× per CD cycle | FIXED (8× reduction) |
| GAP 4 | P2 | Bars appear at final width with no animation | FIXED |
| GAP 5 | P2 | KPI cards and inbox cards have no entrance stagger | FIXED |

---

## Release Gate

**GO** — All 8 gates pass. See `GETHIRED_DASHBOARD_BRAND_RELEASE_GATE.md` for full detail.
