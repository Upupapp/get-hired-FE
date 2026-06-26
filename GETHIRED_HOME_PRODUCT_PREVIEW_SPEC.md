# GETHIRED_HOME_PRODUCT_PREVIEW_SPEC
> Product Preview section specification for GETHIRED_HOME_INFORMATION_PORTAL_REDESIGN_RESEARCH_EXPANDED_V2

## Purpose
Show visitors what the product looks like before asking them to register. Reduces "I don't know what I'm signing up for" drop-off. CSS-only mocks avoid backend dependency, real user data exposure, and API error states on a marketing page.

## Tab structure
5 tabs, default: "Job seeker profile"

| Tab ID | Label | Mock content | CTA |
|--------|-------|-------------|-----|
| `seeker` | Job seeker profile | Profile card with avatar, skills chips, CV/video indicators, completeness bar | Build your profile |
| `employer` | Employer dashboard | Company header, job list with applicant count badges | Start hiring |
| `tracking` | Application tracking | Status timeline with 3 applications in different states | Find jobs |
| `video` | Video answers | Video player mock with question prompt and duration | See job seeker features |
| `signals` | Compatibility signals | match-signal-rings.svg with guidance disclaimers | See employer features |

## Component state
- `activePreviewTab: string` — initialized to `'seeker'`
- `setPreviewTab(tab: string)` — sets tab, fires `trackProductPreviewTabClicked(tab, 'home')`

## Accessibility
- Tab list: `role="tablist"` with `aria-label="Product feature preview"`
- Tab buttons: `role="tab"`, `[attr.aria-selected]`, `id="tab-{tabId}"`, `aria-controls="panel-{tabId}"`
- Panel: `role="tabpanel"`, `[id]="'panel-' + activePreviewTab"`, `[attr.aria-labelledby]`
- All mock visuals inside cards are purely decorative; no `aria-hidden` needed on the card but individual decorative images carry `aria-hidden="true" alt=""`
- Focus management: tab buttons are `<button>` elements and receive natural focus; panel content is tabbable
- Minimum touch target: all tab buttons have `min-height: 38px`

## Responsive
- Preview panel: `grid-template-columns: 1fr 1fr` at 768px+, stacks to `1fr` on mobile
- Mock card stacks above panel info on mobile
- Tab buttons wrap naturally at small viewports

## Illustrative data disclaimer
The subtitle "Illustrative view of key features." is rendered visually to inform visitors that the preview content is not live data. All mock names, companies, and counts are generic and cannot be mistaken for real user profiles.

## Analytics events
- Section viewed: `product_preview_section_viewed { page: 'home' }` — via `(revealed)` from `PortalRevealDirective`
- Tab clicked: `product_preview_tab_clicked { tab, page: 'home' }` — on each `setPreviewTab()` call
