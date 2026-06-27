import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { UpdatedDialogComponent } from '@app-shared/components/updated-dialog/updated-dialog.component';
import { AuthFacade } from '@main/auth/state/auth.facade';
import { AuthService } from '@main/auth/auth.service';
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
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
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
          this.profileForm.get('firstName')!.setValue(u.firstName || '');
          this.profileForm.get('lastName')!.setValue(u.lastName || '');
          this.profileForm.get('email')!.setValue(u.email || '');
        }
      })
    );

    this.subs.push(
      this.authFacade.success$.subscribe((msg: any) => {
        if (msg === 'updated') {
          this.profileSaving = false;
          this.dialog.open(UpdatedDialogComponent, {
            disableClose: false,
            data: 'Account details saved.',
          });
        }
      })
    );
  }

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

  onSaveProfile(): void {
    if (!this.profileForm.valid || !this.user) { return; }
    this.profileSaving = true;
    this.authFacade.updateProfile({
      ...this.user,
      firstName: this.profileForm.get('firstName')!.value,
      lastName: this.profileForm.get('lastName')!.value,
    });
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
          this.pwErrorMessage = "Your account is safe. Please try again in a moment.";
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
