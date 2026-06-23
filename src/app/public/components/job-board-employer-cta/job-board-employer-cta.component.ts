import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TalentProofService } from '@main/public/services/talent-proof.service';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';

const DISMISS_KEY = 'gh_talent_proof_job_board_banner_dismissed';

/**
 * GETHIRED 500K TALENT PROOF SYSTEM v1 -- non-intrusive employer
 * acquisition banner for the job board. Dismissible, remembered via
 * localStorage (no dedicated "dismissal service" exists in this codebase
 * to extend, and one component doesn't justify building one). Never
 * blocks job search or the apply flow -- it's a single line above the
 * job list, not a modal/overlay.
 */
@Component({
  selector: 'app-job-board-employer-cta',
  templateUrl: './job-board-employer-cta.component.html',
  styleUrls: ['./job-board-employer-cta.component.scss'],
})
export class JobBoardEmployerCtaComponent implements OnInit {
  dismissed = false;
  displayCopy = '';

  constructor(
    private router: Router,
    private talentProof: TalentProofService,
    private analytics: PublicPortalAnalyticsService,
  ) {}

  ngOnInit(): void {
    this.dismissed = this.wasDismissed();
    // 'short' form fits the surrounding sentence ("...reach {{ displayCopy }}.")
    // without duplicating "reach" -- the 'medium'/'long' forms already
    // include their own "Reach"/"Post your job to..." lead-in.
    this.displayCopy = this.talentProof.getDisplayCopy('short');
    if (!this.dismissed) {
      this.analytics.trackTalentProofViewed('job_board_banner', this.talentProof.isVerified());
    }
  }

  private wasDismissed(): boolean {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  }

  postJob(): void {
    this.analytics.trackTalentProofCtaClicked('job_board_banner', 'Post a job');
    this.router.navigateByUrl('/employers');
  }

  dismiss(): void {
    this.dismissed = true;
    this.analytics.trackTalentProofBannerDismissed('job_board_banner');
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // localStorage unavailable (private mode etc.) -- dismissal just won't persist, not a crash.
    }
  }
}
