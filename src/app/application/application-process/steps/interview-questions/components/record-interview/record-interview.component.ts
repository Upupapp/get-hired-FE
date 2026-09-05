import { Component, OnInit, OnChanges, SimpleChanges, Input, ViewChild, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Subscription,
  Observable,
  forkJoin,
  combineLatest
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as Model from '@main/interview/interview.model';
import { CoreService } from '@app-core/services/core.service';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';
import { RecordService } from '@main/recorder/recorder.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SnackbarService } from '@app-core/services/snackbar.service';

@Component({
  selector: 'app-record-interview',
  animations: [mainAnimations],
  templateUrl: './record-interview.component.html',
  styleUrls: ['./record-interview.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class RecordInterviewComponent implements OnInit, OnChanges {
  @ViewChild('videoElement') videoElement: any;
  @ViewChild('previewElement') previewElement: any;

  @Input() interviews: Model.InterviewQuestion[];
  @Input() index: number;
  // Question index -> its already-recorded answer (if any), from
  // InterviewQuestionsComponent.existingAnswersByIndex. Lets navigating to
  // an already-answered question (via Change Video, the Questions tab, or
  // the question strip below) show that video already loaded in the
  // preview player, so the applicant can see what's attached and decide
  // whether it actually needs replacing instead of re-recording blind.
  @Input() existingAnswers: { [index: number]: { answerBlob: any; answerFile: any } } = {};

  @Output() next = new EventEmitter();
  @Output() submitRecord = new EventEmitter();
  // BUGFIX: lets the parent (InterviewQuestionsComponent) know whenever a
  // recording actually starts/stops, so it can block every other way of
  // switching questions -- clicking a different question in the Questions
  // tab, "Change Video" on an already-answered question, and the top-level
  // "Skip Interview" escape hatch -- none of which the parent could
  // previously see was unsafe. Only this component's own mobile question
  // strip (goToQuestion()) checked isVideoRecording; every other path went
  // straight through the parent's changeQuestion()/changeVideo()/
  // skipToSummary(), silently abandoning an in-progress take.
  @Output() recordingStateChange = new EventEmitter<boolean>();

  photoUrl: string;
  video: any;
  preview: any;
  displayControls = true;
  isVideoRecording = false;
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
  fullName: string;
  previewBlob = null;

  private req: Subscription;
  private unsubscribe$ = new Subject<void>();

  public recordedData: any;
  public interviewTab: string = 'questions';
  public time: number = 0;
  public interval;
  public display: any = '00:00';
  public timer_value: number = 0;

  constructor(public router: Router,
    private dialog: MatDialog,
    public route: ActivatedRoute,
    private coreService: CoreService,
    private recordService: RecordService,
    private ref: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private snackbarService: SnackbarService
  ) {
    this.recordService.recordingFailed().subscribe(() => {
      this.setRecording(false);
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
      // this.videoBlob = data.blob;
      this.videoBlob = URL.createObjectURL(new Blob([data.blob]));
      this.videoName = data.title;
      this.videoBlobUrl = this.sanitizer.bypassSecurityTrustUrl(data.url);
      console.log('dito muna');
      this.ref.detectChanges();
    });
  }

  ngOnInit(): void {
    this.coreService.getUserFullName().then(name => this.fullName = name);
    this.loadExistingAnswerForCurrentQuestion();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Runs whenever the applicant lands on a different question --
    // whether via Change Video, goToQuestion() (question strip / Questions
    // tab), or the normal Next/Skip flow. Recording state (isVideoRecording,
    // the live timer, etc.) intentionally is NOT reset here beyond what
    // loadExistingAnswerForCurrentQuestion() already touches -- an active
    // recording blocks navigation entirely (see goToQuestion()'s own guard),
    // so this never fires mid-recording.
    if (changes.index && !changes.index.firstChange) {
      this.loadExistingAnswerForCurrentQuestion();
    }
  }

  private loadExistingAnswerForCurrentQuestion(): void {
    const existing = this.existingAnswers && this.existingAnswers[this.index];
    this.previewBlob = existing ? existing.answerBlob : null;
    this.videoFile = existing ? existing.answerFile : null;
    this.videoBlob = null;
    this.setRecording(false);
  }

  // Single choke point for isVideoRecording changes -- keeps the parent's
  // copy of the flag (via recordingStateChange) always in sync with this
  // component's own, so every question-switching action anywhere in the
  // step can rely on it.
  private setRecording(value: boolean): void {
    this.isVideoRecording = value;
    this.recordingStateChange.emit(value);
  }

  // BUGFIX: had no guard at all -- clicking "Skip" while a take was
  // actively recording silently abandoned the recording and advanced to
  // the next question. That's the exact reported bug: this was one of the
  // ways an applicant could switch questions mid-recording.
  skipInterview() {
    if (this.isVideoRecording) {
      this.snackbarService.info('Please stop or finish your current recording before skipping.', '', 4000);
      return;
    }
    this.next.emit(this.index + 1);
  }

  // MOBILE-03: horizontal question-progress strip navigation. Lets the
  // applicant jump directly to any question from a compact tap target
  // instead of scrolling a full sidebar list; blocked mid-recording so an
  // active take can't be silently abandoned.
  goToQuestion(i: number) {
    if (this.isVideoRecording || i === this.index) {
      return;
    }
    this.next.emit(i);
  }

  startRecorder() {
    this.setRecording(true);
    this.ref.detectChanges();

    this.video = this.videoElement.nativeElement;
    this.startTimer();
    this.videoConf = { video: { deviceId: this.videoSrc, facingMode: "user", width: 320 }, audio: { deviceId: this.audioSrc } }

    this.videoConf['video'].deviceId = this.videoSrc;
    if (this.isVideoRecording) {
      this.video.controls = false;
      this.video.muted = true;
      this.video.volume = 0;
      this.recordService.startRecording(this.videoConf)
        .then(stream => {
          console.log(stream);
          // this.video.src = window.URL.createObjectURL(stream);
          this.video.srcObject = stream;
          // this.video.src = stream;
          this.video.play();
        })
        .catch(function (err) {
          console.log(err.name + ": " + err.message);
        });
    }
  }

  abortVideoRecording() {
    if (this.isVideoRecording) {
      this.setRecording(false);
      this.recordService.abortRecording();
      this.video.controls = false;
    }
  }

  // BUGFIX: uploading a file while a recording was actively in progress
  // silently overwrote it -- the recorder's own MediaRecorder stream kept
  // running in the background with no way to stop it cleanly. Require the
  // applicant to stop the current recording first.
  uploadVideo(item) {
    if (this.isVideoRecording) {
      this.snackbarService.info('Please stop your current recording before uploading a video.', '', 4000);
      item.target.value = '';
      return;
    }

    const file = item.target.files[0];
    this.recordService.blobToBase64(file)
      .then(vid => this.videoFile = vid)
      .catch(err => console.log(err));

    this.videoFile = file;
    this.previewBlob = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
    this.ref.detectChanges();

    setTimeout(() => {
      this.preview = this.previewElement.nativeElement;

      console.log(this.preview);
      // this.preview.src = this.previewBlob;
      //   console.log(this.videoBlobUrl);
      //   console.log(this.previewBlob)
      //   this.video.load();
      //   this.ref.detectChanges();

      //   this.video.controls = true;
    }, 3000);
  }

  stopRecorder() {
    if (this.isVideoRecording) {
      this.pauseTimer();
      this.recordService.stopRecording();
      this.clearVideoRecordedData();
      setTimeout(() => {
        this.previewBlob = this.videoBlobUrl;
        this.video.load();
        this.ref.detectChanges();

        this.setRecording(false);
        this.video.controls = true;
      }, 3000);
    }
  }

  submitRecording(questionId, index) {

    this.submitRecord.emit({
      answerFile: this.videoFile,
      questionId,
      index,
      answerBlob: this.previewBlob
    });

    this.setRecording(false);
    this.previewBlob = null;
    this.videoBlob = null;
    this.stopRecorderTimer();
  }

  clearVideoRecordedData() {
    // this.videoBlobUrl = null;
    this.video.src = null;
    this.video.controls = false;
    this.ref.detectChanges();
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

  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  openInterviewSettings(data?: any) {
    let dialogModal = this.dialog.open(
      SettingsModalComponent,
      {
        // OVERLAY-AUDIT FIX: bare 30vw floor computed to ~230-270px on the
        // 768-900px range -- narrow for this dialog's camera/mic device
        // <select> dropdowns, which can carry long real device names. Flat
        // 360px floor is more appropriate than a vw-scaled one here since
        // device-name length doesn't scale with viewport; 520px ceiling
        // keeps it from stretching unreasonably wide on large screens.
        minWidth: '360px',
        maxWidth: '520px',
        data: data,
      }
    );

    dialogModal
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        // BUGFIX: this subscribe was left completely empty -- the modal's
        // Save button (also fixed to actually call save() rather than
        // close(), see settings-modal.component.html) returns the chosen
        // camera/mic here, but it was never applied. startRecorder() below
        // already reads this.videoSrc/this.audioSrc as the device IDs for
        // the next recording -- they just needed to actually be set from
        // what the applicant picked in Settings, instead of staying
        // permanently undefined (silently falling back to whatever
        // device the browser defaults to).
        // NOTE: settings-modal's result.audioId is the microphone (audio
        // INPUT) device -- what startRecorder() actually needs for
        // videoConf.audio.deviceId. result.audioOut is the speaker/audio
        // OUTPUT device chosen for playback, not relevant to recording.
        if (result) {
          this.videoSrc = result.videoSrc;
          this.audioSrc = result.audioId;
        }
      });
  }

  stopRecorderTimer() {
    this.pauseTimer();
    this.timer_value = 0;
    this.display = '00:00';
    this.time = 0;
    clearInterval(this.timer_value);
  }
}

