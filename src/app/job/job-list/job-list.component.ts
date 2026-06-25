import { Component, OnInit, OnDestroy } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import {
  displayedColumns,
  selectedColumns,
  TableHeader,
  Job,
  jobLists,
} from '../jobs-model-interface';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JobFacade } from '@app-job/state/job.facade';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { TableControlModalComponent } from './dialogs/table-control-modal/table-control-modal.component';
import { UpdatedDialogComponent } from '@app-shared/components/updated-dialog/updated-dialog.component';
import { CurrencyPipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionAlertComponent } from '@app-shared/components/subscription-alert/subscription-alert.component';

import * as Model from '../job.model';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss'],
  animations: [mainAnimations],
})
export class JobListComponent implements OnInit, OnDestroy {
  asyncLocalStorage = {
    setItem: async function (key, value) {
      await Promise.resolve();
      localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await Promise.resolve();
      return localStorage.getItem(key);
    },
  };

  user: any;
  user$: Subscription;
  list$ = this.jobFacade.jobList$.pipe(
    map((list) => {
      return list && list.length != 0
        ? list.map((job) => {
          return {
            ...job,
            status: this.getJobStatusName(job.jobStatusId),
            salary: this.formatSalary(
              job.salaryMinimum,
              job.salaryMaximum,
              job.rate,
              job.salaryCurrency
            ),
          };
        })
        : [];
    })
  );

  // OPTIMIZE: success$, loading$, restrictions$ moved into ngOnInit so they
  // are tracked in req and cleaned up in ngOnDestroy. Class-field subscriptions
  // (the former auto-subscribe pattern used here) have no unsubscribe path and
  // leak on every component destroy (route change, tab switch, etc.).

  req = new Subscription();

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
  public jobLists: Job[] = jobLists;
  public listView: boolean = true;
  public selectedColumns: string[] = selectedColumns;
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

  isAllowed: boolean = true;
  status: string[] = ['All', 'Draft', 'Published'];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private jobFacade: JobFacade,
    private currencyPipe:CurrencyPipe,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.asyncLocalStorage.getItem('user').then((res) => {
      if (res) {
        this.user = JSON.parse(res);
        this.jobFacade.getBasicList(this.user.companyId);
        this.jobFacade.getCompanySubscription(this.user.companyId);
      }
    });

    // OPTIMIZE: wired into req so they are cleaned up in ngOnDestroy.
    this.req.add(
      this.jobFacade.success$
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(this.afterChange.bind(this))
    );

    this.req.add(
      this.jobFacade.loading$
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(this.onLoad.bind(this))
    );

    this.req.add(
      this.jobFacade.subsRestrictions$
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(this.checkJobRestriction.bind(this))
    );

    // QA8 BRAND FIX-B: surface changeJobStatusFail and deleteJobFail errors.
    // P2 FIX: deleteJobFail also writes to jobError$ with the normalised
    // error string from the effect (covers 403/404 responses). The generic
    // copy below is a fallback; the BE's own error message is shown when
    // available — e.g. "Job not found or you do not have access."
    this.req.add(
      this.jobFacade.jobError$.pipe(takeUntil(this.unsubscribe$)).subscribe((err) => {
        if (err) {
          const msg = typeof err === 'string' ? err
            : 'We couldn\'t delete this job. It may no longer exist or you may not have access.';
          this.snackBar.open(msg, '', {
            duration: 4000,
            panelClass: ['danger-snackbar'],
          });
        }
      })
    );

    setTimeout(() => (this.loading = false), 1500);
  }

  checkJobRestriction(subs: Model.CompanySubscriptions) {
    if (subs && subs.jobPost === subs.jobPostCount) {
      this.isAllowed = false;
    }
  }

  getCompanyRestrictions() {
    if (this.isAllowed) {
      this.router.navigate(['../create'], { relativeTo: this.route });
    } else {
      this.restrictJobCreation(false);
    }
  }

  formatSalary(salaryMin, salaryMax, rate, currency) {
    if (salaryMin && salaryMax) {
      const min = this.currencyPipe.transform(salaryMin, currency, 'symbol');
      const max = this.currencyPipe.transform(salaryMax, currency, 'symbol');
      return `${min
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')} - ${max
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',')} (${rate})`;
    } else {
      return '-';
    }
  }

  getJobStatusName(statusId: number) {
    switch (statusId) {
      case 1:
        return 'Draft';
      case 2:
        return 'Published';
      case 3:
        return 'Expired';
      case 4:
        return 'Archived';
      default:
        return 'Draft';
    }
  }

  viewMenu(event: any): void {
    let openDialog = this.dialog.open(TableControlModalComponent, {
      width: '34vw',
      data: event?.data,
    });

    openDialog
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        console.log(result);
        if (result) {
          this.deleteRow(result)
        }
      });
  }

  // P2 FIX: deleteRow now dispatches the real DELETE /job/delete endpoint
  // instead of changeJobStatus(4). The confirmation dialog copy is updated to
  // be unambiguous about permanent deletion. The delete button is implicitly
  // disabled while the request is in flight because loading$ drives the
  // reusable-table's disabled state via the existing loading binding.
  deleteRow(event) {
    const jobId = event.hasOwnProperty('data') ? event.data.jobId : event.jobId;

    // BRAND AUDIT FIX-4: pass destructive:true so the dialog renders the
    // danger-red CTA instead of the standard brand-red btn-primary. This
    // signals irreversibility visually without a second warning modal.
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        action: 'Delete job',
        message: 'This action cannot be undone.',
        destructive: true,
      },
    });

    ref
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result == 1) {
          this.jobFacade.deleteJobPost(jobId);
        }
      });
  }

  afterChange(event) {
    if (event === 'deleted') {
      // P2 FIX: success path for true delete. List is already updated by the
      // reducer (BE returns the refreshed list). Show confirmation toast.
      this.snackBar.open('Job deleted.', '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
      });
      setTimeout(() => this.dialog.closeAll(), 400);
      return;
    }

    if (event == 'archived') {
      this.jobFacade.getBasicList(this.user.companyId);

      this.dialog.open(UpdatedDialogComponent, {
        disableClose: true,
        data: 'Job has been archived',
      });
    }

    setTimeout(() => this.dialog.closeAll(), 2000);
  }

  onLoad(isLoading) {
    this.loading = isLoading;
  }

  restrictJobCreation(restriction) {
    let openChecker = this.dialog.open(
      SubscriptionAlertComponent,
      {
        width: '34vw',
        data: {
          isError: restriction
        }
      }
    );

    this.req.add(
      openChecker
        .afterClosed()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(result => {
          if (result == 1) {
            this.router.navigate(['../../subscription'], { relativeTo: this.route })
          } else {
            this.router.navigate(['../create'], { relativeTo: this.route });
          }
        })
    );
  }


  ngOnDestroy(): void {
    // QA10 FIX-10: complete the Subject so takeUntil(this.unsubscribe$)
    // actually tears down the jobError$ subscription added in ngOnInit.
    // Previously only req.unsubscribe() was called, leaving the Subject open.
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.req) this.req.unsubscribe();
    this.jobFacade.getBasicList(null);
    this.dialog.closeAll();
  }
}
