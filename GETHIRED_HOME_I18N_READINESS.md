# GETHIRED_HOME_I18N_READINESS
> Internationalization readiness for GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## Current i18n state

The homepage component does not use `ngx-translate` or Angular's i18n pipes. All copy is hardcoded in the HTML template. This was the state before V2 and remains unchanged after V2.

## New sections: i18n status

All copy in the three new sections (Product Preview, Trust & Safety, Employer band) follows the same hardcoded pattern as the existing page. No new i18n debt is introduced beyond what already existed.

## Copy that is i18n-sensitive

### Date/time formats
None present on this page.

### Numbers
- Completion percentage `82%` in the mock profile card — this is illustrative UI only, not a real data value. Hardcoded as a CSS `style="width: 82%"` inline style. No i18n risk.

### Currency
None present.

### Filipino (Tagalog) considerations
- "Built for Philippine hiring" card acknowledges the local market
- No Tagalog copy currently; the product operates in English
- Copy is neutral enough that Tagalog interpolation would not require structural changes

## Migration path (if i18n is ever added)

1. Wrap all visible copy in `{{ 'KEY' | translate }}` pipes
2. Create `assets/i18n/en.json` key set
3. Template structure needs no changes — all copy is in `{{ interpolation }}` or attribute positions that accept pipe transforms

## Verdict: i18n-ready in structure, no new blockers introduced
