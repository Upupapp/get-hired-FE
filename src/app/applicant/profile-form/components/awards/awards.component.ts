import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { month } from '@app-shared/mock.data';

@Component({
  selector: 'app-awards-details',
  animations: [mainAnimations],
  templateUrl: './awards.component.html',
  styleUrls: ['./awards.component.scss']
})
export class AwardsComponent implements OnInit {

  certForm: FormGroup;

  public month: string[] = month;
  public year: number[] = new Array(30).fill(0).map((el, i) => 1995 + i);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AwardsComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit(): void {
    this.certForm = this.fb.group({
      certTitle: new FormControl(this.data?.certTitle, Validators.required),
      noExpiry: new FormControl(this.data?.noExpiry),
      startMonth: new FormControl(this.data?.startMonth),
      startYear: new FormControl(this.data?.startYear),
      endMonth: new FormControl(this.data?.endMonth),
      endYear: new FormControl(this.data?.endYear),
      details: new FormControl(this.data?.details),
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  addAward(){
    // this.arrayFormArray.emit({
    //   formArrayName: 'cert', fg: this.certForm
    // });
  }

  // removeAward(index){
  //   this.removeArrayFormArray.emit({ formArrayName: 'cert', index:index });
  // }

}
