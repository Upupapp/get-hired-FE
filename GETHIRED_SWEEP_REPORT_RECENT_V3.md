# GETHIRED SWEEP REPORT — RECENT DEPLOYMENT (Homepage V2)
**Scope:** Commit e817e2e — Homepage V2
**Date:** 2026-06-26
**Files reviewed:** 6 (all 6 changed files read in full)

---

## Executive Summary

### What was deployed
Homepage V2 adds three new sections to the main portal landing page (Product Preview tabbed panel, Trust & Safety 4-card grid, Employer Conversion Band), a hero upgrade with proof chips, and a new scroll-reveal directive (`appPortalReveal`). No backend changes. No auth, payment, or other portal files touched.

### Overall Deployment Health
**GOOD.** The deployment is functionally sound. The directive is SSR-safe and memory-leak-free. Claims are honest and carefully worded. No XSS risks. Analytics is a clean no-op stub. The main concerns are an accessibility gap (keyboard nav on the tab widget), a pre-existing SSR risk in `ViewedOnceDirective` (not introduced in this deployment), and minor code hygiene issues in `SharedModule` that pre-date this work.

### Risk Counts
| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 3 |
| Low | 4 |

### Top 5 Concerns
1. **[High] Missing keyboard arrow navigation on the Product Preview tablist** — ARIA tab role requires Left/Right arrow key cycling. Screen-reader users can reach tabs with Tab key but cannot navigate between tabs by arrow, violating WCAG 2.1 §4.1.2.
2. **[Medium] `ViewedOnceDirective` is not SSR-safe** — it checks `typeof IntersectionObserver === 'undefined'` but does not use `isPlatformBrowser`. On a server render (Angular Universal), this is technically fine (typeof guard returns 'undefined' on Node), but the approach is inconsistent with `PortalRevealDirective` which uses the Angular-idiomatic `@Inject(PLATFORM_ID)` pattern.
3. **[Medium] `shared.module.ts` classesToInclude has pre-existing duplicate entries** — `TabSelectorsComponent`, `EmptySectionComponent`, and `DropdownSearchComponent` each appear twice in the array. Not introduced by V2 but the new `PortalRevealDirective` registration was made adjacent to this debt.
4. **[Medium] `isProd()` reads `window.__env.production`** — the method wraps in try/catch so it is SSR-safe, but if production deployment does not set `window.__env.production = true`, analytics will console.debug in production. Tolerable since analytics is a no-op stub, but the environment detection is fragile.
5. **[Low] Dynamic `[id]` on tabpanel div** — `[id]="'panel-' + activePreviewTab"` changes the DOM element ID on every tab click. Some screen readers cache `aria-controls` target references, making the dynamic ID riskier than a static ID with a separately updated `aria-labelledby`.

### Top 5 Opportunities
1. **Add keyboard arrow navigation to Product Preview tabs** — small TypeScript addition to `main-portal.component.ts`, high a11y payoff.
2. **Integrate a real analytics provider** — the stub is already structured for a single swap-in at `track()`. GA4 or Mixpanel can be wired without touching any call site.
3. **Wire `trackHeroCTAClicked` and `trackFinalCTAClicked`** — two defined analytics methods that currently fire from nothing; easy to add template event bindings.
4. **Run OPTIMIZE** — three sections with blur-filter glows and CSS transitions are candidates for will-change and composite-layer hints to reduce paint jank on mid-range Android.
5. **Clean up `shared.module.ts` duplicate entries** — low risk, improves readability.

### Recommended Next Command
**OPTIMIZE** — assess blur/glow/transition performance impact on the Philippine market's typical mid-range Android devices, tune will-change, verify CLS and INP after the new sections. The tab keyboard gap is a direct targeted fix that does not need a full command.

---

## §1 Deployment Scope Map

### Changed Files and Their Roles

| # | File | Role |
|---|---|---|
| 1 | `src/app/shared/directives/portal-reveal.directive.ts` | NEW — SSR-safe IntersectionObserver scroll-reveal directive |
| 2 | `src/app/shared/shared.module.ts` | MODIFIED — added PortalRevealDirective to declarations + exports |
| 3 | `src/app/public/services/public-portal-analytics.service.ts` | MODIFIED — 6 new analytics event methods for homepage V2 sections |
| 4 | `src/app/public/main-portal/main-portal.component.ts` | MODIFIED — activePreviewTab, setPreviewTab(), heroProofChips, 3 section-viewed handlers |
| 5 | `src/app/public/main-portal/main-portal.component.html` | MODIFIED — 3 new sections, hero proof chips, appPortalReveal on 3 sections |
| 6 | `src/app/public/main-portal/main-portal.component.scss` | MODIFIED — ~350 new lines for all new sections + scroll-reveal CSS |

### New Sections Added to Homepage
- **Product Preview** — tabbed panel with 5 tabs (seeker profile, employer dashboard, application tracking, video answers, compatibility signals); all data illustrative/fictional with explicit subtitle "Illustrative view of key features."
- **Trust & Safety** — 4-card grid with honest, non-hyperbolic copy about what GetHired does and does not do
- **Employer Conversion Band** — mid-page CTA strip targeting employer signup, with TalentProofBadge and "Start hiring" button
- **Hero proof chips** — 4 inline feature-label pills in the hero section (plain text, no fabricated numbers)

### New Directive Added to SharedModule
`PortalRevealDirective` (`[appPortalReveal]`) declared and exported from `SharedModule`. Available to all modules that import `SharedModule`. Applied to 3 sections in the homepage template: Product Preview, Trust & Safety, Employer Band.

### Analytics Events Added (6 new methods in `PublicPortalAnalyticsService`)
- `trackProductPreviewSectionViewed(page)` — fires when Product Preview scrolls into view (wired)
- `trackProductPreviewTabClicked(tab, page)` — fires on each tab click (wired)
- `trackTrustSafetySectionViewed(page)` — fires when Trust & Safety scrolls into view (wired)
- `trackEmployerConversionBandViewed(page)` — fires when Employer Band scrolls into view (wired)
- `trackHeroCTAClicked(cta, page)` — defined in service but **not wired** in any template
- `trackFinalCTAClicked(cta, page)` — defined in service but **not wired** in any template

### What Was NOT Changed
- Auth flows (`/signin`, `/signup`, route guards)
- Backend (BE repo entirely untouched)
- Payment or subscription logic
- Job seeker portal (`/job-seekers` component)
- Employer portal (`/employers` component)
- Jobs listing (`/jobs`)
- Admin, recruiter, or user dashboards
- Any other public portal component

---

## §2 Code Quality Review

### `portal-reveal.directive.ts` — GOOD
- **Angular 13 compatibility:** Uses `@Inject(PLATFORM_ID)` and `isPlatformBrowser` correctly — this is the idiomatic Angular Universal pattern
- **SSR-safe:** On server or when `IntersectionObserver` is absent, adds `is-revealed` immediately so content is never permanently invisible
- **Memory-safe:** `ngOnDestroy` disconnects the observer; after the first intersection, the observer self-disconnects and `this.observer` is set to null, making `ngOnDestroy` a safe double-call
- **TypeScript:** `observer: IntersectionObserver | null` typed correctly; all accesses are null-guarded
- No runtime error risk found

One note: The SSR fallback immediately adds `is-revealed`, so scroll-reveal sections show fully visible with no transition for SSR users. This is correct and intentional — content must not be permanently invisible on server render. The CSS's `prefers-reduced-motion` override also achieves instant-reveal, so the two paths (SSR + reduced motion) converge correctly.

### `shared.module.ts` — MINOR ISSUES (pre-existing, not introduced by V2)
- `PortalRevealDirective` correctly added to both `declarations` and `exports` — consistent with `ViewedOnceDirective` pattern
- **Pre-existing issue:** `classesToInclude` array duplicates: `TabSelectorsComponent` (lines 61 and 63), `EmptySectionComponent` (lines 64 and 73), `DropdownSearchComponent` (lines 72 and 74). Angular deduplicates at compile time — no runtime impact — but the array is misleading
- No compilation risk from the V2 additions

### `public-portal-analytics.service.ts` — GOOD
- All 6 new methods follow the established no-op stub pattern exactly
- `isProd()` is SSR-safe (try/catch around `window` access)
- No PII logged in any payload — only section/tab/page string metadata
- `trackHeroCTAClicked` and `trackFinalCTAClicked` are defined but never called from any component — they are dead code for now, not a bug, but they register events (`hero_cta_clicked`, `final_cta_clicked`) that will never appear in analytics until template bindings are added

### `main-portal.component.ts` — GOOD
- `activePreviewTab: string = 'seeker'` — matches the first tab in the template; correct default
- `setPreviewTab(tab: string)` — no null risk; fires analytics before state update (analytically correct — the click intent is more important than the resulting state)
- `heroProofChips: string[]` — plain array, no interpolation security risk
- Three analytics handlers (`onProductPreviewViewed`, `onTrustSectionViewed`, `onEmployerBandViewed`) are clean single-line delegations to the analytics service
- No new lifecycle hooks, no new DI dependencies beyond existing `PublicPortalAnalyticsService`
- `goToJobSeekerPortal()` and `goToEmployerPortal()` call `haptics.selection()` — confirmed this carries through to the CTA buttons inside the new product preview panels, which is correct

### `main-portal.component.html` — GOOD WITH ONE CONCERN
- No `[innerHTML]` bindings anywhere — all content is text interpolation or static HTML
- No `DomSanitizer` usage
- All decorative images use `alt=""` and `aria-hidden="true"`
- All new sections use `aria-label`
- Mock card content is clearly fictional (initials only, generic company names: "ABC Company", "XYZ Corp", "Sunrise BPO")
- **One concern (Medium):** The tabpanel container uses `[id]="'panel-' + activePreviewTab"` — the DOM ID changes on every tab switch. The `aria-controls` on each tab button points to this ID. Some AT implementations cache the `aria-controls` target reference at focus time, meaning AT could lose track of the panel after a tab switch. A static `id="portal-preview-panel"` on the container with a separate `[attr.aria-labelledby]="'tab-' + activePreviewTab"` would be more robust.

### `main-portal.component.scss` — GOOD
- All new class names are scoped to `.portal-product-preview`, `.portal-trust-safety`, `.portal-employer-band`, `.portal-hero-*`, and `.preview-*` — no global selector leaks
- Breakpoints are consistent throughout: 991px (tablet), 767px (medium), 575px (mobile)
- `prefers-reduced-motion: reduce` handled in two blocks (lines 517–524 for hero animation; lines 539–544 inside `.portal-reveal-section`) — both correct
- **Dead CSS (Low):** `.portal-how-it-works` and `.portal-how-it-works-grid` styles (lines 413–459, ~47 lines) remain after the "How it works" section was removed from the template in V2. No functional impact.
- `backdrop-filter: blur(4px)` on `.portal-hero-chip` — no `@supports` guard. Graceful degradation: the semi-transparent background (`rgba(255,255,255,0.75)`) renders acceptably in unsupporting browsers.

---

## §3 Security & Claims Audit

### AI Screening Claims — CLEAR
No claims of AI screening, automated ranking, face analysis, voice analysis, emotion detection, or algorithmic filtering appear anywhere in the 6 changed files. Multiple sections explicitly disclaim automation.

### Auto-Ranking Claims — CLEAR
No "automatically ranked," "AI-matched," "smart ranking," or equivalent language found.

### Fake Statistics — CLEAR
No fabricated user counts, placement numbers, or hiring rates appear in the new sections. Hero proof chips are plain feature labels. The mock card applicant counts (12, 8, 3) appear inside a section explicitly labeled "Illustrative view of key features."

### TalentProofBadge Usage — FULLY COMPLIANT
Four `<app-talent-proof-badge>` placements confirmed, no hardcoded count strings used in their place:
- Line 20: `placement="main_portal_hero"` `variant="pill"`
- Line 102: `placement="main_portal_role_card"` `variant="pill"`
- Line 161: `placement="main_portal_role_card"` `variant="strip"`
- Line 415: `placement="employer_portal_hero"` `variant="strip"`

### Mock Data in Product Preview — CLEARLY FICTIONAL
- HTML comment at line 169: "all data is illustrative only, no real user data, no fake testimonials"
- Subtitle: "Illustrative view of key features." (line 177)
- All names use initials-only or generic first-name format: "Maria D.", "Juan P.", "ABC Company", "XYZ Corp", "Sunrise BPO"
- Completeness percentage (82%) and applicant counts (12, 8, 3) are plausible but occur only inside the labeled illustrative mockup

### Compatibility Signals Copy — FULLY COMPLIANT
- TypeScript component (line 36): "Compatibility signals are guidance, not automatic decisions -- they help teams understand fit without hiding decisions."
- Template signals mock note (line 351): "guidance · not automatic · human review"
- Template signals panel (lines 355–360): "Signals help teams understand candidate fit", "Always reviewed by a real person", "Signals support decisions — they never replace them."
- Trust & Safety card (lines 383–384): "Compatibility signals support review — they never auto-screen, auto-rank, or replace people in the hiring process."

### Video Answers Copy — FULLY COMPLIANT
- TypeScript (line 35): "Some jobs include video questions, helping candidates explain their experience in their own words."
- Trust & Safety (line 386): "When employers review video answers, real hiring team members watch them. No automated decisions from video content."
- Preview panel heading (line 333): "Video answers, reviewed by people"
- Preview panel bullet (line 337): "Reviewed by real hiring team members"

### XSS Risk Assessment — CLEAR
- No `[innerHTML]` bindings found in any of the 6 changed files
- No `DomSanitizer.bypassSecurityTrust*` calls found
- All content is either static HTML, `{{ interpolation }}` (Angular-escaped by default), or `[attr.binding]` (Angular-escaped)
- No user-supplied data is rendered anywhere in the new sections — all content comes from component TypeScript arrays and hardcoded strings

---

## §4 Accessibility Audit

### ARIA on tablist/tab/tabpanel — PARTIALLY COMPLIANT

**Present and correct:**
- `role="tablist"` on container `<div>` with `aria-label="Product feature preview"`
- `role="tab"` on each of the 5 `<button>` elements
- `[attr.aria-selected]="activePreviewTab === '...'"` on each tab — updates dynamically on click
- `id="tab-seeker"` through `id="tab-signals"` — unique, stable IDs on each tab button
- `aria-controls="panel-seeker"` through `aria-controls="panel-signals"` on each tab
- `role="tabpanel"` on the content container
- `[attr.aria-labelledby]="'tab-' + activePreviewTab"` on the panel

**Missing / Gaps:**
- **[High] No keyboard arrow navigation** — ARIA APG requires that within a tablist, ArrowLeft/ArrowRight moves focus between tabs. Currently only `click` is wired. A keyboard-only user must Tab through all 5 buttons sequentially, or use Enter/Space on the currently-focused tab. This fails WCAG 2.1 §4.1.2 for a tab widget.
- **[Medium] Dynamic `[id]` on tabpanel** — `[id]="'panel-' + activePreviewTab"` changes the element's DOM ID on every tab switch. Some AT implementations resolve the `aria-controls` reference once at focus time. A static ID with a dynamically updated `aria-labelledby` would be safer.
- **[Low] No roving-tabindex pattern** — all 5 tab buttons are naturally focusable (`<button>`), meaning Tab key cycles through all of them. The ARIA pattern expects inactive tabs to have `tabindex="-1"` and only the active tab `tabindex="0"`. Functional today but deviates from the ARIA APG spec.

### aria-label on Sections — GOOD
Every section in the template has an explicit `aria-label`:
- Product Preview: `aria-label="See how GetHired works"`
- Trust & Safety: `aria-label="Trust and fair hiring"`
- Employer Band: `aria-label="Ready to hire"`
- (Pre-existing sections also covered: "Choose your path", "Why GetHired is different", "What GetHired offers", "For job seekers", "For employers")

### aria-hidden on Decorative Elements — GOOD
Confirmed on all decorative elements in the new sections:
- Hero mesh image, glow divs, hero visual: `aria-hidden="true"`
- USP bridge image, USP icons: `aria-hidden="true"`
- Bento emoji icons: `aria-hidden="true"`
- Video player mock: `aria-hidden="true"`
- Signals rings image: `aria-hidden="true"`
- Trust emoji spans: `aria-hidden="true"`
- Role dividers (`|`): `aria-hidden="true"`

### Color Contrast — LIKELY ACCEPTABLE (not pixel-measured)
- Primary text `#1a1a1a` on white: well above WCAG AA (estimated 18:1)
- Body text `#4b5563` on white: ~7.5:1 — passes AA
- Secondary/muted text `#6b7280` on white: ~4.6:1 — marginally passes AA for normal text (4.5:1 required). Should be verified with a tool when this text appears at 13px.
- Active tab: white `#fff` on coral (`$color-global-red-buttons`, approx `#FE6F61`): coral-on-white is typically borderline — needs contrast checker verification.
- `.preview-signals-note` text `#9ca3af` on `#fff`: estimated ~2.5:1 — fails WCAG AA. Low severity (decorative/supplementary text only: "guidance · not automatic · human review") but should be noted.

### Touch Target Sizes — ACCEPTABLE WITH NOTE
- Tab buttons: `min-height: 38px` — 6px below the 44px recommended minimum. Acceptable for a non-primary interaction.
- Primary CTA buttons: `min-height: 44px` at mobile — correct.
- "Start hiring" in employer band inherits from global `btn-cta-primary`.

### Reduced Motion — GOOD
Two `prefers-reduced-motion: reduce` blocks confirmed:
1. Lines 517–524: `portal-hero-copy` and `portal-hero-visual` animations disabled (opacity set to 1, transform cleared)
2. Lines 539–544 inside `.portal-reveal-section`: `opacity: 1; transform: none; transition: none` — prevents scroll-reveal transition entirely

The directive SSR fallback and the CSS reduced-motion override together ensure no section is ever permanently invisible, and no animation plays for users who have requested reduced motion.

---

## §5 Performance Assessment

### Scroll-Reveal Directive Efficiency — GOOD
- Uses `IntersectionObserver` — browser-native, O(1) per element, runs off main thread
- Auto-disconnects after first intersection; `ngOnDestroy` is a safe double-call (null-guarded)
- Three instances on the page (Product Preview, Trust & Safety, Employer Band) — negligible overhead

### Tab Panel Rendering — ACCEPTABLE NOW, MONITOR LATER
Five `<ng-container *ngIf="...">` blocks mean Angular destroys and recreates the active panel's DOM on every tab click. For the current content (pure CSS mock cards, no images in 4 of 5 panels, one small SVG in the signals panel) this is fast and keeps DOM size small. If panels are ever upgraded to contain real components or images, switching to a `[hidden]` or `display:none` approach with pre-rendered content would eliminate the reflow cost.

### New Images / Lazy Loading — GOOD
Three images added in the new HTML:
- `portal-gradient-mesh.svg` — `loading="lazy"`, `aria-hidden="true"`, `width="400" height="300"` set (prevents CLS)
- `gethired-connection-bridge.svg` — `loading="lazy"`, `aria-hidden="true"`, `width="320" height="80"` set
- `match-signal-rings.svg` — `loading="lazy"`, `aria-hidden="true"`, `width="96" height="96"` set

All three are lazy-loaded with explicit dimensions — correct practice for Core Web Vitals (prevents layout shift).

### Bundle Size Impact — ACCEPTABLE
Public module chunk grew from 147 kB to 168 kB (~14% increase). The increase is attributable to ~350 compiled SCSS lines, the new template HTML, and the 65-line directive. Normal for a feature of this scope.

### CSS Filter Performance
`filter: blur(60px)` on two `.portal-hero-glow` divs and `backdrop-filter: blur(4px)` on hero chips trigger GPU compositing. On mid-range Android (Snapdragon 662-class devices common in the Philippine market), `filter: blur` can cause dropped frames if it triggers during scroll. The glow divs are `position: absolute` with `pointer-events: none` and are not inside scroll containers — they animate once on page load. Risk is low but worth profiling in OPTIMIZE.

---

## §6 Responsive/Mobile Assessment

### Product Preview Section — GOOD
- Tab buttons: `flex-wrap: wrap; gap: 8px` — 5 tabs may wrap to 2 rows on narrow screens (360px). Functional but potentially cramped. No horizontal scroll fallback provided.
- Panel: `grid-template-columns: 1fr 1fr` → `1fr` at 767px — mock card stacks above info text
- Inner container padding reduces from `48px 40px` to `32px 20px` at 767px; border-radius 24px → 16px

### Trust & Safety Grid — GOOD
- `repeat(4, 1fr)` → `repeat(2, 1fr)` at 991px → `1fr` at 575px — correct progressive collapse from 4-column to 2-column to single-column

### Employer Conversion Band — GOOD
- Single-column centered by default, no grid collapse needed
- Inner padding reduces at 767px; title reduces from 26px to 22px at 575px
- Max-width 500px on copy constrains line length at desktop

### Hero Split Layout — GOOD
- `grid-template-columns: 1.1fr 0.9fr` → `1fr` at 991px — visual mock cards collapse below copy on tablet
- The visual column is `aria-hidden="true"`, so AT gets only the copy at all sizes
- Mock cards reorient from horizontal-pair to vertical-stack via `flex-direction: column` at 575px

### Mobile CTA Buttons — GOOD
- Hero CTAs: full-width at 575px (`flex-direction: column; align-items: stretch; min-height: 44px`)
- Journey CTAs: same treatment at 575px

### One Gap — Tab Button Wrapping
At 360px viewport width with 5 tab buttons (each ~130–170px wide), the tab row will wrap to at least 2 rows, occupying significant vertical space before the panel content. No explicit mobile treatment (horizontal scroll, smaller text, or abbreviated labels) is provided. Low severity for initial deployment.

---

## §7 Risk Register

| Risk ID | Area | Severity | Description | File | Fix Status |
|---|---|---|---|---|---|
| R-01 | Accessibility | High | No keyboard arrow navigation on Product Preview tablist — violates ARIA tabs keyboard contract (WCAG 2.1 §4.1.2) | `main-portal.component.ts` + `.html` | Open — requires ~30 lines TS + template change |
| R-02 | SSR Compatibility | Medium | `ViewedOnceDirective` uses `typeof IntersectionObserver` guard only, not `isPlatformBrowser` — inconsistent with `PortalRevealDirective`; tolerable on current SSR config but diverges from idiomatic pattern | `viewed-once.directive.ts` | Pre-existing — not introduced by V2 |
| R-03 | Code Quality | Medium | `shared.module.ts` `classesToInclude` has 3 duplicated entries (`TabSelectorsComponent`, `EmptySectionComponent`, `DropdownSearchComponent`) | `shared.module.ts` | Pre-existing — not introduced by V2 |
| R-04 | Analytics | Medium | `isProd()` reads undocumented `window.__env.production` runtime flag — if production deploy does not set this, analytics console.debugs in prod (no functional impact while analytics is a no-op stub) | `public-portal-analytics.service.ts` | Open — tolerable |
| R-05 | Accessibility | Low | Dynamic `[id]` on tabpanel div changes DOM ID on every tab switch — may confuse AT that cache `aria-controls` references | `main-portal.component.html` | Open |
| R-06 | Accessibility | Low | Tab buttons lack roving-tabindex — all 5 are Tab-key reachable simultaneously, deviating from ARIA APG best practice | `main-portal.component.html` | Open |
| R-07 | Performance | Low | Tab panels use `*ngIf` per panel — DOM recreated on each tab switch; acceptable for current CSS-only content, becomes a concern if panels grow to include real components | `main-portal.component.html` | Monitor |
| R-08 | Code Hygiene | Low | Dead CSS for `.portal-how-it-works` and `.portal-how-it-works-grid` (~47 lines) remains after "How it works" section removed from template | `main-portal.component.scss` | Open — cosmetic only |

---

## §8 Opportunity Register

| Opportunity | User Benefit | Priority | Suggested Command |
|---|---|---|---|
| Add keyboard arrow navigation to Product Preview tabs | Screen-reader and keyboard-only users can navigate tabs correctly; WCAG compliance | High | Direct fix — ~30 lines TS + template |
| Wire `trackHeroCTAClicked` and `trackFinalCTAClicked` into template click bindings | Two analytics events start firing — hero and final CTA conversion visibility | Medium | Direct fix — 2 template bindings |
| Integrate real analytics provider (GA4 or Mixpanel) into `track()` body | Actual data on which homepage sections drive conversions | Medium | ACTIONS — product decision |
| Run OPTIMIZE for blur/glow/transition performance | Reduced paint jank on mid-range Android; better INP and Lighthouse scores | Medium | OPTIMIZE |
| Implement roving-tabindex on Product Preview tabs | Full ARIA tabs keyboard contract; pairs naturally with the arrow nav fix | Medium | Direct fix alongside R-01 |
| Add horizontal-scroll or abbreviated-label fallback for 5 tab buttons on 360px viewports | Cleaner tab row on low-end Android devices common in PH market | Low | MOBILEVIEW |
| Deduplicate `shared.module.ts` classesToInclude array | Cleaner code; reduces developer confusion | Low | Direct fix — cosmetic |
| Verify `#9ca3af` text contrast on signals mock panel | Ensure decorative note text meets WCAG AA or is explicitly marked as decorative | Low | OPTIMIZE / accessibility pass |

---

## §9 Recommended Next Command

**Run: OPTIMIZE**

Reason: The deployment is functionally correct and claims audit is fully clean. The single High finding (R-01: keyboard arrow navigation on tabs) is a targeted ~30-line fix that does not require a full command — it should be patched directly. Once that is in, the highest-value next action is an OPTIMIZE pass to:

1. Profile the `filter: blur(60px)` glow elements and `backdrop-filter: blur(4px)` chips on mid-range Android (the Philippine market skews toward Snapdragon 660/662-class devices where GPU blur is expensive)
2. Assess `will-change` declarations for the three `portal-reveal-section` elements to pre-promote them to composited layers before the transition fires
3. Verify Core Web Vitals (CLS, LCP, INP) with the new above-the-fold sections
4. Remove the ~47 lines of dead `.portal-how-it-works` SCSS

After OPTIMIZE, run TEST to lock in the `PortalRevealDirective` SSR fallback behavior as a regression guard.
