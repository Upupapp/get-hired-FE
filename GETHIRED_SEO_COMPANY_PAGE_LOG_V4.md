# GetHired SEO V4 — Company Page SEO Log

Generated: 2026-06-26

## Route: /companies/details — PublicCompanyDetailsComponent

### Status: PASS (same as V3, no V4 code changes needed)

| Check | Result |
|-------|--------|
| Title: "[Company Name] | GetHired Online" | PASS (from real data) |
| Description: "Explore [Company Name] on GetHired Online..." | PASS (from real data) |
| Canonical: /companies/details?id=[id] | PASS |
| Robots: index, follow | PASS |
| BreadcrumbList: Home > Companies > [Name] | PASS |
| Cleared on ngOnDestroy | PASS |

### Known Issues

#### Query-parameter canonical URL
The canonical URL includes `?id=X` because that's the actual URL structure (`/companies/details?id=123`). Clean URLs (`/companies/123`) would be better for SEO but require a routing change — backlog item V5.

#### "Companies" breadcrumb links to /companies
The BreadcrumbList JSON-LD includes `{ name: 'Companies', url: '/companies' }`. The route `/companies` exists in the router but may not resolve to a meaningful page (it's a module entry, not a dedicated list component). If /companies returns a 404 or empty redirect, this breadcrumb link would be broken. Verify the /companies route renders properly.

#### No company-level JSON-LD (Organization)
PublicCompanyDetailsComponent does not emit an Organization JSON-LD block for the company being viewed. This is a V5 enhancement opportunity — adding:
```json
{
  "@type": "Organization",
  "name": "[company.companyName]",
  "url": "https://gethiredonline.app/companies/details?id=[id]"
}
```
Only when real company data is available. Never fabricate logo, sameAs, or employee count.

### Sitemap Coverage

Company pages are NOT in the sitemap (V3 backlog N2, V4 backlog). To add them:
1. BE sitemap endpoint would need a second query: `SELECT company_id FROM companies WHERE [active condition]`
2. Each URL: `https://gethiredonline.app/companies/details?id=[company_id]`
3. Priority: 0.6, changefreq: monthly

This would require identifying the correct "active company" condition in the BE schema.

### Data Safety

All company meta values come from real API data (`compaiesFacade.companyDetails$`). No fallback values are fabricated. If company data doesn't load (null), the filter `company && company.companyName` prevents meta from being set at all — page renders with whatever SSR default is in index.html.

This is acceptable behavior. An enhancement would be setting a generic "Company on GetHired" fallback if the company exists but some fields are null.
