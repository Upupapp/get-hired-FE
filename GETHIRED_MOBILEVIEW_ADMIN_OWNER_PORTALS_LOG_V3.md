# GETHIRED MOBILEVIEW — Admin/Owner Portals Log V3
Generated: 2026-06-26
Route: /admin/**  (AuthGuard, role=1)

---

## Shell (admin-panel.component)

**Mobile top bar:** `.gh-admin-mobile-topbar` — sticky, 56px, `d-flex d-md-none`
**Drawer:** `.gh-admin-mobile-drawer` — 280px, cdkTrapFocus
**Scrim:** `.gh-admin-mobile-scrim` — tap-to-close, aria-hidden
**Bottom nav:** `.gh-admin-mobile-nav` — fixed, safe-area padding
**Content push:** #sub-applicant-component padding-bottom: calc(70px + env(safe-area-inset-bottom)) at 767px
**Body push:** #body-main-container padding-top: 56px at 767px
**Focus management:** BL-003 confirmed — ViewChild #mobileMenuBtn, focus return on close

All mobile patterns match employer/applicant portals. CSS prefixed `.gh-admin-*`.

---

## Admin Tables (BL-006/BL-007 status)

As documented in V2 backlog, the `gh-responsive-table` pattern was NOT applied to admin tables
because the reusable-table component already has a dual-display system:
- `#table-container` — desktop mat-table
- `#table-container-mobile` — mobile card list with `.gh-mobile-card` system

The `.gh-mobile-card` system in reusable-table.component.scss:
- Reveal animation: gh-card-reveal (reduced-motion disabled)
- Tap compression: scale($gh-scale-press) on :active
- Action buttons: .gh-mobile-card__action-btn — min-width/min-height: 44px
- Selected state: background tint
- Labels: 90px min-width for consistent alignment

---

## Admin Users Table

Uses reusable-table — mobile card view. Not audited for specific column/label
data-binding this round.

---

## Admin Jobs Table

Uses reusable-table — mobile card view.

---

## Admin Companies Table

Uses reusable-table — mobile card view.

---

## Issues Found

| ID | Component | Issue | Severity | Status |
|----|-----------|-------|----------|--------|
| ADM-01 | admin sub-pages | Not individually audited — assumed empty SCSS + Bootstrap grid | Low | Deferred V4 |
| ADM-02 | admin sidebar (desktop) | Fixed 250px width, hidden on mobile via drawer | OK | Not an issue |

---

## Notes

- Admin portal does not have a "billing bar" equivalent (role-1 users don't subscribe)
- Admin nav drawer has same 52px nav items as employer/applicant
- No PayMongo code in admin portal — subscription is recruiter-only
