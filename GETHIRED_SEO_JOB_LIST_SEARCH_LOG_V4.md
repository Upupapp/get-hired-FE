# GetHired SEO V4 — Job List & Search SEO Log

Generated: 2026-06-26

## /jobs — PublicListComponent

### Status: PASS

| Check | Result |
|-------|--------|
| Title present | PASS: "Browse Jobs in the Philippines | GetHired Online" |
| Description present | PASS: "Search thousands of job opportunities..." |
| Canonical set | PASS: https://gethiredonline.app/jobs |
| Robots: index,follow | PASS |
| BreadcrumbList JSON-LD | PASS: Home > Jobs |
| BreadcrumbList cleared on leave | PASS: ngOnDestroy calls clearBreadcrumbJsonLd() |

### Filter Parameter Handling

The /jobs page does not append filter parameters to the URL (filtering appears to be handled in-component via the job-posts-list component). Therefore, no canonical parameter canonicalization is needed beyond the base /jobs URL.

If URL-based filtering is added in the future (e.g., /jobs?type=full-time), the canonical should remain /jobs and the filter pages should be noindex.

## /jobs/search/:keyword — PublicSearchComponent

### Status: PASS

| Check | Result |
|-------|--------|
| Title dynamic | PASS: '"[keyword]" Jobs in the Philippines | GetHired Online' |
| Canonical → /jobs | PASS: canonical always set to /jobs regardless of keyword |
| Robots: noindex,follow | PASS |
| robots.txt Disallow | PASS: /jobs/search/ is blocked |

### Canonical Strategy

Search result pages use `canonical: 'https://gethiredonline.app/jobs'` — this is the correct duplicate-content prevention strategy. It tells Google the canonical version of any search result page is the main jobs list, and prevents crawl budget being wasted on infinite keyword combinations.

### Issue: localStorage usage in SSR context

PublicSearchComponent reads `localStorage` in field initializers:
```ts
public loggedUserData: any = JSON.parse(localStorage.getItem('userData'));
public jobSearch = JSON.parse(sessionStorage.getItem('job-search'));
```

On the server (SSR), `localStorage` and `sessionStorage` are undefined — this causes a runtime error in server rendering. However, since `/jobs/search/:keyword` is noindex and blocked in robots.txt, Googlebot will never crawl it, making this a client-only UX page. The SSR error is non-fatal for SEO because:
1. robots.txt Disallow prevents Googlebot from ever requesting this URL
2. noindex prevents indexing even if somehow crawled

**Backlog item:** Guard localStorage access with `isPlatformBrowser` in PublicSearchComponent to prevent SSR crashes if a bot ever requests the URL despite robots.txt.

## Pagination

No pagination mechanism observed on the jobs list. If pagination is added (e.g., /jobs?page=2), apply rel="canonical" pointing to /jobs (page 1) or use rel="prev"/rel="next" — document at that time.

## "Thousands" Claim in Meta Description

"Search thousands of job opportunities" — this is copy, not a structured data claim. As long as the actual job count is in the hundreds or growing toward thousands, this phrasing is acceptable. If the job count falls below a few hundred, the description should be updated to "Search hundreds of job opportunities" or similar. Monitor via Search Console.
