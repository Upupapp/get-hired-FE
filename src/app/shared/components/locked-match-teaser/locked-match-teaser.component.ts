import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';

export type LockedMatchTeaserVariant = 'card' | 'hero' | 'detail' | 'banner';

/**
 * Reusable "create a profile to unlock your match" prompt. Used in job
 * cards, job detail, hero, and account-value banner contexts (Phase 9).
 *
 * Never shows a fabricated score — only locked/preview visuals and a clear
 * benefit statement, per the mission's explicit "do not show fake numeric
 * score" rule.
 *
 * Preserves the user's current location via the SAME localStorage key
 * (`returnURL`) the existing job-detail "log in to apply" flow already
 * uses (see job-posts-details.component.ts::toLogin()) — intentionally not
 * a new mechanism.
 */
@Component({
  selector: 'app-locked-match-teaser',
  animations: [mainAnimations],
  templateUrl: './locked-match-teaser.component.html',
  styleUrls: ['./locked-match-teaser.component.scss'],
})
export class LockedMatchTeaserComponent {
  @Input() variant: LockedMatchTeaserVariant = 'card';
  @Input() context = 'job_card';
  @Input() jobId?: string;

  constructor(
    private router: Router,
    private analytics: PublicPortalAnalyticsService,
  ) {}

  createProfile(): void {
    this.analytics.trackUnlockMatchClicked(this.jobId ?? '');
    this.analytics.trackSignupPromptClicked(this.context);
    this.preserveReturnUrl();
    this.router.navigateByUrl('/signup');
  }

  logIn(): void {
    this.analytics.trackLoginPromptClicked(this.context);
    this.preserveReturnUrl();
    this.router.navigateByUrl('/signin');
  }

  private preserveReturnUrl(): void {
    localStorage.setItem('returnURL', this.router.url);
  }
}
