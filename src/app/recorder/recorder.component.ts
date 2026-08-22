import { AfterViewInit, Component, OnInit, ViewChild, Inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RecordService } from './recorder.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import RecordRTC from "recordrtc";

interface RecordedVideoOutput {
  blob: Blob;
  url: string;
  title: string;
}

// PROFILE-SETUP PHASE 1 (VIDEO HARDENING): mirrors the backend's actual
// accepted containers (magic-byte validated: WebM, MP4/M4V, MOV -- see
// get-hired-BE helpers/videoValidator.js) and its 100MB limit
// (VIDEO_CV_MAX_BYTES). Frontend-only, UX-fail-fast -- the backend remains
// the authoritative check; this only avoids a full upload round-trip for
// a file that can never be accepted.
const ALLOWED_VIDEO_TYPES = ['video/webm', 'video/mp4', 'video/x-m4v', 'video/quicktime'];
const ALLOWED_VIDEO_EXTENSIONS = ['.webm', '.mp4', '.m4v', '.mov'];
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB, matches backend exactly

@Component({
  selector: 'app-recorder',
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class RecorderComponent implements OnInit, AfterViewInit {
  @ViewChild('videoElement') videoElement: any;

  video: any;
  isPlaying = false;
  displayControls = true;
  isVideoRecording = false;
  isVideoInitialising = false;
  videoRecordingError: string | null = null;
  videoRecordedTime;
  videoBlobUrl;
  videoBlob;
  videoName;
  videoFile;
  videoStream: MediaStream;
  videoSrc: string;
  audioSrc: string;
  audioOut: string;
  videoConf: any;
  public timer_value: number = 0;
  public time: number = 0;
  public interval;
  public display: any = '00:00';

  // PROFILE-SETUP PHASE 1: the raw (unwrapped) object URL for the
  // file-upload preview path, tracked separately from videoBlob (which is
  // wrapped via DomSanitizer.bypassSecurityTrustUrl into an opaque SafeUrl
  // that can't be handed to URL.revokeObjectURL directly). Only one should
  // ever be alive at a time.
  private uploadedObjectUrl: string | null = null;
  // True once uploadedObjectUrl has been handed to the dialog caller (see
  // upload()) -- the caller (docs-videocv.component.ts) keeps using that
  // exact URL for its own preview after this dialog closes, so ownership
  // of revoking it transfers too. Must NOT revoke on destroy in that case.
  private objectUrlOwnershipTransferred = false;
  // PROFILE-SETUP PHASE 1: method-level in-flight guard for file upload --
  // async blobToBase64() means a rapid double-click on "Upload Video
  // Instead" could otherwise start two conversions/dialog-closes.
  private uploadInFlight = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<RecorderComponent>,
    private ref: ChangeDetectorRef,
    private recordService: RecordService,
    private sanitizer: DomSanitizer,
  ) {
    // PROFILE-SETUP PHASE 1.1: this fires alongside the SAME failure that
    // startVideoRecording()'s own .catch() below already handles with a
    // specific, mapped message (mapCameraError) -- this subject discards
    // the real error (`_recordingFailed.next(null)` in recorder.service.ts)
    // so it can only ever produce a generic message. Setting a second,
    // worse message here would just race the specific one for the same
    // failure. Keep the state resets (safety net for any other caller of
    // this observable), drop the message.
    this.recordService.recordingFailed().subscribe(() => {
      this.isVideoRecording = false;
      this.isVideoInitialising = false;
      this.ref.detectChanges();
    });

    this.recordService.getRecordedTime().subscribe((time) => {
      this.videoRecordedTime = time;
      this.ref.detectChanges();
    });

    this.recordService.getStream().subscribe((stream) => {
      this.videoStream = stream;
      this.ref.detectChanges();
    });

    this.recordService.getBase64().subscribe((data) => {
      this.videoFile = data;
      this.ref.detectChanges();
    });

    this.recordService.getRecordedBlob().subscribe((data) => {
      this.videoBlob = data.blob;
      this.videoName = data.title;
      this.videoBlobUrl = this.sanitizer.bypassSecurityTrustUrl(data.url);
      this.ref.detectChanges();
    });
  }

  ngAfterViewInit() {
    this.video = this.videoElement.nativeElement;
  }

  ngOnInit() {

  }

  startVideoRecording() {
    this.startTimer();
    this.videoConf = { video: { deviceId: this.videoSrc, facingMode: "user", width: 320 }, audio: { deviceId: this.audioSrc } }

    this.videoConf['video'].deviceId = this.videoSrc;
    if (!this.isVideoRecording && !this.isVideoInitialising) {
      // PROFILE-SETUP PHASE 1.1 (Record Again): this same button doubles as
      // "Record Again" whenever a previous recorded preview already exists
      // (isVideoRecording is false in both the pre-recording and
      // recorded-preview states). Clear the prior recording's state before
      // starting the new one, so the stale recorded preview never lingers
      // alongside -- or gets uploaded instead of -- the new recording.
      this.videoBlobUrl = null;
      this.videoBlob = null;
      this.videoName = null;
      this.video.controls = false;
      this.video.muted = true;
      this.video.volume = 0;
      this.videoRecordingError = null;
      this.isVideoInitialising = true;
      this.ref.detectChanges();
      this.recordService.startRecording(this.videoConf)
        .then(stream => {
          this.isVideoInitialising = false;
          this.isVideoRecording = true;
          this.video.srcObject = stream;
          this.video.play();
          this.ref.detectChanges();
        })
        .catch((err) => {
          this.isVideoInitialising = false;
          // PROFILE-SETUP PHASE 1.1: distinguish the actual getUserMedia()
          // DOMException rather than one generic message for every camera
          // failure -- these are the real, standard error names browsers
          // raise (never the raw DOMException text as primary UX).
          this.videoRecordingError = this.mapCameraError(err);
          this.ref.detectChanges();
        });
    }
  }

  /**
   * PROFILE-SETUP PHASE 1.1: maps a getUserMedia() rejection to one of the
   * 3 standard, actionable cases -- never shows the raw DOMException text
   * as primary UX.
   */
  private mapCameraError(err: any): string {
    const name = err && err.name;
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return 'Camera/microphone access was denied. Please allow access in your browser settings and try again.';
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return 'No camera or microphone was found on this device.';
    }
    if (name === 'NotReadableError' || name === 'TrackStartError') {
      return 'Your camera or microphone is unavailable or already in use by another application.';
    }
    return 'Could not access camera. Please check permissions and try again.';
  }

  abortVideoRecording() {
    if (this.isVideoRecording) {
      this.isVideoRecording = false;
      this.recordService.abortRecording();
      // PROFILE-SETUP PHASE 1.1: release the element's own reference to the
      // now-stopped stream -- abortRecording() already stops the tracks at
      // the service level (recorder.service.ts stopMedia()); this clears
      // the video element's live attachment too.
      this.video.srcObject = null;
      this.video.controls = false;
    }
  }

  stopVideoRecording() {
    if (this.isVideoRecording) {
      this.pauseTimer();
      this.recordService.stopRecording();
      // PROFILE-SETUP PHASE 1.1: was assigning the recorded blob's URL
      // (a SafeUrl/string) directly to srcObject -- srcObject only ever
      // accepts a MediaStream/MediaSource/Blob, never a URL string, so this
      // silently failed to show the recorded playback. Clear srcObject
      // (releasing the now-finished live stream, which
      // recordService.stopRecording() -> processVideo() -> stopMedia()
      // already stops at the track level) and let the template's own
      // [src]="videoBlobUrl" binding (via the <source> tag, active once
      // isVideoRecording flips false) show the recorded blob instead --
      // keeps LIVE (srcObject) and RECORDED (src/ObjectURL) cleanly
      // separate, per the Live vs Recorded requirement.
      this.video.srcObject = null;
      this.isVideoRecording = false;
      this.video.controls = true;
    }
  }

  previewVideoRecording() {
    this.dialogRef.close({ blobUrl: this.videoBlobUrl, file: this.videoFile });
  }

  clearVideoRecordedData() {
    // PROFILE-SETUP PHASE 1: the upload-preview object URL becomes obsolete
    // the moment the recorded/preview state it belonged to is cleared --
    // unless ownership already transferred to the dialog caller (see
    // upload()/objectUrlOwnershipTransferred), which still needs it.
    if (this.uploadedObjectUrl && !this.objectUrlOwnershipTransferred) {
      URL.revokeObjectURL(this.uploadedObjectUrl);
      this.uploadedObjectUrl = null;
    }
    this.videoBlobUrl = null;
    this.video.srcObject = null;
    this.video.controls = false;
    this.ref.detectChanges();
  }

  upload(item) {
    // PROFILE-SETUP PHASE 1: duplicate-submit guard -- blobToBase64() is
    // async, so a rapid second file-select event before the first resolves
    // must not start a second conversion.
    if (this.uploadInFlight) return;

    const file = item.target.files[0];
    if (!file) return;

    const validationError = this.validateVideoFile(file);
    if (validationError) {
      this.videoRecordingError = validationError;
      this.ref.detectChanges();
      // Clear the input so re-selecting the same (still-invalid) file
      // re-fires the change event.
      item.target.value = '';
      return;
    }
    this.videoRecordingError = null;

    this.uploadInFlight = true;
    this.recordService.blobToBase64(file)
      .then(vid => {
        // Revoke the previous upload preview's object URL (if any) before
        // creating a new one -- only one should ever be alive at a time.
        if (this.uploadedObjectUrl) {
          URL.revokeObjectURL(this.uploadedObjectUrl);
        }
        this.uploadedObjectUrl = URL.createObjectURL(file);
        this.videoBlob = this.sanitizer.bypassSecurityTrustUrl(this.uploadedObjectUrl);
        this.uploadInFlight = false;
        this.objectUrlOwnershipTransferred = true;
        // rawObjectUrl lets the caller (docs-videocv.component.ts) revoke
        // this exact URL later, once ITS preview is replaced/cleared/
        // destroyed -- blobUrl alone is a SafeUrl and can't be passed to
        // URL.revokeObjectURL.
        this.dialogRef.close({ blobUrl: this.videoBlob, file: vid, rawObjectUrl: this.uploadedObjectUrl });
      }).catch(err => {
        this.uploadInFlight = false;
        this.videoRecordingError = 'Could not read this video file. Please try again.';
        this.ref.detectChanges();
      });
  }

  /** Returns a user-facing error string if the file is clearly unsupported, else null. */
  private validateVideoFile(file: File): string | null {
    const nameLower = (file.name || '').toLowerCase();
    const hasAllowedExtension = ALLOWED_VIDEO_EXTENSIONS.some(ext => nameLower.endsWith(ext));
    // file.type is browser-reported and not always populated (e.g. some
    // OS/browser combos leave it blank for less-common containers) -- accept
    // if EITHER the declared MIME type or the extension matches, since this
    // is a fail-fast UX check only; the backend's magic-byte validation is
    // what actually gates acceptance.
    const hasAllowedType = !!file.type && ALLOWED_VIDEO_TYPES.includes(file.type);
    if (!hasAllowedType && !hasAllowedExtension) {
      return 'Unsupported video format. Please upload an MP4, WebM, or MOV file.';
    }
    if (file.size > MAX_VIDEO_BYTES) {
      return 'This video is too large (max 100 MB). Please choose a smaller file.';
    }
    return null;
  }

  downloadVideoRecordedData() {
    this._downloadFile(this.videoBlob, 'video/webm', this.videoName);
  }

  _downloadFile(data: any, type: string, filename: string): any {
    const blob = new Blob([data], { type: type });
    const url = window.URL.createObjectURL(blob);
    //this.video.srcObject = stream;
    //const url = data;
    const anchor = document.createElement('a');
    anchor.download = filename;
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  startTimer() {
    this.interval = setInterval(() => {
      if (this.time === 0) {
        this.time++;
      } else {
        this.time++;
      }
      this.timer_value += 1;
      this.display = this.transform(this.time)
    }, 1000);
  }

  stopRecorderTimer() {
    this.pauseTimer();
    this.timer_value = 0;
    this.display = '00:00';
    this.time = 0;
    clearInterval(this.timer_value);
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
  }

  cancel() {
    this.abortVideoRecording();
    this.dialogRef.close(null);
  }

  ngOnDestroy(): void {
    this.stopRecorderTimer();
    // PROFILE-SETUP PHASE 1.1: this dialog is opened without disableClose
    // (docs-videocv.component.ts showVideoRecorder()), so it can be
    // dismissed via backdrop click or Escape -- bypassing cancel() (the
    // only place that previously stopped the camera) entirely. Without
    // this, an active recording's camera/microphone would keep running
    // after the dialog closes that way, leaving the browser's camera
    // indicator on. abortVideoRecording() is a no-op if nothing is
    // currently recording, so this is always safe to call.
    this.abortVideoRecording();
    // PROFILE-SETUP PHASE 1: revoke the upload-preview object URL when this
    // dialog is destroyed WITHOUT having handed it off to the caller (e.g.
    // cancel()) -- never revoke it once ownership transferred (see
    // upload()), since the caller's own preview depends on that exact URL
    // staying valid after this component is gone.
    if (this.uploadedObjectUrl && !this.objectUrlOwnershipTransferred) {
      URL.revokeObjectURL(this.uploadedObjectUrl);
      this.uploadedObjectUrl = null;
    }
  }
}
