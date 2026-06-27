# GETHIRED DASHBOARD BRAND — Error System

**Scope:** All error states on `/recruiter/dashboard`

---

## Error Architecture

The dashboard has 3 error scopes, each independently handled so a failure in one section does not blank the entire page.

---

## Error Type 1 — Primary Dashboard API Failure (NEW — this pass)

**When:** `GET /company/dashboard` fails → `dashboard$` emits null → `loading$` becomes false.

**Visual:** `#ghDashMissing` template renders inside `.gh-dash` in place of all dashboard content. This is a full-section error panel, not an inline chip.

**Component:** `.gh-dash-error-panel`

**Anatomy:**
```
[role="alert"]
  .gh-dash-error-icon     — Warning SVG (circle + exclamation, 48×48, coral 50% opacity)
  .gh-dash-error-title    — "We couldn't load your dashboard" (20px 800)
  .gh-dash-error-msg      — "There was a problem loading your hiring data. This is usually temporary — please try again."
  button.gh-btn-coral     — "Retry" → calls retryDashboard() → calls companyFacade.getCompanyDashboard()
```

**Styling:**
- `max-width: 520px`, centred with `margin: 80px auto`
- White card with coral border (`rgba($gh-coral, 0.18)`)
- `border-radius: 20px`, `padding: 44px 32px`
- Entrance animation: `gh-reveal 0.4s`
- Mobile: `margin: 40px 16px; padding: 32px 20px`

**A11y:** `role="alert"` announces to screen readers immediately. The Retry button is keyboard-accessible.

**Reduced motion:** `animation: none !important` on `.gh-dash-error-panel`.

**Recovery:** Retry re-triggers `getCompanyDashboard()`. If successful, `loading$` toggles true→false, and the dashboard skeleton → content transition plays normally.

---

## Error Type 2 — Pipeline / Action Inbox API Failure

**When:** `getDashboardPipelineOverview()` observable errors → `error()` callback sets `pipelineError = true`.

**Visual — Action Inbox section:**
```
.gh-error-banner [role="alert"]
  <span> "Couldn't load action items right now."
  button.gh-btn-link → "Retry" → retryPipelineOverview()
```

**Visual — Hiring Pipeline Health card:**
```
.gh-error-sm [role="alert"]
  <p> "Couldn't load pipeline data."
  button.gh-btn-link → "Retry" → retryPipelineOverview()
```

**Visual — Job Performance card:**
```
.gh-error-sm [role="alert"]
  <p> "Couldn't load job data."
  button.gh-btn-link → "Retry" → retryPipelineOverview()
```

**Note:** All three share a single error flag (`pipelineError`). Retry resets the flag and re-calls `loadPipelineOverview()`.

**Impact:** Hero, KPI strip, health grid, candidate insights — all unaffected.

---

## Error Type 3 — Subscription API Failure

**When:** `subsRestrictions$` errors → `catchError` returns `of(null)`, sets `subsError = true`.

**Visual:**
```
.gh-error-sm [role="alert"]  (inside .gh-health-card subscription card)
  <p> "Couldn't load subscription details."
  button.gh-btn-link → "Retry" → retrySubscription()
```

**Recovery:** `retrySubscription()` resets `subsError = false` and re-dispatches `getCompanySubscription(companyId)`.

**Impact:** Hero plan chip (uses `subsRestrictions$ | async as subsHero`) may also be blank if the observable never emitted. The hero chip uses `*ngIf="subsRestrictions$ | async as subsHero"` so it simply hides if no data — no visual error in the hero.

---

## Error Copy Guidelines

| Scope | Title/Message | Tone |
|-------|---------------|------|
| Primary dashboard | "We couldn't load your dashboard / There was a problem loading your hiring data. This is usually temporary — please try again." | Empathetic, non-blaming |
| Pipeline/inbox | "Couldn't load action items right now." | Brief, inline |
| Pipeline card | "Couldn't load pipeline data." | Brief, inline |
| Job perf card | "Couldn't load job data." | Brief, inline |
| Subscription card | "Couldn't load subscription details." | Brief, inline |

All errors have a "Retry" recovery action. None expose technical error codes or HTTP status to the user.

---

## Error vs Empty Distinction

| Condition | State | Visual |
|-----------|-------|--------|
| API failed | Error | `role="alert"` panel with Retry |
| API succeeded, no data | Empty | Descriptive empty state, no Retry |

These are never mixed. If `byStage.length === 0` with no error, it is genuinely empty — a different message and CTA appear.
