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
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImportAddCandidateComponent } from './dialogs/import-add-candidate/import-add-candidate.component';
import { CandidateActionTypes } from '@main/shared/store/actions/candidate.action';
import { StoreState } from '@main/shared/store/index';

@Component({
  selector: 'app-candidate-list',
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss']
})
export class CandidateListComponent implements OnInit {
  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public routerUrl: any[] = [];
  public loading: boolean = true;
  public id;
  public localData: any = localStorage.getItem('user');
  public CandidateData$: any;

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
    private snackBar: MatSnackBar,
    private candidateState: Store<StoreState>
    ) {

  }

  ngOnInit(): void {
    this.localData = JSON.parse(this.localData);
    this.getCandidateList();

    this.CandidateData$ = this.candidateState.pipe(select(state => state.candidate));
    this.req =  this.CandidateData$.subscribe((candidate: any) => {
      this.loading = candidate.pending;

      if(candidate.candidateList.length > 0){
        this.candidateList = candidate.candidateList;
      } else {
        this.candidateList = [];
      }

      if(candidate.success){
        this.snackBar.open(candidate.success, "", {
          duration: 4000,
          panelClass:'success-snackbar'
        });
      }

      if(candidate.error){
        this.snackBar.open("Something went wrong please try again later or contact your administrator", "", {
          duration: 4000,
          panelClass:'danger-snackbar'
        });
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
      console.log("test if parent function will be called affter closing modal");
      this.getCandidateList();
      if(result){
        console.log(result, "test")
      }
    });
  }

  getCandidateList(){
    this.candidateState.dispatch({
      type:CandidateActionTypes.GET_CANDIDATE_LIST,
      payload: this.localData.companyId
    });
  }
}
