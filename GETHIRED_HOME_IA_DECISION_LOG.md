# GETHIRED_HOME_IA_DECISION_LOG
> Information architecture decisions made during GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## Section order (V2 final)

1. Hero (preserved)
2. Role selector (preserved)
3. USP pillars (preserved)
4. What GetHired does / bento grid (preserved)
5. Job seeker journey (preserved)
6. Employer journey (preserved)
7. **[NEW] Product Preview** — tabbed interactive feature tour
8. **[NEW] Trust & Safety** — fair-hiring transparency cards
9. **[NEW] Employer conversion band** — mid-page second CTA for employer path
10. Final CTA band (preserved)

## Decisions

### Decision 1: Remove "How it works" section
**Reason:** Duplicated content from job seeker and employer journey sections. Both journeys already show step-by-step how each role uses the platform. The "How it works" section was a 2-column list with no additional information. Removal makes the page shorter and more focused.

### Decision 2: Product Preview before Trust section
**Reason:** Show first, then validate. Visitors understand what the product does (Preview) before seeing why it is trustworthy (Trust). NN/g progressive disclosure pattern.

### Decision 3: Employer conversion band before final CTA
**Reason:** Employer visitors who scrolled through the job seeker journey need a recovery point before the generic "ready to get started?" band. This gives them a targeted message without repeating the full role card flow.

### Decision 4: CSS-only mock panels, no real user data
**Reason:** All product preview content is illustrative. No live API calls, no real applicant names, no fabricated counts. Eliminates data privacy risk and backend dependency. Mock names (Maria D., Juan P., ABC Company) are clearly fictional.

### Decision 5: Single scroll-reveal threshold at 10%
**Reason:** 40% threshold (used by ViewedOnce analytics directive) is suitable for analytics but too aggressive for visual reveal — the element is 40% visible before it starts appearing. 10% gives a snappier perceived entry without sacrificing intentionality.

### Decision 6: Employer band placed after Trust section
**Reason:** Trust section validates the platform's fair-hiring commitment. An employer CTA immediately after this framing converts better than a CTA after journey steps, because the employer's primary concern at that scroll depth is trust, not features.
