# GETHIRED MOBILEVIEW — Subscription & Payment QA V3
Generated: 2026-06-26

---

## Employer Subscription Page (/recruiter/subscription)

**Component:** `employer-subscription.component.html` → `<app-subscriptions>`
**employer-subscription.component.scss:** 114 lines of plan card styles

### Layout:
- `.bg-pink`: padding 60px 30px 150px 30px — at 360px/280px this bottom padding is very tall
- Plan cards: Bootstrap grid (assumed col-12 on mobile — single column)
- `.title-main`: 30px font-size, no mobile override
- `.title-sub-cost`: 30px font-size, no mobile override

### Button touch targets:
- `.btn-get-started`: padding:8px 20px + line-height:27px → ~43px — borderline
- `.btn-subscribe`: padding:10px 20px + line-height:21px → ~41px — below 44px
- `.btn-subscribe-active`: padding:10px 20px + line-height:21px → ~41px — below 44px
- **BL3-001:** None of these have `min-height: 44px`

---

## PayMongo Integration

**Critical constraint: DO NOT TOUCH PayMongo code.**

PayMongo behavior is in `employer-subscription.component.ts` (payment intent, webhook, checkout flow).
This V3 sweep explicitly excludes all JS logic from the subscription component.
Only CSS/SCSS changes to the subscription plan cards would be permitted, and those
are deferred to backlog BL3-001 to avoid any risk of breaking payment flow.

---

## Billing Bar (Mobile)

**employer-panel.component.scss:**
- `.gh-billing-bar`: fixed, bottom: calc(56px + env(safe-area-inset-bottom)), z-index:999
- `.gh-billing-bar-link`: flex, 11px font, padding:4px 8px, opacity transition
- d-md-none — visible mobile only
- Links to subscription page

**Touch target of billing bar link:** 4+8 = 12px vertical padding + ~11px line = ~23px — below 44px
- Added to backlog BL3-003 (billing bar link touch target)
- Low priority: it's a secondary navigation element, not a primary CTA

---

## Cart / Checkout Flow

**cart component:** Not audited in V3. Sits at `/recruiter/cart` or similar.
Deferred to V4.

---

## Issues Found

| ID | Component | Issue | Severity | Status |
|----|-----------|-------|----------|--------|
| SUB-01 | employer-subscription | .btn-subscribe, .btn-subscribe-active, .btn-get-started all ≈41-43px — below 44px | Medium | Backlog BL3-001 |
| SUB-02 | employer-subscription | .bg-pink bottom padding 150px — very tall on mobile | Low | Backlog BL3-004 |
| SUB-03 | billing bar | .gh-billing-bar-link ≈23px height — below 44px | Low | Backlog BL3-003 |
| SUB-04 | cart/checkout | Not audited | Low | Deferred V4 |
