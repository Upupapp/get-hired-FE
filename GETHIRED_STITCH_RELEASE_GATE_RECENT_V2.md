# GETHIRED STITCH RELEASE GATE — SEO V3 Integration
**Mode:** Recent deployment audit (commits bf5bd08 FE, 26ca25a BE)
**Date:** 2026-06-25

---

## Gate Results

| Gate | Check | Result |
|---|---|---|
| G1 | JobPosting JSON-LD emits valid structured data with real fields | PASS |
| G2 | company_name reaches SeoService via BE JOIN | PASS |
| G3 | JSON-LD uses ID-based dedup — no duplicate scripts on navigation | PASS |
| G4 | ngOnDestroy clears JSON-LD and unsubscribes | PASS |
| G5 | SSR guard: all document access behind isPlatformBrowser | PASS |
| G6 | Sitemap URL matches FE route `/jobs/details/:id` | PASS |
| G7 | All 4 static sitemap pages have matching FE routes | PASS |
| G8 | Sitemap conflicts with no existing /api route | PASS |
| G9 | robots.txt dist copy matches src/robots.txt | PASS |
| G10 | robots.txt Sitemap directive points to correct URL | PASS |
| G11 | Sitemap has in-memory cache (prevents DB hammering by bots) | PASS |
| G12 | Sitemap DB import has no circular dependency | PASS |
| G13 | XML injection: job_id is now XML-encoded (fix applied) | PASS (fixed) |
| G14 | noindex set on inactive jobs (jobStatusId !== 2) | PASS |
| G15 | JobPosting schema only emitted for active jobs (jobStatusId === 2) | PASS |

---

## Critical Risks: 0

No blocking issues remain.

---

## Non-Blocking Findings (Backlog)

| ID | Severity | Finding | Recommendation |
|---|---|---|---|
| NB-01 | P4 | Dead snake_case `company_name` check in public-details: `(job as any).company_name` is always undefined because the store holds camelCase-mapped objects | Remove first fallback or add comment; second fallback `companyName` is correct |
| NB-02 | P4 | `companyName` not declared in `Model.Job` TypeScript interface — only available at runtime from the store | Add `companyName?: string` to `Model.Job` to remove the need for `(job as any)` casts |
| NB-03 | P4 | Bare `document` used instead of Angular `DOCUMENT` injection token in SeoService | Style issue only; safe given `isPlatformBrowser` guard |
| NB-04 | P4 | Dynamic `import()` in sitemap handler is redundant — modules are already statically imported and cached | Simplify to direct `dbQuery.query(...)` reference; cosmetic cleanup |
| NB-05 | P3 | Split-brain architecture: robots.txt served by nginx/FE, sitemap served by BE/Node.js | Document in ops runbook: BE downtime makes sitemap unreachable while robots.txt still serves |

---

## Release Readiness

**SEO V3 integration: READY**

All 8 seams audited. 15/15 gates pass (G13 required and received a fix). No critical risks.

**Public portal redesign readiness: Ready with caution**
- SEO layer is solid
- The split-brain robots.txt/sitemap architecture should be documented before any ops change that might restart only one of the two services
- The `companyName` interface gap (NB-02) is worth addressing before any TypeScript strict-mode tightening

---

## Deployment Notes

**BE fix deployed this session:**
- `server.js` — `xmlEscape()` helper added, `job_id` now XML-encoded in sitemap (line ~155)

**FE — no code changes required.** All FE seams confirmed correct.

**To deploy BE fix:**
```bash
ssh root@139.162.11.242 "cd /path/to/get-hired-BE && git pull && pm2 restart all"
```
