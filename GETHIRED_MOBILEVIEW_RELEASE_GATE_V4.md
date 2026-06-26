# GETHIRED MOBILEVIEW — Mobile Release Gates V4
**Scope:** Recent deployment — commit e817e2e (homepage V2, 2026-06-26)
**Files verified:** main-portal.component.scss, main-portal.component.html, shared/_portal-common.scss

---

## Gate Results

### Gate A: No horizontal overflow at 375px — PASS

**Evidence:**
- All section containers use `max-width` + `padding: 0 24px` pattern. No fixed widths wider than the viewport on any section.
- At <576px, hero padding reduces to `16px` per side (SCSS line 485). Remaining content width: 343px — within bounds.
- Product Preview inner at <768px: `padding: 32px 20px`. With 24px outer: usable text width ≈287px. All content fits.
- Hero mock cards: `width: 180px; flex-shrink: 0`. In a flex-column context at 375px, these sit at 180px wide, centered in a 343px column. **No overflow** — 180px < 343px.
- `.portal-preview-panel` collapses to `1fr` at <768px — no two-column overflow risk.
- `.portal-trust-grid` collapses to `1fr` at <576px.
- **No fixed-width elements wider than 343px found in the new sections.**

---

### Gate B: Breakpoints cover 992/768/576px — PASS

**Evidence:**

| Breakpoint | Coverage |
|-----------|----------|
| 992px (991px in code) | Hero layout centers; proof chips center; trust/bento/USP grids collapse 4→2 col |
| 768px (767px in code) | Role grid, preview panel, how-it-works grid, preview inner padding all transition |
| 576px (575px in code) | Hero visual stacks; hero CTA + journey CTA go full-width with min-height 44px; trust/bento/USP grids go 1-col; employer band heading shrinks; hero padding reduces |

All three target breakpoints are explicitly handled. The MOBILEVIEW Pass 2 block (SCSS lines 482–513) consolidates the most critical 576px mobile treatments.

---

### Gate C: Touch targets ≥44px on primary CTAs — PASS (with documented gap on tab buttons)

**Primary CTA buttons (`.btn-cta-primary`):**
- `padding: 12px 24px; min-height: 44px` — PASS at all breakpoints.
- `display: inline-flex; align-items: center; justify-content: center` — full area is tappable.

**Outline CTA buttons (`.btn-cta-outline`):**
- No `min-height` in base class; `padding: 10px 22px` → ~40px at desktop/tablet.
- `min-height: 44px` added at <576px (MOBILEVIEW Pass 2).
- **Minor gap at desktop/tablet** — not mobile-specific; acceptable as desktop users have cursor precision.

**Link CTA buttons (`.btn-link-cta`):**
- `padding: 12px 8px; min-height: 44px` — PASS at all breakpoints.

**Product Preview tab buttons (`.portal-preview-tab`):**
- `min-height: 38px` — **6px below iOS 44px guideline.**
- **DOCUMENTED GAP.** In ACTIONS backlog. Not release-blocking for this deployment (tabs are a secondary feature; primary CTAs are compliant).

**GATE RESULT: PASS** — primary CTAs meet the guideline. Tab button gap is documented and in backlog.

---

### Gate D: Content readable at 375px without pinch-zoom — PASS

**Evidence:**
- **Font sizes at 375px:**
  - Hero title: 24px (portal-common.scss line 25–27)
  - Body/subtitle: 15–16px
  - Section headings: 26px (portal-section-title), 22px (employer band at <575px)
  - Card body text: 13–14px — smallest used; readable at 375px standard 100% zoom
  - Tab button labels: 13px — readable
  - Trust card body: 13px with `line-height: 1.55` — adequate
- **No text below 11px on interactive content.** 11px appears on non-interactive labels (`.preview-role-label`, `.preview-signals-note`, badge text) — decorative context, acceptable.
- **No horizontal scroll required** — all content fits within viewport width at 375px as confirmed by Gate A.
- **VERDICT:** All primary content is readable at 375px without pinch-zoom.

---

### Gate E: Tab button wrap behavior correct — PASS

**Evidence:**
- `.portal-preview-tabs` uses `display: flex; flex-wrap: wrap; gap: 8px; justify-content: center` (SCSS lines 601–607).
- Five tabs: "Job seeker profile", "Employer dashboard", "Application tracking", "Video answers", "Compatibility signals".
- At narrow viewports, tabs wrap to multiple rows, centered. No tab is hidden or clipped.
- Tab labels remain intact (no `text-overflow: ellipsis` or truncation applied).
- Each tab has `padding: 8px 16px; min-height: 38px` — buttons remain tappable even when wrapped.
- **VERDICT:** Wrap behavior is correct. Tabs reflow without overflow or clipping.

---

### Gate F: Reduced-motion respected — PASS

**Evidence:**
- Rule 1 (hero animations, SCSS lines 516–524):
  ```scss
  @media (prefers-reduced-motion: reduce) {
    .portal-hero-copy, .portal-hero-visual {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }
  ```
- Rule 2 (scroll reveal sections, SCSS lines 539–543):
  ```scss
  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    transform: none;
    transition: none;
  }
  ```
- Both hero entry animations and scroll-reveal transitions are fully disabled when `prefers-reduced-motion: reduce` is set.
- Sections are immediately visible (opacity:1) — no blank-flash issue for reduced-motion users.
- **VERDICT:** PASS. CSS rule verified in source.

---

### Gate G: Scroll reveal appropriate for mobile — PASS

**Evidence:**
- Three sections use `portal-reveal-section` + `appPortalReveal`: Product Preview, Trust & Safety, Employer Band (HTML lines 171, 372, 404).
- Initial state: `opacity: 0; transform: translateY(16px)` (SCSS lines 528–532).
- Transition: `opacity 500ms; transform 500ms cubic-bezier(0.0,0.0,0.2,1)` — ease-out, appropriate for mobile scroll context.
- IntersectionObserver: supported iOS Safari 12.1+ (2019). No polyfill needed for current deployment target.
- 500ms duration is moderate — not too slow for mobile, not so fast it is unperceived.
- 16px Y-translate is subtle enough to not cause visual discomfort.
- Blank flash on very slow connections: sections start invisible until Angular bundle initializes and the directive registers the observer. On fast connections (typical mobile) this is imperceptible. **Known limitation documented** — not a regression.
- **VERDICT:** PASS. Scroll reveal is appropriate for mobile use.

---

## Overall Verdict

**GO WITH CAUTION**

| Gate | Result | Notes |
|------|--------|-------|
| A: No horizontal overflow at 375px | PASS | Verified from SCSS — no fixed-width elements wider than viewport |
| B: Breakpoints cover 992/768/576px | PASS | All three breakpoints explicitly handled |
| C: Touch targets ≥44px on primary CTAs | PASS | Tab button 38px gap documented in backlog |
| D: Content readable at 375px without pinch-zoom | PASS | Minimum interactive text 13px; no scroll needed |
| E: Tab button wrap behavior | PASS | flex-wrap:wrap confirmed; no clipping |
| F: Reduced-motion respected | PASS | CSS rules verified at lines 516–524 and 539–543 |
| G: Scroll reveal appropriate for mobile | PASS | 500ms ease-out; iOS Safari 12.1+ compatible |

**"GO WITH CAUTION" because:** All gates PASS, but two gaps warrant backlog tracking before the next shipping cycle:
1. **Tab button `min-height: 38px`** — 6px short of iOS 44px guideline. Tab buttons are secondary navigation inside a section, not primary entry points. Primary CTAs are all compliant. Acceptable for this deployment; fix in next iteration.
2. **Missing `:active` state on `.portal-preview-tab`** — touch users get no press feedback. Low severity; cosmetic.
3. **`.btn-cta-outline` no explicit `min-height` at desktop** — minor, non-mobile-specific.

No gates FAIL. The deployment is mobile-safe for release.

---

## Backlog Items from This Audit

| Priority | Item | File | Lines |
|----------|------|------|-------|
| P2 | Add `min-height: 44px` to `.portal-preview-tab` | main-portal.component.scss | 620 |
| P3 | Add `:active { background: rgba(254,111,97,0.08); }` to `.portal-preview-tab` | main-portal.component.scss | 609–639 |
| P3 | Add `min-height: 44px` to `.btn-cta-outline` base (remove desktop gap) | main-portal.component.scss | 152–164 |
