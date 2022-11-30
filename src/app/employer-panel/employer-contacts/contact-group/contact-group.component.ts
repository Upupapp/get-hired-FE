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
  ContactGroup,
  contactGroupList
} from './utils/group-model-interface';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddContactGroupComponent } from './dialogs/add-contact-group/add-contact-group.component';
import { GroupActionTypes } from '@main/shared/store/actions/group.action';
import { StoreState } from '@main/shared/store/index';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { GroupState } from '@app-shared/store/reducers/group.reducer';

@Component({
  selector: 'app-contact-group',
  templateUrl: './contact-group.component.html',
  styleUrls: ['./contact-group.component.scss'],
  animations: [mainAnimations],
})
export class ContactGroupComponent implements OnInit {

  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public routerUrl: any[] = [];
  public loading: boolean = true;
  public id;
  public localData: any = localStorage.getItem('user');
  public GroupData$: any;

  public displayedColumns: TableHeader[] = displayedColumns;
  public groupList: ContactGroup[] = [];
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
    private groupState: Store<StoreState>
    ) {

  }

  ngOnInit(): void {
    this.localData = JSON.parse(this.localData);
    this.getGroupList();

    this.GroupData$ = this.groupState.pipe(select(state => state.group));
    this.req =  this.GroupData$.subscribe((group: GroupState) => {
      this.loading = group.pending;
      if(group.groupList.length > 0){
        this.groupList = group.groupList
        ;
      } else {
        this.groupList = [];
      }

      if(group.success){
        this.snackBar.open(group.success, "", {
          duration: 4000,
          panelClass:'success-snackbar'
        });

        this.groupState.dispatch({
          type:GroupActionTypes.SAVE_GROUP_SUCCESS,
          payload: {status: null}
        });
      }

      if(group.editGroupRes){
        this.snackBar.open("Successfully Edited Group", "", {
          duration: 4000,
          panelClass:'success-snackbar'
        });

        this.groupState.dispatch({
          type:GroupActionTypes.EDIT_GROUP_SUCCESS,
          payload: null
        });
      }

      if(group.deleteGroupRes){
        this.snackBar.open("Successfully Deleted Group", "", {
          duration: 4000,
          panelClass:'success-snackbar'
        });

        this.groupState.dispatch({
          type:GroupActionTypes.DELETE_GROUP_SUCCESS,
          payload: null
        });

        this.getGroupList();
      }

      if(group.error){
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

  addCandidate(data?: any){
    let dialog = this.dialog.open(AddContactGroupComponent, {
      width: '40vw',
      maxHeight: '90vh',
      data: data?.data,
    });

    dialog
    .afterClosed()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(result => {
      console.log("test if parent function will be called affter closing modal");
      this.getGroupList();
      if(result){
        // console.log(result, "test")
      }
    });
  }

  editGroup(data) {
    this.addCandidate(data);
  }
  deleteRow(data: any) {
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
          this.groupState.dispatch({
            type:GroupActionTypes.DELETE_GROUP,
            payload: data?.data
          });
          
        }
      });
  }

  getGroupList(){
    this.groupState.dispatch({
      type:GroupActionTypes.GET_GROUP_LIST,
      payload: this.localData.companyId
    });
  }

}
