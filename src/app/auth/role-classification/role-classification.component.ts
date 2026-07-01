import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { GoogleAuthService } from '../services/google-auth.service';
import { LinkedInAuthService } from '../services/linkedin-auth.service';
import { PublicJobPreviewService } from '@main/public/services/public-job-preview.service';

@Component({
  selector: 'app-role-classification',
  templateUrl: './role-classification.component.html',
  styleUrls: ['./role-classification.component.scss']
})
export class RoleClassificationComponent implements OnInit, OnDestroy {
  selectedRole: 'job_seeker' | 'employer' | null = null;
  submitting = false;
  error: string | null = null;

  displayName = '';
  email = '';
  photoUrl = '';

  recommendedRole: 'job_seeker' | 'employer' | null = null;
  recommendedLabel = '';

  hasEmployerDraft = false;
  hasJobApplyIntent = false;

  private _provider: 'google' | 'linkedin' = 'google';
  private _sub: Subscription;

  constructor(
    private googleAuthService: GoogleAuthService,
    private linkedInAuthService: LinkedInAuthService,
    private jobPreviewService: PublicJobPreviewService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const hasGoogle   = this.googleAuthService.hasPendingRoleClassification;
    const hasLinkedIn = this.linkedInAuthService.hasPendingRoleClassification;

    if (!hasGoogle && !hasLinkedIn) {
      this.router.navigate(['/signin']);
      return;
    }

    if (hasLinkedIn) {
      this._provider = 'linkedin';
      this.displayName = this.linkedInAuthService.pendingDisplayName;
      this.email       = this.linkedInAuthService.pendingEmail;
      this.photoUrl    = this.linkedInAuthService.pendingPhotoUrl;
    } else {
      this._provider = 'google';
      this.displayName = this.googleAuthService.pendingDisplayName;
      this.email       = this.googleAuthService.pendingEmail;
      this.photoUrl    = this.googleAuthService.pendingPhotoUrl;
    }

    this.hasEmployerDraft = this.jobPreviewService.hasPendingToken();
    const pendingApply = localStorage.getItem('gh_pending_apply_job_id');
    this.hasJobApplyIntent = !!pendingApply;

    if (this.hasEmployerDraft) {
      this.recommendedRole = 'employer';
      this.recommendedLabel = 'Recommended for posting jobs';
    } else if (this.hasJobApplyIntent) {
      this.recommendedRole = 'job_seeker';
      this.recommendedLabel = 'Recommended for applying to jobs';
    }
  }

  selectRole(role: 'job_seeker' | 'employer'): void {
    this.selectedRole = role;
    this.error = null;
  }

  submit(): void {
    if (!this.selectedRole || this.submitting) return;

    if (this.hasEmployerDraft && this.selectedRole === 'job_seeker') {
      const ok = window.confirm(
        'You started creating a job post. To continue with that draft, choose Employer. Continue as Job Seeker instead?'
      );
      if (!ok) { this.selectedRole = 'employer'; return; }
    }

    if (this.hasJobApplyIntent && this.selectedRole === 'employer') {
      const ok = window.confirm(
        'Applying to jobs requires a Job Seeker profile. Continue as Employer instead?'
      );
      if (!ok) { this.selectedRole = 'job_seeker'; return; }
    }

    this.submitting = true;
    this.error = null;

    const request$ = this._provider === 'linkedin'
      ? this.linkedInAuthService.submitRoleSelection(this.selectedRole)
      : this.googleAuthService.submitRoleSelection(this.selectedRole);

    request$.pipe(take(1)).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response && response.success && response.data) {
          if (this._provider === 'linkedin') {
            this.linkedInAuthService.clearPendingRoleState();
            this.linkedInAuthService.storeSession(response.data);
          } else {
            this.googleAuthService.clearPendingRoleState();
            this.googleAuthService.storeSession(response.data);
          }
        } else {
          this.error = 'Could not complete sign-up. Please try again.';
        }
      },
      error: (err) => {
        this.submitting = false;
        const body = err && err.error;
        this.error = (body && body.message) || 'Sign-up failed. Please try again.';
        if (err && err.status === 401) {
          this.googleAuthService.clearPendingRoleState();
          this.linkedInAuthService.clearPendingRoleState();
          this.router.navigate(['/signin'], {
            queryParams: { message: 'Your session expired. Please sign in again.' }
          });
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this._sub) this._sub.unsubscribe();
  }
}
