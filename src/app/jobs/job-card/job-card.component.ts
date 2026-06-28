import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '@app-core/services/core.service';
import * as Model from '../jobs.model';
import { PublicJobNormalizerService } from '@main/public/services/public-job-normalizer.service';
import { JobSignalsService } from '@main/public/services/job-signals.service';
import { NormalizedJob } from '@main/public/services/public-job-normalizer.model';
import { JobSignals } from '@main/public/services/job-signals.model';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';

/**
 * Redesigned public job card (Phase 8). The component class stays
 * input-compatible with the original (`@Input() data: Model.BasicJob`) so
 * every existing usage (job-posts-list, search results, company-jobs list)
 * keeps working unmodified — only the template/internal logic changed.
 *
 * Match area is intentionally scoped: the listing payload (BasicJob) lacks
 * skills/requirements/jobLevelId, so a full compatibility score here would
 * be computed against near-zero real data and risk looking misleadingly
 * low — exactly what the mission rules out. Anonymous visitors see the
 * locked-match teaser; logged-in applicants see a lightweight "see your
 * full match" link to the job detail page, where the complete job payload
 * supports a real JobCompatibilityService calculation (Phase 11).
 */
@Component({
  selector: 'app-job-card',
  animations: [mainAnimations],
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.scss']
})
export class JobCardComponent implements OnInit {
  @Input() data: Model.BasicJob;
  @Input() i: number;
  /** When true the card renders with a selected/active highlight ring. */
  @Input() isSelected = false;
  /** Emits the raw BasicJob when the card body is clicked (not Apply button). */
  @Output() selectJob = new EventEmitter<Model.BasicJob>();

  normalized: NormalizedJob;
  signals: JobSignals;
  isLoggedIn = false;
  isApplicantRole = false;
  isRecruiterOrAdminRole = false;
  /** Entry-animation param — zeroed out for prefers-reduced-motion users. */
  animationDelayMs = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private core: CoreService,
    private normalizer: PublicJobNormalizerService,
    private jobSignals: JobSignalsService,
    private analytics: PublicPortalAnalyticsService,
  ) { }

  ngOnInit(): void {
    this.normalized = this.normalizer.normalize(this.data);
    this.signals = this.jobSignals.compute(this.normalized);
    this.isLoggedIn = this.core.isLoggedIn();
    if (this.isLoggedIn) {
      this.core.getRole().then((role: string) => {
        this.isApplicantRole = role === '3';
        this.isRecruiterOrAdminRole = role === '1' || role === '2';
      });
    }

    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    this.animationDelayMs = prefersReducedMotion ? 0 : (this.i ?? 0) * 100;
  }

  onCardBodyClick(): void {
    this.selectJob.emit(this.data);
  }

  applyNow(event: Event): void {
    event.stopPropagation();
    this.analytics.trackPublicJobCardClicked(this.normalized?.jobId);
    this.analytics.trackApplyPromptClicked(this.normalized?.jobId, this.isLoggedIn ? 'logged_in' : 'anonymous');
    this.router.navigateByUrl(`jobs/details/${this.data?.jobId}`);
  }

  viewDetails(): void {
    this.analytics.trackPublicJobCardClicked(this.normalized?.jobId);
    this.router.navigateByUrl(`jobs/details/${this.data?.jobId}`);
  }

  companyRedirect(event: Event): void {
    event.stopPropagation();
    this.analytics.trackCompanyPreviewClicked(this.data?.companyId);
    this.router.navigate([`../companies/details`], { relativeTo: this.route, queryParams: {
      id: this.data?.companyId
    }});
  }
}
