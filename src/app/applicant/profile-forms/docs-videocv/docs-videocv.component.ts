import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ConfirmationDialogComponent } from '@app-shared/components/confirmation-dialog/confirmation-dialog.component';
import { LoadingComponent } from '@app-shared/components/loading/loading.component';
import { RecorderComponent } from '@main/recorder/recorder.component';
import { Subject, Subscription, takeUntil } from 'rxjs';
import * as Model from '../../applicant.model';

@Component({
  selector: 'app-docs-videocv',
  templateUrl: './docs-videocv.component.html',
  styleUrls: ['./docs-videocv.component.scss'],
  animations: [mainAnimations]
})
export class DocsVideocvComponent implements OnInit {
  @Input() user: any;
  @Input() applicantProfileId: string;

  docs: Model.Documents[] = [];
  tempDocs: Model.Documents[] = [];

  previewBlob = null;
  videoFile: File;
  videoUrl: string;

  private unsubscribe$ = new Subject<void>();
  recording$: Subscription;
  confirmation$: Subscription;

  loading$ = this.applicantFacade.loading$
    .pipe().subscribe(this.formLoading.bind(this));

  success$ = this.applicantFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this))

  documents$ = this.applicantFacade.documents$
    .pipe().subscribe(this.fillUpArrays.bind(this));

  video$ = this.applicantFacade.videoCV$
    .pipe().subscribe(this.getVideoUrl.bind(this))

  constructor(
    private dialog: MatDialog,
    private applicantFacade: ApplicantFacade,
    private snackbarService: SnackbarService,
    private loadingDialog: MatDialog,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // QA10 FIX-9 + SEC-03: surface saveVideoCV errors with BE rejection message.
    // err.error.message carries the video validation reason (VIDEO_DISALLOWED,
    // VIDEO_SIGNATURE_MISMATCH, etc.) set by the backend; fall back to the HTTP
    // error text if not present. Clear the local preview on rejection so the
    // rejected file is never shown as if it were accepted.
    this.applicantFacade.error$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((err) => {
        if (err) {
          const backendMsg = (err.error && err.error.message) ? err.error.message : null;
          const msg = backendMsg || err.message || 'An error occurred. Please try again.';
          this.snackbarService.error(msg, '', 6000);
          this.previewBlob = null;
          this.videoFile = null;
          this.ref.detectChanges();
        }
      });
  }

  onUpload(docu: any) {

    const array = docu.map(item => {
      return {
        ...item,
        fileurl: item.fileurl || null,
        created_at: item.created_at || null
      }
    });

    this.tempDocs = [...array];
    console.log(this.tempDocs);
  }

  uploadDocs() {
    this.applicantFacade.saveDocs(this.docs, this.applicantProfileId);
  }

  getVideoUrl(vid) {
    if (vid.videoCVUrl) {
      this.videoUrl = vid.videoCVUrl;
    }
  }

  removeUploadVideo() {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true,
      data: {
        action: `Delete this video`,
      },
    });

    this.confirmation$ = ref
      .afterClosed()
      .pipe()
      .subscribe((result) => {
        if (result == 1) {
          const video: Model.VideoCV = {
            videoCVFile: null,
            videoCVUrl: null
          };
          this.applicantFacade.saveVideo(video, this.applicantProfileId);
        }
      });
  }

  fillUpArrays(data) {
    console.log(data);
    if (data) {
      this.docs = [...data]
    } else {
      this.docs = [];
    }

  }

  afterSubmit(event) {
    if (event == 'updated') {
      this.snackbarService.success(`Profile successfully updated`, '');
    } else if (event == 'deleted') {
      this.previewBlob = null;
      this.videoUrl = null;

      this.snackbarService.success(`Video successfully deleted`, '');
    }
  }

  submitVideo() {
    const video: Model.VideoCV = {
      videoCVFile: this.videoFile,
      videoCVUrl: this.videoUrl
    };
    this.applicantFacade.saveVideo(video, this.applicantProfileId);
  }

  showVideoRecorder() {
    this.clearVid();
    let recorderDialog = this.dialog.open(RecorderComponent, {
      width: '70vw',
      data: {
        title: "Record Video Introduction"
      }
    });

    this.recording$ = recorderDialog
      .afterClosed()
      .pipe()
      .subscribe(result => {
        if (result) {
          this.clearVid();
          this.previewBlob = result.blobUrl;
          this.videoFile = result.file;

          // this.videoFile.setValue(result.file);
          this.ref.detectChanges();
        }
      });
  }

  upload(event) {

  }

  clearVid() {

  }

  formLoading(loading: boolean) {
    if (loading) {
      const ref = this.loadingDialog.open(LoadingComponent, {
        disableClose: true,
        data: {
          selfClose: false
        }
      });
    } else {
      setTimeout(() => this.loadingDialog.closeAll(), 3000);
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.success$) {
      this.success$.unsubscribe();
    }

    if (this.documents$) {
      this.documents$.unsubscribe();
    }

    if (this.loading$) {
      this.loading$.unsubscribe();
    }

    if (this.recording$) {
      this.recording$.unsubscribe();
    }

    if (this.confirmation$) {
      this.confirmation$.unsubscribe();
    }
  }
}
