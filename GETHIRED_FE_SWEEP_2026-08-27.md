# get-hired-FE — merge + full front-end sweep, 2026-08-27

Scope: **front end only** (`get-hired-FE`). `get-hired-BE` was read to establish the
route contract; nothing in it was modified.

## 1. Merge

Local `master` was at `1982731c`, **0 ahead / 139 behind** `origin/master` `923d9144`.
No local commits existed, so the merge was a clean fast-forward — nothing local was
discarded. The one untracked file (`GETHIRED_FULLSTACK_SWEEP_2026-08-23.md`) was
preserved and is deliberately **not** committed; see §5.

`origin/feat/chris-lguids-separation` already points at `923d9144` (contained).
`origin/feat/employer-fe-separation` is a deliberate strip-down of the combined portal
and was **not** merged — doing so would delete `admin-panel/` and `applicant-panel/`.

## 2. Gates

| Gate | Result |
|---|---|
| `ng build --configuration=production` | PASS |
| `ng run get-hired:server` (SSR bundle) | PASS |
| `ng test` (295 specs, ChromeHeadless) | 140 pass / **155 fail** — pre-existing |

The 155 failures were measured **twice**: once on pristine `origin/master` `923d9144`
and once with this branch's changes applied. The failing spec-name sets are byte-identical,
so these changes introduce zero regressions. The failures are test-scaffolding rot, not
product defects — 140 × `No provider for MatDialog`, 56 × `No provider for Router`,
etc.: specs that never declared their TestBed providers. Recorded in §4, not fixed here.

## 3. Fixed

**F-1 — Subscription lifecycle + upgrade endpoints all 404'd (7 endpoints).**
`subscription-lifecycle.service.ts` and `subscription-upgrade-recommendation.service.ts`
set `base = environment.api_url`, which already ends in `/api`, then appended `/api/...`
again — every request went to `/api/api/subscriptions/...`. Both services are live, not
tree-shaken: `SubscriptionLifecycleService` is injected into
`checkout-return-status.component.ts` (the post-payment screen) and
`SubscriptionUpgradeRecommendationService` into both `upgrade-annual-first-landing`
and `company-dashboard` (the employer dashboard). Sibling
`subscription-checkout-intent.service.ts` builds the URL correctly, which is what hid it.
First reported 2026-08-23 as CON-01; still unfixed on `master` at merge time.

**F-2 — Interview-question edits silently 404'd.**
`job.service.ts` sent `PUT /api/job/updatejobinterview`. The backend exposes that
operation only at `PUT /api/interview/updatejobinterview` (`interviewRoute.js:27`);
`jobsRoute.js` has no such handler. Reachable via
`create-interview.component.ts:148 → jobFacade.updateJobInterview → job.effects.ts:371`.
The component applies the edit optimistically to its FormGroup first, so the UI showed
success while nothing persisted. The request body already matched the handler's expected
fields (`questionId, question, answerDuration, retakes, sequence`) — only the path was wrong.
Note the backend is genuinely asymmetric here: the **delete** for the same entity *is*
under `/api/job/` (`jobsRoute.js:69`), so both bases are now kept explicitly.

**F-3 — Four `routerLink`s pointed at routes that do not exist.**
`/cv-doctor` (×2, on public job-list pages) and `/user/cv-doctor` (search empty state)
— no `cv-doctor` path is declared anywhere in the app; all three fell through to the
`**` wildcard error page. The real route is `/user/profile/cv-builder`
(`applicant-profile.module.ts:14`), which is what the sidebar and the dashboard
readiness panel already navigate to.
`/applicant/profile/edit/details` (Apply-flow avatar "Edit Profile" button) — `applicant`
is not a top-level route; the top level is `''`, `admin`, `recruiter`, `user`. Repointed
to `/user/profile/edit`, matching the existing convention in `banner.component.html`
and `application-completeness-card.component.html`.
The three CV-Health CTAs sit on public pages, so a signed-out visitor is now sent through
`AuthGuard` to sign-in rather than to a 404 — the same behaviour as every other `/user/*`
link on those pages.

**F-4 — `npm run build` had never worked.**
`build` delegated to `build:ssr`, which was never defined — since the initial commit.
Defined it as the browser bundle the Actions deploy ships plus the server bundle
`angular.json` already configures. `build-prod` and the CI deploy were unaffected and
still call `ng build` directly.

## 4. Open — not fixed, with reasons

| # | Finding | Why not fixed here |
|---|---|---|
| O-1 | 155/295 unit specs fail on `master` (missing TestBed providers) | Pre-existing and orthogonal to this merge. Repairing 145 spec files is its own task, and doing it inside a merge commit would hide whether the merge itself was clean. |
| O-2 | `checkout.service.ts` targets `/api/cart/*` and `/api/checkout/get` | Double-`/api` **and** the backend has no cart/checkout routes at all. The service has zero injectors — Shopify-era dead code. Correcting the base URL would only make dead code look live. Deletion is a product call. |
| O-3 | Dead FE calls to routes the backend never had: `/auth/checkemailifexist` (×2), `/auth/getcredentials`, `/auth/refreshtoken` (in `auth.service.ts`), `/admin/dashboard`, `/admin/profile` | All confirmed unreachable — no caller for `checkEmailIfExist`, `refreshCredentials`, `getAdminDashboard()`, or `getAdmin()`. Note `auth.service.getRefreshToken` is **not** the one the guards use; the guards call the same-named method on `shared/services/auth/admin/admin.service.ts`, which targets `environment.server`. Removing them is cleanup, not a fix. |
| O-4 | `company.service.ts` calls `/company/addCompanyUser`; the route is `/company/addcompanyuser` | Works today only because Express's `case sensitive routing` is off by default. Fragile, not broken. Flagged rather than changed so the fix can be made deliberately across all surfaces. |
| O-5 | The `**` wildcard route is bypassed after login | The five role guards call `router.resetConfig()` with arrays that contain no wildcard, so a post-login 404 does not reach the error page. Already documented in-code at `app.routing.module.ts` as high-risk to touch without dedicated testing; unchanged. |
| O-6 | `app.yaml` (`runtime: nodejs14`, `static_files`) does not serve the SSR bundle | The live deploy is the Actions workflow to Linode, which rsyncs `dist/get-hired/` — the browser bundle. `app.yaml` describes a GCP App Engine path that the SSR build is not wired into. Deployment topology is an owner decision, not a front-end fix. |

## 5. Not committed, deliberately

`GETHIRED_FULLSTACK_SWEEP_2026-08-23.md` is left untracked. **This repository is public**,
and that report names the exact path and host of a live unencrypted private key in a
public sibling repo. Committing it here would widen the exposure of an unremediated
finding. It stays local until that credential is rotated and removed from history.

## 6. Method notes

Two traps produced false positives during this sweep and are worth keeping:

- **Two transports.** Only about a third of the 149 front-end HTTP calls use `HttpClient`
  directly; the rest go through `BaseService`. A census that greps `http.get(` alone sees under
  a third of the surface.
- **Sub-router mounts.** `imageRoutes` and `searchRoutes` mount at `/api/images` and
  `/api/search`, not `/api`. Five calls looked orphaned until the mount prefixes were
  resolved. Read `server.js`'s mount table before believing any orphan count.

The reconciliation is committed as `scripts/sweep/stitch.py`. It walks both transports,
resolves base-URL variables transitively, applies `server.js`'s mount prefixes, and
compares against `routes/*.js`. Run it from the repo root:

    GH_BE=../get-hired-BE python3 scripts/sweep/stitch.py

Current output: **149 front-end calls, 164 backend routes, 10 orphans** — and all ten are
the dead code already itemised in O-2, O-3 and O-4. **No reachable front-end call is
currently pointed at a route that does not exist.** If that orphan count rises above ten,
something regressed.
