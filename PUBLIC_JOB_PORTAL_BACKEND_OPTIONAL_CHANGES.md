# Public Job Portal — Backend Optional Changes

Everything in this doc is **optional, additive backend work** the public-portal redesign would benefit from, but none of it was required to ship the redesign itself (per the mission's "backend rewrite" non-goal). Nothing here has been applied to `get-hired-BE` as part of this doc — these are recommendations for a future backend pass.

## Already fixed (for reference, not actionable)

- `companyDetailsById()`/`companyList()`'s `RIGHT JOIN industry` → `LEFT JOIN` bug (§1.6 of the redesign doc) — fixed during this session's STITCH pass, live-verified. No longer blocks the Company Snapshot component, though that component still avoids depending on the endpoint by design (see its own header comment).

## Recommended additions

| Field/Endpoint | Why it would help | Current FE workaround |
|---|---|---|
| Salary pay-period (`monthly`/`hourly`/`annual`) on the `jobs` table | `JobStructuredDataService`'s `baseSalary.value` currently omits `unitText` because no pay-period field exists anywhere in the data model — Google's structured-data validator likely flags this as incomplete. Adding even a simple enum column would let the FE emit fully valid `baseSalary` schema. | Omit `unitText` entirely rather than guess (a guess could misrepresent real compensation) |
| Saved jobs (`POST /api/job/save`, `GET /api/job/saved`) | `NormalizedJob.savedStatus` is hardcoded to `'unknown'` — there's no way to let an applicant bookmark a job today | Save/bookmark UI is not built at all yet (not in this redesign's scope) |
| Job-level view/application counts | Would let the FE show real "X people viewed this" or "X applicants so far" signals — currently impossible without these, and the mission explicitly forbids fabricating them | None — these badges simply don't exist in the UI |
| `is_featured`/`is_urgent` flags with real criteria | Same reasoning — any "featured" or "urgent" badge today would be fake unless backed by a real flag | None — not built |
| Job-type lookup data exposed via the existing `/options/type` endpoint, used to drive the public hero/search dropdowns instead of hardcoded HTML `<option>` values | This session found the hero/search job-type filter options didn't match real `job_type_name` values at all ("Full-Time" vs "Full time", "Freelance" doesn't exist) — hardcoding them risks drifting out of sync again the next time someone adds a job type in the DB | Hardcoded dropdown values manually corrected to match today's 3 real values; will silently break again if a 4th job type is ever added without updating the FE too |
| CORS allowed-origins config per brand (gethired/jobhunt/eucannajobs) | Flagged in this session's security pack as a P1 item — `cors()` currently has no restriction | N/A (backend-only fix, needs the real production domains from the operator) |
| PayMongo webhook signing secret | Needed to close the webhook-signature-verification gap (GH-ACT-003) | N/A (needs the operator's PayMongo dashboard) |

## Not recommended

- Adding a fake "AI match score" backend field — the FE's `JobCompatibilityService` is intentionally deterministic and frontend-only; making it look backend-computed would misrepresent how it works.
- Adding "actively reviewing applications" or similar fabricated recruiter-activity signals — no real signal for this exists today, and the mission explicitly forbids fabricating one.
