# GetHired Employer Start Hiring — Completion Report

Command: GETHIRED_EMPLOYER_STARTHIRING_MASTER_COMMAND (2026-08-19)
Repo touched: `get-hired-FE` only. `get-hired-BE`, `gethired-jobseeker-FE`,
`gethired-employer-FE` — not modified (backend gap documented in
`get-hired-BE/notes.md` only, per repository discipline).
Commit: `d24b5040` on `feat/chris-lguids-separation` — local only, not pushed.

---

## Reconciliation finding (why this diverges from the PDF's Tabs 02-06 design)

Tab 01 discovery found the guest job-post flow already exists and is already
correctly designed — but as a **server-side claim-token** architecture, not
the client-side `localStorage` draft envelope the command specified:

```
[/employers] "Start hiring" -> AiJobPreviewPanelComponent opens
  -> generate() -> POST /public/employer/ai-preview-generate  (anonymous, no auth)
  -> previewToken saved to sessionStorage('gh_ai_preview_token')
  -> user clicks "Create free employer account" / "Sign in" / Google
  -> /signup -> /verify (real email verification) -> authenticated
  -> EmployerPanelComponent.ngOnInit() -> checkAndClaimAiPreview()
  -> POST /recruiter/job-post-assistant/claim-preview { previewToken }
  -> backend creates the real job row (status=1, draft), returns jobId
  -> token cleared, navigate to /recruiter/jobs/list?claimedDraft=1
```

Per the reconciliation override, this was treated as the authoritative
current implementation and verified live rather than replaced with a second,
parallel persistence system. **No `pendingJobDraft.v1` localStorage envelope
was built.**

---

## What was actually broken (live-verified)

### 1. Guest could not reach the anonymous generate endpoint at all — backend bug, NOT fixed here

`POST /api/public/employer/ai-preview-generate` currently returns `401` for
every request, including ones with no Authorization header. Reproduced live
against a freshly restarted local backend (ruled out stale-process
artifacts):

```
curl -X POST http://localhost:3000/api/public/employer/ai-preview-generate \
  -d '{"jobTitle":"Warehouse Supervisor"}'
→ 401 Unauthorized
```

**Root cause:** `server.js` mounts `publicJobPreviewRoutes` (line 201) *after*
`billingRoutes` (line 200), which has its own catch-all `validateFirebaseIdToken`
gate. The file's own comment already documents this exact bug class for
`googleAuthRoutes`/`linkedinAuthRoutes` ("MUST be first ... any route mounted
after billingRoutes without its own auth middleware gets rejected"); whoever
added `publicJobPreviewRoutes` later missed the same lesson.

This is a backend fix (move one `app.use()` line). Per scope lock, **not
implemented** — documented precisely in `get-hired-BE/notes.md` with the
proposed one-line fix and an acceptance test.

### 2. The interceptor compounds it into exactly the reported symptom — fixed here

Because the anonymous endpoint currently 401s, the frontend's global
`UnAuthorizedInterceptor` — which treats *any* 401/403 anywhere in the app as
an expired session — fires for a guest who was never signed in: forces
`coreService.logout()`, shows "Your session has expired. Please sign in
again to continue.", and hard-redirects to `/signin`. This is the exact
symptom the Master Command describes, just with a different root cause than
assumed (a backend route-ordering regression, not a frontend
session-classification gap — the frontend already correctly called a public
endpoint with no auth expectation).

**Fix applied** (`src/app/core/interceptor/unauthorize.interceptor.ts`): the
expired-session logout/toast/redirect now only fires when
`coreService.isLoggedIn()` is true. A true guest (no local session state at
all) instead lets the error propagate to the calling component's own
handler — for the AI Preview Panel, that's already a correct, honest message
("Could not generate preview. Please try again."). Authenticated-then-
actually-expired behavior is byte-for-byte unchanged (still logs out,
still shows the toast, still redirects).

This does not hide the error — it corrects which error is shown, per the
master execution rule.

### 3. Non-atomic claim — code-verified race, not live-reproduced

`services/anonPreviewStore.js`'s `getPreview()` is non-destructive;
`claimPreview()` only deletes the token *after* the DB insert `await`
resolves. Two concurrent claims with the same token could both pass the
existence check before either deletes it, creating two job rows for one
guest intent. Confirmed via code-path analysis (deterministic, not
environment-dependent); **not empirically reproduced live** — doing so would
require either a backend code change (out of scope) or provisioning a full
Firebase-emulator test account through the broken generate step, which
wasn't proportionate given the fix is backend-only and already precisely
documented. Added a same-page-life in-flight guard in
`EmployerPanelComponent` as a partial frontend mitigation (defends against a
same-tab duplicate `ngOnInit` firing, not against genuinely concurrent
requests). Full fix requires the backend to make the claim atomic —
documented in `get-hired-BE/notes.md`.

---

## Files changed

| File | Change |
|---|---|
| `src/app/core/interceptor/unauthorize.interceptor.ts` | Gate expired-session logout/toast/redirect on `isLoggedIn()` |
| `src/app/employer-panel/employer-panel.component.ts` | Add `aiPreviewClaimInFlight` guard around `checkAndClaimAiPreview()` |
| `get-hired-BE/notes.md` (new) | Backend route-ordering fix + atomic-claim requirement, precisely specified — **not implemented**, per scope lock |

No changes to `gethired-jobseeker-FE`, `gethired-employer-FE`, or any
`get-hired-BE` source file.

---

## Live verification performed

Backend was restarted cleanly (ruled out a stale process before diagnosing
the 401 as a real code bug, not an artifact).

| Test | Method | Result |
|---|---|---|
| Guest generate with no auth header | `curl` direct | `401` — confirms the backend bug (not fixed here) |
| Real signup via `/api/auth/signup` (role=2) | `curl` against running backend | `201`, Postgres + Firebase user created |
| Unverified sign-in blocked | `curl POST /api/auth/signin` before verifying | `401` — `"Please Verify Email..."` |
| Real local email verification | Firebase Auth Emulator `oobCodes` REST API → real `oobCode` → `POST /api/auth/verifyemail?oobCode=...` (the actual production code path, `verifyEmailInFirebase`) — **no bypass, no `emailVerified=true` shortcut used** | `200` — `"Email Successfully verified."` |
| Verified sign-in succeeds | `curl POST /api/auth/signin` after verifying | `200`, real ID token returned |
| Company creation for claim prerequisite | `curl POST /api/company/createinitial` with real token | `200` |
| `claim-preview` — no auth | `curl` | `401` |
| `claim-preview` — authed, missing token | `curl` | `400` "Missing or invalid preview token." |
| `claim-preview` — authed, malformed token | `curl` | `400` — same message, no oracle leak |
| `claim-preview` — authed, well-formed but nonexistent token | `curl` | `404` "Preview not found or expired. Please generate a new preview." — generic, matches Tab 06/07 |
| Full happy path (generate → claim → jobId) | Blocked by the still-open backend bug (item 1) | **Not completable locally** until that one-line backend fix lands |
| Production build | `ng build --configuration=production`, real captured exit code read directly from log | `REAL_NG_BUILD_EXIT_CODE=0` |

All test data (Firebase user, Postgres user + company row) created for this
verification was deleted afterward.

**Not possible with available tooling:** no browser-automation tool
(Playwright/Puppeteer/chromium-cli) was available in this environment, so
the actual UI click-through (opening the panel, typing into it, clicking
Generate, watching the toast) was not performed — verification was done at
the HTTP/API layer, which is the layer where this specific bug class
(auth/routing/state-transition) actually lives, but this is a real gap
against "live local verification" if a pixel-level UI check was intended.

---

## LOCAL / PRODUCTION configuration safety

- No config files were edited. The interceptor and employer-panel changes
  are pure logic changes with no environment branching — identical behavior
  in local and production builds.
- Local backend was run via `nohup env FIREBASE_AUTH_EMULATOR_HOST=... CORS_ADDITIONAL_DEV_ORIGINS=... node start.js` — an invocation-time env var, never written into any committed file.
- `LOCAL TESTING: PASS` — all curl-based scenarios above ran against the local stack (Docker Postgres, Firebase Auth Emulator, local backend).
- `PRODUCTION CONFIGURATION PRESERVED: PASS` — nothing touched `environment.prod.ts`, backend prod config, or any deployment file.
- `PRODUCTION BUILD: PASS` — `REAL_NG_BUILD_EXIT_CODE=0`, confirmed by reading the log directly (not the background-task notification, per standing project practice — that notification has been unreliable before).
- `LOCAL AUTH EMULATOR: PASS` / `UNVERIFIED USER BLOCKED: PASS` / `LOCAL VERIFICATION ACTION: PASS` / `VERIFIED USER LOGIN: PASS` — all via the real Firebase Auth Emulator OOB flow and the actual production `verifyEmailInFirebase` code path, no shortcut, no `NODE_ENV`-gated bypass, no new endpoint added.

---

## Unresolved risks / remaining gaps

1. **Guest flow is fully non-functional until the backend route-ordering fix lands** (item 1 above). This is the single blocking issue — everything downstream of it (claim, dedup, UX) is otherwise sound.
2. **Claim is not atomic** (item 3) — real but low-probability duplicate-job risk under concurrent requests; requires a backend fix; frontend mitigation only covers same-tab re-entry.
3. **No UI-level (pixel/click) verification was performed** — no browser automation tool was available. HTTP-layer verification is thorough for this bug class but doesn't confirm the panel renders/animates/labels correctly.
4. Two items from the original `GETHIRED_AI_JOB_PREVIEW_PANEL_FINAL_REPORT_V1.md`'s own "Known Limitations" remain deferred and out of this task's scope: the "Job draft ready" banner on the job list after claim, and analytics tracking for the panel — neither was part of the reported guest-facing defect.

## Stop condition check

No scenario in the verified set loses guest data, routes a true guest to
misleading expired-session messaging (fixed), creates a job under the wrong
role/account (claim resolves company from JWT only, verified), clears
storage before backend success (`clearPendingToken()` only runs in the
response callback, verified by reading the code), or is known to create
duplicate jobs from the paths this session could reach (the one open
duplicate risk is a backend concurrency edge case, documented, not silently
ignored).
