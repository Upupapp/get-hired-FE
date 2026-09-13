# Pricing page — backend dependencies

Raised by the front end (`gh-fe`) while moving the Subscription & Billing page onto
the backend pricing catalog. Measured against `get-hired-BE` HEAD on 2026-09-13.

The front end now renders **every** price, capacity and Recruitment Storage figure
from `GET /api/subscriptions/pricing-catalog`. It holds no plan values of its own.
BE-P1 is closed by an owner decision and needs no work; BE-P2 to BE-P5 each require
a change in `get-hired-BE` and cannot be fixed from this repo.

---

## BE-P1 — RESOLVED, no backend change required

**Owner decision, 2026-09-13: the approved prices are ₱1,490 / ₱3,490 / ₱6,990** —
which is exactly what `services/planCatalogServiceV4.js` already serves. The
₱1,290 / ₱2,990 / ₱5,990 figures in the original brief are superseded. **Nothing to
change in the backend catalog.**

| Plan | Monthly | Annual | Effective monthly | Annual saving |
|---|---|---|---|---|
| `starter` | ₱1,490 | ₱14,900 | ₱1,242 | ₱2,980 |
| `growth` | ₱3,490 | ₱34,900 | ₱2,908 | ₱6,980 |
| `business` (shown as Premium) | ₱6,990 | ₱69,900 | ₱5,825 | ₱13,980 |

These are already internally consistent with the file's *12 months for the price of
10* rule, so the derived fields need no adjustment either.

**What this closed.** Before this work the page rendered a hardcoded `PLAN_CONFIGS`
array showing ₱999 / ₱2,499 / ₱4,999 while checkout billed from the catalog at
₱1,490 / ₱3,490 / ₱6,990. Employers were shown one price and charged another, on
every paid tier. The page now reads the catalog directly, so the figures above are
what it displays and what it charges — and the two cannot diverge again, because
there is only one source.

Note the upgrade/checkout screen (`upgrade-annual-first-landing.component.ts`) was
already catalog-driven and had always shown the correct prices. Only the main
pricing page carried the stale local copy, which is why the mismatch was not
obvious from the checkout flow.

---

## BE-P2 — No Recruitment Storage usage anywhere (BLOCKS the meter)

Plan **capacity** exists and is already served: `recruitment_storage_bytes`
(1 GB / 10 GB / 50 GB / 200 GB / null). It is live on the plan cards and in
Compare plans now.

Consumed **bytes** do not exist. There is no aggregation over applicant video
responses, CVs, documents or portfolio files anywhere in the backend, and no
endpoint exposes one.

Consequently the following are **not built at all** — no markup, no disabled
control, no "coming soon". A comment at the top of `employer-subscription.component.ts`
records why and points here:

- the storage usage meter (`37.4 GB of 50 GB used`)
- the 70 / 80 / 90 / 100 % warning states
- the per-category breakdown (video responses / CVs & documents / other)
- "Free Up Storage" and any storage-driven upgrade nudge

**Requested:** add `recruitment_storage` to the entitlement usage block that
`GET /api/subscriptions/employer/summary` already returns for `active_job_posts`
and `admin_users`, using the same `EntitlementUsageV4` shape (`used`, `limit`,
`remaining`, `percentUsed`, `warningLevel`, `countSource`, `countConfidence`).
`used` in bytes. The existing `warningLevel` thresholds map onto the required
states directly.

A breakdown by media type would additionally enable the category rows; the total
alone is enough to switch the meter on.

---

## BE-P3 — Summary omits entitlements the catalog already defines

`controllers/subscriptionGuardrailsControllerV4.js` returns usage for
`active_job_posts` and `admin_users` only. The catalog defines four more that have
no usage counterpart: `video_questions_per_job`, `applicants`,
`featured_job_credits`, `recruitment_storage_bytes`.

Without them the page can state a plan's limit but never how much of it is used,
so the usage cockpit stops at jobs and seats.

---

## BE-P4 — Storage add-ons have no purchase path

The brief specifies add-ons (+25 GB ₱499, +100 GB ₱1,499, +250 GB ₱2,999, 500 GB+
contact sales). There is no catalog entry, no price, and no checkout path for any
of them.

**They are not rendered at all** — not greyed out, not "coming soon". A purchase
button that cannot transact is the dead CTA the brief forbids. Needs a catalog
shape and a checkout intent before any UI is justified.

---

## BE-P5 — Plan capabilities in the brief that no entitlement backs

Compare plans lists only what the backend models. These appear in the brief's
feature lists but have no entitlement, so they are deliberately absent rather than
ticked:

Talent pools · candidate tagging · bulk candidate actions · custom hiring
pipelines · candidate scorecards · candidate notes · advanced filters ·
source-of-hire reporting · hiring funnel reports · recruiter performance ·
SSO / SAML · API access · audit logs · custom data retention · job templates ·
enhanced careers page · AI Applicant Summary · advanced AI hiring tools

Each needs a boolean entitlement in `PLAN_CATALOG` before it can be shown. Showing
a tick for a capability nothing enforces would be a false claim on a paid product.

---

## BE-P6 — `business` vs `premium` naming

Backend slug is `business` (DEC-02, with `premium` kept as a legacy alias). The
product and the live UI both say **Premium**.

The front end holds exactly one display-name override
(`plan-presentation.model.ts` → `DISPLAY_NAME_OVERRIDES`) so the slug stays
canonical for routing, checkout and current-plan detection while the label matches
the product. If the backend ever renames the plan, delete that entry — it is the
only place the two diverge.

---

## What the front end already consumes correctly

No action needed on these; recorded so they are not "fixed" into something else.

- `pricing.monthly` / `pricing.annual` including `dueTodayLabel`,
  `effectiveMonthlyLabel`, `annualSavingsAmount` — the annual toggle is driven
  entirely by these, and the due-today disclosure is always shown so an upfront
  annual charge is never presented as monthly billing.
- `monthlyAvailable` / `annualAvailable` — the cycle toggle only renders when both
  are true, so it can never be a control that does nothing.
- `current` — used for current-plan detection in preference to the summary's raw
  code, because the backend resolves legacy slug aliases before setting it.
- `upgradeRoute` — `null` for the trial and Enterprise is read as "no self-serve
  checkout", which is what routes Enterprise to Contact Sales.
- `contactSalesRequired` and the four extra entitlement fields were being sent but
  were missing from the FE types; `subscription-v4.models.ts` now declares them.
