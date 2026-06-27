# GETHIRED_SEO_SOCIAL_PREVIEW_OG_LOG_V2
Command: GETHIRED_REUSABLE_SEO_SEARCH_INDEXING_PUBLIC_DISCOVERY_COMMAND_V2
Date: 2026-06-27

---

## Current Social Preview State

### Default OG Image
- **Path:** `/assets/brand/gethired-og-default.jpg`
- **Live URL:** `https://gethiredonline.app/assets/brand/gethired-og-default.jpg`
- **Dimensions:** 1200×630 px (correct for all major platforms)
- **Format:** JPEG
- **Size:** ~95 KB (under 300 KB limit for most platforms)
- **Status:** ✅ Present and correct

### Per-Page Social Previews

| Route | og:title | og:description | og:image |
|---|---|---|---|
| `/home` | Static site title | Static site description | Default OG image |
| `/jobs` | Job board title | Job board description | Default OG image |
| `/jobs/details/:id` | "{jobTitle} at {companyName} — GetHired Online" | Dynamic from job | **Default OG image** ← no per-job image |
| `/companies/details` | "{companyName} — Careers and Jobs — GetHired Online" | Dynamic from company | **Default OG image** ← no per-company image |
| `/job-seekers` | Marketing title | Marketing description | Default OG image |
| `/employers` | Marketing title | Marketing description | Default OG image |

---

## Gap: No Dynamic OG Images for Job/Company Pages

When a user shares a job link on LinkedIn/Facebook/Twitter/iMessage, the preview will always show the generic GetHired brand image rather than job-specific or company-specific imagery. This reduces click-through on shared job links.

**Impact:** Medium — The og:title and og:description are already dynamic (showing the specific job name and company), so shares are still informative. The missing piece is the visual differentiator.

**Solution Options (Backlog):**

### Option A: Use Company Logo as OG Image (Simple, No Server Work)
- If a company has a logo URL, pass it as `ogImage` to `setPageMeta()` in `public-details.component.ts`
- Caveat: logos are usually square, not 1200×630 — may show with letterboxing on some platforms
- Implementation: 1 line change in `public-details.component.ts` and `public-company-details.component.ts`
- **Recommended first step if social sharing is a near-term priority**

### Option B: Dynamic OG Image Generation (Server-Side, Full Solution)
- Generate branded 1200×630 images server-side using Puppeteer/Sharp/Cloudinary with job title + company name + GetHired logo overlaid
- Return image URL via a `/og-image?jobId=...` endpoint
- Cache generated images to Firebase Storage or a CDN
- Pass URL as `ogImage` to SeoService
- **High value, significant effort** — appropriate for a dedicated sprint

### Option C: Dedicated OG Image per Company (Manual Upload)
- Add "Social share image" upload field to company settings (separate from logo)
- Store URL, use as og:image on company/job detail pages
- Medium effort, relies on employer action

---

## Twitter/X Card Status

All pages use `twitter:card = "summary_large_image"` — correct for job platform content where visual context matters. No changes needed.

---

## Social Platform Debugging URLs

Use these to test link previews after any OG change:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter/X: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/inspect/
- General: https://metatags.io/

---

## Current Implementation (No Changes Made)

SeoService already accepts `ogImage` parameter in `setPageMeta()`. No code change is needed in the service — only in the consuming components. Dynamic OG images are a backlog item, not a blocker for launch.
