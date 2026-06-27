# GETHIRED BRAND — Screen Audit (Phase 14)
**BRAND v6 · 2026-06-27**

Note: Employer Dashboard V5 is live at commit cba5120. Existing dashboard states (skeleton, hero-reveal, action-center error/empty, pipeline skeleton/error/empty, branding health, KPI strip) are marked PRESENT. Type scale deviations are flagged as backlog items where not safe to fix inline.

---

## 1. Public Module

### 1.1 Home / Job Board (`/jobs`)
| Check | Status | Finding |
|---|---|---|
| Loading | PARTIAL | `<app-inline-loading>` GIF spinner only; skeleton classes defined in styles.scss but not wired to public list |
| Empty (no results) | MISSING | Generic "No jobs" with no branded empty state |
| Error (API fail) | MISSING | No error card; spinner persists |
| Success | N/A | — |
| Fallback | MISSING | No offline handling |
| Mobile | PASS | Cards stack correctly |
| Reduced motion | PASS | Card hover motion-safe |
| Haptic | N/A | — |
| A11y | PARTIAL | No `role="status"` for filter result count updates |
| Perf | RISK | GIF camera.gif still used as spinner |
| Type scale | DEVIATION | "LOADING" text uses default body font, no token |
| **Priority** | P2 | |
| **Changed now** | NO | Skeleton wiring deferred — safe improvement but requires template change |

### 1.2 Job Search / Filter
| Check | Status | Finding |
|---|---|---|
| Loading (filter apply) | MISSING | No loading state during filter; instant or hanging |
| Zero results | MISSING | No branded zero-results state |
| A11y | MISSING | No live region for result count |
| **Priority** | P2 | |

### 1.3 Job Detail Page
| Check | Status | Finding |
|---|---|---|
| Loading | PARTIAL | Spinner; no skeleton |
| Error | PARTIAL | Angular default; no branded error card |
| Expired job | MISSING | No "Job no longer available" state |
| Fallback | MISSING | — |
| **Priority** | P2 | |

### 1.4 Public Company Page
| Check | Status | Finding |
|---|---|---|
| Loading | PARTIAL | Spinner only |
| Not found | MISSING | — |
| Not setup | MISSING | — |
| **Priority** | P3 | |

### 1.5 404 Page
| Check | Status | Finding |
|---|---|---|
| Exists | UNKNOWN | Requires router audit |
| Branded | UNKNOWN | — |
| **Priority** | P2 — verify in router |

---

## 2. Applicant Module

### 2.1 Applicant Dashboard
| Check | Status | Finding |
|---|---|---|
| Loading | PARTIAL | Profile readiness panel has loader; banner has skeleton |
| Error | PARTIAL | No page-level error fallback |
| Empty (no data) | PARTIAL | `app-empty-section` component exists and is used |
| Success | PRESENT | Stat animations exist |
| Mobile | PARTIAL | Scroll issues on some panels (see NOTIFY audit) |
| Reduced motion | PASS | Global guard active |
| **Priority** | P2 | |

### 2.2 Profile — Basic Info, Work Experience, Education, Skills
| Check | Status | Finding |
|---|---|---|
| Loading | PARTIAL | Spinner; no skeleton matching form layout |
| Empty | PARTIAL | Some sections have empty state; inconsistent |
| Error | MISSING | Form save errors use snackbar only; no inline error card |
| Success | PARTIAL | Snackbar only; no inline confirmation |
| Type scale | DEVIATION | Label font 14px/500 (matches spec); input 14px; helper text varies |
| **Priority** | P2 | |

### 2.3 CV / Documents
| Check | Status | Finding |
|---|---|---|
| Loading (upload) | PARTIAL | GIF + "Uploading" text; no progress bar |
| Error (upload fail) | PARTIAL | Snackbar error; no inline retry |
| Empty (no CV) | PRESENT | `app-empty-section` used |
| Success | PARTIAL | Snackbar only |
| **Priority** | P2 | |

### 2.4 CV Doctor / CV Health
| Check | Status | Finding |
|---|---|---|
| Loading (scan) | PARTIAL | Spinner; no step indicator |
| Error (scan fail) | PARTIAL | Generic error snackbar |
| Success (score reveal) | PARTIAL | Score shown; no ring animation |
| Step progress | MISSING | No step indicator during analysis |
| **Priority** | P1 — CV Doctor is a key feature | |

### 2.5 Applications List
| Check | Status | Finding |
|---|---|---|
| Loading | PARTIAL | Spinner |
| Empty | PRESENT | `app-empty-section` |
| Error | MISSING | — |
| **Priority** | P3 | |

### 2.6 Application Submit (Flow)
| Check | Status | Finding |
|---|---|---|
| Loading (submit) | PARTIAL | Button spinner; Back not disabled during submit (SEE BRAND-FIX-2 — now fixed) |
| Success | PRESENT | Success screen exists |
| Error | PARTIAL | Snackbar only |
| **Priority** | P1 (fix already in codebase from V4) | |

### 2.7 Video CV
| Check | Status | Finding |
|---|---|---|
| Empty | PRESENT | Empty state exists |
| Loading (record/upload) | PARTIAL | Spinner |
| Error | PARTIAL | Generic |
| **Priority** | P3 | |

---

## 3. Employer / Recruiter Module

### 3.1 Employer Dashboard (V5 — cba5120) — PRESENT
All states fully audited in `GETHIRED_BRAND_DASHBOARD_REPORT.md`. Summary:
- Hero: PRESENT (skeleton + reveal animation)
- Action Center: PRESENT (loading/error/empty/success)
- KPI Strip: PARTIAL (loading partial — needs-review card only)
- Pipeline: PRESENT (skeleton/error/empty/success)
- Job Performance: PRESENT (loading/error/empty/success)
- Employer Branding Health: PRESENT (loading via global dashboard$ / success / complete / incomplete)
- Subscription/Plan Health: PRESENT (real plan badge + usage meters)
- **Do not re-audit dashboard states as new. Mark as PRESENT.**
- **Priority:** Maintenance only.

### 3.2 Company Setup / Profile Editor
| Check | Status | Finding |
|---|---|---|
| Loading | PARTIAL | Spinner |
| Empty | PARTIAL | — |
| Success (save) | PARTIAL | Snackbar only |
| Logo/banner upload | PARTIAL | No upload progress |
| **Priority** | P2 | |

### 3.3 Job Create / Edit
| Check | Status | Finding |
|---|---|---|
| Loading | PARTIAL | Spinner |
| Error (save) | PARTIAL | Snackbar only |
| Publish success | PARTIAL | Snackbar only; no "Job is live!" panel |
| **Priority** | P2 | |

### 3.4 Applicant Review / Job Applicants
| Check | Status | Finding |
|---|---|---|
| Loading | PARTIAL | Spinner |
| Empty | PRESENT | `app-empty-section` used |
| Status update loading | PRESENT (BRAND-FIX-2 + BRAND-FIX-3 applied) | V4 fixes live |
| **Priority** | P3 | |

### 3.5 Contacts / Candidates / Groups
| Check | Status | Finding |
|---|---|---|
| Loading | PARTIAL | Spinner |
| Empty | PARTIAL | Some sections |
| Error | MISSING | — |
| **Priority** | P3 | |

### 3.6 Messages / Interviews
| Check | Status | Finding |
|---|---|---|
| Loading | PARTIAL | — |
| Empty | PARTIAL | — |
| Error | MISSING | — |
| **Priority** | P3 | |

### 3.7 Subscription / Billing
| Check | Status | Finding |
|---|---|---|
| Plan health | PRESENT (dashboard section) | — |
| Billing page loading | UNKNOWN | Requires direct audit |
| Payment issue state | PARTIAL | Dashboard banner |
| **Priority** | P2 | |

---

## 4. Admin Module

### 4.1 Admin Dashboard
| Check | Status | Finding |
|---|---|---|
| Loading | PARTIAL | Spinner |
| Empty | MISSING | — |
| **Priority** | P3 | |

### 4.2 Admin Users
| Check | Status | Finding |
|---|---|---|
| Loading | PARTIAL | Table spinner |
| Empty | MISSING | — |
| **Priority** | P3 | |

---

## Type Scale Deviations (Flagged as Backlog)

| Location | Current | Spec | Severity |
|---|---|---|---|
| Global `label` in styles.scss | 14px/500 | 13px/600 | Low — close enough; don't touch |
| `.form-control` in styles.scss | 14px | 14px | PASS |
| Global `body` | 14px/Manrope | 14px/Manrope | PASS |
| Sidebar nav label (`.gh-sidebar-label`) | 13.5px/500 | 14px/500–600 | Low deviation — flag as backlog |
| KPI numbers | variable | 32px/700 | AUDIT NEEDED |
| Page titles (various) | varies | 28px/36px/700 | BACKLOG |
| Section titles | varies | 20px/28px/700 | BACKLOG |

Count: **4 type-scale deviations flagged as backlog items.** Not safe to fix inline (requires component-level SCSS changes that could affect layout).

---

## Classification Key

| Rating | Meaning |
|---|---|
| Safe-now | Implemented or safe to implement this pass |
| Defer | Known gap; safe to defer; add to BACKLOG |
| Do-not-do | Requires product/design approval |
| Needs-design-approval | Visual change beyond brand system |
| Needs-performance-check | May affect CWV/bundle |
| Needs-accessibility-check | Requires manual/SR testing |
| Needs-product-approval | Functional behaviour change |
