import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from "@main/applicant/applicant.model";
import { RecorderComponent } from '@main/recorder/recorder.component';
import { RecordService } from '@main/recorder/recorder.service';
import { Subject, Subscription, takeUntil, tap } from 'rxjs';

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
  previewBlob;
  // docuArray: FormArray;

  constructor(
    private rootFormGroup: FormGroupDirective,
    private dialog: MatDialog,
    public sanitizer: DomSanitizer,
    private recordService: RecordService,
    private ref: ChangeDetectorRef,
    private applicantFacade: ApplicantFacade,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void { }

  get docArray() {
    return this.rootFormGroup.control.get([this.formGroupName, 'documents']) as FormArray;
  }

  onUpload(docs: any) {
    console.log(docs);
    docs.map(item => {
      const fileGroup = this.fb.group({
        file: new FormControl(item.file),
        filename: new FormControl(item.filename),
        size: new FormControl(item.size),
        type: new FormControl(item.type)
      })
      this.docArray.push(fileGroup);
    });

    console.log(this.docArray)

    // this.applicantFacade.setProfileDocu(this.docuArray.value);

  }

  showVideoRecorder() {
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
        if(result) {
          this.previewBlob = result;
          this.ref.detectChanges();
        }
      });
  }

  ngOnDestroy(): void { }

}
