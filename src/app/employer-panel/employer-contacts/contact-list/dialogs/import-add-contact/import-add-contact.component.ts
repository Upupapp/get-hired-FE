import { Component, Inject, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { ContactActionTypes } from '@main/shared/store/actions/contact.action';
import { GroupActionTypes } from '@main/shared/store/actions/group.action';
import { StoreState } from '@main/shared/store/index';
import { ContactState } from '@main/shared/store/reducers/contact.reducer';
import { GroupState } from '@main/shared/store/reducers/group.reducer';
import { Subject, Observable, startWith, map } from 'rxjs';
import { CSVDataRecord } from './import-contact-model';

@Component({
  selector: 'app-import-add-contact',
  animations: [mainAnimations],
  templateUrl: './import-add-contact.component.html',
  styleUrls: ['./import-add-contact.component.scss']
})
export class ImportAddContactComponent implements OnInit {

  public contactForm: FormGroup;
  public importContactForm: FormGroup;
  public submitting: boolean = false;
  public importContact: boolean = false;
  public importing: boolean = false;
  private contactData$: any;
  private groupData$: any;
  private req: Subscription = new Subscription;
  private groupReq: Subscription = new Subscription;
  private unsubscribe$ = new Subject<void>();
  public contactList: any = {};
  public groupList: any = {};
  public jobList: any = [];
  public localData: any = localStorage.getItem('user');
  public loading: boolean = true;
  public isLoading: boolean = false;
  public document:any = null;
  public logo: any = null;
  @ViewChild('csvReader') csvReader: any;
  jsondatadisplay:any;
  public records: any;

  public options = [];

  filteredOptions: Observable<any>;
  groupOptions:any = [];

  constructor(
    public dialogRef: MatDialogRef<ImportAddContactComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private snackbarService: SnackbarService,
    private contactState: Store<StoreState>,
    private groupState: Store<StoreState>,
  ) {}

  ngOnInit(): void {
    this.localData = JSON.parse(this.localData);
    this.getJobList();
    this.getGroupList();
    this.contactForm = this.formBuilder.group({
      // BUGFIX: prefilled from `this.data?.firstname`/`lastname` (no
      // underscore), but the real contacts-list row shape (contactList()
      // in services/contact.service.js, the `contact` table rows) uses
      // `first_name`/`last_name`. So editing any genuine contact left these
      // required fields undefined -- Validators.required treats undefined
      // as empty, so the form was permanently invalid and Submit stayed
      // disabled for every real contact. (The only rows where `firstname`/
      // `lastname` without an underscore actually existed were the
      // job-applicant-derived pseudo-contacts also merged into this list,
      // which have no real contact_id to update in the first place -- see
      // the editContact() fix in contact.service.js for that half of this
      // bug.) Read both key shapes so either row source prefills correctly.
      firstName: [this.data ? (this.data?.first_name ?? this.data?.firstname) : '', [Validators.required]],
      lastName: [this.data ? (this.data?.last_name ?? this.data?.lastname) : '', [Validators.required]],
      email: [this.data ? this.data?.email : '', [Validators.email, Validators.required]],
      mobileNumber: [this.data ? this.data?.mobile_number : ''],
      address: [this.data ? this.data?.address : ''],
      // In Edit mode: auto-populated from whichever job this contact/
      // candidate record is already associated with, and disabled --
      // never user-editable (previously an editable dropdown letting the
      // employer reassign ANY job onto an existing contact, which this
      // field was never actually wired to persist in the first place --
      // editContact() in contact.service.js has never read jobId at all).
      // In New Contact mode, left as before: an empty, user-selectable field.
      jobId: [{ value: this.data ? (this.data?.job_id || '') : '', disabled: !!this.data }],
      groupName: ['', !this.data ? [Validators.required] : null],
      groupId: ['']
    });
    this.importContactForm = this.formBuilder.group({
      groupName: ['', [Validators.required]],
      groupId: ['']
    });
    this.contactData$ = this.contactState.pipe(select(state => state.contact));
    this.groupData$ = this.groupState.pipe(select(state => state.group));
    this.req =  this.contactData$.subscribe((onboard: ContactState) => {
      this.loading = onboard.pending;
      if(onboard.contactRes){
        this.contactList = onboard.contactRes;
        this.isLoading = false;
        this.submitting = false;

        // NOTIFY-P2: determine outcome from response shape before showing toast.
        // Multi-contact: response has summary.successCount.
        // Single contact: response has status field ('ADDED' or 'DUPLICATE_CONTACT').
        const res = onboard.contactRes;
        const hasSummary = res && res.summary;
        let toastMsg = 'Contact added.';
        let toastClass = 'success-snackbar';
        let toastDuration = 4000;
        if (hasSummary) {
          const { successCount = 0, duplicateCount = 0, failureCount = 0 } = res.summary;
          if (successCount > 0 && failureCount === 0) {
            toastMsg = successCount === 1 ? 'Contact added.' : `${successCount} contacts added.`;
          } else if (successCount > 0 && failureCount > 0) {
            toastMsg = `${successCount} added. ${failureCount} couldn't be added.`;
            toastClass = 'warning-snackbar';
            toastDuration = 6000;
          } else if (duplicateCount > 0) {
            toastMsg = 'No new contacts were added. These contacts are already in your list.';
            toastClass = 'info-snackbar';
            toastDuration = 6000;
          } else {
            toastMsg = 'No contacts were added.';
            toastClass = 'danger-snackbar';
            toastDuration = 6000;
          }
        } else {
          // Single contact — check status field added by NOTIFY-P2 BE patch.
          const isDuplicate = res && res.status === 'DUPLICATE_CONTACT';
          if (isDuplicate) {
            toastMsg = 'This contact is already in your list.';
            toastClass = 'info-snackbar';
            toastDuration = 5000;
          }
        }
        if (toastClass === 'success-snackbar') {
          this.snackbarService.success(toastMsg, '', toastDuration);
        } else if (toastClass === 'warning-snackbar') {
          this.snackbarService.warning(toastMsg, '', toastDuration);
        } else if (toastClass === 'info-snackbar') {
          this.snackbarService.info(toastMsg, '', toastDuration);
        } else {
          this.snackbarService.error(toastMsg, '', toastDuration);
        }

        if(!this.importContact){
          this.contactState.dispatch({
            type:ContactActionTypes.SAVE_CONTACT_SUCCESS,
            payload: null
          });
        } else {
          this.contactState.dispatch({
            type:ContactActionTypes.SAVE_CONTACT_MULTIPLE_SUCCESS,
            payload: null
          });
        }
        // BUGFIX: this used to call close() -- the same method the X
        // button and the footer Close button call, which closes with
        // `null`/`undefined`. The parent (contact-list.component.ts)
        // couldn't tell a genuine save apart from the applicant just
        // dismissing the dialog, so it refreshed the contact list
        // unconditionally on EVERY close, including Cancel/X -- an
        // informal, surprising side effect for a button that's supposed
        // to just dismiss. Closing with a truthy result here (and only
        // here, on an actual successful save) lets the parent refresh
        // only when there's genuinely new data to show.
        this.closeWithSuccess();
      }

      // BUGFIX (root cause of the dialog never auto-closing after a real
      // edit): editing an existing contact dispatches EDIT_CONTACT, whose
      // success case (contact.reducer.ts) populates `editContactRes` --
      // a completely different state field from `contactRes` above, which
      // only ever gets set by the New Contact / Import Contact save
      // flows. This block above never ran for an edit at all, so the
      // dialog just sat there indefinitely with no way to know the save
      // had actually succeeded.
      // contact-list.component.ts already shows the "Successfully Edited
      // Contact!" toast and resets `editContactRes` back to null from its
      // own subscription to this same state -- deliberately not duplicated
      // here to avoid a double toast/double dispatch. This only needs to
      // close the dialog (with a truthy result, so the parent's
      // afterClosed() refreshes the list) once the edit is confirmed done.
      if (onboard.editContactRes) {
        this.isLoading = false;
        this.closeWithSuccess();
      }

      if(onboard.jobId){
        this.jobList = onboard.jobId;
        this.isLoading = false;
        this.submitting = false;
      }

      if(onboard.error){
        this.snackbarService.error("Something went wrong please try again later or contact your administrator", "");
        this.close();

        this.contactState.dispatch({
          type:ContactActionTypes.SAVE_CONTACT_FAIL,
          payload: null
        });

        this.contactState.dispatch({
          type:ContactActionTypes.SAVE_CONTACT_MULTIPLE_FAIL,
          payload: null
        });
      }
    });

    this.groupReq = this.groupData$.subscribe((group: GroupState) => {
      this.loading = group.pending;
      if(group.groupList){
        this.groupList = group.groupList;
        this.groupList.forEach(element => {
          this.groupOptions.push(element.group_name);
        });
        this.groupState.dispatch({
          type:GroupActionTypes.GET_GROUP_LIST_SUCCESS,
          payload: null
        });
      }
    });

    this.filteredOptions = this.contactForm.get("groupName").valueChanges.pipe(
      startWith(''),
      map(val => this.filter(val))
    );

  }

  filter(val: string): string[] {
    return this.groupOptions.filter(option =>
      option?.toLowerCase().indexOf(val?.toLowerCase()) === 0);
  }

  close() {
    this.dialogRef.close(null);
    this.submitting = false;
  }

  // See the BUGFIX note above where this is called: a truthy close result
  // is the parent's only signal that a real save happened, as opposed to
  // Cancel/X (dialogRef.close() with no args, in the template) or a failed
  // submit (close() above, still null) -- neither of which should trigger
  // a list refresh.
  private closeWithSuccess(): void {
    this.dialogRef.close({ success: true });
    this.submitting = false;
  }

  convertToDateTime(dateVal: Date){
    return Math.ceil(new Date(dateVal).getTime() / 1000);
  }

  convertToDate(dateTime){
    return new Date(dateTime * 1000)
  }

  uploadedFile: any;

  onUpload(file){
    this.uploadedFile = file;
  }

  uploadDocument(){
    this.importContact = false;
    this.importing = true;
  }

  submitForm(){
    this.isLoading = true;
    this.saveOnboard();
    this.importing = false;
    this.uploadedFile = undefined;
    this.contactForm.reset();
    this.contactList = [];
  }

  addMoreContact(){
    this.submitting = false;
    this.removeDocument();
    this.importContact = false;
  }

  saveOnboard(){

    if(!this.data){
      this.contactForm.get("groupName")?.patchValue(this.setGroupName(this.contactForm.controls['groupName'].value));
      this.contactForm.get("groupId")?.patchValue(this.setGroupId(this.contactForm.controls['groupName'].value));
      let data = {
        ...this.contactForm.value,
        userId: this.localData._id,
        companyId: this.localData.companyId
      }
      this.contactState.dispatch({
        type: ContactActionTypes.SAVE_CONTACT,
        payload: data
      });
    } else {
      let data = {
        ...this.contactForm.value,
        contactId: this.data.contact_id
      }

      this.contactState.dispatch({
        type: ContactActionTypes.EDIT_CONTACT,
        payload: data
      });
    }
  }

  setGroupName(value) {
    const groupDetail = this.groupList.filter(function (element) {
     return element.group_name?.toLowerCase() === value?.toLowerCase();
    });
    return groupDetail.length > 0 ? groupDetail[0].group_name : value;
  }

  setGroupId(value) {
    const groupDetail = this.groupList.filter(function (element) {
     return element.group_name?.toLowerCase() === value?.toLowerCase();
    });
    return groupDetail.length > 0 ? groupDetail[0].group_id : "";
  }


  //Restrict file upload to csv
  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  // distinction of first row as header
  getHeaderArray(csvRecordsArr: any) {
    let headers = (csvRecordsArr[0]).split(',');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  public fileData: any;

  //Upload listener
  uploadListener($event: any): void {
    let text = [];
    let files = $event.srcElement.files;

    if (this.isValidCSVFile(files[0])) {
      this.document= files[0].name;
      this.fileData = files[0];

      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = () => {
        let csvData = reader.result;
        let csvRecordsArray = (csvData as string).split(/\r\n|\n/);

        let headersRow = this.getHeaderArray(csvRecordsArray);

        this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
        // console.log(this.records, "records")
      };

      reader.onerror = function () {
        // console.log('error is occured while reading file!');
      };

    } else {
      alert("Please import valid .csv file.");
      this.fileReset();
    }
  }

  //data
  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    let csvArr = [];

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let curruntRecord = (csvRecordsArray[i]).split(',');
      if (curruntRecord.length == headerLength) {
        let csvRecord: CSVDataRecord = new CSVDataRecord();
        csvRecord.firstName = curruntRecord[0].trim();
        csvRecord.lastName = curruntRecord[1].trim();
        csvRecord.email = curruntRecord[2].trim();
        csvRecord.mobileNumber = curruntRecord[3].trim();
        csvRecord.address = curruntRecord[4].trim();
        // csvRecord.jobId = curruntRecord[5].trim();
        // csvRecord.group = curruntRecord[6].trim();
        csvArr.push(csvRecord);
      }
    }
    return csvArr;
  }

  fileReset() {
    this.csvReader.nativeElement.value = "";
    this.records = [];
    this.jsondatadisplay = '';
  }

  removeDocument(){
    this.document = null;
  }

  uploadFile() {
    this.isLoading = true;
    this.records.forEach((element) => {
      element.userId = this.localData._id;
      element.companyId = this.localData.companyId;
    });
    // console.log(this.records, "added userId")
    this.saveOnboardMultiple();
  }

  saveOnboardMultiple(){
    this.importContactForm.get("groupName")?.patchValue(this.setGroupName(this.importContactForm.controls['groupName'].value));
    this.importContactForm.get("groupId")?.patchValue(this.setGroupId(this.importContactForm.controls['groupName'].value));
      let data = {
        ...this.importContactForm.value,
        contacts: [...this.records]
      }
      if(this.importContact) {
        this.contactState.dispatch({
          type: ContactActionTypes.SAVE_CONTACT_MULTIPLE,
          payload: data
        });
      }

  }

  uploadLogo(event: any, dropped = false) {
    const uploaded: any = dropped ? event : event.target.files;
    let fileObject: any = {
      filename: '',
      size: '',
      type: '',
      file: '',
    };
    fileObject.filename = uploaded[0].name;
    fileObject.type = uploaded[0].type;
    fileObject.size = uploaded[0].size;
    const reader = new FileReader();
    reader.readAsDataURL(uploaded[0]);
    reader.onload = (_event) => {
      this.contactForm.get("avatar")?.patchValue(reader.result);
      fileObject.file = reader.result;
      this.logo = fileObject;
    };
  }

  removeImage(){
    this.logo = null;
    this.contactForm.get("avatar")?.patchValue(null);
  }

  getJobList(){
    this.contactState.dispatch({
      type:ContactActionTypes.GET_CONTACT_JOB,
      payload: this.localData.companyId
    });
  }

  getGroupList(){
    this.groupState.dispatch({
      type:GroupActionTypes.GET_GROUP_LIST,
      payload: this.localData.companyId
    });
  }

}
