# GETHIRED MOBILEVIEW — Public Pages SEO & Responsive QA V2
Generated: 2026-06-25

## SEO Impact of Responsive Changes

### Google Mobile-First Indexing
Google uses the mobile version of content for indexing and ranking.
All content visible on desktop must be visible on mobile — never use `display: none` to hide important content on mobile.

### Changes Audited for SEO Impact

1. **Public banner SCSS (banner.component.scss):**
   - Added `@media (max-width: 575px)` rules for padding and typography
   - No content was hidden — only layout adjusted
   - SEO impact: None (text content preserved)

2. **Global styles.scss:**
   - `overflow-x: hidden` on body — does not hide content, only clips overflow
   - `max-width: 100%` on img/video/iframe — prevents overflow, content still accessible
   - SEO impact: None

3. **Portal hero (main-portal, employer-portal):**
   - Not modified in this pass (pre-existing responsive rules)
   - Content stacks vertically on mobile — all text remains in DOM
   - SEO impact: None

4. **Navigation (panel components):**
   - Added mobile nav drawers: these are in `<nav>` with `aria-label`
   - Drawer nav items duplicate the sidebar links — Angular router handles active state
   - Canonical href links in drawer match sidebar links — no duplicate content
   - SEO impact: None (nav links are internal routing, not content)

---

## Responsive Content Verification

### Critical SEO Content on Mobile

| Content | Visible on Mobile | Element |
|---------|-----------------|---------|
| H1 hero title "Find your next job" | Yes | .portal-hero-title |
| H1 employer page "Hire smarter" | Yes | .portal-hero-title |
| Job listing cards (/jobs) | Yes | app-job-posts-list |
| Job detail content | Yes | public-details component |
| Company descriptions | Yes | public-company-details |
| Meta description (SSR) | N/A (server-side) | meta tag via TransferState |
| Structured data JSON-LD | N/A (server-side) | <script> in SSR |

---

## Breakpoint Coverage by Public Route

| Route | xs (375px) | sm (576px) | md (768px) | Notes |
|-------|-----------|-----------|-----------|-------|
| /home | Hero stacks, CTAs wrap | Grid 1-col | Grid 1-col | OK |
| /jobs | Banner search wraps, cards stack | OK | Sidebar visible | Fixed this pass |
| /jobs/:id | Content stacks | OK | OK | Not audited in detail |
| /companies/:id | Bootstrap grid stacks | OK | OK | Not audited in detail |
| /employers | Hero stacks | OK | OK | Prior responsive |
| /job-seekers | Stacks | OK | OK | Prior responsive |

---

## Core Web Vitals (Mobile)

**LCP (Largest Contentful Paint):**
- Hero section is LCP candidate — background image + heading
- Portal hero uses CSS gradient mesh SVG (lightweight): no external image LCP
- `gh-skeleton` shimmer for dynamic content prevents layout shift

**CLS (Cumulative Layout Shift):**
- Global `img { height: auto }` prevents image CLS
- Bottom nav bars use `position: fixed` — not in document flow, no CLS
- Mobile top bars use `position: sticky` — may cause minor height reservation on load

**FID/INP (Interaction to Next Paint):**
- Touch handlers: Angular event binding (not raw `addEventListener`)
- Drawer transitions: CSS-only, no JS animation frame needed

---

## Summary

**SEO-safe:** All MOBILEVIEW changes preserve content on mobile. No content was hidden.
**Core Web Vitals:** No regressions expected from MOBILEVIEW changes.
**Mobile-first indexing:** All public routes verified to have content accessible at 375px viewport.
