# GetHired SEO V4 — Frontend SEO UX / Haptics / Effects Log

Generated: 2026-06-26

## Scope: Public pages only

Private authenticated pages are out of scope for this phase. All changes must be CSS-only where possible and include prefers-reduced-motion fallbacks.

## V3 Implemented (confirmed present in V4)

### Skeleton Loading System (styles.scss)

Classes:
- `.gh-skeleton` — shimmer animation (1.4s infinite)
- `.gh-skeleton-card` — card wrapper with title, subtitle, line, tag skeletons
- `.gh-skeleton-reveal` — fade-out transition when content arrives

All animations guarded with `@include ambient-motion-safe` mixin (from `_motion.scss`).

Status: PASS — verified present in styles.scss.

### Job Card Hover Lift (styles.scss)

Class: `.gh-job-card-hover` — transform + box-shadow transition using motion tokens.
Guarded with `@include motion-safe`.

Status: PASS — verified present in styles.scss.

### Mobile Tap Compression (styles.scss)

Scale animation (0.985) on `.mat-raised-button`, `.mat-flat-button`, `.btn`, `.gh-card` for touch devices only (`@media (hover: none) and (pointer: coarse)`).

Status: PASS.

### Global Reduced-Motion Contract (styles.scss)

```scss
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Status: PASS — all animations disabled for reduced-motion users.

## V4 No New Changes

No new CSS effects were added in V4. The existing skeleton/hover/haptic system from V3 is complete and correct.

## SEO-Relevant UX Notes

### Loading States on Public Job List

If the job list shows a blank state while loading, Googlebot (which may not wait for JS) sees an empty list. SSR mitigates this by rendering the initial job list from the server. If the job list requires a client-side API call after hydration, Googlebot may see an empty list.

Recommendation: Ensure the public job list can be server-side rendered with initial job data (this requires transferState or SSR API pre-fetching — advanced Angular Universal feature). Not implemented; document as V5 backlog.

### Hero CTAs

GoToJobs / GoToJobSeekers / GoToEmployers are Angular router calls. For crawlers, the 404 page provides fallback `<a>` links to /home and /jobs. The sitemap covers /job-seekers and /employers.
