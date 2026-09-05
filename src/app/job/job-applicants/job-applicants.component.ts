import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobFacade } from '@app-job/state/job.facade';
import { Location, formatDate, DatePipe } from '@angular/common';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { LoadingComponent } from '@app-shared/components/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { map, takeUntil, tap, BehaviorSubject, Subject, combineLatest, catchError, of, Observable, switchMap } from 'rxjs';
import { VideoPreviewComponent } from '@app-shared/components/video-preview/video-preview.component';
import { FileViewerComponent } from '@app-shared/components/file-viewer/file-viewer.component';
import { ApplicantActionModalComponent } from './applicant-action-modal/applicant-action-modal.component';
import * as InterviewModel from '@main/interview/interview.model';
import * as ApplicantModel from '@main/applicant/applicant.model';
import { hasSalaryRange, formatSalaryPeriodSuffix } from '@app-job/utils/job-salary-display';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { JobService } from '@app-job/job.service';
import { SnackbarService } from '@app-core/services/snackbar.service';

export interface TableHeader {
  col_name: string;
  title: string;
  type?: string;
  button_title?: string;
  button_class?: string;
  button_logo?: string;
  params?: string;
}

@Component({
  selector: 'app-job-applicants',
  templateUrl: './job-applicants.component.html',
  styleUrls: ['./job-applicants.component.scss'],
  animations: [mainAnimations]
})
export class JobApplicantsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  jobId: string;
  loading: boolean = true;
  // interviewQuestions: InterviewModel.InterviewQuestion[];
  showProfile: boolean = false;
  applicantProfileId: string;

  // BUGFIX: the "View CV" column button. Tracks which row's resume is
  // currently being fetched so the clicked button can show a loading
  // state instead of appearing to do nothing while the request is in
  // flight (see viewResume() below).
  loadingResumeForUserId: string | null = null;

  // profile:ApplicantModel.Applicant;
  // profileDocs = [];
  // answers = [];

  /** GH-EMP-B01 -- tracks which applicant's detail is open so the detail
   * view can look up the same already-fetched signals the list column
   * uses, without a second HTTP call. Public: also read directly from the
   * template by the message-thread panel (GH-EMP-B04 frontend). */
  selectedApplicantUserId: string | null = null;

  /** Application snapshot summary for the currently viewed applicant.
   * Loaded best-effort when the employer opens an applicant detail panel. */
  snapshotSummary: any = null;
  snapshotSummaryLoading: boolean = false;

  /** Employer Portal v3 -- MATCH v5 Employer Applicant Fit Signals.
   * Fetched separately from the existing applicants$/details$ streams,
   * never replacing them -- if this call fails or is slow, the existing
   * applicant list/detail still works exactly as it did before. Keyed by
   * userId, matching the field job.service.js's mappedBasicApplicantDetails
   * actually returns (not candidate_id -- see the backend fix logged in
   * GETHIRED_EMPLOYER_PORTAL_V3_IMPLEMENTATION_LOG.md). Declared before
   * details$/applicants$ below, which both reference it in their own
   * field initializers -- class fields run in declaration order. */
  private matchSignalsByUserId$ = new BehaviorSubject<Record<string, any>>({});
  private statusOverrides$ = new BehaviorSubject<Record<string, { statusId: number; statusName: string }>>({});

  // profile$ = this.applicantFacade.applicantDetails$;
  details$: Observable<any> = combineLatest([this.jobFacade.details$, this.matchSignalsByUserId$])
    .pipe(
      map(([appl, signalsByUserId]) => {
        if (appl) {
          this.applicantProfileId = appl.profile.applicantProfileId;
        }
        const matchSignals = this.selectedApplicantUserId ? signalsByUserId[this.selectedApplicantUserId] : null;
        return appl ? { ...appl, matchSignals } as any : appl;
      })
    );

  job$ = this.jobFacade.getJobById$;

  applicants$ = combineLatest([this.jobFacade.applicants$, this.matchSignalsByUserId$, this.statusOverrides$])
    .pipe(
      map(([applicants, signalsByUserId, statusOverrides]) => {
        return applicants.map(applicant => {
          const appId = (applicant as any).applicationId;
          const override = appId ? statusOverrides[appId] : null;
          const fitSignals = signalsByUserId[(applicant as any).userId];
          return {
            ...applicant,
            jobApplicationStatusId: override ? override.statusId : (applicant as any).jobApplicationStatusId,
            jobApplicationStatusName: override ? override.statusName : (applicant as any).jobApplicationStatusName,
            fullName: applicant.firstName + ' ' + applicant.lastName,
            salary: this.formatSalary(applicant.salaryMinimum, applicant.salaryMaximum, 'Monthly'),
            dateApplied: this.datePipe.transform(applicant.dateApplied, 'medium'),
            address: applicant.city + ', ' + applicant.country,
            matchSignalLabel: fitSignals ? fitSignals.label : 'No signal data',
          }
        })
      })
    );
  loading$ = this.jobFacade.getJobLoading$
    .pipe().subscribe(this.formLoading.bind(this));

  displayedColumns: TableHeader[] = [
    { col_name: 'applicantProfileId', title: 'Applicant Id' },
    { col_name: 'fullName', title: 'Full Name' },
    { col_name: 'dateApplied', title: 'Date Applied' },
    { col_name: 'address', title: 'Location' },
    { col_name: 'workSetupName', title: 'Work Setup' },
    { col_name: 'jobTypeName', title: 'Type' },
    { col_name: 'salary', title: 'Expected Salary', type: 'salary' },
    {
      col_name: 'cv_link',
      title: 'CV',
      button_title: 'View CV',
      button_class: 'cv-link',
      button_logo: '/assets/images/placeholder/icons/cv.png',
      type: 'action_button',
      params: 'videoCVUrl'
    },
    { col_name: 'jobApplicationStatusName', title: 'Status' },
    { col_name: 'matchSignalLabel', title: 'Match Signal' },
    { col_name: 'action', title: 'Action', type: 'menu' },
  ];

  selectedColumns: string[] =  [
    'applicantProfileId',
    'fullName',
    'dateApplied',
    'address',
    'salary',
    'cv_link',
    'jobApplicationStatusName',
    'matchSignalLabel',
    'action'
  ];

  searchSource: any = (el) => {
    return {
      fullName: el.fullName,
      address: el.address,
      status: el.jobApplicationStatusName,
    };
  };

  constructor(
    private jobFacade: JobFacade,
    private router: Router,
    public route: ActivatedRoute,
    private location: Location,
    private loadingDialog: MatDialog,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private applicantFacade: ApplicantFacade,
    private jobService: JobService,
    private snackbarService: SnackbarService
  ) {
    this.route.queryParams.subscribe(params => {
      this.jobId = params.id
    });
  }

  ngOnInit(): void {
    this.jobFacade.getJobById(this.jobId);
    this.jobFacade.getApplicants(this.jobId);
    this.loadMatchSignals();
  }

  /** Employer Portal v3 -- best-effort fetch, never blocks or breaks the
   * existing applicant list if it fails (e.g. employer not yet recognized
   * as the owning company, or the endpoint erroring) -- every applicant
   * just shows "Match signals unavailable" instead, per
   * GETHIRED_MATCH_V5_EMPLOYER_FIT_SIGNALS_SPEC.md's fallback rule. */
  private loadMatchSignals(): void {
    this.jobService.getJobApplicantSignals(this.jobId)
      .pipe(
        map((res: any) => res.data as any[]),
        catchError(() => of([]))
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((applicantsWithSignals) => {
        const byUserId: Record<string, any> = {};
        (applicantsWithSignals || []).forEach((a) => {
          if (a && a.userId) {
            byUserId[a.userId] = a.fitSignals;
          }
        });
        this.matchSignalsByUserId$.next(byUserId);
      });
  }

  private loadSnapshotSummary(applicationId: string): void {
    this.snapshotSummary = null;
    this.snapshotSummaryLoading = true;
    this.jobService.getApplicantSnapshotSummary(applicationId)
      .pipe(
        map((res: any) => res?.data),
        catchError(() => of(null))
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.snapshotSummary = data;
        this.snapshotSummaryLoading = false;
      });
  }

  /** GH-EMP-B02 -- only show the disclaimer when there's an actual signal
   * to disclaim; a row's fallback label ("No signal data") has
   * nothing for the disclaimer to apply to. */
  hasAnyMatchSignal(applicants: any[]): boolean {
    return (applicants || []).some(a => a.matchSignalLabel && a.matchSignalLabel !== 'No signal data');
  }

  redirectTo(url) {
    this.router.navigateByUrl(url);
  }

  goBack() {
    if(this.showProfile) {
      this.showProfile = false;
    } else {
      this.location.back()
    }
  }

  formLoading(loading: boolean) {
    this.loading = loading;
    if (loading) {
      const ref = this.loadingDialog.open(LoadingComponent, {
        disableClose: true,
        data: {
          selfClose: false
        }
      });
    } else {
      setTimeout(() => this.loadingDialog.closeAll(), 2000);
    }
  }

  // Video CV preview (the applicant's recorded introduction) -- called
  // from ApplicantActionModalComponent's "Video CV" menu action with a
  // plain URL string. Unrelated to viewResume() below (the actual CV/
  // Resume document) -- left untouched.
  viewCv(event) {
    if(event) {
      let dialog = this.dialog.open(VideoPreviewComponent, {
        width: '92vw',
        maxWidth: '920px',
        panelClass: 'video-preview-panel',
        data: {
          url: event
        }
      });
    }
  }

  // BUGFIX: the "View CV" column button was wired to (actionOfButton),
  // an EventEmitter reusable-table.component.ts's btnAction() would emit
  // it from -- but btnAction() is never called anywhere in that
  // component's own template. The action_button click actually emits
  // customButtonEvent (via customButtonFunction()), which nothing in
  // this component was listening for -- so the button did nothing at
  // all, for every applicant, regardless of whether they had a CV.
  //
  // Separately, even correctly wired, this button was bound to
  // videoCVUrl and opened VideoPreviewComponent -- a <video> player --
  // for what's actually a PDF/DOCX resume, which doesn't play as a
  // video and would have looked broken for any applicant who *did* have
  // a real CV on file.
  //
  // Now: fetches the applicant's real Resume document (already exposed
  // by GET /job/applicantdetails, the same endpoint the "View profile"
  // detail panel below already calls) and opens it in FileViewerComponent
  // -- the same PDF/DOCX/image preview-with-download panel already
  // shipped for the applicant's own document view and the employer's
  // "View profile" panel (app-application-preview's viewDoc()).
  viewResume(event): void {
    const row = event?.data;
    if (!row?.userId || this.loadingResumeForUserId) {
      return;
    }

    this.loadingResumeForUserId = row.userId;
    this.jobService.getJobApplicantDetails(this.jobId, row.userId).subscribe({
      next: (res: any) => {
        this.loadingResumeForUserId = null;
        const resume = res?.data?.profileDocs?.resume?.[0];
        if (!resume?.fileurl) {
          this.snackbarService.info('This candidate hasn\'t uploaded a CV/Resume yet.', '', 4000);
          return;
        }
        this.dialog.open(FileViewerComponent, {
          width: '60vw',
          height: '80vh',
          data: resume,
        });
      },
      error: () => {
        this.loadingResumeForUserId = null;
        this.snackbarService.error('We couldn\'t load this candidate\'s CV right now. Please try again.', '');
      },
    });
  }

  viewMenu(event): void {
    let openDialog = this.dialog.open(
      ApplicantActionModalComponent,
      {
        width: 'min(560px, 95vw)',
        data: {
          job_id: this.jobId,
          ...event
        },
      }
    );

    openDialog
    .afterClosed()
    .pipe()
    .subscribe(result => {
      if(result && result.view) {
        this.viewCv(result.data.data.videoCVUrl)
      }

      if(result && result.profile) {
        this.selectedApplicantUserId = result.data.data.userId;
        this.jobFacade.getApplicantsDetails(this.jobId, result.data.data.userId);
        this.showProfile = true;

        // Always clear the previous applicant's snapshot card before loading
        // the next one. Without this reset, a previously loaded snapshot
        // persists if the next applicant has no applicationId (STITCH Fix F2).
        this.snapshotSummary = null;
        this.snapshotSummaryLoading = false;
        const appId = result.data.data.applicationId;
        if (appId) {
          this.loadSnapshotSummary(appId);
        }
      }

      if (result && result.statusUpdated && result.applicationId) {
        const current = this.statusOverrides$.getValue();
        this.statusOverrides$.next({
          ...current,
          [result.applicationId]: { statusId: result.newStatusId, statusName: result.newStatusName }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatSalary(salaryMin, salaryMax, rate) {
    // EMP-019 fix: see job-list.component.ts's formatSalary() for the full
    // reasoning -- same defect class, same fix (this call site currently
    // always passes the literal 'Monthly', so "(null)" can't occur here
    // today, but this stays consistent/defensive with the other two
    // surfaces sharing this exact pattern).
    if (hasSalaryRange(salaryMin, salaryMax)) {
      return `₱${salaryMin
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')} - ₱${salaryMax
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${formatSalaryPeriodSuffix(rate)}`;
    } else {
      return '-';
    }
  }

}
