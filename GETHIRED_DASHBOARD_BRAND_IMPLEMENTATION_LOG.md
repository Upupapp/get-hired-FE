# GETHIRED DASHBOARD BRAND — Implementation Log

**Pass:** BRAND v5 — Dashboard scope  
**Date:** 2026-06-27  
**Files changed:** 3

---

## TS Changes

### TS-A — Cached subscription usage percentages

**File:** `company-dashboard.component.ts`  
**Location:** After `trendRange` property (line ~148)  
**What:** Added 3 class properties: `cachedJobPostPct = 0`, `cachedAdminPct = 0`, `cachedVideoPct = 0`  
**Why:** Eliminates 9 template function calls per CD cycle (GAP 3). Values are pre-computed in the tap() below.  
**A11y handling:** None required — data properties only.  
**Reduced motion:** Not applicable.  
**Performance impact:** 9 function calls per CD cycle → 0 per CD cycle (1 call at subscription emit time). Approximately 8× fewer calls.  
**Rollback:** Remove 3 property declarations and revert TS-B and HTML-E/F/G.

---

### TS-B — subsRestrictions$ tap extension

**File:** `company-dashboard.component.ts`  
**Location:** `subsRestrictions$` pipe declaration  
**What:** Extended `tap()` callback from `() => {}` (no-op beyond error reset) to `subs => {}` that also caches 3 usage percentages when `subs` is non-null.  
**Why:** Provides computed values for HTML-E/F/G without template function calls.  
**A11y handling:** None required.  
**Reduced motion:** Not applicable.  
**Performance impact:** Computation moved from template to observable callback — runs once per API response instead of per CD cycle.  
**Rollback:** Revert to `tap(() => { this.subsError = false; })`.

---

### TS-C — retryDashboard() method

**File:** `company-dashboard.component.ts`  
**Location:** Before `retrySubscription()` method (~line 373)  
**What:** Added `retryDashboard(): void` that calls `this.companyFacade.getCompanyDashboard()`.  
**Why:** Required by the HTML error panel retry button (HTML-B). Without this, the error panel has no recovery path.  
**A11y handling:** Method is called from a `button` with `type="button"` — keyboard accessible.  
**Reduced motion:** Not applicable.  
**Performance impact:** None — only called on explicit user retry.  
**Rollback:** Remove method and revert HTML-B.

---

## HTML Changes

### HTML-A — ng-container else clause

**File:** `company-dashboard.component.html`  
**Location:** Line 2 (`ng-container *ngIf`)  
**What:** Added `; else ghDashMissing` to `*ngIf="dashboard$ | async as dashboard"`.  
**Why:** Without this, a null `dashboard$` produces a blank white page with no error or recovery (GAP 1).  
**A11y handling:** `#ghDashMissing` template (HTML-B) has `role="alert"`.  
**Reduced motion:** Error panel in `#ghDashMissing` has animation disabled under reduced-motion (SCSS-J).  
**Performance impact:** Negligible — `ng-container` evaluation is standard Angular CD.  
**Rollback:** Remove `; else ghDashMissing` from the `*ngIf` directive.

---

### HTML-B — Error panel template

**File:** `company-dashboard.component.html`  
**Location:** After closing `</ng-container>` (before closing `</div>`)  
**What:** Added `<ng-template #ghDashMissing>` with `.gh-dash-error-panel` containing icon, title, message, retry button.  
**Why:** Provides the visual error state for GAP 1. Without this, `else ghDashMissing` has nothing to render.  
**A11y handling:** `role="alert"` on panel, `type="button"` on retry, keyboard-accessible.  
**Reduced motion:** Panel entrance animation disabled under reduced-motion via SCSS-J.  
**Performance impact:** Template is not rendered unless `dashboard$` is null — zero cost on happy path.  
**Rollback:** Remove the `<ng-template #ghDashMissing>` block and revert HTML-A.

---

### HTML-C — Hero ring binding attr → style

**File:** `company-dashboard.component.html`  
**Location:** `.gh-profile-ring svg circle:last-child` (inside hero section)  
**What:** `[attr.stroke-dashoffset]` → `[style.stroke-dashoffset]`  
**Why:** CSS keyframe animations can animate TO the value specified in the element's inline `style`, but cannot animate TO an `attr`. Required for GAP 2 ring fill animation.  
**A11y handling:** SVG is `aria-hidden="true"` — no ARIA impact.  
**Reduced motion:** Ring animation disabled via SCSS-J.  
**Performance impact:** Negligible — binding mechanism change only.  
**Rollback:** Revert to `[attr.stroke-dashoffset]`.

---

### HTML-D — Profile comp ring binding attr → style

**File:** `company-dashboard.component.html`  
**Location:** `.gh-profile-comp-ring svg circle:last-child` (inside health section)  
**What:** `[attr.stroke-dashoffset]` → `[style.stroke-dashoffset]`  
**Why:** Same as HTML-C.  
**A11y/motion/performance:** Same as HTML-C.  
**Rollback:** Revert to `[attr.stroke-dashoffset]`.

---

### HTML-E — Job slots meter cached values

**File:** `company-dashboard.component.html`  
**Location:** Job slots `gh-sub-meter-track` block  
**What:** Replaced 3 `subscriptionUsagePct(subs.jobPostCount, subs.jobPost)` calls with `cachedJobPostPct`.  
**Why:** GAP 3 — eliminates 3 of 9 template function calls per CD cycle.  
**A11y handling:** `aria-valuenow` still correctly reflects the value (now from cache).  
**Reduced motion:** Not applicable.  
**Performance impact:** 3 function calls per CD cycle → 0.  
**Rollback:** Revert to `subscriptionUsagePct(subs.jobPostCount, subs.jobPost)`.

---

### HTML-F — Admin users meter cached values

**File:** `company-dashboard.component.html`  
**Same pattern as HTML-E.** Targets `cachedAdminPct`.

---

### HTML-G — Video responses meter cached values

**File:** `company-dashboard.component.html`  
**Same pattern as HTML-E.** Targets `cachedVideoPct`.

---

## SCSS Changes

### SCSS-A — New keyframes

**File:** `company-dashboard.component.scss`  
**Location:** After `@keyframes gh-reveal` block  
**What:** Added `@keyframes gh-ring-hero-fill`, `@keyframes gh-ring-comp-fill`, `@keyframes gh-bar-grow`.  
**Why:** Required by SCSS-B/E/F/G/H.  
**Rollback:** Remove 3 keyframe blocks.

### SCSS-B — Ring fill animations

**File:** `company-dashboard.component.scss`  
**Location:** Before `.gh-profile-ring-pct`  
**What:** Added animation rules for both ring SVG `circle:last-child` elements.  
**Why:** GAP 2 — rings previously snapped to value with no animation.  
**Reduced motion:** Disabled via SCSS-J.

### SCSS-C — KPI stagger

**File:** `company-dashboard.component.scss`  
**Location:** Before `.gh-kpi-card`  
**What:** Added `.gh-kpi-strip > *:nth-child(1–8)` stagger delays (30ms steps).  
**Why:** GAP 5 — all 8 KPI cards previously appeared simultaneously.  
**Reduced motion:** Delays reset to `0ms !important` via SCSS-J.

### SCSS-D — Inbox card stagger

**File:** `company-dashboard.component.scss`  
**Location:** Inside `.gh-inbox-cards` block  
**What:** Added `.gh-inbox-card:nth-child(1–4)` stagger delays (50ms steps).  
**Why:** GAP 5 — inbox action cards previously appeared simultaneously.  
**Reduced motion:** Delays reset to `0ms !important` via SCSS-J.

### SCSS-E — Pipeline bar grow

**File:** `company-dashboard.component.scss`  
**Location:** `.gh-pipeline-bar-fill &--active` block  
**What:** Added `animation: gh-bar-grow 600ms $motion-ease-standard both`.  
**Why:** GAP 4 — bars previously appeared at final width with no animation.  
**Reduced motion:** Disabled via SCSS-J.

### SCSS-F — Branding bar grow

**File:** `company-dashboard.component.scss`  
**Location:** `.gh-branding-bar` block  
**What:** Added `animation: gh-bar-grow 700ms $motion-ease-standard both`.  
**Why:** GAP 4.  
**Reduced motion:** Disabled via SCSS-J.

### SCSS-G — Subscription meter grow

**File:** `company-dashboard.component.scss`  
**Location:** `.gh-sub-meter-fill` block  
**What:** Added `animation: gh-bar-grow 650ms $motion-ease-standard both`.  
**Why:** GAP 4.  
**Reduced motion:** Disabled via SCSS-J.

### SCSS-H — Insight bar grow

**File:** `company-dashboard.component.scss`  
**Location:** `.gh-insight-bar` block  
**What:** Added `animation: gh-bar-grow 600ms $motion-ease-standard both`.  
**Why:** GAP 4.  
**Reduced motion:** Disabled via SCSS-J.

### SCSS-I — Error panel styles

**File:** `company-dashboard.component.scss`  
**Location:** After `.gh-error-sm` block  
**What:** Added `.gh-dash-error-panel`, `.gh-dash-error-icon`, `.gh-dash-error-title`, `.gh-dash-error-msg`.  
**Why:** GAP 1 — required to style the new error panel (HTML-B).  
**Reduced motion:** Panel `gh-reveal` entrance disabled via SCSS-J.

### SCSS-J — Reduced motion extended

**File:** `company-dashboard.component.scss`  
**Location:** Appended to existing `@media (prefers-reduced-motion: reduce)` block  
**What:** Added explicit `animation: none !important` for new ring/bar/error-panel selectors; `animation-delay: 0ms !important` for stagger selectors.  
**Why:** New animations must be disabled under reduced motion — the global `animation-duration: 0.001ms` catches most, but `animation: none` is belt-and-suspenders per Atlassian/WCAG best practice.
