import { Component, Inject, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CandidateActionTypes } from '@main/shared/store/actions/candidate.action';
import { GroupActionTypes } from '@main/shared/store/actions/group.action';
import { StoreState } from '@main/shared/store/index';
import { CandidateState } from '@main/shared/store/reducers/candidate.reducer';
import { GroupState } from '@main/shared/store/reducers/group.reducer';
import { Subject, Observable, startWith, map } from 'rxjs';
import { CSVDataRecord } from './import-candidate-model';

@Component({
  selector: 'app-import-add-candidate',
  templateUrl: './import-add-candidate.component.html',
  styleUrls: ['./import-add-candidate.component.scss'],
  animations: [mainAnimations]
})
export class ImportAddCandidateComponent implements OnInit {
  public candidateForm: FormGroup;
  public importCandidateForm: FormGroup;
  public submitting: boolean = false;
  public importCandidate: boolean = false;
  public importing: boolean = false;
  private candidateData$: any;
  private groupData$: any;
  private req: Subscription = new Subscription;
  private groupReq: Subscription = new Subscription;
  private unsubscribe$ = new Subject<void>();
  public candidateList: any = {};
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
    public dialogRef: MatDialogRef<ImportAddCandidateComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    public snackBar: MatSnackBar,
    private candidateState: Store<StoreState>,
    private groupState: Store<StoreState>,
  ) {}

  ngOnInit(): void {
    this.localData = JSON.parse(this.localData);
    this.getJobList();
    this.getGroupList();
    this.candidateForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.email, Validators.required]],
      mobileNumber: [''],
      address: [''],
      jobId: ['', [Validators.required]],
      groupName: [''],
      groupId: ['']
    });
    // this.importCandidateForm = this.formBuilder.group({
    //   groupName: [''],
    //   groupId: ['']
    // });
    this.candidateData$ = this.candidateState.pipe(select(state => state.candidate));
    this.groupData$ = this.groupState.pipe(select(state => state.group));
    this.req =  this.candidateData$.subscribe((onboard: CandidateState) => {
      this.loading = onboard.pending;
      if(onboard.candidateRes){
        this.candidateList = onboard.candidateRes;
        this.isLoading = false;
        this.submitting = false;

        // NOTIFY-P2: check outcome before showing toast — never claim success
        // when candidateRes is a duplicate message object (status DUPLICATE_CANDIDATE).
        const res = onboard.candidateRes;
        const hasSummary = res && res.summary;
        let toastMsg = 'Candidate added.';
        let toastClass = 'success-snackbar';
        let toastDuration = 4000;
        if (hasSummary) {
          const { successCount = 0, duplicateCount = 0, failureCount = 0 } = res.summary;
          if (successCount > 0 && failureCount === 0) {
            toastMsg = successCount === 1 ? 'Candidate added.' : `${successCount} candidates added.`;
          } else if (successCount > 0 && failureCount > 0) {
            toastMsg = `${successCount} added. ${failureCount} couldn't be added.`;
            toastClass = 'warning-snackbar';
            toastDuration = 6000;
          } else if (duplicateCount > 0) {
            toastMsg = 'No new candidates were added. These candidates are already in your list.';
            toastClass = 'info-snackbar';
            toastDuration = 6000;
          } else {
            toastMsg = 'No candidates were added.';
            toastClass = 'danger-snackbar';
            toastDuration = 6000;
          }
        } else {
          // Single candidate — check status field added by NOTIFY-P2 BE patch.
          const isDuplicate = res && res.status === 'DUPLICATE_CANDIDATE';
          if (isDuplicate) {
            toastMsg = 'This candidate is already in your list.';
            toastClass = 'info-snackbar';
            toastDuration = 5000;
          }
        }
        this.snackBar.open(toastMsg, '', { duration: toastDuration, panelClass: toastClass });

        if(!this.importCandidate){
          this.candidateState.dispatch({
            type:CandidateActionTypes.SAVE_CANDIDATE_SUCCESS,
            payload: null
          });
        } else {
          this.candidateState.dispatch({
            type:CandidateActionTypes.SAVE_CANDIDATE_MULTIPLE_SUCCESS,
            payload: null
          });
        }
        this.close();
      }

      if(onboard.jobId){
        this.jobList = onboard.jobId;
        this.isLoading = false;
        this.submitting = false;
      }

      if(onboard.error){
        this.snackBar.open("Something went wrong please try again later or contact your administrator", "", {
          duration: 4000,
          panelClass:'danger-snackbar'
        });
        this.close();

        this.candidateState.dispatch({
          type:CandidateActionTypes.SAVE_CANDIDATE_FAIL,
          payload: null
        });

        this.candidateState.dispatch({
          type:CandidateActionTypes.SAVE_CANDIDATE_MULTIPLE_FAIL,
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

    this.filteredOptions = this.candidateForm.get("groupName").valueChanges.pipe(
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
    this.importCandidate = false;
    this.importing = true;
  }

  submitForm(){
    this.isLoading = true;
    this.saveOnboard();
    this.importing = false;
    this.uploadedFile = undefined;
    this.candidateForm.reset();
    this.candidateList = [];
  }

  addMoreContact(){
    this.submitting = false;
    this.removeDocument();
    this.importCandidate = false;
  }

  saveOnboard(){
    // this.candidateForm.get("groupName")?.patchValue(this.setGroupName(this.candidateForm.controls['groupName'].value));
    // this.candidateForm.get("groupId")?.patchValue(this.setGroupId(this.candidateForm.controls['groupName'].value));
    let data = {
      ...this.candidateForm.value,
      userId: this.localData._id,
      companyId: this.localData.companyId
    }
    this.candidateState.dispatch({
      type: CandidateActionTypes.SAVE_CANDIDATE,
      payload: data
    });
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
      this.importCandidateForm = this.formBuilder.group({
        groupName: [''],
        groupId: ['']
      });
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
        csvRecord.jobId = curruntRecord[5].trim();
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
    // this.importCandidateForm.get("groupName")?.patchValue(this.setGroupName(this.importCandidateForm.controls['groupName'].value));
    // this.importCandidateForm.get("groupId")?.patchValue(this.setGroupId(this.importCandidateForm.controls['groupName'].value));
      let data = {
        ...this.importCandidateForm.value,
        candidate: [...this.records]
      }
      if(this.importCandidate) {
        this.candidateState.dispatch({
          type: CandidateActionTypes.SAVE_CANDIDATE_MULTIPLE,
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
      this.candidateForm.get("avatar")?.patchValue(reader.result);
      fileObject.file = reader.result;
      this.logo = fileObject;
    };
  }

  removeImage(){
    this.logo = null;
    this.candidateForm.get("avatar")?.patchValue(null);
  }

  getJobList(){
    this.candidateState.dispatch({
      type:CandidateActionTypes.GET_CANDIDATE_JOB,
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
