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
    this.sub = this.applicationService.getApplicationSnapshot(this.applicationId).pipe(
      // Discriminate HTTP error from legitimate null-data (pre-deployment app).
      // { data: null, error: false } → card shows its "unavailable" state, no retry.
      // { data: null, error: true  } → component shows error+retry block.
      map((res: any) => ({ data: res?.data ?? null, error: false })),
      catchError(() => of({ data: null, error: true })),
    ).subscribe(({ data, error }) => {
      this.snapshot = data;
      this.loading = false;
      this.error = error;
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
