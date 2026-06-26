# GETHIRED_HOME_TALENT_PROOF_INTEGRATION
> TalentProofService integration for GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## Source of truth

`TalentProofService` (shared service, `providedIn: 'root'`) is the single authoritative source for the 500,000+ registered job seekers claim.

Key values:
- `registeredJobSeekersLabel: '500,000+'`
- `verificationStatus: 'owner_confirmed'`
- Confirmed by Paul Gemar Espinas, Founder/CEO

## Badge placements on homepage (V2)

| Placement ID | Location | Variant |
|-------------|---------|---------|
| `main_portal_hero` | Hero section | `pill` |
| `main_portal_role_card` | Role selector trust strip | `pill` |
| `main_portal_role_card` | Employer journey proof line | `strip` |
| `employer_portal_hero` | Employer conversion band | `strip` |

The employer conversion band adds a fourth placement that did not exist before. Placement ID `employer_portal_hero` was already registered in the employer portal page; reusing it for the homepage employer band is semantically correct.

## Rules enforced

1. The raw count is never hardcoded in any template or component — always rendered via `app-talent-proof-badge`
2. If `TalentProofService` data changes, all 4 placements update automatically
3. No fake or estimated counts appear anywhere outside the badge component
4. Badge component handles its own accessible output (screen reader reads the stat naturally)

## Analytics from badge (existing, unchanged)

The badge component itself calls `PublicPortalAnalyticsService.trackTalentProofViewed(placement, metricVerified)` on render. The homepage V2 adds a fourth fire on `employer_portal_hero` placement render.
