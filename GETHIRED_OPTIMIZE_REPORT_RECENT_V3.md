# GETHIRED OPTIMIZE REPORT — RECENT DEPLOYMENT (V3)
Scope: commit e817e2e (homepage V2) — 6 FE files changed, BE untouched
Date: 2026-06-26

---

## Deployment Summary

6 files changed. 3 new page sections added (Product Preview, Trust & Safety, Employer Conversion Band). 1 new directive (PortalRevealDirective). Analytics service extended with 6 methods. Main portal component extended with tab state and 4 new handlers. SCSS grew by ~350 lines.

Bundle impact: main-public-public-module 147.70 kB to 168.38 kB raw (+20.68 kB). Clean build, 0 errors.

---

## Performance Assessment

### 1. Three New Sections

Product Preview (portal-product-preview): Tabbed section with 5 panels. Each panel is wrapped in *ngIf="activePreviewTab === '...'" so only the active panel is rendered into the DOM at any time. The other 4 are fully destroyed (no hidden-but-rendered nodes). This is the correct pattern for a section that starts paused and is below the fold. The section is wrapped in appPortalReveal so it animates into view on scroll. No HTTP calls. No external assets beyond one local SVG in the Compatibility Signals panel (match-signal-rings.svg), which carries loading="lazy" and explicit width/height dimensions.

Trust & Safety (portal-trust-safety): 4 static cards, emoji icons (Unicode only — no icon library, no images). Zero asset load. No ngFor, no dynamic content. Wrapped in appPortalReveal.

Employer Conversion Band (portal-employer-band): Static copy + talent proof badge + one CTA button. No images, no loops, no HTTP calls. Wrapped in appPortalReveal.

### 2. IntersectionObserver Directive Efficiency

PortalRevealDirective is well-implemented:
- SSR-safe: falls back to is-revealed immediately when isPlatformBrowser is false or IntersectionObserver is undefined.
- Self-disconnecting: calls observer.disconnect() and nulls the reference immediately after the first intersection. Observer does not persist after reveal.
- ngOnDestroy guards against early unmount before intersection fires (no leak).
- Threshold 0.1 (10%) — appropriate for tall sections; fires before content is fully in view.
- Three separate directive instances (one per reveal section): correct usage. Each is independent.

No issues found.

### 3. ngIf Tab Panel Switching (5 panels)

Confirmed: each of the 5 panels is guarded by *ngIf="activePreviewTab === '...'" inside a single ng-container. Only one panel exists in the DOM at a time. The inactive panels mock card HTML, preview skill chips, and job list rows are all destroyed when not active. This avoids hidden-but-rendered overhead. Correct pattern.

The tab buttons use role="tab", aria-selected, aria-controls, and id attributes. The panel uses role="tabpanel" and aria-labelledby. Tab ARIA semantics are correct.

### 4. CSS Transitions

The scroll-reveal transition uses opacity and transform only:

    transition: opacity 500ms cubic-bezier(0.0, 0.0, 0.2, 1),
                transform 500ms cubic-bezier(0.0, 0.0, 0.2, 1);

Both are GPU-compositable properties. No width, height, top, left, margin, or padding in the transition. No layout thrash. Good.

The hero entry animation (portal-hero-reveal) also uses opacity and transform only, with a short 280ms duration and a staggered 80ms delay on the visual column. Good.

Tab button transitions include border-color, color, background, and box-shadow — these are not GPU-composited but are on small UI elements (tabs, not full sections). Acceptable.

### 5. Bundle Size Impact

+20.68 kB raw for:
- 1 new directive (~65 lines)
- 6 new analytics methods (no SDK — all no-ops in production)
- ~350 new SCSS lines (compiled to CSS)
- 5 new mock card panels (template HTML)
- 3 new component arrays (static data, no external deps)

This is proportionate for 3 new marketing sections. Acceptable. No new npm dependencies introduced.

### 6. Image Loading

All img tags audited:

| Line | Src | loading= |
|------|-----|----------|
| 2    | portal-gradient-mesh.svg (hero background) | lazy |
| 112  | gethired-connection-bridge.svg (USP section) | lazy |
| 115  | item.icon (uspPillars *ngFor, 4 icons) | MISSING — FIXED in this pass |
| 349  | match-signal-rings.svg (Compatibility Signals panel) | lazy |

All role-card icons are inside the app-role-card component — not in this template directly. The hero background mesh correctly has loading="lazy" even though it is above the fold, because it is decorative (aria-hidden) and the hero text/CTA do not depend on it rendering.

One gap found and fixed: the USP pillar icons (item.icon) in the *ngFor at line 115 were missing loading="lazy". These are below the hero fold. Fix applied.

### 7. No New HTTP Calls

Confirmed: the 3 new sections contain no ngOnInit data fetches, no service injections with HTTP calls, and no observable subscriptions. The 6 new analytics methods all no-op in production (no SDK). Zero new network requests at paint time.

### 8. Scroll Reveal Threshold (10%)

The 10% threshold means the transition fires when 10% of the section enters the viewport. For tall sections (~400-600px), this triggers the reveal before the user has scrolled far into the section, which feels natural. A lower threshold (e.g., 5%) would trigger too early on mobile; a higher one (e.g., 25%) might feel delayed on tall sections. 10% is appropriate.

### 9. Reduced-Motion Compliance

Two layers of reduced-motion protection:

Hero animation (in .portal-hero-copy and .portal-hero-visual) via:
    @media (prefers-reduced-motion: reduce) { animation: none; opacity: 1; transform: none; }

These elements start at opacity: 0 via CSS then animate in. The reduced-motion override sets them to fully visible immediately, so they never flash invisible.

Scroll-reveal sections (in .portal-reveal-section) via:
    @media (prefers-reduced-motion: reduce) { opacity: 1; transform: none; transition: none; }

The reveal sections start at opacity: 0 in their base state. The reduced-motion rule overrides both to 1/none with transition: none, so they are always visible regardless of whether the IntersectionObserver fires. Correct.

The directive itself does not read prefers-reduced-motion (it still adds is-revealed on scroll), but that is fine because the CSS already ensures the content is fully visible in reduced-motion environments whether or not is-revealed is present.

Full compliance confirmed.

### 10. CLS Risk

The reveal sections use opacity: 0 + transform: translateY(16px) in their pre-reveal state. Critically, opacity: 0 elements still occupy layout space — they are invisible but not removed from the flow. transform moves the visual render but does not affect layout box. Therefore, no layout shift occurs during the reveal animation. CLS is zero from this pattern.

The hero mock cards use CSS transform: rotate(+/-3deg) — decorative, layout-stable.

No CLS risk found.

### 11. LCP Impact

The above-fold hero (portal-hero--upgraded) is unchanged from the pre-V2 design. The h1, the two CTA buttons, and the hero copy are all text — no new images are above the fold. The hero background mesh (portal-gradient-mesh.svg) is decorative with aria-hidden and loading="lazy". It was already present in the GH1 WOW upgrade and is not the LCP candidate.

No LCP regression introduced.

---

## Summary

The deployment is well-constructed. The three new sections use efficient Angular patterns (ngIf switching, self-disconnecting IntersectionObserver, GPU-only transitions) and full reduced-motion coverage. One image (loading="lazy" missing on USP pillar icons) and five trackBy omissions were found and fixed in this pass. No regressions, no new dependencies, no layout-affecting transitions.
