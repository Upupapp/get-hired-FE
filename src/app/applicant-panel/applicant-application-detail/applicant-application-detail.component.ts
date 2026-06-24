import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApplicationService } from '@app-application/application.service';

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

  snapshot: any = null;
  loading = true;
  error = false;

  private sub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
  ) {}

  ngOnInit(): void {
    this.applicationId = this.route.snapshot.paramMap.get('id') ?? '';

    // Read app metadata from router navigation state (populated when navigating from the list).
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state ?? (window.history.state ?? {});
    this.jobTitle = state['jobTitle'] ?? '';
    this.companyName = state['companyName'] ?? '';
    this.statusName = state['status'] ?? '';

    if (!this.applicationId) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.load();
  }

  private load(): void {
    this.sub = this.applicationService.getApplicationSnapshot(this.applicationId).pipe(
      map((res: any) => res?.data ?? null),
      catchError(() => of(null)),
    ).subscribe(data => {
      this.snapshot = data;
      this.loading = false;
      this.error = data === null;
    });
  }

  retry(): void {
    this.sub?.unsubscribe();
    this.loading = true;
    this.error = false;
    this.snapshot = null;
    this.load();
  }

  goBack(): void {
    this.router.navigateByUrl('/user/applications');
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
