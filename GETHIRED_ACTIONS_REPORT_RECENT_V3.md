# GetHired ACTIONS — LAUNCH-01/02 P0 Backlog
**Generated:** 2026-06-26
**Source:** LAUNCH-01/02 audit, test log, release gate, security QA

---

## P0 Blockers (Must complete before FE live)

| ID | Action | Owner | Notes |
|----|--------|-------|-------|
| A-01 | Deploy FE to Linode (GitHub Actions secrets + rsync) | DevOps | FE at `e549cdc` pending |
| A-02 | Apply `db/application_notification_events_ddl.sql` to prod | DevOps | `psql` command in release gate |
| A-03 | Rotate Firebase service account key (in git history) | Security | Pre-existing, escalated to P0 |

---

## P1 (Ship within 2 weeks)

| ID | Action | Notes |
|----|--------|-------|
| A-04 | Create dedicated SendGrid template for `application_status_changed` | Different subject line/copy per status |
| A-05 | Wire employer portal FE to `PUT /application/status` | Endpoint is live, FE not connected |
| A-06 | Add focus management on panel reveal (WCAG 2.4.3) | `tabindex="-1"` + `focus()` on panel |
| A-07 | DB outbox Layer 2 (idempotency table for emails) | Prevents rare crash-then-retry duplicate emails |
| A-08 | GitHub PAT renewal on Linode (pre-existing P1) | Needed for future FE auto-deploys |

---

## P2 (Nice to have)

| ID | Action | Notes |
|----|--------|-------|
| A-09 | Status chip color coding on `/user/applications` | Needs design tokens |
| A-10 | Deep-link from success panel to specific application | `router.navigate(['/user/applications', id])` |
| A-11 | Email retry queue for transient SendGrid failures | Requires outbox table from A-07 |
| A-12 | Status-specific email copy per status label | "Shortlisted" copy vs "Under review" copy |
| A-13 | Email bounce/suppression list handling | SendGrid webhook integration |
| A-14 | Automated integration test for `PUT /application/status` | Unblocked once A-02 applied |
| A-15 | E2E test for 409 duplicate detection | Playwright or Cypress |

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Non-blocking email (no await on send) | Application creation must never be blocked by email failure |
| Shared SendGrid template for P0 | Dedicate template post-P0 to avoid blocking ship date |
| No fake progress animation on submit | Honesty principle — show actual network state |
| `submitResult$` combined selector vs 3 subscriptions | Prevents double-handle of transition states |
| BOLA ownership from DB, not request body | Matches existing BOLA fix pattern in this codebase |
