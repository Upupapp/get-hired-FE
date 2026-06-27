# GETHIRED SEO Company Page Log V3

Generated: 2026-06-25

## Current State

### Route
`/companies/details?id={companyId}` — rendered by `PublicCompanyDetailsComponent`.
Mounted under `/companies` child route in `CompaniesModule`, loaded lazily from `PublicModule`.

### Routing Pattern
The company detail page uses a query parameter (`?id=`) rather than a path parameter (`:id`).
This is unusual but functions correctly. The canonical URL preserves the query param since that IS the canonical form for this page.

### Implementation (Phase 9)
File modified: `src/app/companies/public-company-details/public-company-details.component.ts`

Metadata set when company data loads:
```
title:       "{companyName} | GetHired Online"
description: "Learn about {companyName} and view their open jobs on GetHired Online."
canonical:   "https://gethiredonline.app/companies/details?id={companyId}"
robots:      "index, follow"
```
BreadcrumbList: `[Home] → [Companies → /companies] → [{companyName}]`

### No Public Companies List Page
`CompaniesComponent` exists (`src/app/companies/companies.component.ts`) and is declared in `CompaniesModule`, but there is no route that renders it as a standalone public list page. The companies list is embedded as `<app-public-companies-recommended>` inside the jobs list page template.

**Impact:** No `/companies` index page to optimize. This is a structural backlog item.

## Company Data Available for Meta
From `CompaniesFacade.companyDetails$`:
- `companyName` — used in title and description
- `companyId` — used in canonical URL
- `companyDetails` / company description — could be used in description (not implemented — description template is static to avoid generic/empty descriptions if companyDetails is null)

## Backlog

| Item | Priority |
|------|---------|
| Add public `/companies` list page with index + meta | P2 |
| Use company.industry or location in page description | P3 |
| Add Organization JSON-LD to company detail page | P2 |
| Switch route to path param `/companies/:id` for cleaner URLs | P3 (routing refactor) |
| Company logo in OG image (if reliable URL available) | P3 |
