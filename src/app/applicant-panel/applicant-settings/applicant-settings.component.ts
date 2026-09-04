import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UpdatedDialogComponent } from '@app-shared/components/updated-dialog/updated-dialog.component';
import { SecurityLogoutCountdownComponent } from '@app-shared/components/security-logout-countdown/security-logout-countdown.component';
import { AuthFacade } from '@main/auth/state/auth.facade';
import { AuthService } from '@main/auth/auth.service';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { focusFirstInvalidControl } from '@app-shared/utils/form-validation.util';

// REDESIGN (GETHIRED_JOBSEEKER_SETTINGS_PROFILE_AUTH_REMEDIATION_V1):
// the previous single, unbound, decorative "Password" field is replaced
// with a real Current/New/Confirm Change Password flow, wired to the
// EXISTING POST /auth/account/change-password endpoint
// (AuthService.changePasswordInSession -- already implemented backend and
// frontend service method, just never called from any component). Account
// Information (name/email) and Change Password are two separate forms with
// two separate submit actions -- per Tab 18, these are deliberately
// different security flows and are never merged into one request.
const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 128;

function passwordsMatchValidator(newKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const newCtrl = group.get(newKey);
    const confirmCtrl = group.get(confirmKey);
    if (!newCtrl || !confirmCtrl) return null;
    if (confirmCtrl.value && newCtrl.value !== confirmCtrl.value) {
      confirmCtrl.setErrors({ ...confirmCtrl.errors, notMatching: true });
    } else if (confirmCtrl.errors) {
      const { notMatching, ...rest } = confirmCtrl.errors;
      confirmCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  };
}

function notEqualToValidator(otherKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) return null;
    const other = parent.get(otherKey);
    if (other && control.value && other.value && control.value === other.value) {
      return { sameAsCurrent: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-applicant-settings',
  templateUrl: './applicant-settings.component.html',
  styleUrls: ['./applicant-settings.component.scss']
})
export class ApplicantSettingsComponent implements OnInit {
  profileDetailsForm: FormGroup;
  passwordForm: FormGroup;
  user;

  savingAccount = false;
  changingPassword = false;
  passwordChangeError: string | null = null;
  passwordChangeSuccess = false;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  success$ = this.authFacade.success$
    .pipe()
    .subscribe(this.afterChange.bind(this));

  constructor(
    private formBuilder: FormBuilder,
    private authFacade: AuthFacade,
    private authService: AuthService,
    private applicantFacade: ApplicantFacade,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.profileDetailsForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      // Read-only via the template's [readonly] attribute, not a disabled
      // FormControl -- disabled controls are pulled from the tab order and
      // some assistive tech, which is worse for an informational-but-real
      // identity field than a plain readonly input. Never included in the
      // payload onSubmitAccount() actually sends either way.
      email: [''],
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(PASSWORD_MIN_LENGTH),
        Validators.maxLength(PASSWORD_MAX_LENGTH),
        notEqualToValidator('currentPassword'),
      ]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: passwordsMatchValidator('newPassword', 'confirmPassword') });

    // Re-validate "must differ from current" live as either field changes.
    this.passwordForm.get('currentPassword')?.valueChanges.subscribe(() =>
      this.passwordForm.get('newPassword')?.updateValueAndValidity({ emitEvent: false }));

    // BUGFIX: previously read from AuthFacade.profile$/getUserProfile(),
    // which dispatches AuthActions.getUserProfile() -- but that action's
    // effect (AuthEffects.profile$, hitting /auth/getprofile) never fires
    // in this app's actual routing (confirmed via network capture: no
    // request is ever sent), so Account Information's First/Last Name and
    // Email were permanently blank. ApplicantFacade.user$/getUser() is the
    // mechanism this panel's own sidebar/avatar already relies on
    // successfully (hits /applicant/userprofile), so it's reused here
    // instead. Subscribing here (after profileDetailsForm exists) also
    // avoids the earlier subscribe-in-field-initializer ordering: that ran
    // at construction time, before ngOnInit created the form, so
    // setupForm()'s existing `this.profileDetailsForm` guard silently
    // dropped the first emission.
    this.applicantFacade.user$.subscribe(this.setupForm.bind(this));
    this.applicantFacade.getUser();
  }

  setupForm(user) {
    if (user && this.profileDetailsForm) {
      this.user = user;
      const { firstName, lastName, email } = user;

      this.profileDetailsForm.get('firstName')?.setValue(firstName);
      this.profileDetailsForm.get('lastName')?.setValue(lastName);
      this.profileDetailsForm.get('email')?.setValue(email);
    }
  }

  onSubmitAccount(event: Event): void {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    if (this.profileDetailsForm.invalid) {
      focusFirstInvalidControl(this.profileDetailsForm);
      return;
    }

    this.savingAccount = true;
    const profile = {
      ...this.user,
      firstName: this.profileDetailsForm.controls.firstName.value,
      lastName: this.profileDetailsForm.controls.lastName.value,
    };

    this.authFacade.updateProfile(profile);
  }

  onSubmitPasswordChange(event: Event): void {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    this.passwordChangeError = null;
    this.passwordChangeSuccess = false;

    if (this.passwordForm.invalid) {
      focusFirstInvalidControl(this.passwordForm);
      return;
    }

    this.changingPassword = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePasswordInSession({
      currentPassword,
      newPassword,
      signOutOtherSessions: false,
      clientEventId: `settings-${Date.now()}`,
    }).subscribe({
      next: (res: any) => {
        this.changingPassword = false;
        if (res && res.success) {
          this.passwordChangeSuccess = true;
          this.passwordForm.reset();
          // Clears "touched"/validation display left over from the just-submitted values.
          Object.keys(this.passwordForm.controls).forEach(key => {
            this.passwordForm.get(key)?.markAsPristine();
            this.passwordForm.get(key)?.markAsUntouched();
          });
          this.snackbarService.success('Your password has been updated.', '');

          // SECURITY-LOGOUT-COUNTDOWN: only reached after the password
          // change request has actually succeeded -- a validation failure,
          // network error, or provider rejection lands in the `error`
          // branch below instead and never opens this dialog. The dialog
          // itself is non-dismissible and owns the actual logout call (see
          // SecurityLogoutCountdownComponent) so there is exactly one path
          // to logout here, not a second one duplicated in this component.
          this.dialog.open(SecurityLogoutCountdownComponent, {
            disableClose: true,
            data: {
              title: 'Password changed successfully',
              message: 'Your GetHired password has been updated. For your account’s security, we’re signing you out of this session now so the new password takes effect.',
              nextStepMessage: 'You’ll be returned to the sign-in page automatically -- just log back in with your new password to continue.',
              seconds: 5,
            },
          });
        } else {
          this.passwordChangeError = (res && res.feedback && res.feedback.body) || 'We couldn’t update your password. Please try again.';
        }
      },
      error: (err) => {
        this.changingPassword = false;
        const body = err && err.error;
        this.passwordChangeError = (body && body.feedback && body.feedback.body)
          || (body && body.error && body.error.message)
          || 'We couldn’t update your password. Please try again.';
      },
    });
  }

  toggleShowCurrentPassword(): void { this.showCurrentPassword = !this.showCurrentPassword; }
  toggleShowNewPassword(): void { this.showNewPassword = !this.showNewPassword; }
  toggleShowConfirmPassword(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  afterChange(event) {
    if (event == 'updated') {
      this.savingAccount = false;
      this.dialog.open(UpdatedDialogComponent, {
        disableClose: false,
        data: 'Profile successfully updated',
      });
    }
  }

  get newPasswordErrorMessage(): string | null {
    const ctrl = this.passwordForm.get('newPassword');
    if (!ctrl || !ctrl.touched || !ctrl.errors) return null;
    if (ctrl.errors.required) return 'New password is required.';
    if (ctrl.errors.minlength) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
    if (ctrl.errors.maxlength) return `Use fewer than ${PASSWORD_MAX_LENGTH} characters.`;
    if (ctrl.errors.sameAsCurrent) return 'New password must be different from your current password.';
    return null;
  }

  get confirmPasswordErrorMessage(): string | null {
    const ctrl = this.passwordForm.get('confirmPassword');
    if (!ctrl || !ctrl.touched || !ctrl.errors) return null;
    if (ctrl.errors.required) return 'Please confirm your new password.';
    if (ctrl.errors.notMatching) return 'Passwords do not match.';
    return null;
  }
}
