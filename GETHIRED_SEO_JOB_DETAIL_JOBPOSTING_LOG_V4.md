# GetHired SEO V4 — Job Detail & JobPosting JSON-LD Log

Generated: 2026-06-26

## Component: PublicDetailsComponent
File: `src/app/public/public-details/public-details.component.ts`

## V4 Status: PASS — no code changes required

V3 implemented a complete JobPosting JSON-LD with all required and optional fields. V4 review confirms no gaps introduced since V3.

## JobPosting Field Inventory

| Field | Value | Notes |
|-------|-------|-------|
| @context | https://schema.org | ✓ |
| @type | JobPosting | ✓ |
| title | job.jobTitle | ✓ real data |
| description | stripHtml(job.jobDescription) | ✓ real data, HTML stripped safely |
| datePosted | toIso(job.createdAt) | ✓ ISO 8601 |
| validThrough | toIso(job.expirationDate) | ✓ only if exists |
| hiringOrganization.@type | Organization | ✓ |
| hiringOrganization.name | company_name OR companyName OR companyDetails | ✓ fallback chain |
| hiringOrganization.logo | job.companyLogoUrl | ✓ only if exists, never fabricated |
| jobLocation.@type | Place | ✓ |
| jobLocation.address.addressCountry | PH | ✓ |
| jobLocation.address.addressLocality | job.jobCity | ✓ only if exists |
| url | BASE_URL/jobs/details/:jobId | ✓ |
| directApply | true | ✓ enables "Apply on site" badge |
| identifier.name | GetHired Online | ✓ |
| identifier.value | job.jobId | ✓ deduplication |
| employmentType | mapped from job.jobTypeName | ✓ returns OTHER if type is known-but-unmapped |
| baseSalary | only if salaryMinimum AND salaryMaximum AND salaryCurrency | ✓ never fabricated |

## Intentionally Omitted Fields

- `hiringOrganization.sameAs` — company social URL not available
- `applicantLocationRequirements` — remote job detection not implemented (backlog N4)
- `jobLocationType` — not implemented (backlog N4)
- rating / reviewCount — NEVER. No real data. Fabricating would violate Google policies.

## Lifecycle Behavior

- emitted ONLY when jobStatusId === 2 (active/published)
- cleared on ngOnDestroy (prevents stale JSON-LD on navigate-away)
- BreadcrumbList also emitted and cleared in sync

## V4 SSR Impact

Previously, setJobPostingJsonLd called setJsonLd which had `if (!this.isBrowser) return;`. This meant the SSR-rendered HTML never contained JobPosting JSON-LD. After the DOCUMENT injection fix in V4, JSON-LD is now emitted in SSR HTML.

Verification command:
```
curl -sA Googlebot https://gethiredonline.app/jobs/details/1 | grep -i "application/ld+json"
```
Expected result post-V4 deploy: one or more `<script type="application/ld+json"` lines.

## Employment Type Mapping

| Input | Output |
|-------|--------|
| full-time, full time | FULL_TIME |
| part-time, part time | PART_TIME |
| internship, intern | INTERN |
| contract, freelance | CONTRACTOR |
| temporary, temp | TEMPORARY |
| volunteer | VOLUNTEER |
| anything else known | OTHER |
| null/undefined | field omitted |
