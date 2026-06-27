# GETHIRED SEO Social Preview / Open Graph Log V3

Generated: 2026-06-25

## Implementation
OG tags are set as part of `SeoService.setPageMeta()` — there is no separate OG-only call in component code. Every `setPageMeta()` call sets the full OG + Twitter tag set.

## Tags Set Per Route

### Common (all public pages)
```html
<meta property="og:type" content="website">           <!-- or "article" on job detail -->
<meta property="og:site_name" content="GetHired Online">
<meta property="og:title" content="{page title}">
<meta property="og:description" content="{page description}">
<meta property="og:url" content="{canonical URL}">
<meta property="og:image" content="https://gethiredonline.app/assets/brand/gethired-og-default.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{page title}">
<meta name="twitter:description" content="{page description}">
<meta name="twitter:image" content="https://gethiredonline.app/assets/brand/gethired-og-default.png">
```

### Job Detail (/jobs/details/:id)
`og:type` = `"article"` (more specific than website for job postings).
Title and description are job-specific.

## OG Image
**Current:** Default brand image `https://gethiredonline.app/assets/brand/gethired-og-default.png`.
**Required action:** Create this image file (1200×630px, PNG or JPG). Does not yet exist in assets.

**Deferred improvement:** Job detail pages could use the job banner image (`job.jobBanner`) as the OG image if available. This would require checking if the URL is a full absolute URL (Firebase Storage URL) and falling back to the default brand image if not.

## index.html Default Tags (Updated)
The `index.html` fallback OG tags have been updated to match the GetHired Online brand:
```html
<meta property="og:title" content="GetHired Online — Jobs and Hiring Platform in the Philippines">
<meta property="og:description" content="Find jobs, build your profile, post jobs, and manage hiring with GetHired Online — the modern hiring platform for the Philippines.">
<meta property="og:site_name" content="GetHired Online">
```
The old placeholder description ("allow's you to hire experts or be hired") has been removed.

## What Was NOT Implemented
- Per-job OG image (job banner URL) — deferred; requires checking URL completeness
- Twitter site handle (`twitter:site @gethiredonline`) — not implemented, no verified Twitter account confirmed
- Facebook App ID — not implemented, no FB app integration confirmed
