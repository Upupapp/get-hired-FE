# GETHIRED CREATE JOB — SECURE REPORT
**Scope:** `/recruiter/jobs/create` — 4-step job creation wizard
**Date:** 2026-06-26

---

## Confirmed Secure

| Check | Status | Evidence |
|---|---|---|
| `POST /job/create` BOLA — companyId from JWT | ✅ Secure | QA8 FIX-2: `callerCompany = getUserCompanyForRequest(req, uid)` |
| `PUT /job/updatejobs` BOLA — ownership verified | ✅ Secure | `getJobCompanyId(jobId) !== callerCompany.companyId` → 403 |
| Both endpoints behind `verifyAuth` | ✅ Secure | `router.post("/job/create", verifyAuth, ...)` |
| Interview template created under caller's companyId | ✅ Secure | `createInterviewTemplateQuestions(jobId, "default", companyId, uid)` |
| Banner stored in cloud storage (not served from BE) | ✅ Secure | `uploadInStorage("Job-Banner", ...)` |
| SQL injection — all queries parameterized | ✅ Secure | INSERT query uses `$1..$20` positional params |
| No auth token in URL/logs | ✅ Secure | JWT in Authorization header only |

---

## Open Security Issues

### S-01 — HIGH — Banner Upload: 300MB Size Limit
- **File:** `job-post-detail-step.component.ts:72` — `event[0].size <= 300000000`
- **Issue:** 300MB is the effective maximum for a job banner image. A recruiter (or attacker with valid auth) can upload a 300MB file that will be read into memory, base64-encoded in the browser, and sent in the POST body. This can exhaust browser memory (DoS on the tab) and puts 400MB+ of base64 through the server's body parser.
- **STRIDE:** DoS (client-side memory exhaustion)
- **OWASP:** A05:2021 Security Misconfiguration
- **Fix:** Change to `5 * 1024 * 1024` (5MB) for a job banner image. Images above 5MB offer no display benefit.
- **Status:** ❌ OPEN

### S-02 — MEDIUM — companyId Still Read from localStorage for Subscription Check
- **File:** `job-create.component.ts:134-138`
- **Issue:** `companyId` is read from `localStorage.getItem('user')` and passed to `jobFacade.getCompanySubscription(companyId)`. A user who manipulates localStorage can fetch a different company's subscription data (how many job posts they've used). BE must also verify this.
- **Risk:** Low — the FE uses this only to show a "not allowed to publish" warning; actual job creation still uses JWT-derived companyId. A crafted localStorage could let a recruiter see a competitor's job-post count.
- **STRIDE:** Information Disclosure
- **Status:** ❌ OPEN (low priority)

### S-03 — LOW — expirationDate Missing from FE but Destructured in BE
- **File:** BE `createJobs:65` — `expirationDate` destructured from `req.body` but FE never sends it
- **Issue:** `expirationDate` will always be `undefined` on new job creates. The column is nullable so this doesn't cause an insert failure, but it means jobs never expire automatically.
- **Status:** ❌ OPEN (product gap, not a security issue per se)

---

## XSS Assessment
- All job text fields (`jobTitle`, `jobDescription`, `jobDuties`, requirements, etc.) are stored in DB and rendered server-side via Angular's `{{ }}` interpolation (auto-escaped) and `[innerHTML]` is not used on this page.
- `bannerFile` is stored as a URL, not rendered as HTML.
- ✅ No XSS vectors identified

## CSRF Assessment
- All mutations use Authorization: Bearer JWT (not cookie-based), making CSRF not applicable.
- ✅ Not vulnerable

## Rate Limiting
- `POST /job/create` goes through the global rate limiter (50 req/15min per IP) + `writeLimiter` (20 req/1h per IP).
- ✅ Adequate for recruiter creation flow
