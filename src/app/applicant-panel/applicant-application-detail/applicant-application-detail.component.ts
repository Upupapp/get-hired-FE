import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JobService } from '@app-job/job.service';

@Component({
  selector: 'app-applicant-application-detail',
  templateUrl: './applicant-application-detail.component.html',
  styleUrls: ['./applicant-application-detail.component.scss'],
})
export class ApplicantApplicationDetailComponent implements OnInit, OnDestroy {
  applicationId: string = '';

  // Application metadata passed via router state (from the list view)
  jobTitle: string = '';
  companyName: string = '';
  statusName: string = '';
  jobId: string = '';
  dateApplied: string | null = null;
  hasEmployerMessage: boolean = false;

  // BUGFIX (production): this page used to depend entirely on the
  // application-completeness snapshot endpoint, which reads from a table
  // that never actually existed in production -- every visit here showed
  // "Couldn't load completeness details right now." with no way to see
  // anything about the job itself. Replaced with the real, always-available
  // job record (same one the public job details page uses) so this shows
  // the actual job/company info that matters -- not a fragile scoring
  // feature. "Message employer" was also removed from here (and the list
  // page): the dedicated Messages section already covers that.
  job: any = null;
  loading = true;
  error = false;

  private sub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
  ) {
    // router.getCurrentNavigation() is only valid synchronously during
    // construction — it returns null in ngOnInit (navigation is already
    // complete by then). Read router state here; fall back to
    // window.history.state which persists after navigation completes.
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state ?? (window.history.state ?? {});
    this.jobTitle = state['jobTitle'] ?? '';
    this.companyName = state['companyName'] ?? '';
    this.statusName = state['status'] ?? '';
    this.jobId = state['jobId'] ?? '';
    this.dateApplied = state['dateApplied'] ?? null;
    this.hasEmployerMessage = !!state['hasEmployerMessage'];
  }

  ngOnInit(): void {
    this.applicationId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.applicationId) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.load();
  }

  private load(): void {
    if (!this.jobId) {
      // Arrived here directly (e.g. a bookmark/refresh), not via the list
      // link that carries jobId through router state -- nothing to fetch.
      this.loading = false;
      this.error = true;
      return;
    }

    this.sub = this.jobService.getJobById(this.jobId).subscribe({
      next: (res: any) => {
        this.job = (res && res.data) || res || null;
        this.loading = false;
        this.error = !this.job;
      },
      error: () => {
        this.job = null;
        this.loading = false;
        this.error = true;
      },
    });
  }

  retry(): void {
    this.sub?.unsubscribe();
    this.loading = true;
    this.error = false;
    this.job = null;
    this.load();
  }

  goBack(): void {
    this.router.navigateByUrl('/user/applications');
  }

  // DESIGN OVERHAUL PORT (2026-08-19): same status-chip mapping as
  // applicant-applications.component.ts, kept as a separate copy (not a
  // shared service) since it's a small, presentation-only lookup.
  get locationLabel(): string {
    if (!this.job) return '';
    return [this.job.jobCity, this.job.jobCountry].filter(Boolean).join(', ');
  }

  get statusChipClass(): string {
    const s = (this.statusName || '').toLowerCase();
    if (s.includes('hire')) return 'gh-ap-status-chip--hired';
    if (s.includes('shortlist')) return 'gh-ap-status-chip--shortlisted';
    if (s.includes('reject')) return 'gh-ap-status-chip--rejected';
    if (s.includes('under review')) return 'gh-ap-status-chip--review';
    if (s.includes('pending')) return 'gh-ap-status-chip--pending';
    return 'gh-ap-status-chip--applied';
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
