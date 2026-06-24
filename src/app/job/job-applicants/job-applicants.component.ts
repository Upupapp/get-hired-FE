import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobFacade } from '@app-job/state/job.facade';
import { Location, formatDate, DatePipe } from '@angular/common';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { LoadingComponent } from '@app-shared/components/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { map, takeUntil, tap, BehaviorSubject, combineLatest, catchError, of, Observable } from 'rxjs';
import { VideoPreviewComponent } from '@app-shared/components/video-preview/video-preview.component';
import { ApplicantActionModalComponent } from './applicant-action-modal/applicant-action-modal.component';
import * as InterviewModel from '@main/interview/interview.model';
import * as ApplicantModel from '@main/applicant/applicant.model';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { JobService } from '@app-job/job.service';

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
export class JobApplicantsComponent implements OnInit {
  jobId: string;
  loading: boolean = true;
  // interviewQuestions: InterviewModel.InterviewQuestion[];
  showProfile: boolean = false;
  applicantProfileId: string;

  // profile:ApplicantModel.Applicant;
  // profileDocs = [];
  // answers = [];

  /** GH-EMP-B01 -- tracks which applicant's detail is open so the detail
   * view can look up the same already-fetched signals the list column
   * uses, without a second HTTP call. Public: also read directly from the
   * template by the message-thread panel (GH-EMP-B04 frontend). */
  selectedApplicantUserId: string | null = null;

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

  applicants$ = combineLatest([this.jobFacade.applicants$, this.matchSignalsByUserId$])
    .pipe(
      map(([applicants, signalsByUserId]) => {
        return applicants.map(applicant => {
          const fitSignals = signalsByUserId[(applicant as any).userId];
          return {
            ...applicant,
            fullName: applicant.firstName + ' ' + applicant.lastName,
            salary: this.formatSalary(applicant.salaryMinimum, applicant.salaryMaximum, 'Monthly'),
            dateApplied: this.datePipe.transform(applicant.dateApplied, 'medium'),
            address: applicant.city + ', ' + applicant.country,
            matchSignalLabel: fitSignals ? fitSignals.label : 'Match signals unavailable',
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
    private jobService: JobService
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

  /** GH-EMP-B02 -- only show the disclaimer when there's an actual signal
   * to disclaim; a row's fallback label ("Match signals unavailable") has
   * nothing for the disclaimer to apply to. */
  hasAnyMatchSignal(applicants: any[]): boolean {
    return (applicants || []).some(a => a.matchSignalLabel && a.matchSignalLabel !== 'Match signals unavailable');
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

  inviteApplicant() {
    // TODO
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

  viewCv(event) {
    if(event) {
      let dialog = this.dialog.open(VideoPreviewComponent, {
        width: '50vw',
        data: {
          url: event
        }
      });
    }
  }

  viewMenu(event): void {
    console.log(event);
    let openDialog = this.dialog.open(
      ApplicantActionModalComponent,
      {
        width: '34vw',
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
      }
    });
  }

  formatSalary(salaryMin, salaryMax, rate) {
    if (salaryMin && salaryMax) {
      return `₱${salaryMin
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')} - ₱${salaryMax
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')} (${rate})`;
    } else {
      return '-';
    }
  }

}
