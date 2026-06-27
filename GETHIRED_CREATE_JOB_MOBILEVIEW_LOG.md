# GETHIRED CREATE JOB — MOBILEVIEW LOG
**Scope:** `/recruiter/jobs/create`
**Date:** 2026-06-26

---

## Existing Mobile Support (already in place)

| Feature | File | Status |
|---|---|---|
| Controls bar sticky on mobile (`position: sticky !important`) | `job-create.component.scss:321` | ✅ MOBILEVIEW Pass 2 BL-005 |
| `min-height: 44px` on Publish/Draft/Cancel buttons at ≤768px | `job-create.component.scss:311` | ✅ Already fixed |
| `.adjust-flex { position: static }` on mobile — button row unclipped | same | ✅ |
| `prefers-reduced-motion` on spinners and press effects | same | ✅ |
| `focus-visible` outline on action buttons | same | ✅ |
| `col-12` / `col-md-X` responsive grid on Step 1 fields | `job-post-detail-step.component.html` | ✅ Collapses cleanly |
| Step 1-4 Prev/Next labels: narrow screen shows caret icon instead of text | `job-create.component.html:154-157` | ✅ |

---

## Applied Fix (this session)

### MOB-01 — SubscriptionAlert Dialog Width
Changed `width: '34vw'` → `width: 'min(560px, 95vw)'` on `SubscriptionAlertComponent` dialog.
**Why:** `34vw` = ~136px on a 400px phone — dialog was completely unusable on mobile.

---

## Open Mobile Issues

| ID | Issue | Severity | Recommendation |
|---|---|---|---|
| MOB-01 | Badge `<select multiple>` on mobile — multi-select touch UX is broken on iOS/Android (native select shows multi-select badly) | High | Replace with chip input or checkbox list on mobile |
| MOB-02 | Certification requirement cards (`.cert-requirement-item`) have dense 6-column row at mobile — cols collapse but the row is very tall | Medium | Stack checkbox fields below the inputs at mobile (`col-12` for checkboxes) |
| MOB-03 | Work setup button grid `col-md-4` — on phone each button is `col-12` (full width). Looks fine but 3 full-width buttons take vertical space | Low | `col-6` at small breakpoint to show 2 per row |
| MOB-04 | Banner drag-and-drop uploader (`app-drag-and-drop`) — touch drag events on mobile may not work | Medium | Verify `app-drag-and-drop` falls back to tap-to-upload on touch devices |
| MOB-05 | Stepper (`app-main-stepper`) — 4 items at narrow width; check that all step labels are visible | Low | Verify via device test |
| MOB-06 | Job Readiness Bar — `padding-left: 25px; padding-right: 45px` hardcoded via `[ngStyle]` | Low | Move to responsive SCSS |

---

## Touch Target Audit

| Element | Height | WCAG 2.5.5 (44px) |
|---|---|---|
| Next / Publish button | 44px (via media query) | ✅ |
| Save as Draft button | 44px (via media query) | ✅ |
| Cancel button | 44px (via media query) | ✅ |
| Work setup buttons | ~40px (`padding: 7px 20px` default) | ⚠️ Short by 4px — add `min-height: 44px` |
| Add badge `<option>` | n/a (native select) | N/A |
| "Add" buttons (requirements) | ~34px | ⚠️ Add `min-height: 44px` |
| Remove item `<img>` | 10px | ❌ Replace with button, 44px |

---

## Recommended Fixes (next mobile pass)

1. **Remove `<img>` click targets** in requirements/educationalBackground/goodToHave — replace with `<button type="button" class="btn-remove" aria-label="Remove item">×</button>` and apply `min-height: 44px; min-width: 44px`
2. **Work setup buttons:** add `min-height: 44px` to `.btn-work-setup`
3. **"Add" buttons:** add `min-height: 44px` to `.btn-add-now`
4. **MOB-01:** Replace `<select multiple>` for badges with a chip/checkbox approach on mobile
