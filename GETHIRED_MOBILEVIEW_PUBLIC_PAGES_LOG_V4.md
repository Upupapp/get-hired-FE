# GETHIRED MOBILEVIEW — Public Pages Mobile Status Log V4
**Scope:** Recent deployment — commit e817e2e (homepage V2, 2026-06-26)
**Source:** main-portal.component.scss, main-portal.component.html, shared/_portal-common.scss

---

| Section | CSS Class(es) | Breakpoints Applied | Status | Notes |
|---------|--------------|-------------------|--------|-------|
| **Hero (upgraded)** | `.portal-hero--upgraded`, `.portal-hero-inner--split` | 991px, 575px | Good | Splits to 1-col at 991px. Padding shrinks at 575px (`48px 16px 40px`). Hero title 34px→24px at 575px. |
| **Hero visual (mock cards)** | `.portal-hero-visual`, `.hero-mock-card` | 575px | Good | Stacks to column at 575px. Cards have `width:180px flex-shrink:0`; appear narrower than column on mobile — no overflow, cosmetic only. |
| **Hero CTA group** | `.portal-hero-cta-group`, `.btn-cta-primary`, `.btn-cta-outline` | 991px, 575px | Good | Centers at 991px. Full-width with `min-height:44px` applied to both buttons at 575px (MOBILEVIEW Pass 2 block). |
| **Hero proof chips** | `.portal-hero-proof-chips`, `.portal-hero-chip` | 991px | Good | `justify-content:center` at 991px. `flex-wrap:wrap; gap:8px` — wraps naturally at all widths. Non-interactive spans; no touch target concern. |
| **Role selector grid** | `.portal-role-grid` | 767px | Good | 2-col → 1-col at 767px. Role cards stack vertically. |
| **Trust strip (role section)** | `.portal-trust-strip`, `.portal-trust-chip` | — | Good | `flex-wrap:wrap; justify-content:center` — adapts at all widths without explicit breakpoint. Non-interactive spans. |
| **USP section** | `.portal-usp`, `.portal-usp-grid` | 991px, 575px | Good | Grid: 4→2→1 col. USP bridge SVG hidden at 575px to reduce vertical noise. Cards retain padding and text size. |
| **Bento grid (What GetHired does)** | `.portal-bento-grid`, `.portal-bento-card` | 991px, 575px | Good | 4→2→1 col. No fixed widths. Bento cards stretch to fill column. |
| **Journey — Job Seekers** | `.portal-journey`, `.portal-journey-steps` | — | Good | Uses `repeat(auto-fit, minmax(180px,1fr))`. At 375px fits exactly 1 column. CTA full-width at 575px. |
| **Journey — Employers** | `.portal-journey--employer`, `.portal-journey-steps--employer` | — | Good | Same auto-fit grid. `repeat(auto-fit, minmax(160px,1fr))`. At 375px → 1 col. Gradient background stays contained. |
| **Journey CTA buttons** | `.portal-journey-cta`, `.btn-cta-primary`, `.btn-link-cta` | 575px | Good | Full-width column layout with `min-height:44px` at 575px. `btn-link-cta` already has `min-height:44px` at all sizes. |
| **Product Preview outer** | `.portal-product-preview` | — | Good | `max-width:1100px; padding:0 24px` — shrinks to full-width at all breakpoints via padding. |
| **Product Preview inner card** | `.portal-product-preview-inner` | 767px | Good | Padding `48px 40px` → `32px 20px`. Border-radius `24px` → `16px`. Adequate breathing room on mobile. |
| **Preview tabs** | `.portal-preview-tabs`, `.portal-preview-tab` | — | Needs attention | `flex-wrap:wrap; justify-content:center` — tabs wrap at mobile. `min-height:38px` is BELOW iOS 44px guideline. No `:active` state for touch feedback. ARIA pattern correct. |
| **Preview panel (content)** | `.portal-preview-panel` | 767px | Good | 2-col (mock card + info) → 1-col at 767px. Mock card above, info below — correct read order. Gap 32px→20px. |
| **Preview mock cards — profile/dashboard/tracking** | `.preview-mock-card` | — | Good | No fixed width; fills grid cell. Flex-wrap on skills chips. Meta rows fit at 287px usable width. |
| **Preview mock card — video** | `.preview-mock-card--video` | — | Good | Video player `height:110px` at full column width. Play button `width:44px; height:44px` — meets touch target but is `aria-hidden` (decorative, not interactive). |
| **Preview mock card — signals** | `.preview-mock-card--signals` | — | Good | SVG rings `width:96px; height:96px` centered. Text is short. No overflow risk. |
| **How-it-works grid** | `.portal-how-it-works-grid` | 767px | Good | 2-col → 1-col at 767px. Cards have `padding:24px; border-radius:16px`. |
| **Trust & Safety section** | `.portal-trust-safety`, `.portal-trust-grid`, `.portal-trust-card` | 991px, 575px | Good | Grid: 4→2→1 col. Long headings wrap safely at 375px (`line-height:1.35`). Body text 13px with `line-height:1.55`. |
| **Employer conversion band** | `.portal-employer-band`, `.portal-employer-band-inner` | 767px, 575px | Good | Padding `48px 40px` → `32px 20px` at 767px. Heading `26px` → `22px` at 575px. "Ready to hire in the Philippines?" wraps to 2 lines cleanly. CTA button single; `min-height:44px` from `.btn-cta-primary`. |
| **Final CTA wrap** | `.portal-final-cta-wrap`, `app-portal-cta-band` | — | Good | Delegated to shared `portal-cta-band` component. Glow orb is absolute-positioned decorative only. |
| **Reduced motion (hero)** | `.portal-hero-copy`, `.portal-hero-visual` | `prefers-reduced-motion:reduce` | Good | `animation:none; opacity:1; transform:none` — both hero entry animations disabled. |
| **Reduced motion (scroll reveal)** | `.portal-reveal-section` | `prefers-reduced-motion:reduce` | Good | `opacity:1; transform:none; transition:none` — reveal effect fully disabled. Sections visible on paint. |
| **Scroll reveal sections** | `.portal-reveal-section` + `appPortalReveal` | — | Good | `opacity:0; transform:translateY(16px)` initial. 500ms ease-out transition. IntersectionObserver iOS Safari 12.1+ compatible. Blank flash risk on very slow connections (known limitation). |
| **`btn-cta-outline` (desktop)** | `.btn-cta-outline` | 575px | Needs attention | `padding:10px 22px` with no `min-height` → ~40px at desktop/tablet. `min-height:44px` only added at <575px by MOBILEVIEW Pass 2. Minor gap on desktop; acceptable. |

---

## Status Key
- **Good** — responsive behavior verified from SCSS; no overflow, no touch target issues, correct stacking.
- **Needs attention** — minor gap identified; not release-blocking but documented for backlog.
- **Blocked** — N/A for this deployment.
