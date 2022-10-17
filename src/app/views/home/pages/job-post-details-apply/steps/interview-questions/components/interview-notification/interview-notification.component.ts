import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-interview-notification',
  templateUrl: './interview-notification.component.html',
  styleUrls: ['./interview-notification.component.scss']
})
export class InterviewNotificationComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<InterviewNotificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) { 
     console.log(data)
  }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close({
      skip: true
    });
  }

  save(){
    this.dialogRef.close({});
  }

}
