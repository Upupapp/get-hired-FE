# GETHIRED SEO Full Platform Sweep V4 — Final Report

Generated: 2026-06-26

---

## Executive Summary

This is the second major SEO audit pass (V4) on the GetHired Online platform. V3 (2026-06-25) established the foundational SEO infrastructure from scratch — SeoService, metadata on all public pages, robots.txt, sitemap, JobPosting JSON-LD, structured data.

V4 identified and fixed two architectural gaps that V3 left open:

1. **SSR canonical and JSON-LD were browser-only** — `setCanonical`, `setJsonLd`, and related methods used bare `document` global which doesn't exist in Angular Universal's server context. This meant Googlebot's HTTP fetch returned SSR HTML without canonical tags or structured data. Fixed by injecting Angular's `DOCUMENT` token.

2. **Auth pages missing component-level noindex** — `/signup`, `/reset-password`, `/change-password`, `/verify` were protected by robots.txt but had no `<meta name="robots" content="noindex">` tag at the component level. Fixed with SeoService calls in all four components.

---

## Previous SEO Run Comparison (V3 → V4)

### V3 Issues Resolved in V4

| Issue | V3 Status | V4 Fix |
|-------|-----------|--------|
| SSR canonical not set server-side (N5) | Open backlog | FIXED — DOCUMENT injection in SeoService |
| JSON-LD not in SSR HTML | Not documented in V3, discovered in V4 audit | FIXED — same DOCUMENT injection fix |
| /signup no component noindex (N3) | Open backlog | FIXED — signup.component.ts |
| /reset-password no component noindex (N3) | Open backlog | FIXED — reset-password.component.ts |
| /change-password no component noindex (N3) | Open backlog | FIXED — change-pw.component.ts |
| /verify no component noindex (N3) | Open backlog | FIXED — account-authentication.component.ts |

### Still Open From V3

| V3 Item | V4 Status |
|---------|-----------|
| N1: OG image (`gethired-og-default.png`) doesn't exist | Still open — design asset |
| N2: Company pages not in sitemap | Still open — P2 backlog |
| N1/soft 404 | Still open — P3 backlog |
| N4: Remote job Schema.org fields | Not started |
| N6: Hero CTAs not crawlable `<a>` tags | Still open — P2 backlog |
| N8: "Thousands" count verification | Monitor |

### New Findings in V4

| Finding | Impact | Action |
|---------|--------|--------|
| setCanonical/clearCanonical used bare `document` global — SSR-unsafe | HIGH — canonical was missing from SSR HTML seen by Googlebot | FIXED |
| setJsonLd/clearJsonLd had isBrowser guard — JSON-LD not in SSR HTML | HIGH — structured data not in Googlebot's first HTTP response | FIXED |
| stripHtml used bare `document.createElement` — SSR-unsafe | LOW (only called for JSON-LD, server had regex fallback) | FIXED as a defensive improvement |
| FAQPage JSON-LD opportunity on /job-seekers and /employers | NEW finding — not in V3 | P2 backlog |
| localStorage in PublicSearchComponent field initializers — SSR-unsafe | LOW (noindex page, crawlers blocked) | P3 backlog |

---

## Code Files Changed in V4

| File | Change | SEO Impact |
|------|--------|-----------|
| `src/app/core/services/seo.service.ts` | DOCUMENT injection; SSR-safe canonical, JSON-LD, stripHtml | HIGH — enables SSR structured data + canonical |
| `src/app/auth/signup/signup.component.ts` | SeoService + noindex setPageMeta | MEDIUM — defense-in-depth noindex |
| `src/app/auth/reset-password/reset-password.component.ts` | SeoService + noindex setPageMeta | MEDIUM — defense-in-depth noindex |
| `src/app/auth/change-pw/change-pw.component.ts` | SeoService + noindex setPageMeta | MEDIUM — defense-in-depth noindex |
| `src/app/auth/account-authentication/account-authentication.component.ts` | SeoService + noindex setPageMeta | MEDIUM — defense-in-depth noindex |

**Total files changed in V4: 5**
**No BE changes in V4 (sitemap implemented in V3 remains correct)**

---

## Routes Classified

- **Total routes classified:** 17
- **Indexable:** 7 (/home, /jobs, /jobs/details/:id active, /job-seekers, /employers, /companies/details, /jobs/details/:id inactive counts as noindex)
- **Strictly indexable (index,follow):** 6
- **Noindex:** 11 (auth pages ×5, 404, search results ×1, /admin/*, /recruiter/*, /user/*)

---

## SEO Infrastructure Status (post-V4)

| Component | Status |
|-----------|--------|
| SeoService | COMPLETE — SSR-safe |
| Public page metadata (all 7 pages) | COMPLETE |
| Private noindex (all auth pages) | COMPLETE (V4 fixed 4 remaining gaps) |
| robots.txt | COMPLETE |
| Sitemap endpoint (BE) | COMPLETE |
| JobPosting JSON-LD | COMPLETE — now in SSR HTML |
| Organization JSON-LD | COMPLETE — now in SSR HTML |
| WebSite + SearchAction JSON-LD | COMPLETE — now in SSR HTML |
| BreadcrumbList JSON-LD | COMPLETE — now in SSR HTML |
| Canonical tags | COMPLETE — now in SSR HTML |
| Google Search Console verification tag | COMPLETE (human must complete GSC claim) |
| OG image (branded) | MISSING — P1 backlog (logo fallback active) |

---

## Release Gate

**VERDICT: GO WITH CAUTION**

Deploy is safe. Run 4 human verification steps after deploy:
1. `curl -I https://gethiredonline.app/sitemap.xml` → confirm application/xml
2. `curl -sA Googlebot https://gethiredonline.app/home | grep canonical` → confirm canonical in SSR HTML
3. `curl -sA Googlebot https://gethiredonline.app/signup | grep robots` → confirm noindex,nofollow
4. Complete Google Search Console property claim + sitemap submission

---

## Top 3 Remaining SEO Gaps

1. **OG image does not exist** (`src/assets/brand/gethired-og-default.png`) — social shares show a small logo instead of a branded 1200×630 card. Immediate action needed from design team.

2. **Company pages not in sitemap** — company profile pages are indexable but Googlebot can only discover them via link following (BreadcrumbList), not sitemap crawl. Add company IDs to the sitemap BE endpoint.

3. **Hero navigation not in crawlable `<a>` tags** — GoToJobs, GoToJobSeekers, GoToEmployers on /home are Angular router clicks, not `<a href>` links. Googlebot can find /job-seekers and /employers via sitemap but not via link following from /home. Convert major CTAs to `<a [href]>` elements.

---

## Output Files Written

27 V4 output files created in `C:\Users\paulg\OneDrive\Desktop\Gethired\get-hired-FE\`:

1. GETHIRED_SEO_ROUTE_SURFACE_AUDIT_V4.md
2. GETHIRED_SEO_ARCHITECTURE_POLICY_CONTRACT_V4.md
3. GETHIRED_SEO_SERVICE_IMPLEMENTATION_LOG_V4.md
4. GETHIRED_SEO_PUBLIC_PAGE_METADATA_LOG_V4.md
5. GETHIRED_SEO_PRIVATE_NOINDEX_LOG_V4.md
6. GETHIRED_SEO_JOB_DETAIL_JOBPOSTING_LOG_V4.md
7. GETHIRED_SEO_EXPIRED_JOB_INDEXING_LIFECYCLE_LOG_V4.md
8. GETHIRED_SEO_GOOGLE_INDEXING_API_PLAN_V4.md
9. GETHIRED_SEO_JOB_LIST_SEARCH_LOG_V4.md
10. GETHIRED_SEO_COMPANY_PAGE_LOG_V4.md
11. GETHIRED_SEO_STRUCTURED_DATA_LOG_V4.md
12. GETHIRED_SEO_SITEMAP_LOG_V4.md
13. GETHIRED_SEO_ROBOTS_LOG_V4.md
14. GETHIRED_SEO_CANONICAL_URL_LOG_V4.md
15. GETHIRED_SEO_IMAGE_ASSET_LOG_V4.md
16. GETHIRED_SEO_CORE_WEB_VITALS_LOG_V4.md
17. GETHIRED_SEO_SOCIAL_PREVIEW_LOG_V4.md
18. GETHIRED_SEO_INTERNAL_LINKING_BREADCRUMB_LOG_V4.md
19. GETHIRED_SEO_404_REDIRECT_EXPIRED_CONTENT_LOG_V4.md
20. GETHIRED_SEO_I18N_HREFLANG_LOG_V4.md
21. GETHIRED_SEO_SEARCH_CONSOLE_MONITORING_PLAN_V4.md
22. GETHIRED_SEO_FRONTEND_HAPTICS_EFFECTS_LOG_V4.md
23. GETHIRED_SEO_COPY_CLAIMS_CONTENT_QA_V4.md
24. GETHIRED_SEO_VALIDATION_TEST_LOG_V4.md
25. GETHIRED_SEO_RELEASE_GATE_V4.md
26. GETHIRED_SEO_BACKLOG_V4.md
27. GETHIRED_SEO_FINAL_REPORT_V4.md (this file)
