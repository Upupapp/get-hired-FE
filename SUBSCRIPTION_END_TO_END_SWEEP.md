# Subscription journey sweep

Repository: `/Users/user/get-hired-FE`

Branch: `codex/subscription-engagement-ui`

## Verified locally

- Upgrade preview selects a server price and cycle; invalid or unavailable previews disable checkout.
- Checkout sends plan/cycle/idempotency data without client prices or account identifiers.
- Checkout navigates to the returned HTTPS hosted payment page.
- Retry keys persist through ambiguous checkout creation failures.
- Payment status reads are account-scoped, bounded, and cannot overlap.
- Pending status does not activate a plan.
- Paid status names a plan only from the authoritative active subscription snapshot.
- Settlement refreshes engagement and the notification center.
- Storage add-on checkout does not fabricate paid capacity.
- Subscription/storage/Enterprise/return routes and existing invoice workflows are connected.

An integrated Angular HTTP test now exercises checkout creation → PENDING → PAID → checkout refresh through the actual checkout service and return component.

## End-to-end boundary

The local frontend configuration points at `http://localhost:3000/api`. No backend responded on local ports 3000 or 8080 during this run. The component review server responded on port 4307, but it uses fixtures and is not the authenticated product/backend journey.

Real browser/provider end-to-end confirmation is therefore pending a running local test backend and a test employer account. No PayMongo checkout, payment, webhook delivery, customer email, or live notification was initiated. Unit/HTTP-contract checks are not reported as provider end-to-end results.

Backend repository was read only. Nothing pushed, merged, or deployed.

## Isolated local API journey result

Created a disposable `e2e-owner` billing-owner account and company in an in-memory PGlite database. The repeatable frontend-owned runner reads the backend CJS billing domain and HTTP handlers without editing them, starts a loopback-only API, and uses a simulated provider. It shuts down the API/database after testing.

Run: `npm run test:subscription:journey`. Override the read-only backend location with `GETHIRED_E2E_BACKEND` if needed.

**11 local API journey checks passed, 0 failed**: preview price, hosted HTTPS URL response, idempotent creation, pending-before-webhook behavior, account/role isolation, paid conversion with authoritative caps, duplicate receipt prevention, paid-only storage capacity, duplicate add-on refusal, failed payment retaining the existing plan, and subsequent paid recovery to Premium.

**684 Angular tests passed**, with production browser and SSR builds passing. These browser tests include an integrated frontend HTTP checkout → pending → paid → refresh test. They do not replace a full authenticated browser journey against the API or real PayMongo hosted checkout. No external provider was contacted.
