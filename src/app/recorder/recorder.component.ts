import { AfterViewInit, Component, ElementRef, OnInit, Input, ViewChild, Inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RecordService } from './recorder.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import RecordRTC from "recordrtc";
import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

interface RecordedVideoOutput {
  blob: Blob;
  url: string;
  title: string;
}

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<RecorderComponent>,
    private ref: ChangeDetectorRef,
    private recordService: RecordService,
    private sanitizer: DomSanitizer,
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
    if (!this.isVideoRecording) {
      this.video.controls = false;
      this.video.muted = true;
      this.video.volume = 0;
      this.isVideoRecording = true;
      this.recordService.startRecording(this.videoConf)
        .then(stream => {
          // this.video.src = window.URL.createObjectURL(stream);
          this.video.srcObject = stream;
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

  stopVideoRecording() {
    if (this.isVideoRecording) {
      this.pauseTimer();
      this.recordService.stopRecording();
      this.video.srcObject = this.videoBlobUrl;
      this.isVideoRecording = false;
      this.video.controls = true;
    }
  }

  previewVideoRecording() {
    console.log(this.videoFile);
    console.log(this.videoBlob);
    console.log(this.videoBlobUrl);
    this.dialogRef.close({ blobUrl: this.videoBlobUrl, file: this.videoFile });
  }

  clearVideoRecordedData() {
    this.videoBlobUrl = null;
    this.video.srcObject = null;
    this.video.controls = false;
    this.ref.detectChanges();
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
  }
}
