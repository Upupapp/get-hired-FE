# GetHired Dashboard V5 — SEO Report
**Date:** 2026-06-27 | **Component:** `company-dashboard`

---

## Authentication-Gated Content

The employer dashboard is fully auth-gated. Search engines should not index it. All SEO concerns are limited to preventing accidental indexation.

---

## Meta Tags ✓

**Set in `ngOnInit`:**
```typescript
this.seoService.setPageMeta({
  title: 'Dashboard — GetHired Online',
  description: '',
  robots: 'noindex, nofollow'
});
```

| Meta | Value | Assessment |
|------|-------|------------|
| `<title>` | "Dashboard — GetHired Online" | ✓ Set — descriptive enough for the browser tab |
| `<meta name="robots">` | `noindex, nofollow` | ✓ Set — prevents indexing and link-following |
| `<meta name="description">` | `''` | ✓ Empty intentionally — not indexed anyway |

---

## Structured Data

Not applicable. Auth-gated employer dashboards do not benefit from structured data (JobPosting, Organization, etc.). No `<script type="application/ld+json">` blocks expected or present.

---

## Canonical Link

Not needed. The dashboard URL is auth-gated and `noindex`. A canonical tag would be ignored by crawlers that respect `noindex`.

---

## `<h1>` Availability

The `<h1>` tag (`class="gh-hero-name"`, showing company name) is inside:
1. `*ngIf="!(loading$ | async); else ghDashSkeleton"` — not rendered during loading
2. `*ngIf="dashboard$ | async as dashboard"` — not rendered if dashboard$ hasn't emitted

**Impact:** If a Googlebot somehow got past auth and crawled this page before data loaded, there would be no `<h1>`. This is a theoretical concern only — the combination of auth guard + `noindex` makes it extremely unlikely. **Low risk, no action required.**

---

## Navigation Links

The dashboard contains many internal `[routerLink]`-equivalent navigation triggers (via `router.navigate()` calls). These are click-handler navigations, not `<a href>` links, so they are not crawlable. This is fine for auth-gated content.

---

## Social / OG Tags

Not applicable for auth-gated dashboard. OG tags are for public pages that benefit from social sharing previews.

---

## Summary

| SEO Check | Result |
|-----------|--------|
| `noindex, nofollow` robots meta | ✓ Set |
| Title tag | ✓ Set |
| Structured data | N/A — auth-gated |
| Canonical | N/A — auth-gated |
| `<h1>` availability | Low risk (behind auth + noindex) |
| OG / social tags | N/A — auth-gated |

**No SEO action items required.** The component correctly prevents indexation.
