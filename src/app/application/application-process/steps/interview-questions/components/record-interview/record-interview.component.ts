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
    private sanitizer: DomSanitizer
  ) {
    this.recordService.recordingFailed().subscribe(() => {
      this.isVideoRecording = false;
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
    this.isVideoRecording = false;
  }

  skipInterview() {
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
    this.isVideoRecording = true;
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
      this.isVideoRecording = false;
      this.recordService.abortRecording();
      this.video.controls = false;
    }
  }

  uploadVideo(item) {
    const file = item.target.files[0];
    this.recordService.blobToBase64(file)
      .then(vid => this.videoFile = vid)
      .catch(err => console.log(err));

    this.isVideoRecording = false;
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

        this.isVideoRecording = false;
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

    this.isVideoRecording = false;
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
        minWidth: '30vw',
        data: data,
      }
    );

    dialogModal
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {
        // TODO record setting
        // audioId: this.audioIn,
        //   audioOut: this.audioSrc,
        //     videoSrc: this.videoSrc
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

