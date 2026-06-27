# GETHIRED_SEO_SITEMAP_ROBOTS_IMPLEMENTATION_LOG_V2
Command: GETHIRED_REUSABLE_SEO_SEARCH_INDEXING_PUBLIC_DISCOVERY_COMMAND_V2
Date: 2026-06-27

---

## Changes Made This Session

### 1. Added `/companies` to sitemap static pages
**File:** `get-hired-BE/server.js`
**Lines:** ~208–213
**Status:** ✅ APPLIED

**Before:**
```javascript
const staticPages = [
  { loc: `${BASE_URL}/home`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/jobs`, changefreq: "daily", priority: "0.9" },
  { loc: `${BASE_URL}/job-seekers`, changefreq: "monthly", priority: "0.7" },
  { loc: `${BASE_URL}/employers`, changefreq: "monthly", priority: "0.7" },
];
```

**After:**
```javascript
const staticPages = [
  { loc: `${BASE_URL}/home`, changefreq: "weekly", priority: "1.0" },
  { loc: `${BASE_URL}/jobs`, changefreq: "daily", priority: "0.9" },
  { loc: `${BASE_URL}/companies`, changefreq: "weekly", priority: "0.7" },
  { loc: `${BASE_URL}/job-seekers`, changefreq: "monthly", priority: "0.6" },
  { loc: `${BASE_URL}/employers`, changefreq: "monthly", priority: "0.6" },
];
```

**Why:** `/companies` is a fully public, indexable route showing company listings. It was previously missing from the sitemap, meaning Google would only discover it via crawling, not sitemap submission. Priority 0.7 matches other top-tier public content pages. Job-seekers and employers deprioritized from 0.7 to 0.6 since they are marketing pages, not real-content pages.

**Needs deploy:** BE must be redeployed for this change to go live. The in-memory cache will rebuild on next request after deploy.

---

## Pre-Existing (Verified Present, No Changes Made)

### robots.txt
**Location:** `src/robots.txt` (included in angular.json assets → deployed to dist root)
**Status:** Complete. No changes needed.

Verified disallows:
- All private app routes (`/admin`, `/recruiter`, `/user`, `/owner`, `/investor`)
- All API routes (`/api/`)
- Auth flows (`/signin`, `/signup`, `/reset-password`, `/change-password`, `/verify`)
- Payment/subscription routes
- Search result pages (`/jobs/search/`)

Verified allows:
- All other routes (default)

Verified sitemap declaration:
- `Sitemap: https://gethiredonline.app/sitemap.xml`

### Dynamic Sitemap Endpoint
- Live at `https://gethiredonline.app/sitemap.xml`
- Returns 200 with correct XML format
- 15-minute in-memory cache
- `Cache-Control: public, max-age=900`
- 503 on DB error (correct behavior — tells Google to retry, not de-index)
- XML escaping via `xmlEscape()` function

---

## Deployment Note

The sitemap `companies` fix is in the BE. Deploy command:

```powershell
ssh root@139.162.11.242 "cd /var/www/_work/get-hired-BE && git pull --ff-only && npm install --omit=dev && pm2 restart gethired --update-env"
```

After deploy, the next sitemap request will rebuild the cache with 5 static pages (was 4).
