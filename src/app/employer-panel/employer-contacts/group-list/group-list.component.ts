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
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupActionTypes } from '@main/shared/store/actions/group.action';
import { StoreState } from '@main/shared/store/index';
import { GroupState } from '@app-shared/store/reducers/group.reducer';

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
    private snackBar: MatSnackBar,
    private groupState: Store<StoreState>
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

      if(group.error){
        this.snackBar.open("Something went wrong please try again later or contact your administrator", "", {
          duration: 4000,
          panelClass:'danger-snackbar'
        });
      }
    })
  }

  getGroupList(){
    this.groupState.dispatch({
      type:GroupActionTypes.GET_GROUP_LIST,
      payload: this.localData.companyId
    });
  }

}
