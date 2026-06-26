import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SnackbarService } from '@app-core/services/snackbar.service';

@Component({
  selector: 'app-recorder-setting',
  templateUrl: './recorder-setting.component.html',
  styleUrls: ['./recorder-setting.component.scss']
})
export class RecorderSettingComponent implements OnInit {
  @Output() chosenAudioIn = new EventEmitter();
  @Output() chosenAudioOut = new EventEmitter();
  @Output() chosenVideo = new EventEmitter();

  audioInputDevices = [];
  audioOutputDevices = [];
  videoDevices = [];

  videoSrc: string;
  audioSrc: string;
  audioOut: string;

  constructor(
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.getUserDevices();
  }

  getUserDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) {
      this.snackbarService.error(`No Available Devices to record`, '');
    } else {
      // List cameras and microphones.
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          devices.forEach((device) => {
            if (device.kind == 'audioinput') {
              this.audioInputDevices.push(device);
            } else if (device.kind == 'videoinput') {
              this.videoDevices.push(device);
            } else if (device.kind == 'audiooutput') {
              this.audioOutputDevices.push(device);
            }
          });
          this.audioSrc = this.audioInputDevices[0].deviceId;
          this.audioOut = this.audioOutputDevices[0].deviceId;
          this.videoSrc = this.videoDevices[0].deviceId;
          console.log(devices);
        })
        .catch((err) => {
          console.error(`${err.name}: ${err.message}`);
        });
    }
  }

  emitValue(event, desc) {
    switch (desc) {
      case 'audioIn':
        this.chosenAudioIn.emit(event);
        break;
      case 'audioOut':
        this.chosenAudioOut.emit(event);
        break;
      case 'videoSrc':
        this.chosenVideo.emit(event);
        break;
    }
    console.log(event);
  }
}
