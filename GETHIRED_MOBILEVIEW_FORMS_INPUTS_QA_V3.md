# GETHIRED MOBILEVIEW — Forms & Inputs QA V3
Generated: 2026-06-26

---

## Global Form Rules (styles.scss @media max-width: 767px)

| Element | Rule | Status |
|---------|------|--------|
| .form-control | min-height: 44px | PASS (BL-001) |
| .mat-form-field-infix input | min-height: 44px | PASS (BL-001) |
| .mat-select-trigger | min-height: 44px | PASS (BL-001) |
| label | display:flex, align-items:center | PASS (global) |
| .mat-option | min-height: 48px | PASS (BL-009) |
| .dropdown-item | padding-top/bottom: 12px | PASS (BL-009) |

---

## Signin Form (/signin)

**signin.component.scss:**
- .bg-form: padding 80px 120px → 80px 40px at 899-1360px → 80px 20px at 759px
- .gh-signin-form-col: min-height:100vh, max-width:100%, overflow-x:hidden
- Safe-area padding at 575px: padding-bottom: env(safe-area-inset-bottom, 16px) — PASS
- Input: background #FEFEFE, padding-top/bottom:15px — height ≈ 15+14+15 = 44px — PASS
- .btn-submit: padding:13px 10px + line-height:27px → height ≈ 53px — PASS
- .btn-social: padding:13px 11px — height ≈ 41px — BORDERLINE (40px at 14px font size)
- Carousel panel: hidden via d-none d-lg-block (BL-012 CONFIRMED)
- .carousel-item: @include motion-safe (reduced-motion)
- Form card reveal: gh-trust-reveal animation, @include motion-safe

---

## Signup Form (/signup)

- Not audited separately in V3 — assumed similar pattern to signin
- Deferred to V4

---

## Job Create Form (/recruiter/jobs/create)

**job-create.component.scss:**
- BL-005: sticky controls bar at 767px (bg-upper-gray sticky top:0)
- adjust-flex: position:static at 767px (buttons don't escape card)
- Action buttons: min-height:44px at 768px (btn-draft-save, btn-back-cancel, btn-publish-post)
- Multi-step buttons wrap at 767px with gap:8px
- Focus rings on action buttons: 2px red + 4px rgba shadow
- .btn-save-draft: padding:7px 20px, no explicit min-height (covered by global 44px at 767px)

---

## Profile Forms (/user/profile)

**profile-forms.component.scss:**
- BL-008: .submit-container fixed bottom:80px at 767px — PASS
- .btn-save, .btn-save-draft: min-height:44px, flex:1 at 767px — PASS
- .bg-upper-gray: sticky top:0 at 767px
- Form controls get global min-height:44px at 767px

---

## Employer Settings Forms

- Not individually audited
- Form controls get global 44px min-height
- Deferred to V4

---

## Applicant Settings

- Not individually audited
- Deferred to V4

---

## Material Date Picker / Select

- .mat-option: min-height: 48px at 767px (BL-009) — PASS
- .mat-select-trigger: min-height: 44px at 767px (BL-001) — PASS
- Date picker modal: becomes bottom-sheet at 767px (BL-010) — PASS

---

## Issues Found

| ID | Form | Issue | Severity | Status |
|----|------|-------|----------|--------|
| FORM-01 | Signin | .btn-social ≈41px, borderline (no min-height) | Low | Deferred V4 |
| FORM-02 | Signup | Not audited | Low | Deferred V4 |
| FORM-03 | Employer settings | Not audited | Low | Deferred V4 |
