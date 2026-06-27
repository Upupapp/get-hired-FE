# GETHIRED CREATE JOB — ACTIONS REPORT
**Scope:** `/recruiter/jobs/create`
**Date:** 2026-06-26

---

## Backlog (prioritized by RICE)

| ID | Action | Reach | Impact | Confidence | Effort | RICE | MoSCoW |
|---|---|---|---|---|---|---|---|
| ACT-01 | Reduce banner upload limit from 300MB to 5MB | All recruiters | 8 | 10 | 1 | 80 | **Must** |
| ACT-02 | Fix `publishJobPost()` missing-field message formatting (join with ", ") | All recruiters | 6 | 8 | 1 | 48 | Should |
| ACT-03 | Add character limit + counter to Job Description (maxlength 5000) | All recruiters | 7 | 7 | 1 | 49 | Should |
| ACT-04 | Fix badge `<select>` keyboard accessibility (`(change)` on select, not `(click)` on option) | All recruiters | 5 | 7 | 2 | 17.5 | Should |
| ACT-05 | Replace "Duties" textarea placeholder with useful copy | All recruiters | 7 | 6 | 1 | 42 | Should |
| ACT-06 | Add `expirationDate` field to Step 1 (currently missing from FE, destructured in BE) | All recruiters | 5 | 7 | 5 | 7 | Could |
| ACT-07 | Add `(change)` on work setup buttons — minor transition animation on toggle | All recruiters | 6 | 5 | 5 | 6 | Could |
| ACT-08 | Add requirement chip enter/exit animation | All recruiters | 5 | 4 | 7 | 2.9 | Won't (now) |
| ACT-09 | Verify `certificationRequirements` round-trip (mappedJob casing) | Tech | 4 | 9 | 1 | 36 | **Must** |
| ACT-10 | Add draft haptic feedback (`this.haptics.success()`) on save draft | All recruiters | 5 | 4 | 7 | 2.9 | Won't (now) |

---

## Execution Packs

### Pack A — Safety (immediately, 1 engineer, half-day)
- ACT-01: Banner size limit 300MB → 5MB
- ACT-09: Verify certificationRequirements round-trip

### Pack B — Copy & UX (next PR, 1 engineer, half-day)
- ACT-02: Fix missing-field message format
- ACT-03: Add char limit/counter to Job Description
- ACT-05: Fix Duties placeholder

### Pack C — Accessibility (next sprint, 1 engineer, 1 day)
- ACT-04: Fix badge select keyboard accessibility

### Pack D — Feature (future, 1 FE + 1 BE, 2 days)
- ACT-06: Add expiration date field

---

## Decision Log

| Decision | Rationale |
|---|---|
| Console.log removed immediately | PII leak — no debate needed |
| Banner message fixed immediately | Incorrect copy, zero risk |
| Job description placeholder replaced | Functional improvement, zero risk |
| Dialog width fixed immediately | Mobile breakage, one-line change |
| 300MB banner limit deferred | Needs product decision on max acceptable image quality |
| Badge select deferred | Requires component restructure, medium effort |
