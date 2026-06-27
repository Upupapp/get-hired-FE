# GetHired Launch Blockers — Post-SEO V3 (V2)
**Date:** 2026-06-25
**Definition:** A launch blocker is any issue that, if unresolved at launch, creates a security vulnerability, breaks a payment flow, makes the product unusable for its primary use case, or actively misleads users.

---

## Current Launch Blockers: 4

---

### LB-01 — BOLA on User Profile Endpoint (P0 — Security)
**ID:** P0-SEC-01 / SEO-GAP-04
**Route:** `GET /api/applicant/userprofile?id=<any_uid>`
**Impact:** Any logged-in user can read any other user's profile (name, email, photo, work history) by guessing or enumerating user IDs. This is an active BOLA (Broken Object-Level Authorization) vulnerability. Severity is high because profile data includes PII.
**File:** `controllers/applicantsController.js:238-249` — reads `const { id } = req.query` instead of `req.user.uid`.
**Fix:** One-line change: `const id = req.user.uid;` (same pattern as `getDashboard` in the same file at line 252).
**Status:** Open. Carried from SEC-01 in prior backlog. Not fixed by SEO V3.

---

### LB-02 — Firebase Service Account Key Leaked in Git History (P0 — Security)
**ID:** P0-NEW-01
**Impact:** If the Firebase service account JSON key was committed to the git repo and has not been revoked and purged from history, anyone with repo access (or anyone who ever cloned it) can impersonate the Firebase admin service account. This gives full Firebase Auth and Firestore admin access.
**Status:** Deployment notes mention "Firebase key rotation" but the git log contains no `git filter-repo` or BFG purge commit. The old key's revocation status in Firebase Console is unconfirmed.
**Fix required:**
  1. Revoke the old service account key in Firebase Console → IAM & Admin → Service Accounts.
  2. Run `git filter-repo --path "*.json" --invert-paths` (or BFG) to purge from git history.
  3. Force-push all branches. Update all collaborators.
  4. In `middleware/firebaseApp.js`, load key from `process.env.FIREBASE_SERVICE_ACCOUNT_JSON` (JSON.parse) instead of a file path.
**Status:** Open. From V1 backlog NEW-01.

---

### LB-03 — OG Default Image Missing — All Social Shares Show Broken Image (P1 — User Trust)
**ID:** P1-SEO-01 / SEO-GAP-01
**Impact:** `https://gethiredonline.app/assets/brand/gethired-og-default.png` does not exist. Every page where SeoService sets the default og:image (homepage, job list, search results, employer portal, job seeker portal, company pages, sign-in) renders a broken image icon in social media previews. Job detail pages that rely on the default (no per-job image) are also broken. This is a trust and brand issue that affects every social share from day one.
**File:** `src/assets/brand/` — directory exists but contains only `gethired-wow/` SVG subdirectory. No PNG.
**Fix:** Create and export `gethired-og-default.png` at 1200×630 pixels. Place in `src/assets/brand/`. Rebuild and redeploy FE. No code change required.
**Owner:** Designer.

---

### LB-04 — Sitemap May Not Be Accessible at gethiredonline.app/sitemap.xml (P1 — SEO Infrastructure)
**ID:** P1-SEO-03 / SEO-NEW-03
**Impact:** `robots.txt` tells Googlebot to find the sitemap at `https://gethiredonline.app/sitemap.xml`. The sitemap endpoint exists on the BE (`api.gethiredonline.app`). If there is no nginx proxy rule forwarding `/sitemap.xml` from the main domain to the BE, the sitemap URL in robots.txt is a dead link. Googlebot will log a sitemap error and the sitemap submission in Search Console will fail.
**Verification:** Load `https://gethiredonline.app/sitemap.xml` in a browser. Expected: XML sitemap with job URLs. If 404: add nginx `location /sitemap.xml { proxy_pass http://api.gethiredonline.app/sitemap.xml; }` (or equivalent).
**Status:** Unverified. Not blocked by code — blocked by nginx configuration on Linode.

---

## Previously Blocking — Now Resolved by SEO V3

| Item | Resolution |
|------|-----------|
| No page titles or descriptions (Googlebot would see blank metadata) | RESOLVED — SeoService wired to 10 components |
| No robots.txt (private routes exposed to indexing) | RESOLVED — src/robots.txt deployed |
| No sitemap (Googlebot could not discover job URLs efficiently) | RESOLVED — /sitemap.xml endpoint live on BE |
| No canonical tags | RESOLVED — SeoService.setCanonical() called per route |
| Expired/inactive jobs indexed with JobPosting schema | RESOLVED — noindex set for jobStatusId !== 2; JobPosting JSON-LD only emitted for status === 2 |
| No structured data (missing from Google rich results) | RESOLVED — JobPosting, Organization, WebSite, BreadcrumbList all implemented |

---

## Items That Are NOT Launch Blockers (but are in the backlog)

| Item | Why Not a Blocker |
|------|------------------|
| Company pages not in sitemap (P2-SEO-01) | Googlebot will still find them via internal links from job detail pages |
| hreflang missing (P3-SEO-09) | Philippines market is English-only; no URL-based language routing exists |
| Google Indexing API not integrated (P3-SEO-01) | Not integrated — organic crawl handles initial indexing |
| Visual breadcrumb component missing (P2-SEO-03) | JSON-LD breadcrumbs already ship; visual is a UX improvement |
| LAUNCH-01/02 (no apply feedback, no email) | Significant UX gap but application can still technically be submitted |
| PayMongo webhook idempotency (P1-PAY-01) | Payment works; idempotency failure requires duplicate webhook delivery |

---

*Generated 2026-06-25. All items unverified until manually checked in production.*
