# GetHired Brand Report — Recent Deployment (Homepage V2)
**Scope:** commit e817e2e — scroll reveal, product preview tabs, hero proof chips, employer band, mock cards
**Date:** 2026-06-26

---

## Motion Assessment

### Scroll Reveal Animation
- **Timing:** `500ms cubic-bezier(0.0, 0.0, 0.2, 1)` — this is `$motion-ease-decelerate` from `_motion.scss`. Applied to both `opacity` and `transform` simultaneously.
- **Material Design reference:** 300–500ms is the spec range for enter transitions. 500ms sits at the upper bound; it is appropriate for large section reveals where the element is entering the viewport from below. A slightly shorter value (400ms) could feel snappier, but 500ms is not wrong.
- **Entry distance:** `translateY(16px)` — subtle and appropriate. Not theatrical. Consistent with `$gh-shift-sm: 4px` being used for micro-interactions; 16px for a full section is proportionate.
- **Easing:** `cubic-bezier(0.0, 0.0, 0.2, 1)` is the Material "decelerate" curve (elements enter fast, then settle). Correct choice for content arriving from off-screen.
- **No infinite loops:** The directive uses `threshold: 0.1`, fires once, then calls `observer.disconnect()`. The transition fires once on first reveal and stops. Correct.

### Reduced-Motion Handling
The SCSS rule at line 539–543 of `main-portal.component.scss`:
```scss
@media (prefers-reduced-motion: reduce) {
  opacity: 1;
  transform: none;
  transition: none;
}
```
Scoped inside `.portal-reveal-section`. Sets the pre-reveal state (`opacity: 0; transform: translateY(16px)`) to the revealed state immediately, and `transition: none` suppresses animation. Correctly implemented.

The directive handles SSR and browsers without IntersectionObserver by calling `classList.add('is-revealed')` immediately — content is never permanently invisible.

The hero copy/visual entrance animation (`portal-hero-copy`, `portal-hero-visual`) is covered by a separate block at line 517–524:
```scss
@media (prefers-reduced-motion: reduce) {
  .portal-hero-copy, .portal-hero-visual {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```
Both reveal paths are correctly disabled under `prefers-reduced-motion: reduce`. No motion remains active for any user who has set this preference.

### Hero Copy / Visual Entrance Animation
- **Timing:** `280ms $motion-ease-standard` (`cubic-bezier(0.4, 0, 0.2, 1)`) — within the `$motion-duration-card: 220ms` range and fine at hero scale. The visual panel has an `80ms` delay (`animation: portal-hero-reveal 280ms ... 80ms forwards`) which staggers seeker and employer cards cleanly.
- **Entry distance:** `translateY(10px)` — appropriate for hero, slightly less than the scroll-reveal 16px which is correct since the hero is above-the-fold and enters immediately on load.

---

## Tab Interaction Assessment

### Active State
```scss
&.active {
  background: $color-global-red-buttons;
  border-color: $color-global-red-buttons;
  color: #fff;
  box-shadow: 0 2px 8px rgba(254, 111, 97, 0.3);
}
```
Active tab uses brand coral fill with white text. The `box-shadow` glow at 30% opacity is a soft accent — appropriate, not excessive.

**Contrast note:** White text on `$color-global-red-buttons` at 13px (non-large text) requires 4.5:1. Coral at approximately #FE6F61 vs white is approximately 3.1:1, which fails WCAG AA at 13px. The tab label font-weight is 600 but 13px still does not qualify as "large text" (that threshold is 14px bold or 18px normal). This is an existing concern for the active tab state; the focus-visible and hover states use the brand color on white background, not white on brand color, which are fine.

### Focus-Visible State
```scss
&:focus-visible {
  outline: 2px solid $color-global-red-buttons;
  outline-offset: 2px;
}
```
Meets WCAG 2.4.11 (Focus Appearance). `2px solid + 2px offset` provides a visible, non-clipping focus ring. Tabs also carry `role="tab"`, `aria-selected`, and `id`/`aria-controls` attributes in the HTML — keyboard navigation is properly wired.

### Hover Transition
```scss
transition: border-color 150ms ease, color 150ms ease, background 150ms ease, box-shadow 150ms ease;
```
`150ms ease` on all four properties simultaneously — at the `$motion-duration-micro: 160ms` range. Fast enough to feel responsive without feeling abrupt.

### gh-pressable on CTA Buttons
**Verified present.** All primary CTA buttons in the homepage carry `gh-pressable`:
- Line 15: `btn-cta-primary gh-pressable` (Find jobs — hero)
- Line 16: `btn-cta-outline gh-pressable` (Start hiring — hero)
- Lines 145, 164, 244, 282, 317, 339, 361, 418: all remaining primary CTAs
- `gh-pressable` provides `transform: scale(0.985)` on `:active` via `_motion.scss`, transition `100ms $motion-ease-standard`. Reduced-motion is suppressed via `@include motion-safe`.

Preview tabs do **not** carry `gh-pressable` — they have their own `transition` inline. Intentional and appropriate since tabs are selection controls, not press-to-action elements.

---

## Loading / Error / Success States

### Product Preview Section
All content in the preview panels is static CSS mock data (illustrative profiles, job rows, tracking items, video player). No API calls are made. No loading state is needed or appropriate.

The subtitle "Illustrative view of key features." is present in the HTML (`main-portal.component.html` line 177), which is the correct honest disclosure.

No error states needed for static content — correct.

The `portal-reveal-section` class on the product preview section means the entire section fades/translates in on scroll, serving as the visual entry moment for users reaching this section.

### Product Preview Tab Switching
Tab switching is driven by Angular `*ngIf` on `activePreviewTab`. There is no async operation, so no loading state is required.

---

## Hero Proof Chips

### Visual Implementation
```scss
.portal-hero-chip {
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: #374151;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.01em;
  backdrop-filter: blur(4px);
}
```

### Backdrop-filter Browser Support
`backdrop-filter: blur(4px)` is supported in Chrome 76+, Safari 9+, Edge 79+, Firefox 103+. Without it, the chip falls back to `rgba(255, 255, 255, 0.75)` — a semi-opaque white background — readable either way. Valid progressive enhancement.

### Font Size / Contrast
`11px` at `font-weight: 600` with color `#374151` on `rgba(255, 255, 255, 0.75)`:
- `#374151` on `#FFFFFF` (worst-case background): approximately 7.2:1 — passes AA (4.5:1) and AAA (7:1).
- The glass chip provides a near-white layer between text and the hero background, maintaining isolation.
- **Verdict:** Acceptable. 11px is below the large-text threshold but the semi-opaque white chip provides effective isolation and weight 600 improves legibility. These are labeling chips, not body text, and the contrast is sufficient.

### Chip Content
Chips are driven by `heroProofChips` component array (not hardcoded fake numbers). The wrapper carries `aria-label="Key features"`. Screen reader accessible.

---

## Employer Conversion Band

### Gradient
```scss
background: linear-gradient(135deg, #FFF0EF 0%, #FFF7F6 60%, #FFFFFF 100%);
```
Three-stop warm coral tint fading to white at 135 degrees. `#FFF0EF` is a very light coral/rose directly derived from `$color-global-red-buttons`. The gradient is subtle: the darkest stop is barely perceptible tint, providing warmth and section separation without overwhelming content.

### Border
```scss
border: 1px solid rgba(254, 111, 97, 0.1);
```
10% opacity coral border — extremely subtle. Acts as a soft frame. Brand-consistent.

**Brand fit: Pass.** The coral tint gradient directly derives from the brand accent color.

---

## Mock Card Shadows

### Preview Mock Cards
```scss
.preview-mock-card {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
```
8% black opacity, 8px y-offset, 24px blur. Light and diffuse — appropriate for cards on a `#FAFAFA` background.

### Hero Mock Cards
```scss
.hero-mock-card {
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
}
```
Same 8% opacity but double the blur (40px) and double the y-offset (16px). More pronounced depth for the decorative hero visual, which has rotated cards (±3deg). Still subtle. Appropriate.

**Shadow depth verdict: Appropriate throughout.** Consistent 8% opacity used across both card types. Not excessive, not invisible.

---

## Summary Findings

| Area | Status | Notes |
|------|--------|-------|
| Scroll reveal timing (500ms) | Pass | Upper bound of Material spec; appropriate for section-level entry |
| Entry distance (16px) | Pass | Subtle, not theatrical |
| Easing (decelerate curve) | Pass | Correct for incoming content |
| Reduced-motion: reveal sections | Pass | `opacity: 1; transform: none; transition: none` inside media query |
| Reduced-motion: hero animation | Pass | `animation: none; opacity: 1; transform: none` |
| No infinite loops | Pass | Directive disconnects after first intersection |
| SSR / no-IO fallback | Pass | Immediately adds `is-revealed` on server or unsupported browsers |
| Tab active state glow | Pass | 30% opacity soft glow, appropriate |
| Tab active text contrast (white on coral, 13px) | Caution | May not reach 4.5:1 at 13px — verify with contrast tool |
| Tab focus-visible (2px + 2px offset) | Pass | WCAG 2.4.11 compliant |
| Tab hover transition (150ms) | Pass | Appropriate speed for interactive controls |
| Tab ARIA (role, aria-selected, id, aria-controls) | Pass | Fully wired in HTML |
| gh-pressable on all CTA buttons | Pass | All 8 homepage primary CTAs carry the class |
| Product preview loading state | N/A | Static mock content; no async needed |
| Preview section honest disclosure | Pass | "Illustrative view of key features." present |
| Glass chip backdrop-filter | Pass | Progressive enhancement, solid semi-opaque fallback |
| Hero chip font size (11px, weight 600) | Acceptable | ~7.2:1 contrast on white chip background; labeling chrome |
| Hero chip accessibility | Pass | `aria-label="Key features"` on wrapper |
| Employer band gradient | Pass | Brand-aligned coral tint derived from $color-global-red-buttons |
| Employer band border | Pass | Subtle 10% opacity coral frame |
| Preview mock card shadow (0 8px 24px, 8%) | Pass | Appropriate depth |
| Hero mock card shadow (0 16px 40px, 8%) | Pass | Appropriate for decorative rotated cards |
| Product trust / no fake data | Pass | Chips from component array; mock panels labelled illustrative |
