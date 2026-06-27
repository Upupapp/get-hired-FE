# GetHired Prioritized Backlog — Post MOBILEVIEW V2 + SEO V3 (V2)
**Date:** 2026-06-25
**Supersedes:** Prior V2 (SEO V3 scope only)
**Now includes:** MOBILEVIEW V2 Pass 1 + Pass 2 scope

---

## Context

### What is now complete
- **MOBILEVIEW V2 — Pass 1**: Applicant + Admin mobile nav (top bar, hamburger drawer, bottom nav); global responsive baseline in styles.scss; public page overflow fixes.
- **MOBILEVIEW V2 — Pass 2**: BL-001/002/003/004/005/008/009/013/014 shipped. 9 of 15 backlog items closed. 4 deferred (BL-010, BL-011, BL-012, BL-015); 2 closed as N/A (BL-006, BL-007).
- **SEO V3**: SeoService, JobPosting/Organization/WebSite/BreadcrumbList JSON-LD, robots.txt, sitemap.xml (BE), page meta on 10 components, GSC verified, sitemap submitted.
- **Build:** GREEN — `ng build --configuration=staging` passes with 0 errors after all changes.
- **Infrastructure:** BE PM2 online, nginx sitemap proxy live, robots.txt 200, sitemap.xml 200 (application/xml).

---

## P0 — Fix Immediately (Security Critical)

| ID | Item | File(s) | Effort |
|----|------|---------|--------|
| P0-SEC-01 | BOLA: GET /applicant/userprofile reads uid from req.query, not JWT — any authenticated user can read any other user's full profile | `controllers/applicantsController.js:238-249` — replace `const { id } = req.query` with `const id = req.user.uid` | XS (1 line + 30 min regression test) |
| P0-NEW-01 | Firebase service account key leaked in git history — purge and key rotation unconfirmed | `middleware/firebaseApp.js:5` + git history — rotate key in Firebase console + `git filter-repo` or BFG to scrub history | M (0.5 session) |

---

## P1 — High Priority (Before or Shortly After Launch)

| ID | Item | File(s) | Effort | Blocked By |
|----|------|---------|--------|-----------|
| P1-MOB-01 | Signin/signup: hide left carousel panel on mobile — horizontal overflow, auth entry point for all users | `src/app/auth/signin/signin.component.html` — add `d-none d-lg-block` to carousel column | S (1h + visual regression) | None; HIGH risk — auth flow |
| P1-MOB-02 | Recorder control touch targets: Record, Stop, Retake must be min 44x44px | `src/app/recorder/` — audit + add min-width/min-height where needed | S (1h + mobile test) | None |
| P1-SEO-01 | Create OG default image (1200×630 PNG) — `gethired-og-default.png` missing; all og:image tags are broken URLs | `src/assets/brand/gethired-og-default.png` — design + export PNG, no code change | M (design task) | Designer |
| P1-SEO-02 | Verify logo.png accessible at production URL for Organization JSON-LD | Browser: load `https://gethiredonline.app/assets/images/logo.png` — confirm 200, not 404 | XS (5 min) | None |
| P1-SEO-03 | Renew GitHub PAT for Linode BE deploys | `github.com/settings/tokens` — generate new PAT; update Linode credential helper | XS (15 min) | GitHub account |
| P1-PAY-01 | PayMongo webhook no idempotency — duplicate events create duplicate transaction records and subscription activations | `controllers/paymentController.js:111-115` — add `ON CONFLICT (reference_number) DO NOTHING`; early return if rowCount === 0 | S (45 min) | None |
| P1-NEW-02 | Verify PAYMONGO_WEBHOOK_SECRET set in Linode .env — silent 400 on all webhooks if absent | Linode .env check via SSH | XS (5 min) | Linode SSH |
| P1-LAUNCH-01 | No applicant UI feedback on application submission | Apply flow component — add loading/success/error states, disable "Apply" button to "Applied" after success | M (2h FE) | None |
| P1-LAUNCH-02 | No email notification to applicant on apply or employer on new application / status change | BE notification service + SendGrid — two trigger points: apply endpoint + status-change endpoint | M (3-4h BE + templates) | SendGrid |
| P1-SEC-02 | GET /job/details uid param probing | job controller — derive company from JWT, not query param | S | None |

---

## P2 — Should Do (Quality, Functional, SEO Gaps)

| ID | Item | File(s) | Effort | Notes |
|----|------|---------|--------|-------|
| P2-MOB-01 | Dialog bottom-sheet style at mobile (BL-010) — `mat-dialog-container` should use `border-radius: 16px 16px 0 0`, bottom-anchored at 767px | `src/styles.scss` — global `@media` override | S (1.5h + regression across all dialogs) | ~6-8 dialog-using components |
| P2-MOB-02 | Focus trap in nav drawers (BL-011) — WCAG 2.1 AA; Tab key currently escapes open drawer | applicant-panel, admin-panel, employer-panel — add `A11yModule` import + `cdkTrapFocus` on drawer `<nav>` | S (2h) | Angular CDK already installed |
| P2-SEO-01 | Add company pages to sitemap.xml endpoint | `get-hired-BE/server.js` sitemap block — add query for active companies + URL pattern `/companies/details?id=X` | S (1h) | Verify companies table active-column name |
| P2-SEO-02 | Remote job Schema.org fields — `jobLocationType: 'TELECOMMUTE'` for WFH jobs | `src/app/core/services/seo.service.ts` — map `workSetupName` to Schema.org remote fields | S (2h) | Enables "Work from home" filter in Google for Jobs |
| P2-SEO-03 | Visual breadcrumb component on job detail (JSON-LD breadcrumb exists; no visible/crawlable breadcrumb) | `src/app/public/public-details/public-details.component.html` — add `<nav aria-label="Breadcrumb">` with `<a>` links | S (1h) | |
| P2-SEO-04 | Replace Angular router navigation buttons with `<a routerLink>` on homepage CTAs | `src/app/public/main-portal/main-portal.component.html` | S (1h) | Crawlable internal links for Googlebot |
| P2-SEO-05 | Add component-level noindex to /signup, /reset-password, /change-password, /verify | Auth components — `this.seoService.setPageMeta({ robots: 'noindex, nofollow' })` in ngOnInit | XS (30 min) | robots.txt already covers; this is belt-and-suspenders |
| P2-SEO-06 | Verify companies breadcrumb middle link (/companies) is a real route | Browser check — if 404, update breadcrumb to Home > [Company Name] | XS (15 min investigate + 30 min fix) | |
| P2-SEO-07 | Verify "thousands" in jobs meta description matches real job count | `src/app/public/public-list/public-list.component.ts` — copy accuracy check | XS (15 min) | |
| P2-NEW-03 | CORS allows only single string origin — blocks www subdomain and localhost | `server.js:89` — change to allowlist array | S (1h) | |
| P2-NEW-04 | deleteJob hard-deletes cascade to applicant history — no guard | `controllers/jobsController.js` — check active applicants before delete + FE warning | M | |
| P2-NEW-05 | Module-level `now = new Date()` in subscriptionController — records server-start timestamp for paid_at | `controllers/subscriptionController.js:18,45,94,96` — move to request-time | XS (15 min) | Financial data correctness |
| P2-NEW-06 | PII console.log in login/auth flow | `controllers/userController.js:80-81,217,528` — remove or sanitize | XS (30 min) | Privacy hygiene |
| P2-PERF-01 | getUserCompany(uid) called 2-4x per request with no caching | BE services — memoize within request scope | S | |
| P2-TOAST-01 | False-positive "Successfully added contact" toast when all invites fail | Invite flow component — check response payload before triggering success toast | S (1h) | UX trust bug |
| P2-OLD-02 | listRecruiterThreads no LIMIT — unbounded thread list | `services/message.service.js:187` | XS | |

---

## P3 — Nice to Have / Future Work

| ID | Item | Notes |
|----|------|-------|
| P3-SEO-01 | Google Indexing API for fast job publish/depublish | Plan documented; defer until GCP service account created |
| P3-SEO-02 | SSR canonical via server-side `<link>` element | Only relevant if Angular Universal SSR activated |
| P3-SEO-03 | Per-job OG image using job banner URL | Needs banner field in API response |
| P3-SEO-04 | Organization sameAs social links in JSON-LD | Needs verified social URLs |
| P3-SEO-05 | Add public /companies index page | No standalone company list route currently |
| P3-SEO-06 | Switch company route to path param (/companies/:id) | Cleaner SEO URL; requires BE route + FE router change |
| P3-SEO-07 | hreflang for Tagalog/Filipino | Only if URL-based language routing added |
| P3-SEO-08 | Font preloading for Manrope/DM Sans | Minor LCP gain |
| P3-SEO-09 | Hero image preload (`<link rel="preload">`) | Minor LCP gain for homepage hero |
| P3-NEW-07 | Exclude PayMongo webhook path from writeLimiter (rate-limit may throttle burst payment events) | Low risk but easy to add |
| P3-NEW-08 | Add helmet for CSP, HSTS, Referrer-Policy | One-line npm install + config |
| P3-MOB-01 | Core Web Vitals audit + fixes (LCP < 2.5s, INP < 200ms, CLS < 0.1) | `npx lighthouse https://gethiredonline.app` — 2-3 sessions |
| P3-OLD-01 | addCompanyUserByEmail returns raw error strings | `controllers/companiesController.js:525` |
| P3-OLD-03 | deleteCV leaves Firebase Storage orphaned | `controllers/cvController.js:132-155` |
| P3-OLD-07 | getListByUser always returns null (service call commented out) | `controllers/interviewController.js:232` |
| P3-OLD-08 | recruiter_last_read_at column missing — no read-state for messages | `db/messages_ddl.sql` |
| P3-OLD-11 | bcrypt + bcryptjs both in package.json — remove native bcrypt | `package.json:29-30` |
| P3-OLD-12 | axios 0.27.x — upgrade to 1.x | `package.json:27` |

---

## Items to Defer (Indefinitely or Until Milestone)

| Item | Reason |
|------|--------|
| BL-006/007: gh-responsive-table on contacts/admin tables | CLOSED — reusable-table already has its own mobile layout; applying would conflict and break it |
| Soft 404 HTTP status in SSR server.ts | Not relevant until Angular Universal SSR is activated |
| Sitemap index file | Only needed if URLs exceed 50,000 — not applicable |
| Tagalog i18n + URL prefixes + hreflang | Future product decision |
| rel=prev/rel=next for pagination | Future feature if pagination is introduced |
| Twitter:site handle | Needs verified Twitter/X account |

---

## Quick Wins (under 1 hour, do first)

| # | Item ID | Task | Time |
|---|---------|------|------|
| QW-01 | P0-SEC-01 | Fix BOLA on userprofile — one-line backend change | 15 min code + 30 min test |
| QW-02 | P1-SEO-02 | Verify logo.png at production URL | 5 min |
| QW-03 | P1-SEO-03 | Renew GitHub PAT for Linode | 15 min |
| QW-04 | P1-NEW-02 | Verify PayMongo webhook secret in Linode .env | 5 min |
| QW-05 | P2-SEO-05 | Add noindex to remaining auth components | 30 min |
| QW-06 | P2-NEW-05 | Fix module-level `now = new Date()` timestamp | 15 min |
| QW-07 | P2-NEW-06 | Remove PII console.log from auth flow | 30 min |
| QW-08 | P2-SEO-06 | Verify companies breadcrumb URL is a real route | 15 min + fix |
| QW-09 | P2-SEO-07 | Verify "thousands" copy in jobs meta description | 15 min |
| QW-10 | P2-OLD-02 | Add LIMIT to listRecruiterThreads | 15 min |

---

## Medium Items (1-3 hours each)

| # | Item ID | Task | Time |
|---|---------|------|------|
| M-01 | P1-PAY-01 | PayMongo webhook idempotency guard | 45 min |
| M-02 | P1-MOB-01 | Signin carousel hidden on mobile | 1h + visual test |
| M-03 | P1-MOB-02 | Recorder touch targets 44x44px | 1h |
| M-04 | P2-MOB-01 | Dialog bottom-sheet style at mobile | 1.5h |
| M-05 | P2-MOB-02 | Focus trap in nav drawers (CDK A11yModule) | 2h |
| M-06 | P2-SEO-01 | Company pages in sitemap | 1h |
| M-07 | P2-SEO-02 | Remote job Schema.org fields | 2h |
| M-08 | P2-SEO-03 | Visual breadcrumb on job detail | 1h |
| M-09 | P2-SEO-04 | Homepage CTAs as `<a routerLink>` | 1h |
| M-10 | P2-TOAST-01 | Fix false-positive contact toast | 1h |
| M-11 | P2-NEW-03 | CORS multi-origin fix | 1h |
| M-12 | P2-NEW-04 | deleteJob guard — check active applicants before delete | 2h |

---

## Strategic Items (full session each)

| # | Item | Session | Outcome |
|---|------|---------|---------|
| S-01 | P0-NEW-01: Firebase key rotation + git history purge | 0.5 session | P0 security debt cleared |
| S-02 | P1-LAUNCH-01 + P1-LAUNCH-02: Apply UX + email notifications | 1 session | Core applicant loop fully closed |
| S-03 | P1-SEC-02 + remaining SECURE items | 1 session | Security hardening batch |
| S-04 | P3-SEO-01: Google Indexing API | 1 session | Real-time Google for Jobs coverage |
| S-05 | P3-MOB-01: Core Web Vitals optimization | 2-3 sessions | Google ranking signal improvement |
| S-06 | Full A11y pass: WCAG 2.1 AA audit + fixes (includes BL-011 focus trap + color contrast) | 1 session | Accessibility compliance |

---

## Recommended Next Session Order

1. **Quick wins block** (QW-01 through QW-10) — ~3h total; clear P0 BOLA, verify assets, trivial code hygiene.
2. **P1-SEO-01: OG image** — parallelize with coding work; design task.
3. **P1-LAUNCH-01 + P1-LAUNCH-02: Apply UX + email notifications** — closes the core applicant product loop; highest product value.
4. **P1-MOB-01 + P1-MOB-02: Signin carousel + Recorder** — mobile polish for the two highest-risk paths not yet covered.
5. **SEO medium items** (M-06 through M-09) — company sitemap, remote job schema, visual breadcrumbs.

---

## Recommended Next Command

**SECURE** — Close P0 BOLA (SEC-01), confirm Firebase key purge (P0-NEW-01), and batch-close remaining P1/P2 security items (SEC-02, PAY-01, CORS, PII log). Many of these are small/fast and can ship in one dedicated security pass.

Alternatively: **NOTIFY** — if the focus is closing the applicant product loop, run NOTIFY to audit the full notification/email/empty-state surface and ship apply confirmation + status-change emails in one cohesive pass.

---

## Effort Key
- XS = < 30 min | S = 30 min–2 hrs | M = 2–8 hrs | L = 1–3 days

*Backlog updated 2026-06-25. Planning only — no code changes made.*
