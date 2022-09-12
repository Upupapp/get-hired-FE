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
} from './utils/jobs-model-interface';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TableControlModalComponent } from './dialogs/table-control-modal/table-control-modal.component';

@Component({
  selector: 'app-jobs',
  animations: [mainAnimations],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {

  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public routerUrl: any[] = [];
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
  public status: string[] = ["Active", "Inactive", "Archived"];
  
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar) {

  }

  ngOnInit(): void {

    this.jobLists.forEach((el) => {
      el['salary'] = `₱${el?.salary_min.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - ₱${el?.salary_max.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
    })

    setTimeout(() => this.loading = false, 1500);
  }


  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }


  viewMenu(event): void {
    let openDialog = this.dialog.open(
      TableControlModalComponent,
      { 
        width: '34vw',
        data: event,
      }
    );

    openDialog
    .afterClosed()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(result => {

    });
  }


  addJobs(){
    this.router.navigate(['/company/jobs/create'])
  }

}
