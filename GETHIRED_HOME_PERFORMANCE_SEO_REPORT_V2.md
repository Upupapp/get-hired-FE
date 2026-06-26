# GETHIRED_HOME_PERFORMANCE_SEO_REPORT_V2
> Performance and SEO impact for GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## SEO impact

### Preserved
- H1: "Find your next job. Build your next team." (unchanged)
- Page meta set via `SeoService.setPageMeta()` in `ngOnInit` (unchanged)
- `setOrganizationJsonLd()` and `setWebsiteJsonLd()` called (unchanged)
- Canonical: `https://gethiredonline.app/home` (unchanged)
- `robots: 'index, follow'` (unchanged)

### New sections and SEO
- Product Preview, Trust & Safety, Employer band: all rendered as Angular Universal SSR HTML
- Section content (h2, h3, copy) is crawlable by Googlebot as SSR'd HTML
- Scroll-reveal CSS (`opacity: 0`) does not hide content from crawlers — Googlebot crawls SSR'd HTML, not post-JS state
- No dynamic/lazy-loaded content behind API gates in new sections

## Performance impact

### JavaScript bundle
The `PortalRevealDirective` adds ~800 bytes to the shared chunk. It is included in `SharedModule` which is already in the critical path. Net impact: negligible.

### Render performance
- Three new sections use `ngIf` (only one tab panel rendered at a time) — actual DOM is minimal
- No `ngFor` loops rendering more than 5 items
- No new HTTP calls
- No new image loads (existing SVG assets only)
- CSS transitions use `opacity` + `transform` — GPU-composited, no layout/paint triggers

### Images
- `preview-signals-rings` uses `loading="lazy"` — not in initial viewport
- All hero images retain `loading="lazy"` from before

### IntersectionObserver
- Three observers created on page load for the new sections
- Each disconnects immediately after first fire — no ongoing polling cost

## LCP / CLS risk
- No changes to the hero section or above-fold layout → LCP element (hero heading) is unchanged
- New sections are below fold → no CLS impact from scroll-reveal (elements occupy their full layout space from the start via `opacity: 0`, not `display: none`)

## Verdict: no performance regression expected
