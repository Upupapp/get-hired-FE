# GetHired Actions Report — Post-SEO V3 Deployment (V2)
**Scope:** SEO V3 deployment (FE bf5bd08, BE 26ca25a) + full carry-over backlog
**Date:** 2026-06-25
**Mode:** Recent-deployment — planning only, no code changes in this document

---

## 1. Deployment Summary — SEO V3

Items shipped in the SEO V3 cycle:

| Tag | Description | Status |
|-----|-------------|--------|
| SEO-SVC | SeoService (seo.service.ts) — centralized title/description/robots/canonical/OG/JSON-LD | SHIPPED |
| SEO-JSONLD-JOB | JobPosting JSON-LD on active job detail pages | SHIPPED |
| SEO-JSONLD-ORG | Organization JSON-LD on homepage | SHIPPED |
| SEO-JSONLD-WEB | WebSite + SearchAction JSON-LD on homepage | SHIPPED |
| SEO-JSONLD-BC | BreadcrumbList on job detail + job list pages | SHIPPED |
| SEO-ROBOTS | robots.txt — disallows private/auth/admin/payment routes; added to angular.json assets | SHIPPED |
| SEO-SITEMAP | GET /sitemap.xml on BE — published jobs + 4 static pages, 1-hour in-memory cache | SHIPPED |
| SEO-META-10 | Page meta (title/description/canonical/OG/Twitter) on 10 components | SHIPPED |
| SEO-NOINDEX | noindex on inactive job detail, 404, sign-in, search results | SHIPPED |
| SEO-SKELETON | Skeleton loading CSS + job card hover lift in styles.scss | SHIPPED |

27 acceptance criteria pass in the release gate (GETHIRED_SEO_RELEASE_GATE_V3.md).

---

## 2. SEO V3 Completion Gaps (New Items)

### SEO-GAP-01 — OG Default Image Missing (P1 — BLOCKING)
**File:** `src/assets/brand/` — no `gethired-og-default.png` file
**Impact:** Every `og:image` and `twitter:image` tag resolves to a broken URL (`https://gethiredonline.app/assets/brand/gethired-og-default.png`). Link previews on LinkedIn, Facebook, Twitter/X, WhatsApp, and Viber show no image or a broken image icon. This affects every page where SeoService is called.
**Confirmation:** `src/assets/brand/` contains only the `gethired-wow/` SVG subdirectory. No PNG file exists.
**Action:** Design and export a 1200×630 PNG OG image with the GetHired Online logo, brand colors, and tagline. Save to `src/assets/brand/gethired-og-default.png`. No code changes required after placement — SeoService and index.html already reference this exact path.
**Owner:** Designer / non-code task. Blocker for social sharing.

---

### SEO-GAP-02 — Google Search Console Sitemap Not Submitted (P1)
**Context:** `index.html` contains a Google Search Console verification meta tag (`EYWOEFfXbR2hY6_iyAD0X8UXPX4fHysRFjxnOUJoEJo`). The robots.txt references the sitemap at `https://gethiredonline.app/sitemap.xml`. The sitemap endpoint is live on BE.
**Gap:** The sitemap has not been submitted to Google Search Console. Without submission, Googlebot discovers the sitemap only if it follows the reference in robots.txt — which can take days to weeks.
**Action (manual — Google account required):**
1. Go to Google Search Console → Properties → `gethiredonline.app`.
2. Verify ownership (the meta tag in index.html should already pass if the site is indexed).
3. Navigate to Sitemaps → Add a new sitemap → Enter `sitemap.xml` → Submit.
4. Monitor Coverage report for crawl errors within 48-72 hours.
**Owner:** Platform owner (requires Google account access to Search Console).

---

### SEO-GAP-03 — Logo Asset Not Verified for Organization JSON-LD (P1)
**File:** `src/assets/images/logo.png`
**Context:** `setOrganizationJsonLd()` in SeoService emits `logo: "https://gethiredonline.app/assets/images/logo.png"`. Google uses this URL for rich results (Knowledge Panel, logo in search).
**Gap:** The release gate noted this asset must be verified. Directory listing of `src/assets/images/` shows `logo.png` exists locally, but it has not been confirmed to be deployed and accessible at the production URL.
**Action:** In a browser, load `https://gethiredonline.app/assets/images/logo.png`. Confirm it returns a valid image (not 404). If 404, ensure angular.json assets includes `src/assets/images/` (it should by default).
**Owner:** Developer — 5-minute manual verification.

---

### SEO-GAP-04 — SEC-01 BOLA on GET /applicant/userprofile (P0 — Carry-over)
**File:** `controllers/applicantsController.js:238-249`
**Root cause confirmed:** `getUserProfile` in `applicantsController.js` reads `id` from `req.query` — not from `req.user` (JWT). Any authenticated user can probe any other user's profile by supplying a different `id` query param.
**Route:** `GET /api/applicant/userprofile?id=<any_uid>` — covered by `verifyAuth` but not BOLA-isolated.
**Action:** Replace `const { id } = req.query` with `const id = req.user.uid` (already available from JWT middleware). This is a one-line fix. Regression test: verify FE sends no explicit `id` param and uses the JWT-derived value.
**Note:** The `userController.js:261-268` version of `getUserProfile` correctly reads from `req.user.uid`. The applicantsController version does not.

---

### SEO-GAP-05 — PayMongo Webhook No Idempotency Guard (P1 — Carry-over)
**File:** `controllers/paymentController.js:96-115`
**Confirmed:** `paymongoWebhook` calls `insertTransactionTable(id, checkout_url, reference_number)` every time the webhook fires for a `link.payment.paid` event. PayMongo may redeliver webhooks on timeout or retry. No `ON CONFLICT DO NOTHING` or prior existence check exists on `transaction_table`.
**Risk:** Duplicate webhook deliveries create duplicate transaction records and potentially duplicate subscription activations.
**Action (short term):** Add `ON CONFLICT (reference_number) DO NOTHING` to the `insertTransactionTable` INSERT (or use `ON CONFLICT (id) DO NOTHING` if `id` is the PayMongo payment link ID). Return early if no row was inserted (rowCount === 0) to prevent the downstream subscription activation from running twice.
**Action (long term):** Persist processed webhook event IDs and return 200 immediately for duplicates.

---

### SEO-GAP-06 — Expired Jobs Still Indexed via Sitemap (P2)
**File:** `get-hired-BE/server.js:170-173` (sitemap query)
**Status:** PARTIALLY RESOLVED. The sitemap query (`WHERE job_status_id = 2`) correctly excludes expired/archived jobs from the sitemap. The FE (`public-details.component.ts:50`) sets `noindex, nofollow` for inactive jobs (jobStatusId !== 2). These two controls are in place.
**Remaining gap:** Google may have already crawled a job URL before it expired. The noindex tag on the FE requires Googlebot to re-crawl the page to pick up the change. Until the next crawl, the URL remains indexed.
**Action (current):** Use the Google Search Console URL Inspection tool to manually request removal of specific expired job URLs if needed. No code change required for standard expiration.
**Action (future / P3):** Implement the Google Indexing API (see GETHIRED_SEO_GOOGLE_INDEXING_API_PLAN_V3.md) to proactively signal `URL_DELETED` when a job expires or is archived. This speeds de-indexing from weeks to hours.

---

### SEO-GAP-07 — No hreflang Tags (P3 — Intentional Deferral, Documented)
**Status:** Decision made in SEO V3 release gate (criterion 21: PASS). No URL-based language routing exists; therefore hreflang is not applicable. The Philippines market uses English-language job content.
**Condition to revisit:** If a Tagalog language toggle is added with URL prefixes (`/tl/jobs`), add `hreflang="tl-PH"` / `hreflang="en-PH"` pairs.
**No action required now.**

---

### SEO-GAP-08 — Google Indexing API Not Integrated (P3)
**Status:** Plan documented in `GETHIRED_SEO_GOOGLE_INDEXING_API_PLAN_V3.md`. Not yet implemented.
**Trigger points identified:** job publish (status → 2) and job expire/delete (status → 3/4).
**Prerequisites not yet met:**
1. Google Search Console property verified (depends on SEO-GAP-02).
2. Google Cloud service account for Indexing API not created.
3. No `googleapis` npm package in BE `package.json`.
**Action:** Defer until SEO-GAP-02 is complete. Then: create GCP service account, install `googleapis`, implement `helpers/googleIndexingApi.js`, hook into `updateStatusOfJob` and `deleteJob` in `jobsController.js`.

---

### SEO-GAP-09 — Company Pages Not in Sitemap (P2)
**File:** `get-hired-BE/server.js` — sitemap endpoint
**Context:** `/companies/details?id=<companyId>` pages have SEO metadata (wired in `public-company-details.component.ts`) but are not included in the sitemap XML.
**Gap:** Googlebot cannot discover company pages from the sitemap. It can only find them via internal links from job detail pages.
**Action:** Add a second DB query in the sitemap endpoint: `SELECT company_id, updated_at FROM <schema>.companies WHERE is_active = true` (verify column name). Map to URLs as `${BASE_URL}/companies/details?id=${row.company_id}`. Note: query-param URLs are less SEO-friendly than path params — see P3-07 in the backlog for the `/companies/:id` migration.
**Note:** Verify the `companies` table exists and the correct column for active status before implementing.

---

### SEO-GAP-10 — False-Positive "Successfully added contact" Toast (P2 — Carry-over)
**Context:** When all company invite emails fail validation, the FE still shows a success toast. This is a UX trust issue and a functional bug — not an SEO issue — but was flagged in prior NOTIFY/ACTIONS cycles.
**Action:** In the invite flow component, check response payload for actual success before triggering the success toast. If all invited emails return errors, show an error or partial-success message.

---

### SEO-GAP-11 — getUserCompany(uid) Called 2-4x Per Request (P2 — Carry-over)
**Context:** Performance finding from prior cycles. No caching layer exists; the same DB lookup is made redundantly within single request lifecycles.
**Action:** Memoize or cache `getUserCompany` result within the request scope (simple module-level Map with request ID key, or pass company data as a parameter instead of re-querying).

---

## 3. New Items Surfaced by SEO V3

### SEO-NEW-01 — SeoService Canonical Injection Browser-Only (P2)
**File:** `src/app/core/services/seo.service.ts:126-140`
**Finding:** `setCanonical()` early-returns with no-op when `!this.isBrowser`. In SSR (Angular Universal), the canonical `<link>` tag is never injected server-side. For an SPA without SSR active, this is not an issue. However, if SSR is ever enabled, canonical tags will be absent from server-rendered HTML.
**Action:** Document as known limitation. If SSR is added, use Angular Universal's `TransferState` or `@angular/platform-server`'s renderer to inject canonical server-side.

---

### SEO-NEW-02 — robots.txt Served via FE Static Build, Not BE Route (P3 — Decision Required)
**Context:** `src/robots.txt` is bundled via Angular build into `dist/get-hired/robots.txt`. This is correct for a purely static FE host. However, if the FE is served via Node/nginx and the BE handles `/robots.txt`, there could be a routing conflict.
**Current production behavior:** Unknown — needs verification that `https://gethiredonline.app/robots.txt` returns the correct file (not 404 or default nginx response).
**Action:** Load `https://gethiredonline.app/robots.txt` in a browser. Confirm it returns the correct disallow rules and sitemap reference.

---

### SEO-NEW-03 — Sitemap Served from api.gethiredonline.app, Not gethiredonline.app (P1 — Verify)
**Context:** The FE environment (`src/environments/environment.ts`) sets `api_url` to `api.gethiredonline.app`. The sitemap endpoint is at `GET /sitemap.xml` on the BE (api subdomain). The robots.txt references `Sitemap: https://gethiredonline.app/sitemap.xml` (main domain).
**Risk:** If the BE is only accessible at `https://api.gethiredonline.app/sitemap.xml` but robots.txt tells Googlebot to look at `https://gethiredonline.app/sitemap.xml`, the sitemap URL in robots.txt is broken.
**Action:** Verify by loading `https://gethiredonline.app/sitemap.xml` in a browser. If it returns 404, either: (a) add a nginx proxy rule to forward `/sitemap.xml` requests from the main domain to the BE, or (b) update robots.txt to point to `https://api.gethiredonline.app/sitemap.xml`. Option (a) is preferred for SEO — search engines prefer sitemaps on the same domain as content.

---

## 4. Carry-Over Items (Unchanged by SEO V3)

These items from prior ACTIONS/SECURE/LAUNCH backlog remain open:

| ID | Description | Priority | Status |
|----|-------------|---------|--------|
| LAUNCH-01 | No applicant UI feedback on application submission | P1 | Open |
| LAUNCH-02 | No email notification on apply or status change | P1 | Open |
| SEC-01 | BOLA on GET /applicant/userprofile (req.query.id not JWT) | P0 | Open — see SEO-GAP-04 |
| SEC-02 | GET /job/details uid param probing | P1 | Open |
| PAY-01 | PayMongo webhook no idempotency guard | P1 | Open — see SEO-GAP-05 |
| PERF-01 | getUserCompany(uid) 2-4x calls per request | P2 | Open |
| NEW-01 | Firebase key rotation git history purge unconfirmed | P0 | Open — from V1 |
| NEW-02 | PayMongo webhook silent rejection if env var not set | P1 | Open — from V1 |
| NEW-03 | CORS single-origin blocks www variant + local dev | P2 | Open — from V1 |
| NEW-04 | deleteJob cascades to applicant history (no guard) | P2 | Open — from V1 |
| NEW-05 | Module-level `now = new Date()` in subscription controller | P2 | Open — from V1 |
| NEW-06 | PII console.log in login/auth flow | P2 | Open — from V1 |
| NEW-07 | Rate limiter may throttle PayMongo webhook delivery | P3 | Open — from V1 |
| NEW-08 | Missing CSP, HSTS, Referrer-Policy headers | P3 | Open — from V1 |

---

## 5. Finding Count

| Priority | SEO V3 Completion Gaps | New (SEO V3 surfaced) | Carry-over | Total |
|---------|------------------------|----------------------|------------|-------|
| P0 | 1 (SEC-01) | 0 | 1 (Firebase) | 2 |
| P1 | 3 (OG image, Search Console, webhook idempotency) | 1 (sitemap domain mismatch) | 3 | 7 |
| P2 | 3 (company sitemap, toast, getUserCompany) | 1 (canonical SSR) | 6 | 10 |
| P3 | 2 (Indexing API, hreflang) | 1 (robots.txt routing) | 3 | 6 |
| **Total** | **9** | **3** | **13** | **25** |

---

*Report generated 2026-06-25. Planning only — no code changes made.*
