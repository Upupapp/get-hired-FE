import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApplicantApplicationsService } from '@app-applicant/applicant-applications.service';
import { ApplicationService } from '@app-application/application.service';

@Component({
  selector: 'app-applicant-applications',
  templateUrl: './applicant-applications.component.html',
  styleUrls: ['./applicant-applications.component.scss'],
})
export class ApplicantApplicationsComponent implements OnInit, OnDestroy {
  loading = true;
  error = false;
  applications: any[] = [];
  expandedJobId: string | null = null;

  snapshotsMap = new Map<string, any>();
  snapshotsLoaded = false;

  private appsSub: Subscription | null = null;
  private snapshotsSub: Subscription | null = null;

  constructor(
    private applicationsService: ApplicantApplicationsService,
    private applicationService: ApplicationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
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

    this.snapshotsSub = forkJoin(batchRequests).subscribe((results: Record<string, any>[]) => {
      results.forEach(snapshots =>
        Object.entries(snapshots).forEach(([id, data]) => this.snapshotsMap.set(id, data))
      );
      this.snapshotsLoaded = true;
    });
  }

  snapshotFor(applicationId: string): any {
    return this.snapshotsMap.get(applicationId) ?? null;
  }

  trackByTipReason(_index: number, tip: any): string {
    return tip?.reason ?? String(_index);
  }

  goToJobs(): void {
    this.router.navigateByUrl('/jobs');
  }

  toggleMessages(jobId: string): void {
    this.expandedJobId = this.expandedJobId === jobId ? null : jobId;
  }

  retry(): void {
    this.appsSub?.unsubscribe();
    this.snapshotsSub?.unsubscribe();
    this.loading = true;
    this.error = false;
    this.snapshotsMap.clear();
    this.snapshotsLoaded = false;
    this.ngOnInit();
  }

  ngOnDestroy(): void {
    this.appsSub?.unsubscribe();
    this.snapshotsSub?.unsubscribe();
  }
}
