# GETHIRED STITCH FIX LOG — SEO V3 Recent Deployment
**Mode:** Recent deployment audit (commits bf5bd08 FE, 26ca25a BE)
**Date:** 2026-06-25

---

## Applied Fix: BE-001 — XML-encode job_id in sitemap

**File:** `C:\Users\paulg\OneDrive\Desktop\Gethired\get-hired-BE\server.js`
**Risk:** Safe — additive helper, no behaviour change for well-formed job_ids (UUIDs only contain alphanumeric and hyphens, none of which are XML special characters)
**Why:** `job_id` is `varchar` in the DB with no server-enforced format constraint. The FE sends a client-generated ID but the BE does not validate its format. If a job_id ever contains `&`, `<`, `>`, `"`, or `'`, the sitemap XML would be malformed — causing search engines to reject the entire document and stop crawling all job listings.
**Classification:** P3 hardening (not P0/P1 — not exploitable for XSS since malformed XML is rejected by parsers, not rendered)

**Change:**
Added `xmlEscape()` helper before the sitemap URL block:
```js
const xmlEscape = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
```

Changed sitemap row template from:
```js
`...${row.job_id}...`
```
To:
```js
const safeJobId = xmlEscape(row.job_id);
`...${safeJobId}...`
```

---

## Not Applied (No Fix Needed)

The following were investigated and found correct:
- JSON-LD dedup via ID — already correct, no fix needed
- SSR guard via isPlatformBrowser — already correct, no fix needed
- company_name JOIN — already correct, camelCase fallback works
- Dynamic import circular dependency — no cycle exists, no fix needed
- Sitemap URL vs FE route — exact match confirmed, no fix needed
- robots.txt in dist/ — already correct, no fix needed

---

## Declined Items (Document Only)

| Item | Decision |
|---|---|
| Dead snake_case `company_name` fallback in public-details.component.ts | Document only — harmless, second fallback covers it; fixing would be noise |
| `companyName` not in `Model.Job` interface | Pre-existing technical debt; adding it is safe but separate from SEO V3 |
| Bare `document` instead of Angular `DOCUMENT` token | Style issue only; the `isPlatformBrowser` guard makes it safe |
| Dynamic imports redundant (modules already cached) | Cosmetic; simplifying to direct references is a separate cleanup |
