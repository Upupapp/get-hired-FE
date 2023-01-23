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
  Group,
  contactGroupLists
} from './utils/group-list-model-interface';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contact-group',
  animations: [mainAnimations],
  templateUrl: './contact-group.component.html',
  styleUrls: ['./contact-group.component.scss']
})
export class ContactGroupComponent implements OnInit {

  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public routerUrl: any[] = [];
  public loading: boolean = true;
  public id;
  public displayedColumns: TableHeader[] = displayedColumns;
  public contactGroupLists: Group[] = contactGroupLists;
  public listView: boolean = true;
  public selectedColumns: string[] = selectedColumns
  public searchSource: any = (el) => {
    return {
      id: el.id,
      group_name: el.group_name,
    };
  };
  public status: string[] = ["Active", "Inactive"];
  
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar) {

  }

  ngOnInit(): void {
    setTimeout(() => this.loading = false, 1500);
  }


  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }


  viewMenu(event): void {
    
  }


  addGroup(){
    /*let openDialog = this.dialog.open(
      AddContactComponent,
      { 
        width: '34vw',
        data: event,
      }
    );

    openDialog
    .afterClosed()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(result => {

    });*/
  }

}
