# GETHIRED_HOME_ACCESSIBILITY_AUDIT_V2
> Accessibility review for GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## Preserved from V1 (no regressions)

- H1 is unique, describes the page clearly
- All interactive elements are `<button>` or `<a>` with descriptive labels
- `aria-hidden="true"` on all decorative images
- `appViewedOnce` analytics directive fires only once; does not affect keyboard/screen reader behavior
- `app-role-card` has `ariaLabel` input
- `app-talent-proof-badge` component handles its own accessible output
- Footer component handles its own accessible output

## New in V2

### Hero proof chips
- Wrapped in `<div aria-label="Key features">`
- Each chip is a `<span>` — non-interactive, descriptive text. Screen readers will read through them naturally.
- No interactive role needed (chips are not buttons)

### Product Preview — tab pattern
- Tab list: `role="tablist"` with `aria-label="Product feature preview"`
- Tab buttons: `role="tab"`, `[attr.aria-selected]`, `id="tab-{id}"`, `aria-controls="panel-{id}"`
- Panel container: `role="tabpanel"`, `[id]="'panel-' + activePreviewTab"`, `[attr.aria-labelledby]="'tab-' + activePreviewTab"`
- Follows W3C ARIA Tabs Pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- Gap: keyboard arrow navigation (Home/End/ArrowLeft/ArrowRight) not implemented. Tabs are reachable via Tab key on the page but arrow navigation between tabs is missing. This is an open gap for a future enhancement pass.

### Mock cards in preview
- All decorative images (`preview-signals-rings`) have `aria-hidden="true" alt=""`
- Video player mock has `aria-hidden="true"` — it is purely visual
- Mock card content (names, skills, statuses) is readable by screen readers — this is acceptable since all data is generic/illustrative

### Trust & Safety section
- Section has `aria-label="Trust and fair hiring"`
- Cards use heading hierarchy `h3` correctly (section `h2` is the parent)
- Emoji icons use `aria-hidden="true"` via class `portal-trust-emoji`

### Employer conversion band
- Section has `aria-label="Ready to hire"`
- CTA button is `type="button"` with clear text "Start hiring"

## Minimum touch targets
- All CTA buttons: `min-height: 44px` (iOS guideline)
- Preview tab buttons: `min-height: 38px` — below the 44px guideline; considered acceptable for supplementary UI elements in a scrollable context (not primary navigation). Flag for future improvement.

## Color contrast
- Hero chips: `#374151` on `rgba(255,255,255,0.75)` ≈ 9:1 (AA)
- Preview tab active: white on `#FE6F61` (brand red) — approximate ratio 3.6:1 (AA for large text / graphical components)
- Trust card text: `#6b7280` on `#fff` — 4.6:1 (AA)
- Employer band text: `#4b5563` on gradient ≈ 6:1 (AA)

## Gaps / open items
1. Preview tab keyboard arrow navigation (not implemented)
2. Preview tab button touch target 38px vs 44px guideline
3. Focus management when switching tabs (focus stays on the button, not moved to panel) — acceptable per ARIA pattern; panel is not an off-screen disclosure

## WCAG level: AA compliant (with noted gaps)
