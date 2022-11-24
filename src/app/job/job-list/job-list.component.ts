import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Subscription,
} from 'rxjs';
import {
  select,
  Store
} from '@ngrx/store';
import {
  displayedColumns,
  selectedColumns,
  TableHeader,
  Job,
  jobLists
} from '../jobs-model-interface';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JobFacade } from '@app-job/state/job.facade';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { TableControlModalComponent } from './dialogs/table-control-modal/table-control-modal.component';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss'],
  animations: [mainAnimations]
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
    }
  };

  user: any;
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

  success$ = this.jobFacade.success$
    .pipe().subscribe(this.afterChange.bind(this));

  loading$ = this.jobFacade.loading$
    .pipe().subscribe(this.onLoad.bind(this));

  private req: Subscription;

  private unsubscribe$ = new Subject<void>();
  public loading: boolean = true;
  public id;
  public displayedColumns: TableHeader[] = displayedColumns;
  public jobLists: Job[] = jobLists;
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

  status: string[] = ["All", "Draft", "Published"];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private jobFacade: JobFacade,
  ) { }

  ngOnInit(): void {
    this.asyncLocalStorage.getItem('user')
      .then(res => {
        if (res) {
          this.user = JSON.parse(res);
          this.jobFacade.getBasicList(this.user.companyId);
        }
      });

    setTimeout(() => this.loading = false, 1500);
  }

  formatSalary(salaryMin, salaryMax, rate) {
    if (salaryMin && salaryMax) {
      return `₱${salaryMin.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - ₱${salaryMax.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (${rate})`
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


  ngOnDestroy(): void {
    if (this.req) this.req.unsubscribe();
  }


  viewMenu(event: any): void {
    let openDialog = this.dialog.open(
      TableControlModalComponent,
      {
        width: '34vw',
        data: event?.data,
      }
    );

    openDialog
    .afterClosed()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(result => {

    });
  }

  deleteRow(event) {

    const ref = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        action: 'Delete'
      }
    });

    ref
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        if (result == 1) {
          // TODO delete
          this.jobFacade.changeJobStatus(4, event.data.jobId);
        }
      });
  }

  afterChange(event) {
    if (event == 'archived') {
      this.jobFacade.getBasicList(this.user.companyId);
      this.snackBar.open(`Job has been Archived`, '', {
        duration: 4000,
        panelClass: 'success-snackbar'
      });
    }
  }

  onLoad(isLoading) {
    this.loading = isLoading;
  }

  addJobs() {
    this.router.navigate(['../create'], { relativeTo: this.route })
  }

}
