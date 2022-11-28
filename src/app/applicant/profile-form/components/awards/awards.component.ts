import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormGroup, FormBuilder } from '@angular/forms';
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
  @Input() bindFG: AbstractControl;
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
      certTitle: this.bindFG.get('certTitle'),
      noExpiry: this.bindFG.get('noExpiry'),
      startMonth: this.bindFG.get('startMonth'),
      startYear: this.bindFG.get('startYear'),
      endMonth: this.bindFG.get('endMonth'),
      endYear: this.bindFG.get('endYear'),
      details: this.bindFG.get('details')
    });
  }

  addAward(){
    this.arrayFormArray.emit({
      formArrayName: 'cert', fg: this.certForm
    });
  }

  removeAward(index){
    this.removeArrayFormArray.emit(index);
  }

}
