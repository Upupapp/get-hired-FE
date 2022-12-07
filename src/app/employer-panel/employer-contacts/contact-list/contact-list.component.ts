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
  Contact,
  contactList
} from './utils/contact-model-interface';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImportAddContactComponent } from './dialogs/import-add-contact/import-add-contact.component';
import { ContactActionTypes } from '@main/shared/store/actions/contact.action';
import { StoreState } from '@main/shared/store/index';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { ContactState } from '@app-shared/store/reducers/contact.reducer';

@Component({
  selector: 'app-contact-list',
  animations: [mainAnimations],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnInit {

  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public routerUrl: any[] = [];
  public loading: boolean = true;
  public id;
  public localData: any = localStorage.getItem('user');
  public ContactData$: any;

  public displayedColumns: TableHeader[] = displayedColumns;
  public contactList: Contact[] = [];
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
    private contactState: Store<StoreState>
    ) {

  }

  ngOnInit(): void {
    this.localData = JSON.parse(this.localData);
    this.getContactList();

    this.ContactData$ = this.contactState.pipe(select(state => state.contact));
    this.req =  this.ContactData$.subscribe((contact: ContactState) => {
      this.loading = contact.pending;

      if(contact.contactList.length > 0){
        this.contactList = contact.contactList;
        // console.log(this.contactList, "contactList");
      } else {
        this.contactList = [];
      }

      if(contact.success){
        this.snackBar.open(contact.success, "", {
          duration: 4000,
          panelClass:'success-snackbar'
        });
      }

      if(contact.editContactRes){
        this.snackBar.open("Successfully Edited Contact!", "", {
          duration: 4000,
          panelClass:'success-snackbar'
        });

        this.contactState.dispatch({
          type:ContactActionTypes.EDIT_CONTACT_SUCCESS,
          payload: null
        });
      }

      if(contact.deleteContactRes){
        this.snackBar.open("Successfully Deleted Contact!", "", {
          duration: 4000,
          panelClass:'success-snackbar'
        });

        this.contactState.dispatch({
          type:ContactActionTypes.DELETE_CONTACT_SUCCESS,
          payload: null
        });

        this.getContactList();
      }

      if(contact.error){
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


  viewContact(event): void {
    // console.log(event)
    this.router.navigate(['/onboarding/contacts/details'], {queryParams: {userId: `${event?.data?.owner_id}`}});
  }

  addContacts(data?: any){
    let dialog = this.dialog.open(ImportAddContactComponent, {
      width: '40vw',
      maxHeight: '90vh',
      data: data,
    });

    dialog
    .afterClosed()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(result => {
      // console.log("test if parent function will be called affter closing modal");
      this.getContactList();
      if(result){
        // console.log(result, "test")
      }
    });
  }

  editContact(data: any){
    this.addContacts(data?.data)
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
          this.contactState.dispatch({
            type:ContactActionTypes.DELETE_CONTACT,
            payload: data?.data
          });
          
        }
      });
  }

  getContactList(){
    this.contactState.dispatch({
      type:ContactActionTypes.GET_CONTACT_LIST,
      payload: this.localData.companyId
    });
  }

}
