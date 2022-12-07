import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from "@main/applicant/applicant.model";
import { RecorderComponent } from '@main/recorder/recorder.component';
import { RecordService } from '@main/recorder/recorder.service';
import { of, Subject, Subscription, takeUntil, tap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-documents',
  animations: [mainAnimations],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class DocumentsComponent implements OnInit {
  @Input() formGroupName: string;
  @ViewChild('preview') preview: any;
  private unsubscribe$ = new Subject<void>();
  previewBlob = null;
  docs;
  timer_value = 0;
  upload$: Subscription;
  downloadUrl: string;
  // docuArray: FormArray;
  myDate = new Date();

  constructor(
    private rootFormGroup: FormGroupDirective,
    private dialog: MatDialog,
    public sanitizer: DomSanitizer,
    private recordService: RecordService,
    private ref: ChangeDetectorRef,
    private applicantFacade: ApplicantFacade,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.docs = this.docArray.value;

    const url = this.videoUrl.value;
    if(url) {
      this.previewBlob = url;
    }
  }

  get docArray() {
    return this.rootFormGroup.control.get([this.formGroupName, 'documents']) as FormArray;
  }

  get videoUrl() {
    return this.rootFormGroup.control.get([this.formGroupName, 'videoCVUrl']) as FormControl;
  }

  get videoFile() {
    return this.rootFormGroup.control.get([this.formGroupName, 'videoCVFile']) as FormControl;
  }

  onUpload(docs: any) {
    this.docArray.reset();

    const array = docs.map(item => {
      return this.fb.group({
        file: new FormControl(item.file),
        filename: new FormControl(item.filename),
        size: new FormControl(item.size),
        type: new FormControl(item.type),
        fileurl: new FormControl(item.fileurl || ''),
        created_at: new FormControl(item.created_at || null)
      })
    });

    const mappingDoc = docs.map(doc => {
      return {
        ...doc,
        fileurl: doc.fileurl || null,
        created_at: doc.created_at || null
      }
    })

    console.log(array);
    this.docArray.controls = array;
    this.docArray.setValue(mappingDoc);

    console.log(this.docArray)

  }

  showVideoRecorder() {
    this.clearVid();
    let recorderDialog = this.dialog.open(RecorderComponent, {
      width: '70vw',
      data: {
        title: "Record Video Introduction"
      }
    });

    recorderDialog
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        if (result) {
          this.clearVid();
          this.previewBlob = result.blobUrl;
          this.videoFile.setValue(result.file);
          this.ref.detectChanges();
        }
      });
  }

  clearVid() {
    // this.preview.srcObject = null;
    this.previewBlob = null;
    this.ref.detectChanges();
  }

  upload(item) {
    const file = item.target.files[0];
    this.recordService.blobToBase64(file)
      .then(vid => this.videoFile.setValue(vid))
      .catch(err => console.log(err));

    this.previewBlob = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
  }

  downloadBlob() {
    const dlUrl$ = this.recordService.getRecordedUrl()
      .pipe(
        tap(url => {
          if (url) {
            const pipe = new DatePipe('en-US');
            const d = pipe.transform(this.myDate, 'yyyy-MM-dd');
            const anchor = document.createElement('a');
            anchor.download = `VideoCV-${d}`;
            anchor.href = url;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
          }
        })
      ).subscribe();
  }

  ngOnDestroy(): void {
    if (this.upload$) {
      this.upload$.unsubscribe();
    }
  }

}
