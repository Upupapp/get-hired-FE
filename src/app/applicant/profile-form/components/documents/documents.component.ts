import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from "@main/applicant/applicant.model";
import { RecorderComponent } from '@main/recorder/recorder.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-documents',
  animations: [mainAnimations],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  @Input() formGroupName: string;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private rootFormGroup: FormGroupDirective,
    private dialog: MatDialog
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
      width: '70vw'
    });

    recorderDialog
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        console.log(result);

        const videoPreview = window.URL.createObjectURL(result);
        console.log(videoPreview);
        // this.videoChunks = [];
        // this.preview.nativeElement.src = videoPreview;
      });
  }

}
