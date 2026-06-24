import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApplicantApplicationsService } from '@app-applicant/applicant-applications.service';
import { ApplicationService } from '@app-application/application.service';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';

@Component({
  selector: 'app-applicant-applications',
  templateUrl: './applicant-applications.component.html',
  styleUrls: ['./applicant-applications.component.scss'],
})
export class ApplicantApplicationsComponent implements OnInit, OnDestroy {
  loading = true;
  error = false;
  applications: any[] = [];

  /** Which application's completeness card is expanded (by jobApplicationId) */
  expandedSnapshotId: string | null = null;
  /** Which message thread is expanded (by jobId) */
  expandedJobId: string | null = null;

  snapshotsMap = new Map<string, any>();
  snapshotsLoaded = false;
  snapshotsError = false;

  private appsSub: Subscription | null = null;
  private snapshotsSub: Subscription | null = null;

  constructor(
    private applicationsService: ApplicantApplicationsService,
    private applicationService: ApplicationService,
    private analytics: PublicPortalAnalyticsService,
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
        this.loadSnapshots();
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  private loadSnapshots(): void {
    const ids = this.applications
      .map(app => app.jobApplicationId)
      .filter(Boolean) as string[];

    if (ids.length === 0) {
      this.snapshotsLoaded = true;
      return;
    }

    // The batch endpoint accepts a maximum of 50 IDs per call.
    // Chunk the list and fan out in parallel; merge all results into snapshotsMap.
    const BATCH_LIMIT = 50;
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += BATCH_LIMIT) {
      chunks.push(ids.slice(i, i + BATCH_LIMIT));
    }

    const batchRequests = chunks.map(chunk =>
      this.applicationService.getApplicationSnapshots(chunk).pipe(
        map((res: any) => res?.data?.snapshots ?? {}),
        catchError(() => of({} as Record<string, any>)),
      )
    );

    this.snapshotsSub = forkJoin(batchRequests).subscribe({
      next: (results: Record<string, any>[]) => {
        results.forEach(snapshots =>
          Object.entries(snapshots).forEach(([id, data]) => this.snapshotsMap.set(id, data))
        );
        this.snapshotsLoaded = true;
        this.snapshotsError = false;
      },
      error: () => {
        this.snapshotsLoaded = true;
        this.snapshotsError = true;
      },
    });
  }

  snapshotFor(applicationId: string): any {
    return this.snapshotsMap.get(applicationId) ?? null;
  }

  trackByAppId(_index: number, app: any): string {
    return app?.jobApplicationId ?? String(_index);
  }

  trackByTipReason(_index: number, tip: any): string {
    return tip?.reason ?? String(_index);
  }

  /** Toggle the expanded completeness card for a given application */
  toggleSnapshot(applicationId: string): void {
    if (this.expandedSnapshotId === applicationId) {
      this.expandedSnapshotId = null;
    } else {
      this.expandedSnapshotId = applicationId;
      // Analytics: track that the user opened the completeness detail
      this.analytics.trackApplicationCompletenessViewed(applicationId);
    }
  }

  goToJobs(): void {
    this.router.navigateByUrl('/jobs');
  }

  toggleMessages(jobId: string): void {
    this.expandedJobId = this.expandedJobId === jobId ? null : jobId;
  }

  onSnapshotRetry(): void {
    this.snapshotsSub?.unsubscribe();
    this.snapshotsMap.clear();
    this.snapshotsLoaded = false;
    this.snapshotsError = false;
    this.loadSnapshots();
  }

  retry(): void {
    this.appsSub?.unsubscribe();
    this.snapshotsSub?.unsubscribe();
    this.loading = true;
    this.error = false;
    this.snapshotsMap.clear();
    this.snapshotsLoaded = false;
    this.snapshotsError = false;
    this.expandedSnapshotId = null;
    this.loadData();
  }

  ngOnDestroy(): void {
    this.appsSub?.unsubscribe();
    this.snapshotsSub?.unsubscribe();
  }
}
