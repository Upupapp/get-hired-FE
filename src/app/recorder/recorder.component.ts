import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { RecordService } from './recorder.service';

@Component({
  selector: 'app-recorder',
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.scss']
})
export class RecorderComponent implements OnInit, AfterViewInit {
  isRecording: boolean = false;
  audioInputDevices = [];
  videoDevices = [];
  audioOutputDevices = [];
  blob: Blob;
  url: string;

  public timer_value: number = 0;
  public time: number = 0;
  public interval;
  public display: any = '00:00';

  @ViewChild('myVideo') myVideo: any;
  @ViewChild('preview') preview: any;

  @ViewChild('record') record: any;
  @ViewChild('stopRecord') stopRecord: any;
  mediaRecorder: any;
  videoChunks: any[] = [];
  myRecording: any;
  video: any;

  types = [
    "video/webm",
    "audio/webm",
    "video/webm;codecs=vp8",
    "video/webm;codecs=daala",
    "video/webm;codecs=h264",
    "audio/webm;codecs=opus",
    "video/mpeg",
    "video/mp4"
  ];

  constructor(
    public dialogRef: MatDialogRef<RecorderComponent>,
    private sanitizer: DomSanitizer,
    private recordService: RecordService
  ) { }


  ngOnInit(): void {
    this.userMedia();
    this.isRecording = false;
  }

  ngAfterViewInit(): void {
    this.video = this.myVideo.nativeElement;
  }

  userMedia() {
    let constrainObj = {
      audio: true,
      video: {
        facingMode: "user",
        width: { min: 640, ideal: 1200, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 }
      }
    };

    if (navigator.mediaDevices === undefined) {
      console.log('Are you here?');
    } else {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          devices.map(device => {
            if(device.kind == 'audioinput') {
              this.audioInputDevices.push(device);
            } else if(device.kind == 'videoinput') {
              this.videoDevices.push(device);
            } else if(device.kind == 'audiooutput') {
              this.audioOutputDevices.push(device);
            }
          })
        }).catch(err => {
          console.log(err.name, err.message);
        })
    }

    navigator.mediaDevices.getUserMedia(constrainObj)
      .then((mediaStreamObj) => {

        if ("srcObject" in this.video) {
          this.video.srcObject = mediaStreamObj;
        }

        this.video.onloadedmetadata = () => {
          // video.play();

        };

        const options = {
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000,
          mimeType: 'video/webm;codecs=h264'
        }

        this.mediaRecorder = new MediaRecorder(mediaStreamObj);
        for (const type of this.types) {
          console.log(`Is ${type} supported? ${MediaRecorder.isTypeSupported(type) ? "Maybe!" : "Nope :("}`);
        }
        this.initiateListener();
      }).catch(err => console.log(err.name, err.message))
  }

  initiateListener() {
    this.mediaRecorder.ondataavailable = (e: any) => {
      console.log(e);
      this.videoChunks.push(e.data);
    }
  }

  recordVideo() {
    this.isRecording = true;
    this.video.play();
    this.startTimer();
    this.mediaRecorder.start();
    console.log(this.mediaRecorder.state);
  }

  stopRecording() {
    this.isRecording = false;
    this.mediaRecorder.stop();
    this.stopRecorderTimer();

    console.log(this.mediaRecorder);
    console.log(this.mediaRecorder.state);

    this.mediaRecorder.onstop = () => {
      console.log(this.videoChunks);

      this.blob = new Blob(this.videoChunks, { 'type': "video/x-matroska;codecs=avc1,opus" });
      this.recordService.videoBlobRaw = this.blob;

      // const rawBlob = window.URL.createObjectURL(this.blob);
      // this.sanitizer.bypassSecurityTrustHtml(rawBlob);
      // console.log(this.url);
      // this.videoChunks = [];
      // this.myVideo.nativeElement.src =  this.sanitizer.bypassSecurityTrustHtml(url);
      // this.preview.nativeElement.src =  this.url

    }
  }

  stopRecorderTimer(){
    this.pauseTimer();
    this.timer_value = 0;
    this.display = '00:00';
    clearInterval(this.timer_value);
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  saveRecording() {
    this.dialogRef.close(this.blob);
  }

  cancel() {
    this.dialogRef.close();
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
}
