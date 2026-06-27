# GetHired NOTIFY Report — Company Settings Page
**Scope:** `/recruiter/company/settings` — Company Details Form + GhFeedbackModalComponent submit lifecycle
**Date:** 2026-06-27
**Analyst:** Claude Code (NOTIFY command)

---

## 1. Executive Summary

### Messaging Quality Scores (1–10)

| Dimension | Score | Notes |
|---|---|---|
| Clarity | 8 | Most messages are plain-English. A few word choices need tightening. |
| Specificity | 7 | Success chips are excellent. Validation modal body is ambiguous about who found the errors. |
| Actionability | 7 | Every state has at least one CTA. Permission state missing next-step guidance. |
| Tone | 9 | Warm, recruiter-appropriate. No blame, no jargon. |
| Safety (no internals exposed) | 9 | No stack traces, IDs, or SQL. requestId shown as "Ref:" only when present — acceptable. |
| Accessibility messaging | 7 | Inline alerts correct. Modal auto-dismiss at 4 s is marginal for screen readers. |

**Overall: 7.8 / 10**

### Top Strengths
1. Modal feedback system covers all meaningful error classes — network, validation, permission, and generic server errors each get tailored copy.
2. Changed-field chips on the success modal give specific, verifiable confirmation — rare and valuable.
3. Submit button states ('Saving…' + spinner + aria-label switch) are well-implemented.
4. BE and FE validation messages are already in sync — same strings used in both layers.
5. `role="alert"` on inline field errors and `cdkFocusInitial` on modal primary CTA are correct patterns.

### Top Gaps
1. **Validation modal body is inaccurate:** 'We found fields that need to be fixed before saving.' — the FE found nothing wrong (FE validation passed). It is the BE that rejected the data. The body reads as if the client-side validator ran. Needs a subtle but important rewrite.
2. **SnackbarService is injected but never used** in the submit lifecycle. Dead import. Either remove it or consciously decide to keep it for future non-modal confirmations.
3. **Permission modal has no next-step guidance** for the recruiter. "What do I do?" is unanswered.
4. **4-second auto-dismiss on success modal** is borderline too fast for screen readers to read the title + body + syncNote + chips. Recommend 5–6 s or make it user-dismissible only.
5. **Logo image has no `(error)` handler** — if the CDN URL 404s, the `<img>` element breaks silently with no UI message.
6. **Three FeedbackState types (`partial`, `conflict`, `session`) are defined but never instantiated** in this component. Icons exist for `partial` and `conflict`/`session`. Dead code creates maintenance confusion.
7. **Inline `companyName` error is a single message** that covers both `required` and any future validators. If a `maxlength` Validator were added later, the same "required" message would be wrong. Low severity now, but worth noting.

### Recommended Fixes (priority order)
1. Rewrite validation modal body (section 5, ID CP-01).
2. Add contact-admin next step to permission modal body (CP-02).
3. Extend auto-dismiss to 5500 ms or remove it (CP-03).
4. Add `(error)` handler to company logo `<img>` (CP-04).
5. Remove `SnackbarService` import or document the intent (CP-05).
6. Add `for` attributes linking `<label>` to form inputs (a11y, CP-06).

---

## 2. Complete Message Inventory

### Modal States

| ID | Location | Role | Current Text | Type | Issue | Improved Text | Severity | Fixed-Now? |
|---|---|---|---|---|---|---|---|---|
| M-S-01 | GhFeedbackModal / success | Title | 'Company profile updated' | success | None — clear, specific | — | — | N/A |
| M-S-02 | GhFeedbackModal / success | Body | 'Your company details are saved and ready for your hiring workspace.' | success | "hiring workspace" is slightly abstract | 'Your company details are saved and live across your hiring workspace.' | Low | No |
| M-S-03 | GhFeedbackModal / success | Sync note | 'Changes synced across your recruiter dashboard and company profile.' | success | Accurate — companyFacade.companyDetails$ drives the topbar and dashboard | — | — | N/A |
| M-S-04 | GhFeedbackModal / success | Primary CTA | 'Continue editing' | success | Works — stays on page. Modal closes, form remains. | — | — | N/A |
| M-S-05 | GhFeedbackModal / success | Secondary CTA | 'Back to dashboard' | success | Navigates to /recruiter/dashboard. No dirty-form guard — but form was marked pristine at this point, so no data loss. | — | — | N/A |
| M-S-06 | GhFeedbackModal / success | Auto-dismiss | 4000 ms | success | 4 s is borderline for screen readers to consume title + body + syncNote + chips | Extend to 5500 ms | Medium | No |
| M-V-01 | GhFeedbackModal / validation | Title | 'Some details need a quick check' | error | Slightly too soft — this is a server rejection, not a gentle suggestion | 'A few fields need correcting' | Low | No |
| M-V-02 | GhFeedbackModal / validation | Body | 'We found fields that need to be fixed before saving.' | error | **Inaccurate:** FE validation passed; it is the BE (server) that found the errors. "We found" implies the client found them. | 'The server flagged some fields — review them below and try saving again.' | **High** | No |
| M-V-03 | GhFeedbackModal / validation | Primary CTA | 'Review fields' | error | Clear | — | — | N/A |
| M-N-01 | GhFeedbackModal / network | Title | 'Connection paused' | error | 'Paused' implies a temporary hold the app chose. A network drop is not a choice. | 'Connection lost' | Medium | No |
| M-N-02 | GhFeedbackModal / network | Body | "We couldn't reach GetHired. Your edits are still on this page." | error | Good — reassures user their work is safe | — | — | N/A |
| M-N-03 | GhFeedbackModal / network | Primary CTA | 'Try again' | error | Clear, retries onSubmit() | — | — | N/A |
| M-N-04 | GhFeedbackModal / network | Secondary CTA | 'Keep editing' | error | Closes modal, user stays on form | — | — | N/A |
| M-P-01 | GhFeedbackModal / permission | Title | "We couldn't update this company profile" | error | Clear | — | — | N/A |
| M-P-02 | GhFeedbackModal / permission | Body | 'This account does not have permission to update these company settings.' | error | Missing next step — recruiter has no idea what to do | 'This account does not have permission to update these company settings. Contact your company admin to request access.' | Medium | No |
| M-P-03 | GhFeedbackModal / permission | Primary CTA | 'Back to company page' | error | After close(), navigates to /recruiter/company/details — correct | — | — | N/A |
| M-E-01 | GhFeedbackModal / error (generic) | Title | "Changes weren't saved" | error | Clear, non-blaming | — | — | N/A |
| M-E-02 | GhFeedbackModal / error (generic) | Body | 'Your edits are still here. Please try again in a moment.' | error | 'edits' vs 'changes' — inconsistent with button copy ('Submit Changes'). Minor. | 'Your changes are still here. Please try again in a moment.' | Low | No |
| M-E-03 | GhFeedbackModal / error (generic) | Primary CTA | 'Try again' | error | Retries onSubmit() — correct | — | — | N/A |
| M-E-04 | GhFeedbackModal / error (generic) | Secondary CTA | 'Keep editing' | error | Closes modal, user stays on form | — | — | N/A |

### States Defined But Never Instantiated in This Component

| State | Icons Present in HTML | Copy Defined | Used in Component | Verdict |
|---|---|---|---|---|
| `partial` | Yes (shares error icon) | No | No | Dead type — remove from FeedbackState union or document |
| `conflict` | Yes (conflict icon) | No | No | Dead type |
| `session` | Yes (shares permission icon) | No | No | Dead type |

### Inline Validation Error Messages

| ID | Location | Role | Current Text | Type | Issue | Improved Text | Severity |
|---|---|---|---|---|---|---|---|
| IV-01 | company-details-form.html line 58 | Inline error (role=alert) | 'Company name is required.' | validation | Correct for required. Does not cover maxlength (no maxlength Validator currently in TS). Duplicate of BE message. | — | Low |
| IV-02 | company-details-form.html line 72 | Inline error (role=alert) | 'Company name is required.' | validation | Duplicate DOM node (appears in two separate ngIf branches — with and without profileImage). Same message, same functionality. Not a user-facing issue, but a maintenance risk. | — | Low |
| IV-03 | company-details-form.html line 154 | Inline error (role=alert) | 'Contact email is required.' | validation | Correct | — | — |
| IV-04 | company-details-form.html line 155 | Inline error (role=alert) | 'Enter a valid email address.' | validation | Correct | — | — |

### Submit Button Copy

| ID | State | Text | aria-label | Severity |
|---|---|---|---|---|
| SB-01 | Default | 'Submit Changes' | 'Submit Changes' | None |
| SB-02 | Saving | 'Saving…' | 'Saving company profile…' | aria-label more specific than visible text — correct pattern |

### Status Indicator (below button)

| ID | State | Text | Notes |
|---|---|---|---|
| SI-01 | Form dirty | 'Unsaved changes' | Appears as a span above the submit button. No role. Non-critical since the button itself is actionable. |
| SI-02 | Form pristine | 'All changes saved' | Shows after a successful save (markAsPristine() called). Clear. |

### Changed-Field Chip Labels (FIELD_LABELS const)

| Key | Label | Notes |
|---|---|---|
| companyName | 'Company name' | Matches HTML label |
| companyEmail | 'Contact email' | HTML label says 'Email' — minor mismatch |
| companyContactNumber | 'Work phone' | HTML label says 'Work Phone' — case mismatch only |
| companyAddress | 'Address' | Matches |
| companyCity | 'City' | Matches |
| companyCountry | 'Country' | Matches |
| companyDetails | 'About' | HTML label uses translation key `COMPANY_DESCRIPTION` — likely renders 'Company Description'. Potential label mismatch. |
| industryId | 'Industry' | Matches (uses translation key, expected to render 'Industry') |
| workSetupId | 'Work setup' | HTML label says 'Work Setup' — case mismatch only |
| numberOfEmployee | 'Team size' | HTML label uses translation key — likely 'Number of Employees'. Label mismatch with chip. |
| companyLogoFile | 'Company logo' | HTML label uses translation key 'COMPANY_LOGO_TEXT' — assumed match |
| shownPublicly | 'Public visibility' | HTML label says 'Publicly Shown' — mismatch |

### SnackbarService Usage

| Location | Called? | Notes |
|---|---|---|
| company-details-form.component.ts | **Injected, never called** | `SnackbarService` is imported and injected in the constructor but no call to `snackbarService.*` appears anywhere in the submit lifecycle (`onSubmit`, `afterSubmit`, `afterError`). Dead dependency. |

### Logo Cache-Bust

| Location | Implemented? | Notes |
|---|---|---|
| company-details-form.component.ts line 136–142 | Yes | Appends `?v=<Date.now()>` to HTTP logo URLs on every `setCompany()` call. |
| Logo load failure | **No UI message** | The `<img [src]="profileImage">` has no `(error)` event binding. If the CDN URL 404s or times out, the image element breaks silently. No alt text is provided either. |

### BE Error Messages (companiesController.js)

| ID | Trigger | Message | Notes |
|---|---|---|---|
| BE-V-01 | companyName empty/whitespace | 'Company name is required.' | Matches FE inline message — consistent |
| BE-V-02 | companyName > 200 chars | 'Company name must be 200 characters or fewer.' | Clear, specific limit |
| BE-V-03 | companyEmail empty/whitespace | 'Contact email is required.' | Matches FE inline message |
| BE-V-04 | companyEmail invalid format | 'Enter a valid email address.' | Matches FE inline message |
| BE-V-05 | companyDetails > 1000 chars | 'About section must be 1000 characters or fewer.' | 'About section' does not match the chip label ('About') nor the likely rendered translation ('Company Description'). Minor. |
| BE-V-06 | numberOfEmployee out of range | 'Enter a valid number of employees (0 – 1,000,000).' | Clear with explicit range |
| BE-PERM-01 | 403 BOLA guard | "You don't have permission to update this company profile." | Clear; FE modal body rephrases this slightly (both acceptable) |
| BE-GEN-01 | Any other throw | "Operation not successful. Please try again." | Generic; never reaches the FE as a user-visible message because the FE modal uses its own copy for status 500 |

### BE Success Feedback (returned in response body, line 226–234)

The BE returns a `feedback` object in the 200 success response. The FE **does not consume** this object — the `afterSubmit('updated')` handler in the FE uses its own hardcoded copy. The BE feedback object is therefore dead data. Both sets of copy are identical, so there is no user-visible discrepancy. However, keeping two copies in sync manually is a maintenance risk.

---

## 3. Notification Taxonomy Applied to This Feature

| Type | Implementation | Status |
|---|---|---|
| **Inline validation** | `role="alert"` divs appear beneath companyName and companyEmail fields when invalid+touched | Correct. Appears on blur or on submit-attempt. |
| **Toast/snackbar** | SnackbarService is injected but **never called** in the submit lifecycle | Dead import. Should be removed unless planned for future use. The modal system fully replaces it. |
| **Modal dialog** | GhFeedbackModalComponent with `role="dialog"` + `aria-labelledby` | Used for all 8 feedback states. Correct blocking pattern for post-submit feedback. |
| **Loading state** | 'Saving…' on button + spinner SVG + aria-busy + aria-label switch | Fully implemented. Button disabled during flight, double-submit guard active. |
| **Empty state** | No explicit empty state for "no company yet" — `setCompany()` only patches the form when `companyId != null`. The skeleton (`cdf-loading-skeleton`) shows while loading. | Gap: if the user has no company record, the form renders but `company.companyId` is falsy, so submit calls `createCompany()` (not `updateCompany()`), opening `UpdatedDialogComponent` with legacy copy. That path is outside this audit's scope but is flagged. |
| **Accessible status** | `role="alert"` on inline errors (correct — announces immediately). Modal uses `role="dialog"` (correct — not `role="alert"`, since it's a persistent blocking dialog). `aria-live="polite"` on the character counter for companyDetails. | Correct taxonomy for each context. |

---

## 4. Message Quality Scoring

Scores: **Clarity / Specificity / Actionability / Tone / Safety** (1–5 each)

### 1. Success modal body + syncNote
- Body: 'Your company details are saved and ready for your hiring workspace.'
- SyncNote: 'Changes synced across your recruiter dashboard and company profile.'

| C | Sp | A | T | Sa | Avg |
|---|---|---|---|---|---|
| 5 | 4 | 4 | 5 | 5 | **4.6** |

Notes: "ready for your hiring workspace" is slightly abstract. SyncNote is excellent — confirms the exact scope of the sync. Actionability is inherent (form stays open, chips confirm what changed).

### 2. Validation modal title + body
- Title: 'Some details need a quick check'
- Body: 'We found fields that need to be fixed before saving.'

| C | Sp | A | T | Sa | Avg |
|---|---|---|---|---|---|
| 4 | 3 | 4 | 5 | 5 | **4.2** |

Notes: Title is soft/vague. Body is **inaccurate** — the FE found nothing; the server rejected. "We found" conflates FE and BE. Specificity drops to 3 because no direct indication this is a server-side rejection.

### 3. Network modal title + body
- Title: 'Connection paused'
- Body: "We couldn't reach GetHired. Your edits are still on this page."

| C | Sp | A | T | Sa | Avg |
|---|---|---|---|---|---|
| 3 | 4 | 4 | 5 | 5 | **4.2** |

Notes: 'Connection paused' scores low on clarity — 'paused' implies a deliberate app action. The body is excellent: specific (names GetHired), reassuring (work preserved). CTA retries the submit.

### 4. Permission modal title + body + CTA
- Title: "We couldn't update this company profile"
- Body: 'This account does not have permission to update these company settings.'
- CTA: 'Back to company page'

| C | Sp | A | T | Sa | Avg |
|---|---|---|---|---|---|
| 5 | 4 | 3 | 5 | 5 | **4.4** |

Notes: Actionability is 3 — recruiter knows the outcome but not what to do next. No escalation path offered. 'Back to company page' is the only option and leads to a read-only view with no remediation hint.

### 5. Generic error modal title + body + CTAs
- Title: "Changes weren't saved"
- Body: 'Your edits are still here. Please try again in a moment.'
- CTAs: 'Try again' / 'Keep editing'

| C | Sp | A | T | Sa | Avg |
|---|---|---|---|---|---|
| 5 | 3 | 5 | 5 | 5 | **4.6** |

Notes: Specificity drops to 3 since 'a moment' gives no real timing. Body uses 'edits' while button uses 'Changes' — minor consistency gap. Both CTAs are actionable and appropriately mapped.

### 6. Inline companyName validation
- 'Company name is required.'

| C | Sp | A | T | Sa | Avg |
|---|---|---|---|---|---|
| 5 | 4 | 4 | 5 | 5 | **4.6** |

Notes: Short and accurate. Implicit action (fill in the field). Consistent with BE equivalent.

### 7. Inline companyEmail validation (required / format)
- 'Contact email is required.' / 'Enter a valid email address.'

| C | Sp | A | T | Sa | Avg |
|---|---|---|---|---|---|
| 5 | 5 | 5 | 5 | 5 | **5.0** |

Notes: Two distinct, correctly-routed messages. "Enter a valid email address." is directive and clear. Full marks.

### 8. Submit button 'Saving…'
- Visible: 'Saving…'
- aria-label: 'Saving company profile…'

| C | Sp | A | T | Sa | Avg |
|---|---|---|---|---|---|
| 5 | 5 | 4 | 5 | 5 | **4.8** |

Notes: The aria-label is more descriptive than the visible text — correct pattern. The visible 'Saving…' is standard and universally understood. Spinner reinforces the message visually.

---

## 5. Copy Issues and Improvements

| ID | Message | Issue Type | Severity | Improved Version |
|---|---|---|---|---|
| CP-01 | Validation modal body: 'We found fields that need to be fixed before saving.' | Inaccuracy — implies FE found the errors; it was the BE | **High** | 'The server flagged some fields — review them below and try saving again.' |
| CP-02 | Permission modal body: no next-step guidance | Incomplete actionability | **Medium** | 'This account does not have permission to update these company settings. Contact your company admin to request access.' |
| CP-03 | Success modal autoDismissMs: 4000 | Accessibility — too fast for screen reader to read title + body + syncNote + chips | **Medium** | Extend to 5500 ms |
| CP-04 | Logo `<img>` — no (error) handler or alt text | Silent failure if CDN 404s | **Medium** | Add `(error)="onLogoError()"` + `alt="Company logo"` |
| CP-05 | SnackbarService injected but never called | Dead code / misleading intent | Low | Remove from constructor injection and import, or add a comment explaining why it is retained |
| CP-06 | Generic error body: 'Your edits are still here.' | Terminology inconsistency — 'edits' vs 'changes' (button says 'Submit Changes') | Low | 'Your changes are still here. Please try again in a moment.' |
| CP-07 | Network modal title: 'Connection paused' | Unclear — implies a deliberate pause, not a failure | Low | 'Connection lost' or 'Unable to connect' |
| CP-08 | Changed-field chip: 'Contact email' vs form label 'Email' | Minor mismatch between chip label and field label | Low | Change chip label to 'Email' or change form label to 'Contact email' (prefer aligning chip to form label for recognition) |
| CP-09 | Changed-field chip: 'Team size' vs likely-rendered label 'Number of Employees' | Mismatch between chip label and form label | Low | Align to one term; 'Team size' is better brand voice — update the form label to match |
| CP-10 | Changed-field chip: 'Public visibility' vs form label 'Publicly Shown' | Mismatch | Low | Both are acceptable; prefer 'Public visibility' — update form label |
| CP-11 | BE validation body in response: 'We found fields that need to be fixed before saving.' | Same inaccuracy as CP-01 — sourced from BE response | High | Same as CP-01: 'The server flagged some fields — review them below and try saving again.' (Note: FE ignores this BE feedback object for copy, but keeping them consistent is good practice) |

### On 'Continue editing' as success primary CTA
'Continue editing' is appropriate here. After a successful save, the form is marked pristine and the modal closes, returning focus to the form. The recruiter stays on the page and can make further changes. This is the expected happy-path action and the CTA accurately describes it.

### On 'Back to dashboard' secondary CTA and dirty-form safety
After a successful save, `companyDetailsForm.markAsPristine()` is called before the modal opens. So if the user clicks 'Back to dashboard', the form is already clean at that moment — no unsaved data is at risk. No dirty-form guard is needed here.

### On syncNote accuracy
'Changes synced across your recruiter dashboard and company profile.' — verified accurate. The component calls `updateLocalStorage()` which updates localStorage immediately, and `companyFacade.companyDetails$` propagates the new data to the topbar/dashboard via NgRx state.

---

## 6. Accessibility Messaging Review

| Check | Implementation | Status |
|---|---|---|
| `role="alert"` on inline validation errors | Present on both `cdf-field-error` divs (companyName, companyEmail) | **PASS** — screen readers will announce the error text when it appears |
| `role="dialog"` + `aria-modal="true"` + `aria-labelledby` on modal | Present at `ghfm-wrap` root | **PASS** |
| `cdkFocusInitial` on primary CTA button | Present on `ghfm-btn--primary` | **PASS** — focus lands on the actionable element when the modal opens |
| Auto-dismiss 4000 ms | 4 s for screen readers to read title + body + syncNote + chips | **MARGINAL** — recommend 5500 ms; consider removing auto-dismiss entirely since a screen reader user may be mid-read when the modal closes |
| Focus return after modal close | `MatDialog` returns focus to the trigger element (the submit button) by default | **PASS** (Angular Material default behavior) |
| Success chips accessibility | Chips are rendered in `div.ghfm-chips > span.ghfm-chip` with a parent `aria-label="Updated fields"` | **PARTIAL** — the `aria-label` on the div is present but `<span>` elements inside are not in a list. Screen readers may not enumerate them. Consider `<ul aria-label="Updated fields"><li>` for better enumeration. |
| Validation field errors in modal | Rendered as `<ul role="list" aria-label="Fields to review"><li role="listitem">` | **PASS** — correct list structure; screen readers will enumerate items |
| Character counter (`aria-live="polite"`) | Present on the companyDetails counter | **PASS** |
| Loading skeleton `aria-busy="true"` + `aria-label` | Present on `cdf-loading-skeleton` div | **PASS** |
| Submit button `aria-busy` | `[attr.aria-busy]="saving"` | **PASS** |
| Form `<label>` `for` attributes | Labels use `<label>` elements but without `for="..."` attributes pointing to input IDs. The inputs have no `id` attributes. | **FAIL** — labels are not programmatically associated with inputs. Screen readers rely on `for`/`id` pairing. This is a structural accessibility gap across the entire form. |

---

## 7. Backend Error Message Review

| Message | Clarity | Field Label Match | Verdict |
|---|---|---|---|
| 'Company name is required.' | Clear | Matches form label ('Company Name' via translation) | **PASS** |
| 'Company name must be 200 characters or fewer.' | Clear, specific limit | Matches | **PASS** |
| 'Contact email is required.' | Clear | Form label is 'Email'; 'Contact email' is slightly more specific | **MINOR MISMATCH** — acceptable |
| 'Enter a valid email address.' | Clear, directive | N/A (format error) | **PASS** |
| 'About section must be 1000 characters or fewer.' | 'About section' does not match: chip label is 'About', form label likely renders as 'Company Description' | **MINOR MISMATCH** — the field is most commonly called 'About' in the UI; recommend 'About must be 1000 characters or fewer.' | **Low** |
| 'Enter a valid number of employees (0 – 1,000,000).' | Clear with range | Form label is 'NUMBER_OF_EMPLOYEES' (likely 'Number of Employees'); chip is 'Team size' | **MINOR MISMATCH** — 'employees' vs 'Team size'. Acceptable as the validation message; the chip label is a display label. |
| "You don't have permission to update this company profile." | Clear | N/A (auth error) | **PASS** |
| 'Authentication required.' (getSpecificCompany, no auth) | Clear | N/A | **PASS** |
| 'Operation not successful. Please try again.' (catch-all) | Vague but safe — correctly generic for unexpected errors | N/A | **PASS** |

---

## 8. Safe Copy Improvements

The following changes are safe to apply immediately. Each is a copy-only change with no logic impact.

### CP-01: Validation modal body (HIGH — apply first)
- **Files:** `company-details-form.component.ts` line 287
- **Old:** `body: 'We found fields that need to be fixed before saving.',`
- **New:** `body: 'The server flagged some fields — review them below and try saving again.',`
- **Why better:** Accurately attributes the rejection to the server (not the FE). Sets correct expectations. Includes explicit next-step ("review them below").

### CP-02: Permission modal body (MEDIUM)
- **Files:** `company-details-form.component.ts` line 325–326
- **Old:** `body: 'This account does not have permission to update these company settings.',`
- **New:** `body: 'This account does not have permission to update these company settings. Contact your company admin to request access.',`
- **Why better:** Adds an actionable next step. Recruiter knows who to contact instead of dead-ending.

### CP-06: Generic error body — 'edits' → 'changes'
- **Files:** `company-details-form.component.ts` line 345
- **Old:** `body: 'Your edits are still here. Please try again in a moment.',`
- **New:** `body: 'Your changes are still here. Please try again in a moment.',`
- **Why better:** Consistent with 'Submit Changes' on the button. Minor but worth aligning.

### CP-07: Network modal title (LOW)
- **Files:** `company-details-form.component.ts` line 303
- **Old:** `title: 'Connection paused',`
- **New:** `title: 'Connection lost',`
- **Why better:** 'Lost' is standard language for a dropped connection. 'Paused' implies the app made a choice.

### CP-11: BE success feedback object body (consistency)
- **Files:** `get-hired-BE/controllers/companiesController.js` line 181 (inside the 400 validation response)
- **Old:** `body: 'We found fields that need to be fixed before saving.',`
- **New:** `body: 'The server flagged some fields — review them below and try saving again.',`
- **Why better:** The FE currently ignores this BE feedback object for copy (uses its own hardcoded strings). But keeping them in sync avoids drift if the FE is ever refactored to consume the BE feedback body.

---

## 9. Messaging Backlog

| ID | Title | Issue | Priority | Effort | Acceptance Criteria |
|---|---|---|---|---|---|
| MB-01 | Form labels not programmatically linked to inputs | All `<label>` elements lack `for` attributes; all `<input>` elements lack `id` attributes | P1 | Medium | Every form field has a matching `<label for="fieldId">` and `<input id="fieldId">`. All pass axe-core or Lighthouse a11y audit. |
| MB-02 | Extend success modal auto-dismiss | 4 s is too short for screen reader users | P2 | Low | Change `autoDismissMs: 4000` to `5500`. Consider adding a "Keep open" affordance or removing auto-dismiss entirely. |
| MB-03 | Logo img: add error handler and alt text | Silent failure when CDN 404s | P2 | Low | Add `(error)="onLogoError()"` method that sets `profileImage` to a placeholder. Add `alt="Company logo"` to the `<img>` element. |
| MB-04 | Remove SnackbarService dead injection | Injected but never called in submit lifecycle | P3 | Low | Remove `SnackbarService` from constructor and import. Add a code comment if removal is deferred because the service is used elsewhere in the file (verify first). |
| MB-05 | Align changed-field chip labels to form labels | 'Contact email' vs 'Email', 'Team size' vs 'Number of Employees', 'Public visibility' vs 'Publicly Shown' | P3 | Low | Decide canonical label for each field. Update either FIELD_LABELS const or the form's `<label>` elements. |
| MB-06 | Remove or document dead FeedbackState types | `partial`, `conflict`, `session` exist in the union type and have modal icons, but are never instantiated | P3 | Low | Either delete unused states from the union and remove their icon branches from the HTML, or add a comment documenting planned use. |
| MB-07 | Success chips: move from div+span to ul+li | Current `div > span` structure is not enumerated by screen readers as a list | P3 | Low | Change `<div class="ghfm-chips" aria-label="Updated fields">` to `<ul class="ghfm-chips" aria-label="Updated fields">` and `<span class="ghfm-chip">` to `<li class="ghfm-chip">`. Verify CSS still applies. |
| MB-08 | BE success feedback object consumed by FE | FE hardcodes success copy instead of consuming the `feedback` object the BE returns | P4 | Medium | Refactor `afterSubmit('updated')` to read `title`/`body`/`syncNote`/`primaryCta`/`secondaryCta` from the BE response `feedback` object. Single source of truth for success copy. |
| MB-09 | BE validation body: 'About section' label mismatch | 'About section must be 1000 characters or fewer.' — 'About section' inconsistent with chip and likely-rendered form label | P4 | Low | Change to 'About must be 1000 characters or fewer.' to align with the 'About' chip label. |
| MB-10 | Create path: legacy UpdatedDialogComponent | `afterSubmit('created')` opens old `UpdatedDialogComponent` with raw copy 'Company successfully setup. You can now access other features'. Not covered by the new branded modal system. | P4 | Medium | Replace `UpdatedDialogComponent` call with a `GhFeedbackModalComponent` data object using the same success state pattern. |

---

## 10. Release Gate

| Gate | Status | Rationale |
|---|---|---|
| **A — Message Safety (no internals exposed)** | **PASS** | No stack traces, no SQL, no internal IDs exposed in any user-visible message. `requestId` field shown as 'Ref:' only when explicitly provided — acceptable. |
| **B — Clarity** | **PASS WITH NOTES** | Most messages clear. Two issues: 'Connection paused' (ambiguous) and the validation modal body (inaccurate — server vs. FE attribution). Neither blocks release but both are recommended before wider rollout. |
| **C — Actionability** | **PASS WITH NOTES** | All states have at least one CTA. Permission modal lacks a next-step — recruiter dead-ends at 'Back to company page' with no guidance on how to gain access. Recommend fixing before rollout. |
| **D — Accessibility Messaging** | **FAIL** | Form `<label>` elements are not programmatically linked to inputs via `for`/`id`. This is a structural gap that affects all form fields, not just error messages. Auto-dismiss at 4 s is borderline. Success chips not in list structure. These are correctness failures for a11y, not polish items. |
| **E — Tone** | **PASS** | All messages are non-blaming, recruiter-appropriate, and consistent with the GetHired brand voice (modern, techy, encouraging). No message exposes blame, confusion, or coldness. |

---

## 11. Recommended Next Command

**Run `/code-review` on the company-details-form component** — the accessibility gaps found here (missing `for`/`id` pairs across all form fields) are structural code issues, not copy issues, and are best surfaced and fixed via a targeted code review pass with `--fix`. Specifically:

1. `company-details-form.component.html` — add `id` to all `<input>`, `<select>`, `<textarea>` elements and `for` to all `<label>` elements.
2. `gh-feedback-modal.component.html` — convert success chips from `div > span` to `ul > li`.
3. `company-details-form.component.ts` — apply CP-01, CP-02, CP-06, CP-07 copy fixes and remove the SnackbarService dead injection.

After that, run `/verify` to confirm the form still submits correctly and the modal states render as expected.

---

*Report generated by GetHired NOTIFY command. All findings are based on static source analysis of the 5 files listed in scope. No network requests were made. No production data was accessed.*
