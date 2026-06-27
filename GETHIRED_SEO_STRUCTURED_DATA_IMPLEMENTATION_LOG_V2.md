# GETHIRED_SEO_STRUCTURED_DATA_IMPLEMENTATION_LOG_V2
Command: GETHIRED_REUSABLE_SEO_SEARCH_INDEXING_PUBLIC_DISCOVERY_COMMAND_V2
Date: 2026-06-27

---

## Status: COMPLETE — No implementation required

All structured data schemas were verified present and correctly implemented. No new JSON-LD was written this session.

---

## Verified Schemas

### JobPosting — `/jobs/details/:id`
**Guards verified:**
- Only emits schema when `job.jobStatusId === 2` (published)
- Omits `baseSalary` when salary data is null (no fake data)
- Omits `validThrough` when no expiry date (no fake data)
- Omits `hiringOrganization.logo` when company has no logo
- Sets `jobLocationType: "TELECOMMUTE"` only for remote jobs

**Critical safety check:** Schema is completely omitted for draft/expired/invalid jobs. This prevents Google from indexing stale salary/role data.

### Organization + WebSite — `/home`
Both emitted on the home/portal page. WebSite includes `SearchAction` pointing to `/jobs/search/{search_term_string}` — enables Google Sitelinks Searchbox eligibility.

### BreadcrumbList — All public pages
Correct hierarchical representation on every indexable page. Items use full `https://gethiredonline.app/...` URLs.

---

## Implementation Quality Notes

### SSR Safety
JSON-LD scripts are injected via the `DOCUMENT` injection token — not via `document.` calls. This means SSR rendering correctly includes structured data in the server-rendered HTML, making it available to Google's crawler even before JavaScript executes.

### SPA Navigation Safety
Scripts are identified by unique element IDs (e.g., `id="job-posting-ld"`) and replaced (not appended) on each route change. This prevents accumulation of stale schemas across navigation events.

### XSS Prevention
Entity decoding uses the `<textarea>` method (not `innerHTML`) to prevent injection of malicious content from the database into JSON-LD strings.

---

## Not Implemented (Intentional Deferrals)

| Schema | Reason not implemented |
|---|---|
| FAQPage | No public FAQ accordion UI exists to pair with |
| Review/Rating | No review system; would be fake data (violation) |
| Event | No event-based content yet |
| SoftwareApplication | Marketing pages lack stable, structured product feature copy |
| HowTo | No how-to guides on public pages |

---

## Testing Approach for Structured Data

To verify JSON-LD in production:
1. Curl any job detail URL: `curl -s https://gethiredonline.app/jobs/details/{id} | grep -i "jobposting"`
2. Paste URL into Google's Rich Results Test: https://search.google.com/test/rich-results
3. Paste URL into Schema Markup Validator: https://validator.schema.org/
4. Check Google Search Console → Enhancements → Job Posting for errors
