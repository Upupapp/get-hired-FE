# GETHIRED SEO Job Detail JobPosting JSON-LD Log V3

Generated: 2026-06-25

## Implementation

**File modified:** `src/app/public/public-details/public-details.component.ts`

## When JSON-LD is Emitted
- ONLY when `job.jobStatusId === 2` (published/active).
- JSON-LD ID: `gh-jsonld-jobposting`.
- Injected into `<head>` as `<script type="application/ld+json" id="gh-jsonld-jobposting">`.

## When JSON-LD is Cleared
- `ngOnDestroy()` calls `seoService.clearJobPostingJsonLd()`.
- Also cleared immediately when job loads with `jobStatusId !== 2`.
- Prevents stale JSON-LD persisting after navigation away from the job detail page.

## Field Mapping

| Schema.org Field | Source | Condition |
|-----------------|--------|-----------|
| `@type` | Hardcoded `"JobPosting"` | Always |
| `title` | `job.jobTitle` | Always |
| `description` | `job.jobDescription` stripped of HTML | When present |
| `datePosted` | `job.createdAt` (ISO 8601) | Always |
| `validThrough` | `job.expirationDate` (ISO 8601) | Only when present |
| `employmentType` | Mapped from `job.jobTypeName` | Only when unambiguous match |
| `hiringOrganization.name` | `job.companyName` | Always |
| `jobLocation.addressCountry` | Hardcoded `"PH"` | Always |
| `jobLocation.addressLocality` | `job.jobCity` | Only when present |
| `url` | `https://gethiredonline.app/jobs/details/{jobId}` | Always |
| `baseSalary.currency` | `job.salaryCurrency` | Only when min, max, AND currency all present |
| `baseSalary.value.minValue` | `job.salaryMinimum` | Only when all salary fields present |
| `baseSalary.value.maxValue` | `job.salaryMaximum` | Only when all salary fields present |
| `baseSalary.value.unitText` | `job.rate` (uppercased) or `"MONTH"` | Only when all salary fields present |

## Employment Type Mapping
```
"full" in jobTypeName → FULL_TIME
"part" in jobTypeName → PART_TIME
"contract" in jobTypeName → CONTRACTOR
"internship"/"intern" in jobTypeName → INTERN
"freelance" in jobTypeName → CONTRACTOR
"temporary"/"temp" in jobTypeName → TEMPORARY
otherwise → omitted (null)
```

## Forbidden Fields (never emitted)
- `aggregateRating`, `ratingCount`, `reviewCount` — no review data exists
- `hiringOrganization.logo` — no reliable logo URL in the job data model
- `hiringOrganization.sameAs` — no verified social/website data
- `jobBenefits` — not in data model
- `applicantLocationRequirements` — not in data model

## HTML Stripping
`job.jobDescription` is stored as HTML (rich text). Before embedding in JSON-LD:
- Browser context: `div.textContent || div.innerText` (safe, no eval)
- SSR context: simple regex `/<[^>]*>/g` replacement (safe, text-only result)

## Related Metadata Set Simultaneously
When job detail loads:
- `setPageMeta()` with title, description, canonical, robots
- `setBreadcrumbJsonLd([Home, Jobs, {jobTitle}])`

## ngOnDestroy Cleanup
```typescript
ngOnDestroy(): void {
  this.seoService.clearJobPostingJsonLd();
  this.seoService.clearBreadcrumbJsonLd();
  if (this.seoSub) this.seoSub.unsubscribe();
}
```
