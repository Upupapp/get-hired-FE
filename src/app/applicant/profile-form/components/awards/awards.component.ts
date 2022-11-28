import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { month } from '@app-shared/mock.data';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';

@Component({
  selector: 'app-awards-details',
  animations: [mainAnimations],
  templateUrl: './awards.component.html',
  styleUrls: ['./awards.component.scss']
})
export class AwardsComponent implements OnInit {
  @Input() controlIndex: number;
  @Input() data: any;
  @Output() arrayFormArray: EventEmitter<any> = new EventEmitter();
  @Output() removeArrayFormArray: EventEmitter<any> = new EventEmitter();

  certForm: FormGroup;

  public month: string[] = month;
  public year: number[] = new Array(30).fill(0).map((el, i) => 1995 + i);

  constructor(
    private fb: FormBuilder,
    private applicantFacade: ApplicantFacade,
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

  addAward(){
    this.arrayFormArray.emit({
      formArrayName: 'cert', fg: this.certForm
    });
  }

  removeAward(index){
    this.removeArrayFormArray.emit({ formArrayName: 'cert', index:index });
  }

}
