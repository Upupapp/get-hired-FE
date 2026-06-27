# GetHired OPTIMIZE Report — SEO V3 Recent Deployment Audit

**Mode:** Recent deployment (SEO V3 — FE bf5bd08, BE 26ca25a)
**Date:** 2026-06-25
**Scope:** SeoService, sitemap.xml, skeleton CSS, bundle, Core Web Vitals, JSON-LD timing, memory leaks

---

## 1. SeoService Performance (seo.service.ts)

### Verdict: GOOD with minor observation

**JSON-LD injection efficiency:**
- `setJsonLd(id, data)` uses `document.getElementById(id)` then replaces in-place if found, or creates and appends if not. This is the correct pattern — no accumulation risk, no new elements per call, O(1) DOM lookup.
- `clearJsonLd(id)` calls `el.remove()` — correct, no orphan nodes.
- IDs used: `gh-jsonld-jobposting`, `gh-jsonld-org`, `gh-jsonld-website`, `gh-jsonld-breadcrumb`. All four are unique and never collide.

**SSR guard:** All DOM operations are behind `if (!this.isBrowser) return`. Safe for Angular Universal.

**`stripHtml` on server:** Falls back to a regex strip (no DOMParser) — correct. The regex `/<[^>]*>/g` is safe for JSON-LD text output; it does not re-render HTML.

**Observation:** `setCanonical()` creates a `<link rel="canonical">` element via direct `document` access. On SSR this is guarded, but the canonical tag is not injected server-side at all. For CSR-only deployments (current state, no SSR active) this is fine.

---

## 2. sitemap.xml Performance (server.js)

### Verdict: FIXED — in-memory cache added

**Before fix:** Every request hit the DB and rebuilt the XML string. A Googlebot crawl spike could cause dozens of concurrent queries.

**After fix:** Process-level `_sitemapCache` with 1-hour TTL. DB is queried at most once per hour per process lifetime. Cache is bypassed on first request, then served instantly for all subsequent requests within the TTL window.

**Query efficiency:** `SELECT job_id, updated_at FROM schema.jobs WHERE job_status_id = 2 ORDER BY updated_at DESC` — selects only two columns. Efficient. `job_status_id` should have an index (standard column); no LIMIT needed as sitemaps support up to 50,000 URLs.

**Bug fixed (variable name):** The original code used `now` (set to `new Date().toISOString().split("T")[0]`) for both the cache check and as a fallback date inside the body. After refactor, `now = Date.now()` (numeric) is used for cache timing and `today` (string) is used as the date fallback. The old code passed a numeric timestamp into `<lastmod>` on rows with null `updated_at` — silently wrong. Now passes the correct ISO date string.

---

## 3. Skeleton CSS (styles.scss)

### Verdict: GOOD

**`@keyframes gh-skeleton-shimmer`:** Animates `background-position` only — does not trigger layout or composite-layer changes. GPU-friendly.

**`prefers-reduced-motion: reduce` guard:** Correctly structured as `@media (prefers-reduced-motion: reduce)` inside each affected selector. On reduced-motion: shimmer animation is set to `none` and a static grey background is used. Hover lift drops `transform: translateY` and keeps only a `background-color` transition.

**`@extend .gh-skeleton`:** Used inside `.gh-skeleton-card` for title/subtitle/line/tag. This is valid SCSS usage; Sass compiles `@extend` into a single grouped selector rather than duplicating rules, so output CSS is efficient.

**CSS weight:** ~66 lines of SCSS. Compiled output will be roughly 1–1.5 KB (unminified) — negligible.

**CLS risk from hover lift:** `transform: translateY(-2px)` does NOT trigger layout reflow. It is a compositor-only operation. No CLS contribution.

---

## 4. Angular Bundle Impact

### Verdict: NO CONCERN

`SeoService` is decorated with `@Injectable({ providedIn: 'root' })`. In Angular 13+, `providedIn: 'root'` services are tree-shaken from the bundle if no component injects them. Since 10 components now inject `SeoService`, it is included — but it is a single small service (~7 KB unminified TypeScript, compiles to ~2–3 KB after minification). The services it depends on (`Title`, `Meta`, `Router`) are already part of every Angular app's bundle. Net new bundle cost: ~2–3 KB.

---

## 5. Core Web Vitals

### LCP
New OG/Twitter `<meta>` tags in `index.html` are static strings parsed in the same pass as the rest of the `<head>`. No LCP impact. The default OG image (`gethired-og-default.png`) is referenced in a `<meta>` tag only — not as a visible `<img>`, so it does not participate in LCP measurement.

### CLS
- Skeleton placeholders (`.gh-skeleton-card`, `.gh-skeleton`, etc.) reserve space via fixed `height` values (20px, 14px, 24px). If the real content that replaces them has different dimensions, a layout shift occurs. **This is existing behavior**, not introduced by the CSS classes themselves — the classes just enable consistent sizing.
- Hover lift uses `transform: translateY(-2px)` — compositor only, zero CLS contribution.

### FID/INP
No synchronous DOM operations on the main thread at route change. `setJsonLd` and `clearJsonLd` are DOM mutations but they operate on `<head>` elements, not painted content, so browser paint cost is negligible.

---

## 6. JSON-LD Script Injection Timing

### Verdict: ACCEPTABLE for CSR app

`setJobPostingJsonLd` is called from `ngOnInit` after the Observable emits (filtered with `filter(job => !!job && !!job.jobTitle) + take(1)`). This means structured data is injected after the API response arrives, not at initial page render.

**For Googlebot (CSR):** Google renders JavaScript and can see dynamically injected JSON-LD. This pattern is acceptable and widely used.

**For SSR (if enabled in future):** `setJsonLd` returns early when `!isBrowser` — the JSON-LD would not be injected server-side. If SSR is enabled later, structured data helpers should be wired through Angular's `TransferState` / Universal renderer instead of direct DOM access. This is a future concern, not a current bug.

**No flash of unstyled structured data:** JSON-LD `<script>` tags in `<head>` are not visible to users. "Flash" is not applicable here — this concern applies to visual content only.

---

## 7. Memory Leaks

### Verdict: 2 BUGS FOUND AND FIXED

| Component | Issue | Status |
|---|---|---|
| `public-details.component.ts` | `seoSub.unsubscribe()` called in `ngOnDestroy`. `clearJobPostingJsonLd()` and `clearBreadcrumbJsonLd()` also called. | CORRECT — no leak |
| `public-list.component.ts` | Sets breadcrumb JSON-LD in `ngOnInit` but had NO `ngOnDestroy` — breadcrumb persisted on next route | FIXED |
| `public-company-details.component.ts` | `take(1)` on SEO sub (auto-completes — no subscription leak). But `ngOnDestroy` did NOT call `clearBreadcrumbJsonLd()` — company breadcrumb leaked to next route | FIXED |
| `public-search.component.ts` | No JSON-LD set, no breadcrumb set — nothing to clean up | OK |
| `main-portal.component.ts` | Sets org + website JSON-LD, no cleanup in ngOnDestroy. Org/website JSON-LD is appropriate to keep globally (homepage schema) | ACCEPTABLE |
| `employer-portal.component.ts` | No JSON-LD set | OK |
| `job-seeker-portal.component.ts` | No JSON-LD set | OK |
| `signin.component.ts` | No JSON-LD set | OK |
| `error-not-found.component.ts` | No JSON-LD set | OK |

### Duplicate title-setter pattern — FIXED (3 components)
`main-portal`, `employer-portal`, and `job-seeker-portal` each called `titleService.setTitle()` in their constructor AND `seoService.setPageMeta()` (which also calls `titleService.setTitle()`) in `ngOnInit`. The constructor call set the title to a slightly different string that was immediately overridden. Redundant `Title` injection and constructor call removed from all three.

---

## 8. robots.txt

### Verdict: GOOD

Correctly disallows all authenticated and private routes. Sitemap declaration points to `https://gethiredonline.app/sitemap.xml`. The file is included in `angular.json` assets array for both build and test configurations (build only — test config does not include it, which is fine).

---

## Summary of Issues Found

| # | Severity | Component | Finding |
|---|---|---|---|
| 1 | Medium | `public-list.component.ts` | No ngOnDestroy — breadcrumb JSON-LD leaked on navigation | FIXED |
| 2 | Medium | `public-company-details.component.ts` | ngOnDestroy missing clearBreadcrumbJsonLd | FIXED |
| 3 | Low | `main-portal`, `employer-portal`, `job-seeker-portal` | Duplicate titleService.setTitle in constructor overridden immediately by setPageMeta | FIXED |
| 4 | Low | `server.js` sitemap | No server-side cache — DB query on every request | FIXED |
| 5 | Low | `server.js` sitemap | `now` (numeric) used as date string fallback in `<lastmod>` on null updated_at | FIXED |
| 6 | Info | `setCanonical()` | Canonical tag not injected server-side (SSR guard returns early) | NOTED (future SSR work) |
| 7 | Info | Main portal | Organization + WebSite JSON-LD not cleared on navigate-away | ACCEPTABLE (global homepage schema) |
