import { FormGroup } from '@angular/forms';

/**
 * GETHIRED_QA_REMEDIATION V1 Phase 2 (EM-02/03/08/12, JS-14, JS-19/20):
 * shared fix for the "invalid submit does nothing" pattern repeated across
 * Signup, Signin, the Profile wizard, and Forgot Password. Each of those
 * forms already renders per-field `*ngIf="control.invalid && control.touched"`
 * error messages, but nothing ever marked controls touched (or told the user
 * anything) when the submit handler's own `if (form.valid)` check failed --
 * so an all-empty or invalid submit looked like the button did nothing.
 *
 * Marks every control touched (so those existing error messages render) and
 * scrolls/focuses the first invalid control's actual DOM element. Call this
 * from a submit handler's invalid branch instead of leaving it a silent no-op.
 */
export function focusFirstInvalidControl(form: FormGroup, formElement?: HTMLElement): void {
  form.markAllAsTouched();

  const invalidControlName = Object.keys(form.controls).find(
    (name) => form.controls[name].invalid
  );
  if (!invalidControlName) return;

  const root: ParentNode = formElement || document;
  const selector = `[formcontrolname="${invalidControlName}"], #${invalidControlName}`;
  const el = root.querySelector<HTMLElement>(selector);
  if (!el) return;

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (typeof el.focus === 'function') {
    el.focus();
  }
}
