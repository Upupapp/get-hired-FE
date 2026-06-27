# GetHired Dashboard V5 — SWEEP Report
**Date:** 2026-06-27 | **Component:** `company-dashboard` | **Phases reviewed:** 24

---

## Executive Summary

The V5 dashboard is structurally sound. Chart data contract is verified correct. No P0 issues found. Six bugs fixed in this session; three P2 architectural concerns remain open.

---

## Findings by Priority

### P0 — Blocking (none)
No P0 issues found.

### P1 — High (all fixed in this session)

| # | Finding | File | Status |
|---|---------|------|--------|
| P1-01 | **Dead TS class properties** — `company: Model.Company`, `stat: any`, `charts: any` (lines 50-52) were V4 leftovers never read in V5 template or methods | `.ts` L50-52 | **Fixed** — removed |
| P1-02 | **Dead onboarding methods** — `cachedOnboardingSteps` property, `_refreshOnboardingCache()`, `onboardingSteps()`, `trackOnboardingStep()` — no onboarding section in V5 template; these ran on every `dashboard$` emit | `.ts` | **Fixed** — removed all four |
| P1-03 | **`companyProfileMissingFields()` field mismatch** — checked only 3 fields (logo, description, city) while `brandingScore()` checks 6 and the profile health checklist shows 6. The Action Inbox "Missing: …" text used the 3-field result, causing it to omit `industry`, `team size`, `contact number` from the list | `.ts` L441-448 | **Fixed** — expanded to 6 fields |
| P1-04 | **`div.gh-hero-profile` missing ARIA role** — `<div>` with `aria-label` but no `role` is invalid. Screen readers ignore the label | `.html` L63 | **Fixed** — added `role="group"` |
| P1-05 | **Hiring health chip shows "Unknown" on load** — chip rendered immediately with `cachedHiringHealth === 'unknown'` initial state, flickering "Unknown" until pipeline data arrives | `.html` L44-49 | **Fixed** — wrapped in `*ngIf="cachedHiringHealth !== 'unknown'"` |
| P1-06 | **Hero ring SVG `width="96" height="96"` overrides CSS** — hardcoded attributes win over CSS `position:absolute;inset:0` at 900px breakpoint, causing ring overflow on mobile | `.html` L65 | **Fixed** — removed width/height attributes |

### P2 — Medium (open)

| # | Finding | Impact |
|---|---------|--------|
| P2-01 | **No error state for `dashboard$` failure** — if the main facade observable errors, the component shows an infinite skeleton. There is no `catchError` on `dashboard$` | Blank screen on API failure |
| P2-02 | **Messages KPI permanently shows `—`** — no unread-count endpoint exists; the chip is always a dash. Low risk but misleading UX | Misleading metric |
| P2-03 | **`subscriptionUsagePct()` called 9× per CD cycle** — called 3× per meter (aria-valuenow, warn class, width.%) × 3 meters = 9 calls. Should be pre-computed | Minor perf |

### P3 — Low (open)

| # | Finding |
|---|---------|
| P3-01 | `_destroy$` Subject declared and completed in `ngOnDestroy` but no observable pipe uses `takeUntil(_destroy$)`. Subscriptions in `loadPipelineOverview()` are one-shot (`.subscribe()` with no unsubscribe), so leaks are low-risk but pattern is incomplete |
| P3-02 | **Trend tabs are display-only** — `setTrendRange()` updates `trendRange` which only affects the `gh-chart-summary` text label (`"Last 7d: …"`), not the actual chart data fed to `app-dashboard-charts`. The tabs communicate filtering that doesn't happen. Added `title="Date range filtering is coming soon"` as interim disclosure |
| P3-03 | `dashboard$` map returns `undefined` when `dash` is null — the `*ngIf="dashboard$ | async as dashboard"` handles this correctly, but an explicit `return null` would be cleaner |

### Clean (verified ✓)

- Chart data contract verified: `dash.graph` (array) → `dashboard.graph.graph`; `dash.statistic` → `dashboard.graph.statistic`; `dash.jobViews` → `dashboard.graph.jobViews` — all correctly wired to `app-dashboard-charts`
- Brand wow assets confirmed present: `candidate-profile-card.svg`, `hiring-pipeline-lines.svg`, `trust-shield-glow.svg`
- `noindex, nofollow` set correctly in `ngOnInit` via `SeoService`
- All API calls scoped to authenticated company (auth-gated route guard + companyId from localStorage)
- `navigateTo()` uses Angular Router — no JS URL injection vector
- `pipelineBarMax` initialized to 1 — safe against divide-by-zero in bar width calculation
- `needsReviewCount` computation correctly sums status 1 + status 3 only

---

## Files Audited

- `company-dashboard.component.ts` (543 lines)
- `company-dashboard.component.html` (684 lines)
- `company-dashboard.component.spec.ts` (826 lines → replaced with V5-aligned spec)
- `company-dashboard.component.scss` (referenced, not changed)
- `src/assets/brand/gethired-wow/` (assets confirmed)
- `src/assets/styles/_motion.scss` (motion tokens confirmed)
- `src/assets/styles/colors.scss` (color tokens confirmed)
