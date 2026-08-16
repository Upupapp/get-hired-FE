import { Component, Inject, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CompanyFacade } from '@app-company/state/company.facade';
import * as TeamModel from '@app-company/team-access.model';
import { ROLE_GROUPS, CUSTOM_ROLE_GROUP, groupKeyForRole, groupLabelFor } from '@app-company/role-groups';
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
  public loading: boolean = false;
  private unsubscribe$ = new Subject<void>();
  public invitedUsersList: InviteResult[] = [];
  public document: any = null;
  public fileData: any;

  // Phase 3+4: result panel state
  public showResultPanel: boolean = false;
  public successCount: number = 0;
  public failedEmails: InviteResult[] = [];
  public allFailed: boolean = false;

  // Job-scoped RBAC V1/V3: role + access-scope selection
  public roles: TeamModel.TeamRole[] = [];
  public selectedRoleId: string = '';
  public selectedScope: TeamModel.AccessScope = 'all_jobs';
  public selectedJobIds: string[] = [];
  public roleSearchTerm = '';
  public roleGroups: { key: string; label: string; roles: TeamModel.TeamRole[] }[] = [];
  public expandedGroups: { [key: string]: boolean } = {};
  public helpChooseOpen = false;

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
    private companyFacade: CompanyFacade,
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

    this.companyFacade.getTeamRoles();
    this.companyFacade.teamRoles$.pipe(takeUntil(this.unsubscribe$)).subscribe(roles => {
      this.roles = roles || [];
      if (!this.selectedRoleId && this.roles.length > 0) {
        this.selectedRoleId = this.roles[0].roleId;
      }
      this.buildRoleGroups();
    });

    this.companyFacade.loading$.pipe(takeUntil(this.unsubscribe$)).subscribe(loading => this.loading = loading);

    this.companyFacade.inviteResult$.pipe(
      filter(result => !!result),
      takeUntil(this.unsubscribe$)
    ).subscribe(result => {
      const emails: InviteResult[] = result.invites || [];
      if (emails.length === 0) { return; }

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
    });
  }

  get selectedRole(): TeamModel.TeamRole | null {
    return this.roles.find(r => r.roleId === this.selectedRoleId) || null;
  }

  private buildRoleGroups(): void {
    const term = this.roleSearchTerm.trim().toLowerCase();
    const filtered = term
      ? this.roles.filter(r => r.name.toLowerCase().includes(term) || (r.description || '').toLowerCase().includes(term))
      : this.roles;

    const byGroup: { [key: string]: TeamModel.TeamRole[] } = {};
    for (const role of filtered) {
      const key = groupKeyForRole(role);
      if (!byGroup[key]) { byGroup[key] = []; }
      byGroup[key].push(role);
    }
    this.roleGroups = Object.keys(byGroup).map(key => ({ key, label: groupLabelFor(key), roles: byGroup[key] }));
    for (const g of this.roleGroups) {
      if (this.expandedGroups[g.key] === undefined) { this.expandedGroups[g.key] = true; }
    }
  }

  onRoleSearchChange(term: string): void {
    this.roleSearchTerm = term;
    this.buildRoleGroups();
  }

  toggleRoleGroup(key: string): void {
    this.expandedGroups[key] = !this.expandedGroups[key];
  }

  selectRole(roleId: string): void {
    this.selectedRoleId = roleId;
  }

  applyHelpChooseRecommendation(rec: { roleKey: string; scope: TeamModel.AccessScope }): void {
    const match = this.roles.find(r => r.roleKey === rec.roleKey);
    if (match) {
      this.selectedRoleId = match.roleId;
    }
    this.onScopeChange(rec.scope);
  }

  get canSubmit(): boolean {
    if (!this.selectedRoleId) { return false; }
    if (this.selectedScope === 'assigned_jobs' && this.selectedJobIds.length === 0) { return false; }
    return this.emailArray.length > 0 || (this.inviteForm && !!this.inviteForm.controls['email'].value);
  }

  onScopeChange(scope: TeamModel.AccessScope): void {
    this.selectedScope = scope;
    if (scope !== 'assigned_jobs') {
      this.selectedJobIds = [];
    }
  }

  onJobIdsChange(jobIds: string[]): void {
    this.selectedJobIds = jobIds;
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

  saveCompanyUser(value: { email: string }[]) {
    if (!this.selectedRoleId) { return; }
    const invites: TeamModel.InviteMemberRequest[] = value.map(v => ({
      email: v.email,
      roleId: this.selectedRoleId,
      accessScope: this.selectedScope,
      jobIds: this.selectedScope === 'assigned_jobs' ? this.selectedJobIds : undefined,
    }));
    this.companyFacade.inviteTeamMembers(invites);
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
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
