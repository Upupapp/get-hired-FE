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
} from './utils/jobs-opening-model-interface';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ApplicantJobsFacade} from './state/applicant-jobs.facade'


@Component({
  selector: 'app-applicant-jobs',
  templateUrl: './applicant-jobs.component.html',
  styleUrls: ['./applicant-jobs.component.scss'],
  animations: [mainAnimations]
})
export class ApplicantJobsComponent implements OnInit {

  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public routerUrl: any[] = [];
  public loading: boolean = true;
  public id;
  public displayedColumns: TableHeader[] = displayedColumns;
  public jobLists: any[] = [];
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
  public user: any = localStorage.getItem('user');

  pageLoad$ = this.applicantJobsFacade.loading$
  .pipe().subscribe(this.checkLoading.bind(this));

  jobList$ = this.applicantJobsFacade.applicantJobs$;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private applicantJobsFacade: ApplicantJobsFacade,
    private snackBar: MatSnackBar) {

  }

  ngOnInit(): void {
    this.user = JSON.parse(this.user);
    this.applicantJobsFacade.getApplicantJobs(this.user?._id);
    this.jobList$.subscribe((data: any) => {
      console.log(data);
    });

  }


  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }


  viewDetails(id): void {
    this.router.navigate([`/applicant/jobs/details/${id}`])  
  }


  addJobs(){
    this.router.navigate(['/company/jobs/create'])
  }

  checkLoading(isLoading: boolean){
    this.loading = isLoading;
  }

}
