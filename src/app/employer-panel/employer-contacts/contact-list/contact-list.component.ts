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
import { SnackbarService } from '@app-core/services/snackbar.service';
import { ImportAddContactComponent } from './dialogs/import-add-contact/import-add-contact.component';
import { ContactActionTypes } from '@main/shared/store/actions/contact.action';
import { StoreState } from '@main/shared/store/index';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { ContactState } from '@app-shared/store/reducers/contact.reducer';
import { TranslateService } from '@ngx-translate/core';

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

  public displayedColumns: TableHeader[] = [
    { col_name: 'full_name', title: 'Full Name' },
    { col_name: 'email', title: 'Email Address' },
    { col_name: 'mobile_number', title: 'Mobile Number' },
    { col_name: 'address', title: 'Address' },
    { col_name: 'job_id', title: 'Job ID' },
    { col_name: 'job_title', title: 'Job Title' },
    { col_name: 'created_at', title: this.translate.instant("CONTACT_LIST_PAGE.TABLE_COLUMN_CREATION_DATE"), type: 'date' },
    // TALENT-WORKSPACE-REDESIGN: "View Group" -> "View Candidate Group" to match the renamed Candidate Groups section.
    { col_name: 'view_group', title: this.translate.instant("CONTACT_LIST_PAGE.TABLE_COLUMN_GROUP_NAME"), type: 'action_button', button_title: 'View Candidate Group', button_class: 'view-group'  },
    { col_name: 'action', title: 'Action' , type: 'menu' },
  ];
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
    private snackbarService: SnackbarService,
    private contactState: Store<StoreState>,
    private translate: TranslateService
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
        this.snackbarService.success(contact.success, "");
      }

      if(contact.editContactRes){
        this.snackbarService.success("Successfully Edited Contact!", "");

        this.contactState.dispatch({
          type:ContactActionTypes.EDIT_CONTACT_SUCCESS,
          payload: null
        });
      }

      if(contact.deleteContactRes){
        this.snackbarService.success("Successfully Deleted Contact!", "");

        this.contactState.dispatch({
          type:ContactActionTypes.DELETE_CONTACT_SUCCESS,
          payload: null
        });

        this.getContactList();
      }

      if(contact.error){
        this.snackbarService.error("Something went wrong please try again later or contact your administrator", "");
      }
    })

    // setTimeout(() => this.loading = false, 1500);
  }

  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }


  // BUGFIX: "View Candidate Group" previously did nothing at all -- no
  // navigation, no feedback -- for a candidate in zero groups (the button
  // renders identically regardless of group count, so there was no way to
  // tell beforehand). Now explains why, instead of a silent dead click.
  viewContactGroup(event): void {
    if(Array.isArray(event.data?.groups) && event.data?.groups.length > 0 ){
      this.router.navigate([`/recruiter/contacts/group-list/${event.data?.groups[0].group_id}`]);
    } else {
      this.snackbarService.info('This candidate is not currently in any Candidate Group.', '', 4000);
    }
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
      // BUGFIX: previously called getContactList() unconditionally here,
      // so the X button / footer Close button on the Edit Contact dialog
      // (which close with no result) triggered the exact same list
      // refresh as a genuine successful save. A close action shouldn't
      // have side effects -- only refresh when the dialog actually closed
      // after a successful save (see closeWithSuccess() in
      // import-add-contact.component.ts, the only place that closes with
      // a truthy result).
      if (result) {
        this.getContactList();
      }
    });
  }

  // BUGFIX (root cause of PUT /contacts/updatecontact 403 on Submit):
  // getContactList() (dispatches GET_CONTACT_LIST -> BE's contactList())
  // merges THREE different data sources into one table: real, employer-
  // created gethired.contact rows (the only ones with a real contact_id,
  // company-scoped and genuinely editable/deletable) alongside read-only
  // projections of candidates and job_applicants that happen to have
  // contact-shaped fields (name/email/phone) but no contact_id at all --
  // they were never meant to be edited or deleted through this endpoint.
  // Opening the Edit dialog (or the Delete confirmation) for one of those
  // always fails server-side once actually submitted (editContact()/
  // deleteContact() in contact.service.js resolve nothing to update/delete
  // for a contact_id that doesn't exist, which correctly comes back as a
  // 403 -- but only once the applicant has already filled out and
  // submitted the form, or confirmed a delete, with no explanation of why).
  // Gate both actions on contact_id being present so the applicant gets an
  // immediate, clear explanation instead of a doomed submit attempt.
  private isEditableContact(row: any): boolean {
    return !!(row && row.contact_id);
  }

  editContact(data: any){
    const row = data?.data;
    if (!this.isEditableContact(row)) {
      this.snackbarService.info(
        'This entry was added automatically from a job application or candidate record, not created as a contact -- it can\'t be edited here.',
        '',
        6000
      );
      return;
    }
    this.addContacts(row);
  }

  deleteRow(data: any) {
    const row = data?.data;
    if (!this.isEditableContact(row)) {
      this.snackbarService.info(
        'This entry was added automatically from a job application or candidate record, not created as a contact -- it can\'t be removed here.',
        '',
        6000
      );
      return;
    }

    // TALENT-WORKSPACE-REDESIGN BUGFIX: was `data: { action: 'Delete' }`,
    // which rendered the dialog's generic fallback copy -- "Would you like
    // to save your progress in Delete ?" -- nonsensical for a delete
    // confirmation. The backend only supports a real, permanent delete
    // here (no archive/status field on `contact` rows per contactsController.
    // deleteContact) -- the confirmation says so honestly rather than
    // implying a soft "archive."
    const candidateName = row?.full_name || 'this candidate';
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        title: `Remove ${candidateName} from your Talent Pool?`,
        message: 'This permanently deletes this candidate record. This cannot be undone.',
        confirmLabel: 'Remove Candidate',
        cancelLabel: 'Cancel',
        destructive: true,
      },
    });

    ref
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result == 1) {
          this.contactState.dispatch({
            type:ContactActionTypes.DELETE_CONTACT,
            payload: row
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
