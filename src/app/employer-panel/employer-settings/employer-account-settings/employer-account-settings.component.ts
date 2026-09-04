import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { UpdatedDialogComponent } from '@app-shared/components/updated-dialog/updated-dialog.component';
import { SecurityLogoutCountdownComponent } from '@app-shared/components/security-logout-countdown/security-logout-countdown.component';
import { AuthFacade } from '@main/auth/state/auth.facade';
import { AuthService } from '@main/auth/auth.service';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { Subscription } from 'rxjs';

type PwState = 'idle' | 'saving' | 'success' | 'wrong_current' | 'weak' | 'same_as_old' | 'rate_limited' | 'network' | 'server';

@Component({
  selector: 'app-employer-account-settings',
  templateUrl: './employer-account-settings.component.html',
  styleUrls: ['./employer-account-settings.component.scss'],
  animations: [mainAnimations]
})
export class EmployerAccountSettingsComponent implements OnInit, OnDestroy {

  profileForm!: FormGroup;
  pwForm!: FormGroup;
  user: any = null;
  profileSaving = false;

  // Avatar
  pendingAvatarBase64 = '';
  avatarPreviewUrl = '';
  avatarError = '';

  showCurrent = false;
  showNew = false;
  showConfirm = false;

  pwState: PwState = 'idle';
  pwErrorMessage = '';

  private readonly COMMON_PW = [
    'password', 'password1', 'password12', 'password123', 'password1234',
    'qwerty123456', '123456789012', 'abcdefghijkl', 'letmein123456',
    'welcome12345', 'gethired123456', 'gethiredonline'
  ];

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authFacade: AuthFacade,
    private authService: AuthService,
    private employeeFacade: EmployeeFacade,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      roleTitle: [''],
      department: [''],
      shortBio: ['', Validators.maxLength(300)],
      linkedinUrl: ['', Validators.maxLength(255)],
      publicProfileEnabled: [false],
      showPhotoPublicly: [false],
      showTitlePublicly: [false],
      showBioPublicly: [false],
      showLinkedinPublicly: [false],
      showEmailPublicly: [false],
      showPhonePublicly: [false],
    });

    this.pwForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.matchValidator('newPassword', 'confirmPassword') });

    this.authFacade.getUserProfile();

    this.subs.push(
      this.authFacade.profile$.subscribe((u: any) => {
        if (u && this.profileForm) {
          this.user = u;
          this.profileForm.patchValue({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            email: u.email || '',
            roleTitle: u.roleTitle || '',
            department: u.department || '',
            shortBio: u.shortBio || '',
            linkedinUrl: u.linkedinUrl || '',
            publicProfileEnabled: u.publicProfileEnabled || false,
            showPhotoPublicly: u.showPhotoPublicly || false,
            showTitlePublicly: u.showTitlePublicly || false,
            showBioPublicly: u.showBioPublicly || false,
            showLinkedinPublicly: u.showLinkedinPublicly || false,
            showEmailPublicly: u.showEmailPublicly || false,
            showPhonePublicly: u.showPhonePublicly || false,
          });
          // Show existing photo if no pending preview
          if (!this.pendingAvatarBase64) {
            this.avatarPreviewUrl = u.photoUrl || u.photoURL || '';
          }
        }
      })
    );

    this.subs.push(
      this.authFacade.error$.subscribe((err: any) => {
        if (err) {
          this.profileSaving = false;
          // IMAGE-CONSISTENCY FIX: a failed save previously just stopped the
          // spinner with no user-facing message at all -- the button looked
          // idle again with no indication anything went wrong (contrast the
          // Change Password flow below, which has a full error state
          // machine). Reuses the same avatarError field/template slot this
          // form already renders for avatar-specific errors.
          this.avatarError = (typeof err === 'string' && err) || 'We couldn’t save your profile. Please try again.';
        }
      })
    );

    this.subs.push(
      this.authFacade.success$.subscribe((msg: any) => {
        if (msg === 'updated') {
          this.profileSaving = false;
          this.pendingAvatarBase64 = '';
          // Refresh employee profile so sidebar shows updated photo / name
          try {
            const raw = localStorage.getItem('user');
            if (raw) {
              const u = JSON.parse(raw);
              const uid = u._id || u.id || u.uid || '';
              if (uid) { this.employeeFacade.getEmployeeProfile(uid); }
            }
          } catch (_) {}
          // Refresh profile$ stream so the form shows saved values (authFacade fix)
          this.authFacade.getUserProfile();
          this.dialog.open(UpdatedDialogComponent, {
            disableClose: false,
            data: 'Profile saved.',
          });
        }
      })
    );
  }

  // ── Avatar ──────────────────────────────────────────────────────────────────

  onAvatarUploaded(result: any): void {
    this.avatarPreviewUrl = result.primaryUrl;
    this.pendingAvatarBase64 = '';
    this.avatarError = '';
  }

  // IMAGE-CONSISTENCY FIX: same bannerUploadPending/logoUploadPending
  // pattern used elsewhere in this codebase (job-create.component.ts,
  // company-details-form.component.ts) -- app-gh-image-upload's own
  // `uploading` output exists exactly to let a consumer block Save while
  // an avatar upload is still in flight, but this form never bound it.
  // Without this, clicking "Save profile" right after picking a new photo
  // saved with the OLD avatarPreviewUrl (or none), silently dropping the
  // new photo from that save.
  avatarUploadPending = false;

  onAvatarUploading(pending: boolean): void {
    this.avatarUploadPending = pending;
  }

  removeAvatar(): void {
    this.pendingAvatarBase64 = '';
    this.avatarPreviewUrl = '';
    this.avatarError = '';
  }

  get avatarInitials(): string {
    if (!this.user) { return '?'; }
    const f = (this.user.firstName || '').charAt(0).toUpperCase();
    const l = (this.user.lastName || '').charAt(0).toUpperCase();
    return f + l || f || '?';
  }

  // ── Profile save ────────────────────────────────────────────────────────────

  onSaveProfile(): void {
    if (!this.profileForm.valid || !this.user) { return; }
    if (this.avatarUploadPending) { return; } // see onAvatarUploading() above
    this.avatarError = '';
    this.profileSaving = true;
    const fv = this.profileForm.getRawValue();
    this.authFacade.updateProfile({
      ...this.user,
      firstName: fv.firstName,
      lastName: fv.lastName,
      roleTitle: fv.roleTitle || null,
      department: fv.department || null,
      shortBio: fv.shortBio || null,
      linkedinUrl: fv.linkedinUrl || null,
      publicProfileEnabled: fv.publicProfileEnabled || false,
      showPhotoPublicly: fv.showPhotoPublicly || false,
      showTitlePublicly: fv.showTitlePublicly || false,
      showBioPublicly: fv.showBioPublicly || false,
      showLinkedinPublicly: fv.showLinkedinPublicly || false,
      showEmailPublicly: fv.showEmailPublicly || false,
      showPhonePublicly: fv.showPhonePublicly || false,
      avatar: this.pendingAvatarBase64 || '',
      photoUrl: this.avatarPreviewUrl || this.user.photoUrl || this.user.photoURL || '',
    });
  }

  // ── Password change ─────────────────────────────────────────────────────────

  private matchValidator(pwKey: string, confirmKey: string) {
    return (group: FormGroup) => {
      const pw = group.controls[pwKey];
      const confirm = group.controls[confirmKey];
      if (!pw || !confirm) { return null; }
      if (confirm.value && pw.value !== confirm.value) {
        confirm.setErrors({ mismatch: true });
      } else if (confirm.errors && confirm.errors['mismatch']) {
        confirm.setErrors(null);
      }
      return null;
    };
  }

  onChangePw(): void {
    this.pwForm.markAllAsTouched();
    this.pwErrorMessage = '';

    if (this.pwForm.invalid) { return; }

    const newPw: string = this.pwForm.get('newPassword')!.value || '';
    if (this.COMMON_PW.some(b => newPw.toLowerCase() === b)) {
      this.pwState = 'weak';
      this.pwErrorMessage = 'Choose a password that is harder to guess.';
      return;
    }

    this.pwState = 'saving';
    const payload = {
      currentPassword: this.pwForm.get('currentPassword')!.value || '',
      newPassword: newPw,
      signOutOtherSessions: false,
      clientEventId: 'pw-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8),
    };

    this.authService.changePasswordInSession(payload).subscribe({
      next: (res: any) => {
        const fb = res && res.feedback ? res.feedback : null;
        if (fb && fb.state === 'success') {
          this.pwState = 'success';
          this.clearPwFields();

          // SECURITY-LOGOUT-COUNTDOWN (recruiter/employer side): same
          // mandatory forced-logout mechanism as the applicant Settings
          // password-change flow (ApplicantSettingsComponent), applied
          // here for parity -- only reached after the change-password
          // request has actually succeeded; a validation/network/provider
          // failure lands in the `else` branch below and never opens this.
          // The dialog is non-dismissible and owns the actual logout call
          // itself (SecurityLogoutCountdownComponent), so there is exactly
          // one path to logout here.
          this.dialog.open(SecurityLogoutCountdownComponent, {
            disableClose: true,
            data: {
              title: 'Password changed successfully',
              message: 'Your GetHired recruiter password has been updated. For your account’s security, we’re signing you out of this session now so the new password takes effect.',
              nextStepMessage: 'You’ll be returned to the sign-in page automatically -- just log back in with your new password to continue managing your jobs.',
              seconds: 3,
            },
          });
        } else {
          this.pwState = 'server';
          this.pwErrorMessage = (fb && fb.body) ? fb.body : 'Something went wrong. Please try again.';
        }
      },
      error: (err: any) => {
        const body = err && err.error ? err.error : null;
        const fb = body && body.feedback ? body.feedback : null;
        const code = (body && body.error && body.error.code) ? body.error.code : '';
        const httpStatus = err && err.status ? err.status : 0;

        if (httpStatus === 0 || httpStatus === 503) {
          this.pwState = 'network';
          this.pwErrorMessage = "We couldn't complete the password update. Please check your connection and try again.";
        } else if (code === 'wrong_current_password' || httpStatus === 401) {
          this.pwState = 'wrong_current';
          this.pwErrorMessage = "We couldn't confirm your current password. Please check it and try again.";
          this.pwForm.get('currentPassword')!.reset();
        } else if (code === 'weak_password' || code === 'same_as_old') {
          this.pwState = 'weak';
          this.pwErrorMessage = (fb && fb.body) ? fb.body : 'Choose a stronger password.';
        } else if (httpStatus === 429) {
          this.pwState = 'rate_limited';
          this.pwErrorMessage = 'We paused password change attempts for a short time to protect your account. Please wait and try again.';
        } else {
          this.pwState = 'server';
          this.pwErrorMessage = 'Your account is safe. Please try again in a moment.';
        }
      }
    });
  }

  resetPwForm(): void {
    this.pwState = 'idle';
    this.pwErrorMessage = '';
    this.clearPwFields();
  }

  private clearPwFields(): void {
    this.pwForm.reset();
    this.showCurrent = false;
    this.showNew = false;
    this.showConfirm = false;
  }

  get checks() {
    const np: string = this.pwForm.get('newPassword')!.value || '';
    const cp: string = this.pwForm.get('confirmPassword')!.value || '';
    return {
      length: np.length >= 12,
      notCommon: np.length > 0 && !this.COMMON_PW.some(b => np.toLowerCase() === b),
      matches: cp.length > 0 && np === cp,
      confirmHasValue: cp.length > 0,
    };
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
