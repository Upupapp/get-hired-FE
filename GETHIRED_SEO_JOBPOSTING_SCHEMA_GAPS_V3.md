# GetHired SEO V3 — JobPosting Schema Field-by-Field Analysis

Audit date: 2026-06-25
Deployment commits: FE bf5bd08 / BE 26ca25a
Source: `src/app/core/services/seo.service.ts` → `setJobPostingJsonLd(job)`

---

## Google's Required Fields

| Field | Google Status | Implemented? | Value Source | Notes |
|---|---|---|---|---|
| `title` | REQUIRED | YES | `job.jobTitle` | Correct mapping |
| `description` | REQUIRED | YES | `stripHtml(job.jobDescription)` | HTML stripped correctly |
| `datePosted` | REQUIRED | YES | `toIso(job.createdAt)` | ISO 8601 format via `toIso()` |
| `hiringOrganization.name` | REQUIRED | YES | `job.companyName \|\| job.companyDetails` | Note: Job model uses `companyDetails` not `companyName` |
| `hiringOrganization.@type` | REQUIRED | YES | `'Organization'` | Hardcoded correctly |
| `jobLocation` OR `applicantLocationRequirements` | REQUIRED | PARTIAL | `job.jobCity` → `addressLocality` | addressCountry hardcoded 'PH' which is correct for this market; jobAddress field NOT included |

## Required Field Issues

### hiringOrganization.name — Data Source Gap
The `Job` interface in `job.model.ts` has NO `companyName` field.  
The code uses: `job.companyName || job.companyDetails`

`companyDetails` is defined in the Job model and appears to be a description/bio field, NOT the company name. The API may return `company_name` as a snake_case field (not in the TS interface), which is why `public-details.component.ts` uses `(job as any).company_name || (job as any).companyName`.

However, `setJobPostingJsonLd()` uses `job.companyName || job.companyDetails` without the snake_case fallback.

**Risk: HIGH** — If the API returns `company_name` (snake_case), `job.companyName` is undefined and `job.companyDetails` (a description field) is used as the company name in the schema. The component itself correctly handles this via `as any` casts but passes the full job object to `setJobPostingJsonLd(job)` without pre-mapping `companyName`.

**Fix needed**: In `setJobPostingJsonLd`, add the same fallback:
```ts
name: (job as any).company_name || job.companyName || job.companyDetails || '',
```

### jobLocation — Missing jobAddress
`job.jobAddress` exists in the Job model but is not included in the `address` object. This is optional but provides richer location data.

---

## Google's Strongly Recommended Fields

| Field | Status | Value Source | Notes |
|---|---|---|---|
| `validThrough` | CONDITIONAL | `job.expirationDate` | Correctly conditional — only emitted if `expirationDate` exists |
| `baseSalary` | CONDITIONAL | `job.salaryMinimum + salaryMaximum + salaryCurrency` | Correctly conditional — only emitted if all three are present |
| `employmentType` | CONDITIONAL | `mapEmploymentType(job.jobTypeName)` | Only emitted if mapping succeeds; mapping covers FULL_TIME, PART_TIME, CONTRACTOR, INTERN, TEMPORARY |
| `identifier` | MISSING | — | `job.jobId` could be used as `PropertyValue` |
| `directApply` | MISSING | — | Set to `true` would be appropriate for this platform |

---

## Google's Recommended Fields (would improve rich result eligibility)

| Field | Status | Notes |
|---|---|---|
| `hiringOrganization.sameAs` | MISSING | Noted in code comments as intentionally omitted; ideally: company's public website URL |
| `hiringOrganization.logo` | MISSING | `job.companyLogoUrl` exists in model — safe to add |
| `applicantLocationRequirements` | MISSING | Relevant for remote jobs; `workSetupId` exists but not mapped |
| `jobBenefits` | MISSING | Not in model |
| `jobLocationType` | MISSING | Needed for remote jobs (value: `TELECOMMUTE`) |
| `url` | PRESENT | `https://gethiredonline.app/jobs/details/${job.jobId}` — correct |
| `@context` | PRESENT | `https://schema.org` — correct |
| `@type` | PRESENT | `JobPosting` — correct |

---

## employmentType Mapping Review

Current `mapEmploymentType()` in seo.service.ts:
```
full → FULL_TIME        ✓ valid Schema.org value
part → PART_TIME        ✓ valid Schema.org value
contract → CONTRACTOR   ✓ valid Schema.org value
internship/intern → INTERN  ✓ valid Schema.org value
freelance → CONTRACTOR  ✓ acceptable mapping
temporary/temp → TEMPORARY  ✓ valid Schema.org value
```

Missing from Schema.org enum that may exist as job types in the DB:
- `OTHER` — valid Schema.org value for unmatched types
- `VOLUNTEER` — valid if platform supports it

**Recommendation**: Add a final `return 'OTHER'` fallback in the default case to ensure employmentType is always populated rather than omitted.

---

## Remote Work — Missing Schema

The `Job` model has `workSetupId` and `workSetupName`. When a job is remote (workSetupName likely 'Remote' or 'Work from Home'), Google requires:
- `applicantLocationRequirements: { '@type': 'Country', name: 'Philippines' }` (or broader)
- `jobLocationType: 'TELECOMMUTE'`

Neither is currently emitted. Remote jobs will not qualify for the "Work from home" Google for Jobs filter.

**Recommendation** (Phase 2): Map `workSetupName` to detect remote and add these fields.

---

## baseSalary unitText

Current code uses `job.rate ? job.rate.toUpperCase() : 'MONTH'`.

The `rate` field (from Job model) appears to be pay frequency. Google expects Schema.org QuantitativeValue unitText values like:
- `HOUR`, `DAY`, `WEEK`, `MONTH`, `YEAR`

If `job.rate` returns lowercase like `month`, `hourly`, `daily` — the `.toUpperCase()` call on `hourly` would give `HOURLY` which is NOT a valid Schema.org value.

**Fix needed**: Normalize rate to valid Schema.org values:
```ts
const rateMap: Record<string, string> = {
  hourly: 'HOUR', daily: 'DAY', weekly: 'WEEK',
  monthly: 'MONTH', annual: 'YEAR', yearly: 'YEAR',
};
unitText: rateMap[(job.rate || '').toLowerCase()] || 'MONTH'
```

---

## Summary Score

**Required fields covered: 5/6** (jobLocation partial — addressLocality only when jobCity exists)
**Strongly recommended: 2/5** (validThrough conditional, baseSalary conditional, employmentType conditional are implemented; identifier and directApply missing)
**Overall completeness: ~65%**

### Priority Fixes

1. **P1 — company_name fallback** in `setJobPostingJsonLd` to match component's `(job as any).company_name` pattern
2. **P1 — baseSalary unitText normalization** — `HOURLY` is not a valid Schema.org value
3. **P2 — Add `identifier`** using `job.jobId` as `PropertyValue`
4. **P2 — Add `directApply: true`** to all JobPosting schema outputs
5. **P2 — Add `hiringOrganization.logo`** from `job.companyLogoUrl`
6. **P3 — Remote job support** — map `workSetupName` to `jobLocationType` and `applicantLocationRequirements`
7. **P3 — `employmentType` fallback** to `'OTHER'` instead of omitting the field
