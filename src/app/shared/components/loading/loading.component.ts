import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from '@environments/environment';
import { Subscription, Subject, takeUntil, distinctUntilChanged, of } from 'rxjs';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  public unsubscribe$ = new Subject<void>();
  env = environment;

  constructor(
    public dialogRef: MatDialogRef<LoadingComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit(): void {
    if(this.data.selfClose) {
      setTimeout(() => this.dialogRef.close(), 3000);
    }

    // unsubscribe
    this.dialogRef.afterClosed()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(result => {
    });

  }

  ngOnDestroy(){
    this.dialogRef.close()
  }
}
