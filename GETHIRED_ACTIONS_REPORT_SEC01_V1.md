# GETHIRED_ACTIONS_REPORT_SEC01_V1
## Prioritized Backlog — Post SEC-01 BOLA Fix

**Generated:** 2026-06-25
**Scope:** SEC-01 fix (BOLA on GET /applicant/userprofile) + related BOLA route sweep deferred items + prior SECURE backlog

---

## Security State Summary

The SEC-01 BOLA fix is complete and committed on both repos:
- BE: `9173f0f` — applicantsController.js patched, token uid enforced, mismatch guard active
- FE: `91caca0` — uid query param removed from entire call chain (service, action, effect, facade, component)
- Release gate: 16/16 criteria PASS
- Build: 0 errors (hash 6eddd5bc3bc26a9e)

---

## Top 5 Priority Items

### PRIORITY 1 — Service Account Keys in Git History (P0 — Beta Blocker)
**ID:** SEC-P1-01 (prior SECURE backlog)
**Files:** `gethired-serviceAccountKey.json`, `jobhunt-serviceAccountKey.json` — committed to git history
**Risk:** Any person with repo access can extract live Firebase admin credentials and impersonate any user, revoke sessions, delete accounts, or access the full Firebase project as admin.
**Action (owner: Paul, 30 min):**
1. GCP Console → IAM → Service Accounts → rotate both keys
2. Update production env vars with new keys
3. `git rm --cached gethired-serviceAccountKey.json jobhunt-serviceAccountKey.json`
4. Purge from history: `git filter-branch` or BFG Repo Cleaner
5. Force-push with `--mirror` (coordinate with team)
6. Revoke the old keys after confirming prod is working with new ones
**Status:** OPEN — blocks public beta

---

### PRIORITY 2 — verifyRoles Middleware: Dead Code with Critical Flaw (P1 — Fix Before Any Route Wires It)
**ID:** BACKLOG-05 (SEC-01 sweep) / DEBT-03 (prior actions)
**File:** `get-hired-BE/middleware/verifyRoles.js` line 19
**Flaw:** `const uid = req.body.uid || req.query.uid` — role lookup uses caller-supplied uid, not Firebase JWT. If any route ever wires this middleware, an attacker can supply an admin's uid in the request body to pass any role check without actually being that admin.
**Confirmed status:** `verifyRoles` is NOT imported or used on any route file today (confirmed by grep across all route and controller files). Risk is latent, not currently exploitable.
**Action (30 min, any developer):**
- Either: Fix the middleware to read `req.user.uid` (from verifyAuth, which must run first), OR
- Delete the file entirely (preferred — it is dead code and fixing it in-place risks future confusion)
- If fix is chosen: change line 19 to `const uid = req.user?.uid;` and require verifyAuth before verifyRoles on any route
**Priority:** P1 (not currently exploitable but one accidental `router.use(verifyRoles(...))` call makes it critical)

---

### PRIORITY 3 — PayMongo Webhook HMAC Signature Verification (P0 — Beta Blocker)
**ID:** SEC-01 / SEC-P2-01 (prior SECURE backlog)
**File:** `get-hired-BE/controllers/paymentController.js` + `server.js`
**Risk:** Any attacker can POST a fake webhook to `/api/payment/paymongo` to trigger subscription activation, payment confirmation, or plan upgrades without a real payment. This is a direct revenue integrity issue.
**Action (developer, 3 hours):**
```js
// server.js — before express.json() for this route only:
app.use('/api/payment/paymongo', express.raw({ type: 'application/json' }));
// paymentController.js — at top of webhook handler:
const sig = req.headers['paymongo-signature'];
const expected = crypto.createHmac('sha256', process.env.PAYMONGO_WEBHOOK_SECRET)
  .update(req.body).digest('hex');
if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
  return res.status(401).end();
}
```
Requires `PAYMONGO_WEBHOOK_SECRET` from PayMongo Dashboard.
**Status:** OPEN — blocks payment integrity

---

### PRIORITY 4 — /auth/logout uid Spoofing — Force-Logout Any User (P2 — DoS)
**ID:** BACKLOG-03 (SEC-01 sweep)
**File:** `get-hired-BE/controllers/userController.js` — `logout` function
**Flaw:** `revokeTokenInFirebase(uid)` called with `req.query.uid` (client-supplied). Route is NOT behind verifyAuth. Any unauthenticated caller can force-revoke any user's Firebase session by supplying their uid.
**Risk:** Session disruption / denial of service. Attacker needs only a target's Firebase uid (which may be visible in URLs or API responses — e.g. applicant profile photoUrl often contains uid).
**Action (30 min):**
- Add `verifyAuth` to the route: `router.get("/auth/logout", verifyAuth, logout)`
- Change controller: `const uid = req.user.uid;` (remove `req.query.uid`)
**Status:** OPEN — P2, fix before beta if uid values are ever exposed in responses

---

### PRIORITY 5 — CORS Wildcard in Production (P2 — Attack Surface)
**ID:** SEC-02 / SEC-P2-02 (prior SECURE backlog)
**File:** `get-hired-BE/server.js` line ~90: `app.use(cors())` — allows any origin
**Risk:** Any website can make cross-origin requests to the API with user credentials (cookies/auth headers). Enables CSRF-style attacks from third-party sites.
**Action (30 min, Paul):**
- Uncomment the `corsOption` object already in `server.js` (lines 28-36)
- Set env var: `ALLOWED_ORIGINS=https://gethiredonline.app,http://localhost:4200`
- Replace `app.use(cors())` with `app.use(cors(corsOption))`
**Status:** OPEN — confirm production domain first

---

## Full Prioritized Backlog (All Open Items)

### TIER 0 — Must Fix Before Beta / Public Launch

| ID | Item | Effort | Owner |
|---|---|---|---|
| SEC-P1-01 | Rotate service account keys + purge git history | 30 min + purge | Paul |
| PayMongo-HMAC | PayMongo webhook HMAC signature verification | 3 hours | Developer |

### TIER 1 — Fix Before First External User (P1/P2)

| ID | Item | Effort | Source |
|---|---|---|---|
| BACKLOG-05 / DEBT-03 | Remove or fix verifyRoles dead code (latent privilege escalation if wired) | 30 min | SEC-01 sweep |
| BACKLOG-03 | /auth/logout — add verifyAuth, use req.user.uid | 30 min | SEC-01 sweep |
| SEC-P2-02 | CORS wildcard → restrict to production domain | 30 min | Prior SECURE |
| SEC-P2-03 | Replace bcrypt with bcryptjs (eliminates 155 CVEs) | 1 hour | Prior SECURE |
| SEC-P2-04 | Upgrade axios to ^1.9.0 (SSRF, prototype pollution) | 2 hours | Prior SECURE |
| SEC-P2-05 | Add morgan HTTP access logging | 30 min | Prior SECURE |
| SEC-P2-06 | Verify + upgrade jsonwebtoken to ^9.0.0 (sig bypass) | 1 hour | Prior SECURE |
| SEC-P2-08 | JSON body limit: drop from 50MB → 1MB | 15 min | Prior SECURE |
| SEC-P2-08b | addCompanyUser raw error leak → normalize to safe message | 30 min | Prior SECURE |
| BACKLOG-09 | Global rate limiting (express-rate-limit) — no rate limiting on BE | High | SEC-01 sweep |

### TIER 2 — Fix Before Scale / Public Promotion (P3)

| ID | Item | Effort | Source |
|---|---|---|---|
| BACKLOG-04 | /jobs/details uid → use req.user.uid for isApplied check | 30 min | SEC-01 sweep |
| BACKLOG-02 | /auth/archive — remove userId query param, use req.user.uid directly | 15 min | SEC-01 sweep |
| BACKLOG-06 | verifyAuth: replace raw Firebase error in 403 catch-all | 15 min | SEC-01 sweep |
| BACKLOG-07 | getUserProfileById 500 → explicit 404 when no DB record | 30 min | SEC-01 sweep |
| BACKLOG-08 | Security monitoring integration (Datadog/Papertrail alert on mismatch tag) | Operational | SEC-01 sweep |
| BACKLOG-01 | Admin profile lookup: add per-lookup audit log + rate limit | 2 hours | SEC-01 sweep |
| SEC-P3-01 | Email enumeration on login — normalize "Invalid email or password" | 30 min | Prior SECURE |
| SEC-P3-02 | Admin route role enforcement (query user_credentials, not trust only role=1) | 2 hours | Prior SECURE |
| SEC-P3-04 | deleteCV / deleteAccount — purge Firebase Storage files | 1 hour | Prior SECURE |
| SEC-P3-05 | Video upload MIME magic-byte check | 2 hours | Prior SECURE |
| SEC-P3-06 | Remove deprecated `request` package, migrate to axios | 2 hours | Prior SECURE |
| SEC-P3-07 | nginx X-Forwarded-For validation for rate limit IP trust | 15 min | Prior SECURE |
| SEC-P3-08 | Excel verification endpoint — add verifyAuth + admin role check | 1 hour | Prior SECURE |
| SEC-P2-07 | Plan Node 18/20 LTS migration (Node 14 EOL) | 1-2 sprints | Prior SECURE |

### TIER 3 — Cleanup / Future (Low Risk, Low Urgency)

| ID | Item | Source |
|---|---|---|
| BACKLOG-10 | Remove ?id= query param acceptance from /applicant/userprofile after monitoring confirms 0 mismatches | SEC-01 sweep |
| SEC-INFO-01 | Document applicantEmail in interview hub as intentional | Prior SECURE |
| SEC-INFO-02 | Confirm + document Firebase photo URL public ACL | Prior SECURE |
| SEC-INFO-03 | Enable Dependabot | Prior SECURE |
| SEC-P3-03 | getDashboard Array.isArray guard | Prior SECURE |
| SEC-P3-09 | Finalize CORS production domain (depends on P2-02) | Prior SECURE |
| SEC-P3-10 | Data retention policy + cleanup job | Prior SECURE |
| SEC-P3-09b | Redis rate-limit store (deferred until horizontal scaling) | Prior SECURE |

---

## Beta Blockers Summary

Two items block a public beta with real users:

1. **Service account keys in git** — anyone with repo access is effectively a Firebase admin
2. **PayMongo webhook not verified** — fake payments can activate subscriptions

The rest of Tier 1 should be completed within the first week of internal testing. None of the SEC-01 deferred items (BACKLOG-03 through BACKLOG-10) are beta-blocking on their own, but BACKLOG-05 (verifyRoles dead code) should be deleted before the codebase grows.

---

## Recommended Next Command

**`SECURE`** — a full SECURE v4 pass targeting:
1. verifyRoles dead-code fix/deletion (BACKLOG-05)
2. /auth/logout verifyAuth wiring (BACKLOG-03)
3. /jobs/details uid fix (BACKLOG-04)
4. JSON body limit reduction (SEC-P2-08)
5. CORS restriction (SEC-P2-02)
6. bcrypt → bcryptjs swap (SEC-P2-03)
7. morgan logging (SEC-P2-05)

These 7 items are all < 2 hours each, self-contained, and do not require schema changes or migrations. A single SECURE pass can close all of Tier 1 and produce a clean Tier-0 checklist for Paul (keys + webhook).
