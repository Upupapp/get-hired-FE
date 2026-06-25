# GetHired SEO V4 — Release Gate

Generated: 2026-06-26

## Verdict: GO WITH CAUTION

All SEO-critical code changes are safe to deploy. One human verification step remains (sitemap routing on production).

---

## Go / No-Go Checklist

| # | Check | Status | Notes |
|---|-------|--------|-------|
| G1 | SeoService is SSR-safe (DOCUMENT injection) | PASS | V4 fix applied |
| G2 | Public page titles correct | PASS | All 7 public pages verified |
| G3 | Public page descriptions correct | PASS | All 7 public pages verified |
| G4 | Canonical tags set on indexable pages | PASS | V4 SSR fix means canonical now in SSR HTML |
| G5 | noindex on signin | PASS | V3 |
| G6 | noindex on signup | PASS | V4 fix |
| G7 | noindex on reset-password | PASS | V4 fix |
| G8 | noindex on change-password | PASS | V4 fix |
| G9 | noindex on verify | PASS | V4 fix |
| G10 | noindex on 404 | PASS | V3 |
| G11 | noindex on /jobs/search/* | PASS | V3 |
| G12 | Private routes in robots.txt Disallow | PASS | V3 |
| G13 | robots.txt in angular.json assets | PASS | V3 |
| G14 | Sitemap endpoint exists on BE | PASS | V3 |
| G15 | Sitemap only includes active jobs | PASS | V3 |
| G16 | Sitemap in robots.txt | PASS | V3 |
| G17 | JobPosting JSON-LD on active jobs only | PASS | V3 + V4 SSR fix |
| G18 | JobPosting JSON-LD cleared on navigate | PASS | V3 |
| G19 | Organization JSON-LD on homepage | PASS | V3 + V4 SSR fix |
| G20 | WebSite + SearchAction on homepage | PASS | V3 + V4 SSR fix |
| G21 | BreadcrumbList on jobs/detail/company | PASS | V3 + V4 SSR fix |
| G22 | No fake structured data | PASS | All values from real API data |
| G23 | No auth guards weakened | PASS | Zero guard changes in V3 or V4 |
| G24 | No MATCH/payment logic changed | PASS | Zero changes in V3 or V4 |
| G25 | Google Search Console tag in index.html | PASS | Already present |
| G26 | Recovery links on 404 page | PASS | V3 |
| G27 | Copy claims verified honest | PASS | V4 QA pass |

---

## Remaining Human Verification Required

### VERIFY-1: Production sitemap.xml routing
```bash
curl -I https://gethiredonline.app/sitemap.xml
```
Expected: `Content-Type: application/xml; charset=utf-8`
If `text/html`: add Nginx proxy rule (see GETHIRED_SEO_SITEMAP_LOG_V4.md)

### VERIFY-2: SSR canonical now in HTML
```bash
curl -sA Googlebot https://gethiredonline.app/home | grep canonical
```
Expected post-V4: `<link rel="canonical" href="https://gethiredonline.app/home">`

### VERIFY-3: Google Search Console property claim
A human must complete the GSC property verification and sitemap submission. The HTML tag is in place.

---

## V4 Code Changes Summary

| File | Change | Risk |
|------|--------|------|
| `src/app/core/services/seo.service.ts` | DOCUMENT injection; setCanonical/clearCanonical/setJsonLd/clearJsonLd/stripHtml now SSR-safe | LOW |
| `src/app/auth/signup/signup.component.ts` | Added SeoService injection + noindex setPageMeta | NONE |
| `src/app/auth/reset-password/reset-password.component.ts` | Added SeoService injection + noindex setPageMeta | NONE |
| `src/app/auth/change-pw/change-pw.component.ts` | Added SeoService injection + noindex setPageMeta | NONE |
| `src/app/auth/account-authentication/account-authentication.component.ts` | Added SeoService injection + noindex setPageMeta | NONE |

Total files changed: 5

---

## Blocking Items Before Claiming Full SEO Completion

| # | Item | Owner |
|---|------|-------|
| B1 | Create branded OG image (1200×630px) at `src/assets/brand/gethired-og-default.png` | Design |
| B2 | Verify `/assets/images/logo.png` is accessible in production build | Engineer |
| B3 | Verify sitemap.xml returns application/xml content-type on production | Engineer |
| B4 | Complete Google Search Console property claim | Product/Engineer |

None of B1-B4 block deploy — they block claiming "SEO fully complete."

---

## Non-Blocking Backlog

| Priority | Item |
|----------|------|
| P2 | FAQPage JSON-LD for /job-seekers and /employers FAQ sections |
| P2 | Company pages in sitemap |
| P2 | Visual breadcrumb navigation component |
| P2 | Portal CTA buttons as crawlable `<a>` tags |
| P3 | Soft 404 → 410 Gone for expired job URLs |
| P3 | SSR TransferState for initial job list data |
| P3 | Google Indexing API for fast publish/depublish |
| P3 | Explicit width/height on brand SVG images (CLS) |
| P3 | defer on Bootstrap/Popper.js scripts |
| P3 | Clean URLs for company pages (/companies/:id) |
