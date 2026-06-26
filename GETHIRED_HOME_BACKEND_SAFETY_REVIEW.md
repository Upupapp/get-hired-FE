# GETHIRED_HOME_BACKEND_SAFETY_REVIEW
> Backend safety review for GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## Backend calls made by this page

### Preserved from V1 (unchanged)
| Call | When | Purpose |
|------|------|---------|
| `CoreService.isLoggedIn()` | `ngOnInit` | Redirect authenticated users to their dashboard |
| `CoreService.getRole()` | If logged in | Determine which dashboard to redirect to |
| `SeoService.setPageMeta()` | `ngOnInit` | SSR/SSG meta injection |
| `SeoService.setOrganizationJsonLd()` | `ngOnInit` | JSON-LD structured data |
| `SeoService.setWebsiteJsonLd()` | `ngOnInit` | JSON-LD structured data |
| `TalentProofService` (via badge component) | On render | 500K registered count + verification status |

### New in V2
NONE. The three new sections (Product Preview, Trust & Safety, Employer band) make no backend API calls. All content is static/template-driven.

## Analytics calls (new in V2)

All new analytics calls go through `PublicPortalAnalyticsService`, which:
- Has no SDK wired (confirmed via repo-wide search)
- Is a safe no-op in production
- Only `console.debug()`s in non-production
- Sends no data to any external service today

## Security surface area

The new sections introduce zero new server-side routes, zero new form inputs, zero new file upload paths, and zero new authentication flows. There is no new injection surface.

## Data exposure risk

The product preview mock data is entirely static and fictional. No API calls are made to populate mock content. No real user data is ever fetched or displayed on this marketing page beyond what was already present (talent proof count).

## Verdict: NO new backend risk introduced
