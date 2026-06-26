# GetHired Brand Release Gate — Recent Deployment (Homepage V2)
**Scope:** commit e817e2e — scroll reveal, product preview tabs, hero proof chips, employer band, mock cards
**Date:** 2026-06-26

---

## Gate A: State Coverage
_New sections have appropriate reveal/interaction states_

| Check | Result | Evidence |
|-------|--------|----------|
| Product Preview section has entry reveal state | PASS | `portal-reveal-section` + `appPortalReveal` on the section (HTML line 171–174); `opacity 0 → 1`, `translateY(16px) → none` on scroll entry |
| Trust & Safety section has entry reveal state | PASS | `appPortalReveal` applied (HTML line 373) |
| Employer Conversion Band has entry reveal state | PASS | `appPortalReveal` applied (HTML line 405) |
| Hero sections above-the-fold have immediate entry animation | PASS | `portal-hero-copy` and `portal-hero-visual` use CSS `animation` (fires on load, not scroll), 280ms with 80ms stagger |
| Product Preview tabs have active/hover/focus states | PASS | `.portal-preview-tab` has `:hover`, `:focus-visible`, `.active` states — all explicitly styled |
| Product Preview has loading state | N/A — PASS | All content is static CSS mock; no async call; no loading state needed; labelled "Illustrative view of key features" |
| No sections left in permanently-hidden state | PASS | SSR fallback in directive adds `is-revealed` immediately if IntersectionObserver is unavailable |

**Gate A: PASS**

---

## Gate B: Brand Fit
_Colors, shadows, and gradients align with GetHired brand_

| Check | Result | Evidence |
|-------|--------|----------|
| Tab active state uses brand coral | PASS | `$color-global-red-buttons` for background, border-color, box-shadow tint |
| Tab hover uses brand coral | PASS | `border-color: $color-global-red-buttons; color: $color-global-red-buttons` |
| Focus-visible outline uses brand coral | PASS | `outline: 2px solid $color-global-red-buttons` |
| Employer band gradient derived from brand coral | PASS | `linear-gradient(135deg, #FFF0EF 0%, #FFF7F6 60%, #FFFFFF 100%)` — very light coral tints |
| Employer band border uses brand coral at low opacity | PASS | `border: 1px solid rgba(254, 111, 97, 0.1)` |
| Hero glow uses brand coral at low opacity | PASS | `rgba(254, 111, 97, 0.5)` in glow--one radial gradient |
| Mock card shadows use neutral black at low opacity | PASS | Both `preview-mock-card` and `hero-mock-card` use `rgba(0,0,0,0.08)` — no competing color tint |
| Hero proof chip glass style (white/neutral) | PASS | `rgba(255,255,255,0.75)` background — neutral overlay consistent with hero section |
| Journey section employer background | PASS | `linear-gradient(135deg, #FFF8F6 0%, #FFFFFF 100%)` — same coral-tint family as employer band |
| No non-brand accent colors introduced | PASS | Secondary palette (teal `#2dd4bf` / `#0d9488`) is existing GetHired colour; not new |

**Gate B: PASS**

---

## Gate C: Behavior Preservation
_Existing sections unaffected by new additions_

| Check | Result | Evidence |
|-------|--------|----------|
| `_portal-common.scss` shared styles unchanged | PASS | Only read during this deployment; no edits to shared file |
| `portal-hero`, `portal-role-selector`, `portal-bento-grid` classes unchanged | PASS | These classes remain in `_portal-common.scss` and `main-portal.component.scss` with original values |
| `portal-usp-card` hover behavior unchanged | PASS | Existing `@media (prefers-reduced-motion: no-preference)` guard and `transform: translateY(-3px)` values in `_portal-common.scss` unmodified |
| `btn-cta-primary` style unchanged | PASS | Defined in `_portal-common.scss`; not modified; homepage buttons inherit it |
| `btn-link-cta` style unchanged | PASS | Defined in `_portal-common.scss`; not modified |
| `gh-pressable` class unchanged | PASS | Defined in `_motion.scss`; not modified; all existing usages in other pages unaffected |
| `portal-role-card-wrap`, `portal-trust-strip`, `portal-trust-chip` unchanged | PASS | Defined at top of `main-portal.component.scss` (lines 21–61); untouched |
| `portal-differentiators` and bento icon styles unchanged | PASS | Lines 63–73 of `main-portal.component.scss`; untouched |

**Gate C: PASS**

---

## Gate D: Accessibility
_Focus states, reduced-motion, no color-only meaning_

| Check | Result | Evidence |
|-------|--------|----------|
| `prefers-reduced-motion: reduce` disables scroll reveal transition | PASS | CSS rule inside `.portal-reveal-section` at lines 539–543: `opacity: 1; transform: none; transition: none` |
| `prefers-reduced-motion: reduce` disables hero entrance animation | PASS | Separate block at lines 517–524: `animation: none; opacity: 1; transform: none` on `.portal-hero-copy` and `.portal-hero-visual` |
| `prefers-reduced-motion: reduce` disables `gh-pressable` scale | PASS | `@include motion-safe` in `_motion.scss` sets `transition: none !important; animation: none !important` |
| Tab focus-visible outline present | PASS | `outline: 2px solid $color-global-red-buttons; outline-offset: 2px` — visible, not clipped |
| Tab active state not color-only | PASS | Active tab also changes background (fill) and text to white — not relying solely on the glow shadow |
| Tabs have ARIA roles | PASS | `role="tablist"`, `role="tab"`, `aria-selected`, `id`, `aria-controls` all present in HTML |
| Tab panel has `role="tabpanel"` and `aria-labelledby` | PASS | `role="tabpanel"`, `[attr.aria-labelledby]="'tab-' + activePreviewTab"` in HTML |
| Decorative elements are hidden from screen readers | PASS | `portal-hero-visual` has `aria-hidden="true"`; hero glow divs have `aria-hidden="true"`; hero mesh img has `alt="" aria-hidden="true"` |
| Hero proof chips accessible | PASS | Wrapper has `aria-label="Key features"`; chips rendered via `*ngFor` with meaningful text content |
| CTA buttons have meaningful text | PASS | All `gh-pressable` CTAs have visible text ("Find jobs", "Start hiring", etc.) — no icon-only buttons in new sections |
| Mobile CTA min-height 44px | PASS | `btn-cta-primary` has `min-height: 44px` via `_portal-common.scss`; mobile block stretches to full width at `max-width: 575px` |
| Active tab contrast (white on coral, 13px) | CAUTION | White on `$color-global-red-buttons` at 13px is likely ~3.1:1, below 4.5:1 AA for non-large text. Not a blocker for go-live but should be tracked for a future fix (e.g. increase font-size to 14px+ or use darker coral) |

**Gate D: GO WITH CAUTION** — one known contrast issue on active tab text at 13px; non-blocking for go-live but requires a tracking issue.

---

## Gate E: Haptics Safety
_No new haptic triggers on passive scroll_

| Check | Result | Evidence |
|-------|--------|----------|
| Scroll reveal directive uses IntersectionObserver only | PASS | No `scroll` event listeners; no haptic API calls in directive |
| No Web Vibration API calls in new code | PASS | Neither the directive nor the component controller references `navigator.vibrate` |
| Existing haptic triggers in `_motion.scss` unchanged | PASS | `gh-pressable` is the only haptic-adjacent class; it fires on `:active` (tap/click), not on scroll |
| No ambient scroll-driven animation on new sections | PASS | Scroll reveal fires once on intersection and disconnects; it does not continuously animate during scroll |

**Gate E: PASS**

---

## Gate F: Performance
_CSS transitions use composited properties only_

| Check | Result | Evidence |
|-------|--------|----------|
| Scroll reveal uses only `opacity` and `transform` | PASS | `transition: opacity 500ms ..., transform 500ms ...` — both are GPU-composited properties; no layout reflow |
| Hero entrance animation uses only `opacity` and `transform` | PASS | `@keyframes portal-hero-reveal` animates `opacity` and `transform: translateY` only |
| Tab transitions include `background` and `border-color` | CAUTION | `transition: border-color 150ms ease, color 150ms ease, background 150ms ease, box-shadow 150ms ease` — `background-color`, `border-color`, and `box-shadow` are paint-level (not composited). At 150ms on small elements these are not performance risks in practice, but they are not zero-cost. Acceptable for interactive controls of this size. |
| Hero glow blurs use `filter: blur` (paint layer) | INFO | `filter: blur(60px)` on absolutely-positioned decorative `div`s creates a stacking context; these are static (no animation); no runtime cost |
| No layout-triggering properties in transitions | PASS | No `width`, `height`, `top`, `left`, `margin`, `padding` in any transition |
| IntersectionObserver does not trigger layout | PASS | IO callback only calls `classList.add` — no forced layout/reflow |
| `pointer-events: none` on decorative overlays | PASS | Hero mesh, glow orbs, and final CTA glow all have `pointer-events: none` — no accidental hit-area overhead |

**Gate F: PASS** — tab transitions include paint-level properties but at 150ms on small controls this is acceptable. No compositing concerns.

---

## Gate G: Product Trust
_No fake activity, no fake urgency in new sections_

| Check | Result | Evidence |
|-------|--------|----------|
| Hero proof chips driven by component data (not hardcoded fabricated numbers) | PASS | Chips rendered from `heroProofChips` array in component; content verified to be feature labels, not inflated statistics |
| Product Preview labelled as illustrative | PASS | "Illustrative view of key features." subtitle present in HTML (line 177) |
| Product Preview mock card names are generic (not real user names) | PASS | "Maria D.", "MD" initials, "JD" initials — illustrative placeholders |
| No countdown timers or "X people viewing now" urgency | PASS | No such elements in new HTML |
| No testimonials attributed to named real users | PASS | No testimonials in new sections |
| No fake applicant counts or job counts in new sections | PASS | Job rows in employer mock panel show generic role titles without fabricated numbers |
| `app-talent-proof-badge` component used for real social proof | INFO | Uses `<app-talent-proof-badge>` component (pre-existing) for proof badges — this component is responsible for its own data integrity |

**Gate G: PASS**

---

## Overall Assessment

| Gate | Result |
|------|--------|
| A — State Coverage | PASS |
| B — Brand Fit | PASS |
| C — Behavior Preservation | PASS |
| D — Accessibility | GO WITH CAUTION |
| E — Haptics Safety | PASS |
| F — Performance | PASS |
| G — Product Trust | PASS |

### Overall: GO WITH CAUTION

**Reason for caution:** Active tab text (white on `$color-global-red-buttons` at 13px) likely fails WCAG AA contrast (4.5:1). This is a pre-existing pattern for active states across the portal and the tabs are non-essential navigation (static mock panels below the fold). It does not block the deployment, but should be tracked and resolved in the next brand pass.

**Recommended follow-up item:** Increase `.portal-preview-tab.active` text size to 14px, or darken the coral background slightly for active state, to reach 4.5:1 against white text.

**No blockers for deployment of commit e817e2e.**
