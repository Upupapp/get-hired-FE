# GETHIRED_SEO_METADATA_SSR_IMPLEMENTATION_LOG_V2
Command: GETHIRED_REUSABLE_SEO_SEARCH_INDEXING_PUBLIC_DISCOVERY_COMMAND_V2
Date: 2026-06-27

---

## Status: COMPLETE — No implementation required

All metadata and SSR features were verified present and correct during the audit. No new code was written for metadata or SSR.

---

## What Is Live

### Angular Universal SSR
- **server.ts** — exports `app()` function with `@nguniversal/express-engine`
- **app.server.module.ts** — `AppServerModule` with `ServerModule`
- **angular.json** — "server" build target, "serve-ssr" for dev/prod, "prerender" builder configured
- **Static file serving** — 1-year cache headers on `/browser/**` assets
- **REQUEST/RESPONSE tokens** — injected into all SSR-rendered components, enabling:
  - HTTP 404 for invalid job URLs (sets `response.status(404)` before render)
  - Pre-render access to request info for conditional logic

### SeoService (`src/app/core/services/seo.service.ts`)
Central metadata manager. Injected by all public-facing route components.

**Methods implemented:**
| Method | What it sets |
|---|---|
| `setPageMeta(config)` | title, description, robots, canonical, og:*, twitter:* |
| `setCanonical(url)` | `<link rel="canonical">` (DOM-safe for SSR) |
| `removeCanonical()` | Removes canonical on noindex pages |
| `setJobPostingJsonLd(job)` | JobPosting JSON-LD script tag |
| `setOrganizationJsonLd()` | Organization JSON-LD script tag |
| `setWebSiteJsonLd()` | WebSite JSON-LD with SearchAction |
| `setBreadcrumbJsonLd(items)` | BreadcrumbList JSON-LD |

### Per-Component Metadata Calls

| Component | Title | Description | Canonical | Robots | JSON-LD |
|---|---|---|---|---|---|
| `public-list.component.ts` (job board) | ✅ | ✅ | ✅ | index,follow | BreadcrumbList |
| `public-details.component.ts` (job) | ✅ dynamic | ✅ dynamic | ✅ | index/noindex | JobPosting + Breadcrumb |
| `public-search.component.ts` | ✅ | ✅ | ✅ (→/jobs) | noindex | None |
| `public-company-details.component.ts` | ✅ dynamic | ✅ dynamic | ✅ | index,follow | BreadcrumbList |
| `main-portal.component.ts` (home) | ✅ | ✅ | ✅ | index,follow | Org + WebSite + Breadcrumb |
| `job-seeker-portal.component.ts` | ✅ | ✅ | ✅ | index,follow | BreadcrumbList |
| `employer-portal.component.ts` | ✅ | ✅ | ✅ | index,follow | BreadcrumbList |

### index.html Static Defaults
- `<title>` — "GetHired Online — Jobs and Hiring Platform in the Philippines"
- `<meta name="description">` — default description for slow/no-JS clients
- `<meta name="robots" content="index, follow">`
- All OG and Twitter tags with default values
- `<html lang="en">`
- Google Site Verification meta tag
- GA4 script (G-4C797NXLJF, `send_page_view: false`)

---

## Why No Changes Were Needed

The SeoService was correctly built with SSR in mind (DOCUMENT injection, no `window` calls, canonical via DOM). All 7 public-route components call `setPageMeta()` on `ngOnInit`. The 404 response via RESPONSE token was already in place. No gaps were found in metadata coverage.

---

## Backlog Items

1. **Dynamic OG images** — SeoService supports `ogImage` param; no per-job/per-company images generated yet. See `GETHIRED_SEO_SOCIAL_PREVIEW_OG_LOG_V2.md`.
2. **Hreflang** — Language switcher exists but no `<link rel="alternate" hreflang="">` tags. Add when localized URL paths are confirmed.
3. **410 Gone for removed jobs** — Currently returns noindex or 404. 410 is semantically correct for permanently-removed content and signals Google faster.
