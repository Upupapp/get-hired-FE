# GetHired SEO V4 — Google Indexing API Plan

Generated: 2026-06-26

## Purpose

The Google Indexing API allows notifying Google immediately when a job is published or removed, reducing the delay between a state change and Google's index update from days/weeks to hours.

This is especially valuable for a job board where:
- New jobs should appear in Google for Jobs within hours of posting
- Expired jobs should be de-indexed within hours of closing

## Prerequisites (not yet in place)

1. **Google Search Console property verified** — the meta verification tag is present in index.html, but a human must complete the Search Console property claim.
2. **Service Account with Indexing API permissions** — a Google Cloud project + Service Account JSON key is required.
3. **Property ownership delegated** — the Service Account email must be added as an owner of the Search Console property (not just a user).

None of these exist yet. This plan is PLANNING ONLY — no credentials, no implementation yet.

## Proposed BE Integration

### Trigger points

| Event | API call | Endpoint |
|-------|----------|----------|
| Job status set to 2 (published) | `URL_UPDATED` | POST /api/job (publish path) |
| Job status set to anything other than 2 (expired/closed) | `URL_DELETED` | POST /api/job (status update path) |

### Implementation sketch (Node/Express)

```js
// get-hired-BE/services/indexing.js
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SA_KEY_FILE, // path to service account JSON
  scopes: ['https://www.googleapis.com/auth/indexing'],
});

export async function notifyGoogle(jobId, type) {
  // type: 'URL_UPDATED' or 'URL_DELETED'
  try {
    const client = await auth.getClient();
    const url = `https://gethiredonline.app/jobs/details/${jobId}`;
    await client.request({
      url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
      method: 'POST',
      data: { url, type },
    });
  } catch (err) {
    // Log but don't fail the main request — Indexing API is best-effort
    console.error('Indexing API notification failed:', err.message);
  }
}
```

### Rate limits
- 200 requests/day (default quota)
- 600 requests/minute
- Suitable for a growing job board; request increase if posting volume exceeds 200/day

## Implementation Checklist (when credentials are ready)

- [ ] Create Google Cloud project
- [ ] Enable Indexing API
- [ ] Create Service Account
- [ ] Download JSON key → store securely (not in git)
- [ ] Add Service Account email as Search Console property owner
- [ ] Add `googleapis` to BE package.json
- [ ] Add `GOOGLE_SA_KEY_FILE` to BE environment
- [ ] Implement `services/indexing.js`
- [ ] Call `notifyGoogle(jobId, 'URL_UPDATED')` on job publish
- [ ] Call `notifyGoogle(jobId, 'URL_DELETED')` on job expire/close
- [ ] Monitor Search Console Coverage report for crawl errors

## Priority: P3 (non-blocking)

robots.txt, noindex, and sitemap provide correct baseline behavior. The Indexing API is an optimization for speed — not required for correctness.
