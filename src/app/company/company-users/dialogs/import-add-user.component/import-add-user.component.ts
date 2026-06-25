import { Component, Inject, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { mainAnimations } from '@app-shared/animations/main-animations'; 
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompanyActionTypes } from '@main/shared/store/actions/company.action';
import { StoreState } from '@main/shared/store/index';
import { CompanyState } from '@main/shared/store/reducers/company.reducer';
import { Subject } from 'rxjs';
import { CSVDataRecord } from './import-user-model';

@Component({
  selector: 'app-import-add-user.component',
  templateUrl: './import-add-user.component.html',
  styleUrls: ['./import-add-user.component.scss'],
  animations: [mainAnimations]
})
export class ImportAddUserComponent implements OnInit {

  public inviteForm: FormGroup;
  public emailArray: any[] = [];
  public submitting: boolean = false;
  public importEmployee: boolean = false;
  public importing: boolean = false;
  public localData: any = localStorage.getItem('user');
  private invitedCompanyUsers$: any;
  public loading: boolean = false;
  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public invitedUsersList: any[] = [];
  public document:any = null;
  public fileData: any;

  @ViewChild('csvReader') csvReader: any;
  jsondatadisplay:any;
  public records: any;
  public isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ImportAddUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    public snackBar: MatSnackBar,
    private companyState: Store<StoreState>,
  ) {
    console.log(data)
  }

  ngOnInit(): void {
    this.localData = JSON.parse(this.localData);
    this.inviteForm = this.formBuilder.group({
      email: [this.data ? this.data?.invitation?.email : '', [Validators.email]],
    });
    this.invitedCompanyUsers$ = this.companyState.pipe(select(state => state.company));
    this.req = this.invitedCompanyUsers$.subscribe((invite: CompanyState) => {
      this.loading = invite.pending;
      console.log(this.loading, "loading");
      if(invite.companyUserRes){
        const emails: any[] = invite.companyUserRes.emails || [];
        if(emails.length > 0){
          // NOTIFY-P2: check per-email status — backend returns all submitted
          // emails in the array regardless of whether they failed. A "failed"
          // status means the invite was NOT sent (e.g. email already a user).
          const successCount = emails.filter((e: any) => e.status !== 'failed').length;
          const failureCount = emails.length - successCount;
          this.invitedUsersList = emails;
          this.isLoading = false;
          this.submitting = true;

          if (successCount > 0 && failureCount === 0) {
            const msg = successCount === 1 ? 'Invite sent.' : `${successCount} invites sent.`;
            this.snackBar.open(msg, '', { duration: 4000, panelClass: 'success-snackbar' });
          } else if (successCount > 0 && failureCount > 0) {
            this.snackBar.open(`${successCount} sent. ${failureCount} couldn't be added.`, '', { duration: 6000, panelClass: 'warning-snackbar' });
          } else {
            // successCount === 0 — all failed; never show a success toast
            this.snackBar.open('No contacts were added.', '', { duration: 6000, panelClass: 'danger-snackbar' });
          }
        }
        // this.company.dispatch({
        //   type: CompanyActionTypes.SAVE_COMPANY_USER_SUCCESS,
        //   payload: null
        // });
      }
    })
  }


  close() {
    this.dialogRef.close(null);
  }

  addEmployeeEmail(){
    let obj = { email: this.inviteForm.controls['email'].value };
    this.emailArray.push(obj);  
    this.inviteForm.reset();
  }

  removeEmployee(employee){
    let index = this.emailArray.findIndex(el => el === employee);  
    this.emailArray.splice(index, 1);
  }

  addMoreEmployee(){
    this.submitting = false;
    this.emailArray = [];
  }

  importUserTab(){
    this.submitting = false;
    this.emailArray = [];
    this.importEmployee = true;
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
    this.importEmployee = false;
    this.importing = true;
    // this.emailArray = ["dapito.sherwin@gmail.com", "miles.gonzales@gmail.com", "kenshin.himura@gmail.com"];
  }

  submitInvites(){
    this.importing = false;
    this.submitting = true;
    this.saveCompanyUser(this.emailArray);
    this.uploadedFile = undefined;
    this.inviteForm.reset();
    // this.invitedUsersList = [];
  }

  saveCompanyUser(value){
    let data = {
      companyId: this.localData.companyId,
      emails: [
        ...value
      ]
    }
    console.log(data, "company add user data")
    this.companyState.dispatch({
      type: CompanyActionTypes.SAVE_COMPANY_USER,
      payload: data
    }); 
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
        };
  
        reader.onerror = function () {
          console.log('error is occured while reading file!');
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
          csvRecord.email = curruntRecord[0].trim();
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
       this.saveCompanyUser(this.records);
    }

    ngOnDestroy(): void {
      if(this.req) this.req.unsubscribe();
    }
  
}
