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
import { CvBuilderService } from '@app-applicant/cv-builder/cv-builder.service';

interface CurrentCv {
  id: string;
  filename: string;
  fileurl: string;
  size?: number;
  type?: string;
  created_at: string;
}

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

  // PROFILE-SETUP PHASE 1 (VIDEO HARDENING): raw object URL backing
  // previewBlob when it came from a local file upload (recorder.component.ts
  // hands this off via rawObjectUrl on dialog close) -- tracked separately
  // since previewBlob itself is a SafeUrl and can't be passed to
  // URL.revokeObjectURL directly. Revoked whenever the preview is replaced,
  // cleared, or this component is destroyed -- never while still in use.
  private previewObjectUrl: string | null = null;
  // Duplicate-submit guard for Submit Video -- the disabled-button binding
  // alone leaves a window before Angular re-renders.
  private videoSubmitInFlight = false;

  // RESUME/CV FRAGMENTATION FIX: this page's original "Profile Documents"
  // uploader (docs/tempDocs below, via applicantFacade.saveDocs()) writes
  // to the same gethired.documents table as the dedicated CV Builder
  // (/cv-builder/upload, /cv-builder/current) but deliberately excludes
  // is_cv=true rows (see applicantsController.js's saveDocuments -- "CV
  // Builder stays the single source of truth for 'the current CV'"). That
  // left this page with no way to actually set a CV at all: an applicant
  // uploading their resume here (the page most people would naturally use
  // first) never had it recognized as "their CV" anywhere else in the app
  // -- the job-application Resume auto-fill and the CV Builder Overview
  // tab both read exclusively from the is_cv=true row, which this page
  // never touched. Adds a dedicated CV upload slot, wired to the exact
  // same /cv-builder endpoints CV Builder itself uses, so there is exactly
  // one CV per applicant and every surface in the app agrees on what it is.
  currentCv: CurrentCv | null = null;
  loadingCurrentCv = true;
  uploadingCv = false;
  cvUploadError: string | null = null;

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
    private ref: ChangeDetectorRef,
    private cvBuilderService: CvBuilderService,
  ) { }

  ngOnInit(): void {
    this.loadCurrentCv();
    // QA10 FIX-9 + SEC-03: surface saveVideoCV errors with BE rejection message.
    // err.error.message carries the video validation reason (VIDEO_DISALLOWED,
    // VIDEO_SIGNATURE_MISMATCH, etc.) set by the backend; fall back to the HTTP
    // error text if not present. Clear the local preview on rejection so the
    // rejected file is never shown as if it were accepted.
    this.applicantFacade.error$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((err) => {
        if (err) {
          // PROFILE-SETUP PHASE 1.1: previously `(err.error && err.error.message)`
          // -- written assuming `err` was the raw HttpErrorResponse, but by
          // the time it reaches here it's already state.error (the effect's
          // unwrapped payload), so err.error was never the right shape and
          // this ALWAYS fell through to the one generic message regardless
          // of what actually failed (413, 500, network, invalid format all
          // looked identical to the user). applicant.effects.ts's
          // saveVideoCV$ now emits a structured { status, message } payload
          // specifically for video failures -- mapVideoUploadError() below
          // turns that into an accurate, actionable message per HTTP status.
          // Other sections' (skills/workexp/docs) unfixed effects still
          // emit their old bare-string-or-undefined shape here too (this
          // component's error$ is shared across the whole wizard) -- those
          // safely fall through mapVideoUploadError's default branch
          // instead of matching a video-specific case.
          const msg = this.mapVideoUploadError(err);
          if (msg) {
            this.snackbarService.error(msg, '', 6000);
          }
          // PROFILE-SETUP PHASE 1: reset the duplicate-submit guard on this
          // handled failure, and release the rejected preview's object URL
          // -- the existing videoUrl (server-persisted video, if any)
          // remains untouched and becomes the visible preview again once
          // previewBlob is cleared, per the "A remains authoritative on a
          // failed B" requirement.
          this.videoSubmitInFlight = false;
          this.releasePreviewObjectUrl();
          this.previewBlob = null;
          this.videoFile = null;
          this.ref.detectChanges();
        }
      });
  }

  loadCurrentCv(): void {
    this.loadingCurrentCv = true;
    this.cvBuilderService.getCurrentCv().subscribe({
      next: (res: any) => {
        this.currentCv = res?.data || null;
        this.loadingCurrentCv = false;
      },
      error: () => {
        this.currentCv = null;
        this.loadingCurrentCv = false;
      },
    });
  }

  onCvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.uploadingCv = true;
      this.cvUploadError = null;
      this.cvBuilderService.uploadCv(reader.result as string, file.name).subscribe({
        next: (res: any) => {
          this.uploadingCv = false;
          if (res?.data) {
            this.currentCv = res.data;
          }
          this.snackbarService.success('Your CV has been uploaded.', '', 4000);
        },
        error: (err) => {
          this.uploadingCv = false;
          const body = err?.error;
          this.cvUploadError = body?.message || "We couldn't process that file right now.";
          this.snackbarService.error(this.cvUploadError, '', 6000);
        },
      });
    };
    reader.readAsDataURL(file);
    // Allow re-selecting the same filename to re-trigger onChange next time.
    input.value = '';
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
    // PROFILE-SETUP PHASE 1: reset the video duplicate-submit guard on any
    // handled success/failure outcome, matching the existing pattern below
    // in the applicantFacade.error$ subscription.
    this.videoSubmitInFlight = false;

    if (event == 'updated') {
      this.snackbarService.success(`Profile successfully updated`, '');
      // A successful video submit means the just-uploaded preview is now
      // the persisted server video -- release the local object URL, the
      // rendered <video> switches to videoUrl (the backend URL) once
      // video$ re-emits.
      this.releasePreviewObjectUrl();
    } else if (event == 'deleted') {
      this.releasePreviewObjectUrl();
      this.previewBlob = null;
      this.videoUrl = null;

      this.snackbarService.success(`Video successfully deleted`, '');
    }
  }

  submitVideo() {
    // PROFILE-SETUP PHASE 1: duplicate-submit guard -- the [disabled]
    // binding in the template is the only other protection and can lag a
    // frame behind a fast double-click.
    if (this.videoSubmitInFlight) return;
    this.videoSubmitInFlight = true;

    const video: Model.VideoCV = {
      videoCVFile: this.videoFile,
      videoCVUrl: this.videoUrl
    };
    this.applicantFacade.saveVideo(video, this.applicantProfileId);
  }

  showVideoRecorder() {
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
          // PROFILE-SETUP PHASE 1: revoke the PREVIOUS local preview's
          // object URL (if any) before replacing it with the new one --
          // otherwise every re-record/re-select before submitting leaks
          // one more object URL.
          this.releasePreviewObjectUrl();
          this.previewBlob = result.blobUrl;
          this.previewObjectUrl = result.rawObjectUrl || null;
          this.videoFile = result.file;

          this.ref.detectChanges();
        }
      });
  }

  /**
   * PROFILE-SETUP PHASE 1.1 (video error UX): maps a video save failure to
   * one specific, actionable, user-safe message per HTTP status. Returns
   * null for 401/403 -- UnAuthorizedInterceptor (core/interceptor/
   * unauthorize.interceptor.ts) already shows its own session-expired
   * snackbar and redirects for both those statuses on EVERY request app-
   * wide; showing a second, video-specific message here would just be a
   * duplicate notification for the same event.
   */
  private mapVideoUploadError(err: any): string | null {
    // Only handles the new structured { status, message } shape emitted by
    // saveVideoCV$'s catchError. Anything else (other sections' unfixed
    // effects, or a shape we don't recognize) falls through to the
    // existing generic message rather than guessing.
    const hasStructuredShape = err && typeof err === 'object' && typeof err.status === 'number';
    if (!hasStructuredShape) {
      return 'An error occurred. Please try again.';
    }

    const { status, message } = err;

    if (status === 413) {
      return 'Your video is too large to upload. Please try a shorter or smaller video file and try again.';
    }
    if (status === 401 || status === 403) {
      return null;
    }
    if (status === 400 || status === 415) {
      // Preserve the backend's own safe rejection reason when present
      // (VIDEO_TOO_LARGE, VIDEO_DISALLOWED, VIDEO_SIGNATURE_MISMATCH, etc.)
      // -- it's already written to be user-facing (see
      // applicantsController.js saveVideoCV / videoValidator.js).
      return message || 'Please upload a supported video format (MP4, WebM, or MOV).';
    }
    if (status >= 500) {
      return "We couldn't upload your video because of a server error. Your current profile video has not been changed. Please try again.";
    }
    if (status === 0) {
      return "We couldn't reach the server. Please check your internet connection and try again.";
    }
    return message || 'An error occurred. Please try again.';
  }

  /** Revokes the local preview's object URL, if one is currently held. Safe to call when none exists. */
  private releasePreviewObjectUrl(): void {
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }
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
    // PROFILE-SETUP PHASE 1: release any still-local (never-submitted)
    // preview object URL when this component goes away.
    this.releasePreviewObjectUrl();
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
