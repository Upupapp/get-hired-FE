# GETHIRED SEO Image Asset Log V3

Generated: 2026-06-25

## Audit Scope
Public pages: /home (main-portal), /jobs (public-list), /jobs/details/:id (public-details), /job-seekers, /employers.

## main-portal.component.html Findings

### USP Pillar Images
```html
<img src="/assets/brand/gethired-wow/candidate-profile-card.svg" ...>
<img src="/assets/brand/gethired-wow/video-answer-orb.svg" ...>
<img src="/assets/brand/gethired-wow/match-signal-rings.svg" ...>
<img src="/assets/brand/gethired-wow/hiring-pipeline-lines.svg" ...>
```
**Finding:** These are decorative SVGs with `aria-hidden="true"` — appropriate. No action needed.

### Hero Background Image
The portal-gradient-mesh.svg has `alt=""` and `aria-hidden="true"` — correct for a decorative background.

### portal-hero-visual div
Empty div used for CSS background illustration. No img tag — no alt needed.

## public-details.component.html Findings

### Job Banner
```html
<div class="row px-5 text-white py-5 bg-banner col-12">
```
The banner is a CSS background image, not an `<img>` tag — no alt text needed.

### Company Logo (in job-details-sidecard)
Not audited (nested component). Add to backlog.

## public-list.component.html Findings
No `<img>` tags in the template itself — job cards are rendered by child components (app-job-posts-list → job card child). Not audited at this depth.

## OG Image
`og:image` set to `https://gethiredonline.app/assets/brand/gethired-og-default.png` in SeoService.
**Action needed:** Create this file. Recommended dimensions: 1200×630px. This is not a blocker for indexing but improves social share previews.

## Lazy Loading
Angular 13 does not automatically add `loading="lazy"` to images — this must be added manually.
No `loading="lazy"` observed in public page image templates. For non-critical-path images (below the fold), this should be added.

## Backlog

| Item | Priority | File |
|------|---------|------|
| Create `/assets/brand/gethired-og-default.png` (1200×630) | P1 | assets/brand/ |
| Verify `/assets/images/logo.png` exists for Organization JSON-LD | P1 | assets/images/ |
| Add `loading="lazy"` to job card images (company logos) | P2 | job card component |
| Audit job-details-sidecard for company logo alt text | P2 | job-view component |
| Add explicit `width` and `height` attributes to prevent CLS | P2 | public page images |
