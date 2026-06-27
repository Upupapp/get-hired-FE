# GETHIRED BRAND — Error System (Phase 5)
**BRAND v6 · 2026-06-27**

---

## Error Level Hierarchy

### Level 1: Field Error (Validation)
- **Scope:** Single form field.
- **Visual:** Red border + error text below field. Field-level; doesn't move page.
- **A11y:** `aria-describedby` + `aria-invalid="true"` on field. Error element has `role="alert"` or uses `aria-live="polite"` if updating dynamically.
- **Persist:** Until user corrects the field.
- **Example:** "Please enter a valid email address."
- **Never:** Shake animation, red pulsing, per-keystroke haptic.

### Level 2: Inline Section Error
- **Scope:** A card, panel, or section that failed to load.
- **Visual:** Error card with alert icon + message + Retry button (if retryable). Appears inside the section shell — no layout shift.
- **A11y:** `role="alert"` only if the error appeared while user was waiting for that section; otherwise `role="status"`.
- **Persist:** Until retry succeeds or user navigates.
- **Example:** "We couldn't load your applicant data. Check your connection and try again."

### Level 3: Page-Level Error
- **Scope:** Entire page can't render.
- **Visual:** Full-content area error layout (sidebar/topbar still visible). Branded illustration + headline + action buttons.
- **A11y:** `<main>` content replaced by error content. H1 is the error headline. No `role="alert"` — user landed here, it's the primary content.
- **Persist:** Until user takes action (retry, navigate).

### Level 4: System Fallback (Unrecoverable)
- **Scope:** Application-level crash or unhandled exception.
- **Visual:** Minimal branded error page. No sidebar/topbar (may not be available).
- **Copy:** "Something went wrong. Please refresh the page." + "Refresh" button.

---

## Required Error Pages

### 404 — Not Found
- **Headline:** "We couldn't find that page."
- **Message:** "The page you're looking for may have moved or no longer exists."
- **Actions:** "Go to Home", "Browse Jobs" (public); "Go to Dashboard" (authenticated).
- **Illustration:** Brand visual (hiring-pipeline-lines.svg or equivalent).

### 403 — Forbidden / Permission Denied
- **Headline:** "You don't have access to this page."
- **Message:** "Contact your administrator if you think this is a mistake."
- **Actions:** "Go Back", "Go to Dashboard."
- **Never reveal:** What the content was or who can see it.

### 401 — Session Expired
- **Headline:** "Your session has expired."
- **Message:** "Sign in again to continue where you left off."
- **Action:** "Sign In."
- **Data safety:** Alert displayed; any form data preservation noted.

### 500 — Internal Server Error
- **Headline:** "Something went wrong on our end."
- **Message:** "We're looking into it. Try refreshing or come back in a moment."
- **Actions:** "Refresh", "Go Home."

### Offline
- **Pattern:** Persistent top banner (not a page). Never full-page unless app is completely unusable.
- **Headline (banner):** "You're offline."
- **Message:** "Check your internet connection."
- **Auto-dismiss:** When connection is restored, banner dismisses with `role="status"` announcement "Back online."

### File Upload Failed
- **Inline error:** "We couldn't upload '[filename]'. Make sure the file is under 10 MB and try again."
- **Retry:** Inline retry button.

### CV Doctor Failed
- **Inline:** Inside CV Doctor stepper — does not page-navigate.
- **Headline:** "We couldn't analyse your CV right now."
- **Message:** "This sometimes happens with complex file formats. Try again or upload a simpler PDF."
- **Actions:** "Try Again", "Contact Support."
- **Never:** Imply a low score or quality issue with the user's CV.

### Application Submit Failed
- **Headline:** "Your application couldn't be submitted."
- **Message:** "Your answers have been saved. Please try again."
- **Actions:** "Try Again", "Save Draft."
- **Data safety:** Explicitly confirm answers are preserved.

### Payment / Plan Issue
- **Headline:** "There's an issue with your billing."
- **Message:** "Update your payment method to continue using premium features."
- **Actions:** "Update Billing", "Contact Support."
- **Never:** Claim plan is expired if it isn't; never show fake limits.

---

## A11y Rules for Errors

| Scenario | ARIA pattern |
|---|---|
| Error appears while user is waiting | `role="alert"` (urgent, auto-announced) |
| Error appears on page load / user navigated to it | H1 content; no `role="alert"` needed |
| Non-urgent status update | `role="status"` or `aria-live="polite"` |
| Field validation error | `aria-describedby` → error element + `aria-invalid="true"` |
| Long form: multiple field errors | Field-level messages + `<ul>` summary above submit button |

## Anti-Patterns (Never Do)

| Anti-Pattern | Why |
|---|---|
| Red pulsing loop on error elements | Anxiety-inducing; WCAG flashing risk |
| `role="alert"` on every inline error | Alert fatigue; screen readers announce all alerts |
| Haptic error on every validation fail per keystroke | Annoying, intrusive |
| Generic "Something went wrong" with no action | Useless; strands the user |
| Error that auto-dismisses before user reads it | Data loss risk |
| Error that reveals server internals | Security risk |
