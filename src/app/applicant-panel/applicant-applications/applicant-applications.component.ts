import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApplicantApplicationsService } from '@app-applicant/applicant-applications.service';

@Component({
  selector: 'app-applicant-applications',
  templateUrl: './applicant-applications.component.html',
  styleUrls: ['./applicant-applications.component.scss'],
})
export class ApplicantApplicationsComponent implements OnInit, OnDestroy {
  loading = true;
  error = false;
  applications: any[] = [];

  private appsSub: Subscription | null = null;

  constructor(
    private applicationsService: ApplicantApplicationsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.appsSub = this.applicationsService.getMyApplications().subscribe({
      next: (response: any) => {
        this.applications = response?.data ?? response ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  trackByAppId(_index: number, app: any): string {
    return app?.jobApplicationId ?? String(_index);
  }

  // DESIGN OVERHAUL PORT (2026-08-19): maps the real backend status names
  // (gethired.job_applicant_status seed: Pending Review/Applied/Under
  // Review/Shortlisted/Rejected/Hired) to the Employer portal's semantic
  // status-chip color language (see job-create.component.scss's
  // .gh-jc-status-chip -- same neutral/negative/positive palette, applied
  // here as a distinct class so this file never depends on that one).
  // UI-INTERACTION-SEMANTICS: consolidated onto the shared .gh-badge
  // primitive's modifiers (styles.scss) instead of this component's own
  // .gh-ap-status-chip--* duplicate set -- same semantic mapping (hired ->
  // success, rejected -> error, review -> warning, applied -> info,
  // pending -> muted), one shared color system.
  statusChipClass(statusName: string): string {
    const s = (statusName || '').toLowerCase();
    if (s.includes('hire')) return 'gh-badge--success';
    if (s.includes('shortlist')) return 'gh-badge--success';
    if (s.includes('reject')) return 'gh-badge--error';
    if (s.includes('under review')) return 'gh-badge--warning';
    if (s.includes('pending')) return 'gh-badge--muted';
    return 'gh-badge--info';
  }

  trackByTipReason(_index: number, tip: any): string {
    return tip?.reason ?? String(_index);
  }

  goToJobs(): void {
    this.router.navigateByUrl('/jobs');
  }

  retry(): void {
    this.appsSub?.unsubscribe();
    this.loading = true;
    this.error = false;
    this.loadData();
  }

  ngOnDestroy(): void {
    this.appsSub?.unsubscribe();
  }
}
