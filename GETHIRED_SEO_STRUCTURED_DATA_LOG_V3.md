# GETHIRED SEO Structured Data Log V3

Generated: 2026-06-25

## Structured Data Implemented

### 1. Organization (on /home — MainPortalComponent)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GetHired Online",
  "url": "https://gethiredonline.app",
  "logo": "https://gethiredonline.app/assets/images/logo.png",
  "sameAs": [],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "availableLanguage": ["English", "Filipino"]
  }
}
```
Note: `sameAs` left empty — no confirmed social media URLs available. Logo path uses `/assets/images/logo.png` — verify this file exists in the deployed build.

### 2. WebSite with SearchAction (on /home — MainPortalComponent)
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "GetHired Online",
  "url": "https://gethiredonline.app",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://gethiredonline.app/jobs/search/{search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```
Eligible because `/jobs/search/:keyword` is a public, no-auth search endpoint.

### 3. JobPosting (on /jobs/details/:id — PublicDetailsComponent)
See `GETHIRED_SEO_JOB_DETAIL_JOBPOSTING_LOG_V3.md` for full field mapping.
Only emitted when `job.jobStatusId === 2`.

### 4. BreadcrumbList
Emitted on:
- `/jobs` → `[Home, Jobs]`
- `/jobs/details/:id` → `[Home, Jobs, {jobTitle}]`
- `/companies/details?id=` → `[Home, Companies, {companyName}]`

## JSON-LD Script Management
All JSON-LD blocks are identified by a unique `id` attribute:
- `gh-jsonld-org` — Organization
- `gh-jsonld-website` — WebSite
- `gh-jsonld-jobposting` — JobPosting
- `gh-jsonld-breadcrumb` — BreadcrumbList

The `setJsonLd(id, data)` method replaces any existing script with the same id (no accumulation).
The `clearJsonLd(id)` method removes the script when navigating away.

## Structured Data NOT Implemented (Policy)
- ItemList on job list page — not appropriate; each job should be indexed individually via its own URL
- FAQ schema on portal pages — would require answers in structured data that must match visible page content exactly; deferred until FAQ component is stable
- Rating/Review schema — no review data exists; NEVER fabricate
