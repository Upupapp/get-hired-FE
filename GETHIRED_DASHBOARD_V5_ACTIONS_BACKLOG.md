# GetHired Dashboard V5 — Actions Backlog
**Date:** 2026-06-27 | **Component:** `company-dashboard`

---

## P1 — Done (this session)

| ID | Action | Owner | Effort |
|----|--------|-------|--------|
| ACT-01 | Remove dead V4 TS properties (`company`, `stat`, `charts`) | FE | 5 min |
| ACT-02 | Remove dead onboarding methods and property | FE | 10 min |
| ACT-03 | Expand `companyProfileMissingFields()` to 6 fields | FE | 10 min |
| ACT-04 | Add `role="group"` to `gh-hero-profile` div | FE | 2 min |
| ACT-05 | Hide hiring health chip until computed (not 'unknown') | FE | 5 min |
| ACT-06 | Remove SVG `width="96" height="96"` attributes from hero ring | FE | 2 min |
| ACT-07 | Add `title="Date range filtering is coming soon"` to trend tablist | FE | 2 min |
| ACT-08 | Rewrite spec file to cover V5 (11 suites, all 6-field model) | FE | 60 min |

---

## P1 — Open

| ID | Action | Owner | Effort | Notes |
|----|--------|-------|--------|-------|
| ACT-09 | Add `catchError` to `dashboard$` observable with error state in template | FE | 30 min | Currently shows infinite skeleton on main API failure |
| ACT-10 | Add `title` attribute to the trend tabs — already done; next: implement actual range filtering when BE supports it | FE + BE | 2–3 days | BE needs date-range param on `/company/dashboard` |

---

## P2 — Open

| ID | Action | Owner | Effort | Notes |
|----|--------|-------|--------|-------|
| ACT-11 | Pre-compute subscription meter percentages in tap/map, remove 9×/cycle calls | FE | 15 min | `subscriptionUsagePct()` called 9× per CD cycle |
| ACT-12 | Add unread-count endpoint to BE messages API; wire to Messages KPI | BE + FE | 1 day | KPI permanently shows `—`; no `/messages/unread-count` endpoint |
| ACT-13 | Add retry button + error message to main `dashboard$` failure path | FE | 20 min | Depends on ACT-09 |
| ACT-14 | Add `will-change: width` to `.gh-pipeline-bar-fill` and `.gh-branding-bar` | FE | 5 min | Avoids layout thrash on initial load |
| ACT-15 | Add CSS transition to SVG ring `stroke-dashoffset` with reduced-motion guard | FE | 10 min | Improves perceived responsiveness |

---

## P3 — Deferred

| ID | Action | Owner | Effort | Notes |
|----|--------|-------|--------|-------|
| ACT-16 | Switch to `ChangeDetectionStrategy.OnPush` | FE | 1–2 hrs | High benefit, needs audit of all `this.*` bindings |
| ACT-17 | Extract `asyncLocalStorage` helper to shared service | FE | 20 min | Used in both `ngOnInit` and `retrySubscription()` |
| ACT-18 | Add `takeUntil(_destroy$)` to pipeline and subscription observable chains | FE | 15 min | Low leak risk (one-shot calls) but good practice |
| ACT-19 | Add `_buildSupportingActions()` unit tests | FE | 20 min | Not covered in current spec |
| ACT-20 | Add `cachedHiringHealth` state-transition tests | FE | 15 min | Not covered in current spec |
| ACT-21 | Remove dead `min-height: 180px` from `.gh-chart-wrap` | FE | 2 min | Inner chart is always 300px; outer min-height is dead CSS |
| ACT-22 | Implement actual date-range filtering on chart data (requires BE support) | BE + FE | 3–5 days | Track as product feature |

---

## Owner Legend
- **FE** — Frontend developer (Angular)
- **BE** — Backend developer (Node.js / PostgreSQL)
- **FE + BE** — Requires both
