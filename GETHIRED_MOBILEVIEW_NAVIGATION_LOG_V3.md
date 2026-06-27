# GETHIRED MOBILEVIEW — Navigation Log V3
Generated: 2026-06-26

---

## Public Navigation (Header / Public Shell)

- PublicComponent shell: no dedicated mobile nav — uses Bootstrap responsive navbar via public.component.html
- SSR guard: safeParseUser() typeof localStorage guard in place (MV3-F3 confirmed)
- Language selector: not audited this round — deferred to backlog (low risk, cosmetic)

---

## Employer/Recruiter Portal Navigation

**Mobile top bar** (`d-flex d-md-none`, sticky, height 56px):
- Logo icon + "GetHired" title
- Hamburger button: `#mobileMenuBtn`, aria-expanded, aria-controls="gh-mobile-drawer", aria-label dynamic
- 44×44px tap target confirmed

**Scrim overlay:**
- `gh-mobile-scrim` + `gh-mobile-scrim--visible`
- Tap to close drawer
- aria-hidden="true" (screen readers don't land on it)

**Drawer** (`gh-mobile-drawer`, 280px wide, z-index 1001):
- cdkTrapFocus + cdkTrapFocusAutoCapture (BL-011 resolved)
- Close button: `gh-drawer-close-btn` 44×44px
- Nav items: `gh-drawer-nav-item` height 52px, aria-current, routerLinkActive
- Routes: Dashboard, Jobs, Candidates, Messages, Company, Subscription, Interview Hub
- Escape key closes drawer via @HostListener
- Focus returns to hamburger on close via ViewChild + setTimeout

**Bottom nav** (`gh-mobile-nav`, fixed, z-index 999, safe-area padding):
- Icons: Dashboard, Jobs, Post (CTA), Applicants, Company
- Each item: min-width 44px, min-height 44px, focus-visible ring

**Billing bar** (`gh-billing-bar`, above bottom nav):
- d-md-none — visible mobile only
- Bottom: calc(56px + env(safe-area-inset-bottom))

**Desktop sidebar** (`employer-sidebar`):
- Sticky position, 250px wide, hidden on mobile via `d-none d-md-block`
- Keyboard focus: gh-sidebar-item focus-visible ring

---

## Applicant Portal Navigation

**Same pattern as Employer** with `.gh-ap-*` prefix classes.
- Routes: Dashboard, My Jobs, Applications, Profile, Settings
- BL-002: focus returns to hamburger on drawer close — CONFIRMED in applicant-panel.component.ts

---

## Admin Portal Navigation

**Same pattern as Employer** with `.gh-admin-*` prefix classes.
- Routes: Dashboard, Users, Jobs, Companies, Reports (admin-specific)
- BL-003: focus returns to hamburger on drawer close — CONFIRMED in admin-panel.component.ts

---

## Issues Found

| ID | Issue | Status |
|----|-------|--------|
| NAV-01 | Public header mobile behavior (hamburger state) not audited at component level | Deferred — uses Bootstrap collapsed nav, not custom |
| NAV-02 | Language selector not mobile-audited | Deferred — cosmetic, low traffic |

---

## Accessibility Checklist

| Check | Status |
|-------|--------|
| aria-expanded on hamburger | PASS — all 3 portals |
| aria-controls references drawer id | PASS — all 3 portals |
| aria-label on hamburger (dynamic) | PASS — changes on open/close |
| aria-current="page" on active items | PASS — all 3 portals |
| Focus trap in drawer | PASS — cdkTrapFocus + cdkTrapFocusAutoCapture |
| Focus return to hamburger on close | PASS — BL-002, BL-003 confirmed |
| Escape closes drawer | PASS — @HostListener('document:keydown.escape') |
| Bottom nav items focus-visible | PASS — 2px brand-red ring |
