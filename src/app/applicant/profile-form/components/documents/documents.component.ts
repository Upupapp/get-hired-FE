import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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

  constructor(
    private rootFormGroup: FormGroupDirective,
    private dialog: MatDialog,
    public sanitizer: DomSanitizer,
    private recordService: RecordService,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit(): void { }

  getDocArray() {
    return (this.rootFormGroup.control.get([this.formGroupName, 'documents']) as FormArray).controls;
  }

  onUpload(item: any) {
    console.log(item);
    this.getDocArray().push(new FormGroup({
      file: new FormControl(item.file),
      filename: new FormControl(item.filename),
      size: new FormControl(item.size),
      type: new FormControl(item.type),
    }));
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
