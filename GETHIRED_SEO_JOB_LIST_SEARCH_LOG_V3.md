# GETHIRED SEO Job List / Search Log V3

Generated: 2026-06-25

## Public Job List (/jobs — PublicListComponent)

### Canonical Strategy
Canonical points to `https://gethiredonline.app/jobs` — the clean, parameter-free URL.
No filter/sort query params exist on this page (the FE does not add query params to the job list URL).

### Robots
`index, follow` — this is the primary jobs landing page.

### Breadcrumb JSON-LD
`[Home → /home] → [Jobs → /jobs]`

### Template (public-list.component.html)
Uses `<app-job-posts-list>` component to render the job list. The job-posts-list component renders cards via a child component. Skeleton loading classes (`gh-skeleton-card`, `gh-job-card-hover`) are available globally from styles.scss for any integrator to add to job cards.

---

## Job Search Results (/jobs/search/:keyword — PublicSearchComponent)

### Canonical Strategy
Canonical always points to `https://gethiredonline.app/jobs` — NOT to the keyword URL.
Reason: keyword URLs like `/jobs/search/nurse` are parameterized search results. Treating `/jobs` as the canonical prevents duplicate content signals.

### Robots
`noindex, follow` — crawlers can follow links found on search result pages but should not index the search result URL itself.

### Title Pattern
`"{keyword}" Jobs in the Philippines | GetHired Online`

### Description Pattern
`Search results for "{keyword}" jobs in the Philippines on GetHired Online.`

---

## Backlog (no code change in this pass)

- **Filter-aware canonical:** If the FE ever adds query params for city/job type/work setup filters to the /jobs URL, the canonical should strip those params.
- **Pagination:** If /jobs ever supports page-based pagination (?page=2), rel=prev/rel=next or individual page canonicals should be added.
- **Structured data on job list:** Do NOT add ItemList or JobPosting schema to the jobs list page — this would require a multi-job schema which has different validation requirements and risks. Each individual job's detail page has its own JobPosting schema.
