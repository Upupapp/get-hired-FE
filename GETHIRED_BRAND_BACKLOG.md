# GETHIRED BRAND — Backlog (Phase 22)
**BRAND v6 · 2026-06-27**

---

## Priority Key

- **P1** — Required before next major feature ship
- **P2** — Required before public launch / marketing push
- **P3** — Post-launch improvement

---

## Backlog Items

### BB-001
- **Title:** Wire skeleton to public job list (replace GIF spinner)
- **State category:** Loading
- **Reason deferred:** Template change required; safe but out of scope for BRAND CSS pass
- **Priority:** P2
- **Dependencies:** None
- **Acceptance criteria:** `public-list.component.html` uses `.gh-card-skeleton` for initial load; GIF spinner removed from job list context
- **Risks:** Layout shift if skeleton dimensions don't match card dimensions

### BB-002
- **Title:** CV Doctor step indicator
- **State category:** Loading / Processing
- **Reason deferred:** Requires BE step-event API or reliable FE polling to know which step is active
- **Priority:** P1
- **Dependencies:** BE: step-event webhook or polling endpoint
- **Acceptance criteria:** 3-step progress indicator visible during CV analysis; each step confirms on API signal; no fake progress
- **Risks:** If BE doesn't emit step events, FE must time-estimate (risky — may advance before step is done)

### BB-003
- **Title:** Branded 404 / 403 / 401 error pages
- **State category:** Error / Fallback
- **Reason deferred:** Requires route-level error handling + lazy-loaded component
- **Priority:** P1
- **Dependencies:** Angular router wildcard route; error interceptor
- **Acceptance criteria:** Each page shows branded headline + action button; 401 redirects to login
- **Risks:** Existing router wildcard may conflict

### BB-004
- **Title:** KPI countup JS animation with `prefers-reduced-motion` check
- **State category:** Success / Loading reveal
- **Reason deferred:** JS countup requires manual reduced-motion check; CSS-only approach insufficient for number animation
- **Priority:** P2
- **Dependencies:** `_tokens.scss` CSS custom property `--gh-motion-countup` available
- **Acceptance criteria:** Numbers count from 0 to real value in 900ms when `prefers-reduced-motion` is not set; show final value immediately when it is set
- **Risks:** Accessibility: intermediate values should not be announced by screen readers

### BB-005
- **Title:** Offline banner (persistent top banner when `navigator.onLine === false`)
- **State category:** Offline / Degraded
- **Reason deferred:** Requires global Angular service listening to `window.online`/`offline` events
- **Priority:** P2
- **Dependencies:** Angular service + app shell template
- **Acceptance criteria:** Banner appears within 500ms of connection loss; auto-dismisses 3s after reconnect with "Back online." message; form data preserved in `sessionStorage`
- **Risks:** SSR: `navigator.onLine` not available server-side; must guard with `isPlatformBrowser`

### BB-006
- **Title:** Wire `.gh-plan-meter` class to plan health usage bars
- **State category:** Loading reveal
- **Reason deferred:** Requires identifying specific meter elements in subscription component; out of scope for BRAND CSS pass
- **Priority:** P2
- **Dependencies:** Identify component with plan usage bars
- **Acceptance criteria:** Meter fills from 0 to real usage on reveal; near-limit colour change (amber at 80%, red at 100%); reduced motion shows final value immediately
- **Risks:** Plan data may not always include usage percentage; need null guard

### BB-007
- **Title:** Inline error cards for public job list API failure
- **State category:** Error
- **Reason deferred:** Template change required
- **Priority:** P2
- **Dependencies:** None
- **Acceptance criteria:** If job list API fails, show error card with Retry button instead of blank section
- **Risks:** None significant

### BB-008
- **Title:** Expired job state on job detail page
- **State category:** Empty / Unavailable
- **Reason deferred:** Requires business logic (job status check) + template state
- **Priority:** P2
- **Dependencies:** Job status in API response
- **Acceptance criteria:** If `job.status === 'closed'` or similar, show "This job is no longer accepting applications." state with related jobs CTA
- **Risks:** API field name for job status may vary

### BB-009
- **Title:** Application submit error — local storage answer preservation
- **State category:** Error / Recovery
- **Reason deferred:** Complex UX; out of scope for BRAND pass
- **Priority:** P1
- **Dependencies:** Application form state management
- **Acceptance criteria:** On submit failure, answers persisted in `sessionStorage` or service; user sees "Your answers have been saved" message
- **Risks:** Large video answer payloads can't be stored in sessionStorage

### BB-010
- **Title:** Standardise `focus-visible` via CSS custom property
- **State category:** Accessibility
- **Reason deferred:** Low urgency; visual parity already achieved
- **Priority:** P3
- **Dependencies:** `_tokens.scss` custom property `--gh-focus-ring`
- **Acceptance criteria:** All `:focus-visible` rules use `var(--gh-focus-ring)` instead of hardcoded colour
- **Risks:** None

### BB-011
- **Title:** SR text on KPI elements (suppress countup intermediate values)
- **State category:** Accessibility
- **Reason deferred:** Requires JS implementation of countup (BB-004 first)
- **Priority:** P2 (after BB-004)
- **Dependencies:** BB-004
- **Acceptance criteria:** SR announces final KPI value only; intermediate values during countup are aria-hidden
- **Risks:** None

### BB-012
- **Title:** Sidebar nav label type scale — minor deviation (13.5px vs. 14px spec)
- **State category:** Typography
- **Reason deferred:** Cosmetic deviation; below impact threshold
- **Priority:** P3
- **Dependencies:** None
- **Acceptance criteria:** `.gh-sidebar-label` updated to `font-size: 14px; font-weight: 600`
- **Risks:** Layout — may slightly increase sidebar width on long labels

### BB-013
- **Title:** Page title / section title type scale — deviations found in screen audit
- **State category:** Typography
- **Reason deferred:** Requires per-component SCSS changes across many files; layout impact possible
- **Priority:** P3
- **Dependencies:** `_tokens.scss` type tokens established
- **Acceptance criteria:** Page titles: 28px/700; section titles: 20px/700; KPI numbers: 32px/700
- **Risks:** Layout changes; needs component-by-component audit

### BB-014
- **Title:** Angular chunk-load-failure intercept page
- **State category:** Error / Degraded
- **Reason deferred:** Requires Angular ErrorHandler override
- **Priority:** P2
- **Dependencies:** Angular ErrorHandler, `ChunkLoadError` detection
- **Acceptance criteria:** On chunk-load error (during lazy route load), user sees "A new version is available. Refresh now." — not a blank screen or console error
- **Risks:** ErrorHandler intercepts all errors; must be specific about `ChunkLoadError` type

### BB-015
- **Title:** Public company page skeleton + error state
- **State category:** Loading / Error
- **Reason deferred:** Out of scope for this BRAND pass
- **Priority:** P3
- **Dependencies:** None
- **Acceptance criteria:** Company detail page shows skeleton during load; error card if company not found or unavailable
- **Risks:** None

---

## Type-Scale Deviation Summary (from Screen Audit)

4 type-scale deviations flagged (see BB-012, BB-013):
1. Sidebar nav label: 13.5px vs. 14px (BB-012)
2. Page titles: varies per component vs. 28px/700 spec (BB-013)
3. Section titles: varies vs. 20px/700 spec (BB-013)
4. KPI numbers: varies vs. 32px/700 spec (BB-013)
