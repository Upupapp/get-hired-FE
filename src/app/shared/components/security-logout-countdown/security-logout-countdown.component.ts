import { Component, OnDestroy, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CoreService } from '@app-core/services/core.service';

export interface SecurityLogoutCountdownData {
  /** Shown as the dialog heading. Defaults to a generic security message. */
  title?: string;
  /** Shown above the countdown line -- explains WHY this is happening.
   *  Defaults to a generic security message. */
  message?: string;
  /** Second line of explanation -- what the user should do next. Defaults
   *  to a generic "sign back in" instruction. */
  nextStepMessage?: string;
  /** Seconds to count down from. Defaults to 3. */
  seconds?: number;
}

/** Mandatory, non-dismissible countdown shown after a security-sensitive
 *  action (currently: authenticated applicant password change) that must
 *  force a re-login. Unlike ConfirmationDialogComponent, this dialog has no
 *  Cancel path -- disableClose is set so backdrop click / Escape cannot
 *  bypass the scheduled logout, and the countdown always ends in the same
 *  canonical CoreService.logout(). */
@Component({
  selector: 'app-security-logout-countdown',
  templateUrl: './security-logout-countdown.component.html',
  styleUrls: ['./security-logout-countdown.component.scss'],
})
export class SecurityLogoutCountdownComponent implements OnInit, OnDestroy {
  readonly title: string;
  readonly message: string;
  readonly nextStepMessage: string;
  readonly totalSeconds: number;
  secondsLeft: number;

  private destroy$ = new Subject<void>();
  private loggedOut = false;

  constructor(
    public dialogRef: MatDialogRef<SecurityLogoutCountdownComponent>,
    private coreService: CoreService,
    @Optional() @Inject(MAT_DIALOG_DATA) data: SecurityLogoutCountdownData,
  ) {
    this.dialogRef.disableClose = true;
    this.title = (data && data.title) || 'Password changed successfully';
    this.message = (data && data.message)
      || 'Your password has been updated. For your account’s security, we’re signing you out of this session now so the new password takes effect everywhere.';
    this.nextStepMessage = (data && data.nextStepMessage)
      || 'You’ll be returned to the sign-in page automatically -- just log back in with your new password.';
    this.totalSeconds = (data && data.seconds) || 3;
    this.secondsLeft = this.totalSeconds;

    // RACE FIX: the backend already invalidated the session token the
    // instant the password change succeeded (before this dialog even
    // opened) -- set this the moment the dialog is constructed, not at the
    // end of the countdown, so no background request fired during the
    // countdown window can trigger UnAuthorizedInterceptor's own
    // logout+toast+redirect out from under this modal. See
    // CoreService.suppressExpiryHandling.
    this.coreService.suppressExpiryHandling = true;
  }

  /** 0-100, counts UP as time passes -- drives the progress bar so the
   *  countdown is also conveyed visually, not just as a changing number. */
  get progressPercent(): number {
    if (this.totalSeconds <= 0) return 100;
    return Math.min(100, Math.round(((this.totalSeconds - this.secondsLeft) / this.totalSeconds) * 100));
  }

  ngOnInit(): void {
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.secondsLeft -= 1;
      if (this.secondsLeft <= 0) {
        this.finishLogout();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private finishLogout(): void {
    if (this.loggedOut) return; // guards against a double 0-tick / double logout call
    this.loggedOut = true;
    this.destroy$.next();
    this.destroy$.complete();

    this.coreService.logout().subscribe({
      next: () => this.redirect(),
      error: () => this.redirect(),
    });
  }

  private redirect(): void {
    this.dialogRef.close();
    // Hard reload (not router navigation) -- same "truly clean slate at a
    // security-sensitive boundary" reasoning as every other logout path in
    // this app (see CoreService.logout()/applicant-panel/employer-panel).
    window.location.href = '/signin';
  }
}
