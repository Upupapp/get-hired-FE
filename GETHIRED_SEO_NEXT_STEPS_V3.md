# GetHired SEO V3 — Next Steps (Post-V3)

Audit date: 2026-06-25

---

## Immediate (Do Before Search Console Submission)

### 1. Verify /sitemap.xml production routing [30 minutes]
```bash
curl -I https://gethiredonline.app/sitemap.xml
```
If Content-Type is text/html instead of application/xml, add Nginx proxy rule for `/sitemap.xml` to the BE.

### 2. Create branded OG image [design task]
File: `src/assets/brand/gethired-og-default.png`
Spec: 1200x630px, PNG or WebP, <300KB
Purpose: Social sharing image shown on Facebook, Twitter/X, LinkedIn, Slack, WhatsApp previews
Update index.html after creation:
```html
<meta property="og:image" content="https://gethiredonline.app/assets/brand/gethired-og-default.png">
<meta name="twitter:image" content="https://gethiredonline.app/assets/brand/gethired-og-default.png">
```
Also update `DEFAULT_OG_IMAGE` in seo.service.ts to confirm the new path.

### 3. Submit sitemap to Google Search Console [15 minutes]
After verification (step 1 above passes):
- Go to Search Console → Sitemaps
- Enter `https://gethiredonline.app/sitemap.xml`
- Submit

### 4. Request indexing for key pages [15 minutes]
In URL Inspection tool, request indexing for:
- `https://gethiredonline.app/home`
- `https://gethiredonline.app/jobs`
- `https://gethiredonline.app/job-seekers`
- `https://gethiredonline.app/employers`

---

## Short-Term (Phase 2 SEO — 1-2 weeks)

### 5. Add company pages to sitemap [BE change, ~1 hour]
Add a query for published companies alongside the existing jobs query:
```sql
SELECT company_id, updated_at FROM ${schema}.companies
WHERE is_active = true ORDER BY updated_at DESC;
```
Add to sitemap with URL pattern `/companies/details?id=${company_id}`, priority 0.6, changefreq weekly.

**Note**: Verify the correct active/published filter column name in the companies table.

### 6. Remote job Schema.org support [FE change, ~2 hours]
In `setJobPostingJsonLd()`, map `workSetupName` to Schema.org fields:
```typescript
const isRemote = (job.workSetupName || '').toLowerCase().includes('remote')
  || (job.workSetupName || '').toLowerCase().includes('work from home');
if (isRemote) {
  ld.jobLocationType = 'TELECOMMUTE';
  ld.applicantLocationRequirements = {
    '@type': 'Country',
    name: 'Philippines',
  };
}
```
This enables the "Work from home" filter in Google for Jobs results.

### 7. Add noindex to remaining auth components [FE change, ~30 minutes]
`signup.component.ts`, `reset-password.component.ts`, `change-pw.component.ts`, `account-authentication.component.ts` — none call `SeoService`. Add:
```typescript
this.seoService.setPageMeta({
  title: 'Sign Up | GetHired Online',
  description: 'Create your GetHired Online account.',
  robots: 'noindex, nofollow',
});
```
These are already blocked by robots.txt, but component-level noindex is defense-in-depth.

### 8. Verify companies breadcrumb middle link [FE investigation, ~1 hour]
The breadcrumb for company detail pages uses `https://gethiredonline.app/companies` as the middle item. Verify this URL returns a valid page (not a 404). If no companies listing page exists, change the breadcrumb to link directly: Home → Company Name.

---

## Medium-Term (Phase 3 SEO — 2-4 weeks)

### 9. Google Indexing API for instant job publish/depublish [BE change, ~4 hours]
Instead of waiting for Google to re-crawl, use the Indexing API to notify Google immediately when a job is published or depublished:
- On job status change to 2 (active): `POST https://indexing.googleapis.com/v3/urlNotifications:publish`
- On job status change from 2 (inactive/expired): `POST .../urlNotifications:publish` with `type: URL_UPDATED` and noindex already set, OR `URL_DELETED` if the job is permanently removed

This requires a Google service account with Indexing API access.

### 10. Organization JSON-LD social links [FE change, ~30 minutes]
Update `setOrganizationJsonLd()` to include social media profile URLs:
```typescript
sameAs: [
  'https://www.facebook.com/gethiredonline',   // if exists
  'https://www.linkedin.com/company/gethired', // if exists
  'https://twitter.com/gethiredonline',        // if exists
],
```
This improves Knowledge Panel eligibility in Google Search.

### 11. Hire Sitelinks eligibility — internal linking audit [~2 hours]
Google Sitelinks appear when a domain has strong internal linking. Audit internal links:
- Verify `<a>` tags (not only Angular router navigations) exist for key pages
- Add visible navigation links to /job-seekers and /employers from the homepage footer
- Add a visible link to the sitemap from the footer (helps discovery)

### 12. Consider hreflang if Filipino content is added [~1 hour when applicable]
If a Filipino (Tagalog/Filipino language) version of any page is created:
```html
<link rel="alternate" hreflang="en-PH" href="https://gethiredonline.app/home">
<link rel="alternate" hreflang="fil-PH" href="https://gethiredonline.app/fil/home">
<link rel="alternate" hreflang="x-default" href="https://gethiredonline.app/home">
```
Not needed until a second-language version exists.

---

## Long-Term (Phase 4 SEO — 1-3 months)

### 13. SSR canonical link injection
If Angular Universal SSR is ever activated, `setCanonical()` must be updated to work server-side. Replace `document.querySelector` with Angular's `DOCUMENT` injection token which works in both environments. Without this, Googlebot SSR renders will not see canonical `<link>` tags.

### 14. 410 Gone for expired jobs
When a job expires (job_status_id changes from 2), Google's crawl cycle may take weeks to see the noindex. A `410 Gone` HTTP response would signal immediate removal. Requires BE middleware that checks job status on each job detail URL, returning 410 if the job is no longer active.

### 15. Structured data testing and monitoring [ongoing]
- After deployment, test 5-10 job detail URLs in Google Rich Results Test
- Monitor Search Console's "Enhancements" tab for JobPosting rich result errors
- Set up weekly Search Console performance report alerts
- Track "Google for Jobs" impressions via Search Console's Search Type filter

### 16. Core Web Vitals optimization [2-3 weeks]
CWV (LCP, INP, CLS) are Google ranking signals. Run:
```bash
npx lighthouse https://gethiredonline.app --view
```
Target LCP < 2.5s, INP < 200ms, CLS < 0.1 for "Good" classification.

---

## Priority Summary

| Priority | Item | Effort |
|---|---|---|
| P0 — Do now | Verify /sitemap.xml production routing | 30min |
| P0 — Do now | Create OG image 1200x630px | Design |
| P0 — Do now | Submit sitemap to Search Console | 15min |
| P1 — This week | Remote job Schema.org fields | 2h |
| P1 — This week | Add companies to sitemap | 1h |
| P2 — Next sprint | Indexing API for real-time notify | 4h |
| P2 — Next sprint | Organization sameAs social links | 30min |
| P2 — Next sprint | Verify companies breadcrumb URL | 1h |
| P3 — Medium term | SSR canonical injection | 2h |
| P3 — Medium term | 410 Gone for expired jobs | 3h |
| P4 — Long term | Core Web Vitals optimization | 2-3 weeks |
| P4 — Long term | hreflang (only if Filipino pages added) | 1h |
