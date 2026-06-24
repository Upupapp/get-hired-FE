import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Applicant } from '@app-applicant/applicant.model';
import { ApplicantService } from '@app-applicant/applicant.service';
import { DocumentQualityService } from '@main/public/services/document-quality.service';
import { ProfileQualityResult } from '@main/public/services/profile-quality.model';
import { DocumentQualityResult } from '@main/public/services/document-quality.model';

/**
 * Applicant dashboard's "Profile Readiness" card.
 *
 * Profile completeness now comes from the real backend endpoint
 * (GET /api/applicant/profile/completeness, services/applicantProfileQualityService.js)
 * instead of the frontend-only ProfileQualityService this card used to call
 * directly -- that service was a deliberate, documented port of the exact
 * same scoring weights, built before backend applicant data existed at
 * all. Now that the backend is the canonical source (and MATCH's
 * employer-side signals already read from it), this card calls it too
 * rather than keeping two scoring implementations that could drift apart.
 * Found and fixed during a 2026-06-24 status-verification pass --
 * see project_gethired_profile_cvcoach_match_status memory.
 *
 * DocumentQualityService is untouched -- separate concern (CV/document
 * quality, not profile completeness), no backend equivalent exists.
 */
@Component({
  selector: 'app-profile-readiness-panel',
  templateUrl: './profile-readiness-panel.component.html',
  styleUrls: ['./profile-readiness-panel.component.scss'],
})
export class ProfileReadinessPanelComponent implements OnChanges {
  @Input() applicant: Applicant | null = null;

  profileQuality: ProfileQualityResult | null = null;
  documentQuality: DocumentQualityResult | null = null;
  nextBestAction: string | null = null;
  loadingProfileQuality = false;

  constructor(
    private router: Router,
    private applicantService: ApplicantService,
    private documentQualityService: DocumentQualityService,
  ) {}

  ngOnChanges(): void {
    this.documentQuality = this.documentQualityService.evaluate(this.applicant);
    this.loadProfileCompleteness();
  }

  private loadProfileCompleteness(): void {
    this.loadingProfileQuality = true;
    this.applicantService.getProfileCompleteness().subscribe({
      next: (res: any) => {
        this.profileQuality = res?.data ?? null;
        this.loadingProfileQuality = false;
        this.nextBestAction = this.computeNextBestAction();
      },
      error: () => {
        // Never show a raw error for an advisory-only card -- just fall
        // back to the same "Create your profile" framing the backend
        // itself returns for a missing profile, so the UI degrades
        // gracefully instead of breaking.
        this.profileQuality = {
          score: 0,
          label: 'Just Started',
          missingFields: ['Create your profile to get started.'],
          suggestions: ['Create your free profile to unlock match grades.'],
        };
        this.loadingProfileQuality = false;
        this.nextBestAction = this.computeNextBestAction();
      },
    });
  }

  /** Single highest-impact suggestion, ranked simply: profile gaps before
   * document gaps, since a profile is the prerequisite for everything else
   * (job compatibility, applications) per this codebase's existing model. */
  private computeNextBestAction(): string | null {
    if (this.profileQuality && this.profileQuality.suggestions.length > 0) {
      return this.profileQuality.suggestions[0];
    }
    if (this.documentQuality && this.documentQuality.suggestions.length > 0) {
      return this.documentQuality.suggestions[0];
    }
    return null;
  }

  goToProfile(): void {
    this.router.navigateByUrl('/user/profile/edit');
  }

  goToJobs(): void {
    this.router.navigateByUrl('/jobs');
  }

  goToCvBuilder(): void {
    this.router.navigateByUrl('/user/profile/cv-builder');
  }
}
