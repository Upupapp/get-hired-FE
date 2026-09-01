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
  /** Set from a ?applicantId=/?openAnswers=1 deep link (recruiter-interview-hub's
   *  "Review responses") -- passed to app-application-preview so it opens the
   *  video review modal on its own once the applicant's answers load. */
  autoOpenFirstAnswer: boolean = false;
  /** Set from a ?q= deep link (recruiter-interview-hub's "View applicants") --
   *  pre-fills the candidate table's own search box so the list is already
   *  narrowed to this one applicant instead of showing every candidate for
   *  the job and making the recruiter search themselves. */
  initialSearch: string = '';


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

  // AUDIT: previously read once via route.snapshot.params in the
  // constructor. This route ('candidate-list/:id') is reused by Angular's
  // default route-reuse strategy whenever navigating between two
  // candidate-list URLs that only differ by :id (e.g. clicking "Candidates"
  // on a different job while already on this page) -- the component
  // instance survives, the constructor never re-runs, and jobId silently
  // kept pointing at the PREVIOUS job while the URL and rest of the page
  // had already moved on. Tracked so the reactive params subscription in
  // ngOnInit can react to it, plus dedup state for the success/error
  // snackbar re-trigger fix below.
  private lastShownError: any = null;
  private lastShownSuccess: any = null;
  private latestCandidateState: any = null;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    private candidateState: Store<StoreState>,
    private jobService: JobService
    ) { }

  ngOnInit(): void {
    // AUDIT: JSON.parse on a possibly-null/corrupted value threw
    // uncaught, taking down the whole page before it could render
    // anything (including any error state). Mirrors the safe-parse
    // pattern already used elsewhere in this app (e.g. PublicComponent).
    try {
      this.localData = this.localData ? JSON.parse(this.localData) : null;
    } catch (_) {
      this.localData = null;
    }

    // AUDIT: react to route param changes instead of reading them once,
    // so navigating to a different job's candidate list (same routed
    // component, reused instance) re-filters against the new job instead
    // of silently keeping the previous job's data on screen.
    this.route.params
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((params) => {
        this.jobId = params['id'];
        this.applyCandidateListFilter();
      });

    // Deep link from recruiter-interview-hub's "Review responses": jump
    // straight to this applicant's answers instead of landing on the
    // generic candidate table and requiring a manual re-click.
    // route.snapshot.params (not the this.jobId instance field, which is
    // set by a separate subscription with no guaranteed ordering against
    // this one) is always current the moment this callback runs -- both
    // come from the same route snapshot update.
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((queryParams) => {
        const applicantId = queryParams['applicantId'];
        if (applicantId) {
          this.autoOpenFirstAnswer = queryParams['openAnswers'] === '1';
          this.getApplicant(applicantId, this.route.snapshot.params['id']);
        }

        this.initialSearch = queryParams['q'] || '';
      });

    this.getCandidateList();

    this.CandidateData$ = this.candidateState.pipe(select(state => state.candidate));
    this.req =  this.CandidateData$.subscribe((candidate: any) => {
      this.loading = candidate.pending;
      this.latestCandidateState = candidate;
      this.applyCandidateListFilter();

      // AUDIT: the reducer never clears success/error on a fresh
      // GET_CANDIDATE_LIST dispatch, so the same stale value kept
      // re-triggering a snackbar on every unrelated store emission (e.g.
      // reopening the add-candidate dialog) instead of firing once per
      // actual event. Only show a given message the first time it appears.
      if (candidate.success && candidate.success !== this.lastShownSuccess) {
        this.lastShownSuccess = candidate.success;
        this.snackbarService.success(candidate.success, "");
      }

      if (candidate.error && candidate.error !== this.lastShownError) {
        this.lastShownError = candidate.error;
        this.snackbarService.error("Something went wrong please try again later or contact your administrator", "");
      }
    })

    // setTimeout(() => this.loading = false, 1500);
  }

  private applyCandidateListFilter(): void {
    const candidate = this.latestCandidateState;
    if (!candidate || !this.jobId) {
      this.candidateList = [];
      return;
    }

    if (candidate.candidateList && candidate.candidateList.length > 0) {
      // AUDIT: was `this.jobId.includes(item.job_id)` -- a substring
      // check, not equality. job_id values in this app are variable-length
      // slugs (e.g. "JB-26-920673"), not fixed-length UUIDs, so whenever
      // one job's id happened to be a prefix of another's, candidates from
      // the WRONG job leaked into this list. Exact match is the actually
      // intended comparison (one job id per route).
      this.candidateList = candidate.candidateList.filter(
        (item) => item.job_id === this.jobId
      );
    } else {
      this.candidateList = [];
    }
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
      // BUGFIX: width:'34vw' was a fixed viewport fraction with no mobile
      // fallback -- on a phone-width screen 34vw shrinks to ~120px, far too
      // narrow for the panel's content. panelClass + maxWidth gives it a
      // real responsive cap instead (see .candidate-panel-dialog in
      // table-control-modal.component.scss).
      let openDialog = this.dialog.open(TableControlModalComponent, {
        panelClass: 'candidate-panel-dialog',
        width: '92vw',
        maxWidth: '440px',
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

  getApplicant(userId: string, jobId: string = this.jobId) {
    this.jobService.getJobApplicantDetails(jobId, userId)
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
