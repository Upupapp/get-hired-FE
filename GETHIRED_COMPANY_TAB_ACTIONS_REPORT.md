# GETHIRED COMPANY TAB — ACTIONS REPORT
**Scope:** Employer Portal › Company Tab
**Date:** 2026-06-26

---

## Backlog (prioritized by RICE)

| ID | Action | Reach | Impact | Confidence | Effort | RICE | MoSCoW |
|---|---|---|---|---|---|---|---|
| ACT-01 | Fix `addCompanyUser` BE BOLA — re-derive companyId from JWT | All employers | 9 | 10 | 1 | 90 | **Must** |
| ACT-02 | Fix `GET /company/getAllCompanies` — add auth or restrict fields | Public | 7 | 8 | 1 | 56 | **Must** |
| ACT-03 | Inline save feedback (replace MatDialog with SnackbarService + button state) | All employers | 7 | 9 | 2 | 31.5 | Should |
| ACT-04 | Verify and fix work setup options endpoint (CM-03) | All employers | 6 | 9 | 1 | 54 | **Must** |
| ACT-05 | Add client-side logo file size limit (2MB) before base64 | All employers | 5 | 7 | 1 | 35 | Should |
| ACT-06 | Empty state for company-users when no team members | All employers | 5 | 6 | 1 | 30 | Should |
| ACT-07 | Add `companyAddressOne` round-trip verification | All employers | 4 | 6 | 1 | 24 | Could |
| ACT-08 | Add "Coming soon" fields: Mission & Values, Why Work With Us (DB + FE) | All employers | 8 | 7 | 6 | 9.3 | Could |
| ACT-09 | Add company website URL + LinkedIn URL fields (trust signals) | All employers | 7 | 8 | 7 | 8 | Could |
| ACT-10 | Add profile completion percentage indicator (# of fields filled) | All employers | 7 | 8 | 7 | 8 | Could |
| ACT-11 | Add "how company profile appears on jobs" live preview in Brand tab | All employers | 6 | 8 | 6 | 8 | Won't (now) |

---

## Execution Packs

### Pack A — Security (do immediately, 1 engineer, 1-2 days)
- ACT-01: Fix `addCompanyUser` BE BOLA
- ACT-02: Fix `GET /company/getAllCompanies` auth
- ACT-04: Verify/fix work setup endpoint

### Pack B — UX Polish (next sprint, 1 engineer, 2-3 days)
- ACT-03: Inline save feedback
- ACT-05: Logo file size limit
- ACT-06: Empty state for company users

### Pack C — Content Richness (future, 1 FE + 1 BE, 1 week)
- ACT-08: Mission & Values + Why Work With Us (new DB columns + FE form fields)
- ACT-09: Company website + LinkedIn URL

### Pack D — Conversion (future, 1 FE, 3 days)
- ACT-10: Profile completion indicator
- ACT-11: Live public preview panel

---

## Decision Log

| Decision | Rationale |
|---|---|
| Console.log cleanup applied immediately | PII leak — no product debate needed |
| Character counter added to textarea | Zero behavior change, pure UX win |
| Touch targets fixed in same pass | WCAG compliance, zero risk |
| Keyboard nav added | ARIA spec requires it for tablist role |
| `addCompanyUser` BOLA deferred to BE fix | FE-only fix not possible without BE change |
