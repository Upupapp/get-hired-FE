# GETHIRED DASHBOARD BRAND — Loading System

**Scope:** All loading states on `/recruiter/dashboard`

---

## Loading Architecture

The dashboard has **4 independent loading scopes**. They each have their own skeleton, so a slow pipeline response does not re-blank sections that already loaded.

---

## Type 1 — Full Dashboard Skeleton (`#ghDashSkeleton`)

**Trigger:** `loading$ | async` is true (while `GET /company/dashboard` is pending).

**Controlled by:** `loading$` from `CompanyFacade`.

**What renders:**
```
.gh-hero-skeleton        — 220px shimmer block (full-width hero placeholder)
.gh-inbox-skeleton       — flex row: 1 large card + 3 small cards (shimmer)
.gh-kpi-skeleton-strip   — 8 shimmer KPI card placeholders (flex-wrap)
```

**What does NOT render:** The main `<div class="gh-dash">` is hidden (else branch). No hero, no section titles, no health grid.

**Duration:** Until the main API responds. Typically 300–800ms on production.

**SCSS class:** `%sk` placeholder — `background: linear-gradient(90deg, #f0edf8 25%, #e6e2f2 50%, #f0edf8 75%)`, `background-size: 1600px`, animated with `gh-shimmer 1.4s ease-in-out infinite`.

**Reduced motion:** `animation: none; background: #f0edf8` (solid, no shimmer).

---

## Type 2 — Pipeline Card Skeleton

**Trigger:** `pipelineLoading = true` (while `GET /company/dashboard-pipeline-overview` is pending).

**Controlled by:** `pipelineLoading` boolean (set by `loadPipelineOverview()`).

**What renders inside the pipeline card:**
```
.gh-skeleton--pipeline    — 100px shimmer block inside .gh-pipeline-card
```

**What renders inside the job performance card:**
```
.gh-skeleton--jobperf     — 120px shimmer block inside .gh-jobperf-card
```

**What renders in the Action Inbox:**
```
.gh-inbox-skeleton        — full inbox skeleton (same structure as Type 1 inbox portion)
```

**Note:** Pipeline loads in parallel with the main dashboard. Either can resolve first. If the main dashboard resolves first, the hero and KPI strip reveal while the pipeline card still shows its skeleton — this is intentional and correct.

---

## Type 3 — Subscription Skeleton

**Trigger:** `!(subsRestrictions$ | async)` — subscription data has not yet emitted.

**Controlled by:** `subsRestrictions$` observable emission timing.

**What renders inside the subscription card:**
```
.gh-skeleton--sub-head    — 16px × 130px shimmer (heading placeholder)
.gh-skeleton--sub-meter   × 3  — 8px shimmer bars (meter placeholders)
```

**Note:** `subsError` being true overrides this — the error state shows instead.

---

## Type 4 — Section-Level Loading (Action Inbox)

**Trigger:** `pipelineLoading = true` inside the Action Inbox section specifically.

**What renders:**
```
.gh-inbox-skeleton (inside .gh-inbox section) — identical to the full inbox skeleton pattern
```

This ensures the Action Inbox section shows a skeleton rather than an empty grid while pipeline data is pending.

---

## Skeleton Visual Spec

| Class | Height | Purpose |
|-------|--------|---------|
| `.gh-hero-skeleton` | 220px | Hero block |
| `.gh-skeleton--inbox-main` | 200px | Recommended step card |
| `.gh-skeleton--inbox-card` | 100px | Supporting action card (×3) |
| `.gh-skeleton--kpi` | 90px | KPI card (×8) |
| `.gh-skeleton--pipeline` | 100px | Pipeline stage list |
| `.gh-skeleton--jobperf` | 120px | Job performance table |
| `.gh-skeleton--sub-head` | 16px | Subscription heading |
| `.gh-skeleton--sub-meter` | 8px | Usage meter bar |

All use `@extend %sk` for the shimmer gradient animation. All use `border-radius: 12px` (meter: 4px).

---

## Loading-to-Content Transition

When loading resolves:
1. The `else ghDashSkeleton` template is destroyed
2. `<div class="gh-dash">` is mounted
3. Hero animates in: `gh-reveal 0.45s`
4. All `.gh-card` elements animate in: `gh-reveal 0.4s`
5. `.gh-inbox-main` animates in: `gh-reveal 0.4s`
6. KPI cards animate in with stagger: 0–210ms delays (new this pass)
7. Inbox cards animate in with stagger: 50–200ms delays (new this pass)
8. SVG rings animate from full-empty to value: 900ms spring (new this pass)
9. Bar fills animate from 0 to value: 600–700ms (new this pass)
