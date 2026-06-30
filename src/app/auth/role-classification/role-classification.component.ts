import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { GoogleAuthService } from '../services/google-auth.service';
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

  // Pre-fill user details from Google account
  displayName = '';
  email = '';
  photoUrl = '';

  // Recommended role from pending intent
  recommendedRole: 'job_seeker' | 'employer' | null = null;
  recommendedLabel = '';

  // Pending intent hint (from sessionStorage, if any)
  hasEmployerDraft = false;
  hasJobApplyIntent = false;

  private _sub: Subscription;

  constructor(
    private googleAuthService: GoogleAuthService,
    private jobPreviewService: PublicJobPreviewService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // If no pending Google auth state, redirect to signin
    if (!this.googleAuthService.hasPendingRoleClassification) {
      this.router.navigate(['/signin']);
      return;
    }

    this.displayName = this.googleAuthService.pendingDisplayName;
    this.email = this.googleAuthService.pendingEmail;
    this.photoUrl = this.googleAuthService.pendingPhotoUrl;

    // Detect pending intents to pre-select recommended role
    this.hasEmployerDraft = this.jobPreviewService.hasPendingToken();
    // Job apply intent stored separately (if wired)
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

    // Warn if role conflicts with pending intent
    if (this.hasEmployerDraft && this.selectedRole === 'job_seeker') {
      const confirm = window.confirm(
        'You started creating a job post. To continue with that draft, choose Employer. Continue as Job Seeker instead?'
      );
      if (!confirm) {
        this.selectedRole = 'employer';
        return;
      }
    }

    if (this.hasJobApplyIntent && this.selectedRole === 'employer') {
      const confirm = window.confirm(
        'Applying to jobs requires a Job Seeker profile. Continue as Employer instead?'
      );
      if (!confirm) {
        this.selectedRole = 'job_seeker';
        return;
      }
    }

    this.submitting = true;
    this.error = null;

    this.googleAuthService.submitRoleSelection(this.selectedRole)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.submitting = false;
          if (response && response.success && response.data) {
            this.googleAuthService.clearPendingRoleState();
            this.googleAuthService.storeSession(response.data);
          } else {
            this.error = 'Could not complete sign-up. Please try again.';
          }
        },
        error: (err) => {
          this.submitting = false;
          const body = err && err.error;
          this.error = (body && body.message) || 'Sign-up failed. Please try again.';
          if (err && err.status === 401) {
            // Token expired — send back to signin
            this.googleAuthService.clearPendingRoleState();
            this.router.navigate(['/signin'], {
              queryParams: { message: 'Your Google session expired. Please sign in again.' }
            });
          }
        }
      });
  }

  ngOnDestroy(): void {
    if (this._sub) this._sub.unsubscribe();
  }
}
