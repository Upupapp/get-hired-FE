# GetHired MOBILEVIEW Audit — V4 (Recent Deployment, 4 commits)

Audit date: 2026-06-26
Scope: 7 files across 4 commits (d3246b6, 70bc592, 172b2a9, f9bc996)
Auditor: Claude Code MOBILEVIEW pass (automated static analysis)

---

## 1. Touch Target Inventory (iOS guideline: 44 x 44 px minimum)

| Element | Where | Measured / Set | Result | Notes |
|---|---|---|---|---|
| `.portal-preview-tab` | main-portal.scss L592 | `min-height: 44px` | PASS | V3 had 38px; fixed in commit 70bc592 — CONFIRMED |
| `.btn-cta-outline` hero | main-portal.scss L161 | `min-height: 44px` | PASS | Added in commit 172b2a9 — CONFIRMED |
| `.btn-cta-primary` hero / journey / panels | portal-common.scss L173 | `min-height: 44px; padding: 12px 24px` | PASS | Correct |
| `.btn-link-cta` ("Browse jobs", "Sign in") | portal-common.scss L55 | `min-height: 44px; padding: 12px 8px` | PASS | MV5-B3 fix was already in |
| Status picker buttons (`.status-options .btn`) | modal HTML L32, Bootstrap `btn-sm` | Bootstrap `btn-sm` renders ~30 px | FAIL (pre-fix) | Fixed in this pass — see Section 6 |
| Back button in status picker (`.btn-sm.btn-link`) | modal HTML L21 | Bootstrap `btn-sm btn-link` ~30 px | FAIL (pre-fix) | Fixed in this pass — see Section 6 |
| Close icon (`img` 13 px) | modal HTML L3-4 | 13 px image, no padding | FAIL (pre-fix) | Fixed in this pass — see Section 6 |
| Action menu tiles (`.side-sub-menu-container`) | modal HTML L41-46 | `p-3` Bootstrap = 16 px vertical padding + text = ~50 px | PASS | Adequate |

---

## 2. :active State Inventory (press feedback for touch users)

| Element | :active present? | Source | Notes |
|---|---|---|---|
| `.portal-preview-tab` | YES | main-portal.scss: `&:active { transform: scale(0.96) }` | CONFIRMED — added commit 70bc592 |
| `.btn-cta-primary` hero / journey buttons | YES | `gh-pressable` class → `_motion.scss L59: &:active { transform: scale(0.985) }` | PASS via utility class |
| `.btn-cta-outline` hero | NO (pre-fix) | Was present on hover/focus only | FAIL — Fixed in this pass; added `&:active { background: rgba(255,112,98,0.15); transform: scale(0.97) }` |
| Status picker `.btn` buttons | NO (pre-fix) | Bootstrap provides no `:active` transform | FAIL — Fixed in this pass |
| Back button in status picker | NO (pre-fix) | Bootstrap link style only | FAIL — Fixed in this pass |
| Action menu tiles | NO explicit | Relies on hover only (CSS class `hvr-underline-from-center`) | LOW — not critical; `hvr` hover states don't fire on touch; acceptable risk for an employer-only flow |

---

## 3. Responsive Layout Assessment

### Breakpoints used (all desktop-first max-width, standard for Bootstrap projects)
- 991px: hero split-grid → single column; CTA group center-justified; proof chips centered
- 767px: portal-preview-panel 2-col → 1-col; portal-product-preview-inner padding reduces; employer band padding reduces
- 575px: hero buttons full-width stacked (`flex-direction: column; align-items: stretch`); trust grid → 1 column; hero font-size reduces to 24px; usp-bridge image hidden; portal-hero padding tightens; journey CTA full-width stacked

### 5-tab product preview tablist
PASS — uses `flex-wrap: wrap; justify-content: center`. On narrow viewports the tabs wrap to multiple rows. This is correct; the alternative (horizontal scroll) would require `overflow-x: auto` which would hide off-screen tabs. Wrap is the right choice here.

### Hero CTA buttons on mobile (<575px)
PASS — `portal-hero-cta-group` switches to `flex-direction: column; align-items: stretch` at 575px, making both "Find jobs" and "Start hiring" full-width. Min-height 44px confirmed on both.

### Trust & Safety 4-card grid
PASS — `.portal-trust-grid`: 4-col at desktop → 2-col at 991px → 1-col at 575px. Correct progressive stacking.

### USP pillar icons
PASS — `.portal-usp-bridge` image hides at `display: none` below 575px to avoid overflow. USP icons are 48x48px fixed, do not overflow at narrow widths. USP grid stacks 4→2→1.

### Portal role grid (seeker/employer cards)
PASS — 2-col at desktop → 1-col at `max-width: 767px`.

### Journey sections
PASS — `portal-journey-steps` uses `repeat(auto-fit, minmax(180px, 1fr))` which collapses naturally on narrow viewports. Journey CTA switches to `flex-direction: column; align-items: stretch` at 575px.

---

## 4. Keyboard Navigation Verification

### Arrow key roving tabindex pattern
PASS — `onTabKeydown` in main-portal.component.ts (L117-137) handles ArrowRight, ArrowLeft, Home, End. Calls `setPreviewTab(nextTab)` and then `btn.focus()` on the target button via `querySelector('#tab-${nextTab}')`.

### Roving tabindex in template
PASS — Each tab button uses `[attr.tabindex]="activePreviewTab === '<id>' ? 0 : -1"`. Only the active tab is in the natural tab order; all others are -1. This is the correct ARIA tablist pattern.

### Tab IDs
PASS — All 5 tabs have explicit IDs: `id="tab-seeker"`, `id="tab-employer"`, `id="tab-tracking"`, `id="tab-video"`, `id="tab-signals"`. `aria-controls` points to `panel-<id>`. The panel uses `[id]="'panel-' + activePreviewTab"` and `role="tabpanel"` — correct.

### `tablistRef` focus management
PASS — `@ViewChild('tablistRef') tablistRef` is referenced in the template `#tablistRef` attribute on the `[role="tablist"]` container. Arrow key handler uses `tablistRef.nativeElement.querySelector(...)`.

---

## 5. Angular Material Modal — Mobile Experience

### Dialog width configuration
ISSUE — `viewMenu()` in job-applicants.component.ts (L247) opens the dialog with `width: '34vw'`. On mobile viewports (e.g. 375px screen), 34vw = ~128px — far too narrow to render the modal content usably. The dialog has no `maxWidth` or responsive override.

The modal SCSS does have a `@media (max-width: 768px)` block on `.dialog-responsive .mat-dialog-container` that sets `width: 100%`, but `panelClass: 'dialog-responsive'` is NOT passed in the `dialog.open()` call. The class is defined but never applied.

**Recommendation (not applied — requires TS change):** Add `panelClass: 'dialog-responsive'` to the `dialog.open()` options object, OR change `width: '34vw'` to `width: 'min(560px, 95vw)'` directly. This is a logic change (out of safe-fix scope) but is the highest-priority mobile usability issue in this audit.

### Status picker tap targets in the modal (post-fix)
After the SCSS fixes applied in this pass, status picker buttons will have `min-height: 44px` and `:active` feedback. RESOLVED pending the dialog width fix above — if the dialog is too narrow, even 44px-tall buttons are hard to target.

---

## 6. Fixes Applied in This Pass

### Fix MV4-B1 — `.btn-cta-outline` missing `:active` press state
**File:** `src/app/public/main-portal/main-portal.component.scss`
Added:
```scss
&:active {
  background: rgba(255, 112, 98, 0.15);
  transform: scale(0.97);
}
@media (prefers-reduced-motion: reduce) {
  &:active { transform: none; }
}
```

### Fix MV4-B2 — `touch-action: manipulation` on `.btn-cta-outline`
**File:** `src/app/public/main-portal/main-portal.component.scss`
Added `touch-action: manipulation` to `.btn-cta-outline`. Prevents 300ms iOS double-tap delay.

### Fix MV4-B3 — `touch-action: manipulation` on `.portal-preview-tab`
**File:** `src/app/public/main-portal/main-portal.component.scss`
Added `touch-action: manipulation` inline in the existing rule. The `:active` transform was already present from commit 70bc592.

### Fix MV4-S1 — Status picker buttons below 44px touch target
**File:** `src/app/job/job-applicants/applicant-action-modal/applicant-action-modal.component.scss`
Added scoped rule:
```scss
.status-options .btn {
  min-height: 44px;
  touch-action: manipulation;
  &:active { opacity: 0.75; transform: scale(0.98); }
}
```

### Fix MV4-S2 — Back button below 44px touch target
**File:** `src/app/job/job-applicants/applicant-action-modal/applicant-action-modal.component.scss`
Added scoped rule:
```scss
.status-picker-view .btn-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  touch-action: manipulation;
  &:active { opacity: 0.65; }
}
```

### Fix MV4-S3 — Close icon 13px hit area too small
**File:** `src/app/job/job-applicants/applicant-action-modal/applicant-action-modal.component.scss`
Added negative-margin padding trick to expand the clickable area without moving the visual:
```scss
.side-sub-menu > .close img {
  padding: 16px;
  margin: -16px;
  touch-action: manipulation;
}
```

---

## 7. Remaining Recommendations (Not Applied — Outside Safe-Fix Scope)

| ID | Issue | Severity | Location | Action Needed |
|---|---|---|---|---|
| MV4-R1 | `dialog.open()` uses `width: '34vw'` without `panelClass: 'dialog-responsive'`; modal is unusably narrow on phones | HIGH | job-applicants.component.ts L248-255 | Add `panelClass: 'dialog-responsive'` to dialog.open() options, or change width to `'min(560px, 95vw)'` |
| MV4-R2 | `.side-sub-menu-container` action tiles have hover-only feedback (CSS hover lib); no `:active` for touch | LOW | applicant-action-modal.scss L13-23 | Add `&:active { opacity: 0.85; }` inside `.side-sub-menu-container` |
| MV4-R3 | `portal-preview-tabs` wraps to multiple rows when >3 tabs fit; on very narrow screens (320px) labels like "Compatibility signals" may cause 3-row wrapping and push content below fold | LOW | main-portal HTML L180-212 | Consider abbreviating long tab labels on mobile via a separate display class or `aria-label` with short label visible text |

---

## 8. V3 vs V4 Comparison

| Item | V3 Status | V4 Status |
|---|---|---|
| `.portal-preview-tab` min-height | 38px — FAIL | 44px — PASS (commit 70bc592 confirmed) |
| `.portal-preview-tab :active` | Missing — FAIL | `transform: scale(0.96)` — PASS (commit 70bc592 confirmed) |
| `.btn-cta-outline` min-height | Missing (relied on padding) — FAIL | `min-height: 44px` — PASS (commit 172b2a9 confirmed) |
| `.btn-cta-outline :active` | Missing — FAIL | Added in this V4 pass — PASS |
| `.btn-cta-outline touch-action` | Missing — NOTE | Added in this V4 pass — PASS |
| `.portal-preview-tab touch-action` | Missing — NOTE | Added in this V4 pass — PASS |
| Status picker button touch targets | Not audited in V3 | 30px (Bootstrap btn-sm) — FIXED in this pass |
| Back button touch target | Not audited in V3 | 30px — FIXED in this pass |
| Close icon hit area | Not audited in V3 | 13px — FIXED in this pass |
| Dialog mobile width | Not audited in V3 | 34vw (too narrow); panelClass not applied — OPEN (MV4-R1) |
| Keyboard roving tabindex | Not audited in V3 | Fully correct — PASS |
| Hero CTA stacking on mobile | Not audited in V3 | Full-width stacked at 575px — PASS |
| Trust grid stacking | Not audited in V3 | 4→2→1 column progression — PASS |

---

## 9. Release Gate

**GO WITH CAUTION**

All V3 regressions confirmed fixed. New SCSS fixes applied in this pass (MV4-B1/B2/B3, MV4-S1/S2/S3) are safe, scoped, and non-breaking. One HIGH finding (MV4-R1: dialog too narrow on mobile phones) remains open and must be addressed before the applicant action flow is considered mobile-ready. The main portal (public-facing) is GO for mobile release. The employer-side action modal is CAUTION until MV4-R1 is resolved.

**Recommended follow-up (one TS line):**
In `job-applicants.component.ts` L247-255, change:
```ts
let openDialog = this.dialog.open(
  ApplicantActionModalComponent,
  {
    width: '34vw',
    ...
  }
);
```
to:
```ts
let openDialog = this.dialog.open(
  ApplicantActionModalComponent,
  {
    width: 'min(560px, 95vw)',
    panelClass: 'dialog-responsive',
    ...
  }
);
```
This is a one-line fix that makes the existing `.dialog-responsive` CSS take effect on mobile.
