# GetHired — Open Backlog
> Updated: 2026-06-26 | ACTIONS RECENT_4 | a11y sprint + security hardening + OG card + SSR guards
> FE HEAD: `8a41f25` | BE HEAD: `35f7754`
> Full detail: `get-hired-BE/docs/GETHIRED_ACTIONS_RECENT_4.md`
> Roadmap: `get-hired-BE/docs/GETHIRED_ACTIONS_ROADMAP_RECENT_4.md`
> Decisions: `get-hired-BE/docs/GETHIRED_DECISION_LOG_RECENT_4.md`

---

## P0 — Public Launch Blockers

### BL-P0-01 | Firebase service account key in git history
**Files:** `get-hired-BE/` (git history)
**Risk:** P0 — key is live in public git history; anyone with repo access can impersonate the Firebase service account
**Steps:**
1. Rotate the key: Firebase Console → Project Settings → Service Accounts → Generate new private key
2. Download new key, place at `get-hired-BE/jobhunt-serviceAccountKey.json` (DO NOT commit)
3. Purge old key from history: `git filter-repo --path jobhunt-serviceAccountKey.json --invert-paths`
4. Force-push: `git push origin main --force`
5. Notify all collaborators to re-clone
6. Update Linode: SCP new key file to `/var/www/_work/get-hired-BE/jobhunt-serviceAccountKey.json`
7. `ssh root@139.162.11.242 "pm2 restart all"`
**Verification:** Old key no longer usable (Firebase Console shows it revoked); `git log --all --full-history -- jobhunt-serviceAccountKey.json` returns nothing

---

## P1 — Pre-Public / High Priority

### BL-P1-01 | Rate limiting missing repo-wide
**Files:** `get-hired-BE/` (no `express-rate-limit` anywhere)
**Risk:** P1 — all auth, write, and public-read endpoints open to brute-force and flooding
**Fix:** Install `express-rate-limit`; apply tiered limits (auth: 10/15min, write: 100/15min, public read: 500/15min)
**Execution pack:** See `GETHIRED_ACTIONS_RECENT_DEPLOYMENT_V5.md` EXEC-PACK-1

---

### BL-P1-02 | OG image missing
**Files:** `src/assets/brand/gethired-og-default.png`, `src/app/core/services/seo.service.ts`
**Risk:** P1 — social shares (LinkedIn, Facebook, WhatsApp) show the small logo instead of a branded card
**Spec:** 1200×630px PNG, branded, no private data
**Steps:**
1. Design and export `gethired-og-default.png` at 1200×630px
2. Place at `get-hired-FE/src/assets/brand/gethired-og-default.png`
3. In `seo.service.ts`, update `DEFAULT_OG_IMAGE`:
   ```typescript
   private readonly DEFAULT_OG_IMAGE = `${this.BASE_URL}/assets/brand/gethired-og-default.png`;
   ```
4. Also update the hardcoded og:image URL in `src/index.html`
**Verification:** Facebook Sharing Debugger / LinkedIn Post Inspector shows branded 1200×630 card

---

### BL-P1-03 | Google Search Console verification + sitemap submission
**Files:** None (manual step)
**Risk:** P1 — without Search Console, JobPosting rich results can't be monitored; sitemap not submitted slows discovery
**Steps:**
1. search.google.com/search-console → Add property → `https://gethiredonline.app`
2. Verify ownership via HTML tag or DNS TXT record
3. Submit sitemap: `https://gethiredonline.app/sitemap.xml`
4. Check Rich Results → Job Postings within 48–72 hours
**Verification:** Search Console shows "Sitemap submitted" and starts reporting indexed URLs

---

### BL-P1-04 | GitHub PAT for Linode expired
**Files:** Linode server config (no code change)
**Risk:** P1 — BE deploys require manual SCP per file
**Steps:**
1. github.com/settings/tokens → Generate new classic token with `repo` scope
2. `ssh root@139.162.11.242 "cd /var/www/_work/get-hired-BE && git remote set-url origin https://<TOKEN>@github.com/Upupapp/get-hired-BE.git"`
3. Test: `git pull origin main`
**Verification:** `git pull` succeeds from Linode

---

### BL-P1-05 | Confirm `PAYMONGO_WEBHOOK_SECRET` env var on Linode
**Files:** Linode prod env (code is wired — commit 97cd657)
**Risk:** P1 — if missing, all PayMongo webhooks rejected 400; payment events will not process
**Verification:** `ssh root@139.162.11.242 "pm2 env 0 | grep PAYMONGO"` must return a non-empty value

---

## P2 — Architectural / SEO Items

### BL-P2-01 | DB pool exhaustion on large bulk CSV imports
**Files:** `get-hired-BE/db/dbQuery.js` (`max: 10`), `controllers/contactsController.js`, `controllers/candidateController.js`
**Risk:** P2 — `Promise.allSettled` fans out all rows concurrently; 100-row import fires 100 parallel DB calls; pool times out; rows appear as failures even with valid data
**Fix:** Install `p-limit`; wrap `contacts.map(...)` with `limit(10)` concurrency cap
**Execution pack:** See `GETHIRED_ACTIONS_RECENT_DEPLOYMENT_V5.md` EXEC-PACK-2

---

### BL-P2-02 | No CSV import row count cap
**Files:** `import-add-contact.component.ts`, `import-add-candidate.component.ts`, `import-add-user.component.ts`
**Risk:** P2 — no guard prevents 500-row CSV import; tied to pool exhaustion above
**Fix:** Guard in each `uploadListener`: if `records.length > 50` show danger-snackbar and abort
**Execution pack:** See `GETHIRED_ACTIONS_RECENT_DEPLOYMENT_V5.md` EXEC-PACK-3

---

### BL-P2-03 | Verify Angular Universal SSR is running in production
**Files:** `server.ts`, Linode nginx config
**Risk:** P2 — if Linode serves static index.html only, Googlebot cannot see dynamic titles, JSON-LD, or meta tags
**Verification:** `curl -A "Googlebot" https://gethiredonline.app/jobs/details/{active-job-id}` — check if `<title>` and `<script type="application/ld+json">` appear in raw HTML

---

### BL-P2-04 | Soft 404 on expired/unknown jobs
**Files:** `src/app/jobs/job-posts-details/job-posts-details.component.ts`, `server.ts`
**Risk:** P2 — error-state noindex now set (41b5920) but HTTP status is still 200; Google indexes thin error pages
**Fix:** Inject Angular `RESPONSE` token; call `response.status(404)` when `jobError$` fires
**Execution pack:** See `GETHIRED_ACTIONS_RECENT_DEPLOYMENT_V5.md` EXEC-PACK-5

---

### BL-P2-05 | Company pages not in sitemap
**Files:** `get-hired-BE/controllers/sitemapController.js` (or `server.js` sitemap block)
**Risk:** P2 — company profile pages discovered only via link-following, not direct sitemap crawl
**Fix:** Add query for active companies; generate `<url>` entries for `/jobs/company/:company_id`

---

### BL-P2-06 | Employer info page CTAs not crawlable `<a>` tags
**Files:** `src/app/home/employers/` component HTML
**Risk:** P2 — CTAs using `(click)="router.navigate()"` not followable by Googlebot; job-seeker portal was fixed (94e4d39)
**Fix:** Same pattern as BL-P2-06 in job-seeker portal: replace button click handlers with `<a routerLink="...">`

---

### BL-P2-07 | SVG images without explicit width/height (CLS)
**Files:** Homepage and public-page component HTML (audit needed — search for `<img src="*.svg">`)
**Risk:** P2 — CLS score degradation; browser cannot reserve layout space without explicit dimensions
**Fix:** Add `width` and `height` attributes matching SVG viewBox proportions

---

### BL-P2-08 | `localStorage` in PublicSearchComponent without `isPlatformBrowser`
**File:** `src/app/jobs/public-search/public-search.component.ts`
**Risk:** P2 — throws `ReferenceError` in Node SSR context; Angular Universal falls back to client-only render
**Fix:** Wrap `localStorage` calls in `if (isPlatformBrowser(this.platformId))`

---

### BL-P2-09 | Bulk candidate import uses `candidate` (singular) field name
**Files:** `import-add-candidate.component.ts`, `controllers/candidateController.js`
**Risk:** P2 (maintenance trap) — FE sends `{ candidate: [...] }` while contact bulk uses `{ contacts: [...] }` (plural); asymmetry can confuse future devs
**Note:** Current code matches on both sides — not a bug today

---

## P3 — Polish / A11y / DX

### BL-P3-01 | `danger-snackbar` needs `aria-live="assertive"`
**File:** Global snackbar config (Angular Material MatSnackBar)
**Issue:** MatSnackBar uses `aria-live="polite"`; error outcomes should interrupt screen readers
**Fix:** Custom `ToastComponent` with `role="alert"` via `openFromComponent()`

---

### BL-P3-02 | Keep invite dialog open with inline error on all-failed
**File:** `src/app/company/company-users/company-users.component.ts` (dialog caller)
**Issue:** Dialog closes after all-failed toast; employer must reopen to correct email addresses
**Fix:** When `outcome === 'all_failed'`, keep dialog open and render inline error panel

---

### BL-P3-03 | Per-item failure indicator in partial-success invite list
**File:** `import-add-user.component.ts`, `invitedUsersList` template
**Issue:** Partial-success renders all items equally; no visual indicator on `status: 'failed'` items
**Fix:** Add red icon / "Failed" label alongside failed email entries in the list

---

### BL-P3-04 | Unit tests for toast outcome logic
**Files:** No `.spec.ts` in contact/candidate dialog directories
**Issue:** TC-05 through TC-08 from TEST report are unimplemented; toast logic has zero automated coverage
**Fix:** Create `import-add-user.component.spec.ts`, `import-add-contact.component.spec.ts`, `import-add-candidate.component.spec.ts` covering all outcome branches (success/partial/duplicate/all-failed)

---

### BL-P3-05 | `bcrypt` → `bcryptjs`
**File:** `get-hired-BE/package.json`
**Issue:** `bcrypt` requires native binaries (node-gyp); fragile on Node 14
**Fix:** `npm uninstall bcrypt && npm install bcryptjs` — API is identical; update all `require('bcrypt')` imports

---

### BL-P3-06 | `axios` 0.x → 1.x
**File:** `get-hired-BE/package.json`
**Issue:** Outdated major version with known CVEs
**Fix:** `npm install axios@^1.7.0`; check interceptor config format (changed slightly in 1.x)

---

### BL-P3-07 | Duplicated toast decision logic across 3 import-add components
**Files:** `import-add-user.component.ts`, `import-add-contact.component.ts`, `import-add-candidate.component.ts`
**Issue:** ~95% identical branching logic; future copy/paste changes in one won't propagate to others
**Fix:** Extract `resolveImportToast(res, entityLabel: 'contact'|'candidate'|'user')` shared utility

---

### BL-P3-08 | Dead snackbar subscription branches in list components
**Files:** `contact-list.component.ts:102`, `candidate-list.component.ts:100`
**Issue:** `contact.success` / `candidate.success` reducer fields are never set; these snackBar branches never fire
**Fix:** Remove the dead `snackBar.open(contact.success, ...)` subscription branches

---

### BL-P3-09 | `importCandidateForm` uninitialized until CSV upload
**File:** `import-add-candidate.component.ts` (line ~77)
**Issue:** Form is `undefined` at init; only set inside `uploadListener()`; latent throw if `saveOnboardMultiple()` called before CSV
**Fix:** Initialize the FormGroup in `ngOnInit` (even if empty); remove commented-out `formBuilder.group` block

---

### BL-P3-10 | `reusable-table` hidden on mobile with no card fallback
**File:** `src/app/shared/components/reusable-table/reusable-table.component.html`
**Issue:** `d-none d-md-inline` hides the data table on mobile (<768px) with no alternative card view
**Fix:** Add a mobile card-view mode or responsive column hiding (show fewer columns on mobile)

---

## Deferred Features (Build When Ready)

### BL-FEAT-01 | Messages widget — employer dashboard
**Reason deferred:** No `is_read` column in messages table; no `GET /messages/all-threads` endpoint
**Prerequisites:** Add `is_read` column to messages table; implement `listAllThreadsForCompany` service

### BL-FEAT-02 | Admin companies + reports pages
**Reason deferred:** Routes don't exist; data model TBD
**Decision needed:** See DEC-06 in ACTIONS V5

### BL-FEAT-03 | Google Indexing API integration
**Reason deferred:** Blocked on BL-P1-03 (Search Console verification)
**Plan:** See `GETHIRED_SEO_GOOGLE_INDEXING_API_PLAN_V4.md`

### BL-FEAT-04 | Programmatic SEO landing pages
**Reason deferred:** Needs real data volume (5+ active jobs per city/category)
**Decision needed:** See DEC-05 in ACTIONS V5

---

## User Action Required (Cannot be done by code)

| Item | Command / URL | When |
|------|-------------|------|
| Firebase key rotation | Firebase Console → Service Accounts → Revoke + Generate | Before public launch |
| PAYMONGO_WEBHOOK_SECRET | `ssh root@139.162.11.242 "pm2 env 0 \| grep PAYMONGO"` | ASAP |
| GitHub PAT renewal | github.com/settings/tokens → update on Linode | This week |
| OG image design | 1200×630px PNG → `src/assets/brand/gethired-og-default.png` | This week |
| Search Console | search.google.com/search-console → verify + submit sitemap | After P0 resolved |
| SSR verification | `curl -A "Googlebot" https://gethiredonline.app/jobs/details/{id}` | Before SEO launch push |

---

## Items Confirmed Closed — RECENT_4 Sprint

| Item | Fixed in | Notes |
|---|---|---|
| BL-P3-01 — danger-snackbar / error ARIA assertive | FE 8a41f25 | SnackbarService with politeness:assertive for error() |
| HapticService SSR-safe | FE 8a41f25 | navigator.vibrate() guarded; registered in core.module.ts |
| WCAG AA contrast: success-snackbar | FE 8a41f25 | #FF7062 (3.1:1 FAIL) → #1A7A4A (4.85:1 PASS) |
| WCAG AA contrast: danger-snackbar / error-snackbar | FE 8a41f25 | #FE6F61 (3.1:1 FAIL) → #C0392B (5.14:1 PASS) |
| BL-P3-02 — invite all-fail keeps dialog open | FE 8a41f25 | Inline error panel + failed email list |
| BL-P3-03 — per-item failure in invite list (user) | FE 8a41f25 | Result panel itemizes failed emails in import-add-user |
| Job.companyName type safety | FE 8a41f25 | companyName?: string added to Job interface |
| localStorage SSR guard — import-add-user | FE 8a41f25 | typeof localStorage guard in ngOnInit |
| BL-P3-05 — bcrypt → bcryptjs | BE 35f7754 | bcrypt removed; bcryptjs was already active |
| BL-P3-06 — axios 0.27.2 → 1.7.9 | BE 35f7754 | No breaking changes in current usage |
| SQL injection — 14 raw interpolations | BE 986e6da | contact.service.js + candidate.service.js fully parameterized |
| deploy.yml PM2 name fix | BE 986e6da | pm2 restart 0 → pm2 restart gethired |
| ecosystem.config.js version-controlled | BE 986e6da | Entry point + process name locked to source |
| verifyAuth on /auth/manualexcelverification | BE 986e6da | Unauthenticated admin-named route now guarded |
| CORS fixed (APP_URL corrected) | BE 986e6da | Production CORS corrected |
| OG social card branded 1200×630 | FE 9f939b2 | 66KB real branded card; replaces 10KB placeholder |
| Star SVG CLS fix (width attributes) | FE 9f939b2 | width added in company-banner + applicant-avatar |
| BL-P2-08 — localStorage SSR — PublicSearchComponent | FE 880cf39 | isPlatformBrowser / typeof guard added |
| SSR localStorage guards (4 more components) | FE 880cf39 | public-list, job-board-employer-cta, public.component, job-post-search-banner |
| JWT token leak — console.log(user) in signin | FE 880cf39 | Removed |
| PII leak — console.log(this.data) in import-add-contact | FE 880cf39 | Removed |
| TELECOMMUTE remote job badge (JSON-LD) | FE 7acb092 | jobLocationType: "TELECOMMUTE" when remote |
| Description null fallback to jobTitle (JSON-LD) | FE 7acb092 | Prevents empty description in structured data |

## Items Confirmed Closed — V5 Sprint (kept for reference)

| Item | Fixed in | Notes |
|---|---|---|
| verifyAuth.js raw Firebase error leak | BE 6a7755c | Generic "Authentication failed." message returned |
| createGroup/updateGroup forEach(async) | BE 25f5e17 | Promise.allSettled fix; empty-emails edge case also fixed |
| interview.service.js forEach(async) | BE 25f5e17 | Promise.allSettled; numberOfRecipient now computed post-settlement |
| checkEmailIfExistInCandidate global scope | BE d5bba41 | Added company_id parameter + WHERE company_id = $2 filter |
| NOTIFY-P2 false-positive toasts (3 bugs) | BE 2ff6358 / FE 1863842 | status fields + outcome branches |
| forEach(async) in multipleContact/Candidate | BE 2ff6358 | Promise.allSettled; structured summary response |
| sameAs: [] empty array in Organization JSON-LD | FE 94e4d39 | Field omitted when no social URLs |
| applicant.service.ts ?id= dead param | FE 94e4d39 | Removed from getApplicant() URL |
| isMobileViewAllowed dead code | FE 94e4d39 | Removed from route data + auth guard |
| Browse jobs crawlable CTAs (job-seeker portal) | FE 94e4d39 | 3 buttons → `<a routerLink>` |
| Visual breadcrumb UI on job detail | FE 41b5920 | Breadcrumb nav + SCSS + aria-label |
| Error-state noindex on job detail | FE 41b5920 | Subscribe jobError$ → meta.updateTag noindex |
| .success-snackbar missing text color | FE 5ea4466 | color: #ffffff added |
| warning-snackbar WCAG contrast fail | FE 5ea4466 | #f59e0b → #b45309 (5.02:1 pass) |
| Import-add-user dialog mobile config | FE 5ea4466 | maxWidth: 100vw + maxHeight: 90vh to opener |
| Job detail pe-5 mobile text clipping | FE 5ea4466 | pe-5 → pe-lg-5 on description container |
| "No contacts were added." wrong copy | FE 5ea4466 | → "No invites were sent." |
| Spurious SAVE_CONTACT in candidate add | FE 21657a5 | Double-dispatch + silent contact creation removed |
| SEC-08 getJobApplicantDetails BOLA | Prior sprint | Confirmed fixed |
| addCompanyUserByEmail catch block | Prior sprint | Confirmed already clean |
| listRecruiterThreads LIMIT | Prior sprint | Confirmed already fixed |
| PayMongo webhook HMAC (stale P0) | 97cd657 | CONFIRMED ALREADY FIXED — stale risk register entry corrected |
| CORS wildcard (stale P1) | d4e34c7 | CONFIRMED ALREADY FIXED — stale risk register entry corrected |

---

*Updated by GETHIRED ACTIONS RECENT_4 | a11y sprint + security hardening + OG card + SSR guards | FE 8a41f25 / BE 35f7754*
