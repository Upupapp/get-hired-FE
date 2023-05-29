import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings-modal',
  templateUrl: './settings-modal.component.html',
  styleUrls: ['./settings-modal.component.scss']
})
export class SettingsModalComponent implements OnInit {
  audioSrc: string;
  videoSrc: string;
  audioIn: string;

  constructor(
    public dialogRef: MatDialogRef<SettingsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
     console.log(data)
  }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close(null);
  }

  save(){
    this.dialogRef.close({
      audioId: this.audioIn,
      audioOut: this.audioSrc,
      videoSrc: this.videoSrc
    });
  }

}
