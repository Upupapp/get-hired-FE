import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { JobsFacade } from '@main/jobs/state/jobs.facade';
import { PublicJobNormalizerService } from '@main/public/services/public-job-normalizer.service';
import { JobCompatibilityService } from '@main/public/services/job-compatibility.service';
import { Applicant } from '@app-applicant/applicant.model';
import { Subscription } from 'rxjs';

interface RankedJob {
  raw: any;
  score: number;
  label: string;
}

/**
 * MATCH (Product OS) -- applicant dashboard "Recommended Jobs" section.
 *
 * Reuses the existing, already-built JobCompatibilityService rather than a
 * new scoring engine (MATCH's own registered command requires reconciling
 * with this service, not duplicating it). Scores every published job
 * against the applicant's profile, shows the top matches, reuses the
 * existing app-job-card for rendering -- no new card visual introduced.
 */
@Component({
  selector: 'app-recommended-jobs',
  templateUrl: './recommended-jobs.component.html',
  styleUrls: ['./recommended-jobs.component.scss'],
})
export class RecommendedJobsComponent implements OnInit, OnChanges {
  @Input() applicant: Applicant | null = null;

  ranked: RankedJob[] = [];
  loading = true;
  private jobListSub: Subscription;
  private latestRawJobs: any[] = [];

  constructor(
    private jobsFacade: JobsFacade,
    private normalizer: PublicJobNormalizerService,
    private compatibilityService: JobCompatibilityService,
  ) {}

  ngOnInit(): void {
    this.jobsFacade.getPublishedList(undefined);
    this.jobListSub = this.jobsFacade.jobList$.subscribe((jobs: any) => {
      const rawJobs = Array.isArray(jobs) ? jobs : (jobs?.data ?? []);
      this.latestRawJobs = rawJobs;
      this.rank();
      this.loading = false;
    });
  }

  ngOnChanges(): void {
    this.rank();
  }

  ngOnDestroy(): void {
    this.jobListSub?.unsubscribe();
  }

  private rank(): void {
    if (!this.latestRawJobs.length) {
      this.ranked = [];
      return;
    }
    // Shows every published job (no top-3 cap, no score>0 filter) per
    // request -- still sorted by match score descending so the best
    // matches lead, but nothing is held back from the list anymore.
    this.ranked = this.latestRawJobs
      .map((raw) => {
        const normalized = this.normalizer.normalize(raw);
        const result = this.compatibilityService.evaluate(this.applicant, normalized);
        return { raw, score: result.score, label: result.label };
      })
      .sort((a, b) => b.score - a.score);
  }
}
