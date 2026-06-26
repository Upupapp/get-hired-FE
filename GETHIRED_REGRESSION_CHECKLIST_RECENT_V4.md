# GetHired Regression Checklist — Recent Deployment (Homepage V2)
**Scope:** Commit e817e2e — 6 FE files, BE untouched
**Date:** 2026-06-26
**Tester:** _______________

Mark each item: PASS / FAIL / SKIP (with note)

---

## Section 1: Hero Section

| # | Check | Expected | Result |
|---|---|---|---|
| 1.1 | Navigate to `/` (not logged in) | Homepage renders, no redirect | |
| 1.2 | H1 text visible | "Find your next job. Build your next team." | |
| 1.3 | Subtitle visible | Correct subtitle paragraph | |
| 1.4 | "Find jobs" primary CTA | Navigates to `/jobs` | |
| 1.5 | "Start hiring" outline CTA | Navigates to `/employers` | |
| 1.6 | "Browse jobs without an account" link | Navigates to `/jobs` | |
| 1.7 | "Sign in" link | Navigates to `/signin` | |
| 1.8 | Hero proof chips visible | 4 chips: Structured profiles / Video answers / Employer dashboard / Application tracking | |
| 1.9 | `app-talent-proof-badge` renders in hero | Badge visible, no console error | |
| 1.10 | Hero background mesh SVG loads | No broken image icon | |
| 1.11 | Glow effects render | Subtle radial glows present | |
| 1.12 | Hero mock cards (seeker + employer) visible | Two tilted mock cards with connector dots | |
| 1.13 | Hero copy animates in | Fade+translate animation on load (280ms) | |
| 1.14 | Reduced motion: hero animation disabled | At OS reduced-motion preference, copy/visual render immediately at full opacity, no animation | |

---

## Section 2: Role Selector

| # | Check | Expected | Result |
|---|---|---|---|
| 2.1 | Two role cards render | Job Seeker card + Employer card | |
| 2.2 | "Continue as Job Seeker" card CTA | Navigates to `/job-seekers` | |
| 2.3 | "Continue as Employer" card CTA | Navigates to `/employers` | |
| 2.4 | "Browse jobs" secondary link (below seeker card) | Navigates to `/jobs` | |
| 2.5 | "Start hiring" secondary link (below employer card) | Navigates to `/employers` | |
| 2.6 | Trust strip visible | `app-talent-proof-badge` + 3 feature chips visible | |
| 2.7 | Role card `ariaLabel` accessible | Screen reader announces "Continue as Job Seeker" / "Continue as Employer" | |

---

## Section 3: USP Section ("Not just a job board")

| # | Check | Expected | Result |
|---|---|---|---|
| 3.1 | Section heading renders | "Not just a job board" | |
| 3.2 | Subtitle renders | "Structured profiles, video answers…" | |
| 3.3 | Bridge SVG loads | Decorative SVG visible, no broken image | |
| 3.4 | 4 USP cards render | Stronger profiles / Video answers / Explainable match signals / Higher hiring confidence | |
| 3.5 | USP card icons load | 4 local SVGs from `/assets/brand/gethired-wow/` | |
| 3.6 | USP section hover animation | Cards lift on hover (if `prefers-reduced-motion: no-preference`) | |
| 3.7 | `appViewedOnce` analytics fires once | Console.debug shows `usp_section_viewed` event on scroll past section (dev mode only) | |

---

## Section 4: Bento/Differentiators Section ("What GetHired does")

| # | Check | Expected | Result |
|---|---|---|---|
| 4.1 | Section heading renders | "What GetHired does" | |
| 4.2 | 6 bento cards render | Structured profiles / CV support / Signals / Video answers / Application tracking / Employer dashboard | |
| 4.3 | Emoji icons visible in each card | 📄 📎 🧭 🎥 📋 🗂️ | |
| 4.4 | Grid responsive at 991px | 2-column layout | |
| 4.5 | Grid responsive at 575px | Single-column layout | |

---

## Section 5: Job Seeker Journey Section

| # | Check | Expected | Result |
|---|---|---|---|
| 5.1 | Section heading renders | "For job seekers: build your profile once…" | |
| 5.2 | 5 ordered steps render with step numbers | Steps 1–5 visible | |
| 5.3 | "Find jobs" CTA button | Navigates to `/jobs` | |
| 5.4 | Step numbers use teal color scheme | Teal circle backgrounds | |
| 5.5 | Journey grid is responsive | Wraps to fewer columns on small screens | |

---

## Section 6: Employer Journey Section

| # | Check | Expected | Result |
|---|---|---|---|
| 6.1 | Section heading renders | "For employers: post jobs and manage hiring…" | |
| 6.2 | 6 ordered steps render with step numbers | Steps 1–6 visible | |
| 6.3 | Step numbers use coral/red color scheme | Red-tinted circle backgrounds | |
| 6.4 | `app-talent-proof-badge` (strip variant) renders | Badge visible | |
| 6.5 | "Start hiring" primary CTA | Navigates to `/employers` | |
| 6.6 | "Learn more for employers" link CTA | Navigates to `/employers` | |
| 6.7 | Employer journey section has warm gradient background | Subtle off-white warm gradient | |

---

## Section 7: Product Preview Section (scroll reveal + tabs)

| # | Check | Expected | Result |
|---|---|---|---|
| 7.1 | Section reveals on scroll | Fades in from below as user scrolls to it (10% threshold) | |
| 7.2 | Reveal fires only once | Scrolling up and back down does not re-trigger animation | |
| 7.3 | Section visible immediately at reduced motion | `opacity: 1; transform: none` before scroll (CSS override) | |
| 7.4 | Analytics event fires on reveal | Console.debug shows `product_preview_section_viewed` (dev mode) | |
| 7.5 | Default tab "Job seeker profile" is active | First tab highlighted on load | |
| 7.6 | "Job seeker profile" tab panel renders | Mock profile card with Maria D., skills chips, completeness bar | |
| 7.7 | "Employer dashboard" tab | Clicks correctly, shows mock dashboard with job list | |
| 7.8 | "Application tracking" tab | Clicks correctly, shows 3 application status items | |
| 7.9 | "Video answers" tab | Clicks correctly, shows video question + mock player | |
| 7.10 | "Compatibility signals" tab | Clicks correctly, shows signals rings + explanatory copy | |
| 7.11 | Tab analytics fires on click | Console.debug shows `product_preview_tab_clicked` with tab name (dev mode) | |
| 7.12 | Tab panel CTAs navigate | "Build your profile" → `/job-seekers`; "Start hiring" → `/employers`; "Find jobs" → `/jobs` | |
| 7.13 | Tab ARIA attributes correct | Active tab has `aria-selected="true"`; tabpanel `aria-labelledby` matches active tab id | |
| 7.14 | Tab keyboard navigation | Tab key moves focus between tab buttons; Enter/Space activates | |
| 7.15 | Section heading "See how GetHired works" visible | Correct h2 | |
| 7.16 | Italic disclaimer visible | "Illustrative view of key features." | |

---

## Section 8: Trust & Safety Section (scroll reveal)

| # | Check | Expected | Result |
|---|---|---|---|
| 8.1 | Section reveals on scroll | Same reveal animation as Product Preview | |
| 8.2 | Section visible immediately at reduced motion | Immediate visible, no animation | |
| 8.3 | Analytics event fires on reveal | Console.debug shows `trust_safety_section_viewed` (dev mode) | |
| 8.4 | Section heading renders | "Built for clearer, more organized hiring" | |
| 8.5 | Subtitle renders | "GetHired helps organize hiring information…" | |
| 8.6 | 4 trust cards render | Guidance / Video reviewed / Structured data / Philippine hiring | |
| 8.7 | Emoji icons visible | 🛡️ 👥 📋 🇵🇭 | |
| 8.8 | 4-column grid at desktop | Four side-by-side cards | |
| 8.9 | 2-column grid at 991px | Two rows of two | |
| 8.10 | 1-column grid at 575px | Stacked cards | |

---

## Section 9: Employer Conversion Band (scroll reveal)

| # | Check | Expected | Result |
|---|---|---|---|
| 9.1 | Section reveals on scroll | Fade-in animation | |
| 9.2 | Section visible immediately at reduced motion | Immediate visible | |
| 9.3 | Analytics event fires on reveal | Console.debug shows `employer_conversion_band_viewed` (dev mode) | |
| 9.4 | Heading renders | "Ready to hire in the Philippines?" | |
| 9.5 | Copy renders | Correct description paragraph | |
| 9.6 | `app-talent-proof-badge` (strip variant) renders | Badge visible | |
| 9.7 | "Start hiring" CTA | Navigates to `/employers` | |
| 9.8 | Warm gradient background renders | Subtle coral-to-white gradient | |

---

## Section 10: Final CTA Band

| # | Check | Expected | Result |
|---|---|---|---|
| 10.1 | `app-portal-cta-band` component renders | "Ready to get started?" heading visible | |
| 10.2 | "Find jobs" primary CTA | Navigates to `/jobs` | |
| 10.3 | "Start hiring" secondary CTA | Navigates to `/employers` | |
| 10.4 | "Browse jobs without an account" link | Navigates to `/jobs` | |
| 10.5 | "Sign in" link | Navigates to `/signin` | |
| 10.6 | Glow effect above CTA band | Subtle radial glow present | |

---

## Section 11: Authenticated User Redirect (ngOnInit)

| # | Check | Expected | Result |
|---|---|---|---|
| 11.1 | Logged in as Admin (role 1) visits `/` | Redirected to `/admin` | |
| 11.2 | Logged in as Recruiter/Employer (role 2) visits `/` | Redirected to `/recruiter` | |
| 11.3 | Logged in as Job Seeker (role 3) visits `/` | Redirected to `/user` | |
| 11.4 | Not logged in visits `/` | Homepage renders, no redirect | |

---

## Section 12: PortalRevealDirective (cross-cutting)

| # | Check | Expected | Result |
|---|---|---|---|
| 12.1 | 3 sections use `appPortalReveal` | Product Preview + Trust & Safety + Employer Band | |
| 12.2 | Each section starts hidden (opacity 0) | Before scrolling to them, sections are transparent | |
| 12.3 | Each section reveals once | One-shot, observer disconnects after first reveal | |
| 12.4 | SSR: sections immediately visible | If testing SSR output, `.is-revealed` class present in server-rendered HTML | |
| 12.5 | Old browser (no IntersectionObserver): sections visible | Fallback adds `is-revealed` immediately — content never permanently hidden | |
| 12.6 | `(revealed)` event emits once per section | Analytics console log fires once per section, not repeatedly | |
| 12.7 | `ngOnDestroy` cleans up observer | Navigate away from `/` and back; no memory leak / duplicate events | |
| 12.8 | Reduced motion CSS overrides initial hidden state | With `prefers-reduced-motion: reduce`, `.portal-reveal-section` gets `opacity: 1; transform: none; transition: none` via CSS media query — sections visible without JS firing | |

---

## Section 13: SharedModule — Other Consumer Verification

| # | Check | Expected | Result |
|---|---|---|---|
| 13.1 | `/job-seekers` page loads | No errors; pre-existing components render correctly | |
| 13.2 | `/employers` page loads | No errors; pre-existing components render correctly | |
| 13.3 | Any authenticated route using SharedModule | Loads without "component not found" or declaration errors | |
| 13.4 | `ViewedOnceDirective` still works on USP section | `usp_section_viewed` fires on scroll (was not modified) | |
| 13.5 | No duplicate-declaration errors in console | No Angular DI/module errors in browser console | |

---

## Section 14: Mobile Viewport Spot-Check

| # | Check | Expected | Result |
|---|---|---|---|
| 14.1 | Hero at 375px viewport | Single-column layout; CTA buttons full-width, min-height 44px | |
| 14.2 | Role selector at 375px | Single-column card stack | |
| 14.3 | Product Preview tabs at 375px | Tabs wrap to multiple rows; panels stack vertically | |
| 14.4 | Trust & Safety at 575px | 1-column card stack | |
| 14.5 | Journey CTAs at 375px | Full-width stacked buttons | |

---

## Sign-off

| Result | Count |
|---|---|
| PASS | |
| FAIL | |
| SKIP | |

**Release decision:** GO / HOLD

**Tester signature:** _______________ **Date:** _______________
