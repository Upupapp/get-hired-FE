# GETHIRED MOBILEVIEW — Subscription & Payment QA V2
Generated: 2026-06-25

## Critical Constraint
**NEVER change MATCH scoring, payment/subscription behavior, PayMongo, SendGrid.**

This document audits mobile layout ONLY. No payment flow, pricing, or PayMongo integration was modified.

---

## Components Audited

### EmployerSubscriptionComponent
**File:** src/app/employer-panel/employer-subscription/
**Route:** /recruiter/subscription

**Mobile nav access:**
- Desktop: Left sidebar has subscription link
- Mobile (prior session): Billing bar above bottom nav provides direct access
- Mobile (drawer): Subscription item in employer panel drawer (item 6)
- Both added in prior sessions — accessible on mobile

**Layout assessment:**
- Subscription plan cards: If using Bootstrap grid `col-12 col-md-6` or `col-lg-4`, they stack on mobile
- Billing info form: Single-column forms stack well
- Plan comparison table (if any): May overflow at mobile — wrap in `gh-table-scroll` or use card display

**Not modified:** Only layout recommendations made. No pricing, plan data, or PayMongo integration touched.

---

### PayMongo Integration
**Status:** Not modified. Not examined in detail.
**Mobile behavior of PayMongo:**
- PayMongo checkout is typically an external redirect (hosted page) or embedded iframe
- If embedded iframe: `iframe { max-width: 100%; height: auto }` applied globally covers sizing
- External redirect: Browser handles the PayMongo payment page responsively

---

### Cart / Payment Flow
**File:** src/app/cart/
**Status:** Not modified.
**Mobile:** Cart items should stack vertically. If mat-table used, may need responsive wrapper.

---

## Mobile Subscription Access Summary

| Access Point | Mobile Available | Method |
|-------------|-----------------|--------|
| Drawer nav item | Yes | Employer drawer, item 6 |
| Billing bar | Yes | Fixed bar above bottom nav |
| Dashboard CTA | Yes | If present on employer dashboard |
| Direct URL | Yes | /recruiter/subscription |

**Verdict:** Subscription is accessible on mobile via 3 different touch points. No critical mobile gap.

---

## Backlog

1. Subscription plan cards: Verify `col-12 col-md-*` stacking at 375px (no code change needed if Bootstrap grid is used correctly)
2. Plan comparison table: Add `.gh-table-scroll` if horizontal overflow exists
3. PayMongo embed: Verify iframe responsive sizing (covered by global `iframe { max-width: 100% }`)
