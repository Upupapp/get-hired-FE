# GetHired SEO V4 — SeoService Implementation Log

Generated: 2026-06-26

## File Changed
`src/app/core/services/seo.service.ts`

## V4 Changes

### 1. DOCUMENT Token Injection (SSR Canonical Fix)

**Before (V3):**
```ts
import { isPlatformBrowser } from '@angular/common';
// ...
setCanonical(url: string): void {
  if (!this.isBrowser) { return; }  // SSR skipped entirely
  const doc = document;
  // ...
}
```

**After (V4):**
```ts
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
// ...
constructor(
  @Inject(PLATFORM_ID) platformId: Object,
  @Inject(DOCUMENT) private doc: Document,
  // ...
) {}

setCanonical(url: string): void {
  // Uses this.doc — resolves to server DOM stub under Angular Universal
  let link: HTMLLinkElement = this.doc.querySelector('link[rel="canonical"]');
  // ...
}
```

**SEO Impact:** Canonical `<link>` tags and JSON-LD blocks now appear in SSR-rendered HTML. Googlebot receives them on first HTTP fetch without waiting for JS execution.

**Risk level:** LOW — Angular's DOCUMENT token is the canonical way to access the DOM in Universal apps. No breaking change.

### 2. setJsonLd / clearJsonLd — SSR Fix

**Before (V3):** Both methods had `if (!this.isBrowser) return;` — JSON-LD blocks were never emitted by SSR.

**After (V4):** Guards removed; use `this.doc` throughout. JSON-LD now present in SSR HTML.

**SEO Impact:** JobPosting, Organization, WebSite structured data now visible to Googlebot on first crawl.

### 3. clearCanonical — SSR Fix

**Before:** `if (!this.isBrowser) return;` — stale canonicals could persist in SSR.

**After:** Uses `this.doc.querySelector(...)` — works in both environments.

### 4. stripHtml — Partial Fix

Server-side path remains regex-only (safe for JSON-LD text). Browser path now uses `this.doc.createElement('textarea')` instead of bare `document.createElement`.

## Methods Inventory (post-V4)

| Method | Purpose | SSR-safe (V4) |
|--------|---------|----------------|
| setPageMeta() | Title, description, robots, OG, Twitter, canonical | YES |
| setCanonical() | Canonical link element | YES (V4 fix) |
| clearCanonical() | Remove canonical | YES (V4 fix) |
| setRobots() | Robots meta tag | YES (uses Meta service) |
| setOpenGraph() | OG tags only | YES (uses Meta service) |
| setJsonLd() | JSON-LD script block | YES (V4 fix) |
| clearJsonLd() | Remove JSON-LD block | YES (V4 fix) |
| setJobPostingJsonLd() | JobPosting schema | YES (V4 fix) |
| clearJobPostingJsonLd() | Remove JobPosting | YES (V4 fix) |
| setOrganizationJsonLd() | Organization schema | YES (V4 fix) |
| setWebsiteJsonLd() | WebSite + SearchAction | YES (V4 fix) |
| setBreadcrumbJsonLd() | BreadcrumbList | YES (V4 fix) |
| clearBreadcrumbJsonLd() | Remove breadcrumb | YES (V4 fix) |
| resetToDefaults() | Reset all to homepage defaults | YES |

## Verification
- Inspect SSR HTML from `curl -A Googlebot https://gethiredonline.app/jobs/details/1`
- Should now include `<link rel="canonical">` AND `<script type="application/ld+json" id="gh-jsonld-jobposting">` in the raw HTML
- V3: only `<title>` was confirmed in SSR HTML; canonical and JSON-LD were missing
