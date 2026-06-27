# GETHIRED BRAND — Loading System (Phase 4)
**BRAND v6 · 2026-06-27**

---

## Loading Patterns

### App Shell Loading
- **Trigger:** Initial Angular bootstrap / cold page load.
- **Pattern:** App shell skeleton — sidebar skeleton + topbar skeleton + content area skeleton block.
- **Classes:** `.gh-page-skeleton` wrapping `.gh-skeleton` child blocks.
- **Duration:** Until Angular bootstraps; typically <1s. If >3s, show a text fallback "Loading GetHired…".
- **Copy (SR):** `<span class="gh-visually-hidden" aria-live="polite">Loading GetHired…</span>`

### Page Loading
- **Trigger:** Route navigation to a new page with async data.
- **Pattern:** Page skeleton matching layout of destination page (different per module).
- **Classes:** `.gh-page-skeleton`
- **Note:** Use Angular Router's `resolve` where possible to reduce raw "blank then skeleton" flash.
- **Copy (SR):** `aria-busy="true"` on main content wrapper.

### Section Loading (Card/Panel)
- **Trigger:** A card/panel inside an already-loaded page is fetching data.
- **Pattern:** `.gh-card-skeleton` inside the card shell. Card shell already visible (prevents layout shift).
- **Classes:** `.gh-card-skeleton`

### Inline Action Loading
- **Trigger:** Button clicked, request in flight.
- **Pattern:** Bootstrap `spinner-border spinner-border-sm` inside the button + disabled state. No page-level change.
- **Classes:** `.gh-inline-loading` on the loading container around spinner + text.
- **Copy:** Action-verb + "ing": "Saving…", "Publishing…", "Deleting…", "Uploading…"

### Search / Filter Loading
- **Trigger:** User types in search box or applies a filter.
- **Pattern:** Brief 200ms debounce, then inline spinner in search input right-side. Results area shows `.gh-card-skeleton` rows.
- **Copy:** None (inline spinner is sufficient; no text needed for <500ms debounced searches).

### CV Doctor Loading (Step-by-Step)
- **Trigger:** User submits CV for analysis.
- **Pattern:** 3-step progress indicator:
  1. "Reading your CV…" — document scan icon pulsing
  2. "Analysing your experience…" — signal rings icon
  3. "Building your CV Health report…" — chart icon
- **Classes:** `.gh-scan-loader`, `.gh-step-loader`
- **Duration:** Real server time. No fake progress advances.
- **Timeout:** 60s → error state with retry.
- **Copy on timeout:** "This is taking longer than expected. Try again?"

### Profile Readiness Loading
- **Pattern:** Readiness ring placeholder (`.gh-card-skeleton` circle) + skeleton lines for score and items.
- **No percentage shown until real data arrives.**

### Application Submit Loading
- **Pattern:** Full-step inline loading overlay on the submit step. "Submitting your application…"
- **Button disabled.** Back navigation disabled.
- **Copy:** "Submitting your application…"
- **On success:** Transition to success screen (not a toast).

### Recruiter Publish Loading
- **Pattern:** Inline loading on the Publish button. Job detail screen dims slightly (semi-transparent overlay).
- **Copy:** "Publishing your job…"

### File Upload Loading
- **Pattern:** Progress bar 0% → real% as chunks upload. File name displayed.
- **Copy:** "Uploading [filename]… [X]%"
- **On complete:** `uploadComplete()` haptic + "Upload complete."

### Employer Dashboard Loading (V5 Skeleton)
- **Trigger:** Dashboard data fetch after login/navigation.
- **Pattern (dark hero + full layout):**
  - Hero block: `.emp-dash-hero-skeleton` — dark purple gradient shimmer block matching hero height (~180px).
  - Action inbox: 2–3 skeleton action cards in a 2-col grid.
  - KPI strip: 4 skeleton KPI cards in a row.
  - Pipeline section: horizontal bar skeleton + label skeletons.
  - Job performance: 2–3 table row skeletons.
  - Employer health: 2-col grid skeleton cards.
- **Classes:** `.gh-dashboard-skeleton`
- **No blank dashboard at any point.**
- **Copy (SR):** "Loading your hiring command center…"

### Subscription / Plan Health Loading
- **Pattern:**
  - Plan badge skeleton (pill shape).
  - Usage meter skeleton (progress bar shape, 2–3 meters).
  - Text: "Checking plan health…"
- **Classes:** `.gh-plan-health-skeleton`
- **No plan limits shown until real data arrives.**

### Table Loading
- **Pattern:** 5–8 row skeletons (`.gh-table-skeleton`) matching column count of real table. Column headers visible (no need to skeleton them).

---

## Reusable Loading Classes (Global SCSS)

```scss
// All defined in styles.scss or _tokens.scss:
.gh-page-skeleton       // Full-page loading frame
.gh-card-skeleton       // Card-level skeleton
.gh-table-skeleton      // Table row skeletons
.gh-inline-loading      // Inline action loading container
.gh-top-progress        // Thin top progress bar (route transitions)
.gh-scan-loader         // CV Doctor scan animation
.gh-step-loader         // Multi-step progress indicator
.gh-upload-progress     // File upload progress bar
.gh-dashboard-skeleton  // Employer dashboard full skeleton
.gh-plan-health-skeleton// Plan health section skeleton
```

---

## Loading Anti-Patterns (Never Do)

| Anti-Pattern | Why Forbidden |
|---|---|
| Blank white screen > 100ms before skeleton | Looks broken |
| GIF spinner as sole page-level loading indicator | Legacy, non-accessible, no layout context |
| Fake progress bar that doesn't reflect real server progress | Dishonest, destroys trust |
| Spinner inside a disabled button with no text | Inaccessible (SR can't announce what's loading) |
| Auto-proceed without user confirmation after upload | Data safety risk |
| Dashboard loading that reveals zero-data sections briefly before filling | Layout shift / flash |
