# Pricing page — backend dependencies

Raised by the front end (`gh-fe`) while moving the Subscription & Billing page onto
the backend pricing catalog. Measured against `get-hired-BE` HEAD on 2026-09-13.

The front end now renders **every** price, capacity and Recruitment Storage figure
from `GET /api/subscriptions/pricing-catalog`. It holds no plan values of its own.
BE-P1 is closed by an owner decision and needs no work. BE-P2 is served at gh-be
`4c3412d`, and the storage meter consumes it. BE-P3 to BE-P5 each require a change in
`get-hired-BE` and cannot be fixed from this repo.

---

## ⚠ Correction, 2026-09-13 — what production actually serves

An earlier version of this file said the backend catalog *"already models the entire
brief"*, including Recruitment Storage capacity and video questions per job, and that
those figures were *"live on the plan cards now"*. **That was measured against gh-be's
uncommitted working tree, not against `origin/main`.** Production is different:

| | `origin/main` @ `ad3b007` (production) | gh-be working tree (uncommitted) |
|---|---|---|
| Plans | 4 — `free_trial`, `starter`, `growth`, `business`. **No Enterprise.** | 5, incl. Enterprise |
| Jobs / users | 1/1 · 2/1 · 6/3 · 20/8 | 1/1 · 5/2 · 15/5 · 40/15 |
| `recruitment_storage_bytes` | **absent** | 1 / 10 / 50 / 200 GB / null |
| `video_questions_per_job` | **absent** | 1 / 3 / 5 / 10 / null |
| `applicants`, `featured_job_credits` | **absent** | present |
| Prices | ₱1,490 / ₱3,490 / ₱6,990 | identical |

The page rendered absent keys as "Custom", so against production it would have told a
Starter employer it had custom storage. **Fixed:** the page now distinguishes an
*absent* key (catalog does not model it → nothing shown) from an explicit `null`
(Enterprise → "Custom"). Capacity lines, Compare-plans rows and the storage/video FAQ
entries all appear only when the catalog carries the field. The page is correct against
production today and picks the new entitlements up automatically when gh-be commits them.

Prices were never affected — they are identical in both.

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

## BE-P2 — Recruitment Storage usage — SERVED at gh-be `4c3412d`, meter built (B3)

**Update, 2026-09-13.** gh-be committed the requested block at `4c3412d` (A2).
`GET /api/subscriptions/employer/summary` now returns `usage.recruitment_storage` in
the `EntitlementUsageV4` shape, with `used`, `limit` and `remaining` in bytes. It adds
`storageStatus`: `normal`, `notice` (70%), `warning` (80%), `critical` (90%) or `full`
(100%), and `null` while the count is unavailable. Plan capacity
(`recruitment_storage_bytes`) is committed at `872f3ae` (A1). Neither commit was on
gh-be's `main` when the meter was built, so production still sends no block.

The front end reads that shape at the commit, not from a working tree:

- `subscription-usage-meter` has a storage mode whose bands come from `storageStatus`
  alone, so no threshold is derived in the front end.
- The subscription page renders the meter in the Usage cockpit **only when the block is
  present**. With no key (production today) or a failed request, no meter renders.
- At 100% the copy says existing applications and candidate media stay safe.

**Still not built, because nothing serves it:**

- the per-category breakdown (video responses / CVs & documents / other); the block
  carries a total only
- "Free Up Storage" and any storage-driven upgrade nudge beyond the meter's own note

---

## BE-P3 — Summary omits entitlements the catalog already defines

`controllers/subscriptionGuardrailsControllerV4.js` returns usage for
`active_job_posts` and `admin_users` only. gh-be's uncommitted catalog defines four
more entitlements with no usage counterpart: `video_questions_per_job`, `applicants`,
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
- `contactSalesRequired` and the four extra entitlement fields are sent only by gh-be's
  uncommitted catalog, not by production. `subscription-v4.models.ts` declares them as
  **optional**, and the page renders nothing for a key that is absent.
