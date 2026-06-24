import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApplicantApplicationsService } from '@app-applicant/applicant-applications.service';
import { ApplicationService } from '@app-application/application.service';

@Component({
  selector: 'app-applicant-applications',
  templateUrl: './applicant-applications.component.html',
  styleUrls: ['./applicant-applications.component.scss'],
})
export class ApplicantApplicationsComponent implements OnInit {
  loading = true;
  error = false;
  applications: any[] = [];
  expandedJobId: string | null = null;

  snapshotsMap = new Map<string, any>();
  snapshotsLoaded = false;

  constructor(
    private applicationsService: ApplicantApplicationsService,
    private applicationService: ApplicationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.applicationsService.getMyApplications().subscribe({
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
    const appsWithIds = this.applications.filter(app => !!app.jobApplicationId);
    if (appsWithIds.length === 0) {
      this.snapshotsLoaded = true;
      return;
    }

    const calls = appsWithIds.map(app =>
      this.applicationService.getApplicationSnapshot(app.jobApplicationId).pipe(
        map((res: any) => ({ id: app.jobApplicationId, data: res?.data ?? null })),
        catchError(() => of({ id: app.jobApplicationId, data: null }))
      )
    );

    forkJoin(calls).subscribe(results => {
      results.forEach(({ id, data }) => this.snapshotsMap.set(id, data));
      this.snapshotsLoaded = true;
    });
  }

  snapshotFor(applicationId: string): any {
    return this.snapshotsMap.get(applicationId) ?? null;
  }

  goToJobs(): void {
    this.router.navigateByUrl('/jobs');
  }

  toggleMessages(jobId: string): void {
    this.expandedJobId = this.expandedJobId === jobId ? null : jobId;
  }

  retry(): void {
    this.loading = true;
    this.error = false;
    this.snapshotsMap.clear();
    this.snapshotsLoaded = false;
    this.ngOnInit();
  }
}
