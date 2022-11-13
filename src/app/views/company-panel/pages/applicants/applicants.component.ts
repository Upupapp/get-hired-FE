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
  Applicant,
  applicantLists
} from './utils/applicants-model-interface';
import {
  jobLists,  
  Job
} from '../jobs/utils/jobs-model-interface';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TableControlModalComponent } from './dialogs/table-control-modal/table-control-modal.component';
import { InviteApplicantModalComponent } from './dialogs/invite-applicant-modal/invite-applicant-modal.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-applicants',
  animations: [mainAnimations],
  templateUrl: './applicants.component.html',
  styleUrls: ['./applicants.component.scss']
})
export class ApplicantsComponent implements OnInit {
  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public routerUrl: any[] = [];
  public loading: boolean = true;
  public id;
  public displayedColumns: TableHeader[] = displayedColumns;
  public applicantLists: Applicant[] = applicantLists;
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
  public status: string[] = ["Initial Interview", "Technical Interview", "Contract Signing"];
  public jobLists: Job[] = jobLists;  
  public selectedJob: Job;
  public job_id: any;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private location: Location,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar) {

  }

  ngOnInit(): void {
    this.job_id = this.route.snapshot.params['job-id'];  

    this.selectedJob = [...this.jobLists].find(el => el?.id == this.job_id);
    console.log(this.job_id, this.selectedJob)

    this.applicantLists.forEach((el) => {
      el['salary'] = `₱${el?.expected_salary_min.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - ₱${el?.expected_salary_max.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
      el['full_name'] = `${el?.first_name} ${el.last_name}`;
    });

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
        data: {
          job_id: this.job_id,
          ...event
        },
      }
    );

    openDialog
    .afterClosed()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(result => {

    });
  }


  inviteApplicant(event?: any){
    let openDialog = this.dialog.open(
      InviteApplicantModalComponent,
      { 
        width: '34vw',
        data: {
          ...event,  
          title: "Applicant",
          sub_title: "applicant"
        },
      }
    );

    openDialog
    .afterClosed()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(result => {

    });
  }

  goBack(){
    this.location.back()
  }
}
