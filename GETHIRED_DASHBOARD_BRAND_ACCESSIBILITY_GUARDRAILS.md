# GETHIRED DASHBOARD BRAND — Accessibility Guardrails

**Scope:** A11y coverage on `/recruiter/dashboard`

---

## Existing A11y (Pre-Pass)

### ARIA Roles and Live Regions
- `role="alert"` on `gh-error-banner` (inline errors)
- `role="alert"` on `gh-error-sm` (card-level errors)
- `role="alert"` on subscription error
- `role="list"` + `role="listitem"` on pipeline stages
- `aria-live="polite"` on `.gh-pipeline-total` (updates reactively)
- `role="tablist"` + `role="tab"` on trend tabs with `aria-selected`
- `role="progressbar"` on branding bar, subscription meters (with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`)
- `role="group"` with `aria-label` on hero profile ring

### Labels on Interactive Elements
- KPI cards: individual `aria-label` on each (e.g., "Active jobs: 3. Go to jobs list.")
- Trend tabs: `aria-selected` bound dynamically
- Job Review buttons: `aria-label="Review applicants for {job title}"`
- Profile ring percentage: `aria-label="Profile completeness: {pct}%"`
- Subscription meters: `aria-label="{label}: {used} of {limit} used"`

### Screen-Reader-Only Content
- `.gh-visually-hidden` on trend tab column header ("Actions")
- Screen-reader pipeline summary: `*ngIf="!pipelineLoading && byStage.length > 0"` with text recapping all stages and counts

### `aria-hidden` Usage
- `.gh-hero-mesh` (decorative background gradient)
- All SVGs in KPI icons
- Pipeline bar wraps (`aria-hidden="true"` on `gh-pipeline-bar-wrap`)
- Subscription SVG clock icon
- `gh-chip-dot` decorative dots

---

## New A11y (This Pass)

### Error Panel (GAP 1 fix)
**Added:** `role="alert"` on `.gh-dash-error-panel`

This ensures screen readers announce the error immediately when it mounts, without the user needing to navigate to it. The element is mounted in place of the dashboard content — focus does not move automatically, but the announcement is immediate via the live region semantics of `alert`.

### Ring Animation A11y
**The SVG rings have `aria-hidden="true" focusable="false"`** on the SVG elements — the rings are purely visual. The percentage value is communicated by:
- Hero ring: `aria-label="Profile completeness: {pct}%"` on the `role="group"` wrapper
- Completeness card ring: `aria-label="Profile completeness {pct}%"` on the percentage `span`

The new CSS animation on `circle:last-child` does not affect ARIA — the animation is visual only and the accessible value is always the bound percentage number.

### Reduced Motion (Updated — this pass)

The existing `@media (prefers-reduced-motion: reduce)` block has been extended:

```scss
// Ring animations disabled
.gh-profile-ring svg circle:last-child,
.gh-profile-comp-ring svg circle:last-child {
  animation: none !important;
}

// Bar grow animations disabled
.gh-pipeline-bar-fill--active,
.gh-branding-bar,
.gh-sub-meter-fill,
.gh-insight-bar {
  animation: none !important;
}

// Error panel entrance disabled
.gh-dash-error-panel {
  animation: none !important;
}

// Stagger delays reset to 0 (no cascading delay even if animation somehow inherited)
.gh-kpi-strip > *,
.gh-inbox-cards .gh-inbox-card {
  animation-delay: 0ms !important;
}
```

The global override (`animation-duration: 0.001ms !important`) already handles most animations, but explicit `animation: none` for the new rings/bars is belt-and-suspenders per Atlassian best practice.

---

## Keyboard Navigation

| Element | Keyboard behaviour |
|---------|-------------------|
| "Post a job" (hero) | Tab to focus → Enter activates → navigates to `/recruiter/jobs/create` |
| "Review applicants" (hero) | Tab → Enter → `/recruiter/jobs/list` |
| "Complete profile →" (hero) | Tab → Enter → `/recruiter/company/details` |
| KPI card buttons | Tab → Enter → respective routes |
| Inbox action cards | Tab → Enter → respective routes; `:focus-visible` shows coral outline |
| Trend tabs | Tab between → Enter selects |
| "Retry" (error panel) | Tab → Enter → retryDashboard() |
| "Retry" (pipeline error) | Tab → Enter → retryPipelineOverview() |
| "Retry" (subscription error) | Tab → Enter → retrySubscription() |

All focus states use `outline: 2px solid` with `outline-offset: 2px` — visible on all supported browsers.

---

## Colour Contrast Compliance

| Element | Foreground | Background | Ratio | WCAG |
|---------|-----------|------------|-------|------|
| Body text (`$gh-text`) | `#1a1830` | `#ffffff` | ~14:1 | AAA |
| Muted text (`$gh-muted`) | `#6b6887` | `#ffffff` | ~4.5:1 | AA |
| Coral CTA | `#ffffff` | `$gh-coral` | ~3.9:1 | AA (large text) |
| Error panel title | `#1a1830` | `#ffffff` | ~14:1 | AAA |
| Error panel copy | `#6b6887` | `#ffffff` | ~4.5:1 | AA |
| Hero company name | `#ffffff` | `#1a1830` gradient | ~14:1 | AAA |
| Hero stats | `rgba(255,255,255,0.6)` | dark navy | ~4.6:1 | AA |

---

## Known A11y Gaps (Not Fixed This Pass)

1. **Messages KPI card** shows "—" with no explanation of why — deferred (no BE endpoint)
2. **Chart component** (`app-dashboard-charts`) has unknown a11y coverage — not audited this pass
3. **Trend tabs** are `role="tab"` but chart data does not change when selected — `aria-selected` truthfully reflects UI state, but the tab purpose is misleading. Deferred to when chart filtering is wired.
4. **No focus trap on error panel** — acceptable since error panel is not a modal; user can Tab through it naturally
