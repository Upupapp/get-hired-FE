# GETHIRED MOBILEVIEW — Final Audit Report V4
**Scope:** Recent deployment — commit e817e2e (homepage V2, 2026-06-26)
**Files read:** `main-portal.component.scss`, `main-portal.component.html`, `shared/_portal-common.scss`

---

## 1. Breakpoint Coverage Assessment

### 992px (desktop → tablet)
Sections that change at this breakpoint:
- **Hero split layout** (`.portal-hero-inner--split`): `grid-template-columns: 1.1fr 0.9fr` → `1fr`; `text-align` becomes `center` (line 129–132 SCSS)
- **Hero CTA group** (`.portal-hero-cta-group`): `justify-content: center` at ≤991px (line 147–149)
- **Hero proof** (`.portal-hero-proof`): becomes `display: flex; justify-content: center` (line 169–172)
- **Hero secondary text** (`.portal-hero-secondary`): `text-align: center` (line 179–181)
- **Hero proof chips** (`.portal-hero-proof-chips`): `justify-content: center` (line 554–556)
- **Bento grid** (`.portal-bento-grid` in _portal-common.scss line 93): `repeat(4,1fr)` → `repeat(2,1fr)`
- **USP grid** (`.portal-usp-grid` in _portal-common.scss line 225): `repeat(4,1fr)` → `repeat(2,1fr)`
- **Trust grid** (`.portal-trust-grid` line 941–943): `repeat(4,1fr)` → `repeat(2,1fr)`

**Assessment:** 992px is well-covered. Hero centering, grid collapses, and chip alignment all transition cleanly.

### 768px (tablet → mobile)
- **Portal role grid** (`.portal-role-grid` line 16–18): `1fr 1fr` → `1fr`
- **Portal preview panel** (`.portal-preview-panel` line 651–654): `1fr 1fr` → `1fr`; gap 32px → 20px. Mock card stacks above info.
- **Portal preview inner** (`.portal-product-preview-inner` line 587–590): `padding: 48px 40px` → `padding: 32px 20px`; `border-radius: 24px` → `16px`
- **Employer band inner** (`.portal-employer-band-inner` line 994–997): same transition as preview inner
- **How-it-works grid** (`.portal-how-it-works-grid` line 424–426): `1fr 1fr` → `1fr`
- **Jobs grid** (`.portal-jobs-grid` in _portal-common.scss line 127–129): `repeat(3,1fr)` → `1fr`

**Assessment:** 768px handled comprehensively. All two-column grids collapse to single-column. Card-above-info stacking in preview panel is the correct mobile read order.

### 576px
- **Hero visual** (`.portal-hero-visual` line 196–198): `flex-direction: column` — mock cards stack vertically
- **Hero mock connector** (`.hero-mock-connector` line 311–314): rotates from vertical to horizontal dots when stacked
- **Hero** (`.portal-hero--upgraded` at line 484–487 MOBILEVIEW Pass 2 block): padding reduces to `48px 16px 40px`
- **Hero CTA group** (line 489–498): `flex-direction: column; align-items: stretch`; both `.btn-cta-primary` and `.btn-cta-outline` get `width: 100%; text-align: center; min-height: 44px`
- **Journey CTA** (line 500–512): same full-width treatment
- **Trust grid** (`.portal-trust-grid` line 945–947): `repeat(2,1fr)` → `1fr`
- **Bento grid** (`.portal-bento-grid` in _portal-common.scss line 97–99): `1fr`
- **USP grid** (`.portal-usp-grid` line 228–230): `1fr`
- **USP bridge** (`.portal-usp-bridge` line 211–213): `display: none` — hides decorative SVG that would crowd narrow screens
- **Employer band title** (`.portal-employer-band-title` line 1007–1009): `26px` → `22px`
- **Quick search** (`.portal-quick-search` in _portal-common.scss line 152–154): `flex-direction: column`
- **Portal hero title** (`.portal-hero-title` in _portal-common.scss line 25–27): `34px` → `24px`

**Assessment:** 576px is the most treatment-dense breakpoint. All grids collapse to 1-column. Full-width CTA buttons apply. Hero mock cards stack vertically.

### 375px (iPhone SE)
No dedicated 375px breakpoint exists in the SCSS. The 576px rules already apply. Key considerations:
- **Container padding:** `.portal-hero--upgraded` at <576px: `padding: 48px 16px 40px` — 16px side padding leaves 375-32=343px usable content width. Sufficient.
- **Portal sections** (`.portal-product-preview`, `.portal-trust-safety`, `.portal-employer-band`): all use `padding: 0 24px` on the outer wrapper + inner padding of `32px 20px` at <768px. On a 375px screen: 375-(2×24)=327px for the inner container, then 20px more padding inside = 287px of real text space. This is tight but workable for 13-14px text.
- **No fixed widths detected** in the new sections that would cause overflow. All cards use percentage or `1fr` sizing. The `.hero-mock-card` has `width: 180px` (line 207) but at <575px the hero visual stacks vertically (`flex-direction: column`), and the cards share the full column width via flex — the 180px is `flex-shrink: 0` which could be a problem. See overflow section below.
- **Preview mock card** (`.preview-mock-card` line 659): no fixed width, fills grid cell. Safe.

---

## 2. Touch Target Assessment

### Product Preview tab buttons (`.portal-preview-tab`)
- Defined at line 609–639 SCSS
- `min-height: 38px` (line 620)
- `padding: 8px 16px` (line 613)
- **BELOW iOS guideline:** iOS HIG recommends 44px minimum touch target. This is 6px short.
- No `:active` style defined for the tab buttons. Hover state changes color/border (lines 622–626), but tap users on mobile get no active feedback.
- **Gap documented:** Tab button 38px touch target. Keyboard arrow-nav also absent (documented in GETHIRED_HOME_KNOWN_GAPS.md).

### Primary CTA buttons (`.btn-cta-primary`)
- Defined in `_portal-common.scss` lines 161–184
- `padding: 12px 24px` (line 172), `min-height: 44px` (line 173)
- **PASS — meets 44px guideline.**
- At <575px, `.portal-hero-cta-group .btn-cta-primary` gets `width: 100%; min-height: 44px` confirmed (SCSS line 495–498).
- `display: inline-flex; align-items: center; justify-content: center` ensures the full area is tappable.

### Outline CTA buttons (`.btn-cta-outline`)
- Defined at lines 152–164 SCSS
- `padding: 10px 22px` — with a typical text line-height of ~20px, total height is approximately 10+20+10=40px. No explicit `min-height` defined for the base class.
- At <575px the MOBILEVIEW Pass 2 block adds `min-height: 44px` (line 496).
- **Desktop gap:** at >575px, `.btn-cta-outline` has no `min-height` and sits at ~40px. This is a minor gap — on desktop/tablet this is acceptable, but worth noting.

### Link CTA buttons (`.btn-link-cta`)
- Defined in `_portal-common.scss` lines 41–62
- `padding: 12px 8px; min-height: 44px` (lines 54–55) — explicitly set to ≥44px.
- **PASS.**

### Hero proof chips (`.portal-hero-chip`)
- Rendered as `<span>` elements via `*ngFor` (HTML line 25)
- Non-interactive — no click handler, role="button", or tabindex. Purely decorative/informational.
- **No touch target concern.** Correct use of `<span>`.

### `.portal-trust-strip` chips (`.portal-trust-chip`)
- Also `<span>` elements (HTML lines 103–106). Non-interactive.
- **No touch target concern.**

---

## 3. Content Overflow Check

### Mock card content at 375px
- Hero mock cards have `width: 180px; flex-shrink: 0` (lines 206–207). At <575px the hero visual switches to `flex-direction: column`. In column flex, `flex-shrink` applies along the cross-axis (width direction is the cross-axis), so each card tries to occupy 180px wide. At 375px with 16px side padding, the content column is 375-32=343px. A 180px card in a flex column context will NOT overflow — it is narrower than the available column. However, it will not stretch to fill the full width, appearing narrowly centered. This is acceptable visually.
- **VERDICT:** No overflow at 375px for hero mock cards. Minor visual: cards appear narrower than the column rather than full-width.

### Preview panel mock cards at 375px
- `.preview-mock-card` has no fixed width; fills 100% of the grid cell which at <768px is the full column.
- With 24px outer padding + 20px inner padding per side: usable width = 375-(2×24)-(2×20)=287px.
- Content inside: `.preview-skills` uses `flex-wrap: wrap` (line 703-707) — chips wrap gracefully.
- `.preview-meta-row` uses `display: flex; gap: 14px` with two short items ("CV uploaded", "Video answer") — at 287px both fit on one line.
- `.preview-job-row` uses `display: flex; justify-content: space-between` — job titles like "Marketing Coordinator" + badge "3 new" should fit within 287px at 13px font.
- **VERDICT:** No overflow expected. Flex-wrap is present on all multi-item rows.

### Tab button label length — "Compatibility signals"
- Five tabs. Labels: "Job seeker profile", "Employer dashboard", "Application tracking", "Video answers", "Compatibility signals"
- Tab row uses `flex-wrap: wrap; justify-content: center` (lines 601–606). At mobile widths all tabs will wrap to multiple rows, which is the intended behavior.
- "Compatibility signals" at 13px font is approximately 145px wide (13px × ~11 chars). Will fit on one tab button at 38px height with `padding: 8px 16px`.
- **VERDICT:** All labels wrap gracefully. No single label overflows.

### Trust card headings at 375px
- "Guidance, not automatic decisions" — 13 words. At 287px usable width, 14px font, `line-height: 1.35` wraps to 2-3 lines. Acceptable.
- "Video answers reviewed by real people" — similar wrap behavior.
- **VERDICT:** Long headings wrap safely at 375px; no overflow.

### Employer band heading at 375px
- "Ready to hire in the Philippines?" at `font-size: 22px` (after <575px rule, line 1008).
- At 287px usable width: "Ready to hire in" fits line 1, "the Philippines?" line 2. Clean wrap.
- **VERDICT:** Heading wraps safely at two lines.

---

## 4. Scroll Experience on Mobile

### Product Preview card padding
- Desktop: `padding: 48px 40px` — generous breathing room.
- Mobile (<768px): `padding: 32px 20px` — adequate. 32px top/bottom provides clear section separation. 20px sides leaves sufficient reading space.
- **VERDICT:** Padding transition is appropriate.

### Preview panel stacking order
- At <768px: `grid-template-columns: 1fr` with natural DOM order. In HTML, the mock card comes before `preview-panel-info` (HTML lines 213–245 for seeker tab). So the stack is: mock card on top, descriptive text + CTA below.
- This is the correct read order: visual illustration first, then explanation + action.
- **VERDICT:** Stacking order is semantically correct and scroll-appropriate.

### Trust grid at 1-column
- Four trust cards at full width, single column at <576px.
- Each card `padding: 24px 20px; text-align: center`. At 375px content width ~327px (24px outer padding per side).
- Four cards scroll vertically. Adequate visual separation via padding and white background.
- **VERDICT:** Readable at 375px. Vertical scroll through 4 cards is expected and acceptable.

### Journey steps list
- `.portal-journey-steps` uses `grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))`.
- At 375px with 24px outer padding: 375-48=327px available. `minmax(180px,1fr)` fits exactly 1 column at 327px (floor(327/180)=1). Steps render as single column.
- No explicit breakpoint needed — auto-fit handles it.
- **VERDICT:** Journey steps adapt correctly without extra media query.

---

## 5. Scroll Reveal on Mobile

### Threshold and behavior
- `appPortalReveal` directive uses IntersectionObserver (referenced in component). Threshold presumably 10% based on command brief.
- At 10% threshold on a 667px-tall iPhone 14: an element needs to show just 66px before triggering. Appropriate — sections reveal quickly after scroll starts, no delay waiting for full element visibility.
- Initial state: `opacity: 0; transform: translateY(16px)` (SCSS lines 528–532).
- Transition: `opacity 500ms; transform 500ms` with ease-out cubic-bezier.

### iOS Safari compatibility
- IntersectionObserver: supported in iOS Safari 12.1+ (2019). Acceptable baseline.
- CSS `transition` with `cubic-bezier`: fully supported.
- **VERDICT:** No compatibility issue on current iOS versions.

### First-load blank flash
- Sections with `portal-reveal-section` start at `opacity: 0`. On very slow connections where JS (Angular bundle) is delayed, these sections are invisible until the directive initializes the observer. On first meaningful paint before JS hydration, users on slow 3G may see blank spaces where sections will appear.
- The `prefers-reduced-motion: reduce` branch sets `opacity: 1; transform: none; transition: none` immediately (SCSS lines 539–543), so users with reduced-motion preferences never see the blank state.
- **VERDICT:** Known limitation on very slow connections only. Not a regression from the prior state. Documented.

### Reduced-motion
- Two separate `prefers-reduced-motion: reduce` rules:
  1. Hero animations (lines 516–524): `animation: none; opacity: 1; transform: none`
  2. `portal-reveal-section` (lines 539–543): `opacity: 1; transform: none; transition: none`
- **FULLY COVERED.** Both entry animations disabled. No jank for users with vestibular/motion sensitivity settings.

---

## 6. Accessibility on Mobile

### Tab button active/focus states
- `.portal-preview-tab:focus-visible`: `outline: 2px solid $color-global-red-buttons; outline-offset: 2px` (lines 628–631). Keyboard focus indicator present.
- `.portal-preview-tab.active`: filled background, white text, box-shadow (lines 633–638). Selected state is visually distinct.
- No `:active` (press) state defined. Touch users see no visual feedback during the tap gesture.
- **Gap:** Missing `:active` style on `.portal-preview-tab`. Low-severity — the tab switches panels on release, which provides implicit feedback, but an `:active` state would make interaction feel more responsive.

### ARIA on tabs
- `role="tablist"` on container (HTML line 179). Each button has `role="tab"`, `[attr.aria-selected]`, `id`, `aria-controls` (HTML lines 181–204). Tabpanel has `role="tabpanel"`, `[id]`, `[attr.aria-labelledby]` (HTML lines 207–208).
- **Correct ARIA pattern.** Screen reader / switch-access users can identify the tab structure.
- Arrow key navigation missing (no keydown handler for ArrowLeft/ArrowRight). **Known gap — documented in GETHIRED_HOME_KNOWN_GAPS.md.**

### CTA reachability without pinch-zoom
- All primary CTAs are `min-height: 44px` with full-width behavior at <575px.
- No fixed-size containers that clip buttons.
- The viewport meta tag (not in these files, assumed standard `width=device-width, initial-scale=1`) would prevent pinch-zoom requirement.
- **VERDICT:** CTAs are reachable without pinch-zoom, assuming correct viewport meta.

### Decorative elements
- Hero glow orbs: `aria-hidden="true"` (HTML lines 3–4). Correct.
- Hero mesh SVG: `alt=""` and `aria-hidden="true"` (HTML line 2). Correct.
- Hero mock cards: `aria-hidden="true"` (HTML line 35). Correct — illustrative only.
- Trust emoji: `aria-hidden="true"` (HTML lines 380, 385, 390, 395). Correct.
- Video play button: `aria-hidden="true"` (HTML line 327). Correct.

---

## 7. Known Gaps Summary

| Gap | Severity | Location | Status |
|-----|----------|----------|--------|
| Tab button `min-height: 38px` (below iOS 44px guideline) | Medium | `.portal-preview-tab` SCSS line 620 | Documented in ACTIONS backlog |
| No `:active` press state on `.portal-preview-tab` | Low | SCSS lines 609–639 | Not previously documented |
| Arrow key navigation missing on tab set | Medium | HTML lines 179–205 | Documented in GETHIRED_HOME_KNOWN_GAPS.md |
| `.btn-cta-outline` no `min-height` at >575px (~40px tall) | Low | SCSS lines 152–164 | Desktop/tablet only; acceptable |
| Scroll-reveal blank flash on very slow connections | Low | `.portal-reveal-section` | Known limitation; reduced-motion path unaffected |
| Hero mock cards `width: 180px; flex-shrink: 0` at <575px | Info | SCSS lines 206–207 | Cards appear narrower than column — no overflow, cosmetic only |

---

## 8. New Finding: Missing `:active` Style on Tab Buttons

**File:** `C:\Users\paulg\OneDrive\Desktop\Gethired\get-hired-FE\src\app\public\main-portal\main-portal.component.scss`
**Lines:** 609–639 (`.portal-preview-tab` ruleset)

The tab button has `:hover` and `:focus-visible` states but no `:active` state. On mobile touch devices, `:hover` does not fire reliably and `:focus-visible` only applies after keyboard input. This means a touch user tapping a tab sees no visual feedback during the press gesture. The recommended fix is:

```scss
&:active {
  background: rgba(254, 111, 97, 0.08);
}
```

This is a safe, additive CSS fix. No layout impact. Logged as a low-severity gap.
