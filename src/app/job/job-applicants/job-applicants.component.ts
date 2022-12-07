import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobFacade } from '@app-job/state/job.facade';
import { Location, formatDate, DatePipe } from '@angular/common';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { LoadingComponent } from '@app-shared/components/loading/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs';
import { VideoPreviewComponent } from '@app-shared/components/video-preview/video-preview.component';

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

  job$ = this.jobFacade.getJobById$;
  applicants$ = this.jobFacade.applicants$
    .pipe(
      map(applicants => {
        return applicants.map(applicant => {
          return {
            ...applicant,
            fullName: applicant.firstName + ' ' + applicant.lastName,
            salary: this.formatSalary(applicant.salaryMinimum, applicant.salaryMaximum, 'Monthly'),
            dateApplied: this.datePipe.transform(applicant.dateApplied, 'medium'),
            address: applicant.city + ', ' + applicant.country
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
    // { col_name: 'action', title: 'Action', type: 'menu' },
  ];

  selectedColumns: string[] =  [
    'applicantProfileId',
    'fullName',
    'dateApplied',
    'address',
    'salary',
    'cv_link',
    'jobApplicationStatusName',
    // 'action'
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
    private dialog: MatDialog
  ) {
    this.route.queryParams.subscribe(params => {
      this.jobId = params.id
    });
  }

  ngOnInit(): void {
    this.jobFacade.getJobById(this.jobId);
    this.jobFacade.getApplicants(this.jobId);
  }

  redirectTo(url) {
    this.router.navigateByUrl(url);
  }

  goBack() {
    this.location.back()
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
    // let openDialog = this.dialog.open(
    //   TableControlModalComponent,
    //   {
    //     width: '34vw',
    //     data: {
    //       job_id: this.job_id,
    //       ...event
    //     },
    //   }
    // );

    // openDialog
    // .afterClosed()
    // .pipe(takeUntil(this.unsubscribe$))
    // .subscribe(result => {

    // });
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
