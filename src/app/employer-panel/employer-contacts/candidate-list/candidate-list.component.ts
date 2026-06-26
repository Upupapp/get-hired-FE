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
  Candidate,
  candidateList
} from './utils/candidate-model-interface';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { ImportAddCandidateComponent } from './dialogs/import-add-candidate/import-add-candidate.component';
import { CandidateActionTypes } from '@main/shared/store/actions/candidate.action';
import { StoreState } from '@main/shared/store/index';
import { TableControlModalComponent } from './dialogs/table-control-modal/table-control-modal.component';
import { JobService } from '@app-job/job.service';
import * as InterviewModel from '@main/interview/interview.model';
import * as ApplicantModel from '@main/applicant/applicant.model';

@Component({
  selector: 'app-candidate-list',
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss'],
  animations: [mainAnimations]
})
export class CandidateListComponent implements OnInit {
  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public routerUrl: any[] = [];
  public loading: boolean = true;
  public id;
  public localData: any = localStorage.getItem('user');
  public CandidateData$: any;
  public jobId: string;

  interviewQuestions: InterviewModel.InterviewQuestion[];
  showProfile: boolean = false;
  profile:ApplicantModel.Applicant;
  profileDocs = [];
  answers = [];


  public displayedColumns: TableHeader[] = displayedColumns;
  public candidateList: Candidate[] = [];
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
    };
  };

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    private candidateState: Store<StoreState>,
    private jobService: JobService
    ) {
      this.jobId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.localData = JSON.parse(this.localData);
    this.getCandidateList();

    this.CandidateData$ = this.candidateState.pipe(select(state => state.candidate));
    this.req =  this.CandidateData$.subscribe((candidate: any) => {
      this.loading = candidate.pending;

      if(candidate.candidateList.length > 0){
        const result = candidate.candidateList.filter(item => this.jobId.includes(item.job_id));
        this.candidateList = result;
      } else {
        this.candidateList = [];
      }

      if(candidate.success){
        this.snackbarService.success(candidate.success, "");
      }

      if(candidate.error){
        this.snackbarService.error("Something went wrong please try again later or contact your administrator", "");
      }
    })

    // setTimeout(() => this.loading = false, 1500);
  }


  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }

  addCandidate(){
    let dialog = this.dialog.open(ImportAddCandidateComponent, {
      width: '40vw',
      maxHeight: '90vh',
      //data: this.data,
    });

    dialog
    .afterClosed()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(result => {
      // console.log("test if parent function will be called affter closing modal");
      this.getCandidateList();
      if(result){
        // console.log(result, "test")
      }
    });
  }

  getCandidateList(){
    this.candidateState.dispatch({
      type:CandidateActionTypes.GET_CANDIDATE_LIST,
      payload: this.localData.companyId
    });
  }

  viewMenu(event: any): void {
    if(event?.data.status !== 'imported') {
      let openDialog = this.dialog.open(TableControlModalComponent, {
        width: '34vw',
        data: event?.data,
      });

      openDialog
        .afterClosed()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(result => {
          if(result && result.profile) {
            this.getApplicant(result.data.candidate_id);
          }
        });
    }
  }

  getApplicant(userId: string) {
    this.jobService.getJobApplicantDetails(this.jobId, userId)
      .pipe().subscribe(res => {
        if(res.data) {
          this.profile = res.data.profile;
          this.interviewQuestions = res.data.interviewQuestions;
          this.profileDocs = res.data.profileDocs;
          this.showProfile = true;
          this.answers = res.data.answers;
        }
      })
  }

}
