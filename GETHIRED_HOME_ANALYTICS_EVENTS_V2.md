# GETHIRED_HOME_ANALYTICS_EVENTS_V2
> Full analytics event catalog for the homepage (V2)

## All events (existing + new)

| Event name | Trigger | Payload |
|-----------|---------|---------|
| `usp_section_viewed` | USP section enters viewport | `{ page: 'home' }` |
| `product_preview_section_viewed` | **[NEW]** Product preview section enters viewport | `{ page: 'home' }` |
| `product_preview_tab_clicked` | **[NEW]** Any preview tab button clicked | `{ tab, page: 'home' }` |
| `trust_safety_section_viewed` | **[NEW]** Trust & Safety enters viewport | `{ page: 'home' }` |
| `employer_conversion_band_viewed` | **[NEW]** Employer band enters viewport | `{ page: 'home' }` |
| `talent_proof_viewed` | TalentProofBadge rendered | `{ placement, metricVerified }` |
| `talent_proof_cta_clicked` | Badge CTA clicked (if any) | `{ placement, ctaText }` |

## Events NOT implemented (intentional)

| Event | Reason not implemented |
|-------|----------------------|
| `hero_find_jobs_clicked` | Navigation handled by router; events not added to preserve simplicity |
| `hero_start_hiring_clicked` | Same as above |
| `final_cta_find_jobs_clicked` | Same as above |
| `hero_sign_in_clicked` | Same as above |
| Scroll depth events | No scroll percentage tracking; viewport events cover intent |

## Method source

All new methods added to `PublicPortalAnalyticsService` at the end of the file:
- `trackProductPreviewSectionViewed(page: string)`
- `trackProductPreviewTabClicked(tab: string, page: string)`
- `trackTrustSafetySectionViewed(page: string)`
- `trackEmployerConversionBandViewed(page: string)`
- `trackHeroCTAClicked(cta, page)` — wired, available for future callers
- `trackFinalCTAClicked(cta, page)` — wired, available for future callers

## Implementation status

All analytics calls are safe no-ops until an analytics SDK is wired into the `track()` private method. The service's architecture (single `track()` entry point) means SDK integration requires editing one line.
