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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { CandidateActionTypes } from '@main/shared/store/actions/candidate.action';
import { StoreState } from '@main/shared/store/index';
import {
  displayedColumns,
  selectedColumns,
  TableHeader,
  JobList,
  candidateJobList
} from './utils/job-list-model-interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss'],
  animations: [mainAnimations]
})
export class JobListComponent implements OnInit {

  public loading: boolean = true;
  public localData: any = localStorage.getItem('user');

  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public JobListData$: any;

  public displayedColumns: TableHeader[] = [
    { col_name: 'jobId', title: 'Job Id' },
    { col_name: 'jobTitle', title: 'Title' },
    { col_name: 'jobCity', title: 'Location' },
    { col_name: 'workSetupName', title: 'Work Setup' },
    { col_name: 'jobTypeName', title: 'Type' },
    { col_name: 'salaryMinimum', title: this.translate.instant('CONTACTS_CANDIDATES.TABLE_COLUMN_MIN_SALARY') },
    { col_name: 'salaryMaximum', title: this.translate.instant('CONTACTS_CANDIDATES.TABLE_COLUMN_MAX_SALARY') },
    { col_name: 'action', title: 'Action' , type: 'menu' },
  ];

  public jobList: JobList[] = [];
  public listView: boolean = true;
  public selectedColumns: string[] = selectedColumns
  public searchSource: any = (el) => {
    return {
      id: el.id,
      name: el.name
    };
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    private candidateState: Store<StoreState>,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.localData = JSON.parse(this.localData);
    this.getCandidateJobList();

    this.JobListData$ = this.candidateState.pipe(select(state => state.candidate));
    this.req =  this.JobListData$.subscribe((candidate: any) => {
      this.loading = candidate.pending;

      if(candidate.jobId.length > 0){
        this.jobList = candidate.jobId;
        console.log("job list", this.jobList)
      } else {
        this.jobList = [];
      }

      if(candidate.success){
        this.snackbarService.success(candidate.success, "");
      }

      if(candidate.error){
        this.snackbarService.error("Something went wrong please try again later or contact your administrator", "");
      }
    })
  }

  getCandidateJobList() {
    this.candidateState.dispatch({
      type:CandidateActionTypes.GET_CANDIDATE_JOB,
      payload: this.localData.companyId
    });
  }

  viewMenu(event: any): void {
    this.router.navigateByUrl(`/recruiter/contacts/candidate-list/${event?.data?.jobId}`);
  }


}
