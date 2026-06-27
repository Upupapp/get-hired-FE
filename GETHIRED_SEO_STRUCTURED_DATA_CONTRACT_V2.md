# GETHIRED_SEO_STRUCTURED_DATA_CONTRACT_V2
Command: GETHIRED_REUSABLE_SEO_SEARCH_INDEXING_PUBLIC_DISCOVERY_COMMAND_V2
Date: 2026-06-27

---

## Implemented Schemas

### 1. Organization (Homepage `/home`)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GetHired Online",
  "url": "https://gethiredonline.app",
  "logo": "https://gethiredonline.app/assets/brand/Gethired-horizontal-logo.png",
  "contactPoint": { "@type": "ContactPoint", "contactType": "customer service" }
}
```
**Status:** ✅ Implemented — `seoService.setOrganizationJsonLd()`.

---

### 2. WebSite (Homepage `/home`)
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "GetHired Online",
  "url": "https://gethiredonline.app",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://gethiredonline.app/jobs/search/{search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```
**Status:** ✅ Implemented — `seoService.setWebSiteJsonLd()`.

---

### 3. JobPosting (Job detail `/jobs/details/:id`)
**Required pre-conditions (all must be true):**
- `job.jobStatusId === 2` (published/active)
- `job.jobId` is not null
- `job.jobTitle` is not null

**Fields:**
| Field | Source | Notes |
|---|---|---|
| `@type` | static | `"JobPosting"` |
| `title` | `job.jobTitle` | Required |
| `description` | `job.jobDetails` or fallback | Sanitized |
| `datePosted` | `job.createdAt` | ISO 8601 |
| `validThrough` | `job.expiresAt` | Omitted if null |
| `hiringOrganization.name` | `job.companyName` | |
| `hiringOrganization.logo` | `job.companyLogoUrl` | Omitted if null |
| `jobLocation.addressLocality` | `job.companyCity` | |
| `jobLocation.addressCountry` | `"PH"` | Always Philippines |
| `jobLocationType` | `"TELECOMMUTE"` if remote | Conditional |
| `employmentType` | mapped from `job.jobTypeId` | e.g., FULL_TIME |
| `url` | `https://gethiredonline.app/jobs/details/{id}` | Canonical |
| `directApply` | `true` | Always |
| `baseSalary` | omitted if null | Never fake salary |

**Omit entire schema if:**
- Job is draft (`jobStatusId !== 2`)
- Job is expired
- Job is private/restricted
- Required fields are missing

**Status:** ✅ Implemented — `seoService.setJobPostingJsonLd(job)`.

---

### 4. BreadcrumbList (All public pages)
| Page | Breadcrumb |
|---|---|
| Home | Home |
| Job board | Home > Jobs |
| Job detail | Home > Jobs > {jobTitle} |
| Companies | Home > Companies |
| Company detail | Home > Companies > {companyName} |
| Job seekers | Home > For Job Seekers |
| Employers | Home > For Employers |

**Status:** ✅ Implemented — `seoService.setBreadcrumbJsonLd(items)`.

---

### 5. FAQPage — NOT YET IMPLEMENTED
**Condition for use:** Only when visible FAQ accordions exist on the page and content matches structured data exactly.
**Status:** ❌ Deferred — no public FAQ sections implemented yet.

---

### 6. SoftwareApplication / Product — NOT YET IMPLEMENTED
**Potential use:** Public employer/job seeker marketing pages.
**Status:** Backlog — implement when marketing content pages have stable product descriptions.

---

## Implementation Notes

- All JSON-LD scripts injected via `DOCUMENT` token (SSR-safe).
- Scripts given unique IDs so they are replaced on SPA navigation (not duplicated).
- Entity decoding uses textarea method to prevent XSS.
- No fake data injected (no fake reviews, ratings, salary ranges, applicant counts).
- Fields that are null/undefined are omitted from the schema output.
