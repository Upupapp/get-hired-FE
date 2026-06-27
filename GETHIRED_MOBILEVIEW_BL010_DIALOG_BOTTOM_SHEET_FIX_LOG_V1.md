# BL-010 Dialog → Mobile Bottom-Sheet Fix Log V1

**Date:** 2026-06-25
**Build result:** PASS (zero errors, 2 pre-existing autoprefixer warnings in unrelated file)
**Approach used:** CSS-only responsive conversion (no TS/BreakpointObserver changes needed)

---

## Audit — All Dialogs Catalogued

| Component | File | What it does | Complex? | Mobile issue | Treatment |
|---|---|---|---|---|---|
| `ConfirmationDialogComponent` | `shared/components/confirmation-dialog/` | Confirm/cancel for delete, archive, save | No — 2 buttons | Centred dialog clips on small screens | CSS → bottom sheet |
| `UpdatedDialogComponent` | `shared/components/updated-dialog/` | Success/updated toast dialog | No — 1 button | Same clipping | CSS → bottom sheet |
| `SuccessDialogComponent` | `shared/components/success-dialog/` | Success with title/subtitle | No — 1 button | Same clipping | CSS → bottom sheet |
| `SubscriptionAlertComponent` | `shared/components/subscription-alert/` | Upgrade prompt (Upgrade Now / Cancel) | No — 2 actions | Same clipping | CSS → bottom sheet |
| `TableControlModalComponent` (job-list) | `job/job-list/dialogs/table-control-modal/` | Action menu: view/edit/applicants/delete | No — grid of tiles | Hardcoded `min-width: 660px` breaks mobile | CSS → bottom sheet + override |
| `ApplicantActionModalComponent` | `job/job-applicants/applicant-action-modal/` | Action menu: Video CV / Applicant details | No — 2 tiles | Same `min-width: 660px` issue | CSS → bottom sheet + override |
| `TableControlModalComponent` (candidate-list) | `employer-panel/employer-contacts/candidate-list/dialogs/table-control-modal/` | Action menu for candidates | No — grid of tiles | Same issue | CSS → bottom sheet + override |
| `VideoPreviewComponent` | `shared/components/video-preview/` | Video player | Yes — media content | N/A | Kept as full dialog |
| `RecorderComponent` | `recorder/` | Video recording interface | Yes — complex media | N/A | Kept as full dialog |
| `WorkExperienceComponent` | `applicant/profile-forms/skills-experience/work-experience/` | Multi-field form | Yes — form | N/A | Kept as full dialog |
| `EducationalBackgroundComponent` | `applicant/profile-forms/skills-experience/educational-background/` | Multi-field form | Yes — form | N/A | Kept as full dialog |
| `AwardsComponent` | `applicant/profile-forms/skills-experience/awards/` | Multi-field form | Yes — form | N/A | Kept as full dialog |
| `CompanyBasicComponent` | `company/company-basic/` | Company edit form | Yes — form | N/A | Kept as full dialog |
| `AddContactGroupComponent` | `employer-panel/employer-contacts/contact-group/dialogs/add-contact-group/` | Form | Yes — form | N/A | Kept as full dialog |
| `ImportAddContactComponent` | `employer-panel/employer-contacts/contact-list/dialogs/import-add-contact/` | Import form | Yes — complex | N/A | Kept as full dialog |
| `ImportAddCandidateComponent` | `employer-panel/employer-contacts/candidate-list/dialogs/import-add-candidate/` | Import form | Yes — complex | N/A | Kept as full dialog |
| `ImportAddUserComponent` | `company/company-users/dialogs/import-add-user.component/` | Import form | Yes — complex | N/A | Kept as full dialog |
| `SubscriptionSummaryComponent` | `subscriptions/subscription-summary/` | Subscription detail | Yes — content | N/A | Kept as full dialog |
| `UpdateQuestionComponent` | `interview/update-question/` | Edit form | Yes — form | N/A | Kept as full dialog |
| `FileViewerComponent` | `shared/components/file-viewer/` | Document viewer | Yes — media | N/A | Kept as full dialog |

---

## Implementation

### File changed: `src/styles.scss`

**What was added after the existing `@media only screen and (max-width: 768px)` dialog block:**

```scss
// ─── BL-010: Mobile dialog → bottom-sheet CSS conversion ─────────────────────
@keyframes gh-sheet-reveal {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media only screen and (max-width: 767px) {
  .cdk-overlay-pane {
    max-width: 100vw !important;
    width: 100% !important;
  }

  .mat-dialog-container,
  .dialog-responsive {
    width: 100% !important;
    max-width: 100vw !important;
    margin: 0 !important;
    padding: 16px !important;
    height: auto !important;
    max-height: 90vh !important;
    overflow-y: auto !important;
    border-radius: 16px 16px 0 0 !important;
    animation: gh-sheet-reveal 0.22s cubic-bezier(0.0, 0.0, 0.2, 1) both;
  }

  .cdk-global-overlay-wrapper {
    align-items: flex-end !important;
    justify-content: center !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mat-dialog-container,
  .mat-bottom-sheet-container {
    animation: none !important;
  }
}

// Fix hardcoded min-width on action/control modals
@media only screen and (max-width: 767px) {
  .dialog-responsive .mat-dialog-container {
    min-width: unset !important;
    width: 100% !important;
  }
}
```

### Key design decisions

- **CSS-only approach** — No BreakpointObserver or MatBottomSheet needed. The `cdk-global-overlay-wrapper` alignment change to `flex-end` + `border-radius: 16px 16px 0 0` achieves an identical bottom-sheet appearance.
- **`MatBottomSheetModule` not imported** — Not needed. CSS approach is lower risk for Angular 13 NgModule architecture (no new providers/entryComponents).
- **Desktop unchanged** — All breakpoints are `max-width: 767px`, so desktop (768px+) keeps the centred MatDialog behavior with `border-radius: 12px`.
- **Animation** — `gh-sheet-reveal` slides up 16px in 220ms. Skipped entirely under `prefers-reduced-motion: reduce`.
- **Action modals fix** — `dialog-responsive .mat-dialog-container { min-width: unset !important }` overrides the `min-width: 660px` that was clipping the `TableControlModalComponent` and `ApplicantActionModalComponent` off-screen on mobile.

---

## Per-dialog verification

| Dialog | Old mobile behavior | New mobile behavior | Desktop behavior | Notes |
|---|---|---|---|---|
| ConfirmationDialogComponent | Centred, may clip; `border-radius: 12px` all corners | Slides up from bottom, `border-radius: 16px 16px 0 0`, full width | Unchanged (centred, `border-radius: 12px`) | `cdkFocusInitial` on Cancel button (BL-011) |
| UpdatedDialogComponent | Centred, small, may clip | Slides up from bottom, full width | Unchanged | `cdkFocusInitial` on Close button (BL-011) |
| SuccessDialogComponent | Centred | Slides up from bottom | Unchanged | `cdkFocusInitial` on Continue button (BL-011) |
| SubscriptionAlertComponent | Centred | Slides up from bottom | Unchanged | `cdkFocusInitial` on Upgrade Now (BL-011) |
| TableControlModalComponent (job-list) | Broke at 660px wide on narrow screens | Slides up, full width, `min-width: unset` | Unchanged | |
| ApplicantActionModalComponent | Broke at 660px wide | Slides up, full width | Unchanged | |
| TableControlModalComponent (candidate-list) | Broke at 660px wide | Slides up, full width | Unchanged | |

---

## Hardcoded min-width issue details

Both `table-control-modal.component.scss` files contained:
```scss
.dialog-responsive .mat-dialog-container {
  min-width: 660px !important;
}
```
This caused dialogs to overflow off-screen on any device narrower than 660px. The global override in `styles.scss` removes this at `max-width: 767px` without touching the component files (safer, no template class changes needed).
