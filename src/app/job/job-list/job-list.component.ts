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
import { SubscriptionAlertComponent } from '@app-shared/components/subscription-alert/subscription-alert.component';
import * as Model from '../job.model';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss'],
  animations: [mainAnimations],
})
export class JobListComponent implements OnInit {
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

  success$ = this.jobFacade.success$
    .pipe()
    .subscribe(this.afterChange.bind(this));

  loading$ = this.jobFacade.loading$.pipe().subscribe(this.onLoad.bind(this));
  restrictions$ = this.jobFacade.subsRestrictions$
    .pipe().subscribe(this.checkJobRestriction.bind(this));

  req = new Subscription();

  private unsubscribe$ = new Subject<void>();
  public loading: boolean = true;
  public id;
  public displayedColumns: TableHeader[] = displayedColumns;
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
    private currencyPipe: CurrencyPipe
  ) { }

  ngOnInit(): void {
    this.asyncLocalStorage.getItem('user').then((res) => {
      if (res) {
        this.user = JSON.parse(res);
        this.jobFacade.getBasicList(this.user.companyId);
        this.jobFacade.getCompanySubscription(this.user.companyId);
      }
    });

    setTimeout(() => (this.loading = false), 1500);
  }

  checkJobRestriction(subs: Model.CompanySubscriptions) {
    if (subs.jobPost === subs.jobPostCount) {
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

  deleteRow(event) {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        action: 'Delete',
      },
    });

    ref
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result == 1) {
          // TODO delete
          this.jobFacade.changeJobStatus(4, event.hasOwnProperty('data') ? event.data.jobId : event.jobId);
        }
      });
  }

  afterChange(event) {
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
    if (this.req) this.req.unsubscribe();
    this.jobFacade.getBasicList(null);
    this.dialog.closeAll();
  }
}
