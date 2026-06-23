import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Applicant } from '@app-applicant/applicant.model';
import { ProfileQualityService } from '@main/public/services/profile-quality.service';
import { DocumentQualityService } from '@main/public/services/document-quality.service';
import { ProfileQualityResult } from '@main/public/services/profile-quality.model';
import { DocumentQualityResult } from '@main/public/services/document-quality.model';

/**
 * Applicant dashboard's "Profile Readiness" card -- reuses the existing
 * ProfileQualityService/DocumentQualityService (built during the
 * public-portal mission, already proven on the job detail page's
 * JobMatchPanelComponent) rather than building a parallel scoring system.
 *
 * Honest by design: with the applicant data tables currently missing
 * (GH-ACT-001), `applicant` will be null/empty for every real user today,
 * so this card will show the "Create your profile" framing rather than a
 * populated score -- that's correct behavior, not a bug, and it's the
 * same advisory-only, non-shaming language already used everywhere else
 * in this codebase's scoring work.
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

  constructor(
    private router: Router,
    private profileQualityService: ProfileQualityService,
    private documentQualityService: DocumentQualityService,
  ) {}

  ngOnChanges(): void {
    this.profileQuality = this.profileQualityService.evaluate(this.applicant);
    this.documentQuality = this.documentQualityService.evaluate(this.applicant);
    this.nextBestAction = this.computeNextBestAction();
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
