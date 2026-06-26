# GetHired Employer Dashboard — SEO Report
**Scope:** `/recruiter/dashboard` — page title, heading hierarchy, semantic HTML, ARIA, indirect public SEO implications
**Date:** 2026-06-27

---

## Context

`/recruiter/dashboard` is an authenticated route — it is not indexed by search engines. The relevant SEO concerns are therefore:
1. **Page title / meta** — correct browser tab title for usability and developer discipline.
2. **Heading hierarchy** — correctness and accessibility (headings are consumed by assistive technology even on auth-gated pages).
3. **Semantic HTML** — landmarks and element semantics.
4. **Accessibility-SEO overlap** — ARIA roles, landmark regions.
5. **Indirect public SEO** — how dashboard completeness widgets affect the public company/job pages that ARE indexed.

---

## §1 Page Title Handling

**Finding:** The `CompanyDashboardComponent` does not inject `SeoService` or Angular's `Title` service in its constructor, and does not call `setPageMeta()` in `ngOnInit()`. As a result, when a recruiter navigates to `/recruiter/dashboard`, the document title retains whatever was set by the last public/auth page visited (e.g., "GetHired Online — Jobs and Hiring Platform in the Philippines" from the homepage, or "Sign In — GetHired Online" from the login page).

**The SeoService exists and is fully functional** (at `src/app/core/services/seo.service.ts`) with a `setPageMeta()` method and a `setRobots()` method. The correct pattern would be:
```ts
this.seoService.setPageMeta({
  title: 'Dashboard — GetHired Online',
  description: '',            // not indexed
  robots: 'noindex, nofollow',
});
```

**Recommendation (P1 — usability/discipline):** Call `seoService.setPageMeta()` in `ngOnInit()` with `robots: 'noindex, nofollow'` and a descriptive title (`Dashboard — GetHired Online`). This prevents the browser tab from showing a stale public-page title, keeps the robots directive correct, and aligns with the existing SeoService pattern used everywhere else.

---

## §2 Heading Hierarchy Audit

The dashboard template uses the following heading structure:

| Level | Text | Section |
|---|---|---|
| H1 | `{{ dashboard.company?.companyName }}` (or "Your company") | Hero — line 10 |
| H2 | "Action center" | Action Center — line 29 |
| H2 | (no H2; section uses `aria-label="Key metrics"` but no visible heading) | KPI Strip — lines 103–120 |
| H2 | "Hiring pipeline" | Pipeline — line 124 |
| H2 | "Applicants needing review" | Review — line 159 |
| H2 | "Getting started" | Onboarding Checklist — line 184 |
| H2 | "Jobs with applicants waiting" | Job Performance — line 215 |
| H2 | "Employer branding health" (via `emp-dash-section-title` on H2, `style="margin:0"`) | Branding Health — line 233 |
| H2 | "Subscription" (via `emp-dash-section-title` on H2, `style="margin:0"`) | Subscription — line 274 |
| H2 | "Activity" | Analytics — line 337 |

**H1:** Present. Uses the company name dynamically. Acceptable — the "Hiring command center" eyebrow paragraph above is a `<p>`, not a heading, which is correct.

**No heading levels are skipped.** H1 → H2 is the correct progression. No H3 is used within the dashboard sections themselves (sub-components `app-dashboard-banner` etc. may use headings internally — out of scope here).

**Gap: KPI Strip has no visible heading.** The `<section>` uses `aria-label="Key metrics"` which provides an accessible name for the landmark, but there is no `<h2>` visible or SR-only. This is acceptable for a KPI strip that is visually obvious, but screen-reader users navigating by headings will not find a "Key metrics" heading in the heading outline. Low severity for an auth page.

**Recommendation (P3):** Add an SR-only H2 to the KPI strip for completeness:
```html
<h2 class="emp-dash-visually-hidden">Key metrics</h2>
```

**Heading hierarchy assessment: VALID** (H1 present, no skipped levels, minor KPI gap noted)

---

## §3 Semantic HTML

| Element / Pattern | Usage | Assessment |
|---|---|---|
| `<section>` with `aria-label` | All 10 major sections use `<section>` with descriptive `aria-label` | Excellent — correct landmark usage |
| `<h1>` for company name in hero | Present | Correct |
| `<h2>` for all section titles | Present (see heading table above) | Correct |
| `<button type="button">` for all interactive elements | All KPI cards, action cards, pipeline bars, review CTAs, onboarding CTAs, job review CTAs | Correct — not `<div onClick>` |
| `<ol role="list">` for onboarding steps with `<li role="listitem">` | Present (line 186) | Technically redundant (`ol` already has list role) but harmless |
| `role="list"` on pipeline rail `<div>` with `role="listitem"` on stages | Present (lines 141–143) | Correct workaround for Safari's CSS `list-style: none` bug |
| `role="progressbar"` with `aria-valuenow/min/max/label` | Present on branding bar (line 243) and all subscription meters (lines 290–293, 305–308, 319–322) | Correct and complete |
| `role="alert"` on error states | Present on pipeline error (line 35) and hiring pipeline error (line 128) | Correct |
| `aria-hidden="true"` on decorative images and icons | Present on hero mesh, all action icons, pipeline stage icons, initials avatar, onboarding check SVG | Correct |
| `aria-label` on pipeline stage buttons | `stage.label + ': ' + stage.count + ' applicants'` (line 144) | Correct — provides full context without redundancy |
| `aria-label` on branding progress bar | Full descriptive string including percentage (line 245) | Correct |
| `aria-label` on subscription meters | Full string per meter (lines 293, 308, 322) | Correct |
| Visually-hidden pipeline screen reader summary | `<p class="emp-dash-visually-hidden">` listing all stages (lines 150–153) | Excellent — provides an alternative text summary for the bar chart |
| Semantic `<img alt="">` on decorative svgs in action cards | `alt=""` used (lines 47, 60, 70) — correct empty alt for decorative images | Correct |

**Semantic HTML assessment: EXCELLENT**. The dashboard has unusually thorough ARIA instrumentation for an auth-gated employer panel.

---

## §4 Accessibility-SEO Overlap

The `<section aria-label="...">` elements create ARIA landmark regions that assistive technologies navigate. This is SEO-adjacent in that:
- Correct heading structure improves both SEO (heading signals) and AT navigation.
- Well-formed semantic HTML is a prerequisite for future SSR (Angular Universal) output quality.

**`robots` meta tag:** The dashboard does not explicitly set a `noindex` directive. Without a `setPageMeta` call, the last public page's `robots` meta remains in effect when SPAs hydrate from public → auth routes. This is acceptable for a hash-based SPA (`HashLocationStrategy` is used — confirmed in `app.routing.module.ts` line 7), because `#recruiter/dashboard` is never crawled by Googlebot (fragment identifiers are not indexed). However, setting `noindex, nofollow` in the component is still best practice to prevent accidental indexing if the app switches to path-based routing.

---

## §5 Indirect Public SEO Implications

The dashboard's completeness and branding widgets directly influence the company's public-facing profile at `/companies/details?id=X` and indirectly affect how company-linked jobs appear in search:

| Dashboard Widget | Public SEO Implication |
|---|---|
| Branding Health: **company logo** missing | Public company card on job listings and company detail page shows no logo. Companies with logos consistently get higher click-through on job boards. |
| Branding Health: **company description** missing | No description on the public company page. Google may generate a poor meta description for the page. Candidates see no context. |
| Branding Health: **location (city)** missing | Jobs posted by this company may not appear in city/location-filtered job searches on the public job search page. `JobPosting` JSON-LD `addressLocality` is derived from `job.jobCity` — but company city is used as a fallback when job city is blank. |
| Branding Health: **industry** missing | Industry is used in job listing category/filter facets. Missing industry reduces discoverability within category searches. |
| Subscription: **active job posts** | A company with 0 active jobs has no pages indexed in Google for Jobs. The dashboard nudges recruiters to post jobs, indirectly driving SEO-indexable content. |
| Onboarding checklist: **complete profile CTA** | Encourages recruiters to fill in all fields that feed into public pages and `JobPosting`/`Organization` JSON-LD. |

**Key implication:** Every field completion driven by the dashboard's branding score and onboarding checklist translates directly into richer, more discoverable public content. The dashboard is the primary lever for improving the platform's overall search-engine footprint.

---

## Recommendations

| # | Severity | Recommendation |
|---|---|---|
| R1 | P1 | **Set page title and `noindex` meta in dashboard component.** Inject `SeoService` into `CompanyDashboardComponent` and call `seoService.setPageMeta({ title: 'Dashboard — GetHired Online', description: '', robots: 'noindex, nofollow' })` in `ngOnInit()`. Prevents stale title; aligns with SeoService usage on all other routes. |
| R2 | P3 | **Add SR-only H2 for KPI strip.** Add `<h2 class="emp-dash-visually-hidden">Key metrics</h2>` inside the KPI section so assistive-technology heading navigation includes this section. |
| R3 | P3 | **Surface branding impact on public SEO.** Update the branding health section's subtitle copy from "A complete profile attracts more candidates and builds trust." to explicitly mention search: "A complete profile helps candidates find you and improves your presence in job search results." This makes the SEO implication actionable for recruiters. |

---

## Summary

| Check | Result |
|---|---|
| H1 present | YES |
| Heading hierarchy valid (no skipped levels) | YES |
| Semantic `<section>` with `aria-label` | YES — all 10 sections |
| ARIA on interactive widgets (progressbars, alerts, buttons) | YES — thorough |
| Page title set for dashboard route | NO — not set; inherits last route's title |
| `robots: noindex` set for dashboard | NO — not set (safe for hash routing, but not best practice) |
| Indirect public SEO levers documented | YES — 5 branding/completeness fields drive public discoverability |
