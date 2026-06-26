# GetHired Brand Implementation Log — Recent Deployment (Homepage V2)
**Scope:** commit e817e2e — scroll reveal, product preview tabs, hero proof chips, employer band, mock cards
**Date:** 2026-06-26

---

## Implementation Log

| ID | Effect | File | Lines | Approach | Reduced-motion handling | Accessibility | Risk |
|----|--------|------|-------|----------|------------------------|---------------|------|
| B-01 | Scroll reveal — section fade/rise on viewport entry | `main-portal.component.scss` | 528–544 | `.portal-reveal-section` starts `opacity: 0; transform: translateY(16px)`; `is-revealed` class transitions to `opacity: 1; transform: none` via `500ms cubic-bezier(0.0, 0.0, 0.2, 1)` on both props | `@media (prefers-reduced-motion: reduce)` inside `.portal-reveal-section` sets `opacity: 1; transform: none; transition: none` immediately — no animation fires | Class-based, no ARIA impact; `revealed` event emitter available for analytics | Low — one-shot, compositor-only properties |
| B-02 | Scroll reveal directive (IntersectionObserver) | `src/app/shared/directives/portal-reveal.directive.ts` | 1–65 | `PortalRevealDirective` (`[appPortalReveal]`) attaches IO at `threshold: 0.1`; on first intersection adds `is-revealed`, then disconnects; emits `(revealed)` EventEmitter | SSR guard: `isPlatformBrowser` + `typeof IntersectionObserver === 'undefined'` check adds `is-revealed` immediately on server or unsupported browsers — content never hidden | SSR-safe; `ngOnDestroy` cleans up observer | Low — fires once, self-cleans |
| B-03 | Scroll reveal applied — Product Preview section | `src/app/public/main-portal/main-portal.component.html` | 171–174 | `class="portal-product-preview portal-reveal-section" appPortalReveal (revealed)="onProductPreviewViewed()"` | Handled by B-01 CSS rule | `aria-label="See how GetHired works"` on the section | Low |
| B-04 | Scroll reveal applied — Trust & Safety section | `src/app/public/main-portal/main-portal.component.html` | 373 | `appPortalReveal` on `.portal-trust-safety.portal-reveal-section` | Handled by B-01 CSS rule | None required for section container | Low |
| B-05 | Scroll reveal applied — Employer Conversion Band | `src/app/public/main-portal/main-portal.component.html` | 405 | `appPortalReveal` on `.portal-employer-band.portal-reveal-section` | Handled by B-01 CSS rule | None required for section container | Low |
| B-06 | Product preview tabs — hover/active/focus states | `main-portal.component.scss` | 609–639 | `.portal-preview-tab` with `transition: border-color 150ms ease, color 150ms ease, background 150ms ease, box-shadow 150ms ease`; `:hover` changes border+color to `$color-global-red-buttons`; `.active` fills with `$color-global-red-buttons` + white text + `box-shadow: 0 2px 8px rgba(254, 111, 97, 0.3)`; `:focus-visible` uses `outline: 2px solid $color-global-red-buttons; outline-offset: 2px` | No infinite animation; transitions fire only on interaction | `role="tab"`, `aria-selected`, `id`, `aria-controls` wired in HTML; `min-height: 38px` provides near-WCAG touch target | Caution — active state white text on coral at 13px may not reach 4.5:1 contrast |
| B-07 | Hero proof chips — glass morphism style | `main-portal.component.scss` | 559–571 | `.portal-hero-chip` uses `background: rgba(255,255,255,0.75); border: 1px solid rgba(0,0,0,0.08); backdrop-filter: blur(4px); font-size: 11px; font-weight: 600` | No animation or transition on chips | Wrapper has `aria-label="Key features"`; chips rendered via `*ngFor` with `trackBy`; `aria-hidden` not needed (content is meaningful) | Low — purely visual; `backdrop-filter` degrades gracefully |
| B-08 | Hero entrance animation (copy side) | `main-portal.component.scss` | 136–139 | `.portal-hero-copy` starts `opacity: 0; transform: translateY(10px)`; `animation: portal-hero-reveal 280ms $motion-ease-standard forwards` | `@media (prefers-reduced-motion: reduce)` at line 517–524 sets `animation: none; opacity: 1; transform: none` | No ARIA impact; `aria-hidden` not used on copy | Low — compositor-only, fires once on load |
| B-09 | Hero entrance animation (visual side) | `main-portal.component.scss` | 186–198 | `.portal-hero-visual` same keyframe with `80ms` delay for stagger; `aria-hidden="true"` on the element | Covered by same reduced-motion block as B-08 | `aria-hidden="true"` correct — purely decorative mock cards | Low |
| B-10 | Hero glow orbs (CSS radial gradients) | `main-portal.component.scss` | 95–118 | `.portal-hero-glow--one/--two` use `filter: blur(60px)` with radial gradient coral/purple; `opacity: 0.35`; `pointer-events: none` | No animation on glows — static positioned elements, no transition | `aria-hidden="true"` on each glow element in HTML | Low — no interaction, no motion |
| B-11 | Hero mesh background image | `main-portal.component.scss` | 84–93 | `.portal-hero-mesh`: `position: absolute; opacity: 0.6; pointer-events: none`; loaded as `<img>` with `alt="" aria-hidden="true"` | No animation | `alt=""` + `aria-hidden="true"` — decorative image correctly marked | Low |
| B-12 | Employer band gradient background | `main-portal.component.scss` | 988–998 | `.portal-employer-band-inner`: `background: linear-gradient(135deg, #FFF0EF 0%, #FFF7F6 60%, #FFFFFF 100%)`; `border: 1px solid rgba(254, 111, 97, 0.1)` | No animation — static background | None required | Low — pure CSS gradient, no interaction |
| B-13 | Preview mock card elevated shadow | `main-portal.component.scss` | 659–665 | `.preview-mock-card`: `box-shadow: 0 8px 24px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.04)` | No animation | None required — decorative mock, `aria-hidden` not needed as mock content is inside a labelled `aria-label` section | Low |
| B-14 | Hero mock card shadow + rotation | `main-portal.component.scss` | 201–216 | `.hero-mock-card`: `box-shadow: 0 16px 40px rgba(0,0,0,0.08)`; `--seeker: rotate(-3deg)`; `--employer: rotate(3deg)` | No animation — static transform | Inside `.portal-hero-visual` which is `aria-hidden="true"` | Low |
| B-15 | gh-pressable press scale on all CTAs | `src/assets/styles/_motion.scss` | 55–62 | Existing class; applied to all CTA buttons in homepage V2; `transform: scale(0.985)` on `:active`; `transition: transform 100ms $motion-ease-standard`; `@include motion-safe` suppresses under reduced-motion | `@include motion-safe` removes transition + animation | Touch target `min-height: 44px` on `btn-cta-primary` via `_portal-common.scss` | Low |

---

## Files Modified

| File | Change Type |
|------|-------------|
| `src/app/public/main-portal/main-portal.component.scss` | New sections: scroll-reveal, hero proof chips, product preview tabs, preview mock cards, trust/safety, employer band (lines 526–1030) |
| `src/app/public/main-portal/main-portal.component.html` | New sections added: product preview, trust & safety, employer band; `appPortalReveal` applied to 3 sections |
| `src/app/shared/directives/portal-reveal.directive.ts` | New file — `PortalRevealDirective` with SSR-safe IntersectionObserver implementation |
| `src/assets/styles/_motion.scss` | Pre-existing; `$motion-ease-decelerate` token consumed by scroll-reveal CSS |

---

## Token Consumption Reference

| Token | Value | Used By |
|-------|-------|---------|
| `$motion-ease-decelerate` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | B-01 scroll reveal transition |
| `$motion-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | B-08/B-09 hero animation, B-15 gh-pressable |
| `$color-global-red-buttons` | Brand coral (~#FE6F61) | B-06 tab active/hover, B-07 outline, B-12 band border |
| `$gh-scale-press` | `0.985` | B-15 gh-pressable active state |
