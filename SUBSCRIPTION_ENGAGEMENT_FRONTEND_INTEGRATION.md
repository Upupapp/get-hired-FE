# Subscription engagement frontend integration

Local branch: `codex/subscription-engagement-ui`

Frontend repository: `/Users/user/get-hired-FE`

Backend reference (read-only): `/Users/user/Documents/ChatGPT/GETHIRED`, branch `codex/subscription-engagement`

## Status

The employer shell now consumes the centralized engagement and notification APIs. It renders at most the backend-selected banner or dashboard card, clears stale UI while requests refresh, and hides engagement surfaces on unavailable or failed responses. Existing V4 lifecycle and entitlement responses remain in place for checkout status and hard-limit flows.

No commercial thresholds, recommendation eligibility, plan capacities, message ranking, or dismissal rules are calculated in the frontend.

## Backend endpoints

| Endpoint | Frontend use |
|---|---|
| `GET /api/employer/engagement/context` | Employer banner and dashboard card |
| `GET /api/employer/notifications?limit=100` | Employer notification center and unread count |
| `PATCH /api/employer/notifications/:id/read` | Confirmed read state |
| `PATCH /api/employer/notifications/:id/dismiss` | Confirmed dismissal when the API permits it |
| `POST /api/employer/notifications/:id/click` | CTA attribution before navigation |
| `POST /api/employer/notifications/:id/seen` | Once-per-persisted-message impression delivery |
| `GET /api/employer/subscription/recommendation` | Adapter ready for a recommendation view; no independent eligibility is calculated |
| Existing `/api/subscriptions/...` V4 endpoints | Checkout lifecycle, usage summary, limit responses, compatibility fallback |

The backend DTO is represented once in `employer-engagement.models.ts`. `EmployerEngagementAdapter` maps `banner` and `dashboardCard` into the established display model. A null message ID remains null; the client never invents an interaction ID.

## Component and surface mapping

| Backend surface | Frontend component or flow |
|---|---|
| Page banner | `SubscriptionStatusBannerComponent` through the employer shell |
| Dashboard card | `EngagementDashboardCardComponent` using the shared upgrade card |
| In-app notification | Existing header notification panel, extended with category, priority, CTAs and confirmed read state |
| Trial status | Existing `TrialStatusWidgetComponent`, using the backend-provided trial end date |
| Limit modal | Existing subscription limit modal used by job, team-user and video-question refusal paths |
| Locked feature | Existing feature-lock component, available when a response provides a capability decision |
| Storage destination | `/recruiter/subscription/storage` |
| Enterprise contact | `/recruiter/subscription/enterprise` |

Priority changes icon, label, border and live-region behavior; color is not the only signal. The client displays backend copy and does not infer urgency from dates or usage values.

Only allowlisted local recruiter routes are exposed as message CTAs. Unsupported or external server URLs are omitted. Storage and enterprise routes have real destinations. Enterprise contact opens a reviewable email draft and does not send automatically.

## Notification behavior

The existing bell architecture is reused. Employer rows come from the centralized endpoint and include Subscription/Billing filtering, unread styling, priority labels, keyboard focus trapping, Escape close, mobile layout, and backend-confirmed read/click operations. Dismiss is not shown for central list rows because the current list DTO does not expose `dismissible`; the frontend does not infer it from priority. A disabled central engine (`503 ENGAGEMENT_DISABLED`) falls back to the legacy bell. Other engagement failures produce no blocking UI.

## Refresh and stale-state handling

The context refresh bus runs after confirmed interactions, checkout settlement, account refresh requests, and the existing 45-second notification refresh. Each context request begins with a null state, so a message from the previous account state is not shown during refresh. Leaving the employer shell clears and cancels pending context work.

## Analytics

The frontend records safe, non-PII hooks for nudge impressions, clicks and dismissals; storage impressions and upgrade clicks; and existing feature-gate hooks. Persisted centralized messages also use backend seen/click endpoints. Event properties are limited to message/rule, priority, surface, meter and plan identifiers. Candidate names, email addresses, resumes and message content are excluded.

## Responsive and accessibility behavior

Cards and destination actions stack on narrow screens. The notification panel is available outside desktop-only navigation, traps focus while open, closes with Escape, exposes labels for category/priority/read status, and respects reduced motion. Usage meters expose progressbar values. High-priority messages use alert semantics; lower-priority content uses non-interrupting status semantics.

## Verification

- Angular tests: **677 passed** (`npm test -- --watch=false --browsers=ChromeHeadless`)
- Production browser and SSR build: **passed** (`npm run build:ssr`)
- App and spec TypeScript compilation: **passed**
- `git diff --check`: **passed**
- Existing unrelated test-console warnings and two existing autoprefixer warnings remain; the build exits successfully.

## Backend dependencies and contract limits

The frontend cannot safely complete these states until the backend supplies authoritative data:

- authoritative storage ledger/counters and storage deletion or add-on operations;
- authoritative per-job video-question counters;
- plan-version integration for capacities and benefit deltas;
- failed-payment-to-account mapping;
- a compatible deployed API runtime plus required migrations, worker and configuration;
- a capability/entitlement decision in the new employer context for proactive locked-feature rendering;
- a subscription snapshot/usage summary in the new context if it is to replace existing lifecycle/summary endpoints;
- `dismissible` on notification-list rows if notification-center dismissal should be offered safely.

When counters are pending, the frontend follows `availability: PENDING_EVALUATION` and shows no fabricated warning. Feature attempts and hard limits continue to rely on existing backend refusals; the frontend does not guess plan access from a plan name.

Backend report: [SUBSCRIPTION_ENGAGEMENT_FINAL_REPORT.md](/Users/user/Documents/ChatGPT/GETHIRED/SUBSCRIPTION_ENGAGEMENT_FINAL_REPORT.md)

## Local-only confirmation

- Nothing pushed.
- Nothing merged to `master` or `main`.
- Nothing deployed.
- No customer email or live notification sent.
- The pre-existing untracked `GETHIRED_FULLSTACK_SWEEP_2026-08-23.md` was not modified.

## PayMongo lifecycle integration

The upgrade landing now creates account-scoped payment attempts through `POST /api/employer/subscription/checkout`. It sends only `planCode`, `billingCycle`, and a client-generated idempotency key. The frontend never sends price, currency, company ID, subscription ID, provider reference, or payment result. The legacy `business` presentation slug is translated once to the backend `premium` plan code.

The payment attempt ID is retained across the HTTPS PayMongo navigation. The return screen reads `GET /api/employer/subscription/checkout/:paymentAttemptId/status`, maps only `PENDING`, `PAID`, `FAILED`, and `EXPIRED`, and polls every five seconds for at most two minutes. URL query data never declares payment success. A `PAID` response must contain the authoritative active subscription snapshot before the UI names the activated plan; confirmed settlement refreshes engagement and entitlement-backed views.

Checkout errors use safe application error codes and never display provider text. Monthly billing is the default because annual self-serve pricing is not currently approved. Annual selection remains visible for plan comparison, and an unavailable annual checkout is handled using `INVALID_BILLING_CYCLE` from the server.

The storage destination now starts server-priced add-on checkout through `POST /api/employer/storage-addons/checkout` for the three contract package codes. It shows no client-authored price and does not increase displayed capacity before the payment attempt is `PAID` and refreshed entitlements report the additional bytes.

PayMongo backend review documents:

- [Final report](/Users/user/Documents/ChatGPT/GETHIRED/PAYMONGO_FINAL_REPORT.md)
- [Integration contract](/Users/user/Documents/ChatGPT/GETHIRED/PAYMONGO_INTEGRATION_CONTRACT.md)
- [Frontend handoff](/Users/user/Documents/ChatGPT/GETHIRED/PAYMONGO_FRONTEND_INTEGRATION.md)

PayMongo rollout still depends on authoritative storage usage/deletion, authoritative per-job configured video-question counts, legacy payment/agreement backfill, runtime database migrations, and rollout configuration. No frontend fallback invents these values.

## Subscription sweep and stitching

The upgrade screen now calls `POST /api/employer/subscription/upgrade-preview` whenever the selected cycle changes. Checkout remains disabled until a successful server preview arrives. Price display uses integer minor amounts from that response; unavailable previews do not fall back to older catalog prices or annual savings. A request sequence guard prevents a slow previous-cycle response from overwriting the current selection.

The complete frontend regression suite passes 681 tests. This is local frontend/HTTP-contract validation, not a completed PayMongo provider end-to-end test. Hosted checkout loading and webhook fulfillment still require the configured backend test runtime. The browser navigates to PayMongo's returned HTTPS hosted payment page; it does not open an embedded popup.

Hosted-checkout follow-up sweep: status reads now prevent overlapping requests, inconclusive responses retain the saved attempt ID, and checkout preview validation requires a positive safe-integer PHP amount and the selected billing cycle. Browser redirect remains the approved payment experience. No provider checkout or live payment was initiated during this sweep.

Full subscription follow-up sweep: checked employer subscription/storage/enterprise/checkout-return routes, banner-versus-card collision handling, server price preview, hosted HTTPS redirect, payment status mapping, attempt persistence, bounded polling, storage add-on creation, and existing invoice viewing/download APIs. Checkout settlement now refreshes the notification center immediately through the shared refresh bus. Full regression suite: 683 passed. Provider end-to-end testing remains pending backend runtime/configuration; no PayMongo payment was initiated.
