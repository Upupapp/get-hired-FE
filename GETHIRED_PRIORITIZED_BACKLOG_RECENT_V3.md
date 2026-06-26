# GETHIRED_PRIORITIZED_BACKLOG_RECENT_V3
> Prioritized action backlog for ACTIONS command — scoped to homepage V2 deployment (commit e817e2e, 2026-06-26)

---

## Summary

8 actions derived from known gaps (GETHIRED_HOME_KNOWN_GAPS.md) and direct reading of the 6 changed files. No P0 items. The deployment is production-stable with two documented P2 accessibility gaps and one P1 analytics-infrastructure gap.

---

## GH-HOME-001

**Title:** Preview tab keyboard arrow navigation (ARIA Tabs pattern)

**Category:** accessibility

**Problem:** The Product Preview tablist does not support ArrowLeft / ArrowRight / Home / End key navigation between tabs. Keyboard users can reach each tab button via the Tab key on the page, but cannot navigate between adjacent tabs using arrow keys, which is the expected behavior per the W3C ARIA Tabs Pattern.

**Why it matters:** Arrow key navigation is the WCAG-expected behavior for a tablist (`role="tablist"`). The current implementation declares ARIA tab roles correctly but does not meet the full interaction model. Screen reader users who are experienced with ARIA tabs may expect this navigation and be confused when it does not work. This is the highest-impact accessibility gap remaining after V2.

**Affected files:**
- `src/app/public/main-portal/main-portal.component.html` (tab buttons at lines 180-205)
- `src/app/public/main-portal/main-portal.component.ts` (add keydown handler method)

**Priority:** P2

**Effort:** S (~30 lines TS, ~20 lines HTML event binding per the known gaps file)

**Acceptance criteria:**
- Pressing ArrowRight while focused on a tab button moves focus to the next tab and activates it
- Pressing ArrowLeft while focused on a tab button moves focus to the previous tab and activates it
- ArrowRight from the last tab wraps to the first tab
- ArrowLeft from the first tab wraps to the last tab
- Pressing Home while focused on any tab button moves focus and activation to the first tab
- Pressing End while focused on any tab button moves focus and activation to the last tab
- Tab key (not arrow) moves focus out of the tablist to the next focusable element in the page
- All existing mouse-click tab switching still works
- `setPreviewTab()` is called on arrow navigation (analytics event fires)
- Passes basic screen reader test with NVDA or VoiceOver: announcing tab label and "1 of 5, selected" style state

**Recommended command:** `/code-review` after implementation, then `/verify` in browser

**Status:** ready

---

## GH-HOME-002

**Title:** Preview tab button touch target (38px to 44px)

**Category:** accessibility

**Problem:** The preview tab buttons have `min-height: 38px` in `main-portal.component.scss`. The iOS Human Interface Guidelines and WCAG 2.5.5 (AAA) recommend a minimum touch target of 44x44px. At 38px, tabs are still tappable but are below the recommended guideline.

**Why it matters:** The Product Preview section is the largest new interactive element added in V2. Failing touch target guidelines on the primary navigation control of this section is a minor but visible gap. The fix is a single CSS line and has zero regression risk.

**Affected files:**
- `src/app/public/main-portal/main-portal.component.scss` (`.portal-preview-tab` rule)

**Priority:** P2

**Effort:** XS (1 line)

**Acceptance criteria:**
- `.portal-preview-tab` has `min-height: 44px` in the SCSS
- Tab buttons visually remain the same height or slightly taller; no layout overflow or wrapping regression at any breakpoint
- All 5 tab labels remain readable and not truncated after the height increase

**Recommended command:** manual edit, then `/verify`

**Status:** ready

---

## GH-HOME-003

**Title:** Wire hero CTA and final CTA click analytics

**Category:** analytics

**Problem:** `trackHeroCTAClicked()` and `trackFinalCTAClicked()` exist in `PublicPortalAnalyticsService` with the correct typed signature (`cta: 'find_jobs' | 'start_hiring'`), but neither is called from the component. The hero "Find jobs" and "Start hiring" buttons and the final CTA band buttons are not tracked.

**Why it matters:** The hero CTA is the highest-intent interaction on the page — the top-of-page conversion point. When an analytics SDK is wired, missing hero click events would mean a gap in the most important funnel step. The methods are already defined; this is a 4-line template change.

**Affected files:**
- `src/app/public/main-portal/main-portal.component.html` (hero CTA buttons at lines 15-16; final CTA at the `app-portal-cta-band` component at lines 425-432)
- `src/app/public/main-portal/main-portal.component.ts` (`goToJobs()` and `goToEmployerPortal()` methods — add analytics calls before navigation, or bind directly in template)

**Priority:** P3

**Effort:** XS (4 template lines or 2 TS method additions)

**Acceptance criteria:**
- Clicking "Find jobs" in the hero fires `trackHeroCTAClicked('find_jobs', 'home')`
- Clicking "Start hiring" in the hero fires `trackHeroCTAClicked('start_hiring', 'home')`
- Clicking primary CTA in the final band fires `trackFinalCTAClicked('find_jobs', 'home')`
- Clicking secondary CTA in the final band fires `trackFinalCTAClicked('start_hiring', 'home')`
- Navigation still occurs after analytics call (analytics must not block navigation)
- Dev console shows `[analytics] hero_cta_clicked { cta: 'find_jobs', page: 'home' }` when clicked in non-prod

**Recommended command:** manual edit (no command needed at this size)

**Status:** ready (blocked only if SDK wiring is deferred — events will be no-ops until GH-HOME-006 is done)

---

## GH-HOME-004

**Title:** Signals tab image error handler

**Category:** UX

**Problem:** The Compatibility Signals tab loads `match-signal-rings.svg` via an `<img>` tag. If this asset is missing from the production build or the path changes, the `<img>` fails silently — the broken image icon appears, the tab looks broken, and there is no fallback.

**Why it matters:** SVG assets can go missing during a deployment (wrong dist path, caching mismatch, accidental deletion). The signals tab is the only tab with an external asset reference; the other 4 tabs are pure CSS. A simple `(error)` handler or CSS fallback prevents a broken visual state in production.

**Affected files:**
- `src/app/public/main-portal/main-portal.component.html` (signals img at line 348)
- `src/app/public/main-portal/main-portal.component.ts` (add `onSignalImageError()` method)
- `src/app/public/main-portal/main-portal.component.scss` (add fallback CSS if using class toggle)

**Priority:** P3

**Effort:** XS (5 lines: 1 template attribute, 3 TS lines, 1 CSS rule)

**Acceptance criteria:**
- If the `match-signal-rings.svg` `<img>` fails to load, the broken image icon is not displayed
- The fallback is either: a CSS-only substitute (colored circle or placeholder div), or the `<img>` is hidden and a fallback `<div>` is shown via `*ngIf` toggle
- No console errors from the error handler itself
- If the image loads successfully, behavior is identical to current

**Recommended command:** manual edit

**Status:** ready

---

## GH-HOME-005

**Title:** Video answers preview richer visual (orb SVG + floating animation)

**Category:** UX

**Problem:** The Video Answers tab mock currently uses a minimal dark-background panel with a CSS play button triangle (`▶`) and a text label. The `video-answer-orb.svg` asset already exists in `/assets/brand/gethired-wow/` and is used in the USP section. The Product Preview spec originally called for this section to use the orb SVG with a subtle floating animation to give the video tab a more visually distinctive presence.

**Why it matters:** The Video Answers feature is one of GetHired's primary differentiators. The other four tabs have richer visual mocks (profile card with completeness bar, job list with badges, status timeline, signal rings). The video tab is the least visually distinctive panel and undersells the feature relative to its importance.

**Affected files:**
- `src/app/public/main-portal/main-portal.component.html` (video panel at lines 323-342)
- `src/app/public/main-portal/main-portal.component.scss` (add orb animation CSS)

**Priority:** P2

**Effort:** S (~20 lines HTML, ~30 lines SCSS)

**Acceptance criteria:**
- The video tab panel includes `video-answer-orb.svg` positioned prominently (e.g., floating above or behind the mock player area)
- The orb has a subtle CSS animation (float up/down, pulse, or glow) using `animation: orbFloat 3s ease-in-out infinite`
- `@media (prefers-reduced-motion: reduce)` disables the animation (animation: none)
- The orb image has `aria-hidden="true"` (it is decorative)
- The existing question text, mock player, and "Juan P. 2 min 14 sec" label are preserved
- The panel still correctly displays on mobile (animation does not cause overflow or horizontal scroll)
- No new npm packages or external assets required (orb SVG already exists)

**Recommended command:** manual edit, then `/verify` to check animation in browser

**Status:** ready

---

## GH-HOME-006

**Title:** Analytics SDK integration (wire the `track()` method body)

**Category:** analytics

**Problem:** `PublicPortalAnalyticsService.track()` is currently a safe no-op — it logs to `console.debug` in non-prod and does nothing in production. All analytics methods across the homepage, jobs page, and elsewhere call this single method. No analytics SDK exists in the codebase (confirmed via repo-wide search: no gtag, segment, mixpanel, amplitude, or posthog references found). This means zero real analytics data is being collected in production today despite a well-architected instrumentation layer.

**Why it matters:** The analytics architecture is already correct — a single `track()` method, a typed payload model, meaningful event names covering user intent (tab clicks, section views, CTA clicks). The infrastructure is built and waiting. Without SDK wiring, all 20+ instrumented events across the app fire into a void. Business decisions about the homepage redesign effectiveness (which tab is most viewed, does the employer band convert) cannot be made without data.

**Affected files:**
- `src/app/public/services/public-portal-analytics.service.ts` (the `track()` private method body at line 16-22)
- Potentially: `src/environments/environment.ts` and `environment.prod.ts` (API key configuration)

**Priority:** P1

**Effort:** M (provider selection + SDK install + single method wiring + env config; no call-site changes needed)

**Acceptance criteria:**
- A real analytics provider is chosen (Segment, PostHog, Mixpanel, or a lightweight custom BE endpoint)
- The SDK is installed as an npm package or loaded via script tag
- `track(event, payload)` sends a real event to the provider when `isProd()` returns true
- `isProd()` returns false in local dev so dev traffic does not pollute production analytics data
- Existing `console.debug` logging in non-prod is preserved (helpful for local development)
- An initial 24-hour smoke test in production shows events arriving in the provider dashboard
- Privacy: no user PII (email, name, applicant ID) is included in any homepage event payload — all existing payloads are already PII-free (page, tab, section metadata only)

**Recommended command:** Run `/ACTIONS` scoped to analytics infrastructure once a provider is chosen

**Status:** proposed (blocked by provider decision and env config access)

---

## GH-HOME-007

**Title:** Tab panel rendering: evaluate `[hidden]` vs `*ngIf` for panels with components

**Category:** performance

**Problem:** Each Product Preview panel uses `*ngIf` to conditionally include or exclude the panel's `<ng-container>`. With `*ngIf`, switching tabs destroys and recreates the DOM on every tab change. For current mock-only panels (pure HTML/CSS, no Angular components or `ngOnInit` logic), this has zero cost. If any panel is ever upgraded to include a real Angular component (e.g., a live data component, a chart, or a component with its own `ngOnInit`), the repeated destruction and recreation would re-trigger initialization on every tab switch.

**Why it matters:** This is a deferred architectural concern, not a current bug. The cost of `*ngIf` is zero right now. Raising it now ensures the decision is made deliberately if panels are upgraded. The fix, if needed, is to replace `*ngIf` with `[hidden]` binding (keeps DOM alive, toggling visibility only) or a structural directive pattern.

**Affected files:**
- `src/app/public/main-portal/main-portal.component.html` (all 5 `ng-container *ngIf` blocks at lines 211-364)

**Priority:** P3

**Effort:** S (~10 lines template change; requires SCSS update to handle `[hidden]` state if CSS approach is used)

**Acceptance criteria:**
- Decision is documented: either (a) `*ngIf` is kept with a comment confirming mock-only panels will never have component lifecycle, or (b) `[hidden]` is adopted and all 5 panels exist in the DOM with `[hidden]="activePreviewTab !== 'tabId'"`
- If `[hidden]` is adopted: all 5 panels render correctly; only the active panel is visible; no visible flash of hidden content on tab switch
- If `*ngIf` is kept: a code comment documents the known trade-off and the condition under which it should be revisited

**Recommended command:** manual decision + edit; no separate command needed

**Status:** proposed (low urgency — not actionable until panels are upgraded with components)

---

## GH-HOME-008 (discovered)

**Title:** Unused analytics methods cleanup or wire-up (orphaned V1 section methods)

**Category:** analytics

**Problem:** `PublicPortalAnalyticsService` contains methods that reference sections or features that no longer exist or are no longer wired:
- `trackHowItWorksSectionViewed(page)` — the "How it works" section was removed in V2; this method is now dead code
- `trackVideoAnswersSectionViewed(page)` and `trackMatchSignalsSectionViewed(page)` — these appear to be V1-era per-section view trackers; the V2 redesign unified section tracking via `PortalRevealDirective` events; these methods may be orphaned

**Why it matters:** Dead code in a service accumulates over time. If an analytics SDK is wired (GH-HOME-006), these orphaned methods will never fire, creating misleading gaps in event catalogs. Conversely, if they are actually wired somewhere (e.g., `/employers` or `/job-seekers` pages), they should be confirmed and documented.

**Affected files:**
- `src/app/public/services/public-portal-analytics.service.ts` (lines 122-128)
- Any templates that call `trackHowItWorksSectionViewed()`, `trackVideoAnswersSectionViewed()`, or `trackMatchSignalsSectionViewed()`

**Priority:** P3

**Effort:** XS (grep to verify no callers, then delete or comment methods)

**Acceptance criteria:**
- A grep across the FE repo confirms whether `trackHowItWorksSectionViewed`, `trackVideoAnswersSectionViewed`, and `trackMatchSignalsSectionViewed` have any callers outside of their own declarations
- If no callers: methods are removed with a commit message noting the removal reason
- If callers exist: methods are retained and a comment documents which template calls them

**Recommended command:** manual grep + edit

**Status:** proposed

---

## Priority Summary

| ID | Title | Priority | Effort | Status |
|----|-------|----------|--------|--------|
| GH-HOME-001 | Tab arrow key navigation | P2 | S | ready |
| GH-HOME-002 | Tab button touch target 38px → 44px | P2 | XS | ready |
| GH-HOME-003 | Hero + final CTA click analytics | P3 | XS | ready |
| GH-HOME-004 | Signals image error handler | P3 | XS | ready |
| GH-HOME-005 | Video preview orb SVG + animation | P2 | S | ready |
| GH-HOME-006 | Analytics SDK integration | P1 | M | proposed |
| GH-HOME-007 | Tab panel [hidden] vs *ngIf evaluation | P3 | S | proposed |
| GH-HOME-008 | Orphaned analytics method cleanup | P3 | XS | proposed |

## Recommended execution order

1. GH-HOME-002 (1 line, zero risk — do this immediately)
2. GH-HOME-001 (closes the last meaningful WCAG gap)
3. GH-HOME-005 (video orb — visual polish, good before any marketing push)
4. GH-HOME-006 (provider decision gates this; do in a dedicated session)
5. GH-HOME-003 (wire after SDK is live so events go somewhere real)
6. GH-HOME-004 + GH-HOME-008 (housekeeping, do together)
7. GH-HOME-007 (document-only decision, do when panels are next touched)
