# GetHired SEO V4 — Backlog

Generated: 2026-06-26

## P1 — High Impact, Quick Win

| ID | Item | File(s) | Effort |
|----|------|---------|--------|
| B-P1-01 | Create branded OG image 1200×630px at `src/assets/brand/gethired-og-default.png` | Design asset + seo.service.ts + index.html | Design: Medium; Code: 10min |

## P2 — Meaningful SEO Improvement

| ID | Item | File(s) | Effort |
|----|------|---------|--------|
| B-P2-01 | FAQPage JSON-LD for /job-seekers and /employers | seo.service.ts (new `setFaqJsonLd` method) + job-seeker-portal.component.ts + employer-portal.component.ts | 2-3hrs |
| B-P2-02 | Add company pages to sitemap.xml | get-hired-BE/server.js | 1hr (needs active-company query) |
| B-P2-03 | Visual breadcrumb navigation component | New shared/breadcrumb component + job detail + company detail templates | 3-4hrs |
| B-P2-04 | Portal CTA buttons as crawlable `<a>` tags | main-portal.component.html + job-seeker-portal.component.html + employer-portal.component.html | 1hr |
| B-P2-05 | Verify /companies breadcrumb "Companies" link resolves to a real page | companies.module.ts routes | 30min |

## P3 — Lower Priority / Infrastructure

| ID | Item | File(s) | Effort |
|----|------|---------|--------|
| B-P3-01 | Soft 404 → 410 Gone for expired/deleted job URLs | get-hired-BE + server.ts (Angular Universal) | Large — requires BE job status API + SSR pre-check |
| B-P3-02 | SSR TransferState for initial public job list | public-list.component.ts + Angular Universal setup | Large — advanced Universal feature |
| B-P3-03 | Google Indexing API for fast job publish/depublish | get-hired-BE/services/indexing.js (new file) | Medium — needs Google Cloud + SA credentials |
| B-P3-04 | Explicit width/height on brand SVG images (CLS prevention) | public portal templates | 1-2hrs (need to know SVG intrinsic dimensions) |
| B-P3-05 | Add `defer` to Bootstrap.js and Popper.js in index.html | src/index.html | 10min (low-risk) |
| B-P3-06 | Clean company page URLs /companies/:id → /companies/details/:id | companies.module.ts + PublicCompanyDetailsComponent | Medium — routing change + redirect |
| B-P3-07 | localStorage/sessionStorage guard in PublicSearchComponent for SSR safety | public-search.component.ts | 30min |
| B-P3-08 | sameAs social links in Organization JSON-LD | seo.service.ts | 10min (needs real social URLs) |

## Resolved From V3 Backlog

| V3 Item | Resolution |
|---------|-----------|
| N3: /signup + auth pages missing component-level noindex | FIXED V4 |
| N5: SSR canonical not set server-side | FIXED V4 (DOCUMENT injection) |
| N7: JSON-LD not in SSR HTML | FIXED V4 (DOCUMENT injection) |

## Still Open From V3 Backlog

| V3 Item | V4 Status |
|---------|-----------|
| N1: OG image doesn't exist | STILL OPEN (design asset) |
| N2: Company pages not in sitemap | STILL OPEN (P2-02) |
| N1/N8: soft 404 | STILL OPEN (P3-01) |
| N4: Remote job Schema.org fields | NOT STARTED (out of scope) |
| N6: Hero navigation not crawlable `<a>` | STILL OPEN (P2-04) |
| N8: "Thousands" count verification | STILL OPEN (monitoring) |
