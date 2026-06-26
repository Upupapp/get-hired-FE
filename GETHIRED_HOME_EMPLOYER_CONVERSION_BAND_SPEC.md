# GETHIRED_HOME_EMPLOYER_CONVERSION_BAND_SPEC
> Employer conversion band specification for GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## Problem solved
A visitor who identifies as an employer and scrolls through the page encounters:
1. Role selector → picks "I'm hiring" → goes to /employers (conversion)
2. OR continues scrolling to see all sections
3. After the employer journey steps (bottom of that section), there was previously no second chance for an employer CTA before the generic "Ready to get started?" band

The employer conversion band adds a warm, employer-targeted mid-page entry point for visitors who scrolled through the seeker journey and trust sections.

## Design
- Background: soft warm gradient (#FFF0EF → #FFF7F6 → #FFFFFF) — matches brand's coral/red accent direction without being aggressive
- Border: 1px rgba(254, 111, 97, 0.1) — subtle brand color accent
- Border radius: 24px
- Text alignment: centered
- Includes TalentProofBadge in "strip" variant — provides social proof before the CTA

## Content
- **Heading:** Ready to hire in the Philippines?
- **Body:** Create your employer account, build your company page, and start managing applicants with GetHired.
- **TalentProofBadge:** placement `employer_portal_hero`, variant `strip`
- **CTA:** Start hiring → `goToEmployerPortal()`

## Analytics
- `employer_conversion_band_viewed { page: 'home' }` via `(revealed)` event

## Placement
- Between Trust & Safety section and Final CTA band
- Applies `portal-reveal-section` + `appPortalReveal` for scroll reveal (fade + slide up)
