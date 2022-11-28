import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';
import { month } from '@app-shared/mock.data';

@Component({
  selector: 'app-educational-background',
  animations: [mainAnimations],
  templateUrl: './educational-background.component.html',
  styleUrls: ['./educational-background.component.scss']
})
export class EducationalBackgroundComponent implements OnInit {
  @Input() controlIndex: number;
  @Input() bindFG: AbstractControl;
  @Output() arrayFormArray: EventEmitter<any> = new EventEmitter();
  @Output() removeArrayFormArray: EventEmitter<any> = new EventEmitter();

  public month: string[] = month;
  public year: number[] = new Array(30).fill(0).map((el, i) => 1995 + i);
  educBgForm: FormGroup;

  level$ = this.applicantFacade.level$;

  constructor(
    private fb: FormBuilder,
    private applicantFacade: ApplicantFacade,
  ) { }

  ngOnInit(): void {
    this.applicantFacade.getLevel();
    this.educBgForm = this.fb.group({
      levelOfEducation: this.bindFG.get('levelOfEducation'),
      fieldOfStudy: this.bindFG.get('fieldOfStudy'),
      school: this.bindFG.get('school'),
      startMonth: this.bindFG.get('startMonth'),
      startYear: this.bindFG.get('startYear'),
      endMonth: this.bindFG.get('endMonth'),
      endYear: this.bindFG.get('endYear'),
      schoolAddress: this.bindFG.get('schoolAddress')
    });
  }

  addEducationBackground(){
    this.arrayFormArray.emit({
      formArrayName: 'educBg', fg: this.educBgForm
    });
  }

  removeEducationBackground(index){
    this.removeArrayFormArray.emit(index);
  }
}
