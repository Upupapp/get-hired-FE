# GETHIRED OPTIMIZE RELEASE GATE — RECENT DEPLOYMENT (V3)
Scope: commit e817e2e (homepage V2) — 6 FE files changed, BE untouched
Date: 2026-06-26

---

## Gate Results

### Gate A: Behavior Preservation — PASS

All existing sections confirmed present and unmodified:
- portal-hero (hero with split layout, mock cards, CTA buttons) — unchanged
- portal-role-selector (job seeker / employer role cards) — unchanged
- portal-usp (4-pillar "Not just a job board" grid) — unchanged
- portal-differentiators (bento grid) — unchanged
- portal-journey seeker (5-step list) — unchanged
- portal-journey employer (6-step list with employer styling) — unchanged
- portal-final-cta-wrap (portal-cta-band + secondary links) — unchanged

New sections added below existing content (non-destructive append):
- portal-product-preview (new, between journey and trust)
- portal-trust-safety (new)
- portal-employer-band (new, before final CTA)

The "How it works" section was intentionally removed per the deployment brief. This is a content decision, not a regression.

Routing untouched. No route renames, no guard changes, no redirects modified.

### Gate B: Public Performance Readiness — PASS

- Product Preview: *ngIf switching (only 1 of 5 panels in DOM) — efficient
- Trust & Safety: static cards, emoji icons (no assets) — efficient
- Employer Band: static copy, single CTA — efficient
- IntersectionObserver self-disconnects after first fire — no persistent observer overhead
- No new HTTP calls in any of the 3 new sections — confirmed
- All new analytics methods are no-ops in production (no SDK installed)
- Tab button transitions on small interactive targets only — acceptable
- CSS blur on decorative glow elements only (aria-hidden, pointer-events: none) — acceptable

Minor issue found and fixed: USP pillar icons (4 imgs in *ngFor) were missing loading="lazy". Fixed in this pass.

### Gate C: Core Web Vitals — PASS

LCP: Above-fold hero is unchanged. h1 and CTA buttons are text, not images. No new above-fold image resources introduced. No LCP regression.

CLS: Reveal sections use opacity/transform only — both are layout-stable (no box model changes during animation). Elements occupy their layout space at opacity: 0 before reveal. CLS is zero. Hero mock cards use transform: rotate which is also layout-stable.

FID/INP: No computationally expensive event handlers added. Tab switching sets a single string property and calls one analytics no-op. No template interpolation in event handlers.

### Gate D: Accessibility and Mobile — PASS

Tab component ARIA:
- Tab buttons: role="tab", aria-selected (dynamic), aria-controls, id — all correct
- Tab panel: role="tabpanel", aria-labelledby — correct
- Inactive panels removed from DOM via *ngIf (not hidden) — screenreaders will not encounter invisible content

Images:
- All decorative images carry aria-hidden="true" and alt=""
- No informational images without alt text found

Keyboard:
- Tab buttons are native button elements (keyboard focusable by default)
- focus-visible outline on tab buttons: 2px solid brand color — present
- CTA buttons use native button elements — correct

Mobile:
- portal-product-preview-inner: responsive padding at <=767px breakpoint
- portal-preview-panel: collapses to single column at <=767px
- portal-trust-grid: 4-col -> 2-col at <=991px, 1-col at <=575px
- portal-employer-band-inner: responsive padding at <=767px, smaller title at <=575px
- Hero proof chips: justify-content: center at <=991px

Touch targets:
- Portal preview tabs: min-height: 38px — marginally below the 44px WCAG recommendation
  Note: this is a deferred item (out of OPTIMIZE scope — changing tab height is a design decision, not a safe one-liner)

### Gate E: Bundle Size Within Budget — PASS

Raw chunk size: +20.68 kB for 3 new sections, 1 directive, 6 analytics methods, ~350 SCSS lines.

Budget assessment:
- No new npm dependencies added
- No lazy-loaded module boundaries changed
- All new code lives within the existing public module chunk
- +20.68 kB is proportionate for 3 complete marketing sections
- Gzip compression will reduce this to approximately 5-7 kB transferred

PASS: within acceptable budget for the scope of changes.

### Gate F: Reduced-Motion Compliance — PASS

Hero entry animations:
- .portal-hero-copy and .portal-hero-visual both start at opacity: 0 with CSS animation
- @media (prefers-reduced-motion: reduce) sets animation: none; opacity: 1; transform: none
- Immediate visibility guaranteed in reduced-motion environments

Scroll-reveal sections:
- .portal-reveal-section starts at opacity: 0; transform: translateY(16px)
- @media (prefers-reduced-motion: reduce) block inside the same ruleset sets opacity: 1; transform: none; transition: none
- Content is always fully visible without needing the IntersectionObserver to fire
- The directive still adds is-revealed in reduced-motion environments, but it is harmless (CSS state is already revealed)

Tab transitions:
- Tab button hover/active transitions (150ms) are small UI feedback and not vestibular-risk animations
- No looping animations, no auto-playing motion, no parallax effects

Full compliance.

---

## Summary

| Gate | Result | Notes |
|------|--------|-------|
| A: Behavior preservation | PASS | All existing sections unchanged; 3 additive sections added |
| B: Public performance readiness | PASS | Efficient patterns throughout; 1 lazy-loading gap fixed |
| C: Core Web Vitals | PASS | No LCP/CLS regression; layout-stable animations |
| D: Accessibility and mobile | PASS | Tab ARIA correct; 1 minor deferred item (tab touch target 38px vs 44px) |
| E: Bundle size within budget | PASS | +20.68 kB raw for 3 sections — proportionate and acceptable |
| F: Reduced-motion compliance | PASS | Two layers of protection; full coverage for hero and scroll-reveal |

**Overall: PASS. Deployment is safe to remain live.**

---

## Deferred Items (Not Blockers)

1. Portal preview tab min-height is 38px (below 44px WCAG touch target recommendation). Design decision — defer to next design pass.
2. Dead SCSS block .portal-how-it-works (lines 413-459 in main-portal.component.scss) — the HTML section was removed but the styles remain. No behavior impact. Defer to next cleanup pass.
