# GetHired Brand/State/Motion Audit — SEO V3 Deployment
**Scope:** Commits bf5bd08 (FE) + 26ca25a (BE) — SEO Phase 21 skeleton + OG meta + 404 polish
**Date:** 2026-06-25
**Mode:** Recent deployment audit (not a full ground-up BRAND run)

---

## 1. Skeleton System Quality

### What was shipped
`styles.scss` lines 270–328 added:
- `@keyframes gh-skeleton-shimmer` — gradient position shift from -400px to +400px
- `.gh-skeleton` base class with `background-size: 800px 100%`
- `.gh-skeleton-card`, `.gh-skeleton-title`, `.gh-skeleton-subtitle`, `.gh-skeleton-line`, `.gh-skeleton-tag`

### Technical assessment: GOOD

**Animation technique:** Correct. The shimmer uses `background-position` shift on a fixed `background-size: 800px` gradient — the standard production technique. The gradient is `linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)` giving a 3-stop wave. The middle stop (#e0e0e0 vs #f0f0f0) gives about 6% contrast — subtle, readable. Duration 1.4s linear is standard.

**Gap:** The two skeleton stop colors (#f0f0f0 light / #e0e0e0 dark) are hardcoded, not using the color token system. Minor — skeleton colours are intentionally neutral and don't need brand colours.

**Gap:** The `@keyframes` is named `gh-skeleton-shimmer` in the declaration but the animation property inside `.gh-skeleton` also references `gh-skeleton-shimmer` — consistent, no bug.

**Note:** The `.gh-skeleton-card` children use `@extend .gh-skeleton` which is SCSS placeholder extend. This works correctly and avoids class duplication.

### Wiring — CRITICAL FINDING: NOT WIRED to public job list

The skeleton classes `.gh-skeleton-card`, `.gh-skeleton-title`, `.gh-skeleton-subtitle`, `.gh-skeleton-line`, `.gh-skeleton-tag` are defined in `styles.scss` but **not applied in any public-facing template**:

- `src/app/public/public-list/public-list.component.html` — no skeleton, uses `<app-inline-loading>` spinner (a GIF camera animation + "LOADING" text)
- `src/app/jobs/job-posts-list/job-posts-list.component.html` — uses `<app-inline-loading *ngIf="loading$ | async">` (same GIF spinner)
- `src/app/jobs/job-card/job-card.component.html` — no loading state at all
- The only use of the new skeleton classes is in `job-applicants.component` (internal employer tool), which independently defined its own `%gh-skeleton-base` placeholder inside the component SCSS rather than using the global `.gh-skeleton` class

**Verdict:** The skeleton CSS system is well-architected but 100% orphaned from the public job portal. The loading state a user sees on `/jobs` is the legacy GIF + "LOADING" text, not the shimmer skeleton.

---

## 2. Hover Lift Quality

### `.gh-job-card-hover` class (styles.scss lines 332–345)
- `transition: transform 160ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 160ms cubic-bezier(0.4, 0, 0.2, 1)`
- Hover: `translateY(-2px)`, `box-shadow: 0 4px 16px rgba(0,0,0,0.1)`
- Motion-reduced: `background-color 120ms`, `transform: none`

**Assessment: GOOD class definition, but also not wired to the job card.**

The `.job-card` element in `job-card.component.scss` already has its own independent hover lift:
```scss
transition: transform $motion-duration-card $motion-ease-standard,
            box-shadow $motion-duration-card $motion-ease-standard;
@include motion-safe;

&:hover, &:focus-within {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.08);
}
```

This uses `$motion-duration-card` (220ms from `_motion.scss` tokens) and `$motion-ease-standard` (the cubic-bezier). The `job-card.component.scss` version is actually **better quality** than the `styles.scss` utility class:
- 4px lift vs 2px lift (more perceptible, premium feel)
- Larger box-shadow spread (24px vs 16px)
- Duration 220ms (better timing, matches card token) vs 160ms (micro token)
- Also triggers on `:focus-within` (accessibility)
- Uses `@include motion-safe` (complete suppression, not just fall-back tint)

**The `.gh-job-card-hover` utility class is redundant and unneeded** — the component already does this better. It can be kept as a utility for other card types that lack component-level hover, but the comment "Job card hover lift — public /jobs page" is misleading since `.job-card` doesn't use it.

**Lift value assessment:** `-4px` translateY (in the actual job card) is the right premium amount. 2px is too subtle for a card component; 4px is perceptible without looking jumpy. The box-shadow `0 12px 24px rgba(16,24,40,0.08)` is a depth-first shadow in the exact brand blue-black — premium feel.

---

## 3. prefers-reduced-motion Guard

### In styles.scss (SEO V3 addition)

**Skeleton shimmer guard:**
```scss
.gh-skeleton {
  animation: gh-skeleton-shimmer 1.4s infinite linear;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background: #ececec;
  }
}
```
Correct. Animation is fully removed (not slowed). Static fallback #ececec is appropriate.

**Hover lift guard (.gh-job-card-hover):**
```scss
@media (prefers-reduced-motion: reduce) {
  transition: background-color 120ms;
  &:hover { transform: none; }
}
```
Partially correct. Transform is disabled. However, the `background-color 120ms` transition persists — this is acceptable because color transitions are not motion (they're not spatial). The hover is still communicated via a background tint, which is the right fallback pattern.

**One edge case:** The reduced-motion block overrides the full `transition` property with `background-color 120ms`, but there is no `&:hover { background-color: ... }` defined on `.gh-job-card-hover`. The tint transition is declared but has nothing to tint to. Minor issue — harmless but the reduced-motion tint will silently do nothing.

### In job-card.component.scss (existing, token-based)

```scss
@include motion-safe;
```
Expands to:
```scss
@media (prefers-reduced-motion: reduce) {
  transition: none !important;
  animation: none !important;
}
```
Correct. Complete suppression. The `!important` ensures override even in specificity battles.

**Overall prefers-reduced-motion: CORRECT with minor edge case in unused utility.**

---

## 4. Social Brand Consistency (OG/Twitter)

### index.html defaults
- Title: "GetHired Online — Jobs and Hiring Platform in the Philippines" — Correct, clear, locale-specific.
- Description: "Find jobs, build your profile, post jobs, and manage hiring with GetHired Online — the modern hiring platform for the Philippines." — functional, accurate, includes both applicant and employer perspectives.
- `og:type = website`, `twitter:card = summary_large_image` — correct.

**Assessment:** The copy is competent but not emotionally compelling. It describes what the platform does but not why a Filipino jobseeker should care. The phrase "modern hiring platform" is generic. Recommend (non-blocking, future copy pass): "Find your next career in the Philippines — or hire top Filipino talent — with GetHired Online."

**Missing `og:image` and `twitter:image` in index.html static defaults.** The OG image tags are only dynamically injected via `SeoService.setPageMeta()`, which defaults to `${BASE_URL}/assets/brand/gethired-og-default.png`. That file does **not exist** (confirmed: directory `src/assets/brand/` contains only `gethired-wow/*.svg`, no PNG). Social sharing scrapers that don't execute JavaScript (most do not) will get no image from `index.html` static parsing.

---

## 5. 404 Page Brand Experience

### Template: error-not-found.component.html
- Title: "Page Not Found" (h1 with inline `font-size: 1.75rem` — overrides the component SCSS `.title-main` which sets 45px)
- Description: "The page you are looking for doesn't seem to be available. Try browsing open jobs or return to the homepage."
- CTAs: "Browse Jobs", "Go to Homepage" (desktop); same stacked (mobile)
- Recovery nav: `<a href="/home">` and `<a href="/jobs">` for crawlers

**Assessment:** Functional but generic. The SCSS shows the 404 component was originally styled with a "dog-not-found" mascot illustration (classes `.dog-not-found-left`, `.dog-not-found-right`), but those elements do not appear in the current HTML. The component was reduced to text + CTAs — the brand character was removed.

**Background:** `bg-light-green-transparent` is `#EFFFFD` (mint tint), not the brand red. The button uses `.btn-primary` which maps to `$color-blue-primary` (blue) in the component SCSS — inconsistent with the global `.btn-primary` which uses `$color-global-red-buttons`. This creates a style conflict resolved by specificity in the component SCSS, resulting in a blue button on 404 while all other primary buttons are red/coral. Likely intentional in the original design (404 used blue theme) but now looks like a bug post-redesign.

**Recovery links work.** The `<nav aria-label="Recovery navigation">` fallback for crawlers is well-structured.

---

## 6. OG Default Image Status

**File:** `src/assets/brand/gethired-og-default.png`
**Status: MISSING**

- `SeoService` references `const DEFAULT_OG_IMAGE = 'https://gethiredonline.app/assets/brand/gethired-og-default.png'`
- The `src/assets/brand/` directory exists and contains `gethired-wow/*.svg` (brand illustration SVGs) but **no PNG files**
- `index.html` has no static `og:image` meta tag (images are only injected by JavaScript)
- Result: all social sharing cards (Facebook, LinkedIn, Twitter/X, WhatsApp, Slack) will show **no preview image** for the homepage and any route where SeoService hasn't been called or JavaScript was not executed

**This is a P1 brand/SEO issue.** Social share cards without an image get significantly lower engagement rates.

---

## 7. Motion Token Reconciliation

### _motion.scss tokens (from prior BRAND work):
- `$motion-duration-micro: 160ms`
- `$motion-duration-card: 220ms`
- `$motion-ease-standard: cubic-bezier(0.4, 0, 0.2, 1)`
- `$gh-lift: -2px`
- Mixins: `@mixin motion-safe`, `@mixin ambient-motion-safe`

### SEO V3 styles.scss additions:
- `.gh-skeleton` animation: `1.4s infinite linear` — **hardcoded, not from tokens** (no ambient duration token exists, acceptable)
- `.gh-job-card-hover` transition: `160ms cubic-bezier(0.4, 0, 0.2, 1)` — **uses $motion-duration-micro value but hardcoded, not referencing the variable**
- `.gh-job-card-hover` lift: `-2px` — **uses $gh-lift value but hardcoded, not referencing the variable**
- Reduced-motion in `.gh-skeleton`: inline `@media` — does not use `@mixin ambient-motion-safe`
- Reduced-motion in `.gh-job-card-hover`: inline `@media` — does not use `@mixin motion-safe`

**Assessment: Inconsistent.** The values are correct (they match the tokens) but the variables/mixins are not referenced. The `_motion.scss` file is imported at line 3 of `styles.scss` (`@import "~assets/styles/motion"`), so the tokens are in scope. The SEO V3 work bypassed them.

**Contrast:** `job-card.component.scss` uses `$motion-duration-card`, `$motion-ease-standard`, and `@include motion-safe` correctly — demonstrating the correct pattern was known and working.

---

## 8. Loading State Wiring Summary

| Location | Loading state shown | Uses gh-skeleton? |
|---|---|---|
| Public job list (`/jobs`) | GIF camera spinner + "LOADING" text | No |
| Job detail page | Full page wait (`*ngIf="details$ | async"`) | No |
| job-applicants (employer) | Custom `gh-skeleton-line` (component-scoped) | Partial (own CSS) |
| Job card (while loading) | Not rendered (hidden by `*ngFor`) | No |

**The skeleton system defined in SEO V3 is not connected to any public-facing loading state.**

---

## 9. Risks Summary

| # | Risk | Severity | Blocking? |
|---|---|---|---|
| R1 | `gethired-og-default.png` missing — no OG image on any social share | P1 | Yes (brand) |
| R2 | Skeleton CSS defined but not wired to public job list | P2 | No (degrades to spinner) |
| R3 | Token values hardcoded in styles.scss instead of referencing variables | P3 | No |
| R4 | 404 button uses blue (component SCSS) vs red (global) — visual inconsistency | P3 | No |
| R5 | Reduced-motion hover tint has no background-color to tint to (harmless) | P4 | No |
| R6 | OG/Twitter description is generic — no emotional hook | P4 | No |

---

## Release Gate

**GO WITH CAUTION**

Functional state is stable. The skeleton/hover/motion code is correct and won't break anything. The single brand-breaking issue is the missing OG image (R1), which should be created and deployed as the next action but does not block the current deployment from staying live.
