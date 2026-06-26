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
    // MV3-F5: typeof guard prevents SSR ReferenceError. The try/catch alone
    // was not sufficient — `localStorage` as an unresolvable identifier in
    // Node.js throws a ReferenceError before the catch block is entered,
    // causing a noisy server error log on every SSR render of /jobs.
    if (typeof localStorage === 'undefined') { return false; }
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
    // MV3-F5: typeof guard + try/catch — belt-and-suspenders for both
    // SSR (localStorage undefined) and private-mode (localStorage throws).
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(DISMISS_KEY, '1');
      } catch {
        // Private browsing or storage quota exceeded — dismissal won't persist.
      }
    }
  }
}
