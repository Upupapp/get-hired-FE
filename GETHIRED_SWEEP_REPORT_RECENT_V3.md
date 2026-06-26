# GetHired SWEEP — LAUNCH-01/02 P0 Deployment
**Report date:** 2026-06-26
**Scope:** LAUNCH-01 (in-app submit feedback) + LAUNCH-02 (application confirmation + status-change email)
**Commits:** BE `072b88a` (deployed), FE `e549cdc` (GitHub, Linode pending)

---

## Summary Verdict

| Area | Status | Notes |
|------|--------|-------|
| BE application email | SHIPPED | Confirmation + status-change, non-blocking |
| FE submit state machine | SHIPPED | 5 states, double-submit guard |
| NgRx errorCode support | SHIPPED | 409 duplicate detection end-to-end |
| Inline success/duplicate/error panels | SHIPPED | Replace form on success/duplicate |
| CSS animations | SHIPPED | `panel-reveal` + reduced-motion |
| Status-change endpoint | SHIPPED | PUT /application/status + BOLA guard |
| APPLICANT_SAFE_STATUS_MAP | SHIPPED | Single source of truth for status labels |
| PII log removal | SHIPPED | `console.log(msg)` eliminated from mailer.js |

---

## Files Changed (13 files across BE/FE)

### BE
| File | Change |
|------|--------|
| `helpers/mailer.js` | async send(), PII log removed, `application_status_changed` key, missing-template guard |
| `services/application.service.js` | `APPLICANT_SAFE_STATUS_MAP`, enriched return, confirm email, `updateApplicationStatus()` |
| `controllers/applicationController.js` | `updateApplicationStatus` controller |
| `routes/applicationRoute.js` | `PUT /application/status` |
| `db/application_notification_events_ddl.sql` | Notification ledger migration (pending apply) |

### FE
| File | Change |
|------|--------|
| `application.actions.ts` | `errorCode?` |
| `application.reducer.ts` | `errorCode` state |
| `application.selector.ts` | `getErrorCode`, `getSubmitResult` |
| `application.facade.ts` | `error$`, `errorCode$`, `submitResult$` |
| `application.effects.ts` | 409 errorCode + multi-field error fallback |
| `application-process.component.ts` | `submitStatus` machine, double-submit guard, `afterSubmit` |
| `application-process.component.html` | Inline panels, spinner button |
| `application-process.component.scss` | `panel-reveal`, reduced-motion, mobile CTAs |

---

## New API Surface

`PUT /application/status` — employer updates applicant status with notification email
- Auth: `verifyAuth` (JWT)
- Body: `{ applicationId, newStatusId }` (1–6 int validated)
- Response: `{ updated: bool, reason?, applicationId, oldStatusId?, newStatusId?, newStatusLabel? }`
- BOLA: callerCompanyId verified from JWT + DB, never from body

---

## Gaps Found / Open Items

| Item | Priority |
|------|----------|
| FE not deployed to Linode | P0 |
| `application_notification_events_ddl.sql` not applied to prod DB | P0 |
| Firebase service account key in git history (pre-existing) | P0 security |
| Dedicated SendGrid template for status-change | P1 |
| Focus management on panel reveal (WCAG 2.4.3) | P1 |
| Employer portal FE wired to PUT /application/status | P1 |
| DB outbox for idempotency (Layer 2) | P1 |
