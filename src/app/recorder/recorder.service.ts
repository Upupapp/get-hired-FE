import { Injectable } from '@angular/core';
import { environment } from "@environments/environment";
import { BaseService } from "@main/core/services/base.service";
import RecordRTC from 'recordRtc';
import moment from "moment";
import { Observable, Subject } from 'rxjs';

interface RecordedVideoOutput {
  blob: Blob;
  url: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  videoBlob: Blob;

  get videoBlobRaw(): Blob {
    return this.videoBlob;
  }
  set videoBlobRaw(blob: Blob) {
    this.videoBlob = blob;
  }


  private stream;
  private recorder;
  private interval;
  private startTime;
  private _basefile = new Subject<File>();
  private _stream = new Subject<MediaStream>();
  private _recorded = new Subject<RecordedVideoOutput>();
  private _recordedUrl = new Subject<string>();
  private _recordingTime = new Subject<string>();
  private _recordingFailed = new Subject<string>();


  getRecordedUrl(): Observable<string> {
    return this._recordedUrl.asObservable();
  }

  getRecordedBlob(): Observable<RecordedVideoOutput> {
    return this._recorded.asObservable();
  }

  getBase64(): Observable<any> {
    return this._basefile.asObservable();
  }

  getRecordedTime(): Observable<string> {
    return this._recordingTime.asObservable();
  }

  recordingFailed(): Observable<string> {
    return this._recordingFailed.asObservable();
  }

  getStream(): Observable<MediaStream> {
    return this._stream.asObservable();
  }

  blobToBase64 = blob => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise(resolve => {
      reader.onloadend = () => {
        resolve(reader.result);
      };
    });
  };

  startRecording(conf: any): Promise<any> {
    var browser = <any>navigator;
    if (this.recorder) {
      // It means recording is already started or it is already recording something
      return;
    }

    this._recordingTime.next('00:00');
    return new Promise((resolve, reject) => {
      browser.mediaDevices.getUserMedia(conf).then(stream => {
        this.stream = stream;
        this.record();
        resolve(this.stream);
      }).catch(error => {
        this._recordingFailed.next(null);
        reject;
      });
    });
  }

  abortRecording() {
    this.stopMedia();
  }

  private record() {
    this.recorder = new RecordRTC(this.stream, {
      type: 'video',
      mimeType: 'video/webm; codecs=vp8,opus',
      bitsPerSecond: 44000
    });
    this.recorder.startRecording();
    this.startTime = moment();
    this.interval = setInterval(
      () => {
        const currentTime = moment();
        const diffTime = moment.duration(currentTime.diff(this.startTime));
        const time = this.toString(diffTime.minutes()) + ':' + this.toString(diffTime.seconds());
        this._recordingTime.next(time);
        this._stream.next(this.stream);
      },
      500
    );
  }

  private toString(value) {
    let val = value;
    if (!value) {
      val = '00';
    }
    if (value < 10) {
      val = '0' + value;
    }
    return val;
  }

  stopRecording() {
    if (this.recorder) {
      this.recorder.stopRecording(this.processVideo.bind(this));
      // this.processVideo.bind(this.recorder)
      //this.processVideo(this.recorder);
      //this.stopMedia();
    }
  }

  private async processVideo(audioVideoWebMURL) {
    // console.log(audioVideoWebMURL);
    const recordedBlob = this.recorder.getBlob();
    this.recorder.getDataURL(function (dataURL) { });
    const recordedName = encodeURIComponent('video_' + new Date().getTime() + '.webm');
    this._recorded.next({ blob: recordedBlob, url: audioVideoWebMURL, title: recordedName });
    this.blobToBase64(recordedBlob).then((res: File) => {
      this._basefile.next(res)
    });
    this.stopMedia();
    //this.recorder.save(recordedName);
  }

  private stopMedia() {
    if (this.recorder) {
      this.recorder = null;
      clearInterval(this.interval);
      this.startTime = null;
      if (this.stream) {
        this.stream.getAudioTracks().forEach(track => track.stop());
        this.stream.getVideoTracks().forEach(track => track.stop());
        this.stream.stop();
        this.stream = null;
      }
    }
  }
}
