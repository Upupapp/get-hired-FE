# GETHIRED_HOME_RESPONSIVE_SPEC
> Responsive breakpoint specification for GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## Breakpoints used

| Breakpoint | Width |
|-----------|-------|
| Desktop | ≥992px |
| Tablet | 768px–991px |
| Mobile large | 576px–767px |
| Mobile small | <576px |

## Section: Hero proof chips
- All viewport sizes: `display: flex; flex-wrap: wrap; gap: 8px`
- Mobile (≤991px): `justify-content: center`
- Desktop: left-aligned (inherits hero copy alignment)

## Section: Product Preview
- Container: `max-width: 1100px`, centered with `padding: 0 24px`
- Inner card: 24px border-radius, 48px/40px padding at desktop; 16px border-radius, 32px/20px at mobile
- Preview tabs: always `flex-wrap: wrap; justify-content: center` — natural responsive wrap
- Preview panel: `grid-template-columns: 1fr 1fr` at ≥768px; `1fr` at <768px (card stacks above info)

## Section: Trust & Safety
- Container: `max-width: 1100px`, centered
- Grid: 4 columns at ≥992px; 2 columns at 576px–991px; 1 column at <576px

## Section: Employer conversion band
- Container: `max-width: 1100px`, centered
- Inner card: 48px/40px padding, 24px border-radius at ≥768px
- Mobile: 32px/20px padding, 16px border-radius
- Heading: 26px at desktop; 22px at <576px
- CTA row: always `justify-content: center`

## Existing sections (preserved, no changes to breakpoints)
- Hero: existing `portal-hero-inner--split` handles split→stack at 991px
- Role grid: existing 2-column → 1-column at 767px
- USP grid: existing 4→2→1 column behavior at existing breakpoints
- Bento grid: existing behavior unchanged
- Journey steps: existing behavior unchanged
