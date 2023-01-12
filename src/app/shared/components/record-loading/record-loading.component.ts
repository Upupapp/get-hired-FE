import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-record-loading',
  templateUrl: './record-loading.component.html',
  styleUrls: ['./record-loading.component.scss']
})
export class RecordLoadingComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<RecordLoadingComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit(): void {
    if(this.data.selfClose) {
      setTimeout(() => this.dialogRef.close(), 5000);
    }

  }

  ngOnDestroy(){
    this.dialogRef.close()
  }
}
