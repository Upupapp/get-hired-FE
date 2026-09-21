# Internal / Complimentary frontend compatibility

Checked against frontend master c57de60d and the prepared backend integration contract (76a8550), on 2026-09-21.

## Findings and fixes

- Company dashboard previously labeled any isPaid=false record Free plan. It now preserves the assigned plan name and shows Internal / Complimentary when the server identifies complimentary access. Usage meters remain unchanged; renewal dates are hidden.
- Subscription overview now recognizes the explicit server classification, displays the complimentary label and no-payment explanation, and retains plan identity and usage limits.
- Upgrade recommendations, catalog purchase prompts and storage purchase controls are suppressed for internal accounts. Storage checkout also has a method-level guard. Ordinary unpaid accounts are not inferred to be complimentary.
- The legacy subscription screen suppresses its payment/upgrade controls and replaces its payment-date display with No payment required.
- Frontend contract types accept the additive backend access metadata. The backend company restrictions endpoint delegates to companySubscriptions, which already forwards those fields from the prepared backend implementation.

## Validation

674 frontend tests passed locally in ChromeHeadless with Node 16.20.2. Added regressions verify Premium identity survives isPaid=false, purchase prompts and storage checkout are suppressed, and ordinary unpaid accounts retain normal behavior. This was a local test run, not a GitHub Actions run.

The first gate attempt hit an incompatible global npm 11 under Node 16 before any specs ran. Direct Angular CLI execution on Node 16 passed; npm 8.19.4 is used for the mandatory local pre-push gate.

## Release boundary

No deployment, production grant, paid-flag change or live-account browser test was performed in this step. Frontend and backend changes must be deployed together before clearing the internal Premium record's paid flag. Direct upgrade-route screens may still display pricing; prepared backend checkout handlers reject purchases for an internal account. Server authorization remains authoritative.

Next integrate current backend production changes, stage both applications, verify the actual portal flow, then apply the audited grant/correction. Verify internal-account exclusions across referral feeds and financial metrics separately. LGUIDS remains untouched. GitHub Actions must remain disabled.
