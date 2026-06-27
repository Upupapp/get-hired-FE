# GETHIRED DASHBOARD BRAND — Screen Audit

**Scope:** Full audit of every dashboard section on `/recruiter/dashboard`

---

## Section 1 — Hero (Hiring Command Center)

| Attribute | Status |
|-----------|--------|
| Loading state | Skeleton via `#ghDashSkeleton` (220px shimmer) |
| Error state | Covered by primary `#ghDashMissing` panel (inside `ng-container` — hides if null) |
| Success state | Full render with company name, stats, chips, CTAs |
| Empty state | Profile incomplete: "Complete profile" CTA visible; completeness chip shown |
| Entrance motion | `gh-reveal 0.45s` |
| Ring animation | `gh-ring-hero-fill 900ms spring` (NEW) |
| Haptics | `planAction()` on coral CTA (spec pending) |
| A11y | `aria-label` on profile ring group, `role="group"`, visually hidden % text |
| Performance | `cachedProfilePct` used (no function call in template) |
| Changed this pass | Ring binding `attr` → `style`; ring animation added |
| Priority | Done |

---

## Section 2 — Action Inbox

| Attribute | Status |
|-----------|--------|
| Loading state | `gh-inbox-skeleton` (main + 3 cards shimmer) while `pipelineLoading` |
| Error state | `gh-error-banner` with retry |
| Success state | Recommended step card + up to 4 supporting action cards |
| Empty state | `gh-inbox-all-clear` green bar when no supporting actions |
| Entrance motion | `gh-reveal 0.4s` on main card; stagger on action cards (NEW) |
| Haptics | `dashboardAction()` on action card tap (spec pending) |
| A11y | Section `aria-label="Action inbox"` |
| Performance | V5 cache (recommended step pre-computed) |
| Changed this pass | Inbox card stagger delays added |
| Priority | Done |

---

## Section 3 — KPI Strip

| Attribute | Status |
|-----------|--------|
| Loading state | 8 shimmer skeletons (`gh-skeleton--kpi`) in `#ghDashSkeleton` |
| Error state | Covered by primary error panel (KPI strip is inside `ng-container`) |
| Success state | 8 KPI cards with numbers, labels, colour-coded icons |
| Empty state | Shows `0` or `—` with context sub-label |
| Entrance motion | `gh-reveal 0.4s` + stagger 0–210ms (NEW) |
| Haptics | None (KPI cards navigate but haptic would be noisy for a row of 8) |
| A11y | Individual `aria-label` per card with metric + context |
| Performance | No function calls in template; all values pre-cached |
| Changed this pass | Stagger delays added |
| Priority | Done |

---

## Section 4 — Views & Applications Chart

| Attribute | Status |
|-----------|--------|
| Loading state | Covered by dashboard skeleton (chart is inside `ng-container`) |
| Error state | Covered by primary error panel |
| Success state | Chart component renders with graph data |
| Empty state | `gh-chart-empty` — "Activity trends will appear once your jobs receive views and applications." + "Manage jobs" |
| Entrance motion | Parent `.gh-card` has `gh-reveal 0.4s` |
| Haptics | None (passive chart view) |
| A11y | Chart component owned by `app-dashboard-charts` — not audited in this pass |
| Performance | Not changed |
| Changed this pass | None |
| Priority | Backlog: trend tabs not yet wired to data |

---

## Section 5 — Hiring Pipeline Health

| Attribute | Status |
|-----------|--------|
| Loading state | `gh-skeleton--pipeline` (100px shimmer) |
| Error state | `gh-error-sm` with "Couldn't load pipeline data." + Retry |
| Success state | Stage bars with purple fills + total count |
| Empty state | `gh-pipeline-empty` — "Applicants will appear here once candidates start applying." + "Post a job" |
| Entrance motion | Bar grow: `gh-bar-grow 600ms` on active bars (NEW) |
| Haptics | None |
| A11y | `role="list"`, `role="listitem"` on stages; `aria-live="polite"` on total; screen-reader pipeline summary |
| Performance | Not changed |
| Changed this pass | `gh-bar-grow` animation added to `--active` bars |
| Priority | Done |

---

## Section 6 — Job Performance Table

| Attribute | Status |
|-----------|--------|
| Loading state | `gh-skeleton--jobperf` (120px shimmer) |
| Error state | `gh-error-sm` with "Couldn't load job data." + Retry |
| Success state | Table of jobs with review chip and Review button |
| Empty state | `gh-jobperf-empty` — "No jobs are currently awaiting applicant review." + "View all jobs" |
| Entrance motion | Parent `.gh-card` `gh-reveal 0.4s` |
| Haptics | `gh-pressable` on Review button |
| A11y | `aria-label` on table, `aria-label` per Review button |
| Performance | Not changed |
| Changed this pass | None |
| Priority | Done |

---

## Section 7 — Employer Branding Health

| Attribute | Status |
|-----------|--------|
| Loading state | Covered by dashboard skeleton (inside `ng-container`) |
| Error state | Covered by primary error panel |
| Success state | Score number, colour bar, missing chips or "complete" message |
| Empty state | `*ngIf="cachedBrandingScore as branding"` — card hides if no score |
| Entrance motion | Bar grow: `gh-bar-grow 700ms` (NEW) |
| Haptics | `gh-pressable` on CTA |
| A11y | `role="progressbar"` on bar with `aria-valuenow/min/max/label` |
| Performance | `cachedBrandingScore` pre-computed |
| Changed this pass | `gh-bar-grow` added to branding bar |
| Priority | Done |

---

## Section 8 — Company Profile Completeness

| Attribute | Status |
|-----------|--------|
| Loading state | Covered by dashboard skeleton |
| Error state | Covered by primary error panel |
| Success state | Ring + 6-item checklist with green ticks for complete items |
| Empty state | `*ngIf="dashboard.company"` — card hides if no company |
| Entrance motion | Ring fill: `gh-ring-comp-fill 900ms spring` (NEW) |
| Haptics | `gh-pressable` on CTA |
| A11y | `aria-label` on percentage span |
| Performance | `cachedProfilePct` pre-computed |
| Changed this pass | Ring binding `attr` → `style`; ring fill animation added |
| Priority | Done |

---

## Section 9 — Subscription / Plan Health

| Attribute | Status |
|-----------|--------|
| Loading state | `gh-skeleton--sub-head` + 3×`gh-skeleton--sub-meter` |
| Error state | `gh-error-sm` with "Couldn't load subscription details." + Retry |
| Success state | Plan chip, renew date, 3 usage meters with colour-coded fills |
| Empty state | Not applicable (free plan still shows meters at 0) |
| Entrance motion | Meter fills grow: `gh-bar-grow 650ms` (NEW) |
| Haptics | `gh-pressable` on "Manage plan →" CTA |
| A11y | `role="progressbar"` on each meter track with `aria-valuenow/min/max/label` |
| Performance | `cachedJobPostPct`, `cachedAdminPct`, `cachedVideoPct` — 9 function calls → 3 cached values (8× reduction) |
| Changed this pass | All 9 `subscriptionUsagePct()` calls → cached properties; bar grow added |
| Priority | Done |

---

## Section 10 — Candidate Insights

| Attribute | Status |
|-----------|--------|
| Loading state | Covered by dashboard skeleton |
| Error state | Covered by primary error panel |
| Success state | Cities list with insight bars + applicant overview 2×2 grid |
| Empty state | Cities: `#noCities` template; overview: empty text when `totalContacts === 0` |
| Entrance motion | Insight bars: `gh-bar-grow 600ms` (NEW); parent card `gh-reveal 0.4s` |
| Haptics | None |
| A11y | Section `aria-label="Candidate insights"` |
| Performance | `cachedCities` pre-computed |
| Changed this pass | Insight bar grow animation added |
| Priority | Done |

---

## Section 11 — Primary Skeleton

| Attribute | Status |
|-----------|--------|
| Loading state | Active while `loading$` true |
| Reduced motion | All shimmer disabled; solid `#f0edf8` background |
| A11y | `aria-hidden="true"` on shimmer elements |
| Changed this pass | None |
| Priority | Done |

---

## Section 12 — Primary Error Panel (NEW)

| Attribute | Status |
|-----------|--------|
| Condition | `dashboard$` emits null (API failure) |
| A11y | `role="alert"`, keyboard-accessible Retry button |
| Motion | `gh-reveal 0.4s`; disabled under reduced-motion |
| Haptics | `planAction()` on Retry (spec pending) |
| Changed this pass | NEW — entire component |
| Priority | Done (P1 gap closed) |
