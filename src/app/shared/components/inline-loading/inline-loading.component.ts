import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-inline-loading',
  templateUrl: './inline-loading.component.html',
  styleUrls: ['./inline-loading.component.scss']
})
export class InlineLoadingComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<InlineLoadingComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit(): void {
    if(this.data.selfClose) {
      setTimeout(() => {
        console.log('closing na');
        this.dialogRef.close(), 3000
      });
    }

  }

}
