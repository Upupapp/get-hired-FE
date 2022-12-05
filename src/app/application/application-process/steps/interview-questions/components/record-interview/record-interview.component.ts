import { Component, OnInit, Input, ViewChild, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
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
export class RecordInterviewComponent implements OnInit {
  @ViewChild('videoElement') videoElement: any;

  @Input() interviews: Model.InterviewQuestion[];
  @Input() index: number;

  @Output() next = new EventEmitter();

  video: any;
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
  }

  skipInterview() {
    this.next.emit(this.index + 1);
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

  stopRecorder() {
    if (this.isVideoRecording) {
      this.pauseTimer();
      this.recordService.stopRecording();
      this.clearVideoRecordedData();
      setTimeout(() => {
        console.log(this.videoFile);
        console.log(this.videoBlob);
        console.log(this.videoBlobUrl);
        // this.video.src = this.videoFile;
        this.previewBlob = this.videoBlobUrl;
        this.video.load();
        this.ref.detectChanges();

        //   // this.isVideoRecording = false;
        this.video.controls = true;
      }, 3000);
    }
  }

  previewVideoRecording() {
    // TODO
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
    }, 150);
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
}

