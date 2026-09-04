import { Component, Inject, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription, Subject } from 'rxjs';
import { skip, distinctUntilChanged } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CompanyActionTypes } from '@main/shared/store/actions/company.action';
import { StoreState } from '@main/shared/store/index';
import { CompanyState } from '@main/shared/store/reducers/company.reducer';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { HapticService } from '@app-core/services/haptic.service';
import { CSVDataRecord } from './import-user-model';

interface InviteResult {
  email: string;
  status: string;
  msg?: string;
  message?: string;
}

@Component({
  selector: 'app-import-add-user.component',
  templateUrl: './import-add-user.component.html',
  styleUrls: ['./import-add-user.component.scss'],
  animations: [mainAnimations]
})
export class ImportAddUserComponent implements OnInit, OnDestroy {

  public inviteForm: FormGroup;
  public emailArray: any[] = [];
  public submitting: boolean = false;
  public importEmployee: boolean = false;
  public importing: boolean = false;
  // Phase 5: SSR guard — field is null until ngOnInit reads localStorage safely
  public localData: any = null;
  private invitedCompanyUsers$: any;
  public loading: boolean = false;
  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public invitedUsersList: InviteResult[] = [];
  public document: any = null;
  public fileData: any;

  // Phase 3+4: result panel state
  public showResultPanel: boolean = false;
  public successCount: number = 0;
  public failedEmails: InviteResult[] = [];
  public allFailed: boolean = false;

  @ViewChild('csvReader') csvReader: any;
  jsondatadisplay: any;
  public records: any;
  public isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ImportAddUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private snackbarService: SnackbarService,
    private hapticService: HapticService,
    private companyState: Store<StoreState>,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    // Phase 5: SSR guard — read localStorage only in browser
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('user');
      try {
        this.localData = raw ? JSON.parse(raw) : null;
      } catch (_e) {
        this.localData = null;
      }
    }

    this.inviteForm = this.formBuilder.group({
      email: [this.data ? (this.data.invitation ? this.data.invitation.email : '') : '', [Validators.email]],
    });

    this.invitedCompanyUsers$ = this.companyState.pipe(select(state => state.company));
    // STALE-RESULT-ON-REOPEN FIX: NgRx `select()` replays the CURRENT store
    // value the instant a new subscriber attaches. companyUserRes is set on
    // SAVE_COMPANY_USER_SUCCESS and never reset anywhere in the reducer --
    // so if a previous invite already succeeded earlier in this session,
    // closing and reopening this dialog immediately re-fired that OLD
    // result's success/partial/failure toast + result panel before the user
    // had typed or submitted anything new this time. skip(1) ignores that
    // replayed snapshot; distinctUntilChanged (by reference) additionally
    // stops an unrelated company-state update from re-processing the same
    // companyUserRes object a second time.
    this.req = this.invitedCompanyUsers$.pipe(
      skip(1),
      distinctUntilChanged((a: CompanyState, b: CompanyState) => a.companyUserRes === b.companyUserRes),
    ).subscribe((invite: CompanyState) => {
      this.loading = invite.pending;

      if (invite.companyUserRes) {
        const emails: InviteResult[] = invite.companyUserRes.emails || [];
        if (emails.length > 0) {
          const succeeded = emails.filter((e: InviteResult) => e.status !== 'failed');
          const failed = emails.filter((e: InviteResult) => e.status === 'failed');

          this.successCount = succeeded.length;
          this.failedEmails = failed;
          this.invitedUsersList = emails;
          this.isLoading = false;
          this.submitting = true;

          if (succeeded.length > 0 && failed.length === 0) {
            // All success
            const msg = succeeded.length === 1 ? 'Invite sent.' : `${succeeded.length} invites sent.`;
            this.hapticService.success();
            this.snackbarService.success(msg);
            this.showResultPanel = false;
          } else if (succeeded.length > 0 && failed.length > 0) {
            // Partial success — show result panel, warning haptic + toast
            this.showResultPanel = true;
            this.allFailed = false;
            this.hapticService.warning();
            this.snackbarService.warning(`${succeeded.length} sent. ${failed.length} couldn't be added.`);
          } else {
            // All failed — show result panel, error haptic + toast, keep dialog open
            this.showResultPanel = true;
            this.allFailed = true;
            this.submitting = false;
            this.hapticService.error();
            this.snackbarService.error('No invites were sent. See details below.');
          }
        }
      }
    });
  }

  close() {
    this.dialogRef.close(null);
  }

  addEmployeeEmail() {
    const obj = { email: this.inviteForm.controls['email'].value };
    this.emailArray.push(obj);
    this.inviteForm.reset();
  }

  removeEmployee(employee) {
    const index = this.emailArray.findIndex(el => el === employee);
    this.emailArray.splice(index, 1);
  }

  addMoreEmployee() {
    this.submitting = false;
    this.showResultPanel = false;
    this.allFailed = false;
    this.failedEmails = [];
    this.successCount = 0;
    this.emailArray = [];
  }

  retryFailed() {
    if (this.failedEmails.length === 0) { return; }
    const retryEmails = this.failedEmails.map(f => ({ email: f.email }));
    this.showResultPanel = false;
    this.allFailed = false;
    this.submitting = false;
    this.emailArray = retryEmails;
    this.saveCompanyUser(retryEmails);
  }

  copyFailedEmails() {
    if (!isPlatformBrowser(this.platformId)) { return; }
    const text = this.failedEmails.map(f => f.email).join('\n');
    try {
      navigator.clipboard.writeText(text);
      this.snackbarService.info('Failed emails copied to clipboard.');
    } catch (_e) {
      // Clipboard not available — silently ignore
    }
  }

  importUserTab() {
    this.submitting = false;
    this.emailArray = [];
    this.importEmployee = true;
  }

  convertToDateTime(dateVal: Date) {
    return Math.ceil(new Date(dateVal).getTime() / 1000);
  }

  convertToDate(dateTime) {
    return new Date(dateTime * 1000);
  }

  uploadedFile: any;

  onUpload(file) {
    this.uploadedFile = file;
  }

  uploadDocument() {
    this.importEmployee = false;
    this.importing = true;
  }

  submitInvites() {
    this.importing = false;
    this.submitting = true;
    this.saveCompanyUser(this.emailArray);
    this.uploadedFile = undefined;
    this.inviteForm.reset();
  }

  saveCompanyUser(value) {
    const companyId = this.localData ? this.localData.companyId : undefined;
    const payload = {
      companyId,
      emails: [...value],
    };
    this.companyState.dispatch({
      type: CompanyActionTypes.SAVE_COMPANY_USER,
      payload,
    });
  }

  // Restrict file upload to csv
  isValidCSVFile(file: any) {
    return file.name.endsWith('.csv');
  }

  // Distinction of first row as header
  getHeaderArray(csvRecordsArr: any) {
    const headers = (csvRecordsArr[0]).split(',');
    const headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  // Upload listener
  uploadListener($event: any): void {
    const files = $event.srcElement.files;

    if (this.isValidCSVFile(files[0])) {
      this.document = files[0].name;
      this.fileData = files[0];

      const input = $event.target;
      const reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = () => {
        const csvData = reader.result;
        const csvRecordsArray = (csvData as string).split(/\r\n|\n/);
        const headersRow = this.getHeaderArray(csvRecordsArray);
        this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
      };

      reader.onerror = function () {
        // File read error — browser will not surface details here
      };
    } else {
      this.snackbarService.error('Please import a valid .csv file.');
      this.fileReset();
    }
  }

  // Data
  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    const csvArr = [];

    for (let i = 1; i < csvRecordsArray.length; i++) {
      const curruntRecord = (csvRecordsArray[i]).split(',');
      if (curruntRecord.length === headerLength) {
        const csvRecord: CSVDataRecord = new CSVDataRecord();
        csvRecord.email = curruntRecord[0].trim();
        csvArr.push(csvRecord);
      }
    }
    return csvArr;
  }

  fileReset() {
    this.csvReader.nativeElement.value = '';
    this.records = [];
    this.jsondatadisplay = '';
  }

  removeDocument() {
    this.document = null;
  }

  uploadFile() {
    this.isLoading = true;
    this.saveCompanyUser(this.records);
  }

  ngOnDestroy(): void {
    if (this.req) { this.req.unsubscribe(); }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
