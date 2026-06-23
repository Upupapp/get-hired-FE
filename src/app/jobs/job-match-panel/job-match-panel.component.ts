import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CoreService } from '@app-core/services/core.service';
import { ApplicantService } from '@main/applicant/applicant.service';
import { Applicant } from '@app-applicant/applicant.model';
import { NormalizedJob } from '@main/public/services/public-job-normalizer.model';
import { JobCompatibilityService } from '@main/public/services/job-compatibility.service';
import { ApplicationReadinessService } from '@main/public/services/application-readiness.service';
import { JobCompatibilityResult } from '@main/public/services/job-compatibility.model';
import { ApplicationReadinessResult } from '@main/public/services/application-readiness.model';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';

/**
 * Job detail page's "your match & readiness" panel (GH-ACT-020).
 *
 * Anonymous visitors and recruiter/admin roles see nothing real to compute
 * a match against, so this renders the existing LockedMatchTeaserComponent
 * ('detail' variant) for anonymous visitors and nothing at all for
 * recruiter/admin roles. Only logged-in applicants (role 3) get a real
 * JobCompatibilityService/ApplicationReadinessService read, computed from
 * their own profile -- never a fabricated score. Low match never blocks
 * applying (see ApplicationReadinessService).
 */
@Component({
  selector: 'app-job-match-panel',
  templateUrl: './job-match-panel.component.html',
  styleUrls: ['./job-match-panel.component.scss'],
})
export class JobMatchPanelComponent implements OnInit, OnChanges {
  @Input() job!: NormalizedJob;
  /** Parent (JobPostsDetailsComponent) already owns the apply flow -- this
   * panel only surfaces the CTA, it never triggers application logic
   * itself. */
  @Output() applyClicked = new EventEmitter<void>();

  role: string | null = null;
  loading = false;
  compatibility: JobCompatibilityResult | null = null;
  readiness: ApplicationReadinessResult | null = null;

  constructor(
    private coreService: CoreService,
    private applicantService: ApplicantService,
    private compatibilityService: JobCompatibilityService,
    private readinessService: ApplicationReadinessService,
    private analytics: PublicPortalAnalyticsService,
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.coreService.isLoggedIn()) {
      this.role = null;
      return;
    }

    this.role = await this.coreService.getRole();

    if (this.role !== '3') {
      // Recruiter/admin viewing a public job page -- no applicant match
      // concept applies to them.
      return;
    }

    this.loading = true;
    try {
      const userId = await this.coreService.getUserId();
      // The service's declared return type (Observable<Applicant>) doesn't
      // match the actual wire shape ({status, data: Applicant}) -- same
      // pre-existing typing gap every other caller of ApplicantService
      // works around. Read defensively rather than trust either shape.
      const response: any = await this.applicantService.getApplicant(userId).toPromise();
      this.evaluate(response?.data ?? response ?? null);
    } catch {
      // Defensive -- if the applicant profile can't be loaded, fall back to
      // the "create your profile" framing rather than erroring the page.
      this.evaluate(null);
    } finally {
      this.loading = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['job'] && !changes['job'].firstChange && this.role === '3') {
      this.evaluate(this.lastApplicant);
    }
  }

  private lastApplicant: Applicant | null = null;

  private evaluate(applicant: Applicant | null): void {
    this.lastApplicant = applicant;
    if (!this.job) {
      return;
    }
    this.compatibility = this.compatibilityService.evaluate(applicant, this.job);
    this.readiness = this.readinessService.evaluate(applicant, this.job);
  }

  onApplyClicked(): void {
    if (this.job) {
      this.analytics.trackApplyPromptClicked(this.job.jobId, 'logged_in');
    }
    this.applyClicked.emit();
  }
}
