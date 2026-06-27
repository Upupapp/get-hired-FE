# GETHIRED SEO Google Indexing API Plan V3

Generated: 2026-06-25  
Status: PLAN ONLY — no implementation in this pass.

## Purpose
The Google Indexing API allows programmatic notification to Google when a JobPosting URL is added or removed. This is particularly valuable for job boards because:
1. Google can index new job postings faster (hours vs days).
2. Google can de-index expired/removed job postings faster.

## When to Use
- **Notify (index):** When a job's `job_status_id` changes to 2 (published). Signal: `URL_UPDATED`.
- **De-notify (remove):** When a job's `job_status_id` changes from 2 to 3/4 (expired/archived) or job is deleted. Signal: `URL_DELETED`.

## Implementation Plan (future)

### Prerequisites
1. Google Search Console property verified for `https://gethiredonline.app` (verification tag already in index.html: EYWOEFfXbR2hY6_iyAD0X8UXPX4fHysRFjxnOUJoEJo).
2. Create a Google Cloud service account with Indexing API enabled.
3. Grant the service account "Owner" access in Search Console for the property.
4. Store service account JSON key securely in BE environment variables.

### BE Trigger Points (in jobsController.js / job.service.js)

#### On job publish (status → 2):
```javascript
// After updateStatusOfJob sets job_status_id = 2
await notifyIndexingApi('URL_UPDATED', `https://gethiredonline.app/jobs/details/${jobId}`);
```

#### On job expire/archive/delete (status → 3/4 or DELETE):
```javascript
// After status change or deleteJob
await notifyIndexingApi('URL_DELETED', `https://gethiredonline.app/jobs/details/${jobId}`);
```

### Helper Function (BE)
```javascript
// helpers/googleIndexingApi.js
import { google } from 'googleapis';

export const notifyIndexingApi = async (type, url) => {
  const auth = new google.auth.GoogleAuth({
    keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const client = await auth.getClient();
  const indexing = google.indexing({ version: 'v3', auth: client });
  await indexing.urlNotifications.publish({
    requestBody: { url, type },
  });
};
```

## Rate Limits
- Indexing API: 200 URLs per day (quota can be increased via Google Cloud Console request).
- Batch requests available for bulk operations.

## Priority
P3 — useful but not blocking. Manual Search Console URL submission can cover gaps in the short term.
