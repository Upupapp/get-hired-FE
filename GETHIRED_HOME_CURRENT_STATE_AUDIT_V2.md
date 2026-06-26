# GETHIRED_HOME_CURRENT_STATE_AUDIT_V2
> Phase 1 — Current state audit before GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## File inventory (before redesign)

| File | Lines | Role |
|------|-------|------|
| `main-portal.component.html` | 209 | Template |
| `main-portal.component.ts` | 120 | Component logic |
| `main-portal.component.scss` | 525 | Styles |
| `src/app/public/shared/_portal-common.scss` | ~180 | Shared portal styles |
| `src/app/public/services/public-portal-analytics.service.ts` | 159 | Analytics |
| `src/app/shared/directives/viewed-once.directive.ts` | ~40 | IntersectionObserver (analytics only) |

## Section inventory (before redesign)

1. **Hero** — split layout: copy+CTA left, animated mock cards right. Talent proof badge. Secondary links (browse / sign in).
2. **Role selector** — two role cards (Job Seeker / Employer). Trust strip with feature chips.
3. **USP section** — 4-card grid with local SVG icons. "Not just a job board" heading.
4. **What GetHired does** — 6-card bento grid with emoji icons.
5. **Job seeker journey** — ordered steps list with inline CTA.
6. **Employer journey** — ordered steps list with proof badge and dual CTA.
7. **How it works** *(REMOVED in V2)* — simple 2-column list; fully redundant with journeys above and product preview below. Removal confirmed safe.
8. **Final CTA band** — shared component with primary/secondary CTA buttons.

## Gaps identified (pre-redesign)

- No product preview / feature demonstration section (visitors cannot "see" the product).
- No dedicated trust / fair-hiring transparency section.
- No employer mid-page conversion band beyond the role card.
- No scroll-reveal animations (elements appear on page load, no progressive reveal).
- Hero proof chips missing (only one badge; no scannable feature labels).
- "How it works" section repeated information already in journey sections.

## Assets confirmed available

All assets referenced in the component exist under `src/assets/brand/gethired-wow/`:
- `portal-gradient-mesh.svg`
- `candidate-profile-card.svg`
- `video-answer-orb.svg`
- `match-signal-rings.svg`
- `hiring-pipeline-lines.svg`
- `gethired-connection-bridge.svg`

Role card icons exist under `src/assets/images/placeholder/icons/`.

## What was preserved

All existing sections were preserved verbatim. Three new sections were added, one redundant section removed. No auth flows, portal routes, recruiter/admin panels, MATCH, video, or payment features were touched.
