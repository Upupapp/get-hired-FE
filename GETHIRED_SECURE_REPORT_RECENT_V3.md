# GetHired SECURE — LAUNCH-01/02 P0 Security Audit
**Commits:** BE `072b88a`, FE `e549cdc`
**Date:** 2026-06-26

---

## Overall Security Posture: STABLE

No new vulnerabilities introduced. All LAUNCH-01/02 surfaces are clean.

---

## New Attack Surface: PUT /application/status

### BOLA (Broken Object Level Authorization)
**PASS**

Ownership chain:
1. `uid` from JWT (Firebase, server-verified)
2. `getUserCompanyForRequest(req, uid)` → `callerCompany.companyId` (from DB)
3. `SELECT job_applicants JOIN jobs WHERE job_application_id = $1` → `app.company_id` (from DB)
4. `callerCompany.companyId !== app.company_id` → FORBIDDEN

Neither company ID trusts the request body. BOLA-clean.

### Escalation: Applicant calling employer endpoint
**PASS**

`getUserCompanyForRequest` returns null/empty for applicants (who have no company record).
Controller check: `if (!callerCompany || Array.isArray(callerCompany)) return res.status(403)...`

### Input injection
**PASS**

- `applicationId`: passed to parameterized query `WHERE job_application_id = $1` — SQLi-safe
- `newStatusId`: `parseInt()` + range check (1–6) + NaN guard

### Email recipient hijack
**PASS**

Recipient email from `getUserProfileById(applicant_id)` (DB-sourced), never from request body.

---

## Existing Surface: POST /application/apply

### candidateId BOLA fix (pre-existing)
**STILL INTACT**

`candidateId` derived from `uid` (JWT), never from request body. Unchanged.

### PII log elimination
**FIXED IN THIS COMMIT**

`console.log(msg)` removed from `mailer.js`. Email address no longer logged anywhere in the application email flow.

---

## Email Privacy Audit

| Data | In email? |
|------|-----------|
| Employer notes | ✗ |
| Match/AI score | ✗ |
| Protected attributes | ✗ |
| Internal status ID | ✗ (always mapped via APPLICANT_SAFE_STATUS_MAP) |
| Raw CV/video URLs | ✗ |
| SendGrid API key | ✗ |
| First name | ✓ (applicant's own data, appropriate) |
| Job title | ✓ (public job posting data) |
| Company name | ✓ (public company data) |

---

## Pre-Existing Issues (Not Introduced by LAUNCH-01/02)

| Issue | Status |
|-------|--------|
| Firebase service account key in git history | P0 — pre-existing, not changed by this commit |
| `bypassSecurityTrustUrl` in recorder.component.ts | P1 — pre-existing, not changed |
| 184 npm vulnerabilities (GitHub Dependabot) | Pre-existing |

---

## Verdict by OWASP Category

| OWASP | Check | Result |
|-------|-------|--------|
| API01 BOLA | Status update ownership chain | PASS |
| API03 Excessive data exposure | Email template data | PASS |
| API05 Function level auth | Applicant cannot call employer status update | PASS |
| API08 Security misconfiguration | No new env vars introduced without guards | PASS |
| Logging | PII removed from mailer log | PASS (fixed) |
