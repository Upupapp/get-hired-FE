import {
  Component,
  OnInit,
  OnDestroy,
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
  GroupList,
  groupList
} from './utils/group-list-model-interface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { GroupActionTypes } from '@main/shared/store/actions/group.action';
import { StoreState } from '@main/shared/store/index';
import { GroupState } from '@app-shared/store/reducers/group.reducer';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { GroupService } from '@app-shared/services/api/groups.service';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss'],
  animations: [mainAnimations]
})
export class GroupListComponent implements OnInit {

  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public routerUrl: any[] = [];
  public loading: boolean = true;
  public id;
  public localData: any = localStorage.getItem('user');
  public GroupData$: any;
  public groupId: any;

  public displayedColumns: TableHeader[] = displayedColumns;
  public groupList: GroupList[] = [];
  public groupName: string = '';
  public listView: boolean = true;
  public selectedColumns: string[] = selectedColumns
  public searchSource: any = (el) => {
    return {
      email: el.email,
      firstname: el.firstname,
      lastname: el.lastname,
      cell_number: el.cell_number,
      address: el.address,
    };
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    private groupState: Store<StoreState>,
    private dialog: MatDialog,
    private groupService: GroupService
    ) {
      this.groupId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.localData = JSON.parse(this.localData);
    this.getGroupList();

    this.GroupData$ = this.groupState.pipe(select(state => state.group));
    this.req =  this.GroupData$.subscribe((group: GroupState) => {
      this.loading = group.pending;
      if(group.groupList.length > 0){
        const result = group.groupList.filter(item => this.groupId.includes(item.group_id));
        console.log("result: ", result)
       this.groupList = result[0].details;
       this.groupName = result[0].group_name;
      } else {
        this.groupList = [];
      }

      if(group.success){
        this.snackbarService.success(group.success, "");

        this.groupState.dispatch({
          type:GroupActionTypes.SAVE_GROUP_SUCCESS,
          payload: {status: null}
        });
      }

      if(group.error){
        this.snackbarService.error("Something went wrong please try again later or contact your administrator", "");
      }
    })
  }

  getGroupList(){
    this.groupState.dispatch({
      type:GroupActionTypes.GET_GROUP_LIST,
      payload: this.localData.companyId
    });
  }

  // GETHIRED_TALENT_CANDIDATE_GROUP_MEMBER_REMOVAL_V1: removes one candidate
  // from THIS group only -- never the candidate/contact/applicant record
  // itself (that's why the label/copy explicitly says "from Group", not
  // "Delete"/"Remove Candidate"). Re-dispatches GET_GROUP_LIST on success --
  // same pattern contact-list.component.ts's deleteRow() already uses after
  // a mutation (re-fetch, not a full-page reload). Needed here specifically
  // because app-reusable-table only reads [listDataSource] once, in its own
  // ngOnInit() -- it has no ngOnChanges, so reassigning the array reference
  // alone would not refresh what's rendered. Re-dispatching flips `loading`
  // true then false, which (via the existing `*ngIf="listView && !loading"`
  // wrapper around the table) destroys and recreates it, correctly picking
  // up the fresh data -- exactly the mechanism already relied on elsewhere
  // in this codebase, not a new one invented for this feature.
  removeMember(event: any) {
    const row = event?.data;
    const candidateName = [row?.firstname, row?.lastname].filter(Boolean).join(' ') || row?.email || 'this candidate';

    const ref = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        title: 'Remove from Candidate Group?',
        message: `Remove ${candidateName} from "${this.groupName}"? The candidate will remain in your Talent Pool.`,
        confirmLabel: 'Remove from Group',
        cancelLabel: 'Cancel',
      },
    });

    ref
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result == 1) {
          this.groupService.removeGroupMember(this.groupId, row?.email)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              next: () => {
                this.getGroupList();
                this.snackbarService.success('Candidate removed from group.', '');
              },
              error: () => {
                this.snackbarService.error('Something went wrong please try again later or contact your administrator', '');
              },
            });
        }
      });
  }

}
