import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Job } from '@app-job/job.model';
import { TableHeader, displayedColumns, jobLists, selectedColumns } from '@app-job/jobs-model-interface';
import { JobFacade } from '@app-job/state/job.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, map, Subject } from 'rxjs';
import { hasSalaryRange, formatSalaryPeriodSuffix } from '@app-job/utils/job-salary-display';

@Component({
  selector: 'app-job-expired',
  templateUrl: './job-expired.component.html',
  styleUrls: ['./job-expired.component.scss'],
  animations: [mainAnimations]
})
export class JobExpiredComponent implements OnInit {
  asyncLocalStorage = {
    setItem: async function (key, value) {
      await Promise.resolve();
      localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await Promise.resolve();
      return localStorage.getItem(key);
    }
  };

  user$: Subscription;
  list$ = this.jobFacade.jobList$
    .pipe(
      map(list => {
        return (list && list.length != 0) ? list.map(job => {
          return {
            ...job,
            status: this.getJobStatusName(job.jobStatusId),
            salary: this.formatSalary(job.salaryMinimum, job.salaryMaximum, job.rate)
          }
        }) : []
      })
    );

  private req: Subscription;

  private unsubscribe$ = new Subject<void>();
  public loading: boolean = true;
  public id;
  public displayedColumns: TableHeader[] = [
    { col_name: 'jobId', title: this.translate.instant("JOB_POSTS_PAGE.TABLE_COLUMN_ID") },
    { col_name: 'jobTitle', title: this.translate.instant("JOB_POSTS_PAGE.TABLE_COLUMN_TITLE")  },
    { col_name: 'createdAt', title: this.translate.instant("JOB_POSTS_PAGE.TABLE_COLUMN_DATE"), type: 'date'  },
    { col_name: 'jobCity', title: this.translate.instant("JOB_POSTS_PAGE.TABLE_COLUMN_LOCATION")  },
    { col_name: 'workSetupName', title: this.translate.instant("JOB_POSTS_PAGE.TABLE_COLUMN_SETUP")  },
    { col_name: 'jobTypeName', title: this.translate.instant("JOB_POSTS_PAGE.TABLE_COLUMN_TYPE")  },
    { col_name: 'salary', title: this.translate.instant("JOB_POSTS_PAGE.TABLE_COLUMN_SALARY"), type: 'salary'   },
    { col_name: 'status', title: this.translate.instant("JOB_POSTS_PAGE.TABLE_COLUMN_STATUS")  },
    { col_name: 'action', title: this.translate.instant("JOB_POSTS_PAGE.TABLE_COLUMN_ACTION") , type: 'menu' },
  ];
  public listView: boolean = true;
  public selectedColumns: string[] = selectedColumns
  public searchSource: any = (el) => {
    return {
      //id: el.id,
      full_name: el.full_name,

      email: el.email,
      address: el.address,
      contact_number: el.contact_number,
      courses: el.courses,
      company: el.company,
      status: el.status,
    };
  };

  status: string[] = ["All", "Expired", "Archived"];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private jobFacade: JobFacade,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.asyncLocalStorage.getItem('user')
      .then(res => {
        if (res) {
          const user = JSON.parse(res);
          this.jobFacade.getExpiredList(user.companyId);
        }
      });

    setTimeout(() => this.loading = false, 1500);
  }

  formatSalary(salaryMin, salaryMax, rate) {
    // EMP-019 fix: see job-list.component.ts's formatSalary() for the full
    // reasoning -- same defect, same fix.
    if (hasSalaryRange(salaryMin, salaryMax)) {
      return `₱${salaryMin.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - ₱${salaryMax.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${formatSalaryPeriodSuffix(rate)}`
    } else {
      return '-';
    }
  }

  getJobStatusName(statusId: number) {
    switch (statusId) {
      case 1:
        return 'Published';
      case 2:
        return 'Draft';
      case 3:
        return 'Expired';
      case 4:
          return 'Archived';
      default:
        return 'Draft';
    }
  }


  ngOnDestroy(): void {
    if (this.req) this.req.unsubscribe();
  }


  viewMenu(event): void {
    // let openDialog = this.dialog.open(
    //   TableControlModalComponent,
    //   {
    //     width: '34vw',
    //     data: event,
    //   }
    // );

    // openDialog
    // .afterClosed()
    // .pipe(takeUntil(this.unsubscribe$))
    // .subscribe(result => {

    // });
  }


  addJobs() {
    this.router.navigate(['../create'], { relativeTo: this.route })
  }

}
